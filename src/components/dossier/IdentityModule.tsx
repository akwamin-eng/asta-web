import React from 'react';
import { Shield, User, Zap, BadgeCheck, Globe, Briefcase, Lock } from 'lucide-react';
import type { UserProfile } from '../../types/asta_types';

interface IdentityModuleProps {
  profile: UserProfile | null;
}

export default function IdentityModule({ profile }: IdentityModuleProps) {
  // Defensive Style Mapping for Ranks
  const getRankColor = (rank?: string) => {
    switch (rank) {
      case 'Elite': return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      case 'Scout': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      case 'Legend': return 'text-orange-400 border-orange-500/30 bg-orange-500/10';
      default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
    }
  };

  // Tier Visuals
  const isVerified = profile?.verification_tier === 'verified_scout' || profile?.verification_tier === 'pro_agent';
  const isPro = profile?.verification_tier === 'pro_agent';
  
  const rankStyle = getRankColor(profile?.rank_title);

  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-6 h-full shadow-2xl relative overflow-hidden group">
      {/* Background decoration */}
      <div className="absolute top-0 right-0 p-4 opacity-5 pointer-events-none">
        <Shield size={120} />
      </div>

      <div className="flex flex-col items-center text-center relative z-10">
        {/* Avatar Ring */}
        <div className="relative mb-4">
          <div className={`w-24 h-24 rounded-full border-2 overflow-hidden bg-black flex items-center justify-center ${isVerified ? 'border-emerald-500 shadow-[0_0_15px_rgba(16,185,129,0.3)]' : 'border-white/10'}`}>
            {profile?.avatar_url ? (
               <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
               <User size={40} className="text-gray-700" />
            )}
          </div>
          
          {/* Rank Badge */}
          <div className={`absolute -bottom-3 left-1/2 -translate-x-1/2 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md whitespace-nowrap ${rankStyle}`}>
            {profile?.rank_title || 'RECRUIT'}
          </div>

          {/* Verification Check */}
          {isVerified && (
            <div className="absolute top-0 right-0 bg-black rounded-full p-1 border border-emerald-500 text-emerald-500" title="Verified Scout">
              <BadgeCheck size={16} fill="black" />
            </div>
          )}
        </div>

        {/* Name & ID */}
        <h2 className="text-xl font-bold text-white mt-3 truncate w-full px-2">
          {profile?.full_name || "Establishing Identity..."}
        </h2>
        
        {/* Role Segment Badge */}
        <div className="flex items-center gap-2 mt-2">
           <span className="flex items-center gap-1.5 px-2 py-0.5 rounded bg-white/5 border border-white/10 text-[10px] text-gray-400 font-mono uppercase">
             {profile?.scout_segment === 'investor_diaspora' ? <Globe size={10} /> : <User size={10} />}
             {profile?.scout_segment?.replace('_', ' ') || 'UNASSIGNED ROLE'}
           </span>
           {isPro && (
             <span className="flex items-center gap-1 px-2 py-0.5 rounded bg-amber-500/10 border border-amber-500/30 text-[10px] text-amber-500 font-mono uppercase font-bold">
               <Briefcase size={10} /> PRO AGENT
             </span>
           )}
        </div>

        {/* ID Hash */}
        <p className="text-[9px] text-gray-600 font-mono mt-2 uppercase tracking-widest flex items-center gap-1">
          <Lock size={8} />
          ID: {profile?.id ? profile.id.slice(0, 12) : "AUTHENTICATING..."}
        </p>

        {/* Stats Grid */}
        <div className="grid grid-cols-2 gap-3 w-full mt-6">
           <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex flex-col items-center group hover:border-emerald-500/30 transition-colors">
              <Shield size={16} className="text-emerald-500 mb-1" />
              <span className="text-2xl font-mono text-white font-bold">
                {profile?.reputation_score ?? 0}
              </span>
              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">Trust Score</span>
           </div>
           <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex flex-col items-center group hover:border-yellow-500/30 transition-colors">
              <Zap size={16} className="text-yellow-500 mb-1" />
              <span className="text-2xl font-mono text-white font-bold">
                {profile?.impact_stat || 0}
              </span>
              <span className="text-[9px] text-gray-500 uppercase font-bold tracking-tighter">Impact</span>
           </div>
        </div>

        {/* Progress System */}
        <div className="w-full mt-6 space-y-2">
           <div className="flex justify-between text-[9px] text-gray-500 uppercase font-bold">
             <span>Clearance Level</span>
             <span className="text-emerald-500">{Math.floor((profile?.reputation_score || 0) / 100)}%</span>
           </div>
           <div className="w-full h-1.5 bg-gray-800 rounded-full overflow-hidden">
             <div 
               className="h-full bg-gradient-to-r from-emerald-600 to-emerald-400 transition-all duration-1000 relative" 
               style={{ width: `${profile ? Math.min(((profile.reputation_score || 0) / 1000) * 100, 100) : 0}%` }}
             >
                <div className="absolute right-0 top-0 bottom-0 w-2 bg-white/50 blur-[2px]" />
             </div>
           </div>
        </div>
      </div>
    </div>
  );
}
