import React, { useState } from "react";
import { motion } from "framer-motion";
import { X, Activity, Layout, Mail, Loader2 } from "lucide-react";
import IdentityModule from "./IdentityModule";
import SmartWatchlist from "./SmartWatchlist";
import HunterPreferences from "./HunterPreferences";
import Dashboard from "../Dashboard";
import SecureInbox from "./SecureInbox";
import { useProfile } from "../../hooks/useProfile";

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

  // STATE: View Mode (Dashboard vs Inbox)
  const [viewMode, setViewMode] = useState<"dashboard" | "comms">("dashboard");

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
      {/* --- HEADER --- */}
      <header className="h-16 border-b border-white/10 flex items-center justify-between px-6 bg-black/40 shrink-0">
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_10px_#10b981]" />
            <h1 className="text-white font-bold tracking-tighter text-sm md:text-lg uppercase">
              Unified Command Center
            </h1>
          </div>

          {/* --- THE TOGGLE BUTTONS (Clean) --- */}
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
            <button
              onClick={() => setViewMode("comms")}
              className={`px-3 md:px-4 py-1.5 rounded text-[10px] font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
                viewMode === "comms"
                  ? "bg-blue-600 text-white shadow-lg"
                  : "text-gray-400 hover:text-white"
              }`}
            >
              <Mail size={12} />{" "}
              <span className="hidden xs:inline">Comms Link</span>
            </button>
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
          {/* LEFT: IDENTITY & CONFIG */}
          <div className="lg:col-span-3 space-y-6">
            <div className="h-fit">
              <IdentityModule profile={profile} />
            </div>
            {/* FORCE HEIGHT so the config card isn't squashed */}
            <div className="min-h-[400px]">
              <HunterPreferences
                preferences={preferences}
                onUpdate={updatePreferences}
              />
            </div>
          </div>

          {/* CENTER: DASHBOARD or INBOX */}
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
                <SecureInbox profile={profile} />
              )}
            </div>
          </div>

          {/* RIGHT: WATCHLIST */}
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
