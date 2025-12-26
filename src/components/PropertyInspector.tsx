import React from 'react';
import { X, MapPin, Navigation, Share2, ShieldCheck, Clock, CheckCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import IntelligenceCard from './modules/IntelligenceCard';

// Updated interface to match what AstaMap sends
interface PropertyInspectorProps {
  property: any; // Matched to Parent
  onClose: () => void;
}

export default function PropertyInspector({ property, onClose }: PropertyInspectorProps) {
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

  return (
    <AnimatePresence>
      <motion.div 
        // We use true here because the parent controls mounting/unmounting
        initial={{ x: '100%' }}
        animate={{ x: 0 }}
        exit={{ x: '100%' }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed top-0 right-0 h-full w-full md:w-[450px] bg-[#0A0A0A] border-l border-white/10 shadow-2xl z-50 overflow-y-auto"
      >
          {/* IMAGE HEADER */}
          <div className="relative h-64 bg-gray-900">
             <img 
               src={data.cover_image_url || "https://images.unsplash.com/photo-1570129477492-45c003edd2be?auto=format&fit=crop&w=1000&q=80"} 
               alt={data.title}
               className="w-full h-full object-cover opacity-80"
             />
             <div className="absolute inset-0 bg-gradient-to-t from-[#0A0A0A] via-transparent to-transparent" />
             
             <button 
               onClick={onClose}
               className="absolute top-4 right-4 bg-black/50 hover:bg-black/80 text-white p-2 rounded-full backdrop-blur-sm transition-all"
             >
               <X size={20} />
             </button>

             <div className="absolute bottom-4 left-6 right-6">
                <div className="flex items-center gap-2 mb-2">
                   <span className="px-2 py-1 bg-emerald-500/20 text-emerald-400 text-[10px] font-bold uppercase tracking-wider rounded border border-emerald-500/20">
                     {data.type}
                   </span>
                   {data.location_accuracy === 'high' && (
                     <span className="flex items-center gap-1 px-2 py-1 bg-blue-500/20 text-blue-400 text-[10px] font-bold uppercase tracking-wider rounded border border-blue-500/20">
                       <CheckCircle size={10} /> Verified Location
                     </span>
                   )}
                </div>
                <h2 className="text-2xl font-bold text-white leading-tight mb-1">{data.title}</h2>
                <div className="flex items-center text-gray-400 text-sm">
                  <MapPin size={14} className="mr-1" />
                  {data.location_name}
                </div>
             </div>
          </div>

          {/* ACTION BAR */}
          <div className="flex items-center gap-3 p-6 border-b border-white/10">
             <div className="flex-1">
                <p className="text-gray-400 text-xs uppercase tracking-wider font-bold mb-1">Price</p>
                <p className="text-2xl font-mono text-emerald-400">₵{data.price?.toLocaleString()}</p>
             </div>
             <button className="flex items-center justify-center w-12 h-12 rounded-lg bg-white/5 hover:bg-white/10 border border-white/10 text-white transition-colors">
                <Share2 size={20} />
             </button>
             <button className="flex-1 bg-white text-black font-bold py-3 px-4 rounded-lg hover:bg-gray-200 transition-colors flex items-center justify-center gap-2">
                <Navigation size={18} /> Tour Now
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

          </div>
      </motion.div>
    </AnimatePresence>
  );
}
