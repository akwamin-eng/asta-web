import React, { useState } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, Car, Waves, Dumbbell, Shield, 
  Wind, Sun, MapPin, Maximize2, Zap, Radio, FileText,
  ChevronLeft, ChevronRight, RefreshCw
} from 'lucide-react';

interface Property {
  id: number;
  title: string;
  price: number;
  location_name: string;
  type: 'sale' | 'rent';
  image_url?: string;
  vibe_features: string;
  description?: string;
}

interface InspectorProps {
  property: Property;
  onClose: () => void;
}

const cleanTag = (tag: string) => {
  if (!tag) return "";
  return tag.replace(/[\[\]"']/g, '').trim().toUpperCase();
};

const getIconForTag = (tag: string) => {
  const t = tag.toLowerCase();
  if (t.includes('pool') || t.includes('swim')) return <Waves className="w-3 h-3" />;
  if (t.includes('gym') || t.includes('fit')) return <Dumbbell className="w-3 h-3" />;
  if (t.includes('wifi') || t.includes('internet')) return <Wifi className="w-3 h-3" />;
  if (t.includes('car') || t.includes('park') || t.includes('garage')) return <Car className="w-3 h-3" />;
  if (t.includes('guard') || t.includes('security') || t.includes('gated')) return <Shield className="w-3 h-3" />;
  if (t.includes('ac') || t.includes('cool') || t.includes('air')) return <Wind className="w-3 h-3" />;
  if (t.includes('balcony') || t.includes('view')) return <Sun className="w-3 h-3" />;
  if (t.includes('generator') || t.includes('power')) return <Zap className="w-3 h-3" />;
  if (t.includes('main road') || t.includes('visibility')) return <Radio className="w-3 h-3" />;
  return <div className="w-1.5 h-1.5 rounded-full bg-emerald-500" />; 
};

export default function PropertyInspector({ property, onClose }: InspectorProps) {
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [currency, setCurrency] = useState<'GHS' | 'USD'>('GHS');
  const [photoIndex, setPhotoIndex] = useState(0);

  // 📸 MOCK GALLERY GENERATOR
  // Since DB has 1 image, we create a fake gallery for the demo
  const gallery = [
    property.image_url,
    "https://images.unsplash.com/photo-1600566753086-00f18fb6b3ea?auto=format&fit=crop&w=800&q=80", // Modern Kitchen
    "https://images.unsplash.com/photo-1600210492486-724fe5c67fb0?auto=format&fit=crop&w=800&q=80", // Bedroom
    "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80"  // Bathroom
  ].filter(Boolean);

  const tags = property.vibe_features 
    ? property.vibe_features.split(',').map(cleanTag).filter(t => t.length > 0)
    : [];

  // 💰 CURRENCY CONVERTER (Approx Rate 15.5)
  const displayPrice = currency === 'GHS' 
    ? `₵${property.price.toLocaleString()}`
    : `$${(property.price / 15.5).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  const nextPhoto = (e: any) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev + 1) % gallery.length);
  };

  const prevPhoto = (e: any) => {
    e.stopPropagation();
    setPhotoIndex((prev) => (prev - 1 + gallery.length) % gallery.length);
  };

  return (
    <>
      {/* SIDEBAR */}
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute top-0 right-0 h-full w-[400px] bg-asta-deep/95 backdrop-blur-md border-l border-white/10 z-30 shadow-2xl flex flex-col"
      >
        {/* HEADER IMAGE / CAROUSEL PREVIEW */}
        <div 
          className="relative h-64 bg-gray-800 shrink-0 cursor-zoom-in group overflow-hidden"
          onClick={() => setIsCinemaMode(true)}
        >
          <motion.img 
            key={photoIndex} // Re-render on change
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={gallery[photoIndex]} 
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-4 left-4 bg-black/50 hover:bg-black/80 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all border border-white/10 z-10"
          >
            ✕
          </button>

          {/* GALLERY INDICATOR */}
          <div className="absolute bottom-4 right-4 bg-black/60 px-2 py-1 rounded text-[10px] text-white font-mono border border-white/10">
            {photoIndex + 1} / {gallery.length}
          </div>

          <div className="absolute top-4 right-4 bg-black/50 text-white w-8 h-8 rounded-full flex items-center justify-center border border-white/10 opacity-0 group-hover:opacity-100 transition-all">
            <Maximize2 className="w-4 h-4" />
          </div>

          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider text-black ${property.type === 'rent' ? 'bg-blue-400' : 'bg-emerald-400'}`}>
              For {property.type}
            </span>
          </div>
        </div>

        {/* DATA AREA */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white leading-tight mb-2">{property.title}</h2>
            <div className="flex items-center gap-2 text-asta-platinum text-sm">
              <MapPin className="w-4 h-4 text-emerald-500" />
              {property.location_name}
            </div>
          </div>

          {/* 💰 PRICE & CURRENCY TOGGLE */}
          <div 
            className="mb-8 p-4 bg-white/5 rounded-lg border border-white/5 cursor-pointer hover:bg-white/10 transition-colors group"
            onClick={() => setCurrency(c => c === 'GHS' ? 'USD' : 'GHS')}
            title="Click to switch Currency"
          >
            <div className="flex justify-between items-center mb-1">
               <p className="text-gray-400 text-xs uppercase tracking-widest">Asking Price</p>
               <RefreshCw className="w-3 h-3 text-gray-500 group-hover:text-emerald-400 transition-colors" />
            </div>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-mono font-bold text-emerald-400">
                {displayPrice}
              </span>
              <span className="text-xs font-bold bg-white/10 px-1.5 py-0.5 rounded text-gray-300">
                {currency}
              </span>
              {property.type === 'rent' && <span className="text-gray-500 mb-1">/ month</span>}
            </div>
          </div>

          {/* TAGS */}
          <div className="mb-8">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">Amenities & Vibe</p>
            <div className="grid grid-cols-2 gap-2">
              {tags.map((tag, i) => (
                <div key={i} className="flex items-center gap-2 px-3 py-2 bg-white/5 border border-white/10 rounded-lg">
                  <span className="text-emerald-400 shrink-0">
                    {getIconForTag(tag)}
                  </span>
                  <span className="text-xs text-gray-300 font-medium truncate">
                    {tag}
                  </span>
                </div>
              ))}
            </div>
          </div>

          {/* DESCRIPTION */}
          {property.description && (
            <div className="mb-6">
              <p className="text-gray-400 text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                <FileText className="w-3 h-3" /> Property Details
              </p>
              <p className="text-sm text-gray-300 leading-relaxed whitespace-pre-line">
                {property.description}
              </p>
            </div>
          )}

          {/* INTELLIGENCE */}
          <div className="mb-6">
             <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">Asta Intelligence</p>
             <p className="text-sm text-gray-400 leading-relaxed italic border-l-2 border-emerald-500 pl-3">
               "This property is located in a high-demand zone. Based on Asta's analysis, the price point aligns with current market trends in {property.location_name}."
             </p>
          </div>
        </div>

        {/* CTA FOOTER */}
        <div className="p-4 border-t border-white/10 bg-black/40 backdrop-blur">
          <div className="grid grid-cols-2 gap-3">
            <button className="py-3 rounded-lg bg-white/10 hover:bg-white/20 text-white text-sm font-bold border border-white/10 transition-all">
              Save to Watchlist
            </button>
            <button className="py-3 rounded-lg bg-emerald-500 hover:bg-emerald-400 text-black text-sm font-bold shadow-lg shadow-emerald-900/20 transition-all">
              Contact Agent
            </button>
          </div>
        </div>
      </motion.div>

      {/* 🎬 CINEMA MODE CAROUSEL */}
      {createPortal(
        <AnimatePresence>
          {isCinemaMode && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center cursor-zoom-out"
              onClick={() => setIsCinemaMode(false)}
            >
              {/* MAIN IMAGE */}
              <motion.img
                key={photoIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                src={gallery[photoIndex]}
                alt={property.title}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl shadow-emerald-500/10"
              />

              {/* CONTROLS */}
              <button 
                onClick={prevPhoto}
                className="absolute left-4 md:left-10 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all backdrop-blur border border-white/10"
              >
                <ChevronLeft size={32} />
              </button>
              
              <button 
                onClick={nextPhoto}
                className="absolute right-4 md:right-10 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all backdrop-blur border border-white/10"
              >
                <ChevronRight size={32} />
              </button>

              {/* FOOTER CAPTION */}
              <div className="absolute bottom-8 text-center bg-black/50 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
                <p className="text-white font-bold text-lg">{property.title}</p>
                <p className="text-emerald-400 text-sm font-mono tracking-widest">
                  IMAGE {photoIndex + 1} OF {gallery.length}
                </p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
