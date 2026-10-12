// ====================================================================
// Beetorial Supabase Client Configuration
// ====================================================================

import { createClient, SupabaseClient } from '@supabase/supabase-js'

const supabaseUrl = import.meta.env.VITE_SUPABASE_URL || ''
const supabaseAnonKey = import.meta.env.VITE_SUPABASE_ANON_KEY || ''

/**
 * Validates whether Supabase connection credentials have been configured.
 * A non-empty URL and Anon Key are required.
 */
export function isSupabaseConfigured(): boolean {
  return Boolean(
    supabaseUrl &&
    supabaseUrl.trim() !== '' &&
    supabaseAnonKey &&
    supabaseAnonKey.trim() !== '' &&
    !supabaseUrl.includes('your-project')
  )
}

// SECURITY AUDIT:
// Service role keys MUST NEVER be bundled into frontend client code.
// Only the public anon key is safe for browser clients.
export const supabase: SupabaseClient | null = isSupabaseConfigured()
  ? createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        autoRefreshToken: true,
        persistSession: true,
        detectSessionInUrl: true,
      },
    })
  : null
