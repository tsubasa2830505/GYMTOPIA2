const puppeteer = require('puppeteer');

async function testInteractions() {
  const browser = await puppeteer.launch({ headless: true });
  const page = await browser.newPage();
  
  console.log('🎯 Testing Key User Interactions\n');
  
  const tests = [];
  
  try {
    // Home page filter interaction
    console.log('📍 Testing Home Page Filters...');
    await page.goto('http://localhost:3000/', { waitUntil: 'networkidle0' });
    
    // Test clicking filter tabs
    const filterTabs = await page.$$('button[class*="tab"], div > button');
    if (filterTabs.length > 0) {
      await filterTabs[0].click();
      await new Promise(r => setTimeout(r, 200));
      tests.push({ name: 'Home filter tabs', status: '✅ Clickable' });
    }
    
    // Test facility checkboxes
    const facilityButtons = await page.$$('button:has(div.w-5.h-5.rounded)');
    if (facilityButtons.length > 0) {
      await facilityButtons[0].click();
      await new Promise(r => setTimeout(r, 200));
      tests.push({ name: 'Facility checkboxes', status: '✅ Clickable' });
    } else {
      // Try alternative selector
      const altButtons = await page.$$('button[class*="border"]');
      if (altButtons.length > 0) {
        await altButtons[0].click();
        tests.push({ name: 'Facility selection', status: '✅ Clickable' });
      }
    }
    
    // Navigation test
    console.log('📍 Testing Navigation...');
    const navLinks = await page.$$('nav a');
    if (navLinks.length >= 4) {
      // Click profile link (usually last)
      await navLinks[3].click();
      await new Promise(r => setTimeout(r, 1000));
      
      const url = page.url();
      if (url.includes('/profile')) {
        tests.push({ name: 'Navigation to Profile', status: '✅ Working' });
      } else {
        tests.push({ name: 'Navigation to Profile', status: '❌ Failed' });
      }
    }
    
    // Profile page interactions
    console.log('📍 Testing Profile Page...');
    await page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle0' });
    
    const profileButtons = await page.$$('button');
    if (profileButtons.length > 0) {
      // Click first few buttons
      for (let i = 0; i < Math.min(3, profileButtons.length); i++) {
        await profileButtons[i].click();
        await new Promise(r => setTimeout(r, 200));
      }
      tests.push({ name: 'Profile buttons', status: '✅ Clickable' });
    }
    
    // Search functionality
    console.log('📍 Testing Search...');
    await page.goto('http://localhost:3000/search/results', { waitUntil: 'networkidle0' });
    
    const searchInput = await page.$('input');
    if (searchInput) {
      await searchInput.type('テストジム');
      const value = await searchInput.evaluate(el => el.value);
      if (value === 'テストジム') {
        tests.push({ name: 'Search input', status: '✅ Working' });
      } else {
        tests.push({ name: 'Search input', status: '❌ Not working' });
      }
    }
    
    // Machine selection
    console.log('📍 Testing Free Weight Selection...');
    await page.goto('http://localhost:3000/search/freeweight', { waitUntil: 'networkidle0' });
    
    const machineButtons = await page.$$('button');
    let clickableButtons = 0;
    for (let i = 0; i < Math.min(5, machineButtons.length); i++) {
      try {
        await machineButtons[i].click();
        await new Promise(r => setTimeout(r, 100));
        clickableButtons++;
      } catch (e) {
        // Button might not be clickable
      }
    }
    
    if (clickableButtons > 0) {
      tests.push({ name: 'Machine selection buttons', status: `✅ ${clickableButtons} clickable` });
    }
    
    // Form interactions
    console.log('📍 Testing Add Page Form...');
    await page.goto('http://localhost:3000/add', { waitUntil: 'networkidle0' });
    
    const formElements = await page.$$('input, textarea, select');
    let workingInputs = 0;
    
    for (const input of formElements) {
      try {
        await input.click();
        await input.type('test');
        workingInputs++;
      } catch (e) {
        // Input might not accept text
      }
    }
    
    if (workingInputs > 0) {
      tests.push({ name: 'Form inputs', status: `✅ ${workingInputs} working inputs` });
    }
    
  } catch (error) {
    console.log(`❌ Error during testing: ${error.message}`);
  }
  
  await browser.close();
  
  // Results summary
  console.log('\n📊 Interaction Test Results:');
  console.log('=' .repeat(50));
  
  tests.forEach(test => {
    console.log(`${test.status} ${test.name}`);
  });
  
  const workingTests = tests.filter(t => t.status.includes('✅')).length;
  const totalTests = tests.length;
  
  console.log(`\n📈 Summary: ${workingTests}/${totalTests} interactions working`);
  
  return tests;
}

testInteractions().catch(console.error);
