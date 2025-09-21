// Test script for gym detail modal functionality
const testGymModal = async () => {
  const gymId = '324a290c-85da-42b6-84b9-af4cffbbd0ae'; // エニタイムフィットネス新宿
  
  console.log('Testing gym detail modal with gym ID:', gymId);
  
  // 1. Check search results page
  const searchUrl = 'http://localhost:3001/search/results?keyword=エニタイム';
  console.log('\n1. Checking search results page:', searchUrl);
  
  try {
    const searchResponse = await fetch(searchUrl);
    if (searchResponse.ok) {
      const html = await searchResponse.text();
      const hasGym = html.includes('エニタイムフィットネス');
      console.log('   - Gym found in search results:', hasGym);
    }
  } catch (error) {
    console.error('   - Error:', error.message);
  }
  
  // 2. Check gym API endpoint
  const apiUrl = `http://localhost:3001/api/gyms/${gymId}`;
  console.log('\n2. Checking gym API endpoint:', apiUrl);
  
  try {
    const apiResponse = await fetch(apiUrl);
    if (apiResponse.ok) {
      const data = await apiResponse.json();
      console.log('   - Gym name:', data.gym?.name);
      console.log('   - Address:', data.gym?.address);
      console.log('   - Facilities:', JSON.stringify(data.gym?.facilities, null, 2));
    } else {
      console.log('   - API returned status:', apiResponse.status);
    }
  } catch (error) {
    console.error('   - Error:', error.message);
  }
  
  // 3. Check admin page
  const adminUrl = 'http://localhost:3001/admin';
  console.log('\n3. Checking admin page:', adminUrl);
  
  try {
    const adminResponse = await fetch(adminUrl);
    if (adminResponse.ok) {
      const html = await adminResponse.text();
      console.log('   - Admin page accessible:', true);
      // Check if gym management features are present
      const hasGymManagement = html.includes('基本情報') && html.includes('設備管理');
      console.log('   - Has gym management features:', hasGymManagement);
    }
  } catch (error) {
    console.error('   - Error:', error.message);
  }
};

testGymModal().catch(console.error);
