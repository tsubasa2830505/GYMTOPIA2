const puppeteer = require('puppeteer');

async function clickByText(page, selector, text, exact = false) {
  return page.evaluate(({ selector, text, exact }) => {
    const elements = Array.from(document.querySelectorAll(selector));
    const el = elements.find(e => {
      const t = (e.textContent || '').trim();
      return exact ? t === text : t.includes(text);
    });
    if (el) {
      el.scrollIntoView({ block: 'center', behavior: 'instant' });
      el.click();
      return true;
    }
    return false;
  }, { selector, text, exact });
}

async function scenarioTest() {
  const browser = await puppeteer.launch({ headless: true, defaultViewport: { width: 1280, height: 800 } });
  const page = await browser.newPage();

  const results = [];
  const wait = (ms) => new Promise(r => setTimeout(r, ms));

  console.log('🎬 Running Scenario Tests for GYMTOPIA');
  console.log('='.repeat(80));

  // Scenario 1: Machine search -> results -> open modal -> go to Add page
  try {
    console.log('\n🧩 Scenario 1: Machine search → Result → Modal → Add');
    await page.goto('http://localhost:3000/search/machine', { waitUntil: 'networkidle0', timeout: 15000 });

    // Prefer clicking "すべて選択" to ensure count > 0
    let clicked = await clickByText(page, 'button', 'すべて選択');
    if (!clicked) {
      // Fallback: click a couple of item buttons heuristically
      const itemButtons = await page.$$('button');
      let count = 0;
      for (const btn of itemButtons) {
        const txt = (await btn.evaluate(el => el.textContent || '')).trim();
        if (/(チェスト|インクライン|デクライン|ラット|ロー|レッグ)/.test(txt)) {
          try { await btn.click(); count++; if (count >= 2) break; } catch (_) {}
        }
      }
      if (count === 0) throw new Error('No machine items clickable');
    }

    // Wait for search button to appear then click
    await page.waitForFunction(() => Array.from(document.querySelectorAll('button')).some(b => (b.textContent || '').includes('個の条件で検索')), { timeout: 5000 });
    const clickedSearch = await clickByText(page, 'button', '個の条件で検索');
    if (!clickedSearch) throw new Error('Search button not found');
    // SPA navigation: wait until URL changes to /search/results
    await page.waitForFunction(() => location.pathname.startsWith('/search/results'), { timeout: 15000 });

    // Switch to list view on results page
    await clickByText(page, 'button', 'リスト', true);
    await wait(200);

    // Try to open first gym card if exists
    const hasCard = await page.evaluate(() => {
      return Array.from(document.querySelectorAll('button')).some(b => (b.textContent || '').includes('詳細を見る'));
    });
    if (hasCard) {
      const detailClicked = await clickByText(page, 'button', '詳細を見る');
      if (!detailClicked) throw new Error('詳細を見る not found');
      await wait(500);
      // Verify modal visible by checking backdrop and Close(X) button
      const hasModal = await page.evaluate(() => {
        return !!document.querySelector('div.fixed.inset-0');
      });
      if (!hasModal) throw new Error('Gym detail modal not visible');
      const postClicked = await clickByText(page, 'button', 'ジム活を投稿');
      if (!postClicked) throw new Error('ジム活を投稿 not found');
      await page.waitForFunction(() => location.pathname.startsWith('/add'), { timeout: 15000 });
      const onAdd = page.url().includes('/add');
      results.push({ name: 'Scenario 1', status: onAdd ? '✅ Passed' : '❌ Failed', url: page.url() });
    } else {
      // Graceful fallback: assert we are on results page with header
      const headerOk = await page.evaluate(() => document.body.textContent.includes('検索結果'));
      results.push({ name: 'Scenario 1', status: headerOk ? '✅ Passed' : '❌ Failed', note: 'No results to open modal' });
    }
  } catch (e) {
    console.log('   ❌', e.message);
    results.push({ name: 'Scenario 1', status: '❌ Failed', error: e.message });
  }

  // Scenario 2: Free weight selection → results
  try {
    console.log('\n🧩 Scenario 2: Free weight selection → Result');
    await page.goto('http://localhost:3000/search/freeweight', { waitUntil: 'networkidle0', timeout: 15000 });

    // Expand first category and click one item
    const clickedItem = await clickByText(page, 'button', 'すべて選択');
    if (!clickedItem) {
      // fallback: click first button that has "ベンチ" or "ラック"
      const altClicked = await clickByText(page, 'button', 'ベンチ') || await clickByText(page, 'button', 'ラック');
      if (!altClicked) throw new Error('No selectable freeweight items');
    }

    const ranSearch = await clickByText(page, 'button', '個の条件で検索');
    if (!ranSearch) throw new Error('Search button not found');
    await page.waitForFunction(() => location.pathname.startsWith('/search/results'), { timeout: 15000 });

    const onResults = page.url().startsWith('http://localhost:3000/search/results');
    results.push({ name: 'Scenario 2', status: onResults ? '✅ Passed' : '❌ Failed', url: page.url() });
  } catch (e) {
    console.log('   ❌', e.message);
    results.push({ name: 'Scenario 2', status: '❌ Failed', error: e.message });
  }

  // Scenario 3: Keyword search on /search
  try {
    console.log('\n🧩 Scenario 3: Search page keyword → refresh list');
    await page.goto('http://localhost:3000/search', { waitUntil: 'networkidle0', timeout: 15000 });
    const input = await page.$('input[placeholder*="ジム名"], input[type="text"]');
    if (!input) throw new Error('Search input not found');
    await input.click();
    await input.type('新宿');
    const clicked = await clickByText(page, 'button', '検索', true);
    if (!clicked) throw new Error('検索 button not found');
    await wait(500);
    const hasCards = await page.evaluate(() => document.querySelectorAll('h3').length > 0);
    results.push({ name: 'Scenario 3', status: hasCards ? '✅ Passed' : '❌ Failed' });
  } catch (e) {
    console.log('   ❌', e.message);
    results.push({ name: 'Scenario 3', status: '❌ Failed', error: e.message });
  }

  // Scenario 4: Profile → switch to admin (navigates to /admin)
  try {
    console.log('\n🧩 Scenario 4: Profile → Facility admin');
    await page.goto('http://localhost:3000/profile', { waitUntil: 'networkidle0', timeout: 15000 });
    const clicked = await clickByText(page, 'button', '施設管理者');
    if (!clicked) throw new Error('施設管理者 button not found');
    await page.waitForFunction(() => location.pathname.startsWith('/admin'), { timeout: 5000 });
    const url = page.url();
    const ok = /\/admin(\b|\/?)/.test(new URL(url).pathname);
    results.push({ name: 'Scenario 4', status: ok ? '✅ Passed' : '❌ Failed', url });
  } catch (e) {
    console.log('   ❌', e.message);
    results.push({ name: 'Scenario 4', status: '❌ Failed', error: e.message });
  }

  await browser.close();

  // Report
  console.log('\n' + '='.repeat(80));
  console.log('📊 SCENARIO TEST REPORT');
  console.log('='.repeat(80));
  for (const r of results) {
    console.log(`${r.status} ${r.name}${r.url ? ` → ${r.url}` : ''}${r.error ? ` (${r.error})` : ''}`);
  }
  const pass = results.filter(r => r.status.startsWith('✅')).length;
  console.log(`\nSummary: ${pass}/${results.length} scenarios passed`);

  if (pass !== results.length) process.exitCode = 1;
}

scenarioTest().catch(err => { console.error(err); process.exit(1); });
