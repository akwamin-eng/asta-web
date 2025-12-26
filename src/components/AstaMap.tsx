import React, { useState, useEffect, useMemo, useRef, useCallback } from 'react';
import Map, { Source, Layer, NavigationControl, FullscreenControl, useControl } from 'react-map-gl';
import MapboxDraw from '@mapbox/mapbox-gl-draw';
import '@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css';
import * as turf from '@turf/turf';
import 'mapbox-gl/dist/mapbox-gl.css';
import { Sun, Moon, Layers, RotateCcw } from 'lucide-react';
import { useLiveListings } from '../hooks/useLiveListings';
import { useAuth } from '../hooks/useAuth';
import { AnimatePresence, motion } from 'framer-motion';
import ListingCard from './ListingCard';
import AuthModal from './AuthModal';
import PropertyInspector from './PropertyInspector';
import type { FeatureCollection } from 'geojson';

// --- STYLES (Heatmap, Clusters, etc. same as before) ---
const heatmapLayer: any = {
  id: 'heatmap',
  type: 'heatmap',
  source: 'listings',
  maxzoom: 15,
  paint: {
    'heatmap-weight': ['interpolate', ['linear'], ['get', 'price'], 0, 0, 500000, 1],
    'heatmap-intensity': ['interpolate', ['linear'], ['zoom'], 0, 1, 9, 3],
    'heatmap-color': [
      'interpolate', ['linear'], ['heatmap-density'],
      0, 'rgba(33,102,172,0)', 0.2, 'rgb(103,169,207)', 0.4, 'rgb(209,229,240)',
      0.6, 'rgb(253,219,199)', 0.8, 'rgb(239,138,98)', 1, 'rgb(178,24,43)'
    ],
    'heatmap-radius': ['interpolate', ['linear'], ['zoom'], 0, 2, 9, 20],
    'heatmap-opacity': ['interpolate', ['linear'], ['zoom'], 14, 1, 15, 0],
  }
};
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
    'circle-color': '#10b981', 'circle-radius': 8, 'circle-stroke-width': 2, 'circle-stroke-color': '#ffffff'
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
    'text-offset': [0, 1.5], 'text-anchor': 'top', 'text-allow-overlap': false 
  },
  paint: {
    'text-color': '#ffffff', 'text-halo-color': '#000000', 'text-halo-width': 1
  }
};

function DrawControl(props: any) {
  useControl(
    () => new MapboxDraw(props),
    ({ map }) => {
      map.on('draw.create', props.onUpdate);
      map.on('draw.update', props.onUpdate);
      map.on('draw.delete', props.onDelete);
    },
    ({ map }) => {
      map.off('draw.create', props.onUpdate);
      map.off('draw.update', props.onUpdate);
      map.off('draw.delete', props.onDelete);
    }
  );
  return null;
}

interface Property {
  id: number;
  title: string;
  price: number;
  lat: number;
  long: number;
  location_name: string;
  vibe_features: string;
  description?: string;
  type: 'sale' | 'rent';
  image_url?: string; 
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const ENGINE_URL = "http://127.0.0.1:8000"; 
const INITIAL_VIEW_STATE = { longitude: -0.1870, latitude: 5.6037, zoom: 11 };

export default function AstaMap() {
  const { listings } = useLiveListings();
  const { user } = useAuth();
  
  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Property | null>(null);
  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  
  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<'all' | 'rent' | 'sale'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [drawPolygon, setDrawPolygon] = useState<any>(null);
  const [mapStyle, setMapStyle] = useState('mapbox://styles/mapbox/dark-v11');
  const [showHeatmap, setShowHeatmap] = useState(false);

  const mapRef = useRef<any>(null);

  useEffect(() => {
    fetch(`${ENGINE_URL}/api/trends`)
      .then(res => res.json())
      .then(data => { if (data.trending_tags) setTrendingTags(data.trending_tags); })
      .catch(err => console.error("Engine Offline"));
  }, []);

  const handleReset = () => {
    setSearchQuery('');
    setFilterType('all');
    setDrawPolygon(null);
    setSelectedListing(null);
    setShowHeatmap(false);
    mapRef.current?.flyTo({ center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude], zoom: INITIAL_VIEW_STATE.zoom, duration: 1500 });
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
       // 🇬🇭 GHANA POST GPS DETECTION
       const ghanaPostRegex = /^[A-Z]{2}-\d{3,4}-\d{3,4}$/i; // e.g., GA-183-8199
       
       if (ghanaPostRegex.test(searchQuery.trim())) {
           // Simulate finding a location (In real app, call GhanaPost API here)
           alert(`🇬🇭 Ghana Post GPS Detected: ${searchQuery.toUpperCase()}\n\n(Integration Pending: Simulating location find...)`);
           mapRef.current?.flyTo({ center: [-0.1870, 5.6037], zoom: 16, duration: 2000 });
           return;
       }

       const match = filteredListings[0];
       if (match) {
         mapRef.current?.flyTo({ center: [match.long, match.lat], zoom: 14, duration: 2000 });
       }
    }
  };

  const filteredListings = useMemo(() => {
    return listings.filter(l => {
      const matchesType = filterType === 'all' || l.type === filterType;
      const query = searchQuery.toLowerCase();
      const textToSearch = `${l.title} ${l.location_name} ${l.vibe_features} ${l.description || ''}`.toLowerCase();
      const matchesSearch = textToSearch.includes(query);

      let matchesGeo = true;
      if (drawPolygon) {
        const pt = turf.point([l.long, l.lat]);
        matchesGeo = turf.booleanPointInPolygon(pt, drawPolygon);
      }
      return matchesType && matchesSearch && matchesGeo;
    });
  }, [listings, filterType, searchQuery, drawPolygon]);

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

  const onClickMap = (event: any) => {
    const feature = event.features?.[0];
    if (!feature) {
      if (selectedListing) setSelectedListing(null);
      return;
    }
    if (feature.layer.id === 'clusters') {
      const clusterId = feature.properties.cluster_id;
      const mapboxSource = mapRef.current?.getSource('listings');
      mapboxSource.getClusterExpansionZoom(clusterId, (err: any, zoom: number) => {
        if (err) return;
        mapRef.current?.flyTo({ center: feature.geometry.coordinates, zoom: zoom ? zoom + 1 : 14, duration: 1000 });
      });
      return;
    }
    if (feature.layer.id === 'unclustered-point' || feature.layer.id === 'price-label') {
        const propId = feature.properties.id;
        const property = listings.find(l => l.id === propId);
        if (property) setSelectedListing(property);
    }
  };

  const onDrawUpdate = useCallback((e: any) => { setDrawPolygon(e.features[0]); }, []);
  const onDrawDelete = useCallback(() => { setDrawPolygon(null); }, []);

  return (
    <div className="relative h-screen w-full bg-asta-deep font-sans overflow-hidden">
      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW_STATE}
        style={{ width: '100%', height: '100%' }}
        mapStyle={mapStyle} 
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={['clusters', 'unclustered-point', 'price-label']}
        onClick={onClickMap}
      >
        <Source id="listings" type="geojson" data={geojsonData} cluster={true} clusterMaxZoom={14} clusterRadius={50}>
            {showHeatmap && <Layer {...heatmapLayer} />}
            {!showHeatmap && <Layer {...clusterLayer} />}
            {!showHeatmap && <Layer {...clusterCountLayer} />}
            <Layer {...unclusteredPointLayer} />
            <Layer {...priceLabelLayer} />
        </Source>
        <NavigationControl position="bottom-right" />
        <FullscreenControl position="bottom-right" />
        <DrawControl 
          position="top-right"
          displayControlsDefault={false}
          controls={{ polygon: true, trash: true }}
          defaultMode="simple_select"
          onUpdate={onDrawUpdate}
          onDelete={onDrawDelete}
        />

        {/* CUSTOM MAP CONTROLS */}
        <div className="absolute bottom-32 right-[10px] flex flex-col gap-2 z-10">
            <button onClick={handleReset} className="w-[29px] h-[29px] bg-white rounded-md shadow flex items-center justify-center hover:bg-red-50 text-red-600 border border-gray-300 transition-colors" title="Reset">
                <RotateCcw size={16} />
            </button>
            <button onClick={() => setMapStyle(s => s.includes('dark') ? 'mapbox://styles/mapbox/streets-v12' : 'mapbox://styles/mapbox/dark-v11')} className="w-[29px] h-[29px] bg-white rounded-md shadow flex items-center justify-center hover:bg-gray-100 text-black border border-gray-300" title="Theme">
                {mapStyle.includes('dark') ? <Sun size={16} /> : <Moon size={16} />}
            </button>
            <button onClick={() => setShowHeatmap(!showHeatmap)} className={`w-[29px] h-[29px] rounded-md shadow flex items-center justify-center transition-all border ${showHeatmap ? 'bg-emerald-500 text-white border-emerald-600' : 'bg-white text-black border-gray-300 hover:bg-gray-100'}`} title="Heatmap">
                <Layers size={16} />
            </button>
        </div>

        {/* DASHBOARD */}
        <motion.div 
          onHoverStart={() => setIsSidebarHovered(true)}
          onHoverEnd={() => setIsSidebarHovered(false)}
          animate={{ x: isSidebarHovered ? 0 : -360, opacity: isSidebarHovered ? 1 : 0.8 }}
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className="absolute left-0 top-0 bottom-0 w-[400px] z-20 flex pointer-events-auto"
        >
          <div className="flex-1 flex flex-col bg-asta-deep/90 backdrop-blur-md border-r border-white/10 shadow-2xl h-full">
            <div className="p-4 border-b border-white/10">
              
              {/* 🆕 LOGO HEADER */}
              <div className="flex items-center gap-3 mb-4">
                <img src="/logo.png" alt="Asta" className="w-8 h-8 object-contain" onError={(e:any) => e.target.style.display='none'} />
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                  ASTA <span className="text-asta-platinum font-light">LIVE</span>
                </h1>
              </div>

              <div className="relative mb-3">
                <input 
                  type="text" 
                  placeholder="Search GPS (GA-183-8199) or feature..." 
                  value={searchQuery}
                  onKeyDown={handleSearch} 
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full bg-black/40 border border-white/10 rounded-lg py-2 px-3 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                />
              </div>
              <div className="flex flex-wrap gap-2 mb-3 max-h-24 overflow-y-auto scrollbar-hide">
                {trendingTags.map((tag, i) => (
                  <button key={i} onClick={() => setSearchQuery(tag)} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-asta-platinum hover:bg-emerald-500/20 transition-all">
                    #{tag}
                  </button>
                ))}
              </div>
              <div className="flex gap-1 p-1 bg-white/5 rounded-lg">
                 {['all', 'sale', 'rent'].map((type) => (
                   <button key={type} onClick={() => setFilterType(type as any)} className={`flex-1 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all ${filterType === type ? 'bg-emerald-500 text-black' : 'text-gray-400 hover:bg-white/5'}`}>{type}</button>
                 ))}
              </div>
            </div>
            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
              <AnimatePresence>
                {filteredListings.map((property) => (
                  <ListingCard key={property.id} property={property as any} isSelected={selectedListing?.id === property.id} onClick={() => setSelectedListing(property)} />
                ))}
              </AnimatePresence>
            </div>
          </div>
          <div className="w-10 h-full flex items-center justify-center cursor-pointer group">
             <div className="w-1 h-12 bg-white/20 rounded-full group-hover:bg-emerald-500 transition-all" />
          </div>
        </motion.div>

        <AnimatePresence>
          {selectedListing && (
            <div className="absolute top-0 right-0 h-full z-30 pointer-events-auto">
               <PropertyInspector property={selectedListing} onClose={() => setSelectedListing(null)} />
            </div>
          )}
        </AnimatePresence>
        
        <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none z-10">
          <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase shadow-black drop-shadow-md">
            Made with <span className="text-red-500">♥</span> for Ghana
          </p>
        </div>

        <AuthModal isOpen={isAuthModalOpen} onClose={() => setAuthModalOpen(false)} />
      </Map>
    </div>
  );
}
