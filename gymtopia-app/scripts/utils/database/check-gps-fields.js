const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://htytewqvkgwyuvcsvjwm.supabase.co';
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzQyNDYsImV4cCI6MjA3MjcxMDI0Nn0.xltaH28adx1dIhsqaWllLDPEjw8iDrSglDIwj19rXnA';

const supabase = createClient(supabaseUrl, supabaseAnonKey);

async function checkGpsFields() {
  console.log('GPS認証フィールドの確認中...');

  try {
    // gym_posts テーブルから1件取得してフィールドを確認
    const { data, error } = await supabase
      .from('gym_posts')
      .select('id, is_verified, checkin_id, verification_method, distance_from_gym')
      .limit(1);

    if (error) {
      console.error('エラー:', error);
      return;
    }

    console.log('✅ GPS認証フィールドが存在します！');
    console.log('取得したデータ:', data);

    // gym_posts_with_countsビューからも確認
    const { data: viewData, error: viewError } = await supabase
      .from('gym_posts_with_counts')
      .select('id, is_verified, checkin_id, verification_method, distance_from_gym')
      .limit(1);

    if (!viewError) {
      console.log('✅ gym_posts_with_countsビューにもフィールドが存在します！');
      console.log('ビューのデータ:', viewData);
    } else {
      console.log('⚠️ ビューエラー:', viewError);
    }

  } catch (error) {
    console.error('エラー:', error);
  }
}

checkGpsFields();