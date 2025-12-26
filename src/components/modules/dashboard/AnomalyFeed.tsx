import React from 'react';
import { AlertTriangle } from 'lucide-react';

export default function AnomalyFeed() {
  return (
    <div className="space-y-3 overflow-y-auto max-h-[150px] scrollbar-hide">
      {[1,2,3].map((_, i) => (
        <div key={i} className="flex items-center gap-3 p-2 hover:bg-white/5 rounded transition-colors cursor-pointer border border-transparent hover:border-white/5">
           <div className="w-8 h-8 shrink-0 rounded bg-red-500/10 flex items-center justify-center text-red-500">
              <AlertTriangle size={14} />
           </div>
           <div>
              <p className="text-xs font-bold text-gray-200">Price Deviation (+15%)</p>
              <p className="text-[10px] text-gray-500">East Legon • 2 mins ago</p>
           </div>
        </div>
      ))}
    </div>
  );
}
