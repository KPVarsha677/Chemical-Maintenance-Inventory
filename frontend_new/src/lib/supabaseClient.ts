import { createClient, type SupabaseClient } from '@supabase/supabase-js';

const env = (import.meta as { env?: Record<string, string | undefined> }).env ?? {};

const supabaseUrl = env.VITE_SUPABASE_URL;
const supabaseAnonKey = env.VITE_SUPABASE_ANON_KEY;

/** Whether real Supabase credentials were found in the environment. */
export const supabaseConfigured = Boolean(supabaseUrl && supabaseAnonKey);

if (!supabaseConfigured) {
  console.error(
    'Missing VITE_SUPABASE_URL / VITE_SUPABASE_ANON_KEY. Copy frontend_new/.env.example ' +
    'to frontend_new/.env and fill in your Supabase project\'s URL and anon key — auth will not work until then.'
  );
}

// Falls back to a syntactically valid placeholder so the client can always be
// constructed without throwing; any real call will simply fail cleanly (and
// be caught by AuthContext) until real credentials are supplied.
export const supabase: SupabaseClient = createClient(
  supabaseUrl || 'https://placeholder.supabase.co',
  supabaseAnonKey || 'placeholder-anon-key',
  {
    auth: {
      persistSession: true,
      autoRefreshToken: true,
      detectSessionInUrl: true
    }
  }
);
