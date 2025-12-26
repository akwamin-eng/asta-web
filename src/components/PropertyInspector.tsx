import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

interface Property {
  id: number;
  title: string;
  price: number;
  location_name: string;
  type: 'sale' | 'rent';
  image_url?: string;
  vibe_features: string;
}

interface InspectorProps {
  property: Property;
  onClose: () => void;
}

export default function PropertyInspector({ property, onClose }: InspectorProps) {
  // 🆕 Local state for "Cinema Mode"
  const [isCinemaMode, setIsCinemaMode] = useState(false);

  return (
    <>
      {/* 1. THE SIDEBAR PANEL */}
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute top-0 right-0 h-full w-[400px] bg-asta-deep/95 backdrop-blur-md border-l border-white/10 z-30 shadow-2xl flex flex-col"
      >
        {/* Header Image Area (Clickable) */}
        <div 
          className="relative h-64 bg-gray-800 shrink-0 cursor-zoom-in group overflow-hidden"
          onClick={() => setIsCinemaMode(true)}
        >
          <motion.img 
            layoutId={`image-${property.id}`} // 🪄 Magic ID for shared layout animation
            src={property.image_url || "https://via.placeholder.com/600x400?text=Asta+Property"} 
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Close Button (For Sidebar) */}
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-4 left-4 bg-black/50 hover:bg-black/80 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all border border-white/10 z-10"
          >
            ✕
          </button>

          {/* Hint Overlay */}
          <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all flex items-center justify-center opacity-0 group-hover:opacity-100">
            <span className="text-white text-xs font-bold uppercase tracking-widest border border-white/30 px-3 py-1 rounded-full backdrop-blur-sm">
              View Fullscreen
            </span>
          </div>

          {/* Status Badge */}
          <div className="absolute bottom-4 left-4 flex gap-2">
            <span className={`px-3 py-1 rounded text-xs font-bold uppercase tracking-wider text-black ${property.type === 'rent' ? 'bg-blue-400' : 'bg-emerald-400'}`}>
              For {property.type}
            </span>
          </div>
        </div>

        {/* Content Scroll Area */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white leading-tight mb-2">{property.title}</h2>
            <div className="flex items-center gap-2 text-asta-platinum text-sm">
              <svg className="w-4 h-4 text-emerald-500" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
              {property.location_name}
            </div>
          </div>

          <div className="mb-8 p-4 bg-white/5 rounded-lg border border-white/5">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-1">Asking Price</p>
            <div className="flex items-end gap-2">
              <span className="text-3xl font-mono font-bold text-emerald-400">
                ₵{property.price.toLocaleString()}
              </span>
              {property.type === 'rent' && <span className="text-gray-500 mb-1">/ month</span>}
            </div>
          </div>

          <div className="mb-8">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">Vibe Analysis</p>
            <div className="flex flex-wrap gap-2">
              {property.vibe_features?.split(',').map((tag, i) => (
                <span key={i} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-300">
                  #{tag.trim().toUpperCase()}
                </span>
              ))}
            </div>
          </div>

          <div className="mb-6">
             <p className="text-gray-400 text-xs uppercase tracking-widest mb-3">Intelligence</p>
             <p className="text-sm text-gray-400 leading-relaxed">
               This property is located in a high-demand zone. Based on Asta's analysis, the price point aligns with current market trends in {property.location_name}.
             </p>
          </div>
        </div>

        {/* Footer */}
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

      {/* 2. 🎥 CINEMA MODE (THE LIGHTBOX) */}
      <AnimatePresence>
        {isCinemaMode && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 bg-black/95 flex items-center justify-center p-4 cursor-zoom-out"
            onClick={() => setIsCinemaMode(false)}
          >
            {/* The Floating Image */}
            <motion.img
              layoutId={`image-${property.id}`} // Matches the sidebar image for smooth morphing
              src={property.image_url}
              alt={property.title}
              className="max-w-full max-h-[90vh] object-contain rounded-lg shadow-2xl shadow-emerald-500/10"
            />

            <button 
              className="absolute top-8 right-8 text-white/50 hover:text-white transition-colors"
            >
              <svg className="w-8 h-8" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" /></svg>
            </button>
            
            <div className="absolute bottom-8 left-0 right-0 text-center">
              <p className="text-white font-bold text-lg">{property.title}</p>
              <p className="text-gray-400 text-sm">Click anywhere to close</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
