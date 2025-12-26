import React, { useState, useEffect, useMemo, useRef } from 'react';
import Map, { 
  Source, 
  Layer, 
  Popup, 
  NavigationControl
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLiveListings } from '../hooks/useLiveListings';
import { useAuth } from '../hooks/useAuth'; // 🆕
import { AnimatePresence, motion } from 'framer-motion';
import ListingCard from './ListingCard';
import AuthModal from './AuthModal'; // 🆕
import type { FeatureCollection } from 'geojson';

// --- STYLES (Identical to before) ---
const clusterLayer: any = {
  id: 'clusters',
  type: 'circle',
  source: 'listings',
  filter: ['has', 'point_count'],
  paint: {
    'circle-color': ['step', ['get', 'point_count'], '#51bb7b', 10, '#f1f075', 30, '#f28cb1'],
    'circle-radius': ['step', ['get', 'point_count'], 20, 100, 30, 750, 40]
  }
};
const clusterCountLayer: any = {
  id: 'cluster-count',
  type: 'symbol',
  source: 'listings',
  filter: ['has', 'point_count'],
  layout: {
    'text-field': '{point_count_abbreviated}',
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12
  }
};
const unclusteredPointLayer: any = {
  id: 'unclustered-point',
  type: 'circle',
  source: 'listings',
  filter: ['!', ['has', 'point_count']],
  paint: {
    'circle-color': '#10b981', 
    'circle-radius': 8,
    'circle-stroke-width': 2,
    'circle-stroke-color': '#ffffff'
  }
};
const priceLabelLayer: any = {
  id: 'price-label',
  type: 'symbol',
  source: 'listings',
  filter: ['!', ['has', 'point_count']],
  layout: {
    'text-field': ['concat', '₵', ['to-string', ['get', 'price_formatted']]], 
    'text-font': ['DIN Offc Pro Medium', 'Arial Unicode MS Bold'],
    'text-size': 12,
    'text-offset': [0, 1.5], 
    'text-anchor': 'top',
    'text-allow-overlap': false 
  },
  paint: {
    'text-color': '#ffffff',
    'text-halo-color': '#000000',
    'text-halo-width': 1
  }
};

// --- TYPES ---
interface Property {
  id: number;
  title: string;
  price: number;
  lat: number;
  long: number;
  location_name: string;
  vibe_features: string;
  type: 'sale' | 'rent';
  image_url?: string; 
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;

export default function AstaMap() {
  const { listings, newAlert } = useLiveListings();
  const { user, signOut } = useAuth(); // 🆕
  const [isAuthModalOpen, setAuthModalOpen] = useState(false); // 🆕
  const [selectedListing, setSelectedListing] = useState<Property | null>(null);
  
  const mapRef = useRef<any>(null);

  const geojsonData: FeatureCollection = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: listings.map(l => ({
        type: 'Feature',
        properties: { ...l, price_formatted: (l.price / 1000).toFixed(0) + 'k' },
        geometry: { type: 'Point', coordinates: [l.long, l.lat] }
      }))
    };
  }, [listings]);

  useEffect(() => {
    if (listings.length > 0 && mapRef.current) {
      const longs = listings.map(l => l.long);
      const lats = listings.map(l => l.lat);
      try {
        mapRef.current.fitBounds(
          [[Math.min(...longs) - 0.05, Math.min(...lats) - 0.05], [Math.max(...longs) + 0.05, Math.max(...lats) + 0.05]],
          { padding: 40, duration: 2000 }
        );
      } catch (err) { }
    }
  }, [listings.length]);

  const onClickMap = (event: any) => {
    const feature = event.features?.[0];
    if (!feature) return;
    const clusterId = feature.properties.cluster_id;
    if (clusterId) {
      const mapboxSource = mapRef.current?.getSource('listings');
      mapboxSource.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
        if (err) return;
        mapRef.current?.flyTo({ center: feature.geometry.coordinates, zoom: zoom ? zoom + 1 : 14, duration: 1000 });
      });
      return;
    }
    const propId = feature.properties.id;
    const property = listings.find(l => l.id === propId);
    if (property) {
      setSelectedListing(property);
      mapRef.current?.flyTo({ center: [property.long, property.lat], zoom: 15, duration: 1000 });
    }
  };

  const onSidebarSelect = (property: Property) => {
    setSelectedListing(property);
    mapRef.current?.flyTo({ center: [property.long, property.lat], zoom: 16, duration: 1500 });
  };

  return (
    <div className="flex h-screen w-full bg-asta-deep font-sans overflow-hidden">
      
      {/* 🟢 LEFT PANEL */}
      <div className="w-[400px] flex flex-col border-r border-white/10 z-20 bg-asta-deep shadow-2xl">
        <div className="p-6 border-b border-white/10 bg-asta-deep/95 backdrop-blur flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
              <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
              ASTA <span className="text-asta-platinum font-light">LIVE</span>
            </h1>
            <p className="text-xs text-gray-500 mt-1 font-mono">
              {listings.length} PROPERTIES
            </p>
          </div>
          
          {/* 🆕 AUTH BUTTON */}
          {user ? (
             <div className="flex flex-col items-end">
                <span className="text-xs text-emerald-400 font-bold">Logged In</span>
                <button onClick={signOut} className="text-xs text-gray-500 hover:text-white underline">Sign Out</button>
             </div>
          ) : (
            <button 
              onClick={() => setAuthModalOpen(true)}
              className="bg-white/10 hover:bg-white/20 text-white text-xs font-bold px-3 py-2 rounded-lg transition-all"
            >
              Sign In
            </button>
          )}
        </div>

        <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
          <AnimatePresence>
            {listings.map((property) => (
              <ListingCard 
                key={property.id} 
                property={property as any} 
                isSelected={selectedListing?.id === property.id}
                onClick={() => onSidebarSelect(property as any)}
              />
            ))}
          </AnimatePresence>
        </div>
      </div>

      {/* 🗺️ RIGHT PANEL */}
      <div className="flex-1 relative">
        <Map
          ref={mapRef}
          initialViewState={{ longitude: -0.1870, latitude: 5.6037, zoom: 11 }}
          style={{ width: '100%', height: '100%' }}
          mapStyle="mapbox://styles/mapbox/dark-v11" 
          mapboxAccessToken={MAPBOX_TOKEN}
          interactiveLayerIds={['clusters', 'unclustered-point']}
          onClick={onClickMap}
        >
          <Source id="listings" type="geojson" data={geojsonData} cluster={true} clusterMaxZoom={14} clusterRadius={50}>
            <Layer {...clusterLayer} />
            <Layer {...clusterCountLayer} />
            <Layer {...unclusteredPointLayer} />
            <Layer {...priceLabelLayer} />
          </Source>
          <NavigationControl position="bottom-right" />
          {selectedListing && (
            <Popup longitude={selectedListing.long} latitude={selectedListing.lat} anchor="top" onClose={() => setSelectedListing(null)} closeButton={false} className="z-50 text-black" maxWidth="300px" offset={15}>
              <div className="bg-asta-deep text-white rounded-lg overflow-hidden w-64 border border-asta-platinum/20">
                <div className="h-32 bg-gray-800 relative">
                  <img src={selectedListing.image_url || "https://via.placeholder.com/400x300?text=Asta"} className="w-full h-full object-cover" />
                  <div className="absolute top-2 right-2 bg-black/60 px-2 py-1 rounded text-[10px] uppercase font-bold">{selectedListing.type}</div>
                </div>
                <div className="p-3">
                  <h3 className="font-bold text-md truncate">{selectedListing.title}</h3>
                  <p className="text-asta-platinum text-xs mb-2">{selectedListing.location_name}</p>
                  <span className="text-xl font-bold">₵{selectedListing.price?.toLocaleString()}</span>
                </div>
              </div>
            </Popup>
          )}
        </Map>
        <AnimatePresence>
          {newAlert && (
            <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }} className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black px-6 py-2 rounded-full shadow-2xl font-bold flex items-center gap-2">
              <span>🔔 New Listing in {newAlert.location_name}</span>
            </motion.div>
          )}
        </AnimatePresence>
        
        {/* 🆕 AUTH MODAL */}
        <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
      </div>
    </div>
  );
}
