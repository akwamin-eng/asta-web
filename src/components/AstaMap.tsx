import React, {
  useState,
  useEffect,
  useMemo,
  useRef,
  useCallback,
} from "react";
import Map, {
  Source,
  Layer,
  NavigationControl,
  FullscreenControl,
  useControl,
  Marker,
} from "react-map-gl";
import MapboxDraw from "@mapbox/mapbox-gl-draw";
import "@mapbox/mapbox-gl-draw/dist/mapbox-gl-draw.css";
import * as turf from "@turf/turf";
import "mapbox-gl/dist/mapbox-gl.css";
import { useSearchParams } from "react-router-dom"; // IMPORT FIX: Router Hook
import {
  Sun,
  Moon,
  Layers,
  RotateCcw,
  MapPin,
  Hash,
  Search,
  Loader2,
  Brain,
  X,
  Bug,
  Send,
  LogIn,
  LayoutDashboard,
  Plus,
  Check,
  BellRing,
  Crosshair, 
  Shield, 
} from "lucide-react";
import { useLiveListings } from "../hooks/useLiveListings";
import { useAuth } from "../hooks/useAuth";
import { useGooglePlaces } from "../hooks/useGooglePlaces";
import { useGoogleAutocomplete } from "../hooks/useGoogleAutocomplete"; 
import { useGeolocation } from "../hooks/useGeolocation";
import { AnimatePresence, motion } from "framer-motion";
import ListingCard from "./ListingCard";
import AuthModal from "./AuthModal";
import PropertyInspector from "./PropertyInspector";
import UnifiedCommandCenter from "./dossier/UnifiedCommandCenter";
import FieldReportModal from "./dossier/FieldReportModal";
import SubmitIntelModal from "./dossier/SubmitIntelModal";
import type { FeatureCollection } from "geojson";

// --- STYLES ---
const boundaryLayer: any = {
  id: "search-boundary",
  type: "line",
  source: "search-boundary",
  paint: {
    "line-color": "#FACC15",
    "line-width": 2,
    "line-dasharray": [2, 2],
    "line-opacity": 0.8,
  },
};
const boundaryFillLayer: any = {
  id: "search-boundary-fill",
  type: "fill",
  source: "search-boundary",
  paint: { "fill-color": "#FACC15", "fill-opacity": 0.1 },
};
const heatmapLayer: any = {
  id: "heatmap",
  type: "heatmap",
  source: "listings",
  maxzoom: 15,
  paint: {
    "heatmap-weight": [
      "interpolate",
      ["linear"],
      ["get", "price"],
      0,
      0,
      500000,
      1,
    ],
    "heatmap-intensity": ["interpolate", ["linear"], ["zoom"], 0, 1, 9, 3],
    "heatmap-color": [
      "interpolate",
      ["linear"],
      ["heatmap-density"],
      0,
      "rgba(33,102,172,0)",
      0.2,
      "rgb(103,169,207)",
      0.4,
      "rgb(209,229,240)",
      0.6,
      "rgb(253,219,199)",
      0.8,
      "rgb(239,138,98)",
      1,
      "rgb(178,24,43)",
    ],
    "heatmap-radius": ["interpolate", ["linear"], ["zoom"], 0, 2, 9, 20],
    "heatmap-opacity": ["interpolate", ["linear"], ["zoom"], 14, 1, 15, 0],
  },
};
const clusterLayer: any = {
  id: "clusters",
  type: "circle",
  source: "listings",
  filter: ["has", "point_count"],
  paint: {
    "circle-color": [
      "step",
      ["get", "point_count"],
      "#51bb7b",
      10,
      "#f1f075",
      30,
      "#f28cb1",
    ],
    "circle-radius": ["step", ["get", "point_count"], 20, 100, 30, 750, 40],
  },
};
const clusterCountLayer: any = {
  id: "cluster-count",
  type: "symbol",
  source: "listings",
  filter: ["has", "point_count"],
  layout: {
    "text-field": "{point_count_abbreviated}",
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    "text-size": 12,
  },
};
const unclusteredPointLayer: any = {
  id: "unclustered-point",
  type: "circle",
  source: "listings",
  filter: ["!", ["has", "point_count"]],
  paint: {
    "circle-color": "#10b981",
    "circle-radius": 8,
    "circle-stroke-width": 2,
    "circle-stroke-color": "#ffffff",
  },
};
const priceLabelLayer: any = {
  id: "price-label",
  type: "symbol",
  source: "listings",
  filter: ["!", ["has", "point_count"]],
  layout: {
    "text-field": ["concat", "₵", ["to-string", ["get", "price_formatted"]]],
    "text-font": ["DIN Offc Pro Medium", "Arial Unicode MS Bold"],
    "text-size": 12,
    "text-offset": [0, 1.5],
    "text-anchor": "top",
    "text-allow-overlap": false,
  },
  paint: {
    "text-color": "#ffffff",
    "text-halo-color": "#000000",
    "text-halo-width": 1,
  },
};

function DrawControl(props: any) {
  useControl(
    () => new MapboxDraw(props),
    ({ map }) => {
      map.on("draw.create", props.onUpdate);
      map.on("draw.update", props.onUpdate);
      map.on("draw.delete", props.onDelete);
    },
    ({ map }) => {
      map.off("draw.create", props.onUpdate);
      map.off("draw.update", props.onUpdate);
      map.off("draw.delete", props.onDelete);
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
  type: "sale" | "rent";
  image_url?: string;
  location_accuracy?: string; 
}
interface Suggestion {
  type: "location" | "feature";
  value: string;
  placeId?: string; 
}

const MAPBOX_TOKEN = import.meta.env.VITE_MAPBOX_TOKEN;
const ENGINE_URL = "http://127.0.0.1:8000";
const INITIAL_VIEW_STATE = { longitude: -0.187, latitude: 5.6037, zoom: 11 };

export default function AstaMap() {
  const { listings } = useLiveListings();
  const { user } = useAuth();
  const {
    reverseGeocode,
    searchPlace,
    getPlaceDetails, 
    loading: googleLoading,
  } = useGooglePlaces();
  const {
    location: gpsLocation,
    getCurrentLocation,
    loading: gpsLoading,
  } = useGeolocation();

  const { 
    predictions: googlePredictions, 
    getPredictions: fetchGooglePredictions,
    loading: autocompleteLoading 
  } = useGoogleAutocomplete();

  // --- ROUTING STATE ---
  const [searchParams, setSearchParams] = useSearchParams();
  
  // Is the Dossier open? Check the URL.
  const isProfileOpen = searchParams.get('mode') === 'dossier';
  
  // Which section? Check the URL or default to dashboard
  const dossierSection = (searchParams.get('section') as "dashboard" | "hunter") || "dashboard";

  // --- HELPER TO OPEN DOSSIER ---
  const openDossier = (section: "dashboard" | "hunter") => {
    // This updates the URL without reloading the page
    setSearchParams({ mode: 'dossier', section });
  };

  // --- HELPER TO CLOSE DOSSIER ---
  const closeDossier = () => {
    // Remove the params to close the modal
    setSearchParams({});
  };

  const [isAuthModalOpen, setAuthModalOpen] = useState(false);
  const [selectedListing, setSelectedListing] = useState<Property | null>(null);

  const [verifyingProp, setVerifyingProp] = useState<{
    id: string;
    title: string;
  } | null>(null);

  const [draftLocation, setDraftLocation] = useState<{
    lat: number;
    long: number;
  } | null>(null);
  const [submitLocation, setSubmitLocation] = useState<{
    lat: number;
    long: number;
    name?: string;
  } | null>(null);

  const [isSidebarHovered, setIsSidebarHovered] = useState(false);
  const [isMobileExpanded, setIsMobileExpanded] = useState(false);

  const [trendingTags, setTrendingTags] = useState<string[]>([]);
  const [filterType, setFilterType] = useState<"all" | "rent" | "sale">("all");
  const [searchQuery, setSearchQuery] = useState("");

  const [minPrice, setMinPrice] = useState<string>("");
  const [maxPrice, setMaxPrice] = useState<string>("");

  const [drawPolygon, setDrawPolygon] = useState<any>(null);
  const [mapStyle, setMapStyle] = useState("mapbox://styles/mapbox/dark-v11");
  const [showHeatmap, setShowHeatmap] = useState(false);

  const [showTrustRadar, setShowTrustRadar] = useState(false);

  const [showFeedback, setShowFeedback] = useState(false);
  const [feedbackType, setFeedbackType] = useState<
    "location" | "bug" | "feature"
  >("location");
  const [feedbackText, setFeedbackText] = useState("");

  const [searchBoundary, setSearchBoundary] = useState<any>(null);
  const [showEmptyState, setShowEmptyState] = useState<{
    location: string;
    type: "gps" | "area" | "atlas" | "hunter";
  } | null>(null);

  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  const mapRef = useRef<any>(null);

  useEffect(() => {
    fetch(`${ENGINE_URL}/api/trends`)
      .then((res) => res.json())
      .then((data) => {
        if (data.trending_tags) setTrendingTags(data.trending_tags);
      })
      .catch((err) => console.error("Engine Offline"));
  }, []);

  useEffect(() => {
    if (gpsLocation && mapRef.current) {
      mapRef.current.flyTo({
        center: [gpsLocation.lng, gpsLocation.lat],
        zoom: 15,
        duration: 2000,
      });
    }
  }, [gpsLocation]);

  const handleReset = () => {
    setSearchQuery("");
    setSuggestions([]);
    setFilterType("all");
    setMinPrice("");
    setMaxPrice("");
    setDrawPolygon(null);
    setSelectedListing(null);
    setShowHeatmap(false);
    setShowTrustRadar(false);
    setSearchBoundary(null);
    setShowEmptyState(null);
    setDraftLocation(null);
    mapRef.current?.flyTo({
      center: [INITIAL_VIEW_STATE.longitude, INITIAL_VIEW_STATE.latitude],
      zoom: INITIAL_VIEW_STATE.zoom,
      duration: 1500,
    });
  };

  const handleDashboardReset = () => {
    handleReset();
  };

  const handleManualListing = () => {
    if (!user) {
      setAuthModalOpen(true);
      return;
    }
    const center = mapRef.current?.getCenter();
    if (center) {
      setDraftLocation({ lat: center.lat, long: center.lng });
    }
  };

  const confirmLocation = async () => {
    if (!draftLocation) return;
    const address = await reverseGeocode(draftLocation.lat, draftLocation.long);
    setSubmitLocation({
      lat: draftLocation.lat,
      long: draftLocation.long,
      name: address || "Unknown Location",
    });
    setDraftLocation(null);
  };

  const submitFeedback = async () => {
    const center = mapRef.current?.getCenter();
    const zoom = mapRef.current?.getZoom();
    const payload = {
      type: feedbackType,
      message: feedbackText,
      context: {
        last_search: searchQuery,
        map_center: center,
        zoom: zoom,
        filter_type: filterType,
      },
    };
    console.log("Submitting Feedback:", payload);
    setFeedbackText("");
    setShowFeedback(false);
    alert("Feedback received.");
  };

  // --- Handle Suggestion Click ---
  const selectSuggestion = async (item: Suggestion) => {
    setSearchQuery(item.value);
    setShowSuggestions(false);
    setIsSearching(true);
    setShowEmptyState(null);
    setSearchBoundary(null);

    // 1. Is it a Vibe Feature?
    if (item.type === 'feature') {
      const matches = listings.filter((l) =>
        l.vibe_features.toLowerCase().includes(item.value.toLowerCase())
      );
      if (matches.length > 0) {
        const points = turf.featureCollection(
          matches.map((m) => turf.point([m.long, m.lat]))
        );
        const bbox = turf.bbox(points);
        mapRef.current?.fitBounds(
          [
            [bbox[0], bbox[1]],
            [bbox[2], bbox[3]],
          ],
          { padding: 100, duration: 2000, maxZoom: 14 }
        );
      } else {
        alert("No properties with that feature.");
      }
      setIsSearching(false);
      return;
    }

    // 2. Is it a Place with an ID?
    if (item.placeId) {
      const details = await getPlaceDetails(item.placeId);
      handlePlaceResult(details, item.value);
      return;
    }

    // 3. Fallback to Text Search
    const place = await searchPlace(item.value);
    handlePlaceResult(place, item.value);
  };

  const handlePlaceResult = (place: any, queryName: string) => {
    if (place) {
      if (place.viewport) {
        const { northeast, southwest } = place.viewport;
        mapRef.current?.fitBounds(
          [
            [southwest.lng, southwest.lat],
            [northeast.lng, northeast.lat],
          ],
          { padding: 100, duration: 2500 }
        );

        const polygon = turf.bboxPolygon([
          southwest.lng,
          southwest.lat,
          northeast.lng,
          northeast.lat,
        ]);
        setSearchBoundary({
          type: "FeatureCollection",
          features: [polygon],
        });

        const hasListings = listings.some(
          (l) =>
            l.lat >= southwest.lat &&
            l.lat <= northeast.lat &&
            l.long >= southwest.lng &&
            l.long <= northeast.lng
        );

        if (!hasListings) {
          setTimeout(() => {
            setShowEmptyState({ location: place.name || queryName, type: "hunter" });
          }, 1500);
        }
      } else {
        mapRef.current?.flyTo({
          center: [place.location.lng, place.location.lat],
          zoom: 14,
          duration: 2500,
        });
      }
    } else {
      alert("Asta Intelligence could not locate " + queryName);
    }
    setIsSearching(false);
  };

  const executeSearch = async (query: string) => {
    const q = query.trim();
    if (!q) return;
    selectSuggestion({ type: 'location', value: q });
  };

  const handleInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchQuery(val);
    
    if (val.length < 3) {
      setSuggestions([]);
      setShowSuggestions(false);
      return;
    }

    const lower = val.toLowerCase();
    const localMatches = Array.from(new Set(listings.map((l) => l.location_name)))
      .filter((l) => l.toLowerCase().includes(lower))
      .slice(0, 2)
      .map((l) => ({ type: "location", value: l } as Suggestion));

    fetchGooglePredictions(val);
    setSuggestions(localMatches);
    setShowSuggestions(true);
  };

  useEffect(() => {
    if (googlePredictions && googlePredictions.length > 0) {
      const googleSuggestions = googlePredictions.slice(0, 3).map((p: any) => ({
        type: "location",
        value: p.description,
        placeId: p.place_id
      } as Suggestion));
      
      setSuggestions(prev => {
        const existing = new Set(prev.map(p => p.value));
        const novel = googleSuggestions.filter((p: any) => !existing.has(p.value));
        return [...prev, ...novel];
      });
      setShowSuggestions(true);
    }
  }, [googlePredictions]);

  const applyPricePreset = (label: string) => {
    if (label === "Budget") {
      setMinPrice("");
      setMaxPrice("150000");
    }
    if (label === "Family") {
      setMinPrice("150000");
      setMaxPrice("500000");
    }
    if (label === "Luxury") {
      setMinPrice("500000");
      setMaxPrice("");
    }
  };

  const filteredListings = useMemo(() => {
    return listings.filter((l) => {
      if (!l.price || l.lat === 0) return false;

      const matchesType = filterType === "all" || l.type === filterType;
      const price = l.price;
      const min = minPrice ? parseFloat(minPrice) : 0;
      const max = maxPrice ? parseFloat(maxPrice) : Infinity;
      const matchesPrice = price >= min && price <= max;

      let matchesTrust = true;
      if (showTrustRadar) {
        matchesTrust = l.location_accuracy === "high";
      }

      let matchesGeo = true;
      if (drawPolygon) {
        const pt = turf.point([l.long, l.lat]);
        matchesGeo = turf.booleanPointInPolygon(pt, drawPolygon);
      }
      return matchesType && matchesGeo && matchesPrice && matchesTrust;
    });
  }, [
    listings,
    filterType,
    drawPolygon,
    minPrice,
    maxPrice,
    showTrustRadar, 
  ]);

  const geojsonData: FeatureCollection = useMemo(() => {
    return {
      type: "FeatureCollection",
      features: filteredListings.map((l) => ({
        type: "Feature",
        properties: {
          ...l,
          price_formatted: (l.price / 1000).toFixed(0) + "k",
        },
        geometry: { type: "Point", coordinates: [l.long, l.lat] },
      })),
    };
  }, [filteredListings]);

  const onClickMap = (event: any) => {
    const feature = event.features?.[0];
    if (!feature) {
      if (selectedListing) setSelectedListing(null);
      setShowSuggestions(false);
      return;
    }
    if (feature.layer.id === "clusters") {
      const clusterId = feature.properties.cluster_id;
      const mapboxSource = mapRef.current?.getSource("listings");
      mapboxSource.getClusterExpansionZoom(
        clusterId,
        (err: any, zoom: number) => {
          if (err) return;
          mapRef.current?.flyTo({
            center: feature.geometry.coordinates,
            zoom: zoom ? zoom + 1 : 14,
            duration: 1000,
          });
        }
      );
      return;
    }
    if (
      feature.layer.id === "unclustered-point" ||
      feature.layer.id === "price-label"
    ) {
      const propId = feature.properties.id;
      const property = listings.find((l) => l.id === propId);
      if (property) setSelectedListing(property);
    }
  };

  const onDrawUpdate = useCallback((e: any) => {
    setDrawPolygon(e.features[0]);
  }, []);
  const onDrawDelete = useCallback(() => {
    setDrawPolygon(null);
  }, []);

  const sidebarVariants = {
    desktop: {
      x: isSidebarHovered ? 0 : -360,
      opacity: isSidebarHovered ? 1 : 0.8,
    },
    mobile: { y: isMobileExpanded ? 0 : "calc(100% - 100px)", opacity: 1 },
  };

  return (
    <div className="relative h-screen w-full bg-asta-deep font-sans overflow-hidden">
      <Map
        ref={mapRef}
        initialViewState={INITIAL_VIEW_STATE}
        style={{ width: "100%", height: "100%" }}
        mapStyle={mapStyle}
        mapboxAccessToken={MAPBOX_TOKEN}
        interactiveLayerIds={["clusters", "unclustered-point", "price-label"]}
        onClick={onClickMap}
        onContextMenu={(e) => {
          e.preventDefault();
          if (user) {
            setDraftLocation({ lat: e.lngLat.lat, long: e.lngLat.lng });
          } else {
            setAuthModalOpen(true);
          }
        }}
      >
        {searchBoundary && (
          <Source id="search-boundary" type="geojson" data={searchBoundary}>
            <Layer {...boundaryFillLayer} />
            <Layer {...boundaryLayer} />
          </Source>
        )}

        <Source
          id="listings"
          type="geojson"
          data={geojsonData}
          cluster={true}
          clusterMaxZoom={14}
          clusterRadius={50}
        >
          {showHeatmap && <Layer {...heatmapLayer} />}
          {!showHeatmap && <Layer {...clusterLayer} />}
          {!showHeatmap && <Layer {...clusterCountLayer} />}
          <Layer {...unclusteredPointLayer} />
          <Layer {...priceLabelLayer} />
        </Source>

        {draftLocation && (
          <Marker
            longitude={draftLocation.long}
            latitude={draftLocation.lat}
            draggable={true}
            onDragEnd={(e) =>
              setDraftLocation({ long: e.lngLat.lng, lat: e.lngLat.lat })
            }
            anchor="bottom"
          >
            <div className="flex flex-col items-center gap-1 group cursor-grab active:cursor-grabbing">
              <div className="bg-black/80 backdrop-blur-md px-3 py-1.5 rounded-lg border border-white/20 text-white shadow-xl mb-1 flex items-center gap-2">
                <span className="text-[10px] font-bold">
                  Drag to exact spot
                </span>
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    confirmLocation();
                  }}
                  className="bg-emerald-600 hover:bg-emerald-500 text-white rounded p-1 transition-colors"
                >
                  {googleLoading ? (
                    <Loader2 size={12} className="animate-spin" />
                  ) : (
                    <Check size={12} />
                  )}
                </button>
              </div>
              <div className="text-emerald-500 drop-shadow-lg filter hover:scale-110 transition-transform">
                <MapPin size={40} fill="currentColor" strokeWidth={1} />
              </div>
              <div className="w-2 h-2 rounded-full bg-emerald-500/50 blur-[2px]" />
            </div>
          </Marker>
        )}

        <NavigationControl
          position="bottom-right"
          className="!hidden md:!block"
        />
        <FullscreenControl
          position="bottom-right"
          className="!hidden md:!block"
        />
        <DrawControl
          position="top-right"
          displayControlsDefault={false}
          controls={{ polygon: true, trash: true }}
          defaultMode="simple_select"
          onUpdate={onDrawUpdate}
          onDelete={onDrawDelete}
        />

        <div className="absolute top-4 right-4 md:bottom-32 md:top-auto md:right-[10px] flex flex-col gap-2 z-10">
          <button
            onClick={getCurrentLocation}
            className="w-[29px] h-[29px] bg-white rounded-md shadow flex items-center justify-center hover:bg-emerald-50 text-emerald-600 border border-gray-300 transition-colors"
            title="Locate Me (GPS)"
          >
            {gpsLoading ? (
              <Loader2 size={16} className="animate-spin" />
            ) : (
              <Crosshair size={16} />
            )}
          </button>

          <button
            onClick={handleReset}
            className="w-[29px] h-[29px] bg-white rounded-md shadow flex items-center justify-center hover:bg-red-50 text-red-600 border border-gray-300 transition-colors"
            title="Reset Map View"
          >
            <RotateCcw size={16} />
          </button>

          <button
            onClick={() =>
              setMapStyle((s) =>
                s.includes("dark")
                  ? "mapbox://styles/mapbox/streets-v12"
                  : "mapbox://styles/mapbox/dark-v11"
              )
            }
            className="w-[29px] h-[29px] bg-white rounded-md shadow flex items-center justify-center hover:bg-gray-100 text-black border border-gray-300"
            title="Toggle Map Theme"
          >
            {mapStyle.includes("dark") ? <Sun size={16} /> : <Moon size={16} />}
          </button>

          <button
            onClick={() => {
              setShowHeatmap(!showHeatmap);
              setShowTrustRadar(false); 
            }}
            className={`w-[29px] h-[29px] rounded-md shadow flex items-center justify-center transition-all border ${
              showHeatmap
                ? "bg-emerald-500 text-white border-emerald-600"
                : "bg-white text-black border-gray-300 hover:bg-gray-100"
            }`}
            title="Toggle Price Heatmap"
          >
            <Layers size={16} />
          </button>

          <button
            onClick={() => {
              setShowTrustRadar(!showTrustRadar);
              setShowHeatmap(false); 
            }}
            className={`w-[29px] h-[29px] rounded-md shadow flex items-center justify-center transition-all border ${
              showTrustRadar
                ? "bg-purple-600 text-white border-purple-700"
                : "bg-white text-black border-gray-300 hover:bg-gray-100"
            }`}
            title="Toggle Trust Radar (Verified Assets Only)"
          >
            <Shield size={16} />
          </button>

          <button
            onClick={() => setShowFeedback(true)}
            className="w-[29px] h-[29px] bg-white rounded-md shadow flex items-center justify-center hover:bg-orange-50 text-orange-500 border border-gray-300 transition-colors"
            title="Report Issue / Feedback"
          >
            <Bug size={16} />
          </button>

          <button
            onClick={handleManualListing}
            className="w-[29px] h-[29px] bg-emerald-600 rounded-md shadow flex items-center justify-center hover:bg-emerald-500 text-white border border-emerald-500 transition-colors"
            title="List New Property"
          >
            <Plus size={16} />
          </button>
        </div>

        <motion.div
          onHoverStart={() => setIsSidebarHovered(true)}
          onHoverEnd={() => setIsSidebarHovered(false)}
          animate={
            window.innerWidth < 768
              ? sidebarVariants.mobile
              : sidebarVariants.desktop
          }
          transition={{ type: "spring", stiffness: 300, damping: 30 }}
          className={`
             absolute z-20 flex pointer-events-auto shadow-2xl
             md:left-0 md:top-0 md:bottom-0 md:w-[400px] md:h-full md:border-r 
             inset-x-0 bottom-0 h-[80vh] rounded-t-xl border-t border-white/20 md:rounded-none md:border-t-0
          `}
        >
          <div className="flex-1 flex flex-col bg-asta-deep/95 backdrop-blur-md h-full relative">
            <div
              className="md:hidden flex justify-center pt-2 pb-1 cursor-pointer"
              onClick={() => setIsMobileExpanded(!isMobileExpanded)}
            >
              <div className="w-12 h-1 bg-white/20 rounded-full mb-1" />
            </div>

            <div className="p-4 border-b border-white/10">
              <div className="flex items-center gap-3 mb-4">
                <img
                  src="/logo.png"
                  alt="Asta"
                  className="h-8 w-auto object-contain"
                  onError={(e: any) => (e.target.style.display = "none")}
                />
                <h1 className="text-2xl font-bold text-white tracking-tight flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-emerald-500 animate-pulse"></span>
                  ASTA{" "}
                  <span className="text-asta-platinum font-light">LIVE</span>
                </h1>
                <div className="ml-auto">
                  {user ? (
                    <button
                      onClick={() => openDossier('dashboard')} // UPDATED
                      className="text-[10px] font-bold text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded hover:bg-emerald-500/10 transition-all flex items-center gap-1.5"
                    >
                      <LayoutDashboard size={12} /> DOSSIER
                    </button>
                  ) : (
                    <button
                      onClick={() => setAuthModalOpen(true)}
                      className="text-[10px] font-bold text-emerald-400 border border-emerald-500/30 px-3 py-1.5 rounded hover:bg-emerald-500/10 transition-all flex items-center gap-1.5"
                    >
                      <LogIn size={10} /> LOG IN
                    </button>
                  )}
                </div>
              </div>

              <div className="relative mb-3 z-50">
                <div className="relative">
                  <input
                    type="text"
                    placeholder="Search location, feature..."
                    value={searchQuery}
                    onKeyDown={(e) =>
                      e.key === "Enter" && executeSearch(searchQuery)
                    }
                    onChange={handleInput}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    className="w-full bg-black/40 border border-white/10 rounded-lg py-2 pl-3 pr-8 text-sm text-white focus:outline-none focus:border-emerald-500/50 transition-all font-mono"
                  />
                  {isSearching || autocompleteLoading ? (
                    <Loader2 className="absolute right-3 top-2.5 text-emerald-500 w-4 h-4 animate-spin" />
                  ) : (
                    <Search className="absolute right-3 top-2.5 text-gray-500 w-4 h-4" />
                  )}
                </div>
                {showSuggestions && (
                  <div className="absolute top-full left-0 right-0 mt-1 bg-black/90 border border-white/10 rounded-lg shadow-xl overflow-hidden backdrop-blur-md">
                    {suggestions.map((item, i) => (
                      <div
                        key={i}
                        onClick={() => selectSuggestion(item)} 
                        className="flex items-center gap-3 px-3 py-2.5 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/5 last:border-0"
                      >
                        {item.type === "location" ? (
                          <MapPin className="w-3 h-3 text-red-400" />
                        ) : (
                          <Hash className="w-3 h-3 text-emerald-400" />
                        )}
                        <span className="text-sm text-gray-200">
                          {item.value}
                        </span>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div
                className={`${
                  !isMobileExpanded && window.innerWidth < 768
                    ? "hidden"
                    : "block"
                }`}
              >
                <div className="flex flex-wrap gap-2 mb-3 max-h-24 overflow-y-auto scrollbar-hide">
                  {trendingTags.map((tag, i) => (
                    <button
                      key={i}
                      onClick={() => executeSearch(tag)}
                      className="px-2 py-1 bg-white/5 border border-white/10 rounded text-[10px] text-asta-platinum hover:bg-emerald-500/20 transition-all"
                    >
                      #{tag}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1 p-1 bg-white/5 rounded-lg mb-3">
                  {["all", "sale", "rent"].map((type) => (
                    <button
                      key={type}
                      onClick={() => setFilterType(type as any)}
                      className={`flex-1 py-1.5 text-[10px] uppercase font-bold tracking-wider rounded-md transition-all ${
                        filterType === type
                          ? "bg-emerald-500 text-black"
                          : "text-gray-400 hover:bg-white/5"
                      }`}
                    >
                      {type}
                    </button>
                  ))}
                </div>
                <div className="mb-3">
                  <div className="flex justify-between items-center mb-1.5">
                    <span className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">
                      Price Range (GHS)
                    </span>
                  </div>
                  <div className="flex items-center gap-2 mb-2 bg-white/5 p-1 rounded-lg border border-white/10">
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-1.5 text-xs text-gray-500">
                        ₵
                      </span>
                      <input
                        type="number"
                        placeholder="Min"
                        value={minPrice}
                        onChange={(e) => setMinPrice(e.target.value)}
                        className="w-full bg-transparent text-white text-xs pl-5 py-1 focus:outline-none placeholder-gray-600"
                      />
                    </div>
                    <span className="text-gray-600 text-xs">-</span>
                    <div className="relative flex-1">
                      <span className="absolute left-2 top-1.5 text-xs text-gray-500">
                        ₵
                      </span>
                      <input
                        type="number"
                        placeholder="Max"
                        value={maxPrice}
                        onChange={(e) => setMaxPrice(e.target.value)}
                        className="w-full bg-transparent text-white text-xs pl-5 py-1 focus:outline-none placeholder-gray-600"
                      />
                    </div>
                  </div>
                  <div className="flex gap-1.5">
                    {["Budget", "Family", "Luxury"].map((label) => (
                      <button
                        key={label}
                        onClick={() => applyPricePreset(label)}
                        className="flex-1 py-1 text-[9px] border border-white/10 rounded hover:bg-white/10 text-gray-400 transition-colors uppercase tracking-wide"
                      >
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <button
                  onClick={handleDashboardReset}
                  className="w-full mt-2 flex items-center justify-center gap-2 py-2 rounded border border-red-500/30 text-red-400 hover:bg-red-500/10 hover:text-red-300 hover:border-red-500/50 transition-all text-[10px] uppercase font-bold tracking-widest"
                >
                  <X size={12} /> Clear Dashboard Filters
                </button>
              </div>
            </div>

            <div className="flex-1 overflow-y-auto p-4 scrollbar-hide">
              <AnimatePresence>
                {filteredListings.map((property) => (
                  <ListingCard
                    key={property.id}
                    property={property as any}
                    isSelected={selectedListing?.id === property.id}
                    onClick={() => setSelectedListing(property)}
                  />
                ))}
              </AnimatePresence>
            </div>
          </div>

          <div className="hidden md:flex w-10 h-full items-center justify-center cursor-pointer group">
            <div className="w-1 h-12 bg-white/20 rounded-full group-hover:bg-emerald-500 transition-all" />
          </div>
        </motion.div>

        <AnimatePresence>
          {showFeedback && (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
              <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                className="bg-[#1A1A1A] border border-white/10 w-full max-w-md rounded-xl shadow-2xl overflow-hidden"
              >
                <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
                  <h3 className="text-white font-bold flex items-center gap-2">
                    <Bug className="text-orange-500 w-4 h-4" /> Report Issue
                  </h3>
                  <button
                    onClick={() => setShowFeedback(false)}
                    className="text-gray-400 hover:text-white transition-colors"
                  >
                    <X size={18} />
                  </button>
                </div>
                <div className="p-4 space-y-4">
                  <div className="flex gap-2">
                    {[
                      { id: "location", label: "Wrong Location" },
                      { id: "bug", label: "App Bug" },
                      { id: "feature", label: "Suggestion" },
                    ].map((type) => (
                      <button
                        key={type.id}
                        onClick={() => setFeedbackType(type.id as any)}
                        className={`flex-1 py-2 text-[10px] font-bold uppercase tracking-wider rounded border transition-all ${
                          feedbackType === type.id
                            ? "bg-orange-500 text-black border-orange-500"
                            : "bg-white/5 text-gray-400 border-white/10 hover:bg-white/10"
                        }`}
                      >
                        {type.label}
                      </button>
                    ))}
                  </div>
                  <textarea
                    value={feedbackText}
                    onChange={(e) => setFeedbackText(e.target.value)}
                    placeholder="Tell us what's wrong..."
                    className="w-full h-24 bg-black/40 border border-white/10 rounded-lg p-3 text-sm text-white placeholder-gray-600 focus:outline-none focus:border-orange-500/50 resize-none"
                  />
                  <button
                    onClick={submitFeedback}
                    className="w-full bg-orange-500 hover:bg-orange-400 text-black font-bold py-3 rounded-lg flex items-center justify-center gap-2 transition-colors"
                  >
                    <Send size={14} /> Submit Report
                  </button>
                </div>
              </motion.div>
            </div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {selectedListing && (
            <PropertyInspector
              property={selectedListing}
              onClose={() => setSelectedListing(null)}
              onVerify={() =>
                setVerifyingProp({
                  id: selectedListing.id.toString(),
                  title: selectedListing.title,
                })
              }
            />
          )}
        </AnimatePresence>
        
        {/* REPLACED: isProfileOpen -> URL controlled state */}
        <AnimatePresence>
          {isProfileOpen && (
            <UnifiedCommandCenter
              onClose={closeDossier} // UPDATED
              initialSection={dossierSection} // UPDATED
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {showEmptyState && (
            <motion.div
              initial={{ y: -100, opacity: 0 }}
              animate={{ y: 0, opacity: 1 }}
              exit={{ y: -100, opacity: 0 }}
              className="absolute top-8 left-1/2 -translate-x-1/2 z-40 bg-black/90 text-white px-6 py-4 rounded-lg shadow-2xl border border-white/20 flex flex-col items-center gap-2 backdrop-blur-md max-w-sm text-center"
            >
              <div className="flex items-center gap-2 text-emerald-400 font-bold mb-1">
                {showEmptyState.type === "hunter" ? (
                  <BellRing size={20} className="animate-bounce" />
                ) : (
                  <Brain size={20} />
                )}
                <span>
                  {showEmptyState.type === "hunter"
                    ? "ASTA HUNTER"
                    : "ASTA INTELLIGENCE"}
                </span>
              </div>

              <p className="text-lg font-bold text-white">
                {showEmptyState.type === "hunter"
                  ? `No assets found in ${showEmptyState.location}`
                  : `Exploring ${showEmptyState.location}`}
              </p>

              {showEmptyState.type === "hunter" && (
                <p className="text-[10px] text-gray-400">
                  Our network is dark in this sector. Configure a Hunter Alert
                  to be notified when assets go live.
                </p>
              )}

              <div className="flex gap-2 mt-2 w-full">
                <button
                  onClick={() => {
                    setShowEmptyState(null);
                    if (user) {
                      openDossier('hunter'); // UPDATED
                    } else {
                      setAuthModalOpen(true);
                    }
                  }}
                  className="flex-1 bg-emerald-600 hover:bg-emerald-500 text-white text-[10px] font-bold py-2 rounded transition-colors"
                >
                  {showEmptyState.type === "hunter"
                    ? "Activate Hunter Alert"
                    : "Join Waitlist"}
                </button>
                <button
                  onClick={() => setShowEmptyState(null)}
                  className="px-3 bg-white/10 hover:bg-white/20 text-white text-[10px] font-bold py-2 rounded transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        <AnimatePresence>
          {verifyingProp && (
            <FieldReportModal
              propertyId={verifyingProp.id}
              propertyTitle={verifyingProp.title}
              onClose={() => setVerifyingProp(null)}
              onSuccess={() => {}}
            />
          )}
        </AnimatePresence>

        <AnimatePresence>
          {submitLocation && (
            <SubmitIntelModal
              location={submitLocation}
              onClose={() => setSubmitLocation(null)}
              onSuccess={() => {
                alert(
                  "Intelligence received. Asset is now active on the grid."
                );
              }}
            />
          )}
        </AnimatePresence>

        <div className="absolute bottom-6 left-0 right-0 text-center pointer-events-none z-10 hidden md:block">
          <p className="text-[10px] text-white/40 font-mono tracking-widest uppercase shadow-black drop-shadow-md">
            Made with <span className="text-red-500">♥</span> for Ghana
          </p>
        </div>
        <AuthModal
          isOpen={isAuthModalOpen}
          onClose={() => setAuthModalOpen(false)}
        />
      </Map>
    </div>
  );
}
