import React, { useState, useEffect } from 'react';
import { ShieldCheck, AlertTriangle, TrendingUp, Activity, ArrowLeft, Loader2, Map } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useMarketIntel } from '../hooks/useMarketIntel';

// Modules
import MetricCard from './modules/dashboard/MetricCard';
import YieldChart from './modules/dashboard/YieldChart';
import TrustPie from './modules/dashboard/TrustPie';
import AnomalyFeed from './modules/dashboard/AnomalyFeed';
import IntelligenceClocks from './modules/IntelligenceClocks';
import PlatformStats from './modules/dashboard/PlatformStats';
import NeighborhoodLeaderboard from './modules/dashboard/NeighborhoodLeaderboard';

export default function Dashboard() {
  const { totalAssets, avgRent, verifiedCount, trustData, hotNeighborhoods, isLoading } = useMarketIntel();
  
  // FIX: Add a local 'ready' state to delay rendering charts until layout is stable
  const [ready, setReady] = useState(false);

  useEffect(() => {
    // Wait 300ms for the slide-over animation to finish before calculating chart sizes
    const timer = setTimeout(() => setReady(true), 300);
    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="min-h-screen bg-[#050505] flex items-center justify-center text-emerald-500">
        <Loader2 className="animate-spin" size={32} />
      </div>
    );
  }

  // Prevent Recharts "width(-1)" error by showing a loader during animation
  if (!ready) {
    return (
      <div className="min-h-screen bg-[#050505] flex flex-col items-center justify-center text-emerald-500/50 space-y-2">
        <Loader2 className="animate-spin" size={24} />
        <p className="text-xs font-mono uppercase">Stabilizing Market Feed...</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#050505] text-white p-6 font-sans pb-20">
      
      {/* HEADER */}
      <div className="flex items-center justify-between mb-8 border-b border-white/10 pb-4">
        <div>
          <h1 className="text-2xl font-bold tracking-tight">ASTA <span className="text-emerald-500">COMMAND</span></h1>
          <p className="text-xs text-gray-400 font-mono mt-1">INTELLIGENCE LAYER // v3.5 (LIVE)</p>
        </div>
        <Link to="/" className="flex items-center gap-2 text-sm text-gray-400 hover:text-white transition-colors border border-white/10 px-4 py-2 rounded-lg hover:bg-white/5">
          <ArrowLeft size={16} /> Back to Live Map
        </Link>
      </div>

      {/* TOP ROW: PLATFORM STATS */}
      <PlatformStats 
        totalAssets={totalAssets} 
        avgRent={avgRent} 
        verifiedCount={verifiedCount} 
      />

      {/* MIDDLE ROW: GAUGES */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <MetricCard 
           title="Market Pulse" 
           icon={<Activity size={14} />}
           helperTitle="What is Market Pulse?"
           helperText="This gauge measures the velocity of transactions. High heat means properties in this area are renting or selling within 48 hours."
        >
           <IntelligenceClocks type="rent" />
        </MetricCard>

        <MetricCard 
           title="Trust Index" 
           icon={<ShieldCheck size={14} />}
           helperTitle="Community Verification"
           helperText="We aggregate votes from real users. 'Verified' means multiple users have visited and confirmed the property exists."
        >
           <TrustPie data={trustData} />
        </MetricCard>

        <MetricCard 
           title="Anomalies Detected" 
           icon={<AlertTriangle size={14} />}
           helperTitle="Why track Anomalies?"
           helperText="Our AI scans for prices that are unusually high or low for the area, which can indicate potential scams or hidden gems."
        >
           <AnomalyFeed />
        </MetricCard>
      </div>

      {/* BOTTOM ROW: CHARTS + LEADERBOARD */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          
          {/* YIELD CHART (Takes up 2/3 space) */}
          <div className="lg:col-span-2">
            <MetricCard 
                title="Yield Velocity (6 Months)" 
                icon={<TrendingUp size={14} />}
                className="h-80"
                helperTitle="Understanding Yield Velocity"
                helperText="This chart tracks the average rental price trend over time."
            >
                <YieldChart />
            </MetricCard>
          </div>

          {/* HOT ZONES LEADERBOARD (Takes up 1/3 space) */}
          <div className="lg:col-span-1">
             <MetricCard
                title="Hot Zones (Top 5)"
                icon={<Map size={14} />}
                className="h-80"
                helperTitle="Top Neighborhoods"
                helperText="Areas with the highest concentration of listings. High volume often indicates high demand or new development."
             >
                <NeighborhoodLeaderboard data={hotNeighborhoods} />
             </MetricCard>
          </div>
      </div>

    </div>
  );
}
