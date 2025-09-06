const puppeteer = require('puppeteer');

async function checkProfilePage() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  console.log('プロフィールページのモックデータチェック中...');
  
  try {
    await page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle2' });
    
    // ページが完全にロードされるまで待機
    await new Promise(resolve => setTimeout(resolve, 3000));
    
    // ページ内容をチェック
    const content = await page.evaluate(() => {
      const titleElement = document.querySelector('h1');
      const bioElement = document.querySelector('p');
      const statsElements = document.querySelectorAll('span');
      
      return {
        title: titleElement ? titleElement.textContent : 'Not found',
        bio: bioElement ? bioElement.textContent : 'Not found',
        hasProfileData: document.body.textContent.includes('筋トレマニア太郎'),
        hasStats: document.body.textContent.includes('245'),
        statsCount: statsElements.length,
        fullText: document.body.textContent.substring(0, 500)
      };
    });
    
    console.log('ページ内容:', content);
    
    // コンソールログも確認
    const logs = [];
    page.on('console', msg => logs.push(msg.text()));
    
    // 少し待ってからコンソールログをチェック
    await new Promise(resolve => setTimeout(resolve, 2000));
    console.log('\nコンソールログ:');
    logs.forEach(log => console.log('  ', log));
    
  } catch (error) {
    console.error('エラー:', error);
  }
  
  await browser.close();
}

checkProfilePage().catch(console.error);