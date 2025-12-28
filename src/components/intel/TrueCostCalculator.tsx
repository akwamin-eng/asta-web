import React, { useState } from 'react';
import { Calculator, Zap, Droplets, Shield, ChevronDown, ChevronUp, Info } from 'lucide-react';

interface TrueCostProps {
  price: number;
  currency: 'GHS' | 'USD';
  bedrooms: number;
  type: 'sale' | 'rent';
}

export default function TrueCostCalculator({ price, currency, bedrooms, type }: TrueCostProps) {
  const [isOpen, setIsOpen] = useState(false);

  // LOGIC: Ghana Market Estimates (Monthly)
  // These could eventually come from your 'market_indices' table
  const SERVICE_CHARGE_PCT = 0.12; // 12% is standard for managed compounds
  const ECG_PER_BED = 400; // ~400 GHS electricity per bedroom
  const WATER_FLAT = 150;  // Flat rate for GWCL
  const GEN_FUEL_EST = 600; // Estimated diesel cost for standby gen

  // Calculations
  const basePrice = price;
  const serviceCharge = Math.round(basePrice * SERVICE_CHARGE_PCT);
  
  // Utility Logic (Only applicable if Renting usually, or living in own home)
  // We assume currency conversion if USD listing but costs are in GHS
  const rate = currency === 'USD' ? 15.5 : 1; 
  
  // Utilities are always calculated in local currency first, then converted to display currency
  const utilCostGHS = (ECG_PER_BED * (bedrooms || 1)) + WATER_FLAT + GEN_FUEL_EST;
  const utilCost = Math.round(utilCostGHS / rate);

  const totalCost = basePrice + serviceCharge + utilCost;
  const hiddenCostPct = Math.round(((totalCost - basePrice) / basePrice) * 100);

  if (type === 'sale') return null; // Currently optimized for Renters

  return (
    <div className="mt-4 bg-[#151515] border border-white/5 rounded-xl overflow-hidden transition-all">
      <button 
        onClick={() => setIsOpen(!isOpen)}
        className="w-full p-4 flex items-center justify-between hover:bg-white/5 transition-colors"
      >
        <div className="flex items-center gap-3">
          <div className="p-2 bg-indigo-500/10 rounded-lg text-indigo-400 border border-indigo-500/20">
            <Calculator size={18} />
          </div>
          <div className="text-left">
            <h3 className="text-xs font-bold text-white uppercase tracking-wider">True Cost of Living</h3>
            <p className="text-[10px] text-gray-500">Includes utilities & fees</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
           {!isOpen && (
             <div className="text-right">
                <span className="text-sm font-mono text-indigo-400 font-bold">
                  {currency === 'GHS' ? '₵' : '$'}{totalCost.toLocaleString()}
                </span>
                <span className="text-[9px] text-red-400 block">+{hiddenCostPct}% Hidden</span>
             </div>
           )}
           {isOpen ? <ChevronUp size={16} className="text-gray-500"/> : <ChevronDown size={16} className="text-gray-500"/>}
        </div>
      </button>

      {isOpen && (
        <div className="p-4 pt-0 border-t border-white/5 bg-black/20">
          <div className="space-y-3 mt-4">
            
            {/* Base Rent */}
            <div className="flex justify-between items-center text-xs">
              <span className="text-gray-400">Base Rent</span>
              <span className="font-mono text-white opacity-60">
                {currency === 'GHS' ? '₵' : '$'}{basePrice.toLocaleString()}
              </span>
            </div>

            {/* Service Charge */}
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <Shield size={12} className="text-emerald-500" />
                <span>Service Charge (Est. 12%)</span>
              </div>
              <span className="font-mono text-white">
                +{currency === 'GHS' ? '₵' : '$'}{serviceCharge.toLocaleString()}
              </span>
            </div>

            {/* Utilities */}
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <Zap size={12} className="text-yellow-500" />
                <span>ECG & Water (Est.)</span>
              </div>
              <span className="font-mono text-white">
                +{currency === 'GHS' ? '₵' : '$'}{Math.round(((ECG_PER_BED * (bedrooms || 1)) + WATER_FLAT) / rate).toLocaleString()}
              </span>
            </div>

            {/* Generator */}
            <div className="flex justify-between items-center text-xs">
              <div className="flex items-center gap-2 text-gray-300">
                <Droplets size={12} className="text-orange-500" />
                <span>Generator Fuel (Est.)</span>
              </div>
              <span className="font-mono text-white">
                +{currency === 'GHS' ? '₵' : '$'}{Math.round(GEN_FUEL_EST / rate).toLocaleString()}
              </span>
            </div>

            {/* Total Line */}
            <div className="pt-3 border-t border-white/10 flex justify-between items-end">
              <div className="flex items-center gap-1.5 text-[9px] text-gray-500">
                <Info size={10} /> 
                <span>Estimates based on local averages.</span>
              </div>
              <div className="text-right">
                <div className="text-[10px] text-gray-400 uppercase">Real Monthly Cost</div>
                <div className="text-xl font-black font-mono text-indigo-400">
                   {currency === 'GHS' ? '₵' : '$'}{totalCost.toLocaleString()}
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
