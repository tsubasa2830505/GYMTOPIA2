const puppeteer = require('puppeteer');

async function testAuth() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox'] 
  });
  const page = await browser.newPage();
  
  // コンソールログを収集
  const logs = [];
  page.on('console', msg => logs.push(msg.text()));
  
  try {
    console.log('認証状態テスト中...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    const result = await page.evaluate(() => {
      const header = document.querySelector('header').textContent;
      return {
        hasLoginButton: header.includes('ログイン'),
        hasUserName: header.includes('筋トレ') || header.includes('太郎'),
        headerText: header,
        hasLogoutIcon: document.querySelector('[data-icon="LogOut"]') !== null || 
                      document.querySelector('svg[viewBox*="log"]') !== null
      };
    });
    
    console.log('\n認証状態結果:');
    console.log('  ログインボタン:', result.hasLoginButton ? '❌ 表示されている' : '✅ 非表示');
    console.log('  ユーザー名:', result.hasUserName ? '✅ 表示されている' : '❌ 非表示');
    console.log('  ログアウトアイコン:', result.hasLogoutIcon ? '✅ 表示されている' : '❌ 非表示');
    console.log('  ヘッダー内容:', result.headerText);
    
    console.log('\nコンソールログ:');
    logs.forEach(log => console.log('  ', log));
    
  } catch (error) {
    console.error('エラー:', error);
  }
  
  await browser.close();
}

testAuth().catch(console.error);