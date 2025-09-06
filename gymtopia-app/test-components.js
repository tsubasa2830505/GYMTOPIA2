console.log('🧩 コンポーネント機能テスト開始...\n');

const puppeteer = require('puppeteer');

// コンポーネント機能テスト
async function testComponentFunctionality() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  console.log('🔧 インタラクティブ機能テスト:');
  
  const componentTests = [];
  
  try {
    // 1. ホームページの検索機能テスト
    console.log('\n🏠 ホームページ検索機能:');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    
    // 検索ボタンのテスト
    const searchButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, a'));
      return buttons.map(btn => ({
        text: btn.textContent?.trim() || '',
        href: btn.href || '',
        clickable: !btn.disabled
      })).filter(btn => 
        btn.text.includes('検索') || 
        btn.text.includes('フリーウェイト') || 
        btn.text.includes('マシン') ||
        btn.href.includes('/search')
      );
    });
    
    console.log(`   ✅ 検索関連ボタン: ${searchButtons.length}個発見`);
    searchButtons.forEach(btn => {
      console.log(`     • ${btn.text} ${btn.clickable ? '(クリック可)' : '(無効)'}`);
    });
    
    // 検索ボタンクリックテスト
    if (searchButtons.length > 0) {
      try {
        await page.click('a[href*="/search"]');
        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log('   ✅ 検索ページへの遷移成功');
        componentTests.push({ name: 'search_navigation', success: true });
      } catch (err) {
        console.log(`   ❌ 検索ページ遷移エラー: ${err.message}`);
        componentTests.push({ name: 'search_navigation', success: false, error: err.message });
      }
    }
    
    // 2. 検索ページの機能テスト
    console.log('\n🔍 検索ページ機能:');
    await page.goto('http://localhost:3000/search', { waitUntil: 'networkidle2' });
    
    // 都道府県選択テスト
    const prefectureDropdown = await page.evaluate(() => {
      const selects = Array.from(document.querySelectorAll('select'));
      return selects.map(select => ({
        id: select.id,
        options: select.options.length,
        value: select.value
      }));
    });
    
    console.log(`   ✅ セレクトボックス: ${prefectureDropdown.length}個`);
    prefectureDropdown.forEach(dropdown => {
      console.log(`     • ${dropdown.id}: ${dropdown.options}選択肢`);
    });
    
    // 検索結果ページテスト
    if (prefectureDropdown.length > 0) {
      try {
        // 都道府県を選択
        await page.select('select', '東京都');
        await page.waitForTimeout(1000);
        
        // 検索実行
        const searchButton = await page.$('button[type="submit"], button:contains("検索")');
        if (searchButton) {
          await searchButton.click();
          await page.waitForTimeout(2000);
          
          console.log('   ✅ 検索実行成功');
          componentTests.push({ name: 'search_execution', success: true });
        }
      } catch (err) {
        console.log(`   ❌ 検索実行エラー: ${err.message}`);
        componentTests.push({ name: 'search_execution', success: false, error: err.message });
      }
    }
    
    // 3. フリーウェイト選択テスト
    console.log('\n🏋️ フリーウェイト選択機能:');
    await page.goto('http://localhost:3000/search/freeweight', { waitUntil: 'networkidle2' });
    
    const muscleButtons = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      return buttons.map(btn => ({
        text: btn.textContent?.trim() || '',
        clickable: !btn.disabled,
        className: btn.className
      })).filter(btn => 
        btn.text.includes('胸') || 
        btn.text.includes('背') || 
        btn.text.includes('脚') ||
        btn.className.includes('muscle') ||
        btn.className.includes('target')
      );
    });
    
    console.log(`   ✅ 筋肉選択ボタン: ${muscleButtons.length}個`);
    
    // 筋肉選択テスト
    if (muscleButtons.length > 0) {
      try {
        // 最初の筋肉ボタンをクリック
        const firstMuscleButton = muscleButtons[0];
        await page.evaluate((btnText) => {
          const buttons = Array.from(document.querySelectorAll('button'));
          const targetBtn = buttons.find(btn => btn.textContent?.trim() === btnText);
          if (targetBtn) targetBtn.click();
        }, firstMuscleButton.text);
        
        await page.waitForTimeout(1000);
        
        console.log(`   ✅ 筋肉選択 (${firstMuscleButton.text}) 成功`);
        componentTests.push({ name: 'muscle_selection', success: true });
        
        // 詳細選択が表示されるかテスト
        const detailButtons = await page.evaluate(() => {
          return Array.from(document.querySelectorAll('button')).length;
        });
        
        console.log(`   ✅ 詳細選択表示: ${detailButtons}個のボタン`);
        
      } catch (err) {
        console.log(`   ❌ 筋肉選択エラー: ${err.message}`);
        componentTests.push({ name: 'muscle_selection', success: false, error: err.message });
      }
    }
    
    // 4. マシン検索テスト
    console.log('\n⚙️ マシン検索機能:');
    await page.goto('http://localhost:3000/search/machine', { waitUntil: 'networkidle2' });
    
    const machineSearchElements = await page.evaluate(() => {
      const inputs = Array.from(document.querySelectorAll('input[type="text"], input[type="search"]'));
      const buttons = Array.from(document.querySelectorAll('button'));
      
      return {
        inputs: inputs.length,
        searchButtons: buttons.filter(btn => 
          btn.textContent?.includes('検索') || 
          btn.textContent?.includes('探す')
        ).length
      };
    });
    
    console.log(`   ✅ 検索入力: ${machineSearchElements.inputs}個`);
    console.log(`   ✅ 検索ボタン: ${machineSearchElements.searchButtons}個`);
    
    // 検索入力テスト
    if (machineSearchElements.inputs > 0) {
      try {
        await page.type('input[type="text"], input[type="search"]', 'ベンチプレス');
        await page.waitForTimeout(500);
        
        console.log('   ✅ 検索テキスト入力成功');
        componentTests.push({ name: 'machine_search_input', success: true });
      } catch (err) {
        console.log(`   ❌ 検索入力エラー: ${err.message}`);
        componentTests.push({ name: 'machine_search_input', success: false, error: err.message });
      }
    }
    
    // 5. ナビゲーション機能テスト
    console.log('\n🧭 ナビゲーション機能:');
    
    const navTests = [
      { url: 'http://localhost:3000/', name: 'ホーム' },
      { url: 'http://localhost:3000/feed', name: 'フィード' },
      { url: 'http://localhost:3000/profile', name: 'プロフィール' },
      { url: 'http://localhost:3000/search/results', name: '検索結果' }
    ];
    
    for (const navTest of navTests) {
      try {
        await page.goto(navTest.url, { waitUntil: 'networkidle2', timeout: 5000 });
        
        // ボトムナビゲーション要素チェック
        const navElements = await page.evaluate(() => {
          const navLinks = Array.from(document.querySelectorAll('nav a, [role="navigation"] a'));
          return navLinks.map(link => ({
            href: link.href,
            text: link.textContent?.trim() || '',
            active: link.classList.contains('active') || link.classList.contains('current')
          }));
        });
        
        console.log(`   ✅ ${navTest.name}: ${navElements.length}個のナビリンク`);
        componentTests.push({ name: `navigation_${navTest.name.toLowerCase()}`, success: true, navLinks: navElements.length });
        
      } catch (err) {
        console.log(`   ❌ ${navTest.name}ナビゲーションエラー: ${err.message}`);
        componentTests.push({ name: `navigation_${navTest.name.toLowerCase()}`, success: false, error: err.message });
      }
    }
    
    // 6. フォーム機能テスト
    console.log('\n📝 フォーム機能テスト:');
    await page.goto('http://localhost:3000/add', { waitUntil: 'networkidle2' });
    
    const formElements = await page.evaluate(() => {
      const forms = Array.from(document.querySelectorAll('form'));
      const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
      const buttons = Array.from(document.querySelectorAll('button[type="submit"]'));
      
      return {
        forms: forms.length,
        inputs: inputs.map(input => ({
          type: input.type || input.tagName.toLowerCase(),
          name: input.name || input.id,
          required: input.required
        })),
        submitButtons: buttons.length
      };
    });
    
    console.log(`   ✅ フォーム: ${formElements.forms}個`);
    console.log(`   ✅ 入力要素: ${formElements.inputs.length}個`);
    console.log(`   ✅ 送信ボタン: ${formElements.submitButtons}個`);
    
    formElements.inputs.forEach(input => {
      console.log(`     • ${input.type} (${input.name}) ${input.required ? '必須' : '任意'}`);
    });
    
    componentTests.push({ 
      name: 'form_elements', 
      success: formElements.forms > 0 && formElements.inputs.length > 0,
      forms: formElements.forms,
      inputs: formElements.inputs.length
    });
    
  } catch (error) {
    console.log(`❌ コンポーネントテストエラー: ${error.message}`);
    componentTests.push({ name: 'general_error', success: false, error: error.message });
  }
  
  await browser.close();
  return componentTests;
}

// レスポンシブデザインテスト
async function testResponsiveDesign() {
  console.log('\n📱 レスポンシブデザインテスト:');
  
  const browser = await puppeteer.launch({ 
    headless: true,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  const viewports = [
    { name: 'Mobile', width: 375, height: 667 },
    { name: 'Tablet', width: 768, height: 1024 },
    { name: 'Desktop', width: 1920, height: 1080 }
  ];
  
  const responsiveResults = [];
  
  for (const viewport of viewports) {
    try {
      await page.setViewport({ width: viewport.width, height: viewport.height });
      await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
      
      const layoutInfo = await page.evaluate(() => {
        const body = document.body;
        const nav = document.querySelector('nav');
        const main = document.querySelector('main');
        
        return {
          bodyWidth: body.offsetWidth,
          hasHorizontalScroll: body.scrollWidth > body.offsetWidth,
          navVisible: nav ? window.getComputedStyle(nav).display !== 'none' : false,
          mainWidth: main ? main.offsetWidth : 0,
          elements: Array.from(document.querySelectorAll('*')).filter(el => 
            el.offsetWidth > document.body.offsetWidth
          ).length
        };
      });
      
      const isResponsive = !layoutInfo.hasHorizontalScroll && layoutInfo.elements === 0;
      
      console.log(`   ${isResponsive ? '✅' : '❌'} ${viewport.name} (${viewport.width}x${viewport.height})`);
      console.log(`     画面幅: ${layoutInfo.bodyWidth}px`);
      console.log(`     横スクロール: ${layoutInfo.hasHorizontalScroll ? '有り' : '無し'}`);
      console.log(`     はみ出し要素: ${layoutInfo.elements}個`);
      
      responsiveResults.push({
        viewport: viewport.name,
        width: viewport.width,
        responsive: isResponsive,
        issues: layoutInfo.elements
      });
      
    } catch (err) {
      console.log(`   ❌ ${viewport.name}テストエラー: ${err.message}`);
      responsiveResults.push({
        viewport: viewport.name,
        responsive: false,
        error: err.message
      });
    }
  }
  
  await browser.close();
  return responsiveResults;
}

// メイン実行
async function runComponentTests() {
  const functionalityResults = await testComponentFunctionality();
  const responsiveResults = await testResponsiveDesign();
  
  console.log('\n' + '='.repeat(60));
  console.log('🧩 コンポーネント機能テスト結果');
  console.log('='.repeat(60));
  
  // 機能テスト結果
  const successfulTests = functionalityResults.filter(test => test.success);
  const failedTests = functionalityResults.filter(test => !test.success);
  
  console.log(`\n⚡ 機能テスト: ${successfulTests.length}/${functionalityResults.length}個成功`);
  
  if (failedTests.length > 0) {
    console.log('\n❌ 失敗した機能:');
    failedTests.forEach(test => {
      console.log(`   • ${test.name}: ${test.error || '詳細不明'}`);
    });
  }
  
  // カテゴリ別分析
  const categories = {
    navigation: functionalityResults.filter(t => t.name.includes('navigation')),
    search: functionalityResults.filter(t => t.name.includes('search')),
    interaction: functionalityResults.filter(t => t.name.includes('selection') || t.name.includes('input')),
    form: functionalityResults.filter(t => t.name.includes('form'))
  };
  
  console.log('\n📊 カテゴリ別成功率:');
  Object.entries(categories).forEach(([category, tests]) => {
    if (tests.length > 0) {
      const successRate = tests.filter(t => t.success).length / tests.length;
      console.log(`   • ${category}: ${Math.round(successRate * 100)}% (${tests.filter(t => t.success).length}/${tests.length})`);
    }
  });
  
  // レスポンシブテスト結果
  const responsiveSuccess = responsiveResults.filter(r => r.responsive).length;
  console.log(`\n📱 レスポンシブデザイン: ${responsiveSuccess}/${responsiveResults.length}個対応`);
  
  // 総合評価
  const functionalScore = successfulTests.length / functionalityResults.length;
  const responsiveScore = responsiveSuccess / responsiveResults.length;
  const overallScore = (functionalScore + responsiveScore) / 2;
  
  console.log(`\n🎯 コンポーネント総合評価: ${Math.round(overallScore * 100)}%`);
  console.log(`   機能性: ${Math.round(functionalScore * 100)}%`);
  console.log(`   レスポンシブ: ${Math.round(responsiveScore * 100)}%`);
  console.log(`   ${overallScore >= 0.8 ? '✅ 優秀' : overallScore >= 0.6 ? '⚠️ 良好' : '❌ 要改善'}`);
  
  return {
    functionality: functionalityResults,
    responsive: responsiveResults,
    score: overallScore
  };
}

runComponentTests().catch(console.error);