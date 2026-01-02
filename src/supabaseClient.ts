import { createClient } from '@supabase/supabase-js';

// We must use the exact names from your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase Environment Variables. Check your .env file!');
}

// 🛡️ SINGLETON: This is the ONLY place createClient should be called.
export const supabase = createClient(supabaseUrl, supabaseKey);
