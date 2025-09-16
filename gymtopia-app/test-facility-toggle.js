const { createClient } = require('@supabase/supabase-js')

// Supabase設定
const supabaseUrl = 'https://htytewqvkgwyuvcsvjwm.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEzNDI0NiwiZXhwIjoyMDcyNzEwMjQ2fQ.VVNIX12yaN7t3seEzRwbMRtmNEbHoEkPXYeBzt60JBs'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

async function testFacilityToggle() {
  console.log('🧪 施設切り替え機能テスト開始...\n')

  try {
    // テスト対象のジムを選択
    const testGymName = 'ハンマーストレングス渋谷'

    // 1. 現在の施設状態を取得
    console.log('📌 ステップ1: 現在の施設状態確認')
    const { data: beforeGym, error: fetchError } = await supabase
      .from('gyms')
      .select('id, name, facilities')
      .eq('name', testGymName)
      .single()

    if (fetchError || !beforeGym) {
      console.log(`❌ ジム「${testGymName}」が見つかりません`)
      return
    }

    console.log(`✅ 対象ジム: ${beforeGym.name}`)
    console.log('   更新前の施設状況:')
    const beforeFacilities = beforeGym.facilities || {}
    Object.entries(beforeFacilities).forEach(([key, value]) => {
      const labels = {
        '24hours': '24時間営業',
        'shower': 'シャワー',
        'parking': '駐車場',
        'locker': 'ロッカー',
        'wifi': 'Wi-Fi',
        'chalk': 'チョーク利用可',
        'belt_rental': 'ベルト貸出',
        'personal_training': 'パーソナル',
        'group_lesson': 'グループレッスン',
        'studio': 'スタジオ',
        'sauna': 'サウナ',
        'pool': 'プール',
        'jacuzzi': 'ジャグジー',
        'massage_chair': 'マッサージチェア',
        'cafe': 'カフェ/売店',
        'women_only': '女性専用エリア',
        'barrier_free': 'バリアフリー',
        'kids_room': 'キッズルーム',
        'english_support': '英語対応',
        'drop_in': 'ドロップイン'
      }
      const label = labels[key] || key
      const status = value ? '✅ ON' : '❌ OFF'
      console.log(`     ${label}: ${status}`)
    })

    // 2. 施設の状態を変更（いくつかの項目をトグル）
    console.log('\n📌 ステップ2: 施設設定を変更')

    const newFacilities = { ...beforeFacilities }

    // テスト用に以下の項目をトグル
    const toggleItems = ['sauna', 'pool', 'personal_training', 'chalk']

    toggleItems.forEach(item => {
      const oldValue = newFacilities[item] || false
      newFacilities[item] = !oldValue
      const label = {
        'sauna': 'サウナ',
        'pool': 'プール',
        'personal_training': 'パーソナル',
        'chalk': 'チョーク利用可'
      }[item]
      console.log(`   ${label}: ${oldValue ? 'ON' : 'OFF'} → ${!oldValue ? 'ON' : 'OFF'}`)
    })

    // 3. 管理画面と同じ形式でデータ更新
    console.log('\n📌 ステップ3: データベース更新実行')

    const updateData = {
      business_hours: {
        weekday: '24時間営業',
        is_24h: newFacilities['24hours']
      },
      price_info: {
        monthly: '12800',
        visitor: '3200'
      },
      facilities: newFacilities,
      // 互換性のための旧フィールド更新
      has_24h: newFacilities['24hours'],
      has_shower: newFacilities['shower'],
      has_parking: newFacilities['parking'],
      has_locker: newFacilities['locker'],
      has_sauna: newFacilities['sauna']
    }

    const { data: updatedGym, error: updateError } = await supabase
      .from('gyms')
      .update(updateData)
      .eq('id', beforeGym.id)
      .select('facilities')
      .single()

    if (updateError) {
      console.log('❌ 更新失敗:', updateError.message)
      return
    }

    console.log('✅ データベース更新成功')

    // 4. 更新後の状態確認
    console.log('\n📌 ステップ4: 更新後の施設状態確認')
    const afterFacilities = updatedGym.facilities || {}
    console.log('   更新後の施設状況:')
    Object.entries(afterFacilities).forEach(([key, value]) => {
      const labels = {
        '24hours': '24時間営業',
        'shower': 'シャワー',
        'parking': '駐車場',
        'locker': 'ロッカー',
        'wifi': 'Wi-Fi',
        'chalk': 'チョーク利用可',
        'belt_rental': 'ベルト貸出',
        'personal_training': 'パーソナル',
        'group_lesson': 'グループレッスン',
        'studio': 'スタジオ',
        'sauna': 'サウナ',
        'pool': 'プール',
        'jacuzzi': 'ジャグジー',
        'massage_chair': 'マッサージチェア',
        'cafe': 'カフェ/売店',
        'women_only': '女性専用エリア',
        'barrier_free': 'バリアフリー',
        'kids_room': 'キッズルーム',
        'english_support': '英語対応',
        'drop_in': 'ドロップイン'
      }
      const label = labels[key] || key
      const status = value ? '✅ ON' : '❌ OFF'
      const changed = beforeFacilities[key] !== value ? ' 🔄 CHANGED' : ''
      console.log(`     ${label}: ${status}${changed}`)
    })

    // 5. 変更の検証
    console.log('\n📌 ステップ5: 変更内容の検証')
    let changeCount = 0
    toggleItems.forEach(item => {
      const beforeValue = beforeFacilities[item] || false
      const afterValue = afterFacilities[item] || false
      const label = {
        'sauna': 'サウナ',
        'pool': 'プール',
        'personal_training': 'パーソナル',
        'chalk': 'チョーク利用可'
      }[item]

      if (beforeValue !== afterValue) {
        console.log(`   ✅ ${label}: 正常に切り替わりました`)
        changeCount++
      } else {
        console.log(`   ❌ ${label}: 切り替わっていません`)
      }
    })

    console.log(`\n📊 結果: ${changeCount}/${toggleItems.length} 項目が正常に切り替わりました`)

    if (changeCount === toggleItems.length) {
      console.log('✨ 施設切り替え機能は正常に動作しています！')
    } else {
      console.log('⚠️  一部の施設が正常に切り替わりませんでした')
    }

    // 6. 管理画面での確認方法
    console.log('\n📝 管理画面での確認方法:')
    console.log('1. http://localhost:3001/admin にアクセス')
    console.log('2. testuser@gmail.com でログイン（ゴールドジム渋谷のオーナー）')
    console.log('3. ジムセレクターで「ハンマーストレングス渋谷」を選択')
    console.log('4. 基本情報タブで施設・サービスの切り替えをテスト')
    console.log('5. 「基本情報を保存」ボタンをクリック')
    console.log('6. ページをリロードして設定が保持されているか確認')

  } catch (error) {
    console.error('\n❌ テスト中にエラーが発生しました:', error)
  }
}

// テスト実行
testFacilityToggle()