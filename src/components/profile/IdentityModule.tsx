import React from 'react';
import { Shield, User, Zap } from 'lucide-react';
import type { UserProfile } from '../../types/asta_types';

interface IdentityModuleProps {
  profile: UserProfile | null;
}

export default function IdentityModule({ profile }: IdentityModuleProps) {
  // Defensive Style Mapping
  const getRankColor = (rank?: string) => {
    switch (rank) {
      case 'Elite': return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      case 'Scout': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'Legend': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
      default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
    }
  };

  const rankStyle = getRankColor(profile?.rank_title);

  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-6 h-full shadow-2xl">
      <div className="flex flex-col items-center text-center">
        {/* Avatar Ring */}
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full border-2 border-white/10 overflow-hidden bg-black flex items-center justify-center">
            {profile?.avatar_url ? (
               <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
               <User size={40} className="text-gray-700" />
            )}
          </div>
          <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md whitespace-nowrap ${rankStyle}`}>
            {profile?.rank_title || 'RECRUIT'}
          </div>
        </div>

        <h2 className="text-xl font-bold text-white mt-2 truncate w-full px-2">
          {profile?.full_name || "Establishing Identity..."}
        </h2>
        <p className="text-[10px] text-gray-500 font-mono mt-1 uppercase tracking-widest">
          {profile?.id ? `ID: ${profile.id.slice(0, 8)}` : "Authenticating..."}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full mt-6">
           <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex flex-col items-center group hover:border-emerald-500/30 transition-colors">
              <Shield size={16} className="text-emerald-500 mb-1" />
              <span className="text-2xl font-mono text-white font-bold">
                {profile?.reputation_score ?? '--'}
              </span>
              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">Reputation</span>
           </div>
           <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex flex-col items-center group hover:border-yellow-500/30 transition-colors">
              <Zap size={16} className="text-yellow-500 mb-1" />
              <span className="text-2xl font-mono text-white font-bold">
                {profile?.impact_stat ?? '--'}
              </span>
              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">Impact</span>
           </div>
        </div>

        {/* Progress System */}
        <div className="w-full mt-6 space-y-2">
           <div className="flex justify-between text-[9px] text-gray-500 uppercase font-bold">
             <span>Next Rank</span>
             <span className="text-gray-300">Level Progress</span>
           </div>
           <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
             <div 
               className="h-full bg-gradient-to-r from-emerald-500 to-cyan-500 transition-all duration-1000" 
               style={{ width: `${profile ? Math.min((profile.reputation_score / 1000) * 100, 100) : 0}%` }}
             />
           </div>
        </div>
      </div>
    </div>
  );
}
