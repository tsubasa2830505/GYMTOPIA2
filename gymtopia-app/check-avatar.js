// Check avatar URL in database
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://htytewqvkgwyuvcsvjwm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzQyNDYsImV4cCI6MjA3MjcxMDI0Nn0.xltaH28adx1dIhsqaWllLDPEjw8iDrSglDIwj19rXnA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkAvatar() {
  const userId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac';

  console.log('📊 Checking avatar URL for user:', userId);

  const { data, error } = await supabase
    .from('users')
    .select('id, display_name, username, avatar_url, updated_at')
    .eq('id', userId)
    .single();

  if (error) {
    console.error('❌ Error fetching user:', error);
    return;
  }

  console.log('\n✅ Current user data:');
  console.log('  ID:', data.id);
  console.log('  Display Name:', data.display_name);
  console.log('  Username:', data.username);
  console.log('  Avatar URL:', data.avatar_url);
  console.log('  Last Updated:', data.updated_at);

  if (data.avatar_url) {
    console.log('\n🖼️ Avatar URL details:');
    if (data.avatar_url.includes('supabase')) {
      console.log('  Type: Supabase Storage URL');
    } else if (data.avatar_url.startsWith('/')) {
      console.log('  Type: Local path');
    } else if (data.avatar_url.startsWith('http')) {
      console.log('  Type: External URL');
    } else {
      console.log('  Type: Unknown format');
    }
  } else {
    console.log('\n⚠️ No avatar URL set');
  }
}

checkAvatar();