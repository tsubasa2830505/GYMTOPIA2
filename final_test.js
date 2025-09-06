const puppeteer = require('puppeteer');

async function finalTest() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('🔍 GYMTOPIA COMPREHENSIVE FUNCTIONALITY REPORT');
  console.log('='.repeat(80));

  const pages = [
    { path: '/', name: 'Home Page', key: 'home' },
    { path: '/profile', name: 'Profile Page', key: 'profile' },
    { path: '/admin', name: 'Admin Panel', key: 'admin' },
    { path: '/feed', name: 'Feed Page', key: 'feed' },
    { path: '/search', name: 'Search Page', key: 'search' },
    { path: '/search/results', name: 'Search Results', key: 'results' },
    { path: '/search/freeweight', name: 'Free Weight Search', key: 'freeweight' },
    { path: '/search/machine', name: 'Machine Search', key: 'machine' },
    { path: '/workout', name: 'Workout Page', key: 'workout' },
    { path: '/add', name: 'Add Page', key: 'add' },
    { path: '/stats', name: 'Stats Page', key: 'stats' },
    { path: '/admin/reviews', name: 'Admin Reviews', key: 'adminReviews' }
  ];

  const results = {
    working: [],
    errors: [],
    navigation: { working: [], broken: [] },
    features: {}
  };

  // Test each page
  for (const pageInfo of pages) {
    try {
      console.log(`\n📄 Testing ${pageInfo.name}...`);
      
      const response = await page.goto(`http://localhost:3000${pageInfo.path}`, { 
        waitUntil: 'networkidle0',
        timeout: 10000
      });
      
      if (!response.ok()) {
        results.errors.push(`${pageInfo.name}: HTTP ${response.status()}`);
        console.log(`   ❌ Failed with HTTP ${response.status()}`);
        continue;
      }
      
      const pageAnalysis = await page.evaluate(() => {
        // Count interactive elements
        const buttons = Array.from(document.querySelectorAll('button'));
        const links = Array.from(document.querySelectorAll('a'));
        const inputs = Array.from(document.querySelectorAll('input, textarea, select'));
        
        // Check for navigation
        const navigation = document.querySelector('nav');
        const navLinks = navigation ? Array.from(navigation.querySelectorAll('a')) : [];
        
        // Check for specific functional elements
        const searchInputs = Array.from(document.querySelectorAll('input[type="search"], input[placeholder*="search"], input[placeholder*="検索"]'));
        const filterButtons = Array.from(document.querySelectorAll('button[class*="tab"], button:has([class*="rounded border"])'));
        const forms = Array.from(document.querySelectorAll('form'));
        
        // Check for data/content
        const hasContent = document.body.textContent.trim().length > 100;
        const hasImages = document.querySelectorAll('img').length > 0;
        
        // Check for errors
        const hasReactErrors = document.querySelector('[data-nextjs-dialog-overlay]');
        const hasErrorText = document.body.textContent.includes('Error') || document.body.textContent.includes('エラー');
        
        return {
          title: document.title,
          url: window.location.href,
          buttons: buttons.length,
          links: links.length,
          inputs: inputs.length,
          hasNavigation: !!navigation,
          navLinks: navLinks.length,
          searchInputs: searchInputs.length,
          filterButtons: filterButtons.length,
          forms: forms.length,
          hasContent,
          hasImages,
          hasReactErrors: !!hasReactErrors,
          hasErrorText,
          // Get some sample button texts
          buttonTexts: buttons.slice(0, 5).map(btn => btn.textContent?.trim() || '').filter(t => t.length > 0),
          linkTexts: navLinks.map(link => link.textContent?.trim() || '').filter(t => t.length > 0)
        };
      });
      
      console.log(`   ✅ Page loaded successfully`);
      console.log(`   📊 Interactive: ${pageAnalysis.buttons} buttons, ${pageAnalysis.links} links, ${pageAnalysis.inputs} inputs`);
      console.log(`   🧭 Navigation: ${pageAnalysis.hasNavigation ? `✓ (${pageAnalysis.navLinks} links)` : '✗'}`);
      
      if (pageAnalysis.searchInputs > 0) {
        console.log(`   🔍 Search: ✓ ${pageAnalysis.searchInputs} search inputs`);
      }
      
      if (pageAnalysis.filterButtons > 0) {
        console.log(`   🎛️  Filters: ✓ ${pageAnalysis.filterButtons} filter buttons`);
      }
      
      if (pageAnalysis.forms > 0) {
        console.log(`   📝 Forms: ✓ ${pageAnalysis.forms} forms`);
      }
      
      if (pageAnalysis.hasReactErrors || pageAnalysis.hasErrorText) {
        console.log(`   ⚠️ Errors detected on page`);
      }

      results.working.push({
        ...pageInfo,
        ...pageAnalysis
      });
      
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}`);
      results.errors.push(`${pageInfo.name}: ${error.message}`);
    }
  }
  
  // Test navigation functionality
  console.log('\n🧭 Testing Navigation Links...');
  
  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    
    const navLinks = await page.evaluate(() => {
      const nav = document.querySelector('nav');
      if (!nav) return [];
      
      const links = Array.from(nav.querySelectorAll('a'));
      return links.map(link => ({
        href: link.href,
        text: link.textContent?.trim() || '',
        pathname: new URL(link.href).pathname
      }));
    });
    
    for (const link of navLinks.slice(0, 4)) {
      try {
        const testResponse = await page.goto(link.href, { waitUntil: 'networkidle0', timeout: 5000 });
        if (testResponse.ok()) {
          results.navigation.working.push(link);
          console.log(`   ✅ ${link.pathname} (${link.text})`);
        } else {
          results.navigation.broken.push({...link, error: `HTTP ${testResponse.status()}`});
          console.log(`   ❌ ${link.pathname} - HTTP ${testResponse.status()}`);
        }
      } catch (error) {
        results.navigation.broken.push({...link, error: error.message});
        console.log(`   ❌ ${link.pathname} - ${error.message}`);
      }
    }
  } catch (error) {
    console.log(`   ❌ Navigation test failed: ${error.message}`);
  }
  
  await browser.close();
  
  // Generate comprehensive report
  console.log('\n' + '='.repeat(80));
  console.log('📊 FINAL TEST RESULTS SUMMARY');
  console.log('='.repeat(80));
  
  console.log('\n✅ WORKING PAGES & FEATURES:');
  results.working.forEach(page => {
    console.log(`\n${page.name} (${page.path})`);
    console.log(`  Status: ✅ Working`);
    console.log(`  Elements: ${page.buttons + page.links + page.inputs} total (${page.buttons}B, ${page.links}L, ${page.inputs}I)`);
    console.log(`  Navigation: ${page.hasNavigation ? '✅' : '❌'} | Content: ${page.hasContent ? '✅' : '❌'}`);
    
    if (page.searchInputs > 0) console.log(`  Search: ✅ ${page.searchInputs} inputs`);
    if (page.filterButtons > 0) console.log(`  Filters: ✅ ${page.filterButtons} buttons`);
    if (page.forms > 0) console.log(`  Forms: ✅ ${page.forms} forms`);
    
    if (page.buttonTexts.length > 0) {
      console.log(`  Sample buttons: ${page.buttonTexts.slice(0, 3).join(', ')}`);
    }
  });
  
  if (results.errors.length > 0) {
    console.log('\n❌ ISSUES FOUND:');
    results.errors.forEach(error => {
      console.log(`  • ${error}`);
    });
  }
  
  console.log('\n🧭 NAVIGATION ASSESSMENT:');
  console.log(`  Working links: ${results.navigation.working.length}`);
  console.log(`  Broken links: ${results.navigation.broken.length}`);
  
  if (results.navigation.working.length > 0) {
    console.log('  Working navigation:');
    results.navigation.working.forEach(link => {
      console.log(`    ✅ ${link.pathname} - "${link.text}"`);
    });
  }
  
  if (results.navigation.broken.length > 0) {
    console.log('  Broken navigation:');
    results.navigation.broken.forEach(link => {
      console.log(`    ❌ ${link.pathname} - ${link.error}`);
    });
  }
  
  // Feature Assessment
  console.log('\n🎯 FEATURE BREAKDOWN:');
  
  const homeData = results.working.find(p => p.path === '/');
  const profileData = results.working.find(p => p.path === '/profile');
  const adminData = results.working.find(p => p.path === '/admin');
  const searchData = results.working.find(p => p.path === '/search');
  
  console.log(`  🏠 Home Page: ${homeData ? '✅ Working' : '❌ Not working'}`);
  if (homeData) {
    console.log(`     - Filter system: ${homeData.filterButtons > 0 ? `✅ ${homeData.filterButtons} filters` : '❌ No filters'}`);
    console.log(`     - Interactive elements: ${homeData.buttons} buttons`);
  }
  
  console.log(`  👤 User Profile: ${profileData ? '✅ Working' : '❌ Not working'}`);
  if (profileData) {
    console.log(`     - Interactive elements: ${profileData.buttons} buttons`);
  }
  
  console.log(`  ⚙️ Admin Panel: ${adminData ? '✅ Working' : '❌ Not working'}`);
  if (adminData) {
    console.log(`     - Forms available: ${adminData.forms > 0 ? `✅ ${adminData.forms} forms` : '❌ No forms'}`);
    console.log(`     - Input fields: ${adminData.inputs} inputs`);
  }
  
  console.log(`  🔍 Search: ${searchData ? '✅ Working' : '❌ Not working'}`);
  if (searchData) {
    console.log(`     - Search inputs: ${searchData.searchInputs > 0 ? `✅ ${searchData.searchInputs} inputs` : '❌ No search'}`);
  }
  
  // Overall Assessment
  const workingCount = results.working.length;
  const totalCount = pages.length;
  const successRate = (workingCount / totalCount * 100).toFixed(1);
  
  console.log('\n📈 OVERALL ASSESSMENT:');
  console.log(`  Success Rate: ${successRate}% (${workingCount}/${totalCount} pages working)`);
  console.log(`  Total Interactive Elements: ${results.working.reduce((sum, page) => sum + page.buttons + page.links + page.inputs, 0)}`);
  console.log(`  Navigation Consistency: ${results.working.every(p => p.hasNavigation) ? '✅ Consistent' : '⚠️ Inconsistent'}`);
  
  const navigationScore = results.navigation.working.length / (results.navigation.working.length + results.navigation.broken.length) * 100;
  console.log(`  Navigation Success: ${navigationScore.toFixed(1)}%`);
  
  console.log('\n' + '='.repeat(80));
  
  return results;
}

finalTest().catch(console.error);
