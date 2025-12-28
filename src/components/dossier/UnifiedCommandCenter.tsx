import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Activity, Layout, Mail, Loader2 } from "lucide-react";
import IdentityModule from "./IdentityModule";
import SmartWatchlist from "./SmartWatchlist";
import HunterPreferences from "./HunterPreferences";
import Dashboard from "../Dashboard";
import SecureInbox from "./SecureInbox";
import OnboardingModule from './OnboardingModule';
import { useProfile } from "../../hooks/useProfile";
import { useHunterIntel } from "../../hooks/useHunterIntel";

interface UCCProps {
  onClose: () => void;
}

export default function UnifiedCommandCenter({ onClose }: UCCProps) {
  const {
    profile,
    watchlist,
    preferences,
    loading,
    updatePreferences,
    removeFromWatchlist,
  } = useProfile();

  // FETCH INTEL + MARK AS READ FUNCTION
  const { messages, loading: intelLoading, markAsRead } = useHunterIntel(profile);

  // CALCULATE UNREAD COUNT (Dynamic)
  const unreadCount = messages.filter(m => m.status === 'unread').length;
  const hasUnread = unreadCount > 0;

  const [viewMode, setViewMode] = useState<"dashboard" | "comms">("dashboard");
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    if (profile && !loading) {
      if (!profile.full_name || profile.full_name === 'Lead Scout' || profile.full_name === 'Observer') {
        setShowOnboarding(true);
      }
    }
  }, [profile, loading]);

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
      className="fixed inset-0 z-[100] bg-[#050505]/95 backdrop-blur-xl flex flex-col overflow-hidden font-sans"
    >
      <AnimatePresence>
        {showOnboarding && (
          <OnboardingModule 
            currentName={profile?.full_name || ''} 
            onComplete={() => setShowOnboarding(false)} 
          />
        )}
      </AnimatePresence>

      {/* --- HEADER --- */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/40 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
            <h1 className="text-white font-bold tracking-tighter text-sm md:text-lg uppercase">
              Unified Command Center
            </h1>
          </div>

          <div className="flex bg-white/5 rounded-lg p-1 border border-white/10">
            <button
              onClick={() => setViewMode("dashboard")}
              className={`px-3 md:px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                viewMode === "dashboard"
                  ? "bg-emerald-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Layout size={12} />{" "}
              <span className="hidden xs:inline">Dashboard</span>
            </button>
            
            <div className="relative">
              <button
                onClick={() => setViewMode("comms")}
                className={`relative px-3 md:px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  viewMode === "comms"
                    ? "bg-blue-600 text-white shadow-lg"
                    : hasUnread 
                      ? "bg-blue-900/30 text-blue-400 border border-blue-500/50 shadow-[0_0_15px_rgba(59,130,246,0.5)] animate-pulse"
                      : "text-gray-400 hover:text-white"
                }`}
              >
                <Mail size={12} />{" "}
                <span className="hidden xs:inline">Comms Link</span>
                
                {hasUnread && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border border-black shadow-sm font-mono animate-bounce">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <nav className="hidden md:flex items-center gap-4 border-r border-white/10 pr-6">
            <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
              <Activity size={12} /> SYSTEM: OPTIMAL
            </div>
            <div className="flex items-center gap-2 text-[10px] text-gray-400 font-mono uppercase tracking-widest">
              ID: {profile?.id?.slice(0, 8) || "GHOST"}
            </div>
          </nav>
          <button
            onClick={onClose}
            className="p-2 hover:bg-white/10 rounded-full text-gray-400 hover:text-white transition-all"
          >
            <X size={24} />
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto p-6 scrollbar-hide">
        <div className="max-w-[1600px] mx-auto grid grid-cols-1 lg:grid-cols-12 gap-6">
          <div className="lg:col-span-3 space-y-6">
            <div className="h-fit">
              <IdentityModule profile={profile} />
            </div>
            <div className="min-h-[400px]">
              <HunterPreferences
                preferences={preferences}
                onUpdate={updatePreferences}
              />
            </div>
          </div>

          <div className="lg:col-span-6 space-y-6">
            <div className="bg-black/40 border border-white/10 rounded-xl overflow-hidden flex flex-col h-[700px] relative">
              {viewMode === "dashboard" ? (
                <>
                  <div className="p-4 bg-white/5 border-b border-white/10 flex justify-between items-center">
                    <span className="text-[10px] font-bold text-gray-400 uppercase tracking-widest flex items-center gap-2">
                      <Layout size={12} /> Market Intelligence Engine
                    </span>
                    <span className="text-[10px] font-mono text-emerald-500 animate-pulse">
                      LIVE_FEED_01
                    </span>
                  </div>
                  <div className="flex-1 w-full relative">
                    <div className="absolute inset-0 p-2 overflow-auto custom-scrollbar">
                      <Dashboard />
                    </div>
                  </div>
                </>
              ) : (
                // PASS DOWN markAsRead
                <SecureInbox 
                  messages={messages} 
                  loading={intelLoading} 
                  onRead={markAsRead} 
                />
              )}
            </div>
          </div>

          <div className="lg:col-span-3 h-full">
            <div className="h-full">
              <SmartWatchlist
                items={watchlist}
                onRemove={removeFromWatchlist}
              />
            </div>
          </div>
        </div>
      </main>
    </motion.div>
  );
}
