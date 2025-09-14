import { createClient } from '@supabase/supabase-js'
import dotenv from 'dotenv'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Load environment variables
dotenv.config({ path: join(__dirname, '.env.development.local') })

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('❌ Supabase環境変数が設定されていません')
  process.exit(1)
}

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// テスト1: ジムオーナーでログイン
async function testGymOwnerAccess() {
  console.log('\n=== テスト1: ジムオーナーのアクセステスト ===')
  
  // ichiro@example.com でログイン（ジムオーナー）
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'ichiro@example.com',
    password: 'password123'
  })
  
  if (authError) {
    console.error('❌ ログインエラー:', authError.message)
    return
  }
  
  console.log('✅ ログイン成功:', authData.user.email)
  
  // 管理するジムを取得
  const { data: gymOwners, error: ownerError } = await supabase
    .from('gym_owners')
    .select(`
      *,
      gym:gyms(*)
    `)
    .eq('user_id', authData.user.id)
  
  if (ownerError) {
    console.error('❌ ジム情報取得エラー:', ownerError.message)
  } else if (gymOwners && gymOwners.length > 0) {
    console.log('✅ 管理ジム取得成功:')
    gymOwners.forEach(owner => {
      console.log(`  - ${owner.gym.name} (ID: ${owner.gym_id})`)
    })
  } else {
    console.log('⚠️ 管理するジムがありません')
  }
  
  await supabase.auth.signOut()
}

// テスト2: 一般ユーザーでログイン
async function testNonOwnerAccess() {
  console.log('\n=== テスト2: 一般ユーザーのアクセステスト ===')
  
  // muscle_taro@gymtopia.app でログイン（一般ユーザー）
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'muscle_taro@gymtopia.app',
    password: 'password123'
  })
  
  if (authError) {
    console.error('❌ ログインエラー:', authError.message)
    return
  }
  
  console.log('✅ ログイン成功:', authData.user.email)
  
  // 管理するジムを取得（空のはず）
  const { data: gymOwners, error: ownerError } = await supabase
    .from('gym_owners')
    .select(`
      *,
      gym:gyms(*)
    `)
    .eq('user_id', authData.user.id)
  
  if (ownerError) {
    console.error('❌ ジム情報取得エラー:', ownerError.message)
  } else if (gymOwners && gymOwners.length > 0) {
    console.log('⚠️ 予期しないジム情報が取得されました:')
    gymOwners.forEach(owner => {
      console.log(`  - ${owner.gym.name} (ID: ${owner.gym_id})`)
    })
  } else {
    console.log('✅ 期待通り: 管理するジムはありません')
  }
  
  await supabase.auth.signOut()
}

// テスト3: 別のジムオーナーを追加
async function testAddNewGymOwner() {
  console.log('\n=== テスト3: 新しいジムオーナーを追加 ===')
  
  // 管理者権限でログイン（実際のアプリでは管理者のみが実行可能）
  const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
    email: 'ichiro@example.com',
    password: 'password123'
  })
  
  if (authError) {
    console.error('❌ ログインエラー:', authError.message)
    return
  }
  
  // yukiをエニタイムフィットネス新宿のオーナーに設定
  const yukiUserId = '816edd88-30c0-4bbf-ae95-f2ad15553be7'
  const anytimeGymId = '8e0f9316-27df-4e67-8f84-07ab0edf7c14'
  
  const { data: newOwner, error: insertError } = await supabase
    .from('gym_owners')
    .insert({
      user_id: yukiUserId,
      gym_id: anytimeGymId,
      role: 'owner'
    })
    .select()
    .single()
  
  if (insertError) {
    if (insertError.code === '23505') {
      console.log('⚠️ 既にオーナーとして登録されています')
    } else {
      console.error('❌ オーナー追加エラー:', insertError.message)
    }
  } else {
    console.log('✅ 新しいジムオーナーを追加しました')
    
    // ユーザーのis_gym_ownerフラグを更新
    const { error: updateError } = await supabase
      .from('users')
      .update({ is_gym_owner: true })
      .eq('id', yukiUserId)
    
    if (updateError) {
      console.error('❌ ユーザー更新エラー:', updateError.message)
    } else {
      console.log('✅ ユーザーのis_gym_ownerフラグを更新しました')
    }
  }
  
  await supabase.auth.signOut()
}

// テスト実行
async function runTests() {
  console.log('🚀 管理画面アクセス制御テスト開始')
  
  await testGymOwnerAccess()
  await testNonOwnerAccess()
  await testAddNewGymOwner()
  
  console.log('\n✨ テスト完了')
  process.exit(0)
}

runTests().catch(console.error)