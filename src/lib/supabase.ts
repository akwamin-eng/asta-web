import { createClient } from '@supabase/supabase-js';

// 1. Get Environment Variables
const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  throw new Error('MISSING SUPABASE ENV VARIABLES. Please check .env file.');
}

// 2. Create a Single Instance
// By exporting 'const', this instance is cached by the bundler and reused everywhere.
export const supabase = createClient(supabaseUrl, supabaseAnonKey);
