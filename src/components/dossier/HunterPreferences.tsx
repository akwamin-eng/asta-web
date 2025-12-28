import React, { useState, useEffect } from "react";
import {
  Target,
  Save,
  Sliders,
  DollarSign,
  Activity,
  MapPin,
} from "lucide-react";
import type { HunterPreferences as HunterPrefType } from "../../types/asta_types";

interface HunterPreferencesProps {
  preferences: HunterPrefType | null;
  onUpdate: (newPrefs: Partial<HunterPrefType>) => void;
}

export default function HunterPreferences({
  preferences,
  onUpdate,
}: HunterPreferencesProps) {
  const [isEditing, setIsEditing] = useState(false);

  // DEFAULT CONFIG (Used if DB is empty)
  const defaultPrefs: HunterPrefType = {
    locations: [],
    budget_max: 500000,
    lifestyle_tags: [],
    alerts_enabled: true,
    deal_trigger_percent: 5,
    property_type: [],
  };

  const [localPrefs, setLocalPrefs] = useState<HunterPrefType>(defaultPrefs);

  useEffect(() => {
    if (preferences) {
      setLocalPrefs(preferences);
    }
  }, [preferences]);

  const AVAILABLE_ZONES = [
    "Cantonments",
    "East Legon",
    "Oyarifa",
    "Airport Res.",
    "Labone",
    "Spintex",
  ];
  const LIFESTYLE_TAGS = [
    "Security",
    "Quiet",
    "Nightlife",
    "Schools",
    "Modern",
  ];

  const handleSave = () => {
    onUpdate(localPrefs);
    setIsEditing(false);
  };

  return (
    <div className="bg-[#111] border border-white/10 rounded-xl p-6 h-full flex flex-col relative">
      {/* HEADER */}
      <div className="flex justify-between items-start mb-6 border-b border-white/5 pb-4">
        <div>
          <h3 className="text-lg font-bold text-white flex items-center gap-2">
            <Target size={18} className="text-emerald-500" />
            Hunter Config
          </h3>
          <p className="text-[10px] text-gray-500 font-mono uppercase mt-1">
            Status:{" "}
            {isEditing ? (
              <span className="text-amber-500 underline">Configuring...</span>
            ) : (
              <span className="text-emerald-500">Active Tracking</span>
            )}
          </p>
        </div>

        <button
          onClick={() => (isEditing ? handleSave() : setIsEditing(true))}
          className={`flex items-center gap-2 px-4 py-2 rounded text-xs font-bold uppercase tracking-wider transition-all ${
            isEditing
              ? "bg-emerald-500 text-black shadow-[0_0_20px_rgba(16,185,129,0.4)]"
              : "bg-white/5 text-white hover:bg-white/10 border border-white/10"
          }`}
        >
          {isEditing ? (
            <>
              <Save size={14} /> Save
            </>
          ) : (
            <>
              <Sliders size={14} /> Edit
            </>
          )}
        </button>
      </div>

      <div className="space-y-8 overflow-y-auto pr-2 custom-scrollbar flex-1">
        {/* ZONES SECTION */}
        <div className="space-y-3">
          <label className="text-[10px] text-gray-500 font-bold uppercase tracking-widest flex items-center gap-2">
            <MapPin size={12} /> Target Zones
          </label>
          <div className="flex flex-wrap gap-2">
            {(isEditing ? AVAILABLE_ZONES : localPrefs.locations || []).map(
              (loc) => {
                const isActive = (localPrefs.locations || []).includes(loc);

                if (!isEditing && !isActive) return null;

                return (
                  <button
                    key={loc}
                    onClick={() => {
                      if (!isEditing) return;
                      const updated = isActive
                        ? localPrefs.locations.filter((l) => l !== loc)
                        : [...(localPrefs.locations || []), loc].slice(0, 3);
                      setLocalPrefs({ ...localPrefs, locations: updated });
                    }}
                    disabled={!isEditing}
                    className={`px-3 py-1.5 rounded text-xs font-mono border transition-all ${
                      isActive
                        ? "bg-emerald-500/10 border-emerald-500 text-emerald-400"
                        : "bg-black border-white/10 text-gray-600 hover:border-white/30"
                    }`}
                  >
                    {loc}
                  </button>
                );
              }
            )}
            {!isEditing && (localPrefs.locations || []).length === 0 && (
              <p className="text-xs text-gray-600 italic">
                No zones selected. Click Edit to configure.
              </p>
            )}
          </div>
        </div>

        {/* BUDGET SECTION */}
        <div className="space-y-4 pt-4 border-t border-white/5">
          <div className="flex justify-between text-[10px] text-gray-500 font-bold uppercase">
            <span>
              <DollarSign size={10} className="inline mr-1" /> Max Budget
            </span>
            <span className="text-emerald-400 font-mono text-sm">
              ₵{(localPrefs.budget_max || 0).toLocaleString()}
            </span>
          </div>
          <input
            type="range"
            min="100000"
            max="5000000"
            step="50000"
            disabled={!isEditing}
            value={localPrefs.budget_max || 0}
            onChange={(e) =>
              setLocalPrefs({
                ...localPrefs,
                budget_max: parseInt(e.target.value),
              })
            }
            className={`w-full h-1.5 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500 ${
              !isEditing && "opacity-50"
            }`}
          />
        </div>

        {/* LIFESTYLE SECTION */}
        <div className="space-y-3 pt-4 border-t border-white/5">
          <label className="text-[10px] text-gray-500 font-bold uppercase flex items-center gap-2">
            <Activity size={12} /> Lifestyle Tags
          </label>
          <div className="flex flex-wrap gap-2">
            {(isEditing ? LIFESTYLE_TAGS : localPrefs.lifestyle_tags || []).map(
              (tag) => {
                const active = (localPrefs.lifestyle_tags || []).includes(tag);

                if (!isEditing && !active) return null;

                return (
                  <button
                    key={tag}
                    onClick={() => {
                      if (!isEditing) return;
                      const updated = active
                        ? localPrefs.lifestyle_tags.filter((t) => t !== tag)
                        : [...(localPrefs.lifestyle_tags || []), tag];
                      setLocalPrefs({ ...localPrefs, lifestyle_tags: updated });
                    }}
                    disabled={!isEditing}
                    className={`px-2 py-1 rounded border text-[10px] font-bold uppercase ${
                      active
                        ? "bg-white text-black border-white"
                        : "bg-transparent text-gray-600 border-gray-800"
                    }`}
                  >
                    {tag}
                  </button>
                );
              }
            )}
            {!isEditing && (localPrefs.lifestyle_tags || []).length === 0 && (
              <p className="text-xs text-gray-600 italic">No tags selected.</p>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
