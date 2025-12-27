import React from 'react';
import IdentityModule from './IdentityModule';
import SmartWatchlist from './SmartWatchlist';
import HunterPreferences from './HunterPreferences';
import { useProfile } from '../../hooks/useProfile';
import { Loader2, AlertCircle } from 'lucide-react';

export default function AstaDossier() {
  const { profile, watchlist, preferences, loading, updatePreferences, removeFromWatchlist } = useProfile();

  if (loading) {
    return (
      <div className="w-full h-full bg-[#050505] flex items-center justify-center">
        <div className="flex flex-col items-center gap-2">
            <Loader2 className="w-8 h-8 text-emerald-500 animate-spin" />
            <p className="text-gray-500 text-xs font-mono uppercase">Loading Dossier...</p>
        </div>
      </div>
    );
  }

  if (!profile) {
    return (
       <div className="w-full h-full bg-[#050505] flex items-center justify-center">
          <div className="flex flex-col items-center gap-4 p-8 border border-red-500/20 bg-red-500/5 rounded-xl">
             <AlertCircle className="w-10 h-10 text-red-500" />
             <div className="text-center">
                <h2 className="text-white font-bold">Access Denied</h2>
                <p className="text-gray-500 text-sm">Please log in to view your Intelligence Dossier.</p>
             </div>
          </div>
       </div>
    );
  }

  return (
    <div className="w-full h-full bg-[#050505] p-6 text-white overflow-y-auto">
      <div className="mb-8 border-b border-white/10 pb-4 flex justify-between items-end">
        <div>
           <h1 className="text-3xl font-bold tracking-tight">Command Dossier</h1>
           <p className="text-gray-500 text-sm mt-1">Intelligence Assessment & Asset Tracking</p>
        </div>
        <div className="text-right hidden sm:block">
           <p className="text-xs text-emerald-500 font-mono">SECURE CONNECTION ESTABLISHED</p>
           <p className="text-[10px] text-gray-600 font-mono">{new Date().toLocaleTimeString()}</p>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        <div className="lg:col-span-3">
           <IdentityModule profile={profile} />
        </div>
        <div className="lg:col-span-5">
           <SmartWatchlist 
              items={watchlist} 
              onRemove={removeFromWatchlist} 
           />
        </div>
        <div className="lg:col-span-4">
           <HunterPreferences 
              preferences={preferences} 
              onUpdate={updatePreferences} 
           />
        </div>
      </div>
    </div>
  );
}
