const { createClient } = require('@supabase/supabase-js')
require('dotenv').config({ path: '.env.local' })

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL,
  process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

async function testUpdatedStats() {
  console.log('🧪 修正後の統計データをテストします...\n')

  const userId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac'

  try {
    // 1. SQL関数を直接テスト
    console.log('1️⃣ SQL関数の直接テスト...')

    const { data: weightResult } = await supabase
      .rpc('calculate_user_total_weight', { target_user_id: userId })

    const { data: streakResult } = await supabase
      .rpc('calculate_user_streak', { target_user_id: userId })

    console.log(`✅ 総重量関数: ${weightResult}kg (${(weightResult/1000).toFixed(1)}t)`)
    console.log(`✅ 連続記録関数: 現在${streakResult.current_streak}日, 最長${streakResult.longest_streak}日`)

    // 2. statistics.tsの関数をテスト
    console.log('\n2️⃣ 統計関数全体をテスト...')

    // getUserWorkoutStatisticsを手動で実装（モジュール読み込み問題回避）
    const now = new Date()
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
    const startOfWeek = new Date(now)
    startOfWeek.setDate(now.getDate() - now.getDay())
    const startOfYear = new Date(now.getFullYear(), 0, 1)

    // 総訪問回数
    const { count: totalVisits } = await supabase
      .from('workout_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)

    // 月間訪問
    const { count: monthlyVisits } = await supabase
      .from('workout_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('started_at', startOfMonth.toISOString())

    // 週間訪問
    const { count: weeklyVisits } = await supabase
      .from('workout_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('started_at', startOfWeek.toISOString())

    // 年間訪問
    const { count: yearlyVisits } = await supabase
      .from('workout_sessions')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .gte('started_at', startOfYear.toISOString())

    // 総時間計算
    const { data: sessions } = await supabase
      .from('workout_sessions')
      .select('started_at, ended_at')
      .eq('user_id', userId)
      .not('ended_at', 'is', null)

    let totalDurationHours = 0
    if (sessions) {
      sessions.forEach(session => {
        const start = new Date(session.started_at).getTime()
        const end = new Date(session.ended_at).getTime()
        totalDurationHours += (end - start) / (1000 * 60 * 60)
      })
    }

    const stats = {
      totalVisits: totalVisits || 0,
      monthlyVisits: monthlyVisits || 0,
      weeklyVisits: weeklyVisits || 0,
      yearlyVisits: yearlyVisits || 0,
      currentStreak: streakResult.current_streak,
      longestStreak: streakResult.longest_streak,
      totalWeight: weightResult,
      totalDurationHours: Math.round(totalDurationHours),
      avgDurationMinutes: totalVisits ? Math.round((totalDurationHours * 60) / totalVisits) : 0
    }

    console.log('📊 統計データ結果:')
    console.log(`  - 総訪問回数: ${stats.totalVisits}回`)
    console.log(`  - 週間訪問: ${stats.weeklyVisits}回`)
    console.log(`  - 月間訪問: ${stats.monthlyVisits}回`)
    console.log(`  - 年間訪問: ${stats.yearlyVisits}回`)
    console.log(`  - 現在の連続記録: ${stats.currentStreak}日`)
    console.log(`  - 最長連続記録: ${stats.longestStreak}日`)
    console.log(`  - 総重量: ${stats.totalWeight}kg (${(stats.totalWeight/1000).toFixed(1)}t)`)
    console.log(`  - 総時間: ${stats.totalDurationHours}時間`)
    console.log(`  - 平均時間: ${stats.avgDurationMinutes}分 (${(stats.avgDurationMinutes/60).toFixed(1)}時間)`)

    // 3. 期待値との比較
    console.log('\n3️⃣ 期待値との比較...')

    const expectedValues = {
      totalVisits: 34,
      totalWeight: 84200,
      currentStreak: 2,
      longestStreak: 4,
      totalDurationHours: 46,
      avgDurationMinutes: 84
    }

    Object.entries(expectedValues).forEach(([key, expected]) => {
      const actual = stats[key]
      const match = Math.abs(actual - expected) < 1
      console.log(`  ${match ? '✅' : '❌'} ${key}: 期待値${expected}, 実際${actual}`)
    })

    // 4. フロントエンドテスト
    console.log('\n4️⃣ フロントエンド表示テスト...')

    const http = require('http')
    const req = http.get('http://localhost:3001/gym-stats', (res) => {
      let data = ''
      res.on('data', chunk => data += chunk)
      res.on('end', () => {
        console.log(`✅ HTTPステータス: ${res.statusCode}`)

        // 待ち時間を設けて再度チェック
        setTimeout(() => {
          const req2 = http.get('http://localhost:3001/gym-stats', (res2) => {
            let data2 = ''
            res2.on('data', chunk => data2 += chunk)
            res2.on('end', () => {
              // 数値の表示を確認
              const foundNumbers = {
                totalVisits: /(\d{2,})回/.exec(data2),
                totalWeight: /(\d+\.?\d*)t/.exec(data2),
                totalHours: /(\d{2,})時間/.exec(data2),
                streak: /(\d+)日/.exec(data2)
              }

              console.log('📱 フロントエンドで見つかった数値:')
              Object.entries(foundNumbers).forEach(([key, match]) => {
                if (match) {
                  console.log(`  ✅ ${key}: ${match[0]}`)
                } else {
                  console.log(`  ⚠️ ${key}: 見つかりませんでした`)
                }
              })

              if (data2.includes('統計データを読み込み中')) {
                console.log('  ℹ️ まだローディング中のようです')
              } else {
                console.log('  ✅ データが読み込まれています')
              }
            })
          })
        }, 2000) // 2秒待ってからチェック
      })
    })

  } catch (error) {
    console.error('❌ テスト中にエラー:', error)
  }
}

testUpdatedStats()