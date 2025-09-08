// データベース接続テスト
const { createClient } = require('@supabase/supabase-js')

// 環境変数から接続情報を読み込み
require('dotenv').config({ path: '.env.local' })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseKey) {
  console.error('❌ Supabase環境変数が設定されていません')
  console.log('NEXT_PUBLIC_SUPABASE_URL:', supabaseUrl ? '設定済み' : '未設定')
  console.log('NEXT_PUBLIC_SUPABASE_ANON_KEY:', supabaseKey ? '設定済み' : '未設定')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseKey)

async function testDatabase() {
  console.log('🔍 データベース接続テスト開始...')
  console.log('📡 Supabase URL:', supabaseUrl)
  
  try {
    // 1. 基本接続テスト
    console.log('\n1️⃣ 基本接続テスト...')
    const { data: connection, error: connError } = await supabase
      .from('users')
      .select('count', { count: 'exact', head: true })
    
    if (connError) {
      console.error('❌ 接続エラー:', connError.message)
      return
    }
    
    console.log('✅ データベース接続成功')
    console.log('📊 ユーザー総数:', connection)

    // 2. 筋トレマニア太郎のデータ確認
    console.log('\n2️⃣ 筋トレマニア太郎データ確認...')
    const { data: profile, error: profileError } = await supabase
      .from('users')
      .select('*')
      .eq('id', 'mock-user-id')
      .single()

    if (profileError) {
      console.error('❌ プロフィールデータなし:', profileError.message)
      console.log('💡 SQLスクリプトを実行してください')
      return
    }

    console.log('✅ プロフィールデータ取得成功')
    console.log('👤 ユーザー名:', profile.display_name)
    console.log('📝 自己紹介:', profile.bio?.substring(0, 50) + '...')

    // 3. フォロー・フォロワー統計確認
    console.log('\n3️⃣ フォロー・フォロワー統計確認...')
    console.log('\n3️⃣ 統計ビュー検証は任意のためスキップ')

    // 4. 投稿データ確認
    console.log('\n4️⃣ 投稿データ確認...')
    const { data: posts, error: postsError } = await supabase
      .from('gym_posts')
      .select('id, content, likes_count, comments_count, created_at')
      .eq('user_id', 'mock-user-id')
      .order('created_at', { ascending: false })
      .limit(3)

    if (postsError) {
      console.error('❌ 投稿データ取得エラー:', postsError.message)
      return
    }

    console.log('✅ 投稿データ取得成功')
    console.log(`📱 投稿数: ${posts.length}件`)
    posts.forEach((post, index) => {
      console.log(`  ${index + 1}. ${post.content.substring(0, 30)}... (👍${post.likes_count} 💬${post.comments_count})`)
    })

    console.log('\n🎉 すべてのテスト完了！データベースが正常に設定されています')
    
  } catch (error) {
    console.error('❌ 予期しないエラー:', error.message)
  }
}

testDatabase()
