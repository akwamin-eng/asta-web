import { createClient } from '@supabase/supabase-js';

// We must use the exact names from your .env file
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseKey = import.meta.env.VITE_SUPABASE_ANON_KEY; // 👈 This was the mismatch

if (!supabaseUrl || !supabaseKey) {
  throw new Error('Missing Supabase Environment Variables. Check your .env file!');
}

export const supabase = createClient(supabaseUrl, supabaseKey);
