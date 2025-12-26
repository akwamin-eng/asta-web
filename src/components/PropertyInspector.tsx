import React, { useState, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Wifi, Car, Waves, Dumbbell, Shield, 
  Wind, Sun, MapPin, Maximize2, Zap, Radio, FileText,
  ChevronLeft, ChevronRight, RefreshCw,
  ThumbsUp, ThumbsDown, AlertTriangle, CheckCircle2, Brain, X
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

// 🧠 DYNAMIC INSIGHT GENERATOR
const generateAstaInsight = (property: Property) => {
  const loc = property.location_name.toLowerCase();
  const price = property.price;
  const tags = property.vibe_features.toLowerCase();
  const isRent = property.type === 'rent';

  let insight = "Asta Analysis: ";

  // 1. Location Intelligence
  if (loc.includes('ada') || loc.includes('ningo') || loc.includes('prampram')) {
    insight += "This asset sits in a high-velocity growth corridor. Land values here are outperforming the Accra average. ";
  } else if (loc.includes('cantonments') || loc.includes('airport') || loc.includes('labone')) {
    insight += "Blue-chip location with historically low vacancy rates. A safe haven asset. ";
  } else if (loc.includes('osu') || loc.includes('east legon')) {
    insight += "High rental demand zone driven by expat and diaspora interest. ";
  } else {
    insight += `Located in ${property.location_name}, an area showing steady organic appreciation. `;
  }

  // 2. Pricing Intelligence
  if (isRent) {
    if (price > 3000) insight += "The premium pricing reflects the luxury amenities and finish quality. ";
    else insight += "Competitively priced for the current rental market yielding strong occupancy potential. ";
  } else {
    if (price > 500000) insight += "This represents a luxury acquisition targeting the upper-echelon market. ";
    else insight += "An accessible entry point for investors seeking long-term capital appreciation. ";
  }

  // 3. Vibe Intelligence
  if (tags.includes('pool') || tags.includes('gym')) {
     insight += "Lifestyle amenities significantly boost its short-stay (Airbnb) viability.";
  } else if (tags.includes('generator') || tags.includes('water')) {
     insight += "Infrastructure readiness (Power/Water) reduces operational risk.";
  }

  return insight;
};

// 🖼️ FALLBACK STOCK IMAGES
const STOCK_IMAGES = [
  "https://images.unsplash.com/photo-1600596542815-e32c215dd86d?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1600047509807-ba8f99d2cdde?auto=format&fit=crop&w=800&q=80",
  "https://images.unsplash.com/photo-1512917774080-9991f1c4c750?auto=format&fit=crop&w=800&q=80"
];

const ENGINE_URL = "http://127.0.0.1:8000";

export default function PropertyInspector({ property, onClose }: InspectorProps) {
  const [isCinemaMode, setIsCinemaMode] = useState(false);
  const [currency, setCurrency] = useState<'GHS' | 'USD'>('GHS');
  const [photoIndex, setPhotoIndex] = useState(0);
  const [hasVoted, setHasVoted] = useState(false);

  // 🔄 Image Logic
  const fallbackImage = STOCK_IMAGES[property.id % STOCK_IMAGES.length];
  const [activeImage, setActiveImage] = useState(property.image_url || fallbackImage);

  const gallery = [activeImage, ...STOCK_IMAGES.slice(0, 3)]; // Mock gallery

  // 🧠 Generate Insight once
  const aiInsight = useMemo(() => generateAstaInsight(property), [property]);

  const tags = property.vibe_features 
    ? property.vibe_features.split(',').map(cleanTag).filter(t => t.length > 0)
    : [];

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

  // 🔌 VOTE HANDLER
  const handleVote = async (type: 'good' | 'bad' | 'scam') => {
    try {
        await fetch(`${ENGINE_URL}/api/feedback`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                property_id: property.id,
                vote_type: type
            })
        });
        setHasVoted(true);
    } catch (e) {
        console.error("Voting failed", e);
    }
  };

  return (
    <>
      <motion.div 
        initial={{ x: "100%" }}
        animate={{ x: 0 }}
        exit={{ x: "100%" }}
        transition={{ type: "spring", damping: 25, stiffness: 200 }}
        className="absolute top-0 right-0 h-full w-[400px] bg-asta-deep/95 backdrop-blur-md border-l border-white/10 z-30 shadow-2xl flex flex-col"
      >
        {/* HEADER IMAGE */}
        <div 
          className="relative h-64 bg-gray-800 shrink-0 cursor-zoom-in group overflow-hidden"
          onClick={() => setIsCinemaMode(true)}
        >
          <motion.img 
            key={photoIndex}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            src={gallery[photoIndex]} 
            onError={() => setActiveImage(fallbackImage)}
            alt={property.title}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          <button 
            onClick={(e) => { e.stopPropagation(); onClose(); }}
            className="absolute top-4 left-4 bg-black/50 hover:bg-black/80 text-white w-8 h-8 rounded-full flex items-center justify-center transition-all border border-white/10 z-10"
          >
            ✕
          </button>
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

        {/* CONTENT */}
        <div className="flex-1 overflow-y-auto p-6">
          <div className="mb-6">
            <h2 className="text-xl font-bold text-white leading-tight mb-2">{property.title}</h2>
            <div className="flex items-center gap-2 text-asta-platinum text-sm">
              <MapPin className="w-4 h-4 text-emerald-500" />
              {property.location_name}
            </div>
          </div>

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

          {/* 🧠 ASTA INTELLIGENCE (NOW DYNAMIC) */}
          <div className="mb-6">
             <p className="text-gray-400 text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
               <Brain className="w-3 h-3 text-emerald-500" />
               Asta Intelligence
             </p>
             <p className="text-sm text-gray-400 leading-relaxed italic border-l-2 border-emerald-500 pl-3">
               "{aiInsight}"
             </p>
          </div>
          
          {/* VIBE CHECK */}
          <div className="mb-6 bg-white/5 rounded-lg p-4 border border-white/10">
            <p className="text-gray-400 text-xs uppercase tracking-widest mb-3 flex items-center gap-2">
                <Shield className="w-3 h-3 text-asta-platinum" /> Community Vibe Check
            </p>

            {!hasVoted ? (
                <div className="grid grid-cols-3 gap-2">
                    <button 
                        onClick={() => handleVote('good')}
                        className="flex flex-col items-center gap-1 p-2 rounded hover:bg-emerald-500/20 hover:border-emerald-500/50 border border-transparent transition-all group"
                    >
                        <ThumbsUp className="w-5 h-5 text-gray-500 group-hover:text-emerald-400" />
                        <span className="text-[10px] text-gray-400 group-hover:text-emerald-400 font-bold">LEGIT</span>
                    </button>

                    <button 
                        onClick={() => handleVote('bad')}
                        className="flex flex-col items-center gap-1 p-2 rounded hover:bg-orange-500/20 hover:border-orange-500/50 border border-transparent transition-all group"
                    >
                        <ThumbsDown className="w-5 h-5 text-gray-500 group-hover:text-orange-400" />
                        <span className="text-[10px] text-gray-400 group-hover:text-orange-400 font-bold">SUS</span>
                    </button>

                    <button 
                        onClick={() => handleVote('scam')}
                        className="flex flex-col items-center gap-1 p-2 rounded hover:bg-red-500/20 hover:border-red-500/50 border border-transparent transition-all group"
                    >
                        <AlertTriangle className="w-5 h-5 text-gray-500 group-hover:text-red-400" />
                        <span className="text-[10px] text-gray-400 group-hover:text-red-400 font-bold">SCAM</span>
                    </button>
                </div>
            ) : (
                <div className="flex items-center justify-center gap-2 py-4 text-emerald-400 animate-in fade-in slide-in-from-bottom-2">
                    <CheckCircle2 size={20} />
                    <span className="text-sm font-bold">Signal Recorded.</span>
                </div>
            )}
          </div>

          {/* 🆕 RESET / CLOSE BUTTON */}
          <button 
             onClick={onClose}
             className="w-full flex items-center justify-center gap-2 py-3 rounded-lg border border-white/10 text-gray-400 hover:bg-white/5 hover:text-white transition-all text-[10px] font-bold uppercase tracking-widest group"
          >
             <X size={12} className="group-hover:text-red-400 transition-colors" /> Close Inspector
          </button>
        </div>

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
              <motion.img
                key={photoIndex}
                initial={{ opacity: 0, x: 50 }}
                animate={{ opacity: 1, x: 0 }}
                src={gallery[photoIndex]}
                alt={property.title}
                className="max-w-full max-h-[85vh] object-contain rounded-lg shadow-2xl shadow-emerald-500/10"
              />
              <button onClick={prevPhoto} className="absolute left-4 md:left-10 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all backdrop-blur border border-white/10"><ChevronLeft size={32} /></button>
              <button onClick={nextPhoto} className="absolute right-4 md:right-10 bg-white/10 hover:bg-white/20 p-3 rounded-full text-white transition-all backdrop-blur border border-white/10"><ChevronRight size={32} /></button>
              <div className="absolute bottom-8 text-center bg-black/50 px-6 py-2 rounded-full border border-white/10 backdrop-blur-md">
                <p className="text-white font-bold text-lg">{property.title}</p>
                <p className="text-emerald-400 text-sm font-mono tracking-widest">IMAGE {photoIndex + 1} OF {gallery.length}</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>,
        document.body
      )}
    </>
  );
}
