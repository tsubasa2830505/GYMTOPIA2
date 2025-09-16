const { createClient } = require('@supabase/supabase-js')

// Supabase設定
const supabaseUrl = 'https://htytewqvkgwyuvcsvjwm.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEzNDI0NiwiZXhwIjoyMDcyNzEwMjQ2fQ.VVNIX12yaN7t3seEzRwbMRtmNEbHoEkPXYeBzt60JBs'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// ランダムデータ生成用
const gymNames = [
  'ゴールドジム渋谷', 'エニタイムフィットネス新宿', 'ティップネス池袋',
  'ワールドジム品川', 'パワーハウスジム六本木', 'マッスルファクトリー恵比寿',
  'ストロングジム原宿', 'フィットネスクラブ青山', 'トレーニングスタジオ表参道'
]

const equipmentMachines = [
  { name: 'ベンチプレス台', brands: ['ROGUE', 'Hammer Strength', 'Life Fitness'] },
  { name: 'パワーラック', brands: ['ROGUE', 'ELEIKO', 'Cybex'] },
  { name: 'スミスマシン', brands: ['Life Fitness', 'Hammer Strength', 'Technogym'] },
  { name: 'ケーブルマシン', brands: ['Cybex', 'Life Fitness', 'Prime Fitness'] },
  { name: 'ラットプルダウン', brands: ['Hammer Strength', 'Cybex', 'Life Fitness'] },
  { name: 'レッグプレス', brands: ['Cybex', 'Hammer Strength', 'Life Fitness'] },
  { name: 'チェストプレス', brands: ['Life Fitness', 'Technogym', 'Cybex'] },
  { name: 'ショルダープレス', brands: ['Hammer Strength', 'Life Fitness', 'Cybex'] }
]

const freeWeightEquipment = [
  { name: 'ダンベル', ranges: ['1-50kg', '1-40kg', '2.5-50kg'], brands: ['IVANKO', 'ELEIKO', 'ROGUE'] },
  { name: 'バーベル', ranges: ['20kg', '15kg', '10kg'], brands: ['ELEIKO', 'ROGUE', 'IVANKO'] },
  { name: 'プレート', ranges: ['1.25-25kg', '2.5-20kg', '5-25kg'], brands: ['ELEIKO', 'ROGUE', 'IVANKO'] },
  { name: 'ケトルベル', ranges: ['4-48kg', '8-32kg', '4-40kg'], brands: ['ROGUE', 'ELEIKO', 'Reebok'] },
  { name: 'EZバー', ranges: ['10-40kg', '15-35kg', '10-30kg'], brands: ['IVANKO', 'ELEIKO', 'ROGUE'] }
]

const reviewContents = [
  '設備が充実していて、トレーニングに集中できます。スタッフの対応も親切で満足しています。',
  'フリーウェイトエリアが広くて使いやすい！パワーラックも複数あるので待ち時間が少ないです。',
  '清潔感があり、更衣室も広くて快適です。シャワールームも混雑することが少なくて良いです。',
  '24時間営業なので、仕事帰りでも通いやすいです。深夜は人も少なくて集中できます。',
  'マシンの種類が豊富で、初心者から上級者まで満足できる環境だと思います。',
  '料金がリーズナブルで、設備も十分。コスパ最高のジムです！',
  'トレーナーの知識が豊富で、適切なアドバイスをもらえます。初心者にもおすすめです。',
  '混雑時でも器具が多いので、待ち時間なくトレーニングできます。',
  'プロテインバーがあるのが嬉しい。トレーニング後にすぐ栄養補給できます。',
  '駐車場完備で車でも通いやすい。立地も良くてアクセス抜群です。'
]

const ownerReplies = [
  'ご利用ありがとうございます！今後もより良いサービスを提供できるよう努めてまいります。',
  '高評価をいただき、ありがとうございます。スタッフ一同、大変励みになります。',
  'お褒めの言葉をいただき光栄です。これからも快適な環境づくりに努めます。',
  '貴重なご意見ありがとうございます。さらなる改善に向けて取り組んでまいります。',
  'ご満足いただけて何よりです。またのご利用をお待ちしております。'
]

const postContents = [
  '今日は胸の日！ベンチプレス100kg達成💪',
  'デッドリフト新記録更新！次は200kg目指します',
  '朝トレ完了。空いてて最高でした',
  'スクワット頑張った！明日は絶対筋肉痛...',
  '背中のトレーニング完了。広背筋パンパン！',
  'HIITトレーニング30分。汗だくです💦',
  '肩トレday。サイドレイズで追い込みました',
  '脚トレ後のプロテインが最高に美味い',
  '今日は有酸素メイン。トレッドミル40分走破',
  '腕の日。二頭と三頭をスーパーセットで追い込み'
]

async function sleep(ms) {
  return new Promise(resolve => setTimeout(resolve, ms))
}

async function runFullTest() {
  console.log('🚀 管理画面フルテストデータ作成開始...\n')
  console.log('⏱️  大量のデータを作成します（約1-2分かかります）\n')

  try {
    // 1. ユーザーデータを取得
    console.log('📌 ステップ1: ユーザーデータ準備')
    const { data: users } = await supabase
      .from('users')
      .select('id, email, username')
      .limit(5)

    console.log(`   ✅ ${users.length}人のユーザーを使用`)

    // 2. 複数のジムを作成
    console.log('\n📌 ステップ2: ジムデータ作成')
    const gyms = []

    for (let i = 0; i < 3; i++) {
      const gymData = {
        name: gymNames[i],
        city: ['渋谷区', '新宿区', '港区'][i],
        address: `東京都${['渋谷区', '新宿区', '港区'][i]}${i + 1}-${i + 1}-${i + 1}`,
        prefecture: '東京都',
        business_hours: {
          weekday: i === 0 ? '24時間営業' : `${6 + i}:00-23:00`,
          weekend: i === 0 ? '24時間営業' : `${8 + i}:00-21:00`,
          is_24h: i === 0
        },
        price_info: {
          monthly: String(8000 + (i * 2000)),
          visitor: String(2000 + (i * 500)),
          student: String(6000 + (i * 1500))
        },
        facilities: {
          lockers: true,
          showers: true,
          parking: i % 2 === 0,
          wifi: true,
          sauna: i === 2,
          chalk_allowed: i !== 1,
          personal_training: i >= 1
        },
        rating: 4 + Math.random(),
        created_by: users[i % users.length].id
      }

      const { data: gym, error } = await supabase
        .from('gyms')
        .insert(gymData)
        .select()
        .single()

      if (!error) {
        gyms.push(gym)
        console.log(`   ✅ ジム作成: ${gym.name}`)
      }
    }

    // 3. ジムオーナー設定
    console.log('\n📌 ステップ3: ジムオーナー権限設定')
    for (let i = 0; i < gyms.length && i < users.length; i++) {
      await supabase
        .from('gym_owners')
        .delete()
        .eq('user_id', users[i].id)
        .eq('gym_id', gyms[i].id)

      const { error } = await supabase
        .from('gym_owners')
        .insert({
          user_id: users[i].id,
          gym_id: gyms[i].id,
          role: 'owner',
          permissions: {
            canViewStats: true,
            canReplyReviews: true,
            canEditBasicInfo: true,
            canManageEquipment: true
          }
        })

      if (!error) {
        await supabase
          .from('users')
          .update({ is_gym_owner: true })
          .eq('id', users[i].id)

        console.log(`   ✅ ${users[i].email} を ${gyms[i].name} のオーナーに設定`)
      }
    }

    // 4. 各ジムに設備を追加
    console.log('\n📌 ステップ4: 設備データ作成')
    for (const gym of gyms) {
      // 既存の設備をクリア
      await supabase.from('gym_machines').delete().eq('gym_id', gym.id)
      await supabase.from('gym_free_weights').delete().eq('gym_id', gym.id)

      // マシン追加（各ジム5-8種類）
      const machineCount = 5 + Math.floor(Math.random() * 4)
      for (let i = 0; i < machineCount; i++) {
        const machine = equipmentMachines[i % equipmentMachines.length]
        const brand = machine.brands[Math.floor(Math.random() * machine.brands.length)]

        await supabase
          .from('gym_machines')
          .insert({
            gym_id: gym.id,
            name: machine.name,
            brand: brand,
            count: Math.floor(Math.random() * 5) + 1,
            condition: ['新品', '良好', '普通'][Math.floor(Math.random() * 3)]
          })
      }

      // フリーウェイト追加（各ジム3-5種類）
      const freeWeightCount = 3 + Math.floor(Math.random() * 3)
      for (let i = 0; i < freeWeightCount; i++) {
        const fw = freeWeightEquipment[i % freeWeightEquipment.length]
        const range = fw.ranges[Math.floor(Math.random() * fw.ranges.length)]
        const brand = fw.brands[Math.floor(Math.random() * fw.brands.length)]

        await supabase
          .from('gym_free_weights')
          .insert({
            gym_id: gym.id,
            name: fw.name,
            brand: brand,
            weight_range: range,
            count: fw.name === 'プレート' ? 20 + Math.floor(Math.random() * 30) : Math.floor(Math.random() * 10) + 5,
            condition: ['新品', '良好', '普通'][Math.floor(Math.random() * 3)]
          })
      }

      console.log(`   ✅ ${gym.name}: マシン${machineCount}種、フリーウェイト${freeWeightCount}種追加`)
    }

    // 5. レビューと返信を作成
    console.log('\n📌 ステップ5: レビューと返信作成')
    for (const gym of gyms) {
      const reviewCount = 3 + Math.floor(Math.random() * 5) // 3-7件のレビュー

      for (let i = 0; i < reviewCount; i++) {
        const reviewer = users[(i + 1) % users.length] // オーナー以外のユーザー
        const rating = 3 + Math.floor(Math.random() * 3) // 3-5の評価

        const { data: review } = await supabase
          .from('gym_reviews')
          .insert({
            gym_id: gym.id,
            user_id: reviewer.id,
            rating: rating,
            title: rating >= 4 ? '素晴らしいジムです！' : 'まあまあのジムです',
            content: reviewContents[i % reviewContents.length],
            equipment_rating: 3 + Math.floor(Math.random() * 3),
            cleanliness_rating: 3 + Math.floor(Math.random() * 3),
            staff_rating: 3 + Math.floor(Math.random() * 3),
            crowd_rating: 2 + Math.floor(Math.random() * 4)
          })
          .select()
          .single()

        // 70%の確率でオーナー返信を追加
        if (review && Math.random() > 0.3) {
          const owner = users[gyms.indexOf(gym) % users.length]
          await supabase
            .from('gym_review_replies')
            .insert({
              review_id: review.id,
              responder_user_id: owner.id,
              role: 'owner',
              content: ownerReplies[Math.floor(Math.random() * ownerReplies.length)]
            })
        }
      }

      console.log(`   ✅ ${gym.name}: ${reviewCount}件のレビュー作成`)
    }

    // 6. 投稿データを作成（時間帯を分散）
    console.log('\n📌 ステップ6: 投稿データ作成（統計用）')
    const crowdStatuses = ['empty', 'few', 'normal', 'crowded', 'full']
    const workoutTypes = ['筋トレ', '有酸素', 'ストレッチ', 'HIIT', 'クロスフィット']
    const muscleGroups = ['胸', '背中', '脚', '肩', '腕', '腹筋']

    for (const gym of gyms) {
      // 既存の投稿をクリア（テスト用）
      await supabase.from('gym_posts').delete().eq('gym_id', gym.id)

      const postCount = 20 + Math.floor(Math.random() * 30) // 20-50件の投稿

      for (let i = 0; i < postCount; i++) {
        const poster = users[Math.floor(Math.random() * users.length)]
        const hour = Math.floor(Math.random() * 24)
        const minute = Math.floor(Math.random() * 60)

        // 時間帯による混雑状況の重み付け
        let crowdStatus
        if (hour >= 6 && hour < 9) crowdStatus = crowdStatuses[Math.random() > 0.7 ? 2 : 1]
        else if (hour >= 18 && hour < 21) crowdStatus = crowdStatuses[Math.random() > 0.3 ? 3 : 2]
        else if (hour >= 21 || hour < 6) crowdStatus = crowdStatuses[Math.random() > 0.8 ? 1 : 0]
        else crowdStatus = crowdStatuses[Math.floor(Math.random() * 3) + 1]

        await supabase
          .from('gym_posts')
          .insert({
            user_id: poster.id,
            gym_id: gym.id,
            content: postContents[i % postContents.length],
            crowd_status: crowdStatus,
            workout_type: workoutTypes[Math.floor(Math.random() * workoutTypes.length)],
            muscle_groups_trained: [muscleGroups[Math.floor(Math.random() * muscleGroups.length)]],
            duration_minutes: 30 + Math.floor(Math.random() * 90),
            workout_started_at: `${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}:00`,
            likes_count: Math.floor(Math.random() * 20),
            comments_count: Math.floor(Math.random() * 5)
          })
      }

      console.log(`   ✅ ${gym.name}: ${postCount}件の投稿作成`)
    }

    // 7. お気に入り登録
    console.log('\n📌 ステップ7: お気に入り登録')
    for (const user of users) {
      const favoriteGyms = gyms.filter(() => Math.random() > 0.5)
      for (const gym of favoriteGyms) {
        await supabase
          .from('favorite_gyms')
          .delete()
          .eq('user_id', user.id)
          .eq('gym_id', gym.id)

        await supabase
          .from('favorite_gyms')
          .insert({
            user_id: user.id,
            gym_id: gym.id
          })
      }

      if (favoriteGyms.length > 0) {
        console.log(`   ✅ ${user.username}: ${favoriteGyms.length}件のジムをお気に入り登録`)
      }
    }

    // 8. 結果サマリー
    console.log('\n' + '='.repeat(60))
    console.log('✨ テストデータ作成完了！')
    console.log('='.repeat(60))

    console.log('\n📊 作成データサマリー:')
    console.log(`  • ジム: ${gyms.length}件`)
    console.log(`  • ジムオーナー: ${Math.min(gyms.length, users.length)}人`)

    const { count: machineCount } = await supabase
      .from('gym_machines')
      .select('*', { count: 'exact', head: true })
      .in('gym_id', gyms.map(g => g.id))

    const { count: freeWeightCount } = await supabase
      .from('gym_free_weights')
      .select('*', { count: 'exact', head: true })
      .in('gym_id', gyms.map(g => g.id))

    const { count: reviewCount } = await supabase
      .from('gym_reviews')
      .select('*', { count: 'exact', head: true })
      .in('gym_id', gyms.map(g => g.id))

    const { count: postCount } = await supabase
      .from('gym_posts')
      .select('*', { count: 'exact', head: true })
      .in('gym_id', gyms.map(g => g.id))

    console.log(`  • マシン: ${machineCount}種類`)
    console.log(`  • フリーウェイト: ${freeWeightCount}種類`)
    console.log(`  • レビュー: ${reviewCount}件`)
    console.log(`  • 投稿: ${postCount}件`)

    console.log('\n📝 管理画面で確認:')
    console.log('1. http://localhost:3001/admin にアクセス')
    console.log('2. 以下のユーザーでログイン可能:')
    for (let i = 0; i < Math.min(gyms.length, users.length); i++) {
      console.log(`   • ${users[i].email} → ${gyms[i].name}のオーナー`)
    }
    console.log('\n3. 各タブで豊富なデータを確認:')
    console.log('   📊 基本情報: ジム情報の編集')
    console.log('   🏋️ 設備管理: 多数のマシン・フリーウェイト')
    console.log('   💬 レビュー管理: レビューと返信')
    console.log('   📈 統計情報: 時間帯別投稿、設備言及、投稿者分析')

  } catch (error) {
    console.error('\n❌ エラーが発生しました:', error)
  }
}

// 実行
runFullTest()