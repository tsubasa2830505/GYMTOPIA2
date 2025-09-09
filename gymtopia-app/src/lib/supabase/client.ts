import { createClient } from '@supabase/supabase-js'

// Get Supabase client with environment variables
export function getSupabaseClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co'
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || 'placeholder-key'
  
  return createClient(supabaseUrl, supabaseAnonKey)
}

// Export a singleton instance
export const supabase = getSupabaseClient()