const puppeteer = require('puppeteer');

async function testBrowserJS() {
  console.log('🌐 ブラウザでJavaScript実行をテストします...\n');

  const browser = await puppeteer.launch({
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // コンソールログをキャプチャ
    page.on('console', msg => {
      const type = msg.type();
      const text = msg.text();
      if (type === 'error') {
        console.log(`❌ JS Error: ${text}`);
      } else if (type === 'warn') {
        console.log(`⚠️ JS Warning: ${text}`);
      } else if (text.includes('統計') || text.includes('Error')) {
        console.log(`ℹ️ JS Log: ${text}`);
      }
    });

    // ページエラーをキャプチャ
    page.on('pageerror', error => {
      console.log(`❌ Page Error: ${error.message}`);
    });

    console.log('📍 ページを読み込み中...');
    await page.goto('http://localhost:3001/gym-stats', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    // 少し待つ
    await page.waitForTimeout(3000);

    // ローディング状態を確認
    const isLoading = await page.evaluate(() => {
      return document.body.innerHTML.includes('統計データを読み込み中');
    });

    console.log(`📊 ローディング状態: ${isLoading ? 'まだ読み込み中' : 'データ表示済み'}`);

    // 統計数値を検索
    const stats = await page.evaluate(() => {
      const text = document.body.innerHTML;
      const totalWeight = text.match(/([\d.]+)t/)?.[1];
      const totalVisits = text.match(/(\d+)回/)?.[1];
      const currentStreak = text.match(/(\d+)日/)?.[1];

      return {
        totalWeight,
        totalVisits,
        currentStreak,
        hasData: !text.includes('統計データを読み込み中')
      };
    });

    console.log('\n📈 見つかった統計データ:');
    console.log(`  - データが表示されているか: ${stats.hasData ? 'はい' : 'いいえ'}`);
    console.log(`  - 総重量: ${stats.totalWeight || '見つからない'}`);
    console.log(`  - 総訪問回数: ${stats.totalVisits || '見つからない'}`);
    console.log(`  - 現在のストリーク: ${stats.currentStreak || '見つからない'}`);

    // 認証状態を確認
    const authState = await page.evaluate(() => {
      // LocalStorageやSessionStorageで認証状態を確認
      return {
        hasUser: !!window.localStorage.getItem('auth-user') || !!window.sessionStorage.getItem('auth-user'),
        localStorage: Object.keys(window.localStorage),
        sessionStorage: Object.keys(window.sessionStorage)
      };
    });

    console.log('\n🔐 認証状態:');
    console.log(`  - ユーザー情報あり: ${authState.hasUser}`);
    console.log(`  - localStorage keys: [${authState.localStorage.join(', ')}]`);
    console.log(`  - sessionStorage keys: [${authState.sessionStorage.join(', ')}]`);

    // 期待値と比較
    if (stats.hasData) {
      if (stats.totalWeight === '84.2' && stats.totalVisits === '34') {
        console.log('\n✅ 期待される統計データが正しく表示されています！');
      } else {
        console.log('\n⚠️ 統計データが期待値と異なります');
        console.log(`  期待値: 84.2t, 34回`);
        console.log(`  実際: ${stats.totalWeight}t, ${stats.totalVisits}回`);
      }
    } else {
      console.log('\n❌ まだローディング中で、データが表示されていません');
    }

  } catch (error) {
    console.log(`❌ テストエラー: ${error.message}`);
  } finally {
    await browser.close();
    console.log('\n✨ ブラウザテスト完了！');
  }
}

// Puppeteerが利用可能かチェック
try {
  testBrowserJS();
} catch (error) {
  console.log('⚠️ Puppeteerが利用できません。通常のHTTPテストを実行します...');

  // フォールバック: シンプルなHTTPテスト
  const http = require('http');
  const req = http.get('http://localhost:3001/gym-stats', (res) => {
    let data = '';
    res.on('data', chunk => data += chunk);
    res.on('end', () => {
      const isLoading = data.includes('統計データを読み込み中');
      console.log(`📊 ローディング状態: ${isLoading ? 'まだ読み込み中' : 'データ表示済み'}`);

      // 簡単な数値検索
      const weightMatch = data.match(/([\d.]+)t/);
      const visitsMatch = data.match(/(\d+)回/);

      if (weightMatch || visitsMatch) {
        console.log('📈 見つかった数値:');
        if (weightMatch) console.log(`  - 重量: ${weightMatch[1]}t`);
        if (visitsMatch) console.log(`  - 訪問: ${visitsMatch[1]}回`);
      } else {
        console.log('⚠️ 統計数値が見つかりませんでした');
      }
    });
  });
}