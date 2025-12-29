import React from 'react';
import { Building2, Users, CheckCircle, Wallet } from 'lucide-react';

interface PlatformStatsProps {
  totalAssets?: number;
  avgRent?: number;
  verifiedCount?: number;
}

export default function PlatformStats({ totalAssets = 0, avgRent = 0, verifiedCount = 0 }: PlatformStatsProps) {
  // 🛡️ Safe Format Function
  const format = (n: number | undefined | null) => {
    if (n === undefined || n === null || isNaN(n)) return "0";
    return n.toLocaleString();
  };

  const STATS = [
    { label: 'Total Assets Tracked', value: format(totalAssets), change: 'LIVE', icon: <Building2 size={16} className="text-blue-400" /> },
    { label: 'Avg. Rent (Accra)', value: `₵${format(avgRent)}`, change: 'EST', icon: <Wallet size={16} className="text-emerald-400" /> },
    { label: 'Verified Locations', value: format(verifiedCount), change: 'TRUST', icon: <CheckCircle size={16} className="text-purple-400" /> },
    { label: 'Active Seekers', value: '124', change: '24h', icon: <Users size={16} className="text-orange-400" /> },
  ];

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
      {STATS.map((stat, i) => (
        <div key={i} className="bg-white/5 border border-white/10 rounded-lg p-4 flex flex-col justify-between group hover:border-white/20 transition-colors">
          <div className="flex items-start justify-between mb-2">
            <span className="text-[10px] uppercase tracking-wider text-gray-500 font-bold">{stat.label}</span>
            <div className="bg-white/5 p-1.5 rounded-md opacity-70 group-hover:opacity-100 transition-opacity">
              {stat.icon}
            </div>
          </div>
          <div className="flex items-end justify-between">
             <span className="text-2xl font-mono text-white font-medium">{stat.value}</span>
             <span className="text-xs font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">
               {stat.change}
             </span>
          </div>
        </div>
      ))}
    </div>
  );
}
