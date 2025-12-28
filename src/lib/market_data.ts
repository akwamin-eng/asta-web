// Asta Market Intelligence - Baseline Index (Q4 2025 Data Simulation)

interface MarketBaseline {
  [zone: string]: {
    sale_price_avg: number; // Base price for a 1-bed unit
    rent_price_avg: number; // Base price for a 1-bed unit
    growth_rate: number;    // YoY appreciation
    demand_score: number;   // 1-100
  };
}

// Baseline prices in GHS
const MARKET_INDEX: MarketBaseline = {
  'East Legon': { sale_price_avg: 850000, rent_price_avg: 6000, growth_rate: 12.5, demand_score: 94 },
  'Cantonments': { sale_price_avg: 1200000, rent_price_avg: 15000, growth_rate: 8.2, demand_score: 88 },
  'Airport Residential': { sale_price_avg: 1500000, rent_price_avg: 18000, growth_rate: 6.5, demand_score: 85 },
  'Osu': { sale_price_avg: 900000, rent_price_avg: 8000, growth_rate: 5.0, demand_score: 90 },
  'Spintex': { sale_price_avg: 450000, rent_price_avg: 3500, growth_rate: 15.0, demand_score: 92 },
  'Kumasi': { sale_price_avg: 350000, rent_price_avg: 2000, growth_rate: 18.0, demand_score: 80 },
  'Takoradi': { sale_price_avg: 400000, rent_price_avg: 2500, growth_rate: 10.0, demand_score: 75 },
  'Tamale': { sale_price_avg: 250000, rent_price_avg: 1500, growth_rate: 22.0, demand_score: 70 },
  'Aburi': { sale_price_avg: 600000, rent_price_avg: 4000, growth_rate: 9.0, demand_score: 85 },
  'Cape Coast': { sale_price_avg: 300000, rent_price_avg: 1800, growth_rate: 7.0, demand_score: 65 },
  'Ho': { sale_price_avg: 200000, rent_price_avg: 1200, growth_rate: 11.0, demand_score: 60 },
  'Wa': { sale_price_avg: 180000, rent_price_avg: 1000, growth_rate: 14.0, demand_score: 55 },
  'Sunyani': { sale_price_avg: 220000, rent_price_avg: 1300, growth_rate: 10.0, demand_score: 62 },
  'Tema': { sale_price_avg: 420000, rent_price_avg: 3000, growth_rate: 8.5, demand_score: 78 }
};

export function getMarketAnalysis(property: any) {
  // 1. Identify Zone (Simple fuzzy match)
  const location = property.location_name || '';
  const zoneKey = Object.keys(MARKET_INDEX).find(z => location.includes(z)) || 'Accra';
  const baseline = MARKET_INDEX[zoneKey] || { sale_price_avg: 500000, rent_price_avg: 3000, growth_rate: 5, demand_score: 50 };

  // 2. Adjust for Size (Bedrooms)
  // Logic: 1 Bed = Base. 2 Bed = 1.6x. 3 Bed = 2.4x. 4 Bed = 3.2x
  const beds = property.details?.bedrooms || 2; // Default to 2 if missing
  const multiplier = beds === 1 ? 1 : 0.8 * beds; 
  
  const predictedPrice = property.type === 'sale' 
    ? baseline.sale_price_avg * multiplier 
    : baseline.rent_price_avg * multiplier;

  // 3. Calculate Deviation
  const price = property.price || 0;
  const variance = ((price - predictedPrice) / predictedPrice) * 100;

  // 4. Verdict
  let verdict = 'Fair Value';
  let color = 'text-emerald-400';
  let barColor = 'bg-emerald-500';

  if (variance > 20) {
    verdict = 'Overpriced';
    color = 'text-red-400';
    barColor = 'bg-red-500';
  } else if (variance < -20) {
    verdict = 'Underpriced (Deal)';
    color = 'text-blue-400';
    barColor = 'bg-blue-500';
  } else if (variance > 5) {
    verdict = 'Slightly High';
    color = 'text-yellow-400';
    barColor = 'bg-yellow-500';
  }

  return {
    zone: zoneKey,
    predictedPrice,
    variance: Math.round(variance),
    verdict,
    color,
    barColor,
    growth_rate: baseline.growth_rate,
    demand_score: baseline.demand_score
  };
}
