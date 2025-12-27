import React, { useState } from 'react';
import { Target, Bell, MapPin, Save } from 'lucide-react';
import type { HunterPreferences as HunterPrefType } from '../../types/asta_types';

interface HunterPreferencesProps {
  preferences: HunterPrefType;
  onUpdate: (newPrefs: HunterPrefType) => void;
}

export default function HunterPreferences({ preferences, onUpdate }: HunterPreferencesProps) {
  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-6 h-full">
      <h3 className="text-lg font-bold text-white mb-6">Hunter Config</h3>
      <p className="text-xs text-gray-500 uppercase font-bold mb-2">Active Targets</p>
      <div className="flex flex-wrap gap-2">
        {preferences.locations.map(loc => (
          <span key={loc} className="px-2 py-1 bg-white/5 border border-white/10 rounded text-xs text-gray-300">
            {loc}
          </span>
        ))}
      </div>
    </div>
  );
}
