const http = require('http');

function testEndpoint(path, description) {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost',
      port: 3001,
      path: path,
      method: 'GET',
      headers: {
        'Cookie': 'mockAuth=true' // モック認証を使用
      }
    };

    const req = http.request(options, (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ${description}: ステータス ${res.statusCode}`);

          // HTMLコンテンツの基本チェック
          if (data.includes('総訪問回数')) {
            console.log('   ✓ 総訪問回数が含まれています');
          }
          if (data.includes('現在の連続記録')) {
            console.log('   ✓ 連続記録が含まれています');
          }
          if (data.includes('総重量')) {
            console.log('   ✓ 総重量が含まれています');
          }
          if (data.includes('総時間')) {
            console.log('   ✓ 総時間が含まれています');
          }
          if (data.includes('よく行くジム')) {
            console.log('   ✓ ジムランキングが含まれています');
          }
          if (data.includes('曜日別パターン')) {
            console.log('   ✓ 曜日別パターンが含まれています');
          }
          if (data.includes('時間帯分布')) {
            console.log('   ✓ 時間帯分布が含まれています');
          }
          if (data.includes('最近の訪問')) {
            console.log('   ✓ 最近の訪問が含まれています');
          }
        } else {
          console.log(`❌ ${description}: ステータス ${res.statusCode}`);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`❌ ${description}: ${error.message}`);
      resolve();
    });

    req.end();
  });
}

async function runTests() {
  console.log('🧪 gym-statsページのテストを開始します...\n');

  // メインページのテスト
  await testEndpoint('/gym-stats', 'gym-statsページ');

  console.log('\n✨ テスト完了！');
}

runTests();