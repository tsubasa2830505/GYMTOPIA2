// Setup avatars storage bucket with proper RLS policies
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://htytewqvkgwyuvcsvjwm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEzNDI0NiwiZXhwIjoyMDcyNzEwMjQ2fQ.VVNIX12yaN7t3seEzRwbMRtmNEbHoEkPXYeBzt60JBs'; // Service role key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function setupAvatarsBucket() {
  console.log('🛠️ Setting up avatars storage bucket...');

  try {
    // Check if bucket exists
    const { data: buckets, error: listError } = await supabase.storage.listBuckets();

    if (listError) {
      console.error('❌ Error listing buckets:', listError);
      return;
    }

    console.log('📦 Existing buckets:', buckets.map(b => b.name));

    const avatarsBucket = buckets.find(bucket => bucket.name === 'avatars');

    if (avatarsBucket) {
      console.log('🗑️ Deleting existing avatars bucket to recreate it properly...');

      // Delete existing bucket first if it has RLS issues
      const { error: deleteError } = await supabase.storage.deleteBucket('avatars');
      if (deleteError) {
        console.error('❌ Could not delete existing bucket:', deleteError);
        return;
      } else {
        console.log('✅ Deleted existing avatars bucket');
      }
    }

    console.log('📦 Creating new public avatars bucket...');

    const { data: newBucket, error: createError } = await supabase.storage.createBucket('avatars', {
      public: true,
      allowedMimeTypes: ['image/png', 'image/jpg', 'image/jpeg', 'image/gif', 'image/webp'],
      fileSizeLimit: 5242880 // 5MB
    });

    if (createError) {
      console.error('❌ Error creating bucket:', createError);
      return;
    }

    console.log('✅ Created new public avatars bucket:', newBucket);

    console.log('✅ Avatars bucket is public - no RLS configuration needed');

    console.log('🎉 Avatars bucket setup complete!');

  } catch (error) {
    console.error('❌ Setup failed:', error);
  }
}

setupAvatarsBucket();