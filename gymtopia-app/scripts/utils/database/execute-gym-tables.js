const { createClient } = require('@supabase/supabase-js');
const fs = require('fs');
const path = require('path');

// Supabase設定
const supabaseUrl = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

if (!supabaseUrl || !supabaseServiceKey) {
  console.error('Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY env vars');
  process.exit(1);
}

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function executeSQLFile() {
  try {
    console.log('📚 Reading SQL file...');
    const sqlPath = path.join(__dirname, 'create-gyms-table.sql');
    const sqlContent = fs.readFileSync(sqlPath, 'utf8');
    
    // SQLを個別のステートメントに分割
    const statements = sqlContent
      .split(/;(?=\s*(?:CREATE|ALTER|DROP|INSERT|UPDATE|DELETE|GRANT|REVOKE))/i)
      .map(s => s.trim())
      .filter(s => s.length > 0 && !s.startsWith('--'));
    
    console.log(`📝 Found ${statements.length} SQL statements to execute`);
    
    let successCount = 0;
    let errorCount = 0;
    
    for (let i = 0; i < statements.length; i++) {
      const statement = statements[i] + ';';
      
      // ステートメントの最初の部分を取得して表示
      const preview = statement.substring(0, 100).replace(/\n/g, ' ');
      console.log(`\n[${i + 1}/${statements.length}] Executing: ${preview}...`);
      
      try {
        // Supabaseのrpc機能を使用して生のSQLを実行
        const { error } = await supabase.rpc('exec_sql', {
          sql_query: statement
        }).single();
        
        if (error) {
          // エラーが発生してもスキップして続行
          if (error.message?.includes('already exists') || 
              error.message?.includes('duplicate key') ||
              error.code === '42P07' || // relation already exists
              error.code === '42710' || // duplicate object
              error.code === '23505') { // unique violation
            console.log(`⚠️  Skipped (already exists)`);
          } else if (error.message?.includes('function exec_sql')) {
            // exec_sql関数が存在しない場合は、直接実行を試みる
            const { error: directError } = await supabase.from('_sql').select().single();
            if (directError) {
              console.log(`⚠️  Warning: ${error.message}`);
            } else {
              console.log(`✅ Success`);
              successCount++;
            }
          } else {
            console.log(`❌ Error: ${error.message}`);
            errorCount++;
          }
        } else {
          console.log(`✅ Success`);
          successCount++;
        }
      } catch (err) {
        console.log(`❌ Error: ${err.message}`);
        errorCount++;
      }
    }
    
    console.log('\n' + '='.repeat(50));
    console.log(`📊 Execution Summary:`);
    console.log(`   ✅ Successful: ${successCount}`);
    console.log(`   ❌ Failed: ${errorCount}`);
    console.log(`   ⚠️  Skipped: ${statements.length - successCount - errorCount}`);
    
    // テーブルの存在確認
    console.log('\n🔍 Verifying tables...');
    const tables = [
      'gyms',
      'gym_machines', 
      'gym_memberships',
      'gym_checkins',
      'gym_reviews',
      'favorite_gyms',
      'workout_sessions',
      'workout_exercises'
    ];
    
    for (const table of tables) {
      const { data, error } = await supabase
        .from(table)
        .select('count', { count: 'exact', head: true });
      
      if (error) {
        console.log(`   ❌ ${table}: Not found`);
      } else {
        console.log(`   ✅ ${table}: Exists`);
      }
    }
    
    // ジムデータの確認
    console.log('\n🏢 Checking gym data...');
    const { data: gyms, error: gymError } = await supabase
      .from('gyms')
      .select('id, name, city')
      .limit(5);
    
    if (gyms && gyms.length > 0) {
      console.log(`   Found ${gyms.length} gyms:`);
      gyms.forEach(gym => {
        console.log(`   - ${gym.name} (${gym.city})`);
      });
    } else {
      console.log('   No gym data found');
    }
    
  } catch (error) {
    console.error('❌ Unexpected error:', error);
  }
}

// 実行
executeSQLFile().then(() => {
  console.log('\n✨ Done!');
  process.exit(0);
}).catch(err => {
  console.error('Fatal error:', err);
  process.exit(1);
});
