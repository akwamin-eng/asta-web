import React from 'react';
import { TrendingDown, TrendingUp, AlertTriangle, CheckCircle, ExternalLink, Trash2 } from 'lucide-react';
import type { WatchlistItem } from '../../types/asta_types';

interface SmartWatchlistProps {
  items: WatchlistItem[];
  onRemove: (id: number) => void;
}

export default function SmartWatchlist({ items, onRemove }: SmartWatchlistProps) {
  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-6 h-full flex flex-col">
      <h3 className="text-lg font-bold text-white mb-6">Live Watchlist</h3>
      <div className="flex-1 overflow-y-auto space-y-3">
        {items.map((item) => (
          <div key={item.id} className="bg-black/40 border border-white/5 rounded-lg p-3 flex justify-between">
            <span className="text-sm text-gray-200">{item.title}</span>
            <span className="text-sm font-mono text-emerald-400">₵{item.current_price.toLocaleString()}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
