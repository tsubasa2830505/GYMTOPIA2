const { createClient } = require('@supabase/supabase-js')

// Supabase設定
const supabaseUrl = 'https://htytewqvkgwyuvcsvjwm.supabase.co'
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEzNDI0NiwiZXhwIjoyMDcyNzEwMjQ2fQ.VVNIX12yaN7t3seEzRwbMRtmNEbHoEkPXYeBzt60JBs'

const supabase = createClient(supabaseUrl, supabaseServiceKey)

// 施設データのマッピング（旧形式 → 新形式）
const facilitiesMapping = {
  // 旧フィールド名のマッピング
  'has_24h': '24hours',
  'has_shower': 'shower',
  'has_parking': 'parking',
  'has_locker': 'locker',
  'has_sauna': 'sauna',
  'has_wifi': 'wifi',
  'has_chalk': 'chalk',
  'chalk_allowed': 'chalk',
  'personal_training': 'personal_training',
  'lockers': 'locker',
  'showers': 'shower',
  'twentyFourHours': '24hours',
  'personalTraining': 'personal_training',
  'visitor_friendly': 'drop_in',
  'day_pass': 'drop_in',
  'trial': 'drop_in',
  'staff': 'english_support' // 仮マッピング
}

// デフォルトの施設データ
const defaultFacilities = {
  '24hours': false,
  'shower': true,
  'parking': false,
  'locker': true,
  'wifi': true,
  'chalk': false,
  'belt_rental': false,
  'personal_training': false,
  'group_lesson': false,
  'studio': false,
  'sauna': false,
  'pool': false,
  'jacuzzi': false,
  'massage_chair': false,
  'cafe': false,
  'women_only': false,
  'barrier_free': false,
  'kids_room': false,
  'english_support': false,
  'drop_in': true
}

async function migrateFacilities() {
  console.log('🔄 施設データ移行開始...\n')

  try {
    // 1. 全ジムのデータを取得
    console.log('📌 ステップ1: 既存データ取得')
    const { data: gyms, error: fetchError } = await supabase
      .from('gyms')
      .select('id, name, has_24h, has_shower, has_parking, has_locker, has_sauna, facilities, business_hours')

    if (fetchError) {
      console.error('❌ データ取得エラー:', fetchError)
      return
    }

    console.log(`  ✅ ${gyms.length}件のジムデータを取得\n`)

    // 2. 各ジムの施設データを統一フォーマットに変換
    console.log('📌 ステップ2: データ変換・更新')

    let successCount = 0
    let errorCount = 0

    for (const gym of gyms) {
      try {
        // 新しいfacilitiesオブジェクトを作成（デフォルト値から開始）
        const newFacilities = { ...defaultFacilities }

        // 既存のfacilitiesフィールドから値をマージ
        if (gym.facilities && typeof gym.facilities === 'object') {
          for (const [oldKey, value] of Object.entries(gym.facilities)) {
            // マッピングがある場合は新しいキーに変換
            const newKey = facilitiesMapping[oldKey] || oldKey
            if (newKey in newFacilities) {
              newFacilities[newKey] = Boolean(value)
            }
          }
        }

        // has_* フィールドから値を取得（優先）
        if (gym.has_24h !== null && gym.has_24h !== undefined) {
          newFacilities['24hours'] = Boolean(gym.has_24h)
        }
        if (gym.has_shower !== null && gym.has_shower !== undefined) {
          newFacilities['shower'] = Boolean(gym.has_shower)
        }
        if (gym.has_parking !== null && gym.has_parking !== undefined) {
          newFacilities['parking'] = Boolean(gym.has_parking)
        }
        if (gym.has_locker !== null && gym.has_locker !== undefined) {
          newFacilities['locker'] = Boolean(gym.has_locker)
        }
        if (gym.has_sauna !== null && gym.has_sauna !== undefined) {
          newFacilities['sauna'] = Boolean(gym.has_sauna)
        }

        // business_hoursから24時間営業を判定
        if (gym.business_hours) {
          if (gym.business_hours.is_24h) {
            newFacilities['24hours'] = true
          } else if (typeof gym.business_hours === 'object') {
            const hoursStr = JSON.stringify(gym.business_hours).toLowerCase()
            if (hoursStr.includes('24時間') || hoursStr.includes('24h')) {
              newFacilities['24hours'] = true
            }
          }
        }

        // データベースを更新
        const updateData = {
          facilities: newFacilities,
          // 旧フィールドも更新（互換性のため）
          has_24h: newFacilities['24hours'],
          has_shower: newFacilities['shower'],
          has_parking: newFacilities['parking'],
          has_locker: newFacilities['locker'],
          has_sauna: newFacilities['sauna']
        }

        const { error: updateError } = await supabase
          .from('gyms')
          .update(updateData)
          .eq('id', gym.id)

        if (updateError) {
          console.log(`  ❌ ${gym.name}: 更新失敗 - ${updateError.message}`)
          errorCount++
        } else {
          console.log(`  ✅ ${gym.name}: 施設データ更新完了`)
          successCount++
        }

      } catch (error) {
        console.log(`  ❌ ${gym.name}: エラー - ${error.message}`)
        errorCount++
      }
    }

    // 3. 結果サマリー
    console.log('\n' + '='.repeat(60))
    console.log('📊 移行結果サマリー')
    console.log('='.repeat(60))
    console.log(`  ✅ 成功: ${successCount}件`)
    console.log(`  ❌ 失敗: ${errorCount}件`)
    console.log(`  📝 合計: ${gyms.length}件`)

    // 4. 更新後のデータ確認
    console.log('\n📌 ステップ3: 更新データ確認（サンプル3件）')
    const { data: updatedGyms } = await supabase
      .from('gyms')
      .select('name, facilities')
      .limit(3)

    if (updatedGyms) {
      updatedGyms.forEach(gym => {
        console.log(`\n  ${gym.name}:`)
        const facilities = gym.facilities || {}
        const enabledFacilities = Object.entries(facilities)
          .filter(([_, value]) => value === true)
          .map(([key, _]) => {
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
            return labels[key] || key
          })
        console.log(`    利用可能: ${enabledFacilities.join(', ') || 'なし'}`)
      })
    }

    console.log('\n✨ 施設データ移行完了！')
    console.log('\n📝 確認方法:')
    console.log('1. 管理画面（http://localhost:3001/admin）にログイン')
    console.log('2. 基本情報タブで施設・サービスが正しく表示されることを確認')
    console.log('3. ジム詳細画面で施設タブの情報が正しく表示されることを確認')

  } catch (error) {
    console.error('\n❌ 移行中にエラーが発生しました:', error)
  }
}

// 実行
migrateFacilities()