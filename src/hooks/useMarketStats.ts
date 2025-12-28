import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export interface MarketStat {
  totalVolume: number;
  totalValue: number;
  avgPrice: number;
  activeListings: number;
  zoneStats: {
    name: string;      // Mapped from zone_name
    count: number;
    avgPrice: number;  // Mapped from avg_price
    volume: number;
  }[];
  typeSplit: {
    sale: number;      // Mapped from sale_count
    rent: number;      // Mapped from rent_count
  };
}

export function useMarketStats() {
  const [stats, setStats] = useState<MarketStat | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchLiveStats();
  }, []);

  async function fetchLiveStats() {
    try {
      // Query the optimized Database View
      const { data, error } = await supabase
        .from('analytics_market_pulse')
        .select('*')
        .single(); // We expect exactly one row containing all aggregates

      if (error) throw error;
      if (!data) return;

      // Map DB snake_case to frontend camelCase
      setStats({
        totalVolume: data.total_active,
        totalValue: data.total_value,
        avgPrice: data.avg_price,
        activeListings: data.total_active,
        
        // Ensure zone_stats is an array (handle null case if 0 properties)
        zoneStats: (data.zone_stats || []).map((z: any) => ({
          name: z.zone_name || 'Unknown',
          count: z.count,
          avgPrice: z.avg_price,
          volume: z.volume
        })),

        typeSplit: {
          sale: data.type_split?.sale_count || 0,
          rent: data.type_split?.rent_count || 0
        }
      });

    } catch (err) {
      console.error("Market Pulse Error:", err);
    } finally {
      setLoading(false);
    }
  }

  return { stats, loading, refresh: fetchLiveStats };
}
