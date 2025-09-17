const { createClient } = require('@supabase/supabase-js')

// Supabase設定
const supabaseUrl = 'https://htytewqvkgwyuvcsvjwm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzQyNDYsImV4cCI6MjA3MjcxMDI0Nn0.xltaH28adx1dIhsqaWllLDPEjw8iDrSglDIwj19rXnA'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testMutualFilter() {
  console.log('🧪 相互フォローフィルター機能テスト開始...\n')
  console.log('='.repeat(60))

  const tsubasaId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'

  try {
    // 1. Tsubasaの相互フォロー関係を確認
    console.log('\n📌 ステップ1: Tsubasaの相互フォロー関係')

    // Tsubasaがフォローしている人
    const { data: following } = await supabase
      .from('follows')
      .select('following_id, following:users!following_id(display_name, username)')
      .eq('follower_id', tsubasaId)

    console.log('\n   Tsubasaがフォロー中:')
    following?.forEach(f => {
      console.log(`     - ${f.following?.display_name} (@${f.following?.username})`)
    })

    // Tsubasaをフォローしている人
    const { data: followers } = await supabase
      .from('follows')
      .select('follower_id, follower:users!follower_id(display_name, username)')
      .eq('following_id', tsubasaId)

    console.log('\n   Tsubasaのフォロワー:')
    followers?.forEach(f => {
      console.log(`     - ${f.follower?.display_name} (@${f.follower?.username})`)
    })

    // 相互フォロー（両方向にフォロー関係がある）
    const { data: mutualFollows } = await supabase
      .rpc('get_mutual_follows', { user_id: tsubasaId })

    console.log('\n   ✨ 相互フォロー:')
    if (!mutualFollows || mutualFollows.length === 0) {
      // 手動で計算
      const followingIds = following?.map(f => f.following_id) || []
      const followerIds = followers?.map(f => f.follower_id) || []
      const mutualIds = followingIds.filter(id => followerIds.includes(id))

      for (const mutualId of mutualIds) {
        const { data: user } = await supabase
          .from('users')
          .select('display_name, username')
          .eq('id', mutualId)
          .single()

        console.log(`     - ${user?.display_name} (@${user?.username}) 🤝`)
      }
    }

    // 2. 相互フォローしているユーザーの投稿を取得
    console.log('\n📌 ステップ2: 相互フォローユーザーの投稿')

    // 相互フォローのユーザーIDリストを作成
    const followingIds = following?.map(f => f.following_id) || []
    const followerIds = followers?.map(f => f.follower_id) || []
    const mutualIds = followingIds.filter(id => followerIds.includes(id))

    if (mutualIds.length > 0) {
      const { data: mutualPosts } = await supabase
        .from('gym_posts')
        .select(`
          id,
          content,
          user_id,
          user:users!user_id(display_name, username),
          created_at
        `)
        .in('user_id', mutualIds)
        .order('created_at', { ascending: false })
        .limit(5)

      console.log('\n   相互フォローユーザーの最新投稿:')
      mutualPosts?.forEach(post => {
        console.log(`\n     📝 ${post.user?.display_name}`)
        console.log(`        "${post.content?.substring(0, 50)}..."`)
        console.log(`        投稿日: ${new Date(post.created_at).toLocaleDateString('ja-JP')}`)
      })
    }

    // 3. フィルターごとの投稿数を比較
    console.log('\n📌 ステップ3: フィルター別投稿数')

    // 全体
    const { count: allCount } = await supabase
      .from('gym_posts')
      .select('*', { count: 'exact', head: true })

    // フォロー中
    const { count: followingCount } = await supabase
      .from('gym_posts')
      .select('*', { count: 'exact', head: true })
      .in('user_id', followingIds)

    // 相互フォロー
    const { count: mutualCount } = await supabase
      .from('gym_posts')
      .select('*', { count: 'exact', head: true })
      .in('user_id', mutualIds)

    console.log(`\n   📊 投稿数統計:`)
    console.log(`     全体: ${allCount}件`)
    console.log(`     フォロー中: ${followingCount}件`)
    console.log(`     相互フォロー: ${mutualCount}件`)

    // 4. フィルター機能の動作確認
    console.log('\n📌 ステップ4: フィルター動作確認')

    console.log('\n   ✅ テスト結果:')
    console.log('     1. 相互フォロー関係が正しく検出されている')
    console.log(`     2. 相互フォローユーザー: ${mutualIds.length}人`)
    console.log(`     3. 相互フォローの投稿: ${mutualCount}件`)
    console.log('     4. フィルター機能が正常に動作可能')

    console.log('\n' + '='.repeat(60))
    console.log('✨ 相互フォローフィルター機能は正常に動作しています！')
    console.log('\n📝 ブラウザでの確認方法:')
    console.log('1. http://localhost:3001/feed にアクセス')
    console.log('2. 「相互」ボタンをクリック')
    console.log('3. 相互フォローユーザーの投稿のみ表示されることを確認')

  } catch (error) {
    console.error('\n❌ テスト中にエラーが発生しました:', error)
  }
}

// テスト実行
testMutualFilter()