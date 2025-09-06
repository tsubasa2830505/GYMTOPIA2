import { createClient } from '@supabase/supabase-js'
import type { 
  User,
  UserProfile,
  UserWithProfile,
  UserRegistrationData,
  UserLoginData,
  UserUpdateData,
  UserProfileUpdateData,
  SessionUser,
  DatabaseUser,
  DatabaseUserProfile
} from '@/lib/types/user'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// =============================================
// Helper Functions
// =============================================

function mapDatabaseUser(dbUser: DatabaseUser): User {
  return {
    id: dbUser.id,
    email: dbUser.email,
    username: dbUser.username || undefined,
    displayName: dbUser.display_name || undefined,
    avatarUrl: dbUser.avatar_url || undefined,
    bio: dbUser.bio || undefined,
    isActive: dbUser.is_active,
    emailVerified: dbUser.email_verified,
    createdAt: dbUser.created_at,
    updatedAt: dbUser.updated_at,
    lastSeenAt: dbUser.last_seen_at || undefined
  }
}

function mapDatabaseProfile(dbProfile: DatabaseUserProfile): UserProfile {
  return {
    userId: dbProfile.user_id,
    gymExperienceYears: dbProfile.gym_experience_years || undefined,
    trainingFrequency: dbProfile.training_frequency as any || undefined,
    trainingGoals: dbProfile.training_goals as any || undefined,
    preferredTrainingTime: dbProfile.preferred_training_time as any || undefined,
    heightCm: dbProfile.height_cm || undefined,
    weightKg: dbProfile.weight_kg || undefined,
    bodyFatPercentage: dbProfile.body_fat_percentage || undefined,
    profileVisibility: dbProfile.profile_visibility as any || 'public',
    showStats: dbProfile.show_stats,
    createdAt: dbProfile.created_at,
    updatedAt: dbProfile.updated_at
  }
}

// =============================================
// Authentication Functions
// =============================================

export async function signUp(data: UserRegistrationData) {
  try {
    const { data: authData, error: authError } = await supabase.auth.signUp({
      email: data.email,
      password: data.password,
      options: {
        data: {
          display_name: data.displayName,
          username: data.username
        }
      }
    })

    if (authError) throw authError

    if (authData.user) {
      // Update the public.users table with additional info
      if (data.username || data.displayName) {
        const updates: any = {}
        if (data.username) updates.username = data.username
        if (data.displayName) updates.display_name = data.displayName

        const { error: updateError } = await supabase
          .from('users')
          .update(updates)
          .eq('id', authData.user.id)

        if (updateError) {
          console.warn('Failed to update user profile:', updateError)
        }
      }
    }

    return { user: authData.user, session: authData.session, error: null }
  } catch (error: any) {
    console.error('Sign up error:', error)
    return { user: null, session: null, error: error.message }
  }
}

export async function signIn(data: UserLoginData) {
  try {
    const { data: authData, error } = await supabase.auth.signInWithPassword({
      email: data.email,
      password: data.password
    })

    if (error) throw error

    // Update last_seen_at
    if (authData.user) {
      await supabase
        .from('users')
        .update({ last_seen_at: new Date().toISOString() })
        .eq('id', authData.user.id)
    }

    return { user: authData.user, session: authData.session, error: null }
  } catch (error: any) {
    console.error('Sign in error:', error)
    return { user: null, session: null, error: error.message }
  }
}

export async function signOut() {
  try {
    const { error } = await supabase.auth.signOut()
    if (error) throw error
    return { error: null }
  } catch (error: any) {
    console.error('Sign out error:', error)
    return { error: error.message }
  }
}

export async function resetPassword(email: string) {
  try {
    const { error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${window.location.origin}/auth/reset-password`
    })
    if (error) throw error
    return { error: null }
  } catch (error: any) {
    console.error('Reset password error:', error)
    return { error: error.message }
  }
}

export async function updatePassword(newPassword: string) {
  try {
    const { error } = await supabase.auth.updateUser({
      password: newPassword
    })
    if (error) throw error
    return { error: null }
  } catch (error: any) {
    console.error('Update password error:', error)
    return { error: error.message }
  }
}

// =============================================
// User Profile Functions
// =============================================

export async function getCurrentUser(): Promise<SessionUser | null> {
  try {
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) return null

    const { data: userData, error } = await supabase
      .from('users')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error || !userData) {
      return {
        id: user.id,
        email: user.email!,
        username: undefined,
        displayName: undefined,
        avatarUrl: undefined
      }
    }

    return {
      id: userData.id,
      email: userData.email,
      username: userData.username || undefined,
      displayName: userData.display_name || undefined,
      avatarUrl: userData.avatar_url || undefined
    }
  } catch (error) {
    console.error('Get current user error:', error)
    return null
  }
}

export async function getUserProfile(userId: string): Promise<UserWithProfile | null> {
  try {
    const { data: userData, error: userError } = await supabase
      .from('users')
      .select('*')
      .eq('id', userId)
      .single()

    if (userError || !userData) return null

    const { data: profileData } = await supabase
      .from('user_profiles')
      .select('*')
      .eq('user_id', userId)
      .single()

    const user = mapDatabaseUser(userData)
    const profile = profileData ? mapDatabaseProfile(profileData) : undefined

    return { ...user, profile }
  } catch (error) {
    console.error('Get user profile error:', error)
    return null
  }
}

export async function updateUserProfile(userId: string, data: UserUpdateData) {
  try {
    const updates: any = {}
    if (data.username !== undefined) updates.username = data.username
    if (data.displayName !== undefined) updates.display_name = data.displayName
    if (data.avatarUrl !== undefined) updates.avatar_url = data.avatarUrl
    if (data.bio !== undefined) updates.bio = data.bio

    const { data: updatedUser, error } = await supabase
      .from('users')
      .update(updates)
      .eq('id', userId)
      .select()
      .single()

    if (error) throw error

    return { user: mapDatabaseUser(updatedUser), error: null }
  } catch (error: any) {
    console.error('Update user profile error:', error)
    return { user: null, error: error.message }
  }
}

export async function updateUserExtendedProfile(userId: string, data: UserProfileUpdateData) {
  try {
    const updates: any = {}
    if (data.gymExperienceYears !== undefined) updates.gym_experience_years = data.gymExperienceYears
    if (data.trainingFrequency !== undefined) updates.training_frequency = data.trainingFrequency
    if (data.trainingGoals !== undefined) updates.training_goals = data.trainingGoals
    if (data.preferredTrainingTime !== undefined) updates.preferred_training_time = data.preferredTrainingTime
    if (data.heightCm !== undefined) updates.height_cm = data.heightCm
    if (data.weightKg !== undefined) updates.weight_kg = data.weightKg
    if (data.bodyFatPercentage !== undefined) updates.body_fat_percentage = data.bodyFatPercentage
    if (data.profileVisibility !== undefined) updates.profile_visibility = data.profileVisibility
    if (data.showStats !== undefined) updates.show_stats = data.showStats

    const { data: profileData, error } = await supabase
      .from('user_profiles')
      .upsert({ user_id: userId, ...updates })
      .select()
      .single()

    if (error) throw error

    return { profile: mapDatabaseProfile(profileData), error: null }
  } catch (error: any) {
    console.error('Update extended profile error:', error)
    return { profile: null, error: error.message }
  }
}

// =============================================
// Session Management
// =============================================

export async function getSession() {
  try {
    const { data: { session } } = await supabase.auth.getSession()
    return session
  } catch (error) {
    console.error('Get session error:', error)
    return null
  }
}

export function onAuthStateChange(callback: (event: string, session: any) => void) {
  return supabase.auth.onAuthStateChange(callback)
}

// =============================================
// User Search Functions
// =============================================

export async function searchUsers(query: string, limit = 10) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id, username, display_name, avatar_url')
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .eq('is_active', true)
      .limit(limit)

    if (error) throw error

    return { users: data || [], error: null }
  } catch (error: any) {
    console.error('Search users error:', error)
    return { users: [], error: error.message }
  }
}

export async function checkUsernameAvailability(username: string): Promise<boolean> {
  try {
    const { data, error } = await supabase
      .from('users')
      .select('id')
      .eq('username', username)
      .single()

    return !data && !error
  } catch (error) {
    return true
  }
}