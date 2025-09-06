console.log('🗄️ データベース接続・クエリテスト開始...\n');

// Supabaseクライアント初期化テスト
async function testDatabaseConnection() {
  try {
    const { createClient } = require('@supabase/supabase-js');
    require('dotenv').config({ path: '.env.local' });
    
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseUrl || !supabaseAnonKey) {
      throw new Error('Supabase環境変数が設定されていません');
    }
    
    const supabase = createClient(supabaseUrl, supabaseAnonKey);
    
    console.log('✅ Supabaseクライアント初期化成功');
    console.log(`   URL: ${supabaseUrl.substring(0, 30)}...`);
    
    // テーブル存在確認
    const tables = [
      'gyms', 'muscle_groups', 'machines', 'posts', 'gym_reviews',
      'workout_sessions', 'follows', 'likes', 'comments', 'users'
    ];
    
    const results = {
      connection: true,
      tables: {},
      queries: {},
      errors: []
    };
    
    console.log('\n🏗️ テーブル存在確認:');
    
    for (const table of tables) {
      try {
        const { data, error } = await supabase
          .from(table)
          .select('*')
          .limit(1);
          
        if (error) {
          results.tables[table] = { exists: false, error: error.message };
          console.log(`❌ ${table}: ${error.message}`);
        } else {
          results.tables[table] = { exists: true, count: data ? data.length : 0 };
          console.log(`✅ ${table}: 存在確認`);
        }
      } catch (err) {
        results.tables[table] = { exists: false, error: err.message };
        console.log(`❌ ${table}: ${err.message}`);
      }
    }
    
    // 基本クエリテスト
    console.log('\n🔍 基本クエリテスト:');
    
    // 1. ジム一覧取得
    try {
      const { data: gyms, error } = await supabase
        .from('gyms')
        .select('id, name, prefecture')
        .limit(5);
        
      if (error) throw error;
      
      results.queries.gyms = { success: true, count: gyms.length };
      console.log(`✅ ジム取得: ${gyms.length}件`);
      
      if (gyms.length > 0) {
        console.log(`   例: ${gyms[0].name} (${gyms[0].prefecture})`);
      }
    } catch (err) {
      results.queries.gyms = { success: false, error: err.message };
      console.log(`❌ ジム取得: ${err.message}`);
    }
    
    // 2. 筋肉グループ取得
    try {
      const { data: muscles, error } = await supabase
        .from('muscle_groups')
        .select('id, part_jp, category')
        .limit(5);
        
      if (error) throw error;
      
      results.queries.muscles = { success: true, count: muscles.length };
      console.log(`✅ 筋肉グループ取得: ${muscles.length}件`);
      
      if (muscles.length > 0) {
        console.log(`   例: ${muscles[0].part_jp} (${muscles[0].category})`);
      }
    } catch (err) {
      results.queries.muscles = { success: false, error: err.message };
      console.log(`❌ 筋肉グループ取得: ${err.message}`);
    }
    
    // 3. マシン取得
    try {
      const { data: machines, error } = await supabase
        .from('machines')
        .select('id, name, target, type')
        .limit(5);
        
      if (error) throw error;
      
      results.queries.machines = { success: true, count: machines.length };
      console.log(`✅ マシン取得: ${machines.length}件`);
      
      if (machines.length > 0) {
        console.log(`   例: ${machines[0].name} (${machines[0].target})`);
      }
    } catch (err) {
      results.queries.machines = { success: false, error: err.message };
      console.log(`❌ マシン取得: ${err.message}`);
    }
    
    // 4. 投稿取得
    try {
      const { data: posts, error } = await supabase
        .from('posts')
        .select('id, content, created_at')
        .limit(3);
        
      if (error) throw error;
      
      results.queries.posts = { success: true, count: posts.length };
      console.log(`✅ 投稿取得: ${posts.length}件`);
      
      if (posts.length > 0) {
        console.log(`   例: ${posts[0].content.substring(0, 30)}...`);
      }
    } catch (err) {
      results.queries.posts = { success: false, error: err.message };
      console.log(`❌ 投稿取得: ${err.message}`);
    }
    
    // 5. レビュー取得
    try {
      const { data: reviews, error } = await supabase
        .from('gym_reviews')
        .select('id, title, rating, gym_id')
        .limit(3);
        
      if (error) throw error;
      
      results.queries.reviews = { success: true, count: reviews.length };
      console.log(`✅ レビュー取得: ${reviews.length}件`);
      
      if (reviews.length > 0) {
        console.log(`   例: ${reviews[0].title} (${reviews[0].rating}星)`);
      }
    } catch (err) {
      results.queries.reviews = { success: false, error: err.message };
      console.log(`❌ レビュー取得: ${err.message}`);
    }
    
    // 複合クエリテスト
    console.log('\n🔗 複合クエリテスト:');
    
    // JOIN クエリ
    try {
      const { data: gymWithReviews, error } = await supabase
        .from('gyms')
        .select(`
          id, name, rating,
          gym_reviews(rating, title)
        `)
        .limit(2);
        
      if (error) throw error;
      
      results.queries.joinQuery = { success: true, count: gymWithReviews.length };
      console.log(`✅ JOIN クエリ: ${gymWithReviews.length}件`);
      
      if (gymWithReviews.length > 0 && gymWithReviews[0].gym_reviews) {
        console.log(`   例: ${gymWithReviews[0].name} (レビュー${gymWithReviews[0].gym_reviews.length}件)`);
      }
    } catch (err) {
      results.queries.joinQuery = { success: false, error: err.message };
      console.log(`❌ JOIN クエリ: ${err.message}`);
    }
    
    // 集計クエリ
    try {
      const { data: stats, error } = await supabase
        .from('gyms')
        .select('prefecture')
        .not('prefecture', 'is', null);
        
      if (error) throw error;
      
      const prefectures = stats.reduce((acc, gym) => {
        acc[gym.prefecture] = (acc[gym.prefecture] || 0) + 1;
        return acc;
      }, {});
      
      results.queries.aggregation = { success: true, prefectures: Object.keys(prefectures).length };
      console.log(`✅ 集計クエリ: ${Object.keys(prefectures).length}都道府県`);
      console.log(`   例: ${JSON.stringify(prefectures).substring(0, 50)}...`);
    } catch (err) {
      results.queries.aggregation = { success: false, error: err.message };
      console.log(`❌ 集計クエリ: ${err.message}`);
    }
    
    return results;
    
  } catch (error) {
    console.log(`❌ データベース接続失敗: ${error.message}`);
    return { connection: false, error: error.message };
  }
}

// 関数レベルテスト
async function testSupabaseFunctions() {
  console.log('\n⚡ Supabase関数テスト:');
  
  const functionsToTest = [
    { file: './src/lib/supabase/gyms.js', name: 'gyms' },
    { file: './src/lib/supabase/posts.js', name: 'posts' },
    { file: './src/lib/supabase/muscle-parts.js', name: 'muscle-parts' },
    { file: './src/lib/supabase/machines.js', name: 'machines' }
  ];
  
  const results = {};
  
  for (const func of functionsToTest) {
    try {
      const fs = require('fs');
      
      // TypeScript ファイルをチェック
      const tsFile = func.file.replace('.js', '.ts');
      if (fs.existsSync(tsFile)) {
        const content = fs.readFileSync(tsFile, 'utf8');
        
        // エクスポート関数の数をカウント
        const exportMatches = content.match(/export\s+(async\s+)?function/g) || [];
        const constExports = content.match(/export\s+const\s+\w+/g) || [];
        
        const totalExports = exportMatches.length + constExports.length;
        
        results[func.name] = {
          exists: true,
          functions: totalExports,
          hasSupabaseImport: content.includes('supabase') || content.includes('createClient'),
          hasErrorHandling: content.includes('try') && content.includes('catch')
        };
        
        console.log(`✅ ${func.name}: ${totalExports}個の関数, ${results[func.name].hasSupabaseImport ? 'Supabase✓' : 'Supabase✗'}, ${results[func.name].hasErrorHandling ? 'エラーハンドリング✓' : 'エラーハンドリング✗'}`);
      } else {
        results[func.name] = { exists: false };
        console.log(`❌ ${func.name}: ファイルが存在しません`);
      }
    } catch (err) {
      results[func.name] = { exists: false, error: err.message };
      console.log(`❌ ${func.name}: ${err.message}`);
    }
  }
  
  return results;
}

// メイン実行
async function runDatabaseTests() {
  const connectionResults = await testDatabaseConnection();
  const functionResults = await testSupabaseFunctions();
  
  console.log('\n' + '='.repeat(60));
  console.log('📋 データベーステスト結果');
  console.log('='.repeat(60));
  
  console.log(`\n🔗 接続テスト: ${connectionResults.connection ? '✅ 成功' : '❌ 失敗'}`);
  
  if (connectionResults.tables) {
    const existingTables = Object.entries(connectionResults.tables).filter(([name, info]) => info.exists);
    const missingTables = Object.entries(connectionResults.tables).filter(([name, info]) => !info.exists);
    
    console.log(`\n🏗️ テーブル: ${existingTables.length}個存在, ${missingTables.length}個不足`);
    
    if (missingTables.length > 0) {
      console.log('   不足テーブル:', missingTables.map(([name]) => name).join(', '));
    }
  }
  
  if (connectionResults.queries) {
    const successfulQueries = Object.entries(connectionResults.queries).filter(([name, info]) => info.success);
    const failedQueries = Object.entries(connectionResults.queries).filter(([name, info]) => !info.success);
    
    console.log(`\n🔍 クエリテスト: ${successfulQueries.length}個成功, ${failedQueries.length}個失敗`);
    
    if (failedQueries.length > 0) {
      console.log('   失敗クエリ:', failedQueries.map(([name]) => name).join(', '));
    }
  }
  
  console.log(`\n⚡ 関数テスト:`);
  Object.entries(functionResults).forEach(([name, info]) => {
    if (info.exists) {
      console.log(`  • ${name}: ${info.functions}関数, ${info.hasSupabaseImport ? 'DB✓' : 'DB✗'}, ${info.hasErrorHandling ? 'エラー処理✓' : 'エラー処理✗'}`);
    } else {
      console.log(`  • ${name}: ❌ 存在しない`);
    }
  });
  
  const overallSuccess = connectionResults.connection && 
    (!connectionResults.queries || Object.values(connectionResults.queries).every(q => q.success));
    
  console.log(`\n🎯 総合結果: ${overallSuccess ? '✅ すべて正常' : '⚠️ 一部に問題'}`);
  
  return {
    connection: connectionResults,
    functions: functionResults,
    success: overallSuccess
  };
}

runDatabaseTests().catch(console.error);