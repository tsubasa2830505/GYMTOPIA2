import { supabase } from './client'


// Search users
export async function searchUsers(
  query: string,
  limit = 20,
  offset = 0
) {
  try {
    const { data, error } = await supabase
      .from('users')
      .select(`
        id,
        username,
        display_name,
        avatar_url,
        bio,
        created_at
      `)
      .or(`username.ilike.%${query}%,display_name.ilike.%${query}%`)
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error searching users:', error)
    return { data: null, error }
  }
}

// Search gyms
export async function searchGyms(
  query: string,
  filters?: {
    prefecture?: string
    city?: string
    has24h?: boolean
    hasParking?: boolean
    hasShower?: boolean
    hasLocker?: boolean
    hasSauna?: boolean
  },
  limit = 20,
  offset = 0
) {
  try {
    let queryBuilder = supabase
      .from('gyms')
      .select(`
        *,
        equipment_count:gym_equipment(count)
      `)

    // Text search
    if (query) {
      queryBuilder = queryBuilder.or(
        `name.ilike.%${query}%,description.ilike.%${query}%,address.ilike.%${query}%`
      )
    }

    // Apply filters
    if (filters) {
      if (filters.prefecture) {
        queryBuilder = queryBuilder.eq('prefecture', filters.prefecture)
      }
      if (filters.city) {
        queryBuilder = queryBuilder.eq('city', filters.city)
      }
      if (filters.has24h !== undefined) {
        queryBuilder = queryBuilder.eq('has_24h', filters.has24h)
      }
      if (filters.hasParking !== undefined) {
        queryBuilder = queryBuilder.eq('has_parking', filters.hasParking)
      }
      if (filters.hasShower !== undefined) {
        queryBuilder = queryBuilder.eq('has_shower', filters.hasShower)
      }
      if (filters.hasLocker !== undefined) {
        queryBuilder = queryBuilder.eq('has_locker', filters.hasLocker)
      }
      if (filters.hasSauna !== undefined) {
        queryBuilder = queryBuilder.eq('has_sauna', filters.hasSauna)
      }
    }

    const { data, error } = await queryBuilder
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error searching gyms:', error)
    return { data: null, error }
  }
}

// Search machines/equipment
export async function searchMachines(
  query: string,
  filters?: {
    muscleGroup?: string
    equipmentType?: string
    brand?: string
  },
  limit = 20,
  offset = 0
) {
  try {
    let queryBuilder = supabase
      .from('machines')
      .select(`
        *,
        gyms_count:gym_equipment(count)
      `)

    // Text search
    if (query) {
      queryBuilder = queryBuilder.or(
        `name.ilike.%${query}%,description.ilike.%${query}%`
      )
    }

    // Apply filters
    if (filters) {
      if (filters.muscleGroup) {
        queryBuilder = queryBuilder.contains('muscle_groups', [filters.muscleGroup])
      }
      if (filters.equipmentType) {
        queryBuilder = queryBuilder.eq('equipment_type', filters.equipmentType)
      }
      if (filters.brand) {
        queryBuilder = queryBuilder.eq('brand', filters.brand)
      }
    }

    const { data, error } = await queryBuilder
      .range(offset, offset + limit - 1)
      .order('name', { ascending: true })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error searching machines:', error)
    return { data: null, error }
  }
}

// Search posts
export async function searchPosts(
  query: string,
  filters?: {
    userId?: string
    gymId?: string
    hasImage?: boolean
  },
  limit = 20,
  offset = 0
) {
  try {
    let queryBuilder = supabase
      .from('gym_posts')
      .select(`
        *,
        user:user_id(id, username, display_name, avatar_url),
        gym:gym_id(id, name),
        likes:post_likes(count),
        comments:post_comments(count)
      `)
      .eq('is_public', true)

    // Text search
    if (query) {
      queryBuilder = queryBuilder.or(
        `content.ilike.%${query}%`
      )
    }

    // Apply filters
    if (filters) {
      if (filters.userId) {
        queryBuilder = queryBuilder.eq('user_id', filters.userId)
      }
      if (filters.gymId) {
        queryBuilder = queryBuilder.eq('gym_id', filters.gymId)
      }
      if (filters.hasImage) {
        queryBuilder = queryBuilder.not('image_url', 'is', null)
      }
    }

    const { data, error } = await queryBuilder
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error searching posts:', error)
    return { data: null, error }
  }
}

// Get trending hashtags
export async function getTrendingHashtags(limit = 10) {
  try {
    // This would ideally be a materialized view or cached data
    // For now, we'll extract hashtags from recent posts
    const { data: posts } = await supabase
      .from('gym_posts')
      .select('content')
      .eq('is_public', true)
      .order('created_at', { ascending: false })
      .limit(100)

    if (!posts) return { data: [], error: null }

    // Extract hashtags
    const hashtagCounts: Record<string, number> = {}
    posts.forEach(post => {
      const hashtags = post.content.match(/#[\w\u3040-\u309F\u30A0-\u30FF\u4E00-\u9FAF]+/g) || []
      hashtags.forEach(tag => {
        hashtagCounts[tag] = (hashtagCounts[tag] || 0) + 1
      })
    })

    // Sort by frequency
    const trending = Object.entries(hashtagCounts)
      .sort(([, a], [, b]) => b - a)
      .slice(0, limit)
      .map(([tag, count]) => ({ tag, count }))

    return { data: trending, error: null }
  } catch (error) {
    console.error('Error fetching trending hashtags:', error)
    return { data: null, error }
  }
}

// Get discover content (personalized recommendations)
export async function getDiscoverContent(
  userId: string,
  limit = 20,
  offset = 0
) {
  try {
    // Get user's interests based on their activity
    const { data: userGyms } = await supabase
      .from('workout_sessions')
      .select('gym_id')
      .eq('user_id', userId)
      .not('gym_id', 'is', null)
      .limit(5)

    const { data: following } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', userId)

    const followingIds = following?.map(f => f.following_id) || []
    const gymIds = userGyms?.map(g => g.gym_id) || []

    // Get posts from gyms user visits or from users they don't follow yet
    let queryBuilder = supabase
      .from('gym_posts')
      .select(`
        *,
        user:user_id(id, username, display_name, avatar_url),
        gym:gym_id(id, name),
        likes:post_likes(count),
        comments:post_comments(count)
      `)
      .eq('is_public', true)
      .neq('user_id', userId)

    // Exclude posts from users already following
    if (followingIds.length > 0) {
      queryBuilder = queryBuilder.not('user_id', 'in', `(${followingIds.join(',')})`)
    }

    // Prioritize posts from familiar gyms
    if (gymIds.length > 0) {
      queryBuilder = queryBuilder.or(`gym_id.in.(${gymIds.join(',')}),gym_id.is.null`)
    }

    const { data, error } = await queryBuilder
      .range(offset, offset + limit - 1)
      .order('created_at', { ascending: false })

    if (error) throw error
    return { data, error: null }
  } catch (error) {
    console.error('Error fetching discover content:', error)
    return { data: null, error }
  }
}

// Get nearby gyms
export async function getNearbyGyms(
  latitude: number,
  longitude: number,
  radiusKm = 5,
  limit = 10
) {
  try {
    // Using PostGIS for geographical queries if available
    // Otherwise, simple approximation
    const { data, error } = await supabase
      .rpc('get_nearby_gyms', {
        lat: latitude,
        lng: longitude,
        radius_km: radiusKm,
        max_results: limit
      })

    if (error) {
      // Fallback to simple query if RPC doesn't exist
      const { data: gyms } = await supabase
        .from('gyms')
        .select('*')
        .limit(limit)

      return { data: gyms, error: null }
    }

    return { data, error: null }
  } catch (error) {
    console.error('Error fetching nearby gyms:', error)
    return { data: null, error }
  }
}

// Search exercises
export async function searchExercises(
  query: string,
  muscleGroup?: string,
  limit = 20
) {
  try {
    // This could be a separate exercises table or derived from workout data
    const { data: exercises } = await supabase
      .from('workout_exercises')
      .select('exercise_name, muscle_group')
      .ilike('exercise_name', `%${query}%`)
      .limit(100)

    if (!exercises) return { data: [], error: null }

    // Deduplicate and count
    const exerciseMap = new Map<string, { name: string; muscle_group: string | null; count: number }>()
    
    exercises.forEach(ex => {
      const key = ex.exercise_name.toLowerCase()
      if (!exerciseMap.has(key)) {
        exerciseMap.set(key, {
          name: ex.exercise_name,
          muscle_group: ex.muscle_group,
          count: 1
        })
      } else {
        const existing = exerciseMap.get(key)!
        existing.count++
      }
    })

    let results = Array.from(exerciseMap.values())

    // Filter by muscle group if specified
    if (muscleGroup) {
      results = results.filter(ex => ex.muscle_group === muscleGroup)
    }

    // Sort by popularity and limit
    results.sort((a, b) => b.count - a.count)
    results = results.slice(0, limit)

    return { data: results, error: null }
  } catch (error) {
    console.error('Error searching exercises:', error)
    return { data: null, error }
  }
}
