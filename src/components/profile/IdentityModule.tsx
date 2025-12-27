import React from 'react';
import { Shield, User, Zap } from 'lucide-react';
import type { UserProfile } from '../../types/asta_types';

interface IdentityModuleProps {
  profile: UserProfile;
}

export default function IdentityModule({ profile }: IdentityModuleProps) {
  const getRankColor = (rank: string) => {
    switch (rank) {
      case 'Elite': return 'text-purple-400 border-purple-500/30 bg-purple-500/10';
      case 'Scout': return 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10';
      default: return 'text-gray-400 border-gray-500/30 bg-gray-500/10';
    }
  };

  const rankStyle = getRankColor(profile.rank_title);

  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-6 h-full">
      <div className="flex flex-col items-center text-center">
        <div className="relative mb-4">
          <div className="w-24 h-24 rounded-full border-2 border-white/10 overflow-hidden bg-black">
            {profile.avatar_url ? (
               <img src={profile.avatar_url} alt="Profile" className="w-full h-full object-cover" />
            ) : (
               <div className="w-full h-full flex items-center justify-center text-gray-600"><User size={40} /></div>
            )}
          </div>
          <div className={`absolute -bottom-3 px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-widest border backdrop-blur-md ${rankStyle}`}>
            {profile.rank_title}
          </div>
        </div>
        <h2 className="text-xl font-bold text-white mt-2">{profile.full_name}</h2>
        <div className="grid grid-cols-2 gap-3 w-full mt-6">
           <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex flex-col items-center">
              <Shield size={16} className="text-emerald-500 mb-1" />
              <span className="text-2xl font-mono text-white font-bold">{profile.reputation_score}</span>
           </div>
           <div className="bg-white/5 rounded-lg p-3 border border-white/5 flex flex-col items-center">
              <Zap size={16} className="text-yellow-500 mb-1" />
              <span className="text-2xl font-mono text-white font-bold">{profile.impact_stat}</span>
           </div>
        </div>
      </div>
    </div>
  );
}
