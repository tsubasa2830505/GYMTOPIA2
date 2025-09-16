const { createClient } = require('@supabase/supabase-js')

// Supabase設定
const supabaseUrl = 'https://htytewqvkgwyuvcsvjwm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzQyNDYsImV4cCI6MjA3MjcxMDI0Nn0.xltaH28adx1dIhsqaWllLDPEjw8iDrSglDIwj19rXnA'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

async function testProfileUpdate() {
  console.log('🧪 プロフィール更新機能テスト開始...\n')

  const userId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'

  try {
    // 1. 現在のプロフィール情報を取得
    console.log('📌 ステップ1: 現在のプロフィール情報を取得')
    const { data: beforeData, error: fetchError } = await supabase
      .from('users')
      .select('id, display_name, username, bio, avatar_url')
      .eq('id', userId)
      .single()

    if (fetchError) {
      console.log('❌ プロフィール取得エラー:', fetchError)
      return
    }

    console.log('✅ 現在のプロフィール:')
    console.log('   名前:', beforeData.display_name)
    console.log('   ユーザー名:', beforeData.username)
    console.log('   自己紹介:', beforeData.bio)
    console.log('   アバター:', beforeData.avatar_url)

    // 2. プロフィール情報を更新
    console.log('\n📌 ステップ2: プロフィール情報を更新')

    const testTimestamp = new Date().toLocaleString('ja-JP')
    const updateData = {
      display_name: 'Tsubasa (更新テスト)',
      username: 'tsubasa_updated',
      bio: `テスト更新 - ${testTimestamp}`,
      updated_at: new Date().toISOString()
    }

    console.log('   更新データ:', updateData)

    const { data: updateResult, error: updateError } = await supabase
      .from('users')
      .update(updateData)
      .eq('id', userId)
      .select('id, display_name, username, bio, avatar_url, updated_at')

    if (updateError) {
      console.log('❌ 更新エラー:', updateError)
      console.log('   エラー詳細:', JSON.stringify(updateError, null, 2))
      return
    }

    console.log('✅ 更新成功!')
    console.log('   更新後のデータ:', updateResult)

    // 3. 更新結果を再確認
    console.log('\n📌 ステップ3: 更新結果を再確認')
    const { data: afterData, error: verifyError } = await supabase
      .from('users')
      .select('id, display_name, username, bio, avatar_url, updated_at')
      .eq('id', userId)
      .single()

    if (verifyError) {
      console.log('❌ 確認エラー:', verifyError)
      return
    }

    console.log('✅ 確認完了:')
    console.log('   名前:', afterData.display_name)
    console.log('   ユーザー名:', afterData.username)
    console.log('   自己紹介:', afterData.bio)
    console.log('   更新日時:', afterData.updated_at)

    // 4. 変更を元に戻す
    console.log('\n📌 ステップ4: 元の状態に戻す')
    const { error: restoreError } = await supabase
      .from('users')
      .update({
        display_name: beforeData.display_name,
        username: beforeData.username,
        bio: beforeData.bio,
        updated_at: new Date().toISOString()
      })
      .eq('id', userId)

    if (restoreError) {
      console.log('⚠️ 復元エラー:', restoreError)
    } else {
      console.log('✅ 元の状態に復元完了')
    }

    console.log('\n✨ プロフィール更新機能は正常に動作しています！')

  } catch (error) {
    console.error('\n❌ テスト中にエラーが発生しました:', error)
  }
}

// テスト実行
testProfileUpdate()