import React, { useState, useEffect, useMemo, useRef } from 'react';
import Map, { 
  Source, 
  Layer, 
  NavigationControl
} from 'react-map-gl';
import 'mapbox-gl/dist/mapbox-gl.css';
import { useLiveListings } from '../hooks/useLiveListings';
import { useAuth } from '../hooks/useAuth';
import { AnimatePresence, motion } from 'framer-motion';
import ListingCard from './ListingCard';
import AuthModal from './AuthModal';
import PropertyInspector from './PropertyInspector';
import type { FeatureCollection } from 'geojson';

// --- STYLES (Unchanged) ---
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
const ENGINE_URL = "http://127.0.0.1:8000"; 

export default function AstaMap() {
  const { listings, newAlert } = useLiveListings();
  const { user, signOut } = useAuth();
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Property | null>(null);
  
  // UX States
  const [isSidebarHovered, setIsSidebarHovered] = useState(true); // Default open so they know it exists
  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'rent' | 'sale'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  
  const mapRef = useRef<any>(null);

  useEffect(() => {
    fetch(`${ENGINE_URL}/api/trends`)
      .then(res => res.json())
      .then(data => {
        if (data.trending_tags) setTrendingTags(data.trending_tags);
      })
      .catch(err => console.error("Engine Offline:", err));
  }, []);

  const filteredListings = useMemo(() => {
    return listings.filter(l => {
      const matchesType = filterType === 'all' || l.type === filterType;
      const query = searchQuery.toLowerCase();
      const matchesSearch = 
        l.title?.toLowerCase().includes(query) || 
        l.location_name?.toLowerCase().includes(query) ||
        l.vibe_features?.toLowerCase().includes(query);
      return matchesType && matchesSearch;
    });
  }, [listings, filterType, searchQuery]);

  const geojsonData: FeatureCollection = useMemo(() => {
    return {
      type: 'FeatureCollection',
      features: filteredListings.map(l => ({
        type: 'Feature',
        properties: { ...l, price_formatted: (l.price / 1000).toFixed(0) + 'k' },
        geometry: { type: 'Point', coordinates: [l.long, l.lat] }
      }))
    };
  }, [filteredListings]);

  // Handle Map Clicks (Close Inspector if clicking background)
  const onClickMap = (event: any) => {
    const feature = event.features?.[0];
    
    // If clicking empty map -> Close Inspector
    if (!feature) {
      if (selectedListing) setSelectedListing(null);
      return;
    }

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
      mapRef.current?.flyTo({ center: [property.long, property.lat], zoom: 16, duration: 1500 });
    }
  };

  const onSidebarSelect = (property: Property) => {
    setSelectedListing(property);
    mapRef.current?.flyTo({ center: [property.long, property.lat], zoom: 16, duration: 1500 });
  };

  return (
    <div className="relative h-screen w-full bg-asta-deep font-sans overflow-hidden">
      
      {/* 🗺️ MAP (Now Full Screen Background) */}
      <div className="absolute inset-0 z-0">
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
        </Map>
      </div>

      {/* 👻 GHOST DASHBOARD (Left) */}
      <motion.div 
        onHoverStart={() => setIsSidebarHovered(true)}
        onHoverEnd={() => setIsSidebarHovered(false)}
        animate={{ 
          x: isSidebarHovered ? 0 : -360,
          opacity: isSidebarHovered ? 1 : 0.8 
        }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="absolute left-0 top-0 bottom-0 w-[400px] z-20 flex"
      >
        {/* The Actual Dashboard Content */}
        <div className="flex-1 flex flex-col bg-asta-deep/90 backdrop-blur-md border-r border-white/10 shadow-2xl h-full">
          
          {/* Header & Filters */}
          <div className="p-4 border-b border-white/10">
            <div className="flex justify-between items-center mb-4">
              <div>
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                  ASTA <span className="text-asta-platinum font-light">LIVE</span>
                </h1>
                <p className="text-xs text-gray-500 mt-1 font-mono">
                  {filteredListings.length} Active
                </p>
              </div>
              {user ? (
                 <button onClick={signOut} className="text-[10px] text-gray-600 hover:text-white uppercase font-bold tracking-widest">Logout</button>
              ) : (
                <button onClick={() => setAuthModalOpen(true)} className="text-[10px] text-emerald-500/50 hover:text-emerald-400 uppercase font-bold tracking-widest">Login</button>
              )}
            </div>

            {/* Search */}
            <div className="relative mb-3">
              <input 
                type="text" 
                placeholder="Search location..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
              />
            </div>

            {/* 🆕 WRAPPING TAGS */}
            <div className="flex flex-wrap gap-2 mb-3 max-h-24 overflow-y-auto scrollbar-hide">
              {trendingTags.map((tag, i) => (
                <button 
                  key={i}
                  onClick={() => setSearchQuery(tag)}
                  className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-asta-platinum hover:bg-emerald-500/20 hover:border-emerald-500/50 transition-all"
                >
                  #{tag}
                </button>
              ))}
            </div>

            {/* TABS */}
            <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
               {['all', 'sale', 'rent'].map((type) => (
                 <button
                   key={type}
                   onClick={() => setFilterType(type as any)}
                   className={`
                     flex-1 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all
                     ${filterType === type 
                       ? 'bg-emerald-500 text-black shadow-lg shadow-emerald-500/20' 
                       : 'text-gray-400 hover:bg-white/5 hover:text-white'}
                   `}
                 >
                   {type}
                 </button>
               ))}
            </div>
          </div>

          {/* Feed */}
          <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
            <AnimatePresence>
              {filteredListings.map((property) => (
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

        {/* The "Handle" (Visible when collapsed) */}
        <div className="w-10 h-full flex items-center justify-center cursor-pointer group">
           <div className="w-1 h-12 bg-white/20 rounded-full group-hover:bg-emerald-500 transition-all" />
        </div>
      </motion.div>

      {/* 🕵️ RIGHT INSPECTOR */}
      <AnimatePresence>
        {selectedListing && (
          <PropertyInspector 
            property={selectedListing} 
            onClose={() => setSelectedListing(null)} 
          />
        )}
      </AnimatePresence>
      
      {/* Notifications & Modals */}
      <AnimatePresence>
        {newAlert && (
          <motion.div initial={{ y: -100, opacity: 0 }} animate={{ y: 20, opacity: 1 }} exit={{ y: -100, opacity: 0 }} className="absolute top-4 left-1/2 -translate-x-1/2 z-50 bg-emerald-500 text-black px-6 py-2 rounded-full shadow-2xl font-bold flex items-center gap-2">
            <span>🔔 New Listing in {newAlert.location_name}</span>
          </motion.div>
        )}
      </AnimatePresence>
      <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
    </div>
  );
}
