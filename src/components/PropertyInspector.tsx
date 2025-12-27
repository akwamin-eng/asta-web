import React, { useState } from 'react';
import { X, MapPin, MessageSquare, Share2, ShieldCheck, Clock, CheckCircle, ChevronDown, ArrowLeft, AlertTriangle, Maximize2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import IntelligenceCard from './modules/IntelligenceCard';

// Updated interface to match what AstaMap sends
interface PropertyInspectorProps {
  property: any; // Matched to Parent
  onClose: () => void;
}

export default function PropertyInspector({ property, onClose }: PropertyInspectorProps) {
  // State for Currency Toggle
  const [currency, setCurrency] = useState<'GHS' | 'USD'>('GHS');
  // State for Cinematic Image Mode
  const [isImageExpanded, setIsImageExpanded] = useState(false);

  // Alias 'property' to 'data' so we keep your original variable names and logic
  const data = property;

  // Safety: If no data, don't render
  if (!data) return null;

  // Helper: Safely parse features without crashing the UI if data is messy
  const getSafeFeatures = () => {
    try {
      if (!data.vibe_features) return [];
      // Handle both array and string formats
      if (Array.isArray(data.vibe_features)) return data.vibe_features;
      const parsed = JSON.parse(typeof data.vibe_features === 'string' ? data.vibe_features : JSON.stringify(data.vibe_features));
      return Array.isArray(parsed) ? parsed : [];
    } catch (e) {
      return [];
    }
  };

  // Currency Logic (Approx 1 USD = 15.5 GHS for display purposes)
  const exchangeRate = 15.5;
  const displayPrice = currency === 'GHS' 
    ? `₵${data.price?.toLocaleString()}` 
    : `$${(data.price / exchangeRate).toLocaleString(undefined, { maximumFractionDigits: 0 })}`;

  return (
    <>
      {/* --- CINEMATIC OVERLAY (LIGHTBOX) --- */}
      <AnimatePresence>
        {isImageExpanded && (
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[100] bg-black/95 flex items-center justify-center p-4 backdrop-blur-xl cursor-zoom-out"
            onClick={() => setIsImageExpanded(false)}
          >
            {/* Close Button for Lightbox */}
            <button className="absolute top-6 right-6 text-white/50 hover:text-white transition-colors bg-black/20 p-2 rounded-full">
              <X size={32} />
            </button>

            {/* Expanded Image */}
            <motion.img 
              layoutId={`hero-image-${data.id}`}
              src={data.cover_image_url || "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1600&q=80"}
              className="max-w-full max-h-full rounded-lg shadow-2xl object-contain pointer-events-none select-none"
            />
            
            {/* Caption */}
            <div className="absolute bottom-10 left-0 right-0 text-center pointer-events-none">
              <p className="text-white text-lg font-bold">{data.title}</p>
              <p className="text-emerald-400 font-mono text-sm">Use arrow keys to navigate (coming soon)</p>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* --- MAIN INSPECTOR PANEL --- */}
      <AnimatePresence>
        <motion.div 
          key="property-inspector"
          initial={{ x: '100%' }}
          animate={{ x: 0 }}
          exit={{ x: '100%' }}
          // 1. SMOOTHER ANIMATION: Using 'tween' instead of 'spring' for a reliable slide
          transition={{ type: "tween", duration: 0.3, ease: "easeInOut" }}
          className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#0A0A0A] border-l border-white/10 shadow-2xl z-50 overflow-y-auto"
        >
            {/* IMAGE HEADER (Now Clickable) */}
            <div 
              className="relative h-64 bg-gray-900 group cursor-zoom-in"
              onClick={() => setIsImageExpanded(true)}
            >
               <motion.img 
                 layoutId={`hero-image-${data.id}`}
                 src={data.cover_image_url || "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=80"} 
                 alt={data.title}
                 className="w-full h-full object-cover opacity-80 transition-opacity group-hover:opacity-100"
               />
               <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
               
               {/* Expand Hint (Appears on Hover) */}
               <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="bg-black/50 backdrop-blur-md px-3 py-1.5 rounded-full border border-white/20 text-white text-xs flex items-center gap-2 shadow-xl">
                    <Maximize2 size={12} /> View Photos
                  </div>
               </div>

               <button 
                 onClick={(e) => { e.stopPropagation(); onClose(); }}
                 className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-all z-10"
               >
                 <X size={20} />
               </button>

               {/* 2. REMOVED BADGES (Rent/Verified) per request */}
               <div className="absolute bottom-4 left-6 right-6 pointer-events-none">
                  <h2 className="text-2xl font-bold text-white leading-tight mb-1">{data.title}</h2>
                  <div className="flex items-center text-gray-400 text-sm">
                    <MapPin size={14} className="mr-1" />
                    {data.location_name}
                  </div>
               </div>
            </div>

            {/* ACTION BAR */}
            <div className="flex items-center gap-3 p-6 border-b border-white/10">
               <div className="flex-1 cursor-pointer group" onClick={() => setCurrency(c => c === 'GHS' ? 'USD' : 'GHS')}>
                  <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1 flex items-center gap-1 group-hover:text-emerald-400 transition-colors">
                    Price ({currency}) <ChevronDown size={10} />
                  </p>
                  {/* 4. CURRENCY CONVERTER DISPLAY */}
                  <p className="text-2xl font-mono text-emerald-400 transition-all">{displayPrice}</p>
               </div>
               <button className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors">
                  <Share2 size={20} />
               </button>
               {/* 3. UPDATED CTA: Contact Agent */}
               <button className="flex-1 bg-white text-black font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                  <MessageSquare size={18} /> Contact Agent
               </button>
            </div>

            {/* MAIN CONTENT */}
            <div className="p-6 space-y-8">
              
              {/* VIBE CHECK (VOTING) MODULE */}
              <IntelligenceCard 
                  key={data.id} 
                  propertyId={data.id} 
                  locationName={data.location_name} 
              />

              {/* DESCRIPTION */}
              <div>
                 <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">About this place</h3>
                 <p className="text-gray-400 text-sm leading-relaxed">
                   {data.description_enriched || data.description || "No description provided."}
                 </p>
              </div>

              {/* FEATURES */}
              {data.vibe_features && (
                <div>
                   <h3 className="text-sm font-bold text-white uppercase tracking-wider mb-3">Features & Vibe</h3>
                   <div className="flex flex-wrap gap-2">
                      {getSafeFeatures().map((tag: string, i: number) => (
                        <span key={i} className="px-3 py-1.5 bg-white/5 border border-white/10 rounded-full text-xs text-gray-300">
                          {tag}
                        </span>
                      ))}
                   </div>
                </div>
              )}

              {/* AI INSIGHTS */}
              <div className="bg-gradient-to-br from-emerald-900/10 to-transparent border border-emerald-500/20 rounded-xl p-5">
                 <h3 className="text-emerald-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                   <ShieldCheck size={14} /> Asta Intelligence
                 </h3>
                 <div className="space-y-2">
                    <div className="flex items-start gap-2">
                      <CheckCircle size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-gray-400">Price is <span className="text-white font-bold">within 5%</span> of market average for {data.location_name}.</p>
                    </div>
                    <div className="flex items-start gap-2">
                      <Clock size={14} className="text-emerald-500 mt-0.5 shrink-0" />
                      <p className="text-xs text-gray-400">Listed 2 days ago. High demand expected.</p>
                    </div>
                 </div>
              </div>

              {/* ASTA ADVISOR (NEW MODULE) */}
              <div className="bg-orange-500/5 border border-orange-500/20 rounded-xl p-5">
                 <h3 className="text-orange-400 text-xs font-bold uppercase tracking-wider mb-2 flex items-center gap-2">
                   <AlertTriangle size={14} /> Asta Advisor
                 </h3>
                 <div className="space-y-2">
                    <p className="text-xs text-gray-400 leading-relaxed">
                      {data.type === 'rent' 
                        ? "Standard market practice in Accra is 1-2 years rent in advance. Be wary of landlords asking for more without a contract."
                        : "Critical: Verify the Land Title Certificate with the Lands Commission before making any deposit. Do not rely solely on indentures."}
                    </p>
                    <p className="text-[10px] text-gray-500 italic mt-2 border-t border-white/5 pt-2">
                      Tip: Never pay "viewing fees" without an official receipt.
                    </p>
                 </div>
              </div>

              {/* 5. CLOSE INSPECTOR BUTTON */}
              <div className="pt-4 border-t border-white/5">
                <button 
                  onClick={onClose}
                  className="w-full py-4 flex items-center justify-center gap-2 text-gray-500 hover:text-white hover:bg-white/5 rounded-lg transition-all text-sm font-bold uppercase tracking-widest"
                >
                  <ArrowLeft size={16} /> Close Inspector
                </button>
              </div>

            </div>
        </motion.div>
      </AnimatePresence>
    </>
  );
}
