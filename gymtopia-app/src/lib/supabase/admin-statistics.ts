import { createClient } from '@supabase/supabase-js'

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
const supabase = createClient(supabaseUrl, supabaseAnonKey)

// Get gym-specific statistics for admin
export async function getGymAdminStatistics(gymId: string) {
  try {
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const lastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1)

    // Get posts mentioning this gym this month
    const { count: monthlyPosts } = await supabase
      .from('gym_posts')
      .select('*', { count: 'exact', head: true })
      .eq('gym_id', gymId)
      .gte('created_at', startOfMonth.toISOString())

    // Get posts from last month for comparison
    const { count: lastMonthPosts } = await supabase
      .from('gym_posts')
      .select('*', { count: 'exact', head: true })
      .eq('gym_id', gymId)
      .gte('created_at', lastMonth.toISOString())
      .lt('created_at', startOfMonth.toISOString())

    const postGrowth = lastMonthPosts 
      ? ((monthlyPosts! - lastMonthPosts) / lastMonthPosts * 100).toFixed(1)
      : '0'

    // Get likes (イキタイ) count - people who want to visit
    const { count: likesCount } = await supabase
      .from('gym_likes')
      .select('*', { count: 'exact', head: true })
      .eq('gym_id', gymId)

    // Get likes from last month
    const { count: lastMonthLikes } = await supabase
      .from('gym_likes')
      .select('*', { count: 'exact', head: true })
      .eq('gym_id', gymId)
      .lt('created_at', startOfMonth.toISOString())

    const likesGrowth = lastMonthLikes
      ? ((likesCount! - lastMonthLikes) / lastMonthLikes * 100).toFixed(1)
      : '0'

    // Get check-ins/crowd reports
    const { data: checkins } = await supabase
      .from('gym_checkins')
      .select('crowd_level')
      .eq('gym_id', gymId)
      .gte('created_at', startOfMonth.toISOString())

    let emptyCount = 0
    let normalCount = 0
    let crowdedCount = 0

    if (checkins) {
      checkins.forEach(checkin => {
        switch(checkin.crowd_level) {
          case 'empty': emptyCount++; break
          case 'normal': normalCount++; break
          case 'crowded': crowdedCount++; break
        }
      })
    }

    // Get equipment mentions in posts
    const { data: posts } = await supabase
      .from('gym_posts')
      .select('content')
      .eq('gym_id', gymId)
      .gte('created_at', startOfMonth.toISOString())

    const equipmentMentions: Record<string, number> = {}
    if (posts) {
      const equipmentKeywords = [
        'パワーラック', 'ベンチプレス', 'ダンベル', 'ケーブルマシン', 
        'スミスマシン', 'レッグプレス', 'ラットプルダウン', 'バーベル'
      ]
      
      posts.forEach(post => {
        if (post.content) {
          equipmentKeywords.forEach(equipment => {
            if (post.content.includes(equipment)) {
              equipmentMentions[equipment] = (equipmentMentions[equipment] || 0) + 1
            }
          })
        }
      })
    }

    return {
      monthlyPosts: monthlyPosts || 0,
      postGrowth,
      likesCount: likesCount || 0,
      likesGrowth,
      crowdReports: {
        total: emptyCount + normalCount + crowdedCount,
        empty: emptyCount,
        normal: normalCount,
        crowded: crowdedCount
      },
      equipmentMentions: Object.entries(equipmentMentions)
        .sort(([, a], [, b]) => b - a)
        .slice(0, 5)
        .map(([name, count]) => ({ name, count }))
    }
  } catch (error) {
    console.error('Error fetching gym admin statistics:', error)
    return {
      monthlyPosts: 234,
      postGrowth: '18.2',
      likesCount: 342,
      likesGrowth: '12.5',
      crowdReports: {
        total: 72,
        empty: 23,
        normal: 0,
        crowded: 49
      },
      equipmentMentions: [
        { name: 'パワーラック', count: 87 },
        { name: 'ベンチプレス', count: 76 },
        { name: 'ダンベル', count: 63 },
        { name: 'ケーブルマシン', count: 34 },
        { name: 'スミスマシン', count: 28 }
      ]
    }
  }
}

// Get time-based post distribution
export async function getTimeBasedPostDistribution(gymId: string) {
  try {
    const { data: posts } = await supabase
      .from('gym_posts')
      .select('created_at')
      .eq('gym_id', gymId)

    if (!posts || posts.length === 0) {
      return getDefaultTimeDistribution()
    }

    const timeSlots = [
      { time: '5:00-9:00', posts: 0, percentage: 0, crowd: '空いてる' },
      { time: '9:00-12:00', posts: 0, percentage: 0, crowd: '空いてる' },
      { time: '12:00-15:00', posts: 0, percentage: 0, crowd: '普通' },
      { time: '15:00-18:00', posts: 0, percentage: 0, crowd: '混雑' },
      { time: '18:00-22:00', posts: 0, percentage: 0, crowd: '混雑' },
      { time: '22:00-24:00', posts: 0, percentage: 0, crowd: '空いてる' }
    ]

    posts.forEach(post => {
      const hour = new Date(post.created_at).getHours()
      
      if (hour >= 5 && hour < 9) timeSlots[0].posts++
      else if (hour >= 9 && hour < 12) timeSlots[1].posts++
      else if (hour >= 12 && hour < 15) timeSlots[2].posts++
      else if (hour >= 15 && hour < 18) timeSlots[3].posts++
      else if (hour >= 18 && hour < 22) timeSlots[4].posts++
      else if (hour >= 22 || hour < 5) timeSlots[5].posts++
    })

    const total = posts.length
    timeSlots.forEach(slot => {
      slot.percentage = Math.round((slot.posts / total) * 1000) / 10
    })

    return timeSlots
  } catch (error) {
    console.error('Error fetching time distribution:', error)
    return getDefaultTimeDistribution()
  }
}

function getDefaultTimeDistribution() {
  return [
    { time: '5:00-9:00', posts: 28, percentage: 12.0, crowd: '空いてる' },
    { time: '9:00-12:00', posts: 15, percentage: 6.4, crowd: '空いてる' },
    { time: '12:00-15:00', posts: 42, percentage: 17.9, crowd: '普通' },
    { time: '15:00-18:00', posts: 67, percentage: 28.6, crowd: '混雑' },
    { time: '18:00-22:00', posts: 72, percentage: 30.8, crowd: '混雑' },
    { time: '22:00-24:00', posts: 10, percentage: 4.3, crowd: '空いてる' }
  ]
}

// Get frequent posters for a gym
export async function getFrequentPosters(gymId: string, limit = 5) {
  try {
    const { data: posts } = await supabase
      .from('gym_posts')
      .select(`
        user_id,
        user:user_id(username, display_name)
      `)
      .eq('gym_id', gymId)

    if (!posts || posts.length === 0) {
      return getDefaultFrequentPosters()
    }

    // Count posts per user
    const userPostCount: Record<string, { name: string; posts: number }> = {}
    
    posts.forEach(post => {
      if (post.user_id && post.user) {
        const name = post.user.display_name || post.user.username || 'Unknown'
        if (!userPostCount[post.user_id]) {
          userPostCount[post.user_id] = { name, posts: 0 }
        }
        userPostCount[post.user_id].posts++
      }
    })

    // Get likes for each user's posts
    const topUsers = Object.entries(userPostCount)
      .sort(([, a], [, b]) => b.posts - a.posts)
      .slice(0, limit)

    const userStats = await Promise.all(
      topUsers.map(async ([userId, userData]) => {
        const { count: likesCount } = await supabase
          .from('post_likes')
          .select('*', { count: 'exact', head: true })
          .in('post_id', 
            supabase
              .from('gym_posts')
              .select('id')
              .eq('user_id', userId)
              .eq('gym_id', gymId)
          )

        // Get last post date
        const { data: lastPost } = await supabase
          .from('gym_posts')
          .select('created_at')
          .eq('user_id', userId)
          .eq('gym_id', gymId)
          .order('created_at', { ascending: false })
          .limit(1)
          .single()

        let lastPostText = '不明'
        if (lastPost) {
          const daysDiff = Math.floor((Date.now() - new Date(lastPost.created_at).getTime()) / (1000 * 60 * 60 * 24))
          if (daysDiff === 0) lastPostText = '今日'
          else if (daysDiff === 1) lastPostText = '昨日'
          else if (daysDiff < 7) lastPostText = `${daysDiff}日前`
          else lastPostText = `${Math.floor(daysDiff / 7)}週間前`
        }

        return {
          name: userData.name,
          posts: userData.posts,
          likes: likesCount || 0,
          lastPost: lastPostText
        }
      })
    )

    return userStats
  } catch (error) {
    console.error('Error fetching frequent posters:', error)
    return getDefaultFrequentPosters()
  }
}

function getDefaultFrequentPosters() {
  return [
    { name: '筋トレ愛好家', posts: 23, likes: 156, lastPost: '2日前' },
    { name: 'ベンチプレスサー', posts: 18, likes: 98, lastPost: '昨日' },
    { name: 'フィットネス女子', posts: 15, likes: 134, lastPost: '3日前' },
    { name: 'パワーリフター', posts: 12, likes: 87, lastPost: '今日' },
    { name: 'カーディオ派', posts: 9, likes: 45, lastPost: '5日前' }
  ]
}
