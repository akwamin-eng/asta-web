import { useEffect, useState, useCallback } from 'react';
import { supabase } from '../lib/supabase'; // This now uses the simplified singleton
import type { UserProfile, HunterPreferences, WatchlistItem } from '../types/asta_types';

export function useProfile() {
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [preferences, setPreferences] = useState<HunterPreferences>({
    locations: [],
    budget_max: 500000,
    property_type: [],
    lifestyle_tags: [],
    alerts_enabled: true,
    deal_trigger_percent: 5
  });
  const [loading, setLoading] = useState(true);

  // LOG 1: Verify the hook is mounting
  useEffect(() => {
    console.warn("⚠️ HOOK MOUNTED: useProfile is active.");
  }, []);

  const fetchDossier = useCallback(async () => {
    try {
      setLoading(true);
      
      // LOG 2: Check Session
      const { data: { session } } = await supabase.auth.getSession();
      
      if (!session) {
        console.warn("⚠️ NO SESSION: Supabase reports no active user.");
        setLoading(false);
        return;
      }

      console.warn(`⚠️ SESSION FOUND: User ID is ${session.user.id}`);

      // 1. Fetch Profile
      const { data: profileData, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', session.user.id)
        .maybeSingle();

      if (error) console.error("❌ DB ERROR:", error.message);
      
      if (profileData) {
        console.warn("⚠️ DATA RECEIVED: Profile loaded successfully.");
        setProfile(profileData);
        if (profileData.preferences) {
          setPreferences(prev => ({ ...prev, ...profileData.preferences }));
        }
      } else {
        console.warn("⚠️ DATA EMPTY: Profile row is missing.");
      }

      // 2. Fetch Watchlist
      const { data: savedData } = await supabase
        .from('saved_properties')
        .select('*, property:properties(*)')
        .eq('user_id', session.user.id);

      if (savedData) {
        const formatted = savedData
          .filter((item: any) => item.property)
          .map((item: any) => ({
            id: item.id,
            property_id: item.property.id,
            title: item.property.title,
            location: item.property.location_name,
            current_price: item.property.price,
            original_price: item.property.price,
            image_url: item.property.cover_image_url,
            added_at: item.created_at
          }));
        setWatchlist(formatted);
      }

    } catch (err) {
      console.error('CRITICAL FAILURE:', err);
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchDossier();
  }, [fetchDossier]);

  return { 
    profile, 
    watchlist, 
    preferences, 
    loading, 
    updatePreferences: async (newPrefs: Partial<HunterPreferences>) => {
        // Optimistic Update
        setPreferences(p => ({...p, ...newPrefs}));
        const { data: { user } } = await supabase.auth.getUser();
        if(user) await supabase.from('profiles').update({preferences: {...preferences, ...newPrefs}}).eq('id', user.id);
    }, 
    removeFromWatchlist: async (id: number) => {
        setWatchlist(prev => prev.filter(item => item.id !== id));
        await supabase.from('saved_properties').delete().eq('id', id);
    }
  };
}
