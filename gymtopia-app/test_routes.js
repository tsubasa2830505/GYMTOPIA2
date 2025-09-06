const routes = [
  '/',
  '/add',
  '/admin',
  '/admin/reviews',
  '/feed',
  '/followers',
  '/following',
  '/gym-friends',
  '/gym-stats',
  '/gyms/123', // Dynamic route test
  '/profile',
  '/profile/edit',
  '/stats',
  '/workout'
];

console.log('Testing all routes for accessibility...\n');

async function testRoutes() {
  const results = [];
  
  for (const route of routes) {
    try {
      const url = `http://localhost:3000${route}`;
      const response = await fetch(url, {
        method: 'HEAD',
        redirect: 'manual'
      });
      
      const status = response.status;
      const result = {
        route,
        status,
        result: status < 400 ? '✅ OK' : '❌ Error'
      };
      
      results.push(result);
      console.log(`${result.result} ${route} - Status: ${status}`);
    } catch (error) {
      results.push({
        route,
        status: 'Error',
        result: '❌ Failed'
      });
      console.log(`❌ ${route} - Error: ${error.message}`);
    }
  }
  
  console.log('\n=== Summary ===');
  const successCount = results.filter(r => r.result.includes('✅')).length;
  console.log(`Success: ${successCount}/${routes.length} routes`);
  
  const failures = results.filter(r => r.result.includes('❌'));
  if (failures.length > 0) {
    console.log('\nFailed routes:');
    failures.forEach(f => console.log(`  - ${f.route}: ${f.status}`));
  }
}

// Check if server is running
fetch('http://localhost:3000')
  .then(() => {
    testRoutes();
  })
  .catch(() => {
    console.log('❌ Server is not running on http://localhost:3000');
    console.log('Please start the dev server with: npm run dev');
  });
