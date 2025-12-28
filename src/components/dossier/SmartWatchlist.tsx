import React from "react";
import {
  Eye,
  MapPin,
  TrendingUp,
  Trash2,
  ExternalLink,
  ArrowRight,
} from "lucide-react";
import type { WatchlistItem } from "../../types/asta_types";

interface SmartWatchlistProps {
  items: WatchlistItem[];
  onRemove: (id: number) => void;
}

export default function SmartWatchlist({
  items,
  onRemove,
}: SmartWatchlistProps) {
  if (!items || items.length === 0) {
    return (
      <div className="bg-[#111] border border-white/10 rounded-xl p-6 h-full flex flex-col items-center justify-center text-center">
        <div className="w-12 h-12 bg-white/5 rounded-full flex items-center justify-center mb-4">
          <Eye size={20} className="text-gray-600" />
        </div>
        <h3 className="text-sm font-bold text-gray-400 uppercase tracking-widest">
          Watchlist Empty
        </h3>
        <p className="text-[10px] text-gray-600 mt-2 max-w-[200px]">
          Tag assets with "High Interest" to track their yield velocity here.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-[#111] border border-white/10 rounded-xl flex flex-col h-full overflow-hidden">
      {/* HEADER */}
      <div className="p-4 border-b border-white/10 flex justify-between items-center bg-white/5">
        <h3 className="text-xs font-bold text-white uppercase tracking-widest flex items-center gap-2">
          <Eye size={12} className="text-emerald-500" />
          Active Targets ({items.length})
        </h3>
      </div>

      {/* LIST */}
      <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-2">
        {items.map((item) => {
          const priceChange = item.current_price - item.original_price;
          const isPositive = priceChange >= 0;

          return (
            <div
              key={item.id}
              className="group bg-black/40 border border-white/5 hover:border-emerald-500/30 rounded-lg p-3 transition-all relative overflow-hidden"
            >
              <div className="flex gap-3">
                {/* THUMBNAIL */}
                <div className="w-16 h-16 rounded bg-gray-800 flex-shrink-0 overflow-hidden relative">
                  {item.image_url ? (
                    <img
                      src={item.image_url}
                      alt="Asset"
                      className="w-full h-full object-cover opacity-80 group-hover:opacity-100 transition-opacity"
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center bg-white/5">
                      <MapPin size={16} className="text-gray-600" />
                    </div>
                  )}
                </div>

                {/* DETAILS */}
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start">
                    <h4 className="text-xs font-bold text-gray-200 truncate pr-4">
                      {item.title}
                    </h4>
                    <button
                      onClick={() => onRemove(item.id)}
                      className="text-gray-600 hover:text-red-500 transition-colors"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>

                  <p className="text-[10px] text-gray-500 flex items-center gap-1 mt-1 font-mono">
                    <MapPin size={8} /> {item.location}
                  </p>

                  <div className="mt-2 flex items-center justify-between">
                    <span className="text-xs font-mono text-emerald-400">
                      ₵{item.current_price.toLocaleString()}
                    </span>

                    {/* ACTIONS */}
                    <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button
                        onClick={() =>
                          window.open(`/listing/${item.property_id}`, "_blank")
                        }
                        className="p-1.5 hover:bg-blue-500/20 text-gray-400 hover:text-blue-400 rounded"
                        title="View Asset"
                      >
                        <ExternalLink size={12} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
