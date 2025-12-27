import { useEffect, useState } from 'react';
import { supabase } from '../lib/supabase';
import { useAuth } from './useAuth';
import type { UserProfile, WatchlistItem, HunterPreferences } from '../types/asta_types';

export function useProfile() {
  const { user } = useAuth();
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [watchlist, setWatchlist] = useState<WatchlistItem[]>([]);
  const [preferences, setPreferences] = useState<HunterPreferences>({
    locations: ['East Legon', 'Cantonments'],
    min_price: 0,
    max_price: 15000,
    property_type: 'rent',
    whatsapp_alerts: true
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      fetchDossier();
    } else {
      setLoading(false);
    }
  }, [user]);

  async function fetchDossier() {
    try {
      setLoading(true);
      
      // 1. Fetch Profile
      const { data: profileData, error: profileError } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();

      if (!profileError && profileData) {
        setProfile({
          id: profileData.id,
          full_name: profileData.full_name || user?.email?.split('@')[0] || 'Scout',
          email: profileData.email || user?.email || '',
          avatar_url: profileData.avatar_url,
          reputation_score: profileData.reputation_score || 150,
          rank_title: profileData.rank_title as any || 'Scout',
          impact_stat: 12,
          joined_at: profileData.created_at
        });
      } else {
        // Fallback for new users without a profile record yet
        setProfile({
          id: user?.id || '',
          full_name: user?.email?.split('@')[0] || 'New Scout',
          email: user?.email || '',
          reputation_score: 50,
          rank_title: 'Observer',
          impact_stat: 0,
          joined_at: new Date().toISOString()
        });
      }

      // 2. Fetch Watchlist (Mocked for now to show the UI)
      setWatchlist([
        {
          id: 1,
          property_id: 101,
          title: "Modern 2-Bed Suite",
          location_name: "East Legon",
          current_price: 4500,
          original_price: 5000,
          image_url: "https://images.unsplash.com/photo-1600585154340-be6161a56a0c",
          status: 'active',
          vibe_status: 'verified'
        }
      ]);

    } catch (e) {
      console.error('Dossier Error:', e);
    } finally {
      setLoading(false);
    }
  }

  const updatePreferences = async (newPrefs: HunterPreferences) => {
    setPreferences(newPrefs);
  };

  const removeFromWatchlist = async (id: number) => {
    setWatchlist(prev => prev.filter(item => item.id !== id));
  };

  return {
    profile,
    watchlist,
    preferences,
    loading,
    updatePreferences,
    removeFromWatchlist
  };
}
