const puppeteer = require('puppeteer');

async function simpleTest() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('🚀 GYMTOPIA Functionality Test Report\n');

  const pages = [
    { path: '/', name: 'Home Page' },
    { path: '/profile', name: 'Profile Page' },
    { path: '/admin', name: 'Admin Page' },
    { path: '/feed', name: 'Feed Page' },
    { path: '/search', name: 'Search Page' },
    { path: '/search/results', name: 'Search Results' },
    { path: '/search/freeweight', name: 'Free Weight Search' },
    { path: '/workout', name: 'Workout Page' },
    { path: '/add', name: 'Add Page' },
    { path: '/stats', name: 'Stats Page' },
    { path: '/admin/reviews', name: 'Admin Reviews' }
  ];

  const results = {
    working: [],
    errors: [],
    summary: {}
  };

  for (const pageInfo of pages) {
    try {
      console.log(`Testing ${pageInfo.name}...`);
      
      const response = await page.goto(`http://localhost:3000${pageInfo.path}`, { 
        waitUntil: 'networkidle2',
        timeout: 8000
      });
      
      if (!response.ok()) {
        results.errors.push(`${pageInfo.name}: HTTP ${response.status()}`);
        continue;
      }
      
      // Quick check for critical elements
      const pageAnalysis = await page.evaluate(() => {
        const buttons = document.querySelectorAll('button');
        const links = document.querySelectorAll('a');
        const inputs = document.querySelectorAll('input');
        const navigation = document.querySelector('nav');
        const hasReactErrors = document.querySelector('[data-nextjs-dialog-overlay]');
        
        // Check for specific functionality based on page content
        const searchInput = document.querySelector('input[placeholder*="検索"], input[placeholder*="search"], input[type="search"]');
        const filterButtons = document.querySelectorAll('button[class*="tab"], button:has([class*="rounded border"])');
        const navigationLinks = document.querySelectorAll('nav a, [role="navigation"] a');
        
        return {
          buttons: buttons.length,
          links: links.length,
          inputs: inputs.length,
          hasNavigation: !!navigation,
          hasReactErrors: !!hasReactErrors,
          hasSearchInput: !!searchInput,
          filterButtons: filterButtons.length,
          navigationLinks: navigationLinks.length,
          title: document.title
        };
      });
      
      if (pageAnalysis.hasReactErrors) {
        results.errors.push(`${pageInfo.name}: React errors detected`);
        continue;
      }
      
      results.working.push({
        name: pageInfo.name,
        path: pageInfo.path,
        ...pageAnalysis
      });
      
    } catch (error) {
      results.errors.push(`${pageInfo.name}: ${error.message}`);
    }
  }

  // Test navigation functionality
  console.log('\nTesting navigation links...');
  
  try {
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle2' });
    
    const navLinks = await page.evaluate(() => {
      const links = Array.from(document.querySelectorAll('nav a, [role="navigation"] a'));
      return links.map(link => ({
        href: link.href,
        text: link.textContent?.trim() || ''
      }));
    });
    
    let workingNavLinks = 0;
    for (const link of navLinks.slice(0, 4)) { // Test first 4 nav links
      try {
        const response = await page.goto(link.href, { waitUntil: 'networkidle2', timeout: 5000 });
        if (response.ok()) {
          workingNavLinks++;
        }
      } catch (error) {
        // Navigation link failed
      }
    }
    
    results.summary.navigationLinks = {
      total: navLinks.length,
      working: workingNavLinks
    };
    
  } catch (error) {
    results.summary.navigationError = error.message;
  }

  await browser.close();
  
  // Generate Report
  console.log('\n' + '='.repeat(70));
  console.log('📊 GYMTOPIA FUNCTIONALITY TEST RESULTS');
  console.log('='.repeat(70));
  
  console.log('\n✅ WORKING PAGES:');
  results.working.forEach(page => {
    console.log(`\n${page.name} (${page.path})`);
    console.log(`  📊 Interactive Elements: ${page.buttons + page.links + page.inputs}`);
    console.log(`     └─ ${page.buttons} buttons, ${page.links} links, ${page.inputs} inputs`);
    console.log(`  🧭 Navigation: ${page.hasNavigation ? '✓' : '✗'}`);
    console.log(`  🔍 Search Input: ${page.hasSearchInput ? '✓' : '✗'}`);
    console.log(`  🎛️  Filter Buttons: ${page.filterButtons}`);
  });
  
  if (results.errors.length > 0) {
    console.log('\n❌ PAGES WITH ISSUES:');
    results.errors.forEach(error => {
      console.log(`  • ${error}`);
    });
  }
  
  console.log('\n📈 OVERALL ASSESSMENT:');
  console.log(`  • Working Pages: ${results.working.length}/${pages.length}`);
  console.log(`  • Pages with Issues: ${results.errors.length}/${pages.length}`);
  
  if (results.summary.navigationLinks) {
    console.log(`  • Working Navigation Links: ${results.summary.navigationLinks.working}/${results.summary.navigationLinks.total}`);
  }
  
  const totalInteractiveElements = results.working.reduce((sum, page) => 
    sum + page.buttons + page.links + page.inputs, 0);
  console.log(`  • Total Interactive Elements: ${totalInteractiveElements}`);
  
  const functionalityScore = results.working.length / pages.length * 100;
  console.log(`  • Functionality Score: ${functionalityScore.toFixed(1)}%`);
  
  // Specific feature assessment
  console.log('\n🎯 FEATURE ASSESSMENT:');
  
  const homePage = results.working.find(p => p.path === '/');
  if (homePage) {
    console.log(`  • Search Functionality: ${homePage.hasSearchInput ? '✓ Present' : '✗ Missing'}`);
    console.log(`  • Filter System: ${homePage.filterButtons > 0 ? `✓ ${homePage.filterButtons} filters` : '✗ No filters'}`);
  }
  
  const hasNavigation = results.working.every(p => p.hasNavigation);
  console.log(`  • Consistent Navigation: ${hasNavigation ? '✓ All pages' : '✗ Inconsistent'}`);
  
  const hasProfile = results.working.some(p => p.path === '/profile');
  console.log(`  • User Profile: ${hasProfile ? '✓ Working' : '✗ Not working'}`);
  
  const hasAdmin = results.working.some(p => p.path === '/admin');
  console.log(`  • Admin Panel: ${hasAdmin ? '✓ Working' : '✗ Not working'}`);
  
  console.log('\n' + '='.repeat(70));
  
  return results;
}

simpleTest().catch(console.error);
