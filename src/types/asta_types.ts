export interface UserProfile {
  id: string;
  full_name: string;
  email: string;
  avatar_url?: string;
  reputation_score: number;
  rank_title: 'Observer' | 'Scout' | 'Elite' | 'Legend';
  impact_stat: number;
  joined_at: string;
}

export interface WatchlistItem {
  id: number;
  property_id: number;
  title: string;
  location_name: string;
  current_price: number;
  original_price: number;
  image_url: string;
  status: 'active' | 'sold' | 'rented';
  vibe_status: 'safe' | 'sus' | 'verified';
  notes?: string;
}

export interface HunterPreferences {
  locations: string[];
  min_price: number;
  max_price: number;
  property_type: 'rent' | 'sale';
  whatsapp_alerts: boolean;
}
