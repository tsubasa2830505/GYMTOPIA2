const { createClient } = require('@supabase/supabase-js')

// Supabase設定
const supabaseUrl = 'https://htytewqvkgwyuvcsvjwm.supabase.co'
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzQyNDYsImV4cCI6MjA3MjcxMDI0Nn0.xltaH28adx1dIhsqaWllLDPEjw8iDrSglDIwj19rXnA'

const supabase = createClient(supabaseUrl, supabaseAnonKey)

// テスト用データ（既存のユーザーを使用）
const TEST_USER_EMAIL = 'test@example.com'
const TEST_USER_PASSWORD = 'password123'

async function runTests() {
  console.log('🧪 管理画面機能テスト開始...\n')

  try {
    // 1. ユーザー認証
    console.log('📌 1. ユーザー認証テスト')
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email: TEST_USER_EMAIL,
      password: TEST_USER_PASSWORD
    })

    if (authError) {
      console.log('   ❌ 認証失敗:', authError.message)
      console.log('   📝 テストユーザーを作成します...')

      // テストユーザー作成
      const { data: signUpData, error: signUpError } = await supabase.auth.signUp({
        email: TEST_USER_EMAIL,
        password: TEST_USER_PASSWORD
      })

      if (signUpError) {
        console.log('   ❌ ユーザー作成失敗:', signUpError.message)
        return
      }

      console.log('   ✅ テストユーザー作成成功')
    } else {
      console.log('   ✅ 認証成功:', authData.user.email)
    }

    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      console.log('   ❌ ユーザー情報取得失敗')
      return
    }

    // 2. ジムオーナー権限の確認・設定
    console.log('\n📌 2. ジムオーナー権限テスト')
    const { data: ownerData, error: ownerError } = await supabase
      .from('gym_owners')
      .select('*, gym:gyms(*)')
      .eq('user_id', user.id)
      .single()

    let gymId
    if (!ownerData) {
      console.log('   📝 ジムオーナー権限がありません。テスト用ジムを作成します...')

      // テスト用ジム作成
      const { data: gymData, error: gymError } = await supabase
        .from('gyms')
        .insert({
          name: 'テストジム渋谷',
          city: '渋谷区',
          address: '東京都渋谷区テスト1-1-1',
          created_by: user.id
        })
        .select()
        .single()

      if (gymError) {
        console.log('   ❌ ジム作成失敗:', gymError.message)
        return
      }

      gymId = gymData.id
      console.log('   ✅ テストジム作成成功:', gymData.name)

      // オーナー権限付与
      const { error: ownerInsertError } = await supabase
        .from('gym_owners')
        .insert({
          user_id: user.id,
          gym_id: gymId,
          role: 'owner'
        })

      if (ownerInsertError) {
        console.log('   ❌ オーナー権限付与失敗:', ownerInsertError.message)
        return
      }

      console.log('   ✅ オーナー権限付与成功')
    } else {
      gymId = ownerData.gym.id
      console.log('   ✅ 既存のジムオーナー権限確認:', ownerData.gym.name)
    }

    // 3. 基本情報更新テスト
    console.log('\n📌 3. 基本情報更新テスト')
    const updateData = {
      name: 'テストジム渋谷（更新）',
      city: '渋谷区',
      address: '東京都渋谷区テスト2-2-2',
      business_hours: {
        weekday: '6:00-23:00',
        weekend: '8:00-20:00',
        is_24h: false
      },
      price_info: {
        monthly: '9800',
        visitor: '2500'
      },
      facilities: {
        lockers: true,
        showers: true,
        parking: true,
        wifi: true,
        sauna: false,
        chalk_allowed: true
      }
    }

    const { data: updatedGym, error: updateError } = await supabase
      .from('gyms')
      .update(updateData)
      .eq('id', gymId)
      .select()
      .single()

    if (updateError) {
      console.log('   ❌ 基本情報更新失敗:', updateError.message)
    } else {
      console.log('   ✅ 基本情報更新成功')
      console.log('     - ジム名:', updatedGym.name)
      console.log('     - 住所:', updatedGym.address)
      console.log('     - 月額料金:', updatedGym.price_info?.monthly)
    }

    // 4. 設備追加テスト
    console.log('\n📌 4. 設備追加テスト')

    // マシン追加
    const { data: machineData, error: machineError } = await supabase
      .from('gym_machines')
      .insert({
        gym_id: gymId,
        name: 'ベンチプレス台',
        brand: 'ROGUE',
        count: 3,
        condition: '良好'
      })
      .select()
      .single()

    if (machineError) {
      console.log('   ❌ マシン追加失敗:', machineError.message)
    } else {
      console.log('   ✅ マシン追加成功:', machineData.name)
    }

    // フリーウェイト追加
    const { data: freeWeightData, error: freeWeightError } = await supabase
      .from('gym_free_weights')
      .insert({
        gym_id: gymId,
        name: 'ダンベル',
        brand: 'IVANKO',
        weight_range: '1-50kg',
        count: 20,
        condition: '良好'
      })
      .select()
      .single()

    if (freeWeightError) {
      console.log('   ❌ フリーウェイト追加失敗:', freeWeightError.message)
    } else {
      console.log('   ✅ フリーウェイト追加成功:', freeWeightData.name)
    }

    // 5. レビュー作成とオーナー返信テスト
    console.log('\n📌 5. レビュー返信テスト')

    // テストレビュー作成
    const { data: reviewData, error: reviewError } = await supabase
      .from('gym_reviews')
      .insert({
        gym_id: gymId,
        user_id: user.id,
        rating: 5,
        title: 'テストレビュー',
        content: '素晴らしいジムです！設備も充実していて清潔です。'
      })
      .select()
      .single()

    if (reviewError) {
      console.log('   ❌ レビュー作成失敗:', reviewError.message)
    } else {
      console.log('   ✅ レビュー作成成功')

      // オーナー返信
      const { data: replyData, error: replyError } = await supabase
        .from('gym_review_replies')
        .insert({
          review_id: reviewData.id,
          responder_user_id: user.id,
          role: 'owner',
          content: 'レビューありがとうございます！今後ともよろしくお願いいたします。'
        })
        .select()
        .single()

      if (replyError) {
        console.log('   ❌ オーナー返信失敗:', replyError.message)
      } else {
        console.log('   ✅ オーナー返信成功')
      }
    }

    // 6. 設備一覧取得テスト
    console.log('\n📌 6. 設備一覧取得テスト')

    const { data: machines, error: machinesError } = await supabase
      .from('gym_machines')
      .select('*')
      .eq('gym_id', gymId)

    const { data: freeWeights, error: freeWeightsError } = await supabase
      .from('gym_free_weights')
      .select('*')
      .eq('gym_id', gymId)

    if (!machinesError && !freeWeightsError) {
      console.log('   ✅ 設備一覧取得成功')
      console.log('     - マシン数:', machines.length)
      console.log('     - フリーウェイト数:', freeWeights.length)
    } else {
      console.log('   ❌ 設備一覧取得失敗')
    }

    // 7. レビュー一覧取得テスト
    console.log('\n📌 7. レビュー一覧取得テスト')

    const { data: reviews, error: reviewsError } = await supabase
      .from('gym_reviews')
      .select(`
        *,
        user:users(id, username, display_name),
        replies:gym_review_replies(
          *,
          responder:users(id, username, display_name)
        )
      `)
      .eq('gym_id', gymId)

    if (!reviewsError) {
      console.log('   ✅ レビュー一覧取得成功')
      console.log('     - レビュー数:', reviews.length)
      console.log('     - 返信付きレビュー数:', reviews.filter(r => r.replies?.length > 0).length)
    } else {
      console.log('   ❌ レビュー一覧取得失敗:', reviewsError.message)
    }

    console.log('\n✨ すべてのテスト完了！')
    console.log('\n📝 管理画面でのテスト方法:')
    console.log('1. http://localhost:3001/admin にアクセス')
    console.log('2. テストユーザーでログイン:', TEST_USER_EMAIL)
    console.log('3. 各タブで機能を確認:')
    console.log('   - 基本情報: 情報を編集して「保存」')
    console.log('   - 設備管理: 設備を追加・削除')
    console.log('   - レビュー管理: レビューに返信')
    console.log('   - 統計情報: データの表示確認')

  } catch (error) {
    console.error('❌ テスト中にエラーが発生しました:', error)
  }
}

// テスト実行
runTests()