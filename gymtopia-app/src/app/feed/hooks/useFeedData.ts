import { useState, useEffect } from 'react'
import { getFeedPosts, type Post } from '@/lib/supabase/posts'

interface FeedDataState {
  posts: Post[]
  isLoading: boolean
  isLoadingMore: boolean
  hasMore: boolean
  currentPage: number
  error: string | null
}

interface UseFeedDataReturn extends FeedDataState {
  loadInitialPosts: () => Promise<void>
  loadMorePosts: () => Promise<void>
  setPosts: React.Dispatch<React.SetStateAction<Post[]>>
  setError: React.Dispatch<React.SetStateAction<string | null>>
}

const POSTS_PER_PAGE = 20

const getSamplePosts = (): Post[] => [
  {
    id: 'sample-1',
    user_id: 'sample-user-1',
    gym_id: 'sample-gym-1',
    content: '今日も良いトレーニングができました！ベンチプレス100kg達成🔥\n\n久しぶりに新しいPRを更新できて嬉しいです。これからも頑張ります！',
    images: ['https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=1200&fit=crop&crop=center'],
    created_at: new Date().toISOString(),
    likes_count: 15,
    comments_count: 3,
    is_liked: false,
    user: {
      id: 'sample-user-1',
      display_name: 'フィットネス太郎',
      username: 'fitness_taro',
      avatar_url: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=200&h=200&fit=crop&crop=face'
    },
    gym: {
      name: 'エクサイズジム渋谷'
    },
    is_verified: true,
    check_in_id: 'sample-checkin-1',
    verification_method: 'check_in',
    distance_from_gym: 25,
    training_details: {
      gym_name: 'エクサイズジム渋谷',
      exercises: [
        {
          name: 'ベンチプレス',
          weight: 100,
          sets: 3,
          reps: 8
        },
        {
          name: 'スクワット',
          weight: 80,
          sets: 4,
          reps: 12
        },
        {
          name: 'デッドリフト',
          weight: 120,
          sets: 3,
          reps: 5
        }
      ],
      crowd_status: 'normal'
    }
  },
  {
    id: 'sample-2',
    user_id: 'sample-user-2',
    gym_id: 'sample-gym-2',
    content: '今日は有酸素運動の日！30分間のランニングで汗を流しました💦\n\n天気も良くて気持ちよかったです！',
    created_at: new Date(Date.now() - 3600000).toISOString(),
    likes_count: 8,
    comments_count: 2,
    is_liked: false,
    user: {
      id: 'sample-user-2',
      display_name: 'ランニング花子',
      username: 'running_hanako',
      avatar_url: 'https://images.unsplash.com/photo-1494790108755-2616b612b786?w=200&h=200&fit=crop&crop=face'
    },
    gym: {
      name: 'フィットネスジム新宿'
    },
    is_verified: false,
    verification_method: 'manual',
    training_details: {
      gym_name: 'フィットネスジム新宿',
      exercises: [
        {
          name: 'ランニング',
          weight: 0,
          sets: 1,
          reps: 30
        }
      ],
      crowd_status: 'empty'
    }
  },
  {
    id: 'sample-3',
    user_id: 'sample-user-3',
    gym_id: 'sample-gym-3',
    content: 'チェックインしてすぐに筋トレ開始！\n\n今日は胸と背中を集中的に鍛えました。近距離チェックインで高精度認証もバッチリ✨',
    created_at: new Date(Date.now() - 7200000).toISOString(),
    likes_count: 22,
    comments_count: 5,
    is_liked: true,
    user: {
      id: 'sample-user-3',
      display_name: 'マッスル一郎',
      username: 'muscle_ichiro',
      avatar_url: 'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=200&h=200&fit=crop&crop=face'
    },
    gym: {
      name: 'ゴールドジム銀座'
    },
    is_verified: true,
    check_in_id: 'sample-checkin-2',
    verification_method: 'check_in',
    distance_from_gym: 15,
    training_details: {
      gym_name: 'ゴールドジム銀座',
      exercises: [
        {
          name: 'ベンチプレス',
          weight: 120,
          sets: 4,
          reps: 6
        },
        {
          name: 'ラットプルダウン',
          weight: 90,
          sets: 3,
          reps: 10
        }
      ],
      crowd_status: 'crowded'
    }
  }
]

export function useFeedData(
  filter: 'all' | 'following' | 'mutual' | 'same-gym',
  userId: string | undefined
): UseFeedDataReturn {
  const [state, setState] = useState<FeedDataState>({
    posts: [],
    isLoading: true,
    isLoadingMore: false,
    hasMore: true,
    currentPage: 0,
    error: null
  })

  const loadInitialPosts = async () => {
    setState(prev => ({
      ...prev,
      isLoading: true,
      currentPage: 0,
      hasMore: true,
      error: null
    }))

    try {
      console.log('FeedPage: Loading initial posts with filter:', filter)

      let feedPosts: Post[] = []

      if (userId) {
        console.log('FeedPage: Authenticated user, loading personalized feed')
        feedPosts = await getFeedPosts(POSTS_PER_PAGE, 0, filter, userId)
      } else {
        console.log('FeedPage: Anonymous user, loading public feed')
        feedPosts = await getFeedPosts(POSTS_PER_PAGE, 0, 'all', null)
      }

      console.log('FeedPage: Database query result:', {
        count: feedPosts.length,
        isFromDatabase: feedPosts.length > 0 && !feedPosts[0].id.startsWith('sample-'),
        firstPost: feedPosts[0] || null,
        userAuthenticated: !!userId
      })

      if (feedPosts.length > 0) {
        setState(prev => ({
          ...prev,
          posts: feedPosts,
          hasMore: feedPosts.length === POSTS_PER_PAGE,
          isLoading: false
        }))
      } else {
        console.log('FeedPage: No posts found in database')
        setState(prev => ({
          ...prev,
          posts: [],
          hasMore: false,
          isLoading: false
        }))

        if (process.env.NODE_ENV === 'development') {
          console.log('FeedPage: Development mode - showing sample data')
          const samplePosts = getSamplePosts()
          setState(prev => ({
            ...prev,
            posts: samplePosts
          }))
        }
      }
    } catch (error) {
      console.error('FeedPage: Error loading posts:', {
        error,
        message: error instanceof Error ? error.message : 'Unknown error',
        stack: error instanceof Error ? error.stack : undefined,
        userAuthenticated: !!userId
      })

      setState(prev => ({
        ...prev,
        error: '投稿の読み込みに失敗しました',
        posts: [],
        hasMore: false,
        isLoading: false
      }))

      if (process.env.NODE_ENV === 'development') {
        console.log('FeedPage: Development mode - showing sample data after error')
        const samplePosts = getSamplePosts()
        setState(prev => ({
          ...prev,
          posts: samplePosts,
          hasMore: false
        }))
      }
    }
  }

  const loadMorePosts = async () => {
    if (!state.hasMore || state.isLoadingMore) return

    setState(prev => ({ ...prev, isLoadingMore: true }))

    try {
      const nextPage = state.currentPage + 1
      console.log('FeedPage: Loading more posts, page:', nextPage)

      if (!userId) {
        console.error('User not authenticated for loading more posts')
        return
      }

      const feedPosts = await getFeedPosts(POSTS_PER_PAGE, nextPage * POSTS_PER_PAGE, filter, userId)

      if (feedPosts.length === 0) {
        setState(prev => ({ ...prev, hasMore: false, isLoadingMore: false }))
      } else {
        setState(prev => ({
          ...prev,
          posts: [...prev.posts, ...feedPosts],
          currentPage: nextPage,
          hasMore: feedPosts.length === POSTS_PER_PAGE,
          isLoadingMore: false
        }))
      }
    } catch (error) {
      console.error('FeedPage: Error loading more posts:', error)
      setState(prev => ({ ...prev, hasMore: false, isLoadingMore: false }))
    }
  }

  const setPosts = (postsOrUpdater: React.SetStateAction<Post[]>) => {
    setState(prev => ({
      ...prev,
      posts: typeof postsOrUpdater === 'function' ? postsOrUpdater(prev.posts) : postsOrUpdater
    }))
  }

  const setError = (errorOrUpdater: React.SetStateAction<string | null>) => {
    setState(prev => ({
      ...prev,
      error: typeof errorOrUpdater === 'function' ? errorOrUpdater(prev.error) : errorOrUpdater
    }))
  }

  useEffect(() => {
    loadInitialPosts()
  }, [filter])

  return {
    ...state,
    loadInitialPosts,
    loadMorePosts,
    setPosts,
    setError
  }
}