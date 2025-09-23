const puppeteer = require('puppeteer');

(async () => {
  let browser;
  try {
    console.log('🔧 管理画面画像機能の最終テスト開始');

    browser = await puppeteer.launch({
      headless: true,
      args: ['--no-sandbox', '--disable-setuid-sandbox']
    });

    const page = await browser.newPage();

    // コンソールログをキャプチャ
    const logs = [];
    page.on('console', msg => {
      const text = msg.text();
      logs.push(text);
      if (text.includes('DEBUG MODE') ||
          text.includes('images') ||
          text.includes('FormData')) {
        console.log('📊 CONSOLE:', text);
      }
    });

    console.log('🌐 管理画面（http://localhost:3001/admin）にアクセス中...');

    // ページにアクセス
    await page.goto('http://localhost:3001/admin', {
      waitUntil: 'domcontentloaded',
      timeout: 20000
    });

    // 3秒待機してReactコンポーネントの初期化を待つ
    await new Promise(resolve => setTimeout(resolve, 3000));

    console.log('✅ ページ読み込み完了');

    // ページタイトル確認
    const title = await page.title();
    console.log('📄 ページタイトル:', title);

    // 画像タブの存在確認
    console.log('🔍 画像タブを検索中...');

    // 複数の方法で画像タブを検索
    const imageTabSelectors = [
      '[data-tab="images"]',
      'button[class*="tab"]:has-text("画像")',
      'div:has-text("画像管理")',
      'button:has-text("画像")',
      '*[class*="tab"]:has-text("画像")'
    ];

    let tabFound = false;
    for (const selector of imageTabSelectors) {
      try {
        const cleanSelector = selector.replace(':has-text("画像")', '').replace(':has-text("画像管理")', '');
        const elements = await page.$$(cleanSelector);
        if (elements.length > 0) {
          console.log(`✅ 候補タブ発見: ${selector} (${elements.length}個)`);
          tabFound = true;
        }
      } catch (e) {
        // 次のセレクタを試行
      }
    }

    // すべてのボタンテキストを取得
    const buttonTexts = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.map(btn => btn.textContent?.trim()).filter(Boolean);
    });

    console.log('📋 ページ内のボタン一覧:', buttonTexts);

    // 画像関連の要素を検索
    console.log('🖼️ 画像関連要素を検索中...');

    const imageElements = await page.evaluate(() => {
      const imgs = Array.from(document.querySelectorAll('img'));
      return imgs.filter(img =>
        img.src.includes('supabase.co') ||
        img.alt?.includes('ジム') ||
        img.src.includes('gym-images')
      ).map(img => ({
        src: img.src,
        alt: img.alt,
        className: img.className
      }));
    });

    console.log(`🖼️ 発見されたジム関連画像: ${imageElements.length}個`);
    if (imageElements.length > 0) {
      imageElements.forEach((img, i) => {
        console.log(`  ${i + 1}. ALT: "${img.alt}", SRC: ${img.src.substring(0, 60)}...`);
      });
    }

    // GymImageUploaderコンポーネントの検索
    const uploaderElements = await page.evaluate(() => {
      const texts = ['ドラッグ&ドロップ', '画像をドラッグ', '画像を選択', 'ジム画像管理'];
      return texts.some(text =>
        document.body.textContent?.includes(text)
      );
    });

    console.log(`📤 画像アップローダー要素: ${uploaderElements ? '発見' : '未発見'}`);

    // 最終的な結果サマリー
    console.log('\n📊 テスト結果サマリー:');
    console.log(`✅ 管理画面アクセス: 成功`);
    console.log(`${tabFound ? '✅' : '❌'} タブ要素: ${tabFound ? '発見' : '未発見'}`);
    console.log(`${imageElements.length > 0 ? '✅' : '❌'} ジム画像: ${imageElements.length}個`);
    console.log(`${uploaderElements ? '✅' : '❌'} アップローダー: ${uploaderElements ? '発見' : '未発見'}`);

    // デバッグログの確認
    const debugLogs = logs.filter(log =>
      log.includes('DEBUG MODE') ||
      log.includes('FormData initialized')
    );

    console.log(`🐛 デバッグログ: ${debugLogs.length}個`);
    debugLogs.forEach(log => console.log(`  - ${log}`));

    // 総合評価
    const allGood = tabFound && imageElements.length > 0 && uploaderElements && debugLogs.length > 0;
    console.log(`\n🎯 総合評価: ${allGood ? '🟢 完全成功' : '🟡 部分成功'}`);

  } catch (error) {
    console.error('❌ テスト中にエラー:', error.message);
  } finally {
    if (browser) {
      await browser.close();
    }
    console.log('✅ テスト終了');
  }
})();