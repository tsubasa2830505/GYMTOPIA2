'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session } from '@supabase/supabase-js'
import { SessionUser, AuthState } from '@/lib/types/user'
import { getCurrentUser, onAuthStateChange, getSession } from '@/lib/supabase/auth'
import { logger } from '@/lib/utils/logger'

interface AuthContextType extends AuthState {
  session: Session | null
  refreshUser: () => Promise<void>
  mockSignOut: () => void
}

const AuthContext = createContext<AuthContextType>({
  user: null,
  session: null,
  isLoading: true,
  isAuthenticated: false,
  refreshUser: async () => {},
  mockSignOut: () => {}
})

export function AuthProvider({ children }: { children: ReactNode }) {
  logger.debug('AuthProvider initialized')
  const [user, setUser] = useState<SessionUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedOut, setIsLoggedOut] = useState(false)

  const refreshUser = async () => {
    try {
      logger.log('📱 AuthContext: Refreshing user...')
      const currentUser = await getCurrentUser()
      logger.log('📱 AuthContext: User refreshed', { user: currentUser ? `${currentUser.displayName} (${currentUser.email})` : null })
      setUser(currentUser)
    } catch (error) {
      logger.error('Error refreshing user:', error)
      setUser(null)
    }
  }

  const mockSignOut = () => {
    logger.log('📱 AuthContext: Mock sign out')
    setUser(null)
    setSession(null)
    setIsLoggedOut(true)
  }

  useEffect(() => {
    logger.log('🚀🚀🚀 AuthProvider useEffect triggered 🚀🚀🚀')
    // Check if we should use mock auth (for development or testing in production)
    const useMockAuth = process.env.NEXT_PUBLIC_USE_MOCK_AUTH === 'true'
    logger.log('🔧 NEXT_PUBLIC_USE_MOCK_AUTH:', process.env.NEXT_PUBLIC_USE_MOCK_AUTH)
    logger.log('🔧 useMockAuth:', useMockAuth)
    logger.log('🔧 isLoggedOut:', isLoggedOut)

    if (useMockAuth && !isLoggedOut) {
      logger.log('📱 AuthContext: Using mock auth for development')
      // Get mock user data from environment variables or use defaults
      const mockUser: SessionUser = {
        id: process.env.NEXT_PUBLIC_MOCK_USER_ID || '8ac9e2a5-a702-4d04-b871-21e4a423b4ac',
        email: process.env.NEXT_PUBLIC_MOCK_USER_EMAIL || 'tsubasa.a.283.0505@gmail.com',
        username: process.env.NEXT_PUBLIC_MOCK_USERNAME || 'tsubasa_gym',
        displayName: process.env.NEXT_PUBLIC_MOCK_DISPLAY_NAME || 'Tsubasa',
        avatarUrl: process.env.NEXT_PUBLIC_MOCK_AVATAR_URL || null
      }
      logger.log('📱 AuthContext: Setting mock user:', mockUser)
      setUser(mockUser)
      setSession({
        access_token: 'mock-token',
        refresh_token: 'mock-refresh',
        expires_in: 3600,
        expires_at: Date.now() + 3600000,
        token_type: 'bearer',
        user: {
          id: mockUser.id,
          email: mockUser.email!,
          user_metadata: { username: mockUser.username, display_name: mockUser.displayName }
        }
      } as any)
      setIsLoading(false)
      logger.log('📱 AuthContext: Mock auth setup complete')
      return
    } else if (useMockAuth && isLoggedOut) {
      logger.log('📱 AuthContext: User is logged out, staying logged out')
      setUser(null)
      setSession(null)
      setIsLoading(false)
      return
    }

    // Initial session check
    getSession().then((session) => {
      logger.log('📱 AuthContext: Initial session check', { session: !!session, userId: session?.user?.id })
      setSession(session)
      if (session) {
        refreshUser()
      } else {
        setUser(null)
        logger.log('📱 AuthContext: No session found, user set to null')
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      logger.log('📱 AuthContext: Auth state change', { event, session: !!session, userId: session?.user?.id })
      setSession(session)
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        refreshUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        logger.log('📱 AuthContext: User signed out, user set to null')
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [])

  const value: AuthContextType = {
    user,
    session,
    isLoading,
    isAuthenticated: !!user,
    refreshUser,
    mockSignOut
  }

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}