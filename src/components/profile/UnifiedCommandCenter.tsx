import React from 'react';
import { motion } from 'framer-motion';
import { X, Activity, Layout, ShieldCheck, Zap } from 'lucide-react';
import IdentityModule from './IdentityModule';
import SmartWatchlist from './SmartWatchlist';
import HunterPreferences from './HunterPreferences';
import Dashboard from '../Dashboard'; // Importing your standalone Dashboard
import { useProfile } from '../../hooks/useProfile';
import { Loader2 } from 'lucide-react';

interface UCCProps {
  onClose: () => void;
}

export default function UnifiedCommandCenter({ onClose }: UCCProps) {
  const { profile, watchlist, preferences, loading, updatePreferences, removeFromWatchlist } = useProfile();

  if (loading) {
    return (
      <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center">
        <Loader2 className="w-10 h-10 text-emerald-500 animate-spin" />
      </div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 z-[100] bg-asta-deep/90 backdrop-blur-xl flex flex-col overflow-hidden font-sans"
    >
      {/* --- TOP HUD (Heads-Up Display) --- */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/40">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <h1 className="text-white font-bold tracking-tighter text-lg uppercase">Unified Command Center</h1>
          </div>
          <nav className="hidden md:flex items-center gap-4 border-l border-white/10 pl-6">
            <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
              <Activity size={12} /> SYSTEM: OPTIMAL
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono uppercase tracking-widest">
              Role: {profile?.rank_title || 'Observer'}
            </div>
          </nav>
        </div>

        <button 
          onClick={onClose}
          className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all"
        >
          <X size={24} />
        </button>
      </header>

      {/* --- MAIN GRID LAYOUT --- */}
      <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          
          {/* COLUMN 1: IDENTITY & TARGETS (3 Cols) */}
          <div className="lg:col-span-3 space-y-6">
            <section className="h-fit">
              <IdentityModule profile={profile!} />
            </section>
            <section className="h-fit">
              <HunterPreferences 
                preferences={preferences} 
                onUpdate={updatePreferences} 
              />
            </section>
          </div>

          {/* COLUMN 2: MARKET ANALYSIS - THE BLACK BOX (6 Cols) */}
          <div className="lg:col-span-6 space-y-6">
            <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden flex flex-col h-full min-h-[700px]">
              <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                  <Layout size={12} /> Market Intelligence Engine
                </span>
                <span className="text-[10px] font-mono text-emerald-500">LIVE_FEED_01</span>
              </div>
              <div className="flex-1 overflow-auto p-2 custom-scrollbar">
                 {/* INJECTING THE STANDALONE DASHBOARD HERE */}
                 <Dashboard />
              </div>
            </div>
          </div>

          {/* COLUMN 3: ASSET TRACKING (3 Cols) */}
          <div className="lg:col-span-3 h-full">
            <section className="h-full">
              <SmartWatchlist 
                items={watchlist} 
                onRemove={removeFromWatchlist} 
              />
            </section>
          </div>

        </div>
      </main>

      {/* --- BOTTOM STATUS BAR --- */}
      <footer className="h-8 bg-emerald-500/10 border-t border-emerald-500/20 px-6 flex items-center justify-between">
        <div className="flex gap-4">
          <span className="text-[9px] text-emerald-400/70 font-mono uppercase tracking-widest">
            Encryption: AES-256
          </span>
          <span className="text-[9px] text-emerald-400/70 font-mono uppercase tracking-widest">
            DB_Lat: 12ms
          </span>
        </div>
        <div className="text-[9px] text-emerald-400 font-mono uppercase">
          Asta Protocol v5.0.1 // {new Date().toLocaleDateString()}
        </div>
      </footer>
    </motion.div>
  );
}
