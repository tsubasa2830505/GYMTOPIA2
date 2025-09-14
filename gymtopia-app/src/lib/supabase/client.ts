import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'

// Debug logging for environment variables (only in development)
if (process.env.NODE_ENV === 'development') {
  console.log('Supabase Client Debug:', {
    url: supabaseUrl,
    keyExists: !!supabaseAnonKey && supabaseAnonKey !== 'placeholder-key',
    keyStart: supabaseAnonKey.substring(0, 20) + '...'
  })
}

// Create singleton instance
let supabaseClient: ReturnType<typeof createClient> | null = null

export function getSupabaseClient() {
  if (!supabaseClient) {
    supabaseClient = createClient(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true
      }
    })
  }
  return supabaseClient
}

// Export a singleton instance
export const supabase = getSupabaseClient()