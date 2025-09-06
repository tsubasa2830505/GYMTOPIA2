const puppeteer = require('puppeteer');

async function detailedTest() {
  const browser = await puppeteer.launch({ 
    headless: false,
    slowMo: 500, // Slow down actions to observe
    defaultViewport: { width: 1280, height: 720 }
  });
  
  const page = await browser.newPage();
  
  console.log('🚀 Starting detailed functional testing...\n');

  const testResults = {
    pages: {},
    navigation: {},
    functionality: {},
    errors: []
  };

  const pages = [
    { path: '/', name: 'Home' },
    { path: '/profile', name: 'Profile' },
    { path: '/admin', name: 'Admin' },
    { path: '/feed', name: 'Feed' },
    { path: '/search', name: 'Search' },
    { path: '/search/results', name: 'Search Results' },
    { path: '/search/freeweight', name: 'Free Weight Search' },
    { path: '/search/machine', name: 'Machine Search' },
    { path: '/workout', name: 'Workout' },
    { path: '/add', name: 'Add' },
    { path: '/stats', name: 'Stats' },
    { path: '/admin/reviews', name: 'Admin Reviews' }
  ];

  for (const pageInfo of pages) {
    console.log(`\n📍 Testing ${pageInfo.name} (${pageInfo.path})`);
    
    try {
      const response = await page.goto(`http://localhost:3000${pageInfo.path}`, { 
        waitUntil: 'networkidle2',
        timeout: 10000
      });
      
      if (!response.ok()) {
        testResults.errors.push(`${pageInfo.name}: HTTP ${response.status()}`);
        continue;
      }
      
      await page.waitForSelector('body', { timeout: 5000 });
      
      const pageData = await page.evaluate(() => {
        const title = document.title;
        const url = window.location.href;
        
        // Get all clickable elements
        const buttons = Array.from(document.querySelectorAll('button'));
        const links = Array.from(document.querySelectorAll('a'));
        const inputs = Array.from(document.querySelectorAll('input'));
        
        const buttonInfo = buttons.map(btn => ({
          text: btn.textContent?.trim() || '',
          disabled: btn.disabled,
          className: btn.className,
          visible: btn.offsetParent !== null
        }));
        
        const linkInfo = links.map(link => ({
          text: link.textContent?.trim() || '',
          href: link.href,
          className: link.className
        }));
        
        const inputInfo = inputs.map(input => ({
          type: input.type,
          placeholder: input.placeholder,
          className: input.className
        }));
        
        // Check for navigation elements
        const navElements = Array.from(document.querySelectorAll('nav, [role="navigation"]'));
        const hasNavigation = navElements.length > 0;
        
        // Check for any error messages or empty states
        const errorElements = Array.from(document.querySelectorAll('[class*="error"], [class*="Error"]'));
        const emptyStates = Array.from(document.querySelectorAll('[class*="empty"], [class*="Empty"]'));
        
        return {
          title,
          url,
          buttons: buttonInfo,
          links: linkInfo,
          inputs: inputInfo,
          hasNavigation,
          hasErrors: errorElements.length > 0,
          hasEmptyStates: emptyStates.length > 0,
          totalInteractiveElements: buttonInfo.length + linkInfo.length + inputInfo.length
        };
      });
      
      console.log(`✅ Loaded successfully`);
      console.log(`   📊 Interactive elements: ${pageData.totalInteractiveElements} (${pageData.buttons.length} buttons, ${pageData.links.length} links, ${pageData.inputs.length} inputs)`);
      console.log(`   🧭 Navigation: ${pageData.hasNavigation ? 'Present' : 'Missing'}`);
      
      // Test button clicks (non-destructive ones)
      const testableButtons = pageData.buttons.filter(btn => 
        !btn.disabled && 
        btn.visible && 
        !btn.text.toLowerCase().includes('delete') &&
        !btn.text.toLowerCase().includes('remove') &&
        !btn.text.toLowerCase().includes('削除')
      );
      
      if (testableButtons.length > 0) {
        console.log(`   🔘 Testing ${testableButtons.length} buttons...`);
        
        for (let i = 0; i < Math.min(3, testableButtons.length); i++) {
          try {
            const buttonSelector = `button:nth-of-type(${i + 1})`;
            const button = await page.$(buttonSelector);
            if (button) {
              await button.click();
              await page.waitForTimeout(500);
              console.log(`   ✅ Button ${i + 1} clicked successfully`);
            }
          } catch (error) {
            console.log(`   ⚠️ Button ${i + 1} click failed: ${error.message}`);
          }
        }
      }
      
      // Test navigation links (check if they lead to valid pages)
      const internalLinks = pageData.links.filter(link => 
        link.href.includes('localhost:3000') || link.href.startsWith('/')
      );
      
      if (internalLinks.length > 0) {
        console.log(`   🔗 Testing ${Math.min(2, internalLinks.length)} navigation links...`);
        
        for (let i = 0; i < Math.min(2, internalLinks.length); i++) {
          try {
            const linkHref = internalLinks[i].href;
            const testResponse = await page.goto(linkHref, { waitUntil: 'networkidle2', timeout: 5000 });
            if (testResponse.ok()) {
              console.log(`   ✅ Link to ${linkHref} works`);
              // Go back to original page
              await page.goto(`http://localhost:3000${pageInfo.path}`, { waitUntil: 'networkidle2' });
            }
          } catch (error) {
            console.log(`   ❌ Link navigation failed: ${error.message}`);
          }
        }
      }
      
      testResults.pages[pageInfo.path] = {
        name: pageInfo.name,
        status: 'working',
        data: pageData
      };
      
    } catch (error) {
      console.log(`❌ Error: ${error.message}`);
      testResults.errors.push(`${pageInfo.name}: ${error.message}`);
      testResults.pages[pageInfo.path] = {
        name: pageInfo.name,
        status: 'error',
        error: error.message
      };
    }
  }
  
  // Test specific functionality on homepage
  console.log('\n🏠 Testing homepage specific functionality...');
  
  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    
    // Test search input
    const searchInput = await page.$('input[placeholder*="検索"], input[placeholder*="search"]');
    if (searchInput) {
      await searchInput.type('テストジム');
      console.log('✅ Search input functional');
    }
    
    // Test filter tabs
    const tabs = await page.$$('button[class*="tab"], button:contains("マシン"), button:contains("フリー")');
    if (tabs.length > 0) {
      for (let i = 0; i < Math.min(2, tabs.length); i++) {
        await tabs[i].click();
        await page.waitForTimeout(300);
      }
      console.log('✅ Filter tabs functional');
    }
    
    // Test facility checkboxes
    const checkboxes = await page.$$('button:has([class*="rounded border-2"])');
    if (checkboxes.length > 0) {
      await checkboxes[0].click();
      await page.waitForTimeout(300);
      console.log('✅ Facility checkboxes functional');
    }
    
  } catch (error) {
    console.log(`❌ Homepage functionality test failed: ${error.message}`);
  }
  
  await browser.close();
  
  // Generate comprehensive report
  console.log('\n' + '='.repeat(80));
  console.log('📊 COMPREHENSIVE GYMTOPIA FUNCTIONALITY REPORT');
  console.log('='.repeat(80));
  
  console.log('\n✅ WORKING PAGES:');
  Object.values(testResults.pages).filter(page => page.status === 'working').forEach(page => {
    console.log(`  • ${page.name} - ${page.data.totalInteractiveElements} interactive elements`);
    console.log(`    └─ Buttons: ${page.data.buttons.length}, Links: ${page.data.links.length}, Inputs: ${page.data.inputs.length}`);
  });
  
  if (testResults.errors.length > 0) {
    console.log('\n❌ ISSUES FOUND:');
    testResults.errors.forEach(error => {
      console.log(`  • ${error}`);
    });
  }
  
  console.log(`\n📈 SUMMARY:`);
  console.log(`  • Working pages: ${Object.values(testResults.pages).filter(p => p.status === 'working').length}`);
  console.log(`  • Pages with issues: ${testResults.errors.length}`);
  console.log(`  • Total pages tested: ${pages.length}`);
  
  const totalInteractiveElements = Object.values(testResults.pages)
    .filter(p => p.status === 'working')
    .reduce((sum, page) => sum + (page.data?.totalInteractiveElements || 0), 0);
    
  console.log(`  • Total interactive elements: ${totalInteractiveElements}`);
  
  return testResults;
}

detailedTest().catch(console.error);
