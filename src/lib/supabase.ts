import { createClient } from '@supabase/supabase-js';

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL;
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY;

// Only throw error if we're trying to use Supabase but it's not configured
const isConfigured = supabaseUrl && supabaseAnonKey && 
  !supabaseUrl.includes('your-project-url') && 
  !supabaseAnonKey.includes('your-anon-key');

export const supabase = isConfigured 
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: false
      }
    })
  : null;