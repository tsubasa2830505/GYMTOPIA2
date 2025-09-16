// AuthContextの動作をテストするためのシンプルなテストページ
const http = require('http');

console.log('🔐 AuthContextの動作テストを開始します...\n');

async function testAuthContext() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3001/gym-stats', (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => {
        console.log('📄 レスポンス分析:');

        // レスポンスの基本情報
        console.log(`  - ステータス: ${res.statusCode}`);
        console.log(`  - レスポンスサイズ: ${data.length} bytes`);

        // ローディング状態の確認
        const isLoading = data.includes('統計データを読み込み中');
        console.log(`  - ローディング状態: ${isLoading ? 'はい（まだ読み込み中）' : 'いいえ（データ表示済み）'}`);

        // JavaScriptファイルの確認
        const hasJS = data.includes('gym-stats/page.js');
        console.log(`  - JSファイル読み込み: ${hasJS ? 'あり' : 'なし'}`);

        // 認証関連のスクリプトの確認
        const hasAuthContext = data.includes('AuthContext') || data.includes('useAuth');
        console.log(`  - 認証コンテキスト: ${hasAuthContext ? 'あり' : 'なし'}`);

        // エラーの確認
        const hasError = data.includes('error') || data.includes('Error');
        if (hasError) {
          console.log('  ⚠️ エラーの可能性があります');
        }

        // 環境変数の確認
        console.log('\n🌍 環境変数確認:');
        console.log(`  - NODE_ENV: ${process.env.NODE_ENV || '未設定'}`);
        console.log(`  - NEXT_PUBLIC_USE_MOCK_AUTH: ${process.env.NEXT_PUBLIC_USE_MOCK_AUTH || '未設定'}`);
        console.log(`  - NEXT_PUBLIC_MOCK_USER_ID: ${process.env.NEXT_PUBLIC_MOCK_USER_ID || '未設定'}`);

        // 統計データの表示確認
        console.log('\n📊 統計データ確認:');
        const totalWeightMatch = data.match(/([\d.]+)t/);
        const totalVisitsMatch = data.match(/(\d+)回/);

        if (totalWeightMatch) {
          console.log(`  ✅ 総重量: ${totalWeightMatch[0]}`);
        } else {
          console.log('  ❌ 総重量: 見つからない');
        }

        if (totalVisitsMatch) {
          console.log(`  ✅ 総訪問回数: ${totalVisitsMatch[0]}`);
        } else {
          console.log('  ❌ 総訪問回数: 見つからない');
        }

        // HTMLの抜粋を表示
        console.log('\n📝 HTML抜粋（ローディング部分）:');
        const loadingMatch = data.match(/<div class="text-center">.*?統計データを読み込み中.*?<\/div>/s);
        if (loadingMatch) {
          console.log('  ' + loadingMatch[0].substring(0, 200) + '...');
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

async function testMultipleTimes() {
  for (let i = 1; i <= 3; i++) {
    console.log(`\n🔄 テスト ${i}/3:`);
    await testAuthContext();

    if (i < 3) {
      console.log('  ⏳ 2秒待機...');
      await new Promise(resolve => setTimeout(resolve, 2000));
    }
  }

  console.log('\n✨ AuthContextテスト完了！');
}

testMultipleTimes();