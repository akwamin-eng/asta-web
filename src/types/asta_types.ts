export interface UserProfile {
  id: string;
  email: string;
  full_name: string;
  phone_number?: string;
  avatar_url?: string;
  role: 'user' | 'agent' | 'admin';
  rank_title: 'Observer' | 'Scout' | 'Elite' | 'Legend';
  reputation_score: number;
  impact_stat: number; // e.g., "Listings Verified"
  
  // New Identity Fields
  verification_tier: 'basic' | 'verified_scout' | 'pro_agent';
  scout_segment: 'buyer' | 'renter' | 'investor_diaspora' | 'investor_local' | 'agent' | 'developer';
  linkedin_url?: string;
  organization_name?: string;
}

export interface HunterPreferences {
  locations: string[];
  budget_max: number;
  property_type: string[];
  lifestyle_tags: string[]; // e.g. "Security", "Nightlife"
  alerts_enabled: boolean;
  deal_trigger_percent: number; // e.g. 5, 10
}

export interface WatchlistItem {
  id: number;
  property_id: number;
  title: string;
  location: string;
  current_price: number;
  original_price: number; // To calculate drops
  image_url: string;
  added_at: string;
}
