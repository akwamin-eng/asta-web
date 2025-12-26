import React from 'react';
import { motion } from 'framer-motion';
import { MapPin, ArrowRight, Bed, Bath, Square } from 'lucide-react';

interface Property {
  id: number;
  title: string;
  price: number;
  location_name: string;
  vibe_features: string;
  type: 'sale' | 'rent';
  image_url?: string;
  lat: number;
  long: number;
}

interface ListingCardProps {
  property: Property;
  onClick: () => void;
  isSelected?: boolean;
}

// 🧹 CLEANING UTILITY
const getCleanTags = (raw: string) => {
  if (!raw) return [];
  // Remove brackets [], quotes "", and backslashes
  return raw.replace(/[\[\]"']/g, '')
            .split(',')
            .map(tag => tag.trim()) // Remove extra spaces
            .filter(tag => tag.length > 0) // Remove empty tags
            .slice(0, 3); // Only show first 3 to avoid clutter
};

export default function ListingCard({ property, onClick, isSelected }: ListingCardProps) {
  
  const tags = getCleanTags(property.vibe_features);

  return (
    <motion.div 
      layoutId={`card-${property.id}`}
      onClick={onClick}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95 }}
      whileHover={{ scale: 1.02 }}
      className={`
        relative mb-4 rounded-xl overflow-hidden cursor-pointer group transition-all duration-300
        ${isSelected 
          ? 'ring-2 ring-emerald-500 shadow-2xl shadow-emerald-900/20 bg-white/10' 
          : 'bg-white/5 border border-white/10 hover:border-white/20 hover:bg-white/10'
        }
      `}
    >
      {/* IMAGE SECTION */}
      <div className="h-32 w-full relative overflow-hidden">
        <img 
          src={property.image_url || "https://via.placeholder.com/400x300?text=No+Image"} 
          alt={property.title}
          className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/20 to-transparent" />
        
        {/* PRICE TAG */}
        <div className="absolute bottom-3 left-3 z-10">
          <p className="text-white font-mono font-bold text-lg tracking-tight drop-shadow-md">
            <span className="text-emerald-400">₵</span> 
            {property.price.toLocaleString()}
          </p>
        </div>

        {/* TYPE BADGE */}
        <div className="absolute top-3 right-3 z-10">
          <span className={`
            px-2 py-1 rounded text-[10px] font-bold uppercase tracking-wider text-black shadow-lg
            ${property.type === 'rent' ? 'bg-blue-400' : 'bg-emerald-400'}
          `}>
            {property.type}
          </span>
        </div>
      </div>

      {/* CONTENT SECTION */}
      <div className="p-4">
        {/* Title */}
        <h3 className="text-white font-bold text-sm leading-snug mb-1 line-clamp-1 group-hover:text-emerald-400 transition-colors">
          {property.title}
        </h3>
        
        {/* Location */}
        <div className="flex items-center gap-1.5 mb-3">
          <MapPin size={12} className="text-gray-500" />
          <p className="text-gray-400 text-xs font-medium truncate">{property.location_name}</p>
        </div>

        {/* 🆕 CLEAN TAGS */}
        <div className="flex flex-wrap gap-1.5">
          {tags.map((tag, i) => (
            <span 
              key={i} 
              className="px-1.5 py-0.5 rounded-md bg-white/5 border border-white/10 text-[9px] text-gray-300 font-medium uppercase tracking-wide group-hover:border-white/20 transition-colors"
            >
              {tag}
            </span>
          ))}
        </div>

        {/* Arrow (Only visible on hover) */}
        <div className="absolute bottom-3 right-3 opacity-0 group-hover:opacity-100 transition-all transform translate-x-2 group-hover:translate-x-0">
          <div className="bg-emerald-500 rounded-full p-1.5 text-black shadow-lg">
             <ArrowRight size={12} />
          </div>
        </div>
      </div>
    </motion.div>
  );
}
