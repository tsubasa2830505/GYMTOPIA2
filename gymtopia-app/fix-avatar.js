// Fix avatar URL - remove base64 and set to null
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://htytewqvkgwyuvcsvjwm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzQyNDYsImV4cCI6MjA3MjcxMDI0Nn0.xltaH28adx1dIhsqaWllLDPEjw8iDrSglDIwj19rXnA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function fixAvatar() {
  const userId = '8ac9e2a5-a702-4d04-b871-21e4a423b4ac';

  console.log('🔧 Fixing avatar URL for user:', userId);

  // Clear the base64 data
  const { data, error } = await supabase
    .from('users')
    .update({
      avatar_url: null,
      updated_at: new Date().toISOString()
    })
    .eq('id', userId)
    .select();

  if (error) {
    console.error('❌ Error updating avatar:', error);
    return;
  }

  console.log('✅ Avatar URL cleared successfully');
  if (data && data.length > 0) {
    console.log('  User:', data[0].display_name);
    console.log('  Avatar URL:', data[0].avatar_url);
  } else {
    console.log('  Avatar URL successfully set to null');
  }
}

fixAvatar();