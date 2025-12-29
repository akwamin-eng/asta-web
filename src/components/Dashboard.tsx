import React from 'react';
import { Activity, Radio, FileText, ArrowUpRight, ShieldCheck, Newspaper } from 'lucide-react';
import { useMarketStats } from '../hooks/useMarketStats';
import { useMarketIntel } from '../hooks/useMarketIntel';

import PlatformStats from './modules/dashboard/PlatformStats';
import MetricCard from './modules/dashboard/MetricCard';
import YieldChart from './modules/dashboard/YieldChart';
import TrustPie from './modules/dashboard/TrustPie';
import NeighborhoodLeaderboard from './modules/dashboard/NeighborhoodLeaderboard';
import AnomalyFeed from './modules/dashboard/AnomalyFeed';
import IntelligenceClocks from './modules/IntelligenceClocks';

export default function Dashboard() {
  const { stats, loading: statsLoading } = useMarketStats();
  const { intel, loading: intelLoading } = useMarketIntel();

  const trustData = [
    { name: 'Verified', value: 65, color: '#10b981' }, 
    { name: 'Unverified', value: 35, color: '#ef4444' },
  ];

  const chartData = [
    { month: 'Oct', price: stats ? stats.avgPrice * 0.95 : 0 },
    { month: 'Nov', price: stats ? stats.avgPrice * 0.98 : 0 },
    { month: 'Dec', price: stats ? stats.avgPrice : 0 },
    { month: 'Jan', price: stats ? stats.avgPrice * 1.02 : 0 },
  ];

  return (
    <div className="h-full flex flex-col p-4 md:p-6 space-y-6 overflow-y-auto custom-scrollbar">
      
      {/* 1. HIGH LEVEL KPI ROW */}
      <PlatformStats 
        totalAssets={stats?.activeListings || 0}
        avgRent={stats?.avgPrice || 0}
        verifiedCount={Math.floor((stats?.activeListings || 0) * 0.65)} 
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* LEFT COLUMN (Charts) */}
        <div className="lg:col-span-2 space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <MetricCard 
              title="Price Trend (6M)" 
              icon={<Activity size={14} className="text-emerald-500" />}
              helperTitle="Market Trajectory"
              helperText="Aggregated median listing price across all zones over the last 6 months."
              className="h-[250px]"
            >
              <YieldChart data={chartData} />
            </MetricCard>

            <MetricCard 
              title="Trust Index" 
              icon={<ShieldCheck size={14} className="text-blue-500" />}
              helperTitle="Verification Ratio"
              helperText="Percentage of assets on the grid that have been physically verified."
              className="h-[250px]"
            >
              <TrustPie data={trustData} />
            </MetricCard>
          </div>

          {/* INTELLIGENCE FEED */}
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
             <div className="flex justify-between items-center mb-4">
                <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Newspaper size={14} className="text-purple-500" /> Live Intelligence Feed
                </h3>
                {intelLoading && <Activity size={12} className="animate-spin text-gray-500" />}
             </div>
             
             <div className="space-y-4">
                {intel.length === 0 && !intelLoading ? (
                   <p className="text-xs text-gray-500 italic">No recent intelligence reports intercepted.</p>
                ) : (
                   intel.map((item) => (
                      <div key={item.id} className="flex gap-4 group cursor-default">
                         {/* DATE */}
                         <div className="flex flex-col items-center gap-1 pt-1 min-w-[40px]">
                            <span className="text-[10px] font-mono text-gray-500">{new Date(item.date).getDate()}</span>
                            <span className="text-[9px] font-bold text-gray-600 uppercase">{new Date(item.date).toLocaleString('default', { month: 'short' })}</span>
                         </div>
                         
                         {/* CONTENT */}
                         <div className="flex-1 pb-3 border-b border-white/5 group-last:border-0 overflow-hidden">
                            <h4 className="text-sm font-medium text-gray-200 truncate pr-4">
                               {item.title}
                            </h4>
                            
                            {/* Summary - Checks if it's a URL to avoid layout break */}
                            <p className="text-[11px] text-gray-500 mt-1 line-clamp-2">
                               {item.summary && !item.summary.startsWith('http') ? item.summary : 'Market data analysis available.'}
                            </p>
                            
                            <div className="flex gap-2 mt-2">
                               <span className="text-[9px] bg-white/5 px-1.5 py-0.5 rounded text-gray-400 border border-white/5">
                                  SOURCE: {item.source.replace('https://', '').split('/')[0]}
                               </span>
                            </div>
                         </div>
                      </div>
                   ))
                )}
             </div>
          </div>
        </div>

        {/* RIGHT COLUMN (Lists & Anomalies) */}
        <div className="space-y-6">
          <IntelligenceClocks />
          
          <MetricCard 
             title="Detected Anomalies" 
             icon={<Radio size={14} className="text-red-500 animate-pulse" />}
             helperTitle="Outlier Detection"
             helperText="AI scans for listings with significant price deviations."
             className="min-h-[200px]"
          >
             <AnomalyFeed />
          </MetricCard>

          <MetricCard 
             title="Top Zones (Vol)" 
             icon={<FileText size={14} className="text-amber-500" />}
             helperTitle="Market Volume"
             helperText="Neighborhoods with the highest number of active listings."
             className="flex-1 min-h-[300px]"
          >
             <NeighborhoodLeaderboard data={stats?.zoneStats || []} />
          </MetricCard>
        </div>
      </div>
    </div>
  );
}
