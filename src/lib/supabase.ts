// 🔄 Redirecting to the main Singleton
// This prevents "Multiple GoTrueClient" warnings
import { supabase } from '../supabaseClient';

export { supabase };
export const supabaseClient = supabase;
