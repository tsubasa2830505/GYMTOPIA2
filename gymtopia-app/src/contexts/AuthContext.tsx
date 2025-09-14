'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session } from '@supabase/supabase-js'
import { SessionUser, AuthState } from '@/lib/types/user'
import { getCurrentUser, onAuthStateChange, getSession } from '@/lib/supabase/auth'

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
  const [user, setUser] = useState<SessionUser | null>(null)
  const [session, setSession] = useState<Session | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isLoggedOut, setIsLoggedOut] = useState(false)

  const refreshUser = async () => {
    try {
      console.log('📱 AuthContext: Refreshing user...')
      const currentUser = await getCurrentUser()
      console.log('📱 AuthContext: User refreshed', { user: currentUser ? `${currentUser.displayName} (${currentUser.email})` : null })
      setUser(currentUser)
    } catch (error) {
      console.error('Error refreshing user:', error)
      setUser(null)
    }
  }

  const mockSignOut = () => {
    console.log('📱 AuthContext: Mock sign out')
    setUser(null)
    setSession(null)
    setIsLoggedOut(true)
  }

  useEffect(() => {
    // Check if we're in development mode and should use mock auth
    const isDevelopment = process.env.NODE_ENV === 'development'
    // For development, always use mock auth to avoid database dependency
    const useMockAuth = isDevelopment

    if (useMockAuth && !isLoggedOut) {
      console.log('📱 AuthContext: Using mock auth for development')
      // Set mock user for development
      const mockUser: SessionUser = {
        id: 'mock-user-id',
        email: 'test@gymtopia.app',
        username: 'muscle_taro',
        displayName: '筋トレマニア太郎',
        avatarUrl: '/muscle-taro-avatar.svg'
      }
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
      return
    } else if (useMockAuth && isLoggedOut) {
      console.log('📱 AuthContext: User is logged out, staying logged out')
      setUser(null)
      setSession(null)
      setIsLoading(false)
      return
    }

    // Initial session check
    getSession().then((session) => {
      console.log('📱 AuthContext: Initial session check', { session: !!session, userId: session?.user?.id })
      setSession(session)
      if (session) {
        refreshUser()
      } else {
        setUser(null)
        console.log('📱 AuthContext: No session found, user set to null')
      }
      setIsLoading(false)
    })

    // Listen for auth changes
    const { data: { subscription } } = onAuthStateChange((event, session) => {
      console.log('📱 AuthContext: Auth state change', { event, session: !!session, userId: session?.user?.id })
      setSession(session)
      
      if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
        refreshUser()
      } else if (event === 'SIGNED_OUT') {
        setUser(null)
        console.log('📱 AuthContext: User signed out, user set to null')
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