const puppeteer = require('puppeteer');

async function testGymStatsPage() {
  console.log('🧪 gym-statsページのテストを開始します...\n');

  const browser = await puppeteer.launch({
    headless: false,
    defaultViewport: null,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });

  try {
    const page = await browser.newPage();

    // コンソールメッセージをキャプチャ
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error('❌ ブラウザエラー:', msg.text());
      }
    });

    // 1. ページの読み込みテスト
    console.log('1️⃣ ページ読み込みテスト...');
    const response = await page.goto('http://localhost:3001/gym-stats', {
      waitUntil: 'networkidle0',
      timeout: 30000
    });

    if (response.status() === 200) {
      console.log('✅ ページが正常に読み込まれました\n');
    } else {
      console.log(`❌ ページ読み込みエラー: ステータス ${response.status()}\n`);
    }

    // ローディング完了を待つ
    await page.waitForSelector('.min-h-screen:not(:has(.animate-spin))', { timeout: 10000 });

    // 2. 主要な統計要素の存在確認
    console.log('2️⃣ 統計要素の存在確認...');
    const elements = {
      '総訪問回数': '[class*="総訪問回数"]',
      '連続記録': '[class*="連続記録"]',
      '総重量': '[class*="総重量"]',
      '総時間': '[class*="総時間"]'
    };

    for (const [name, selector] of Object.entries(elements)) {
      try {
        const element = await page.$(`div:has-text("${name.slice(0, 4)}")`);
        if (element) {
          console.log(`✅ ${name}が表示されています`);
        } else {
          console.log(`⚠️ ${name}が見つかりません`);
        }
      } catch (e) {
        console.log(`⚠️ ${name}の確認中にエラー`);
      }
    }

    // 3. 期間切り替えボタンのテスト
    console.log('\n3️⃣ 期間切り替えテスト...');
    const periods = ['週', '月', '年'];

    for (const period of periods) {
      const button = await page.$(`button:has-text("${period}")`);
      if (button) {
        await button.click();
        await page.waitForTimeout(1000);
        console.log(`✅ ${period}間表示に切り替えました`);
      } else {
        console.log(`❌ ${period}ボタンが見つかりません`);
      }
    }

    // 4. データの取得確認
    console.log('\n4️⃣ 統計データの取得確認...');

    // 総訪問回数を取得
    const totalVisitsText = await page.evaluate(() => {
      const element = Array.from(document.querySelectorAll('div')).find(el =>
        el.textContent?.includes('総訪問回数')
      );
      return element?.parentElement?.querySelector('.text-2xl')?.textContent;
    });

    if (totalVisitsText) {
      console.log(`✅ 総訪問回数: ${totalVisitsText}`);
    }

    // 現在の連続記録を取得
    const streakText = await page.evaluate(() => {
      const element = Array.from(document.querySelectorAll('div')).find(el =>
        el.textContent?.includes('現在の連続記録')
      );
      return element?.parentElement?.querySelector('.text-2xl')?.textContent;
    });

    if (streakText) {
      console.log(`✅ 現在の連続記録: ${streakText}`);
    }

    // 5. ジムランキングの確認
    console.log('\n5️⃣ ジムランキングの確認...');
    const gymRankings = await page.evaluate(() => {
      const rankingSection = Array.from(document.querySelectorAll('h3')).find(h =>
        h.textContent?.includes('よく行くジム')
      )?.parentElement;

      if (!rankingSection) return [];

      return Array.from(rankingSection.querySelectorAll('.font-medium.text-slate-900'))
        .slice(0, 5)
        .map(el => el.textContent);
    });

    if (gymRankings.length > 0) {
      console.log('✅ ジムランキング:');
      gymRankings.forEach((gym, i) => {
        console.log(`   ${i + 1}. ${gym}`);
      });
    } else {
      console.log('❌ ジムランキングが表示されていません');
    }

    // 6. レスポンシブデザインのテスト
    console.log('\n6️⃣ レスポンシブデザインテスト...');
    const viewports = [
      { name: 'モバイル', width: 375, height: 667 },
      { name: 'タブレット', width: 768, height: 1024 },
      { name: 'デスクトップ', width: 1920, height: 1080 }
    ];

    for (const viewport of viewports) {
      await page.setViewport({ width: viewport.width, height: viewport.height });
      await page.waitForTimeout(500);

      const isVisible = await page.evaluate(() => {
        const header = document.querySelector('header');
        return header && header.offsetHeight > 0;
      });

      if (isVisible) {
        console.log(`✅ ${viewport.name}表示: 正常`);
      } else {
        console.log(`❌ ${viewport.name}表示: 問題あり`);
      }
    }

    console.log('\n✨ すべてのテストが完了しました！');

  } catch (error) {
    console.error('❌ テスト中にエラーが発生しました:', error.message);
  } finally {
    await browser.close();
  }
}

// Puppeteerがインストールされているか確認
try {
  require.resolve('puppeteer');
  testGymStatsPage();
} catch (e) {
  console.log('📦 Puppeteerをインストールしています...');
  const { execSync } = require('child_process');
  execSync('npm install puppeteer', { stdio: 'inherit', cwd: __dirname + '/..' });
  console.log('✅ インストール完了。テストを実行します...\n');
  testGymStatsPage();
}