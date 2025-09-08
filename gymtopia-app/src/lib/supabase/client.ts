import { createClient } from '@supabase/supabase-js'

// Get Supabase client with environment variables
export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  
  if (!supabaseUrl || !supabaseAnonKey) {
    // Return a mock client in build time
    if (typeof window === 'undefined') {
      return createClient('https://placeholder.supabase.co', 'placeholder-key')
    }
    throw new Error('Supabase configuration is missing')
  }
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Export a singleton instance for client-side use
let supabaseInstance: ReturnType<typeof createClient> | null = null

export function getSupabase() {
  if (!supabaseInstance) {
    supabaseInstance = getSupabaseClient()
  }
  return supabaseInstance
}

// For backward compatibility
export const supabase = getSupabase()