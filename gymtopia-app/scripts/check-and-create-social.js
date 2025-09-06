const { createClient } = require('@supabase/supabase-js');

// Supabase設定
const supabaseUrl = 'https://htytewqvkgwyuvcsvjwm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEzNDI0NiwiZXhwIjoyMDcyNzEwMjQ2fQ.VVNIX12yaN7t3seEzRwbMRtmNEbHoEkPXYeBzt60JBs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function checkAndCreateSocialTables() {
  try {
    console.log('🔍 Checking existing social tables...\n');
    
    // チェックするテーブル
    const socialTables = [
      'posts',
      'likes', 
      'comments',
      'follows',
      'gym_friends',
      'notifications'
    ];
    
    const existingTables = [];
    const missingTables = [];
    
    for (const table of socialTables) {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ❌ ${table}: Not found`);
        missingTables.push(table);
      } else {
        console.log(`   ✅ ${table}: Already exists`);
        existingTables.push(table);
      }
    }
    
    console.log('\n📊 Summary:');
    console.log(`   Existing tables: ${existingTables.length}`);
    console.log(`   Missing tables: ${missingTables.length}`);
    
    if (missingTables.length > 0) {
      console.log('\n⚠️  Missing tables need to be created:');
      missingTables.forEach(table => {
        console.log(`   - ${table}`);
      });
      
      console.log('\n📝 SQL to execute in Supabase SQL Editor:');
      console.log('==================================================');
      console.log('Please go to: https://supabase.com/dashboard/project/htytewqvkgwyuvcsvjwm/sql/new');
      console.log('And execute the SQL from: scripts/create-social-tables.sql');
      console.log('==================================================');
    } else {
      console.log('\n✅ All social tables already exist!');
      
      // サンプルデータの確認
      console.log('\n📊 Checking existing data:');
      
      // 投稿数
      const { count: postsCount } = await supabase
        .from('posts')
        .select('*', { count: 'exact', head: true });
      console.log(`   Posts: ${postsCount || 0}`);
      
      // フォロー関係数
      const { count: followsCount } = await supabase
        .from('follows')
        .select('*', { count: 'exact', head: true });
      console.log(`   Follow relationships: ${followsCount || 0}`);
      
      // 通知数
      const { count: notificationsCount } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true });
      console.log(`   Notifications: ${notificationsCount || 0}`);
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// 実行
checkAndCreateSocialTables().then(() => {
  console.log('\n✨ Done!');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});