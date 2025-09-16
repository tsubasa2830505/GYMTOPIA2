const { createClient } = require('@supabase/supabase-js')

// Supabase設定
const supabaseUrl = 'https://htytewqvkgwyuvcsvjwm.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEzNDI0NiwiZXhwIjoyMDcyNzEwMjQ2fQ.VVNIX12yaN7t3seEzRwbMRtmNEbHoEkPXYeBzt60JBs'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function runTests() {
  console.log('🧪 管理画面機能テスト開始（SQLダイレクト版）...\n')

  try {
    // 1. 既存ユーザーを選択してジムオーナーに設定
    console.log('📌 1. テストユーザーとジムの準備')

    // 既存ユーザーを取得
    const userId = '84d67d34-c120-46e4-a31a-34461648d449' // kenji@example.com
    console.log('   ✅ テストユーザー: kenji@example.com')

    // テスト用ジムを作成または取得
    let { data: existingGym } = await supabase
      .from('gyms')
      .select('*')
      .eq('name', 'テストジム渋谷')
      .single()

    let gymId
    if (!existingGym) {
      const { data: newGym, error: gymError } = await supabase
        .from('gyms')
        .insert({
          name: 'テストジム渋谷',
          city: '渋谷区',
          address: '東京都渋谷区道玄坂1-1-1',
          created_by: userId,
          business_hours: { weekday: '24時間営業', is_24h: true },
          price_info: { monthly: '12800', visitor: '3200' },
          facilities: {
            lockers: true,
            showers: true,
            parking: false,
            wifi: true,
            sauna: false,
            chalk_allowed: true
          }
        })
        .select()
        .single()

      if (gymError) {
        console.log('   ❌ ジム作成失敗:', gymError.message)
        return
      }
      gymId = newGym.id
      console.log('   ✅ テストジム作成成功')
    } else {
      gymId = existingGym.id
      console.log('   ✅ 既存のテストジム使用')
    }

    // オーナー権限を設定
    await supabase
      .from('gym_owners')
      .delete()
      .eq('user_id', userId)
      .eq('gym_id', gymId)

    const { error: ownerError } = await supabase
      .from('gym_owners')
      .insert({
        user_id: userId,
        gym_id: gymId,
        role: 'owner',
        permissions: {
          canViewStats: true,
          canReplyReviews: true,
          canEditBasicInfo: true,
          canManageEquipment: true
        }
      })

    if (!ownerError) {
      console.log('   ✅ オーナー権限設定成功')
    }

    // ユーザーをジムオーナーとしてマーク
    await supabase
      .from('users')
      .update({ is_gym_owner: true })
      .eq('id', userId)

    // 2. 基本情報更新テスト
    console.log('\n📌 2. 基本情報更新テスト')
    const { data: updatedGym, error: updateError } = await supabase
      .from('gyms')
      .update({
        name: 'テストジム渋谷（更新済み）',
        city: '渋谷区',
        address: '東京都渋谷区道玄坂2-2-2',
        business_hours: {
          weekday: '6:00-23:00',
          weekend: '8:00-20:00',
          is_24h: false
        },
        price_info: {
          monthly: '9800',
          visitor: '2500',
          student: '7800'
        },
        facilities: {
          lockers: true,
          showers: true,
          parking: true,
          wifi: true,
          sauna: true,
          chalk_allowed: true,
          personal_training: true
        }
      })
      .eq('id', gymId)
      .select()
      .single()

    if (!updateError) {
      console.log('   ✅ 基本情報更新成功')
      console.log('     - ジム名:', updatedGym.name)
      console.log('     - 住所:', updatedGym.address)
      console.log('     - 月額料金:', updatedGym.price_info?.monthly, '円')
    } else {
      console.log('   ❌ 更新失敗:', updateError.message)
    }

    // 3. 設備追加テスト
    console.log('\n📌 3. 設備追加テスト')

    // 既存の設備を削除
    await supabase.from('gym_machines').delete().eq('gym_id', gymId)
    await supabase.from('gym_free_weights').delete().eq('gym_id', gymId)

    // マシン追加
    const machines = [
      { name: 'ベンチプレス台', brand: 'ROGUE', count: 5 },
      { name: 'パワーラック', brand: 'Hammer Strength', count: 4 },
      { name: 'ケーブルマシン', brand: 'Life Fitness', count: 3 }
    ]

    for (const machine of machines) {
      const { error } = await supabase
        .from('gym_machines')
        .insert({
          gym_id: gymId,
          name: machine.name,
          brand: machine.brand,
          count: machine.count,
          condition: '良好',
          updated_by: userId
        })

      if (!error) {
        console.log(`   ✅ マシン追加: ${machine.name} (${machine.brand}) x ${machine.count}台`)
      }
    }

    // フリーウェイト追加
    const freeWeights = [
      { name: 'ダンベル', brand: 'IVANKO', weight_range: '1-50kg', count: 20 },
      { name: 'バーベル', brand: 'ELEIKO', weight_range: '20kg', count: 10 },
      { name: 'プレート', brand: 'ROGUE', weight_range: '1.25-25kg', count: 50 }
    ]

    for (const fw of freeWeights) {
      const { error } = await supabase
        .from('gym_free_weights')
        .insert({
          gym_id: gymId,
          name: fw.name,
          brand: fw.brand,
          weight_range: fw.weight_range,
          count: fw.count,
          condition: '良好',
          updated_by: userId
        })

      if (!error) {
        console.log(`   ✅ フリーウェイト追加: ${fw.name} (${fw.brand}) ${fw.weight_range}`)
      }
    }

    // 4. レビュー作成と返信テスト
    console.log('\n📌 4. レビュー作成と返信テスト')

    // テストレビュー作成（別のユーザーとして）
    const reviewUserId = '8fb27b06-e383-49a6-8271-14e4408b8282' // testuser

    const { data: review, error: reviewError } = await supabase
      .from('gym_reviews')
      .insert({
        gym_id: gymId,
        user_id: reviewUserId,
        rating: 5,
        title: '素晴らしいジムです！',
        content: '設備が充実していて、スタッフの対応も親切です。特にフリーウェイトエリアが広くて使いやすいです。',
        equipment_rating: 5,
        cleanliness_rating: 5,
        staff_rating: 5,
        crowd_rating: 4
      })
      .select()
      .single()

    if (!reviewError) {
      console.log('   ✅ レビュー作成成功')

      // オーナー返信
      const { error: replyError } = await supabase
        .from('gym_review_replies')
        .insert({
          review_id: review.id,
          responder_user_id: userId,
          role: 'owner',
          content: 'この度は高評価をいただきありがとうございます！今後もより良いサービスを提供できるよう努めてまいります。'
        })

      if (!replyError) {
        console.log('   ✅ オーナー返信成功')
      } else {
        console.log('   ❌ 返信失敗:', replyError.message)
      }
    } else {
      console.log('   ❌ レビュー作成失敗:', reviewError.message)
    }

    // 5. データ取得テスト
    console.log('\n📌 5. データ取得確認')

    // 設備数確認
    const { count: machineCount } = await supabase
      .from('gym_machines')
      .select('*', { count: 'exact', head: true })
      .eq('gym_id', gymId)

    const { count: freeWeightCount } = await supabase
      .from('gym_free_weights')
      .select('*', { count: 'exact', head: true })
      .eq('gym_id', gymId)

    console.log(`   ✅ 設備数: マシン ${machineCount}台, フリーウェイト ${freeWeightCount}種類`)

    // レビュー数確認
    const { data: reviews } = await supabase
      .from('gym_reviews')
      .select(`
        *,
        replies:gym_review_replies(*)
      `)
      .eq('gym_id', gymId)

    console.log(`   ✅ レビュー数: ${reviews?.length || 0}件 (返信付き: ${reviews?.filter(r => r.replies?.length > 0).length || 0}件)`)

    // 6. 統計データ作成
    console.log('\n📌 6. 統計用テストデータ作成')

    // 投稿データ作成
    const postUserIds = [userId, reviewUserId, '41184fe2-8fab-43b7-8726-24682e829ab6']
    const crowdStatuses = ['empty', 'few', 'normal', 'crowded']

    for (let i = 0; i < 10; i++) {
      const { error } = await supabase
        .from('gym_posts')
        .insert({
          user_id: postUserIds[i % postUserIds.length],
          gym_id: gymId,
          content: `テスト投稿 ${i + 1}: 今日もいい汗かきました！`,
          crowd_status: crowdStatuses[i % crowdStatuses.length],
          workout_type: ['筋トレ', '有酸素', 'ストレッチ'][i % 3],
          duration_minutes: 60 + (i * 10),
          muscle_groups_trained: ['胸', '背中', '脚', '肩', '腕'][i % 5]
        })

      if (!error) {
        console.log(`   ✅ 投稿 ${i + 1} 作成`)
      }
    }

    console.log('\n✨ すべてのテスト完了！')
    console.log('\n📝 管理画面での確認方法:')
    console.log('1. http://localhost:3001/admin にアクセス')
    console.log('2. kenji@example.com でログイン')
    console.log('3. 各タブで以下を確認:')
    console.log('   ✅ 基本情報: 更新されたジム情報')
    console.log('   ✅ 設備管理: 追加されたマシンとフリーウェイト')
    console.log('   ✅ レビュー管理: レビューと返信')
    console.log('   ✅ 統計情報: 投稿数やグラフ表示')

  } catch (error) {
    console.error('❌ テスト中にエラーが発生しました:', error)
  }
}

// テスト実行
runTests()