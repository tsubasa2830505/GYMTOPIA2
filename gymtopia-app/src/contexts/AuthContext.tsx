'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { Session } from '@supabase/supabase-js'
import { createBrowserClient } from '@supabase/ssr'
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
    logger.log('📱 AuthContext: Sign out')
    setUser(null)
    setSession(null)
  }

  useEffect(() => {
    logger.log('🚀🚀🚀 AuthProvider useEffect triggered 🚀🚀🚀')

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