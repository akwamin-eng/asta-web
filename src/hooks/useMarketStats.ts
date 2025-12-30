import { useState, useEffect, useMemo } from 'react';
import { useLiveListings } from './useLiveListings';
import { getRegionForLocation, type RegionName } from '../lib/regions';

interface ZoneStat {
  name: string;
  count: number;
  avgPrice: number;
  demandScore: number;
}

interface MarketStats {
  activeListings: number;
  avgPrice: number;
  medianPrice: number;
  avgRent: number;
  avgSale: number;
  zoneStats: ZoneStat[];
  lastUpdated: string;
}

export function useMarketStats(selectedRegion?: RegionName) {
  const { listings, loading } = useLiveListings();
  const [stats, setStats] = useState<MarketStats | null>(null);

  const processedStats = useMemo(() => {
    if (loading || listings.length === 0) return null;

    // 1. FILTER BY REGION
    const regionListings = selectedRegion 
      ? listings.filter(l => getRegionForLocation(l.location_name) === selectedRegion)
      : listings;

    if (regionListings.length === 0) {
      return {
        activeListings: 0,
        avgPrice: 0,
        medianPrice: 0,
        avgRent: 0,
        avgSale: 0,
        zoneStats: [],
        lastUpdated: new Date().toISOString()
      };
    }

    // 2. CALCULATE METRICS
    const prices = regionListings.map(l => l.price).sort((a, b) => a - b);
    const rentListings = regionListings.filter(l => l.type === 'rent');
    const saleListings = regionListings.filter(l => l.type === 'sale');

    const totalVal = prices.reduce((acc, curr) => acc + curr, 0);
    const avgPrice = totalVal / prices.length;
    
    // Median
    const mid = Math.floor(prices.length / 2);
    const medianPrice = prices.length % 2 !== 0 ? prices[mid] : (prices[mid - 1] + prices[mid]) / 2;

    // Specific Avgs
    const totalRent = rentListings.reduce((acc, curr) => acc + curr.price, 0);
    const avgRent = rentListings.length > 0 ? totalRent / rentListings.length : 0;

    const totalSale = saleListings.reduce((acc, curr) => acc + curr.price, 0);
    const avgSale = saleListings.length > 0 ? totalSale / saleListings.length : 0;

    // 3. ZONE LEADERBOARD
    const zones: Record<string, { count: number; total: number }> = {};
    regionListings.forEach(l => {
      const zone = l.location_name;
      if (!zones[zone]) zones[zone] = { count: 0, total: 0 };
      zones[zone].count++;
      zones[zone].total += l.price;
    });

    const zoneStats = Object.entries(zones)
      .map(([name, data]) => ({
        name,
        count: data.count,
        avgPrice: data.total / data.count,
        demandScore: Math.min(100, data.count * 10)
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      activeListings: regionListings.length,
      avgPrice,
      medianPrice,
      avgRent,
      avgSale,
      zoneStats,
      lastUpdated: new Date().toISOString()
    };

  }, [listings, loading, selectedRegion]);

  useEffect(() => {
    setStats(processedStats);
  }, [processedStats]);

  return { stats, loading };
}
