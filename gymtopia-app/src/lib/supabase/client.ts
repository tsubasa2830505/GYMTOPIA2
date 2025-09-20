import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import type { SupabaseDatabase } from '@/types/supabase'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || ''

// Singleton instance
let supabaseClient: SupabaseClient<SupabaseDatabase> | null = null

/**
 * Get or create the Supabase client instance
 * @returns Supabase client instance
 */
export function getSupabaseClient(): SupabaseClient<SupabaseDatabase> {
  // Build time check - return mock client
  if (typeof window === 'undefined' && (!supabaseUrl || !supabaseAnonKey)) {
    return createMockClient()
  }

  // Create client if not exists
  if (!supabaseClient) {
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error(
        'Supabase環境変数が設定されていません。' +
        'NEXT_PUBLIC_SUPABASE_URLとNEXT_PUBLIC_SUPABASE_ANON_KEYを.env.localに設定してください。'
      )
    }

    supabaseClient = createClient<SupabaseDatabase>(supabaseUrl, supabaseAnonKey, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
        flowType: 'pkce'
      },
      global: {
        headers: {
          'x-application-name': 'gymtopia'
        }
      }
    })
  }

  return supabaseClient
}

/**
 * Create a mock client for build time
 */
function createMockClient(): SupabaseClient<SupabaseDatabase> {
  const mock = {
    from: () => ({
      select: () => Promise.resolve({ data: [], error: null }),
      insert: () => Promise.resolve({ data: null, error: null }),
      update: () => Promise.resolve({ data: null, error: null }),
      delete: () => Promise.resolve({ data: null, error: null }),
      upsert: () => Promise.resolve({ data: null, error: null }),
    }),
    auth: {
      getUser: () => Promise.resolve({ data: { user: null }, error: null }),
      signOut: () => Promise.resolve({ error: null }),
      onAuthStateChange: () => ({
        data: {
          subscription: {
            id: '',
            callback: () => {},
            unsubscribe: () => {}
          }
        }
      }),
    },
    storage: {
      from: () => ({
        upload: () => Promise.resolve({ data: null, error: null }),
        getPublicUrl: () => ({ data: { publicUrl: '' } }),
      }),
    },
  }

  return mock as unknown as SupabaseClient<SupabaseDatabase>
}

// Export singleton instance
export const supabase = getSupabaseClient()
