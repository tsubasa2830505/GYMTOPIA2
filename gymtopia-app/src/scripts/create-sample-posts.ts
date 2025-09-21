#!/usr/bin/env node
import { getSupabaseClient } from '../lib/supabase/client'

// サンプル投稿データ
const samplePosts = [
  // チェックイン済み投稿（GPS認証済み）
  {
    content: '今日も朝活完了！💪\n最高のモーニングワークアウトでした。\nベンチプレス自己ベスト更新！',
    gym_id: 'd392ad69-eea5-40a1-8b9b-2e42b3e4e3f1', // GOLD'S GYM 渋谷東京店
    is_verified: true,
    verification_method: 'gps_checkin',
    verification_metadata: {
      accuracy: 12.5,
      latitude: 35.6595,
      longitude: 139.7004,
      timestamp: new Date().toISOString(),
      checkin_id: 'sample-checkin-1'
    },
    training_details: {
      exercises: [
        {
          name: 'ベンチプレス',
          sets: 5,
          reps: [12, 10, 8, 6, 4],
          weight: [60, 70, 80, 85, 90]
        },
        {
          name: 'インクラインダンベルプレス',
          sets: 4,
          reps: [12, 10, 10, 8],
          weight: [25, 27.5, 27.5, 30]
        }
      ],
      duration: 75,
      calories: 450
    },
    images: [
      'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800',
      'https://images.unsplash.com/photo-1526506118085-60ce8714f8c5?w=800'
    ],
    post_type: 'checkin',
    checkin_data: {
      checked_in_at: new Date().toISOString(),
      gym_name: 'GOLD\'S GYM 渋谷東京店',
      badges_earned: ['morning_warrior', 'pr_setter']
    }
  },

  // チェックイン済み投稿2（レアジムでのチェックイン）
  {
    content: 'ついに幻のジム「マッスルパラダイス」でチェックイン！🏆\nこのジムでトレーニングできるなんて夢みたい！\n\n#レアジム #マッスルパラダイス',
    gym_id: '61e8f812-92f0-411f-8ddb-f3a8a8b5c4e5', // レアジム
    is_verified: true,
    verification_method: 'gps_checkin',
    verification_metadata: {
      accuracy: 8.3,
      latitude: 35.6812,
      longitude: 139.7671,
      timestamp: new Date().toISOString(),
      checkin_id: 'sample-checkin-2'
    },
    images: [
      'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800'
    ],
    post_type: 'checkin',
    checkin_data: {
      checked_in_at: new Date().toISOString(),
      gym_name: 'マッスルパラダイス',
      rarity: 'legendary',
      badges_earned: ['legendary_explorer', 'rare_gym_hunter']
    }
  },

  // 通常投稿1（食事記録）
  {
    content: '今日のプロテインランチ🍱\nタンパク質45g確保！\n\n鶏胸肉のグリル\nブロッコリー\n玄米\nプロテインシェイク\n\n#高タンパク #筋肉飯',
    gym_id: null,
    is_verified: false,
    images: [
      'https://images.unsplash.com/photo-1532550907401-a500c9a57435?w=800',
      'https://images.unsplash.com/photo-1609501676725-7186f017a4b7?w=800'
    ],
    post_type: 'regular',
    nutrition_data: {
      calories: 650,
      protein: 45,
      carbs: 65,
      fat: 15
    }
  },

  // 通常投稿2（モチベーション）
  {
    content: '筋肉は一日にして成らず💪\n\n今日できることを全力で。\n明日の自分は今日の自分を超える。\n\n継続は力なり！\n\n#モチベーション #筋トレ',
    gym_id: null,
    is_verified: false,
    images: [
      'https://images.unsplash.com/photo-1583454110551-21f2fa2afe61?w=800'
    ],
    post_type: 'regular'
  },

  // チェックイン済み投稿3（グループワークアウト）
  {
    content: '仲間と一緒にレッグデイ！🦵\nみんなで追い込むと限界突破できる💯\n\nスクワット150kg達成！！\n\n#レッグデイ #仲間と筋トレ',
    gym_id: '59cf47e8-2fba-4c3b-9462-a36874fbe345', // エニタイムフィットネス六本木店
    is_verified: true,
    verification_method: 'gps_checkin',
    verification_metadata: {
      accuracy: 15.2,
      latitude: 35.6627,
      longitude: 139.7313,
      timestamp: new Date().toISOString(),
      checkin_id: 'sample-checkin-3'
    },
    training_details: {
      exercises: [
        {
          name: 'バーベルスクワット',
          sets: 5,
          reps: [10, 8, 6, 4, 2],
          weight: [100, 120, 135, 145, 150]
        },
        {
          name: 'レッグプレス',
          sets: 4,
          reps: [15, 12, 10, 8],
          weight: [200, 220, 240, 260]
        },
        {
          name: 'レッグカール',
          sets: 3,
          reps: [15, 12, 10],
          weight: [40, 45, 50]
        }
      ],
      duration: 90,
      calories: 550
    },
    images: [
      'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800',
      'https://images.unsplash.com/photo-1541534741688-6078c6bfb5c5?w=800',
      'https://images.unsplash.com/photo-1556817411-31ae72fa3ea0?w=800'
    ],
    post_type: 'checkin',
    checkin_data: {
      checked_in_at: new Date().toISOString(),
      gym_name: 'エニタイムフィットネス六本木店',
      with_friends: ['友人A', '友人B', '友人C'],
      badges_earned: ['squad_goals', 'pr_setter']
    }
  },

  // 通常投稿3（プロテインレビュー）
  {
    content: '新しいプロテイン試してみた！🥤\n\n【マイプロテイン チョコレートブラウニー味】\n\n味：★★★★★\n溶けやすさ：★★★★☆\nコスパ：★★★★★\n\n甘すぎず飲みやすい！リピート決定👍',
    gym_id: null,
    is_verified: false,
    images: [
      'https://images.unsplash.com/photo-1593095948071-474c5cc2989d?w=800'
    ],
    post_type: 'regular',
    review_data: {
      product: 'マイプロテイン チョコレートブラウニー',
      rating: 4.5,
      taste: 5,
      mixability: 4,
      value: 5
    }
  }
]

async function createSamplePosts() {
  try {
    console.log('🚀 サンプル投稿の作成を開始します...')

    const supabase = getSupabaseClient()

    // 現在のユーザーを取得
    const { data: { user }, error: authError } = await supabase.auth.getUser()

    if (authError || !user) {
      console.error('❌ ユーザー認証エラー:', authError)
      console.log('💡 ログインしてから実行してください')
      return
    }

    console.log('✅ ユーザー確認完了:', user.email)

    // 各投稿を作成
    for (const post of samplePosts) {
      const postData = {
        ...post,
        user_id: user.id,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }

      const { data, error } = await supabase
        .from('gym_posts')
        .insert(postData)
        .select()
        .single()

      if (error) {
        console.error('❌ 投稿作成エラー:', error)
        continue
      }

      console.log(`✅ 投稿作成完了: ${post.post_type === 'checkin' ? '🏋️ チェックイン' : '📝 通常'} - ${post.content.substring(0, 30)}...`)
    }

    console.log('🎉 すべてのサンプル投稿の作成が完了しました！')

  } catch (error) {
    console.error('❌ エラーが発生しました:', error)
  }
}

// スクリプトを実行
createSamplePosts()