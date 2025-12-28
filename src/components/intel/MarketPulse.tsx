import React from 'react';
import { Activity, TrendingUp, TrendingDown, BarChart3, AlertCircle } from 'lucide-react';
import { getMarketAnalysis } from '../../lib/market_data';

export default function MarketPulse({ property }: { property: any }) {
  const analysis = getMarketAnalysis(property);
  
  // Format currency
  const fmt = (n: number) => 
    '₵' + n.toLocaleString(undefined, { maximumFractionDigits: 0 });

  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-4 mt-4">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-xs font-bold text-white uppercase tracking-wider flex items-center gap-2">
          <Activity size={14} className="text-emerald-500" /> Market Pulse
        </h3>
        <span className="text-[9px] text-gray-500 font-mono">VS. {analysis.zone.toUpperCase()} AVG</span>
      </div>

      {/* PRICE METER */}
      <div className="mb-4">
        <div className="flex justify-between text-xs mb-1.5">
          <span className="text-gray-400">Analysis Verdict:</span>
          <span className={`font-bold font-mono ${analysis.color}`}>{analysis.verdict}</span>
        </div>
        
        {/* Visual Bar */}
        <div className="relative h-2 bg-gray-800 rounded-full overflow-hidden">
          {/* Center Marker (Fair Value) */}
          <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-white/20 z-10" />
          
          {/* Variance Bar */}
          <div 
            className={`absolute top-0 bottom-0 transition-all duration-500 ${analysis.barColor}`}
            style={{ 
              left: '50%', 
              width: `${Math.min(Math.abs(analysis.variance), 50)}%`,
              transform: analysis.variance < 0 ? 'translateX(-100%)' : 'none'
            }} 
          />
        </div>
        
        <div className="flex justify-between mt-1 text-[9px] text-gray-600 font-mono">
          <span>-50%</span>
          <span>Fair Value</span>
          <span>+50%</span>
        </div>
      </div>

      {/* DATA GRID */}
      <div className="grid grid-cols-2 gap-2">
        <div className="bg-white/5 rounded p-2 border border-white/5">
          <div className="text-[9px] text-gray-400 uppercase mb-1">Predicted Value</div>
          <div className="text-sm font-mono text-white font-bold">{fmt(analysis.predictedPrice)}</div>
          <div className="text-[9px] text-gray-500 mt-0.5">Based on {property.details?.bedrooms || 2}-Bed Avg</div>
        </div>

        <div className="bg-white/5 rounded p-2 border border-white/5">
          <div className="text-[9px] text-gray-400 uppercase mb-1 flex items-center gap-1">
             Zone Growth <TrendingUp size={10} />
          </div>
          <div className="text-sm font-mono text-emerald-400 font-bold">+{analysis.growth_rate}%</div>
          <div className="text-[9px] text-gray-500 mt-0.5">Year-over-Year</div>
        </div>
      </div>

      {/* ADVISORY FOOTER */}
      {Math.abs(analysis.variance) > 20 && (
        <div className="mt-3 flex gap-2 items-start bg-blue-500/10 p-2 rounded border border-blue-500/20">
          <AlertCircle size={12} className="text-blue-400 shrink-0 mt-0.5" />
          <p className="text-[10px] text-blue-200 leading-tight">
            {analysis.variance > 0 
              ? "Property is significantly above market average. Verify if luxury amenities justify the premium." 
              : "Price is unusually low. Recommended: Request Scout Report to verify condition."}
          </p>
        </div>
      )}
    </div>
  );
}
