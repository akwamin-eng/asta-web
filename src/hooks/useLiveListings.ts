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
  vibe_features: string | string[]; // Can be JSON string or array
  description: string;
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

    // Subscribe to realtime changes (New scraped assets appear instantly)
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
          type,
          cover_image_url,
          property_images(url),
          details,
          owner_id
        `)
        .eq('status', 'active');

      if (error) throw error;

      // Normalize data structure
      const normalized = (data || []).map((p: any) => ({
        ...p,
        // Ensure features are always an array for the search filter
        vibe_features: typeof p.vibe_features === 'string' 
          ? p.vibe_features 
          : JSON.stringify(p.vibe_features || []),
        // Flatten images array
        images: p.property_images?.map((i: any) => i.url) || [],
        // Ensure details object exists
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
