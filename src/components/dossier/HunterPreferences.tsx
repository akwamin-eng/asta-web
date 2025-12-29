import React, { useState, useEffect, useRef } from 'react';
import { Target, MapPin, DollarSign, X, Plus, Loader2, CheckCircle2, Search, Crosshair, Navigation, RefreshCw } from 'lucide-react';
import { useGoogleAutocomplete } from '../../hooks/useGoogleAutocomplete';
import { motion, AnimatePresence } from 'framer-motion';

interface HunterPreferencesProps {
  preferences: any;
  onUpdate: (key: string, value: any) => void;
}

export default function HunterPreferences({ preferences, onUpdate }: HunterPreferencesProps) {
  const { predictions, getPredictions, loading: searching, setPredictions } = useGoogleAutocomplete();
  const [inputZone, setInputZone] = useState('');
  
  // CURRENCY STATE
  const [currency, setCurrency] = useState<'GHS' | 'USD'>('GHS');
  const EX_RATE = 12.5; // Example conversion rate

  const [budget, setBudget] = useState(preferences?.budget_max || 250000);
  const dropdownRef = useRef<HTMLDivElement>(null);

  const activeZones = preferences?.locations || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setPredictions([]);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [setPredictions]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setInputZone(val);
    getPredictions(val);
  };

  const selectZone = (description: string) => {
    const cleanName = description.split(',')[0].trim();
    if (!activeZones.includes(cleanName)) {
      onUpdate('locations', [...activeZones, cleanName]);
    }
    setInputZone('');
    setPredictions([]);
  };

  const removeZone = (zone: string) => {
    onUpdate('locations', activeZones.filter((z: string) => z !== zone));
  };

  // Convert budget for display based on currency toggle
  const displayBudget = currency === 'GHS' ? budget : budget / EX_RATE;

  return (
    <div className="bg-black/60 border border-emerald-500/20 rounded-xl p-6 h-full flex flex-col relative overflow-visible shadow-[0_0_50px_rgba(16,185,129,0.05)]">
      
      {/* Tactical Header */}
      <div className="mb-6">
        <div className="flex items-center gap-2 mb-1">
          <div className="p-1.5 bg-emerald-500/10 rounded border border-emerald-500/30">
            <Target className="text-emerald-500" size={18} />
          </div>
          <h2 className="text-sm font-black text-white uppercase tracking-[0.2em]">Hunter Directives</h2>
        </div>
        <p className="text-[10px] text-emerald-500/60 font-mono uppercase tracking-wider">
          Sector Surveillance & Capital Thresholds
        </p>
      </div>

      {/* Zone Discovery Section */}
      <div className="space-y-4 mb-8 relative" ref={dropdownRef}>
        <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
          <Navigation size={10} /> Authorized Sectors
        </label>

        <div className="relative group">
          <div className={`flex items-center bg-black border ${searching ? 'border-emerald-500/50' : 'border-white/10'} rounded-lg px-3 py-1 transition-all`}>
            <Search size={14} className="text-gray-500" />
            <input 
              type="text" 
              value={inputZone}
              onChange={handleInputChange}
              placeholder="Search zones (e.g. East Legon)..."
              className="flex-1 bg-transparent border-none py-2 px-3 text-xs text-white focus:outline-none font-mono"
            />
            {searching && <Loader2 size={14} className="text-emerald-500 animate-spin" />}
          </div>

          <AnimatePresence>
            {predictions.length > 0 && (
              <motion.div 
                initial={{ opacity: 0, y: -10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="absolute top-full left-0 right-0 mt-2 bg-[#0A0A0A] border border-emerald-500/30 rounded-lg shadow-2xl z-[200] overflow-hidden"
              >
                {predictions.map((p: any) => (
                  <button
                    key={p.place_id}
                    onClick={() => selectZone(p.description)}
                    className="w-full text-left px-4 py-3 hover:bg-emerald-500/10 border-b border-white/5 last:border-0 transition-colors group"
                  >
                    <div className="text-[11px] text-white font-bold group-hover:text-emerald-400 transition-colors">
                      {p.structured_formatting.main_text}
                    </div>
                    <div className="text-[9px] text-gray-500 font-mono">
                      {p.structured_formatting.secondary_text}
                    </div>
                  </button>
                ))}
              </motion.div>
            )}
          </AnimatePresence>
        </div>

        <div className="flex flex-wrap gap-2 min-h-[32px]">
          {activeZones.map((zone: string) => (
            <motion.span 
              layout
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              key={zone} 
              className="group flex items-center gap-2 px-3 py-1.5 rounded bg-emerald-500/5 border border-emerald-500/20 text-emerald-500 text-[10px] font-black uppercase tracking-tight"
            >
              <Crosshair size={10} className="text-emerald-500/50" />
              {zone}
              <button 
                onClick={() => removeZone(zone)}
                className="text-gray-600 hover:text-red-500 transition-colors"
              >
                <X size={12} />
              </button>
            </motion.span>
          ))}
        </div>
      </div>

      {/* Budget Logic */}
      <div className="space-y-4 mb-8">
        <div className="flex justify-between items-center">
          <label className="text-[9px] font-bold text-gray-500 uppercase tracking-widest flex items-center gap-2">
            <DollarSign size={10} /> Max Valuation Cap
          </label>
          
          {/* CURRENCY TOGGLE */}
          <div className="flex bg-black border border-white/10 rounded p-0.5">
            {['GHS', 'USD'].map((curr) => (
              <button
                key={curr}
                onClick={() => setCurrency(curr as any)}
                className={`px-2 py-0.5 text-[8px] font-bold rounded transition-all ${
                  currency === curr ? 'bg-emerald-600 text-white' : 'text-gray-500 hover:text-gray-300'
                }`}
              >
                {curr}
              </button>
            ))}
          </div>
        </div>
        
        <div className="bg-black border border-white/10 rounded-lg p-4">
          <div className="flex justify-between items-end mb-4">
            <span className="text-2xl font-black text-white font-mono">
              {currency === 'GHS' ? '₵' : '$'}
              {displayBudget > 1000 ? `${(displayBudget / 1000).toFixed(1)}k` : displayBudget.toFixed(0)}
            </span>
            <span className="text-[10px] text-gray-500 font-mono uppercase">{currency} Limit</span>
          </div>
          <input 
            type="range" 
            min={currency === 'GHS' ? "50000" : (50000 / EX_RATE).toString()} 
            max={currency === 'GHS' ? "5000000" : (5000000 / EX_RATE).toString()} 
            step={currency === 'GHS' ? "10000" : "1000"}
            value={displayBudget}
            onChange={(e) => {
              const val = Number(e.target.value);
              setBudget(currency === 'GHS' ? val : val * EX_RATE);
            }}
            className="w-full h-1 bg-gray-800 rounded-lg appearance-none cursor-pointer accent-emerald-500"
          />
        </div>
      </div>

      {/* Save Button */}
      <button 
        onClick={() => onUpdate('budget_max', budget)}
        className="mt-auto w-full py-4 bg-emerald-600 hover:bg-emerald-500 text-white font-black text-[10px] uppercase tracking-[0.2em] rounded-lg transition-all shadow-[0_0_20px_rgba(16,185,129,0.2)] flex items-center justify-center gap-2"
      >
        <CheckCircle2 size={14} /> Update Hunter Protocol
      </button>

      {/* Bottom status line */}
      <div className="mt-4 pt-4 border-t border-white/5 flex justify-between items-center opacity-30 font-mono text-[8px]">
        <span>STATUS: ACTIVE</span>
        <span>SCAN_MODE: GLOBAL_GH</span>
      </div>
    </div>
  );
}
