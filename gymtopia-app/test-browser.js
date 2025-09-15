const fetch = require('node-fetch');

async function testHomePage() {
  try {
    console.log('Testing http://localhost:3000...');
    const response = await fetch('http://localhost:3000');
    const html = await response.text();

    console.log('Status:', response.status);
    console.log('Headers:', response.headers.raw());
    console.log('HTML length:', html.length);

    // Check for common issues
    if (html.includes('Loading...')) {
      console.log('⚠️  Page contains "Loading..." - might be stuck in loading state');
    }

    if (!html.includes('</html>')) {
      console.log('⚠️  HTML seems incomplete');
    }

    if (html.includes('Error')) {
      console.log('⚠️  Page contains "Error" text');
    }

    // Check for Next.js scripts
    if (html.includes('/_next/static')) {
      console.log('✓ Next.js static assets found');
    }

    console.log('\nFirst 500 chars of HTML:');
    console.log(html.substring(0, 500));

  } catch (error) {
    console.error('Error testing page:', error);
  }
}

testHomePage();