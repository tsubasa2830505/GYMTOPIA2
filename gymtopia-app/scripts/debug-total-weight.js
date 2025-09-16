const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function debugTotalWeight() {
  const userId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'

  console.log('🔍 総重量計算のデバッグを開始します...\n')

  try {
    // 1. セッションIDの取得
    console.log('1️⃣ ユーザーのワークアウトセッションを取得中...')
    const { data: sessionIdRows, error: sessionError } = await supabase
      .from('workout_sessions')
      .select('id')
      .eq('user_id', userId)

    if (sessionError) {
      console.error('❌ セッション取得エラー:', sessionError)
      return
    }

    console.log(`✅ セッション数: ${sessionIdRows?.length || 0}`)

    const sessionIds = sessionIdRows?.map(r => r.id) || []

    if (sessionIds.length === 0) {
      console.log('⚠️ ワークアウトセッションが見つかりません')
      return
    }

    // 2. エクササイズデータの取得
    console.log('\n2️⃣ エクササイズデータを取得中...')
    const { data: exercises, error: exerciseError } = await supabase
      .from('workout_exercises')
      .select('exercise_name, sets, session_id')
      .in('session_id', sessionIds)

    if (exerciseError) {
      console.error('❌ エクササイズ取得エラー:', exerciseError)
      return
    }

    console.log(`✅ エクササイズ数: ${exercises?.length || 0}`)

    if (!exercises || exercises.length === 0) {
      console.log('⚠️ エクササイズデータが見つかりません')
      return
    }

    // 3. 総重量の計算（デバッグ版）
    console.log('\n3️⃣ 総重量を計算中...')
    let totalWeight = 0
    let processedSets = 0
    let exerciseCount = 0

    exercises.forEach((exercise, exerciseIndex) => {
      console.log(`\n  📋 エクササイズ ${exerciseIndex + 1}: ${exercise.exercise_name}`)
      console.log(`     セッションID: ${exercise.session_id}`)
      console.log(`     セットデータ: ${JSON.stringify(exercise.sets)}`)

      if (exercise.sets && Array.isArray(exercise.sets)) {
        exercise.sets.forEach((set, setIndex) => {
          console.log(`     セット ${setIndex + 1}: 重量=${set.weight}kg, 回数=${set.reps}回`)

          if (set.weight && set.reps) {
            const setWeight = set.weight * set.reps
            totalWeight += setWeight
            processedSets++
            console.log(`       → セット合計: ${setWeight}kg`)
          } else {
            console.log('       → スキップ（重量または回数が無効）')
          }
        })
        exerciseCount++
      } else {
        console.log('     ⚠️ セットデータが配列ではありません')
      }
    })

    console.log(`\n📊 計算結果:`)
    console.log(`  - 処理したエクササイズ数: ${exerciseCount}`)
    console.log(`  - 処理したセット数: ${processedSets}`)
    console.log(`  - 総重量: ${totalWeight}kg`)
    console.log(`  - 総重量（トン）: ${(totalWeight / 1000).toFixed(1)}t`)

    // 4. 統計関数との比較
    console.log('\n4️⃣ 統計関数の結果と比較...')

    // statistics.tsの関数を手動で再現
    const { getUserWorkoutStatistics } = require('../src/lib/supabase/statistics')

    const stats = await getUserWorkoutStatistics(userId)
    console.log(`統計関数の結果: ${stats.totalWeight}kg`)

    if (Math.abs(stats.totalWeight - totalWeight) < 0.01) {
      console.log('✅ 計算結果が一致しています')
    } else {
      console.log('❌ 計算結果が一致しません')
      console.log(`  手動計算: ${totalWeight}kg`)
      console.log(`  統計関数: ${stats.totalWeight}kg`)
      console.log(`  差異: ${Math.abs(stats.totalWeight - totalWeight)}kg`)
    }

    // 5. フロントエンド表示のテスト
    console.log('\n5️⃣ フロントエンド表示をテスト...')

    const http = require('http')
    const req = http.get('http://localhost:3001/gym-stats', (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        // 総重量の表示を確認
        const weightMatch = data.match(/(\d+(?:\.\d+)?)t/)
        if (weightMatch) {
          const displayedTons = parseFloat(weightMatch[1])
          console.log(`フロントエンドの表示: ${displayedTons}t (${displayedTons * 1000}kg)`)

          if (Math.abs((displayedTons * 1000) - totalWeight) < 0.01) {
            console.log('✅ フロントエンドの表示が正しいです')
          } else {
            console.log('❌ フロントエンドの表示に問題があります')
          }
        } else {
          console.log('⚠️ フロントエンドで総重量の表示が見つかりませんでした')
        }
      })
    })

    req.on('error', (error) => {
      console.log('❌ フロントエンドテストエラー:', error.message)
    })

  } catch (error) {
    console.error('❌ デバッグ中にエラー:', error)
  }
}

debugTotalWeight()