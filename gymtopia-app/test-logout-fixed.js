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
    
    // 初期状態をチェック
    const initialState = await page.evaluate(() => {
      const header = document.querySelector('header').textContent;
      return {
        hasLoginButton: header.includes('ログイン'),
        hasUserName: header.includes('筋トレ') || header.includes('太郎'),
        headerText: header,
        hasLogoutIcon: document.querySelector('button svg') !== null
      };
    });
    
    console.log('\n🔍 初期状態:');
    console.log('  ログインボタン:', initialState.hasLoginButton ? '❌ 表示されている' : '✅ 非表示');
    console.log('  ユーザー名:', initialState.hasUserName ? '✅ 表示されている' : '❌ 非表示');
    console.log('  ログアウトボタン:', initialState.hasLogoutIcon ? '✅ 表示されている' : '❌ 非表示');
    console.log('  ヘッダー内容:', initialState.headerText);
    
    if (initialState.hasUserName && initialState.hasLogoutIcon) {
      console.log('\n🔽 ログアウトボタンをクリック...');
      
      // ログアウトボタンをクリック
      const logoutClicked = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button'));
        const logoutBtn = buttons.find(btn => 
          btn.innerHTML.includes('LogOut') || 
          btn.innerHTML.includes('log-out')
        );
        if (logoutBtn) {
          logoutBtn.click();
          return true;
        }
        return false;
      });
      
      console.log('  ログアウトボタンクリック:', logoutClicked ? '✅ 成功' : '❌ 失敗');
      
      if (logoutClicked) {
        // 少し待ってから状態をチェック
        await new Promise(resolve => setTimeout(resolve, 2000));
        
        const afterLogout = await page.evaluate(() => {
          const header = document.querySelector('header').textContent;
          return {
            hasLoginButton: header.includes('ログイン'),
            hasUserName: header.includes('筋トレ') || header.includes('太郎'),
            headerText: header
          };
        });
        
        console.log('\n📊 ログアウト後の状態:');
        console.log('  ログインボタン:', afterLogout.hasLoginButton ? '✅ 表示されている' : '❌ 非表示');
        console.log('  ユーザー名:', afterLogout.hasUserName ? '❌ まだ表示されている' : '✅ 非表示');
        console.log('  ヘッダー内容:', afterLogout.headerText);
        
        // 結果判定
        if (afterLogout.hasLoginButton && !afterLogout.hasUserName) {
          console.log('\n🎉 ログアウト機能: 正常に動作');
        } else {
          console.log('\n⚠️  ログアウト機能: まだ問題がある');
        }
      }
    } else {
      console.log('\n⚠️  ユーザーがログインしていないか、ログアウトボタンが見つかりません');
    }
    
    console.log('\n📝 コンソールログ:');
    logs.forEach(log => console.log('  ', log));
    
  } catch (error) {
    console.error('エラー:', error);
  }
  
  await browser.close();
}

testLogout().catch(console.error);