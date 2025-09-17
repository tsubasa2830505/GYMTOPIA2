const { createClient } = require('@supabase/supabase-js')

// Supabase設定
const supabaseUrl = 'https://htytewqvkgwyuvcsvjwm.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEzNDI0NiwiZXhwIjoyMDcyNzEwMjQ2fQ.VVNIX12yaN7t3seEzRwbMRtmNEbHoEkPXYeBzt60JBs'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testFollowManipulation() {
  console.log('🧪 フォロー関係の操作テスト開始...\n')
  console.log('='.repeat(60))

  const tsubasaId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'
  const testUserId = '8fb27b06-e383-49a6-8271-14e4408b8282'
  const suzukiId = 'd5df9203-1d1b-45fa-8e19-ebc9a87af451'
  const takahashiId = '816edd88-30c0-4bbf-ae95-f2ad15553be7'

  try {
    // 初期状態を保存
    console.log('📌 初期状態の確認')
    const { data: initialFollows } = await supabase
      .from('follows')
      .select('*')
      .or(`follower_id.eq.${tsubasaId},following_id.eq.${tsubasaId}`)

    console.log(`   Tsubasa関連のフォロー関係: ${initialFollows?.length}件`)

    // テスト1: 新しいフォロー関係を追加
    console.log('\n📌 テスト1: 高橋さんがTsubasaをフォローバック（相互フォローになる）')

    // 現在: 高橋→Tsubasa（片方向）
    // 追加: Tsubasa→高橋（相互になる）

    // まず既存のフォロー関係を確認
    const { data: existingFollow } = await supabase
      .from('follows')
      .select('*')
      .eq('follower_id', tsubasaId)
      .eq('following_id', takahashiId)
      .single()

    if (!existingFollow) {
      const { error: followError } = await supabase
        .from('follows')
        .insert({
          follower_id: tsubasaId,
          following_id: takahashiId
        })

      if (!followError) {
        console.log('   ✅ Tsubasaが高橋さんをフォローしました')
        console.log('   → 相互フォロー関係が成立！')
      } else {
        console.log('   ❌ フォロー失敗:', followError.message)
      }
    } else {
      console.log('   ⚠️  既にフォロー済みです')
    }

    // テスト2: 相互フォローの確認
    console.log('\n📌 テスト2: 現在の相互フォロー関係を確認')

    const { data: tsubasaFollowing } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', tsubasaId)

    const { data: tsubasaFollowers } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', tsubasaId)

    const followingIds = tsubasaFollowing?.map(f => f.following_id) || []
    const followerIds = tsubasaFollowers?.map(f => f.follower_id) || []
    const mutualIds = followingIds.filter(id => followerIds.includes(id))

    console.log('\n   相互フォロー状態:')
    for (const mutualId of mutualIds) {
      const { data: user } = await supabase
        .from('users')
        .select('display_name')
        .eq('id', mutualId)
        .single()
      console.log(`     🤝 ${user?.display_name}`)
    }

    // テスト3: フォロー解除（相互→片方向）
    console.log('\n📌 テスト3: testuserのフォローを解除（相互→片方向）')

    const { error: unfollowError } = await supabase
      .from('follows')
      .delete()
      .eq('follower_id', tsubasaId)
      .eq('following_id', testUserId)

    if (!unfollowError) {
      console.log('   ✅ Tsubasaがtestuserのフォローを解除')
      console.log('   → testuserからの片方向フォローになりました')
    }

    // 再度相互フォローを確認
    const { data: updatedFollowing } = await supabase
      .from('follows')
      .select('following_id')
      .eq('follower_id', tsubasaId)

    const { data: updatedFollowers } = await supabase
      .from('follows')
      .select('follower_id')
      .eq('following_id', tsubasaId)

    const newFollowingIds = updatedFollowing?.map(f => f.following_id) || []
    const newFollowerIds = updatedFollowers?.map(f => f.follower_id) || []
    const newMutualIds = newFollowingIds.filter(id => newFollowerIds.includes(id))

    console.log('\n   更新後の相互フォロー:')
    for (const mutualId of newMutualIds) {
      const { data: user } = await supabase
        .from('users')
        .select('display_name')
        .eq('id', mutualId)
        .single()
      console.log(`     🤝 ${user?.display_name}`)
    }

    // テスト4: フォローを再度追加（片方向→相互）
    console.log('\n📌 テスト4: testuserを再度フォロー（相互に戻す）')

    const { error: refollowError } = await supabase
      .from('follows')
      .insert({
        follower_id: tsubasaId,
        following_id: testUserId
      })

    if (!refollowError) {
      console.log('   ✅ Tsubasaがtestuserを再度フォロー')
      console.log('   → 相互フォロー関係が復活！')
    }

    // 最終状態の確認
    console.log('\n📌 最終状態の確認')

    const { data: finalFollowing } = await supabase
      .from('follows')
      .select(`
        following_id,
        following:users!following_id(display_name)
      `)
      .eq('follower_id', tsubasaId)

    const { data: finalFollowers } = await supabase
      .from('follows')
      .select(`
        follower_id,
        follower:users!follower_id(display_name)
      `)
      .eq('following_id', tsubasaId)

    console.log('\n   Tsubasaがフォロー中:')
    finalFollowing?.forEach(f => {
      console.log(`     → ${f.following?.display_name}`)
    })

    console.log('\n   Tsubasaのフォロワー:')
    finalFollowers?.forEach(f => {
      console.log(`     ← ${f.follower?.display_name}`)
    })

    const finalFollowingIds = finalFollowing?.map(f => f.following_id) || []
    const finalFollowerIds = finalFollowers?.map(f => f.follower_id) || []
    const finalMutualIds = finalFollowingIds.filter(id => finalFollowerIds.includes(id))

    console.log('\n   最終的な相互フォロー:')
    for (const mutualId of finalMutualIds) {
      const { data: user } = await supabase
        .from('users')
        .select('display_name')
        .eq('id', mutualId)
        .single()
      console.log(`     🤝 ${user?.display_name}`)
    }

    // 相互フォローユーザーの投稿数を確認
    console.log('\n📌 相互フォローユーザーの投稿数')
    const { count: mutualPostsCount } = await supabase
      .from('gym_posts')
      .select('*', { count: 'exact', head: true })
      .in('user_id', finalMutualIds)

    console.log(`   相互フォローユーザーの投稿: ${mutualPostsCount}件`)

    console.log('\n' + '='.repeat(60))
    console.log('✨ フォロー関係の操作テスト完了！')
    console.log('\n📱 ブラウザで確認:')
    console.log('1. http://localhost:3001/feed にアクセス')
    console.log('2. 各フィルターボタンをクリックして動作確認')
    console.log('   - 全て: 全投稿を表示')
    console.log('   - フォロー中: フォロー中ユーザーの投稿')
    console.log('   - 相互: 相互フォローユーザーの投稿のみ')

  } catch (error) {
    console.error('\n❌ テスト中にエラーが発生しました:', error)
  }
}

// テスト実行
testFollowManipulation()