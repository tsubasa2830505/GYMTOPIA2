const puppeteer = require('puppeteer');

async function testLogout() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox'] 
  });
  const page = await browser.newPage();
  
  const logs = [];
  page.on('console', msg => logs.push(msg.text()));
  
  try {
    console.log('ログアウト機能テスト中...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    await new Promise(resolve => setTimeout(resolve, 2000));
    
    // ログアウトボタンを探す
    const logoutButton = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button, [role="button"]'));
      const header = document.querySelector('header');
      
      return {
        headerText: header ? header.textContent : 'not found',
        totalButtons: buttons.length,
        buttons: buttons.map(btn => ({
          text: btn.textContent?.trim() || '',
          className: btn.className || '',
          hasLogoutIcon: btn.innerHTML.includes('LogOut') || btn.innerHTML.includes('log-out'),
          outerHTML: btn.outerHTML.substring(0, 200)
        })),
        hasUserName: header ? header.textContent.includes('筋トレマニア太郎') : false
      };
    });
    
    console.log('\n現在の状態:');
    console.log('  ユーザー名表示:', logoutButton.hasUserName ? '✅' : '❌');
    console.log('  ヘッダー内容:', logoutButton.headerText);
    console.log('  総ボタン数:', logoutButton.totalButtons);
    
    console.log('\nボタン詳細:');
    logoutButton.buttons.forEach((btn, i) => {
      if (btn.text || btn.hasLogoutIcon) {
        console.log(`  ${i}: "${btn.text}" - LogOutIcon: ${btn.hasLogoutIcon}`);
        if (btn.hasLogoutIcon) {
          console.log(`      HTML: ${btn.outerHTML}`);
        }
      }
    });
    
    // ログアウトボタンをクリックしてみる
    const logoutButtonFound = await page.evaluate(() => {
      const buttons = Array.from(document.querySelectorAll('button'));
      const logoutBtn = buttons.find(btn => 
        btn.innerHTML.includes('LogOut') || 
        btn.innerHTML.includes('log-out') ||
        btn.getAttribute('aria-label')?.includes('logout') ||
        btn.title?.includes('logout')
      );
      if (logoutBtn) {
        logoutBtn.click();
        return true;
      }
      return false;
    });
    
    console.log('\nログアウトボタンクリック:', logoutButtonFound ? '✅ 実行' : '❌ ボタンが見つからない');
    
    if (logoutButtonFound) {
      await new Promise(resolve => setTimeout(resolve, 2000));
      console.log('クリック後のページURL:', page.url());
    }
    
    console.log('\nコンソールログ:');
    logs.forEach(log => console.log('  ', log));
    
  } catch (error) {
    console.error('エラー:', error);
  }
  
  await browser.close();
}

testLogout().catch(console.error);