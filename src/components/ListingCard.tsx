import React from 'react';
import { motion } from 'framer-motion';

interface Property {
  id: number;
  title: string;
  price: number;
  location_name: string;
  type: 'sale' | 'rent';
  image_url?: string;
  vibe_features: string;
}

interface ListingCardProps {
  property: Property;
  onClick: () => void;
  isSelected: boolean;
}

export default function ListingCard({ property, onClick, isSelected }: ListingCardProps) {
  return (
    <motion.div 
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      layout
      onClick={onClick}
      className={`
        relative p-4 mb-3 rounded-xl cursor-pointer border transition-all duration-200
        ${isSelected 
          ? 'bg-asta-platinum/10 border-asta-platinum shadow-lg shadow-asta-platinum/10' 
          : 'bg-white/5 border-transparent hover:bg-white/10 hover:border-white/20'}
      `}
    >
      <div className="flex justify-between items-start mb-2">
        <div className="flex items-center gap-2">
          <span className={`w-2 h-2 rounded-full ${property.type === 'rent' ? 'bg-blue-400' : 'bg-emerald-400'}`}></span>
          <span className="text-[10px] uppercase tracking-wider font-bold text-gray-400">
            {property.type}
          </span>
        </div>
        <span className="text-emerald-400 font-mono font-bold text-sm">
          ₵{(property.price / 1000).toFixed(0)}k
        </span>
      </div>

      <div className="flex gap-3">
        <div className="h-16 w-16 flex-shrink-0 bg-gray-700 rounded-lg overflow-hidden">
          <img 
            src={property.image_url || "https://via.placeholder.com/150?text=Asta"} 
            alt={property.title}
            className="h-full w-full object-cover"
          />
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-white font-semibold text-sm truncate">{property.title}</h3>
          <p className="text-gray-400 text-xs truncate mb-1">{property.location_name}</p>
          
          <div className="flex flex-wrap gap-1">
            {property.vibe_features?.split(',').slice(0, 2).map((tag, i) => (
              <span key={i} className="px-1.5 py-0.5 bg-white/5 rounded text-[9px] text-gray-300 border border-white/10">
                {tag.trim()}
              </span>
            ))}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
