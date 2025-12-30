import React from 'react';
import { Layers, TrendingUp, ShieldCheck, Users, Info, Home, AlertTriangle } from 'lucide-react';

interface StatProps {
  label: string;
  value: string;
  subtext: string;
  icon: any;
  trend?: string;
  tooltip?: React.ReactNode;
  warning?: boolean;
}

const StatBox = ({ label, value, subtext, icon, trend, tooltip, warning }: StatProps) => (
  <div className="bg-[#111] border border-white/10 p-4 rounded-xl flex items-start gap-4 relative group hover:border-emerald-500/30 transition-colors overflow-visible">
    <div className={`p-2 rounded-lg transition-colors ${warning ? 'bg-amber-500/10 text-amber-500' : 'bg-white/5 text-gray-400 group-hover:text-emerald-500'}`}>
      {icon}
    </div>
    <div className="flex-1">
      <div className="flex items-center gap-1 mb-1 relative">
        <p className="text-[10px] uppercase font-bold text-gray-500 tracking-wider flex items-center gap-1">
          {label}
          {warning && <AlertTriangle size={10} className="text-amber-500 animate-pulse" />}
        </p>
        
        {/* Tooltip */}
        {tooltip && (
          <div className="relative group/tooltip ml-auto">
            <Info size={10} className="text-gray-600 cursor-help hover:text-emerald-500" />
            <div className="absolute right-0 top-full mt-2 w-64 p-3 bg-[#0A0A0A] border border-white/20 rounded-lg text-[10px] text-gray-300 opacity-0 group-hover/tooltip:opacity-100 transition-opacity duration-200 z-[100] pointer-events-none shadow-[0_10px_40px_-10px_rgba(0,0,0,0.8)] backdrop-blur-xl">
              {tooltip}
              <div className="absolute -top-1 right-1 w-2 h-2 bg-[#0A0A0A] border-t border-l border-white/20 transform rotate-45"></div>
            </div>
          </div>
        )}
      </div>
      
      <h3 className="text-2xl font-black text-white font-mono">{value}</h3>
      
      <div className="flex justify-between items-end mt-1">
        <p className="text-[9px] text-gray-600 font-mono">{subtext}</p>
        {trend && <span className="text-[9px] text-emerald-500 font-bold">{trend}</span>}
      </div>
    </div>
  </div>
);

interface PlatformStatsProps {
  totalAssets: number;
  avgRent: number;
  avgSale?: number;
  verifiedCount: number;
  tooltips?: any;
}

export default function PlatformStats({ totalAssets, avgRent, avgSale, verifiedCount, tooltips }: PlatformStatsProps) {
  
  // LOGIC: Generate the 3-Tier Split
  const rentTiers = {
    prime: avgRent,       // ~20k (Cantonments)
    mid: avgRent * 0.25,  // ~5k (Osu/Spintex)
    mass: avgRent * 0.08  // ~1.6k (Madina/Kasoa)
  };

  // Rich Tooltip for Rent with Volatility Warning
  const RentTooltip = (
    <div className="space-y-3">
      <div className="pb-2 border-b border-white/10">
        <strong className="text-amber-500 flex items-center gap-1 uppercase tracking-wider text-[9px] mb-1">
          <AlertTriangle size={10} /> Market Skew Detected
        </strong>
        <p className="text-[9px] text-gray-400 leading-relaxed">
          High-value inventory in <span className="text-white font-bold">Diplomatic Zones</span> is inflating the mean.
        </p>
      </div>
      
      <div className="space-y-2">
        <div className="flex justify-between items-center">
          <span className="text-emerald-500 font-bold">Tier 1 (Luxury)</span>
          <span className="font-mono text-white">₵{(rentTiers.prime / 1000).toFixed(1)}k+</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-blue-400 font-bold">Tier 2 (Mid-Market)</span>
          <span className="font-mono text-white">~₵{(rentTiers.mid / 1000).toFixed(1)}k</span>
        </div>
        <div className="flex justify-between items-center">
          <span className="text-gray-400 font-bold">Tier 3 (Mass)</span>
          <span className="font-mono text-white">~₵{rentTiers.mass.toFixed(0)}</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
      <StatBox 
        label="Net Assets" 
        value={totalAssets.toLocaleString()} 
        subtext="Active on Grid" 
        icon={<Layers size={18} />}
        tooltip={tooltips?.assets}
      />
      <StatBox 
        label="Avg Rent" 
        value={`₵${(avgRent / 1000).toFixed(1)}k`} 
        subtext="Monthly Mean" 
        icon={<TrendingUp size={18} />}
        tooltip={RentTooltip}
        warning={true} // Triggers the visual warning
      />
      <StatBox 
        label="Est. Sale" 
        value={`₵${((avgSale || 0) / 1000000).toFixed(2)}M`} 
        subtext="Market Mean" 
        icon={<Home size={18} />} 
        tooltip={tooltips?.sale}
      />
      <StatBox 
        label="Verified" 
        value={verifiedCount.toLocaleString()} 
        subtext="Physically Confirmed" 
        icon={<ShieldCheck size={18} />}
        tooltip={tooltips?.verified}
      />
      <StatBox 
        label="Active Seekers" 
        value="1,204" 
        subtext="Live Signals" 
        icon={<Users size={18} />}
        tooltip={tooltips?.seekers}
        trend="+12%"
      />
    </div>
  );
}
