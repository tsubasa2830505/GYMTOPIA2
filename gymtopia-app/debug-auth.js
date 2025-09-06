const puppeteer = require('puppeteer');

async function debugAuthState() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  console.log('認証状態デバッグ中...');
  
  const logs = [];
  page.on('console', msg => {
    const text = msg.text();
    if (text.includes('auth') || text.includes('user') || text.includes('session') || text.includes('Auth')) {
      logs.push(text);
    }
  });
  
  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    
    // 認証状態を確認
    const authInfo = await page.evaluate(() => {
      return {
        hasLoginButton: document.body.textContent.includes('ログイン'),
        hasUserInfo: document.body.textContent.includes('@'),
        hasLogoutButton: document.querySelector('[data-testid="logout"], button[title*="logout"], button[aria-label*="logout"]') !== null,
        localStorage: {
          supabase: localStorage.getItem('sb-gymtopia-auth-token') || localStorage.getItem('supabase.auth.token') || 'not found'
        },
        headers: document.querySelector('header').textContent
      };
    });
    
    console.log('\n認証UI状態:');
    console.log('  ログインボタン表示:', authInfo.hasLoginButton);
    console.log('  ユーザー情報表示:', authInfo.hasUserInfo);  
    console.log('  ログアウトボタン表示:', authInfo.hasLogoutButton);
    console.log('  ヘッダー内容:', authInfo.headers);
    console.log('  LocalStorage:', authInfo.localStorage);
    
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    console.log('\nコンソールログ (認証関連):');
    logs.forEach(log => console.log('  ', log));
    
  } catch (error) {
    console.error('エラー:', error);
  }
  
  await browser.close();
}

debugAuthState().catch(console.error);