import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Activity, Layout, Mail, Loader2, Map as MapIcon, ChevronLeft } from "lucide-react";
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
  initialSection?: 'dashboard' | 'hunter';
}

export default function UnifiedCommandCenter({ onClose, initialSection = 'dashboard' }: UCCProps) {
  const {
    profile,
    watchlist,
    preferences,
    loading,
    updatePreferences,
    removeFromWatchlist,
  } = useProfile();

  const { messages, loading: intelLoading, markAsRead } = useHunterIntel(profile);

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
      className="fixed inset-0 z-[100] bg-[#050505]/98 backdrop-blur-3xl flex flex-col overflow-hidden font-sans"
    >
      <style>{`
        .tactical-grid {
          background-size: 40px 40px;
          background-image: linear-gradient(to right, rgba(16, 185, 129, 0.08) 1px, transparent 1px),
                            linear-gradient(to bottom, rgba(16, 185, 129, 0.08) 1px, transparent 1px);
        }
        .scan-line {
          width: 100%;
          height: 100px;
          background: linear-gradient(to bottom, transparent, rgba(16, 185, 129, 0.1), transparent);
          position: absolute;
          left: 0;
          right: 0;
          animation: scan 8s linear infinite;
          z-index: 2;
          pointer-events: none;
        }
        @keyframes scan {
          0% { top: -100px }
          100% { top: 100% }
        }
      `}</style>

      <AnimatePresence>
        {showOnboarding && (
          <OnboardingModule 
            currentName={profile?.full_name || ''} 
            onComplete={() => setShowOnboarding(false)} 
          />
        )}
      </AnimatePresence>

      {/* --- HEADER --- */}
      <header className="h-20 border-b border-white/10 flex items-center justify-between px-8 bg-black/60 shrink-0 z-50">
        <div className="flex items-center gap-8">
          <div className="flex items-center gap-4">
            <div className="relative">
              <img src="/logo.png" alt="Asta" className="h-8 w-auto brightness-110" />
              <div className="absolute -inset-1 bg-emerald-500/20 blur-md rounded-full -z-10" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-white font-black tracking-[0.1em] text-lg uppercase flex items-center gap-2">
                  Unified Command Intelligence
                </h1>
                <span className="text-[8px] bg-emerald-500/20 text-emerald-500 px-1.5 py-0.5 rounded border border-emerald-500/30 font-mono">
                  v3.5_LIVE
                </span>
              </div>
              <p className="text-[9px] text-gray-500 font-mono tracking-widest uppercase">
                Asta Command Intelligence Layer // Security_Level: {profile?.rank_title || 'RECRUIT'}
              </p>
            </div>
          </div>

          <div className="flex bg-white/5 rounded-lg p-1 border border-white/10 ml-4">
            <button
              onClick={() => setViewMode("dashboard")}
              className={`px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                viewMode === "dashboard"
                  ? "bg-emerald-600 text-white shadow-[0_0_15px_rgba(16,185,129,0.4)]"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Layout size={14} /> Dashboard
            </button>
            
            <div className="relative">
              <button
                onClick={() => setViewMode("comms")}
                className={`relative px-4 py-2 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                  viewMode === "comms"
                    ? "bg-blue-600 text-white shadow-lg"
                    : hasUnread 
                      ? "bg-blue-900/30 text-blue-400 border border-blue-500/50"
                      : "text-gray-400 hover:text-white"
                }`}
              >
                <Mail size={14} /> Comms
                {hasUnread && (
                  <span className="absolute -top-1.5 -right-1.5 w-4 h-4 bg-red-500 text-white text-[9px] flex items-center justify-center rounded-full border border-black animate-bounce shadow-lg">
                    {unreadCount}
                  </span>
                )}
              </button>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-6">
          <div className="flex flex-col items-end">
            <div className="flex items-center gap-2 text-[10px] text-emerald-400 font-mono">
              <Activity size={12} className="animate-pulse" /> SYSTEM_LINK: OPTIMAL
            </div>
            <div className="text-[8px] text-gray-600 font-mono uppercase">
              NODE: ACCRA_CENTRAL_INTEL
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-3 hover:bg-red-500/10 rounded-xl text-gray-400 hover:text-red-500 transition-all border border-transparent hover:border-red-500/20"
          >
            <X size={28} />
          </button>
        </div>
      </header>

      {/* --- MAIN CONTENT --- */}
      <main className="flex-1 overflow-y-auto p-8 space-y-8 custom-scrollbar bg-black tactical-grid relative">
        <div className="scan-line" />
        
        <div className="max-w-[1700px] mx-auto space-y-8 relative z-10">
          
          {/* TOP ROW: AGENT | DIRECTIVES | TARGETS */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <IdentityModule profile={profile} />
            
            <motion.div 
               className="h-full rounded-2xl overflow-hidden"
               animate={initialSection === 'hunter' ? {
                 boxShadow: ["0 0 0px rgba(16, 185, 129, 0)", "0 0 25px rgba(16, 185, 129, 0.4)", "0 0 0px rgba(16, 185, 129, 0)"],
                 borderColor: ["rgba(255,255,255,0.1)", "rgba(16, 185, 129, 1)", "rgba(255,255,255,0.1)"]
               } : {}}
               transition={{ duration: 2, repeat: initialSection === 'hunter' ? Infinity : 0 }}
            >
              <HunterPreferences
                preferences={preferences}
                onUpdate={updatePreferences}
              />
            </motion.div>

            <SmartWatchlist
              items={watchlist}
              onRemove={removeFromWatchlist}
            />
          </div>

          {/* BOTTOM SECTION: FULL WIDTH INTELLIGENCE */}
          <div className="w-full relative">
            <div className="bg-[#0A0A0A]/60 border border-white/10 rounded-2xl overflow-hidden flex flex-col min-h-[650px] relative shadow-3xl backdrop-blur-xl">
              {viewMode === "dashboard" ? (
                <>
                  <div className="p-5 bg-emerald-500/5 border-b border-white/10 flex justify-between items-center relative z-20">
                    <span className="text-[11px] font-black text-emerald-500 uppercase tracking-[0.4em] flex items-center gap-3">
                      <Activity size={14} className="animate-pulse" /> Market Intelligence Matrix
                    </span>
                    <div className="flex gap-6">
                       <div className="flex flex-col items-end">
                         <span className="text-[9px] font-mono text-emerald-500/50 uppercase">Data_Stream</span>
                         <span className="text-[10px] font-mono text-emerald-400 animate-pulse uppercase">ENCRYPTED_ACTIVE</span>
                       </div>
                       <div className="flex flex-col items-end">
                         <span className="text-[9px] font-mono text-gray-600 uppercase">Latency</span>
                         <span className="text-[10px] font-mono text-gray-400">14MS</span>
                       </div>
                    </div>
                  </div>
                  <div className="flex-1 w-full relative z-20">
                     <Dashboard />
                  </div>
                </>
              ) : (
                <SecureInbox 
                  messages={messages} 
                  loading={intelLoading} 
                  onRead={markAsRead} 
                />
              )}
            </div>
          </div>
        </div>

        {/* --- BACK TO MAP BUTTON (CENTER BOTTOM) --- */}
        <div className="pb-12 pt-8 flex justify-center sticky bottom-0 pointer-events-none">
          <button
            onClick={onClose}
            className="pointer-events-auto group flex items-center gap-3 px-8 py-3 bg-emerald-600 hover:bg-emerald-500 text-white rounded-full font-black text-xs uppercase tracking-[0.2em] shadow-[0_10px_30px_rgba(16,185,129,0.3)] transition-all hover:-translate-y-1 active:translate-y-0 border border-emerald-400/50"
          >
            <ChevronLeft size={16} className="group-hover:-translate-x-1 transition-transform" />
            Return to Tactical Map
            <MapIcon size={16} />
          </button>
        </div>
      </main>
    </motion.div>
  );
}
