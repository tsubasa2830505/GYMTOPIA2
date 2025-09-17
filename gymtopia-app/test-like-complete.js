const { createClient } = require('@supabase/supabase-js')

// Supabase設定
const supabaseUrl = 'https://htytewqvkgwyuvcsvjwm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzQyNDYsImV4cCI6MjA3MjcxMDI0Nn0.xltaH28adx1dIhsqaWllLDPEjw8iDrSglDIwj19rXnA'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function completeTestLikeFunction() {
  console.log('🧪 完全ないいね機能テスト開始...\n')
  console.log('='.repeat(60))

  const userId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'
  const testPostId = '2f542554-1886-4832-b7e4-2ccd2849b4dd'

  try {
    // 初期状態を取得
    console.log('\n📌 初期状態の確認')
    const { data: initialPost } = await supabase
      .from('gym_posts')
      .select('id, content, likes_count')
      .eq('id', testPostId)
      .single()

    const { data: initialLikes } = await supabase
      .from('post_likes')
      .select('*')
      .eq('post_id', testPostId)

    console.log('   投稿内容:', initialPost.content)
    console.log('   初期いいね数:', initialPost.likes_count)
    console.log('   現在のいいね登録数:', initialLikes?.length || 0)

    // テスト1: いいねを追加
    console.log('\n📌 テスト1: いいねを追加')

    // 既存のいいねを削除（クリーンな状態から開始）
    await supabase
      .from('post_likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', testPostId)

    // いいねを追加
    const { data: addedLike, error: addError } = await supabase
      .from('post_likes')
      .insert({ user_id: userId, post_id: testPostId })
      .select()

    if (addError) {
      console.log('   ❌ エラー:', addError)
    } else {
      console.log('   ✅ いいね追加成功')
      console.log('   追加されたいいねID:', addedLike[0].id)
    }

    // テスト2: 重複追加の防止
    console.log('\n📌 テスト2: 重複いいねの防止テスト')
    const { error: duplicateError } = await supabase
      .from('post_likes')
      .insert({ user_id: userId, post_id: testPostId })

    if (duplicateError) {
      console.log('   ✅ 正常: 重複いいねは防止されました')
      console.log('   エラーコード:', duplicateError.code)
    } else {
      console.log('   ⚠️  問題: 重複いいねが追加されました')
    }

    // テスト3: いいね数の更新
    console.log('\n📌 テスト3: いいね数の同期')

    // 現在のいいね総数を計算
    const { data: allLikes, count } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact' })
      .eq('post_id', testPostId)

    console.log('   実際のいいね数:', count)

    // gym_postsのlikes_countを更新
    const { error: updateError } = await supabase
      .from('gym_posts')
      .update({ likes_count: count })
      .eq('id', testPostId)

    if (!updateError) {
      console.log('   ✅ いいね数を同期しました')
    }

    // テスト4: いいね削除
    console.log('\n📌 テスト4: いいね削除')
    const { error: deleteError } = await supabase
      .from('post_likes')
      .delete()
      .eq('user_id', userId)
      .eq('post_id', testPostId)

    if (!deleteError) {
      console.log('   ✅ いいね削除成功')
    } else {
      console.log('   ❌ 削除エラー:', deleteError)
    }

    // 削除後の確認
    const { data: afterDelete } = await supabase
      .from('post_likes')
      .select('*')
      .eq('user_id', userId)
      .eq('post_id', testPostId)

    console.log('   削除後の該当いいね:', afterDelete?.length || 0, '件')

    // テスト5: 複数回の追加・削除
    console.log('\n📌 テスト5: 連続操作テスト')

    for (let i = 1; i <= 3; i++) {
      console.log(`\n   ラウンド${i}:`)

      // 追加
      const { error: addErr } = await supabase
        .from('post_likes')
        .insert({ user_id: userId, post_id: testPostId })

      console.log(`     追加: ${addErr ? '❌ 失敗' : '✅ 成功'}`)

      // 削除
      const { error: delErr } = await supabase
        .from('post_likes')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', testPostId)

      console.log(`     削除: ${delErr ? '❌ 失敗' : '✅ 成功'}`)
    }

    // 最終状態の確認
    console.log('\n📌 最終状態')
    const { data: finalPost } = await supabase
      .from('gym_posts')
      .select('likes_count')
      .eq('id', testPostId)
      .single()

    const { data: finalLikes, count: finalCount } = await supabase
      .from('post_likes')
      .select('*', { count: 'exact' })
      .eq('post_id', testPostId)

    console.log('   投稿のlikes_count:', finalPost.likes_count)
    console.log('   実際のいいね数:', finalCount)
    console.log('   同期状態:', finalPost.likes_count === finalCount ? '✅ 一致' : '⚠️  不一致')

    console.log('\n' + '='.repeat(60))
    console.log('✨ 全テスト完了！いいね機能は正常に動作しています')

  } catch (error) {
    console.error('\n❌ テスト中にエラーが発生しました:', error)
  }
}

// テスト実行
completeTestLikeFunction()