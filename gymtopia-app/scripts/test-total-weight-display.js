const http = require('http');

console.log('🏋️‍♂️ 総重量表示のテストを開始します...\n');

async function testTotalWeightDisplay() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3001/gym-stats', (res) => {
      console.log(`✅ HTTPステータス: ${res.statusCode}`);

      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('✅ HTMLレスポンス受信完了\n');

        // 総重量の表示を確認
        console.log('🔍 総重量の表示を検索中...');

        // 様々なパターンで総重量を検索
        const patterns = [
          /(\d+(?:\.\d+)?)t/g,  // トン単位
          /(\d+(?:,\d{3})*)kg/g, // キログラム単位
          /総重量[:\s]*(\d+(?:\.\d+)?)[kt]/g, // 総重量ラベル付き
          /(\d{2,})(?:kg|t)/g // 2桁以上の重量値
        ];

        let foundWeights = [];

        patterns.forEach((pattern, index) => {
          let matches;
          while ((matches = pattern.exec(data)) !== null) {
            foundWeights.push({
              pattern: index + 1,
              value: matches[1] || matches[0],
              fullMatch: matches[0]
            });
          }
        });

        if (foundWeights.length > 0) {
          console.log('📊 見つかった重量表示:');
          foundWeights.forEach((weight, i) => {
            console.log(`  ${i + 1}. "${weight.fullMatch}" (値: ${weight.value})`);
          });

          // 84.2tまたは84200kgが表示されているか確認
          const expectedTons = 84.2;
          const expectedKg = 84200;

          const hasCorrectTons = foundWeights.some(w =>
            parseFloat(w.value) === expectedTons ||
            (w.fullMatch.includes('t') && Math.abs(parseFloat(w.value) - expectedTons) < 0.1)
          );

          const hasCorrectKg = foundWeights.some(w =>
            parseInt(w.value.replace(/,/g, '')) === expectedKg
          );

          if (hasCorrectTons) {
            console.log(`✅ 正しい総重量（${expectedTons}t）が表示されています`);
          } else if (hasCorrectKg) {
            console.log(`✅ 正しい総重量（${expectedKg}kg）が表示されています`);
          } else {
            console.log(`❌ 予想される総重量（${expectedTons}tまたは${expectedKg}kg）が見つかりません`);
            console.log('   実際の値:', foundWeights.map(w => w.fullMatch).join(', '));
          }
        } else {
          console.log('⚠️ 重量の表示が見つかりませんでした');
        }

        // JavaScriptの実行状況も確認
        console.log('\n🔧 JavaScript実行状況:');
        if (data.includes('統計データを読み込み中')) {
          console.log('  ℹ️ ローディング状態で表示されています（JavaScript実行前）');
        } else {
          console.log('  ✅ JavaScriptが実行され、データが表示されています');
        }

        // エラーの検査
        if (data.includes('error') || data.includes('Error')) {
          console.log('  ⚠️ エラーの可能性があります');
        }

        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`❌ リクエストエラー: ${error.message}`);
      resolve();
    });
  });
}

async function testStatisticsFunction() {
  console.log('\n🧪 統計関数の直接テスト...');

  try {
    // statistics.tsの関数を直接呼び出してテスト
    const { getUserWorkoutStatistics } = require('../src/lib/supabase/statistics');
    const userId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac';

    const stats = await getUserWorkoutStatistics(userId);

    console.log('📊 統計関数の結果:');
    console.log(`  - 総訪問回数: ${stats.totalVisits}回`);
    console.log(`  - 総重量: ${stats.totalWeight}kg (${(stats.totalWeight/1000).toFixed(1)}t)`);
    console.log(`  - 総時間: ${stats.totalDurationHours}時間`);
    console.log(`  - 現在の連続記録: ${stats.currentStreak}日`);

    if (stats.totalWeight === 84200) {
      console.log('✅ 統計関数が正しい総重量を返しています');
    } else {
      console.log(`❌ 統計関数の総重量が予想と異なります（期待値: 84200kg, 実際: ${stats.totalWeight}kg）`);
    }

  } catch (error) {
    console.log(`❌ 統計関数テストエラー: ${error.message}`);
  }
}

async function runAllTests() {
  await testTotalWeightDisplay();
  await testStatisticsFunction();

  console.log('\n✨ 総重量表示テスト完了！');
}

runAllTests();