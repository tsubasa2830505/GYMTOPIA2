// Fix Supabase Storage RLS policies for avatars bucket
const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://htytewqvkgwyuvcsvjwm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEzNDI0NiwiZXhwIjoyMDcyNzEwMjQ2fQ.VVNIX12yaN7t3seEzRwbMRtmNEbHoEkPXYeBzt60JBs'; // Service role key

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function fixStorageRLS() {
  console.log('🔧 Fixing Supabase Storage RLS policies...');

  try {
    // First, let's check current RLS policies for storage.objects
    console.log('🔍 Checking current RLS status...');

    const checkRLS = `
      SELECT
        schemaname,
        tablename,
        rowsecurity
      FROM pg_tables
      WHERE schemaname = 'storage' AND tablename = 'objects';
    `;

    const { data: rlsStatus, error: checkError } = await supabase.rpc('exec_sql', {
      sql: checkRLS
    });

    if (checkError) {
      console.error('❌ Error checking RLS status:', checkError);
    } else {
      console.log('📋 Current RLS status:', rlsStatus);
    }

    // Create a policy that allows anyone to insert into avatars bucket
    console.log('🔐 Creating public upload policy for avatars bucket...');

    const createUploadPolicy = `
      CREATE POLICY "Public Avatar Upload" ON storage.objects
      FOR INSERT
      WITH CHECK (bucket_id = 'avatars');
    `;

    try {
      const { error: policyError1 } = await supabase.rpc('exec_sql', {
        sql: createUploadPolicy
      });

      if (policyError1) {
        if (policyError1.message && policyError1.message.includes('already exists')) {
          console.log('✅ Upload policy already exists');
        } else {
          console.error('❌ Error creating upload policy:', policyError1);
        }
      } else {
        console.log('✅ Upload policy created successfully');
      }
    } catch (error) {
      console.log('⚠️ Upload policy creation failed (might already exist):', error.message);
    }

    // Create a policy that allows anyone to read from avatars bucket
    console.log('🔐 Creating public read policy for avatars bucket...');

    const createReadPolicy = `
      CREATE POLICY "Public Avatar Read" ON storage.objects
      FOR SELECT
      USING (bucket_id = 'avatars');
    `;

    try {
      const { error: policyError2 } = await supabase.rpc('exec_sql', {
        sql: createReadPolicy
      });

      if (policyError2) {
        if (policyError2.message && policyError2.message.includes('already exists')) {
          console.log('✅ Read policy already exists');
        } else {
          console.error('❌ Error creating read policy:', policyError2);
        }
      } else {
        console.log('✅ Read policy created successfully');
      }
    } catch (error) {
      console.log('⚠️ Read policy creation failed (might already exist):', error.message);
    }

    // Create a policy that allows anyone to update files in avatars bucket
    console.log('🔐 Creating public update policy for avatars bucket...');

    const createUpdatePolicy = `
      CREATE POLICY "Public Avatar Update" ON storage.objects
      FOR UPDATE
      USING (bucket_id = 'avatars');
    `;

    try {
      const { error: policyError3 } = await supabase.rpc('exec_sql', {
        sql: createUpdatePolicy
      });

      if (policyError3) {
        if (policyError3.message && policyError3.message.includes('already exists')) {
          console.log('✅ Update policy already exists');
        } else {
          console.error('❌ Error creating update policy:', policyError3);
        }
      } else {
        console.log('✅ Update policy created successfully');
      }
    } catch (error) {
      console.log('⚠️ Update policy creation failed (might already exist):', error.message);
    }

    // Create a policy that allows anyone to delete files in avatars bucket
    console.log('🔐 Creating public delete policy for avatars bucket...');

    const createDeletePolicy = `
      CREATE POLICY "Public Avatar Delete" ON storage.objects
      FOR DELETE
      USING (bucket_id = 'avatars');
    `;

    try {
      const { error: policyError4 } = await supabase.rpc('exec_sql', {
        sql: createDeletePolicy
      });

      if (policyError4) {
        if (policyError4.message && policyError4.message.includes('already exists')) {
          console.log('✅ Delete policy already exists');
        } else {
          console.error('❌ Error creating delete policy:', policyError4);
        }
      } else {
        console.log('✅ Delete policy created successfully');
      }
    } catch (error) {
      console.log('⚠️ Delete policy creation failed (might already exist):', error.message);
    }

    // Enable RLS to make sure our policies are enforced
    console.log('🔐 Enabling RLS on storage.objects...');

    const enableRLS = `
      ALTER TABLE storage.objects ENABLE ROW LEVEL SECURITY;
    `;

    try {
      const { error: enableError } = await supabase.rpc('exec_sql', {
        sql: enableRLS
      });

      if (enableError) {
        console.log('⚠️ RLS enable failed (might already be enabled):', enableError.message);
      } else {
        console.log('✅ RLS enabled on storage.objects');
      }
    } catch (error) {
      console.log('⚠️ RLS enable failed (might already be enabled):', error.message);
    }

    // List current policies to verify
    console.log('📋 Listing current policies...');

    const listPolicies = `
      SELECT
        policyname,
        cmd,
        qual,
        with_check
      FROM pg_policies
      WHERE schemaname = 'storage' AND tablename = 'objects'
      AND policyname LIKE '%Avatar%';
    `;

    try {
      const { data: policies, error: listError } = await supabase.rpc('exec_sql', {
        sql: listPolicies
      });

      if (listError) {
        console.error('❌ Error listing policies:', listError);
      } else {
        console.log('📋 Current avatar policies:', policies);
      }
    } catch (error) {
      console.log('⚠️ Policy listing failed:', error.message);
    }

    console.log('🎉 Storage RLS policy fix completed!');
    console.log('💡 You should now be able to upload images to the avatars bucket.');

  } catch (error) {
    console.error('❌ Storage RLS fix failed:', error);
  }
}

fixStorageRLS();