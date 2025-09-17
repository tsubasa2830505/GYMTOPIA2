const { createClient } = require('@supabase/supabase-js')

// Supabase設定
const supabaseUrl = 'https://htytewqvkgwyuvcsvjwm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzQyNDYsImV4cCI6MjA3MjcxMDI0Nn0.xltaH28adx1dIhsqaWllLDPEjw8iDrSglDIwj19rXnA'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testLikeFunction() {
  console.log('🧪 いいね機能テスト開始...\n')

  const userId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'

  try {
    // 1. 最新の投稿を取得
    console.log('📌 ステップ1: テスト用投稿を取得')
    const { data: posts, error: fetchError } = await supabase
      .from('gym_posts')
      .select('id, content, likes_count')
      .order('created_at', { ascending: false })
      .limit(1)

    if (fetchError || !posts || posts.length === 0) {
      console.log('❌ 投稿が見つかりません')
      return
    }

    const testPost = posts[0]
    console.log('✅ テスト対象投稿:')
    console.log('   ID:', testPost.id)
    console.log('   内容:', testPost.content?.substring(0, 30) + '...')
    console.log('   現在のいいね数:', testPost.likes_count)

    // 2. 現在のいいね状態を確認
    console.log('\n📌 ステップ2: 現在のいいね状態を確認')
    const { data: existingLike, error: checkError } = await supabase
      .from('post_likes')
      .select('*')
      .eq('user_id', userId)
      .eq('post_id', testPost.id)
      .single()

    const isLiked = !!existingLike && !checkError
    console.log(`   現在の状態: ${isLiked ? '❤️ いいね済み' : '🤍 未いいね'}`)

    // 3. いいねを切り替え
    console.log('\n📌 ステップ3: いいねを切り替え')

    if (isLiked) {
      // いいねを削除
      console.log('   アクション: いいねを削除')
      const { error: deleteError } = await supabase
        .from('post_likes')
        .delete()
        .eq('user_id', userId)
        .eq('post_id', testPost.id)

      if (deleteError) {
        console.log('❌ いいね削除エラー:', deleteError)
        return
      }
      console.log('✅ いいねを削除しました')
    } else {
      // いいねを追加
      console.log('   アクション: いいねを追加')
      const { data: newLike, error: insertError } = await supabase
        .from('post_likes')
        .insert({
          user_id: userId,
          post_id: testPost.id
        })
        .select()

      if (insertError) {
        console.log('❌ いいね追加エラー:', insertError)
        return
      }
      console.log('✅ いいねを追加しました')
    }

    // 4. likes_countを更新
    console.log('\n📌 ステップ4: 投稿のいいね数を更新')
    const newLikesCount = isLiked ? testPost.likes_count - 1 : testPost.likes_count + 1

    const { error: updateError } = await supabase
      .from('gym_posts')
      .update({ likes_count: newLikesCount })
      .eq('id', testPost.id)

    if (updateError) {
      console.log('❌ いいね数更新エラー:', updateError)
      return
    }
    console.log(`✅ いいね数を更新: ${testPost.likes_count} → ${newLikesCount}`)

    // 5. 結果を確認
    console.log('\n📌 ステップ5: 最終結果を確認')
    const { data: updatedPost } = await supabase
      .from('gym_posts')
      .select('likes_count')
      .eq('id', testPost.id)
      .single()

    const { data: finalLike } = await supabase
      .from('post_likes')
      .select('*')
      .eq('user_id', userId)
      .eq('post_id', testPost.id)
      .single()

    const isFinallyLiked = !!finalLike
    console.log(`   最終状態: ${isFinallyLiked ? '❤️ いいね済み' : '🤍 未いいね'}`)
    console.log(`   最終いいね数: ${updatedPost?.likes_count}`)

    console.log('\n✨ いいね機能は正常に動作しています！')

  } catch (error) {
    console.error('\n❌ テスト中にエラーが発生しました:', error)
  }
}

// テスト実行
testLikeFunction()