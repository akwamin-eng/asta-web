import React from 'react';
import { TrendingUp, BarChart3, ArrowUpRight } from 'lucide-react';

interface IntelligenceClocksProps {
  type: 'rent' | 'sale';
}

export default function IntelligenceClocks({ type }: IntelligenceClocksProps) {
  // Mock Data (will be real later)
  const yieldRate = type === 'rent' ? '8-12%' : '15% p.a.';
  const demandScore = 'High'; 

  return (
    <div className="grid grid-cols-2 gap-3 mb-6">
      {/* Metric 1: Yield */}
      <div className="bg-white/5 border border-white/10 p-3 rounded-lg relative overflow-hidden group hover:border-emerald-500/30 transition-colors">
        <div className="absolute right-0 top-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
          <TrendingUp size={40} />
        </div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Proj. Yield</p>
        <p className="text-xl font-bold text-white mt-1 flex items-center gap-1">
          {yieldRate} <ArrowUpRight size={14} className="text-emerald-500" />
        </p>
      </div>
      
      {/* Metric 2: Market Heat */}
      <div className="bg-white/5 border border-white/10 p-3 rounded-lg relative overflow-hidden group hover:border-orange-500/30 transition-colors">
        <div className="absolute right-0 top-0 p-2 opacity-10 group-hover:opacity-20 transition-opacity">
          <BarChart3 size={40} />
        </div>
        <p className="text-[10px] text-gray-400 uppercase tracking-wider font-bold">Market Heat</p>
        <div className="flex items-center gap-2 mt-2">
          <span className="text-xl font-bold text-orange-400">{demandScore}</span>
          <div className="flex flex-col gap-0.5">
            <span className="w-8 h-0.5 bg-orange-500 rounded-full opacity-100"></span>
            <span className="w-8 h-0.5 bg-orange-500 rounded-full opacity-60"></span>
            <span className="w-8 h-0.5 bg-orange-500 rounded-full opacity-30"></span>
          </div>
        </div>
      </div>
    </div>
  );
}
