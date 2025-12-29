import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useMarketStats() {
  const [stats, setStats] = useState({
    avgPrice: 0,
    activeListings: 0,
    zoneStats: [] as any[],
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchStats() {
      try {
        // 1. Fetch RENTALS only for the Average Price
        // We filter out extreme outliers (> 50k) that are likely mislabeled sales
        const { data: rentData } = await supabase
          .from('properties')
          .select('price')
          .eq('type', 'rent') 
          .lt('price', 50000); 

        // 2. Fetch ALL active listings for volume counts
        const { data: allData } = await supabase
          .from('properties')
          .select('location_name, price, type')
          .eq('status', 'active');

        if (!allData || !rentData) return;

        // --- MATH SECTION ---

        // A. Calculate Average Rent (Reliable)
        const totalRent = rentData.reduce((sum, item) => sum + item.price, 0);
        const avgRent = rentData.length > 0 ? Math.round(totalRent / rentData.length) : 0;

        // B. Calculate Zone Leaderboard
        const zoneMap: Record<string, { count: number; total: number }> = {};
        
        allData.forEach(p => {
          // Normalize location name (e.g. "East Legon, Accra" -> "East Legon")
          const zone = p.location_name ? p.location_name.split(',')[0].trim() : 'Unknown';
          
          if (!zoneMap[zone]) zoneMap[zone] = { count: 0, total: 0 };
          zoneMap[zone].count += 1;
          zoneMap[zone].total += p.price;
        });

        // Convert to array and SORT DESCENDING by Count
        const zoneStats = Object.entries(zoneMap)
          .map(([name, data]) => ({
            name,
            count: data.count,
            avgPrice: Math.round(data.total / data.count)
          }))
          .sort((a, b) => b.count - a.count) // High volume first
          .slice(0, 5); // Top 5 only

        setStats({
          avgPrice: avgRent,
          activeListings: allData.length,
          zoneStats
        });

      } catch (err) {
        console.error('Stats Error:', err);
      } finally {
        setLoading(false);
      }
    }

    fetchStats();
  }, []);

  return { stats, loading };
}
