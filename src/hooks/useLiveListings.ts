import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';

export interface Property {
  id: number;
  title: string;
  price: number;
  currency: 'GHS' | 'USD';
  lat: number;
  long: number;
  location_name: string;
  location_accuracy: 'high' | 'low';
  vibe_features: string | string[];
  description: string;
  property_class?: string; // Added field
  type: 'sale' | 'rent';
  cover_image_url?: string;
  images?: string[];
  owner?: any;
  details?: {
    bedrooms?: number;
    bathrooms?: number;
    area_sqm?: number;
  };
}

export function useLiveListings() {
  const [listings, setListings] = useState<Property[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchListings();

    const subscription = supabase
      .channel('public:properties')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'properties' }, () => {
        fetchListings();
      })
      .subscribe();

    return () => {
      supabase.removeChannel(subscription);
    };
  }, []);

  async function fetchListings() {
    try {
      // 1. Fetch 'property_class' to ensure filtering works
      const { data, error } = await supabase
        .from('properties')
        .select(`
          id,
          title,
          price,
          currency,
          lat,
          long,
          location_name,
          location_accuracy,
          vibe_features,
          description,
          description_enriched,
          property_class, 
          type,
          cover_image_url,
          property_images(url),
          details,
          owner_id,
          source
        `)
        .eq('status', 'active')
        .neq('source', 'internal_migration')
        .neq('source', 'scraper_import');

      if (error) throw error;

      // 2. Data Normalization & Fallbacks
      const normalized = (data || []).map((p: any) => ({
        ...p,
        // Fallback: If DB missing class, assume 'House' so it shows on map
        property_class: p.property_class || 'House', 
        vibe_features: typeof p.vibe_features === 'string' 
          ? p.vibe_features 
          : JSON.stringify(p.vibe_features || []),
        images: p.property_images?.map((i: any) => i.url) || [],
        details: p.details || { bedrooms: 1, bathrooms: 1 }
      }));

      setListings(normalized);
    } catch (err) {
      console.error('Error fetching live grid:', err);
    } finally {
      setLoading(false);
    }
  }

  return { listings, loading };
}
