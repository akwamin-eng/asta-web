import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export function useMarketIntel() {
  const [stats, setStats] = useState({
    totalAssets: 0,
    avgRent: 0,
    verifiedCount: 0,
    trustData: [
        { name: 'Verified', value: 0, color: '#10b981' }, 
        { name: 'Unverified', value: 0, color: '#374151' }, 
        { name: 'Sus', value: 0, color: '#ef4444' }
    ],
    hotNeighborhoods: [] as any[], 
    isLoading: true
  });

  useEffect(() => {
    async function fetchIntel() {
      try {
        // 1. Fetch PROPERTIES (For Price, Count, and Neighborhoods)
        const { data: props, count } = await supabase
          .from('properties')
          .select('price, type, location_name', { count: 'exact' });

        // 2. Fetch REAL VOTES (The Source of Truth)
        const { data: votes } = await supabase
          .from('trust_votes')
          .select('vote_type');

        // --- CALC 1: TRUST INDEX ---
        const confirmed = votes?.filter(v => v.vote_type === 'confirmed').length || 0;
        const sus = votes?.filter(v => v.vote_type === 'sus' || v.vote_type === 'scam').length || 0;
        // Unverified = Total Properties - (Confirmed + Sus)
        const unverified = Math.max(0, (count || 0) - confirmed - sus);

        // --- CALC 2: MARKET STATS ---
        let rentSum = 0;
        let rentCount = 0;
        const hoodMap: Record<string, { count: number; sumPrice: number }> = {};

        props?.forEach(p => {
            // Price Logic
            if (p.type === 'rent' && p.price > 0) {
                rentSum += p.price;
                rentCount++;
            }

            // Neighborhood Logic (For Leaderboard)
            const hood = p.location_name || "Unknown";
            if (!hoodMap[hood]) hoodMap[hood] = { count: 0, sumPrice: 0 };
            hoodMap[hood].count++;
            if (p.price) hoodMap[hood].sumPrice += p.price;
        });

        const avg = rentCount > 0 ? Math.round(rentSum / rentCount) : 0;

        // --- CALC 3: HOT ZONES LEADERBOARD ---
        const sortedHoods = Object.entries(hoodMap)
            .map(([name, data]) => ({
                name,
                count: data.count,
                avgPrice: data.count > 0 ? Math.round(data.sumPrice / data.count) : 0
            }))
            .sort((a, b) => b.count - a.count) // Sort by volume
            .slice(0, 5); // Top 5

        setStats({
          totalAssets: count || 0,
          avgRent: avg,
          verifiedCount: confirmed,
          trustData: [
            { name: 'Verified', value: confirmed, color: '#10b981' },
            { name: 'Unverified', value: unverified, color: '#374151' },
            { name: 'Sus', value: sus, color: '#ef4444' }
          ],
          hotNeighborhoods: sortedHoods,
          isLoading: false
        });

      } catch (e) {
        console.error("Intel Fetch Error:", e);
        setStats(prev => ({ ...prev, isLoading: false }));
      }
    }

    fetchIntel();
  }, []);

  return stats;
}
