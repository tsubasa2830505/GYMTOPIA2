const puppeteer = require('puppeteer');

const pages = [
  '/', // Home page
  '/profile',
  '/admin',
  '/feed',
  '/search',
  '/search/results',
  '/search/freeweight',
  '/search/machine',
  '/workout',
  '/add',
  '/stats',
  '/admin/reviews'
];

async function testPages() {
  const browser = await puppeteer.launch({ 
    headless: false,
    args: ['--no-sandbox', '--disable-setuid-sandbox']
  });
  const page = await browser.newPage();
  
  console.log('🚀 Starting comprehensive GYMTOPIA testing...\n');
  
  const results = {
    working: [],
    errors: [],
    navigationIssues: [],
    functionalityIssues: []
  };

  for (const route of pages) {
  console.log(`\n📍 Testing: http://localhost:3000${route}`);
    
    try {
      // Navigate to page
      const response = await page.goto(`http://localhost:3000${route}`, { 
        waitUntil: 'networkidle2',
        timeout: 10000
      });
      
      if (!response.ok()) {
        results.errors.push(`${route}: HTTP ${response.status()}`);
        console.log(`❌ HTTP Error: ${response.status()}`);
        continue;
      }
      
      // Wait for page to load
      await page.waitForSelector('body', { timeout: 5000 });
      
      // Check for React errors
      const hasReactErrors = await page.evaluate(() => {
        const errors = document.querySelectorAll('[data-nextjs-dialog-overlay]');
        return errors.length > 0;
      });
      
      if (hasReactErrors) {
        results.errors.push(`${route}: React error overlay detected`);
        console.log(`❌ React errors detected`);
        continue;
      }
      
      // Get page title and basic info
      const title = await page.title();
      const url = page.url();
      
      console.log(`✅ Loaded successfully - Title: ${title}`);
      
      // Test clickable elements
      const clickableElements = await page.evaluate(() => {
        const buttons = Array.from(document.querySelectorAll('button, a, [role="button"]'));
        return buttons.map(el => ({
          tag: el.tagName,
          text: el.textContent?.trim() || '',
          href: el.href || '',
          disabled: el.disabled,
          className: el.className
        }));
      });
      
      console.log(`🔍 Found ${clickableElements.length} clickable elements`);
      
      // Test navigation links
      const navLinks = await page.evaluate(() => {
        const links = Array.from(document.querySelectorAll('nav a, [role="navigation"] a'));
        return links.map(link => ({
          text: link.textContent?.trim() || '',
          href: link.href,
          pathname: new URL(link.href || '', window.location.origin).pathname
        }));
      });
      
      if (navLinks.length > 0) {
        console.log(`🧭 Navigation links found: ${navLinks.map(l => l.pathname).join(', ')}`);
      }
      
      results.working.push({
        route,
        title,
        clickableCount: clickableElements.length,
        navLinks: navLinks.length
      });
      
    } catch (error) {
      results.errors.push(`${route}: ${error.message}`);
      console.log(`❌ Error: ${error.message}`);
    }
  }
  
  // Test dynamic routes (gym pages)
  console.log('\n📍 Testing dynamic gym page...');
  try {
    // First check if there are any gym IDs available
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    
    const gymLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('a[href*="/gyms/"]'));
      return links.map(link => link.href);
    });
    
    if (gymLinks.length > 0) {
      const testGymUrl = gymLinks[0];
      console.log(`🏋️ Testing gym page: ${testGymUrl}`);
      
      const response = await page.goto(testGymUrl, { waitUntil: 'networkidle2' });
      if (response.ok()) {
        const title = await page.title();
        console.log(`✅ Gym page loaded - Title: ${title}`);
        results.working.push({
          route: new URL(testGymUrl).pathname,
          title,
          type: 'dynamic'
        });
      }
    } else {
      console.log(`⚠️ No gym links found on homepage`);
    }
  } catch (error) {
    console.log(`❌ Error testing gym page: ${error.message}`);
  }
  
  await browser.close();
  
  // Generate report
  console.log('\n' + '='.repeat(60));
  console.log('📊 GYMTOPIA TESTING REPORT');
  console.log('='.repeat(60));
  
  console.log('\n✅ WORKING PAGES:');
  results.working.forEach(page => {
    console.log(`  • ${page.route} - ${page.title} (${page.clickableCount || 0} clickable elements)`);
  });
  
  if (results.errors.length > 0) {
    console.log('\n❌ PAGES WITH ERRORS:');
    results.errors.forEach(error => {
      console.log(`  • ${error}`);
    });
  }
  
  console.log(`\n📈 SUMMARY:`);
  console.log(`  • Working pages: ${results.working.length}`);
  console.log(`  • Pages with errors: ${results.errors.length}`);
  console.log(`  • Total tested: ${pages.length + 1}`);
  
  return results;
}

testPages().catch(console.error);
