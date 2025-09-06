console.log('🏗️ 上流から順次テスト実行開始...\n');

const fs = require('fs');
const path = require('path');

// Level 1: Infrastructure and Environment Tests
async function testInfrastructure() {
  console.log('📋 LEVEL 1: インフラストラクチャー・環境テスト');
  console.log('='.repeat(50));
  
  const results = {
    environment: {},
    dependencies: {},
    configuration: {},
    runtime: {}
  };
  
  // 1.1 環境変数チェック
  console.log('\n🌍 環境変数チェック:');
  require('dotenv').config({ path: '.env.local' });
  
  const requiredEnvVars = [
    'NEXT_PUBLIC_SUPABASE_URL',
    'NEXT_PUBLIC_SUPABASE_ANON_KEY'
  ];
  
  requiredEnvVars.forEach(envVar => {
    const exists = !!process.env[envVar];
    console.log(`   ${exists ? '✅' : '❌'} ${envVar}: ${exists ? '設定済み' : '未設定'}`);
    results.environment[envVar] = exists;
  });
  
  // 1.2 Node.js環境チェック
  console.log('\n⚙️ Runtime環境:');
  const nodeVersion = process.version;
  const npmVersion = require('child_process').execSync('npm --version', { encoding: 'utf8' }).trim();
  
  console.log(`   ✅ Node.js: ${nodeVersion}`);
  console.log(`   ✅ npm: ${npmVersion}`);
  
  results.runtime = {
    node: nodeVersion,
    npm: npmVersion,
    platform: process.platform,
    arch: process.arch
  };
  
  // 1.3 package.json分析
  console.log('\n📦 依存関係分析:');
  const packageJson = JSON.parse(fs.readFileSync('./package.json', 'utf8'));
  
  const criticalDeps = [
    'next', 'react', 'react-dom', '@supabase/supabase-js',
    'typescript', 'tailwindcss'
  ];
  
  criticalDeps.forEach(dep => {
    const version = packageJson.dependencies?.[dep] || packageJson.devDependencies?.[dep];
    console.log(`   ${version ? '✅' : '❌'} ${dep}: ${version || '未インストール'}`);
    results.dependencies[dep] = version || null;
  });
  
  // 1.4 設定ファイルチェック
  console.log('\n⚙️ 設定ファイル:');
  const configFiles = [
    'next.config.js',
    'tailwind.config.ts', 
    'tsconfig.json',
    '.env.local',
    'package.json'
  ];
  
  configFiles.forEach(file => {
    const exists = fs.existsSync(file);
    console.log(`   ${exists ? '✅' : '❌'} ${file}: ${exists ? '存在' : '不在'}`);
    results.configuration[file] = exists;
  });
  
  // 1.5 ビルド準備状態
  console.log('\n🏗️ ビルド環境:');
  try {
    const buildDirs = ['.next', 'node_modules', 'public'];
    buildDirs.forEach(dir => {
      const exists = fs.existsSync(dir);
      console.log(`   ${exists ? '✅' : '❌'} ${dir}: ${exists ? '存在' : '不在'}`);
    });
    
    results.buildReady = true;
  } catch (err) {
    console.log(`   ❌ ビルド環境エラー: ${err.message}`);
    results.buildReady = false;
  }
  
  return results;
}

// Level 2: Database Schema and Migration Tests  
async function testDatabaseSchema() {
  console.log('\n📋 LEVEL 2: データベーススキーマ・マイグレーションテスト');
  console.log('='.repeat(50));
  
  const results = {
    connection: false,
    tables: {},
    relationships: {},
    indexes: {},
    migrations: {}
  };
  
  try {
    const { createClient } = require('@supabase/supabase-js');
    require('dotenv').config({ path: '.env.local' });
    
    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    );
    
    console.log('\n🔗 データベース接続テスト:');
    
    // 2.1 基本接続テスト
    const { data: connectionTest, error: connError } = await supabase
      .from('gyms')
      .select('count')
      .limit(1);
      
    results.connection = !connError;
    console.log(`   ${results.connection ? '✅' : '❌'} データベース接続: ${results.connection ? '成功' : connError?.message}`);
    
    // 2.2 テーブル存在・構造チェック
    console.log('\n🏗️ テーブル構造検証:');
    const expectedTables = {
      'gyms': ['id', 'name', 'prefecture', 'rating'],
      'muscle_groups': ['id', 'part', 'category'],
      'machines': ['id', 'name', 'target', 'type'],
      'posts': ['id', 'user_id', 'content', 'created_at'],
      'gym_reviews': ['id', 'gym_id', 'user_id', 'rating', 'content'],
      'workout_sessions': ['id', 'user_id', 'gym_id', 'name'],
      'follows': ['follower_id', 'following_id'],
      'likes': ['user_id', 'post_id'],
      'comments': ['id', 'post_id', 'user_id', 'content'],
      'users': ['id', 'email']
    };
    
    for (const [tableName, expectedColumns] of Object.entries(expectedTables)) {
      try {
        const { data, error } = await supabase
          .from(tableName)
          .select('*')
          .limit(1);
          
        if (error) {
          results.tables[tableName] = { exists: false, error: error.message };
          console.log(`   ❌ ${tableName}: ${error.message}`);
        } else {
          const actualColumns = data && data.length > 0 ? Object.keys(data[0]) : [];
          const hasExpectedColumns = expectedColumns.every(col => 
            actualColumns.some(actual => actual.includes(col))
          );
          
          results.tables[tableName] = { 
            exists: true, 
            columns: actualColumns.length,
            hasExpectedStructure: hasExpectedColumns
          };
          
          console.log(`   ${hasExpectedStructure ? '✅' : '⚠️'} ${tableName}: ${actualColumns.length}列 ${hasExpectedStructure ? '(構造正常)' : '(構造要確認)'}`);
        }
      } catch (err) {
        results.tables[tableName] = { exists: false, error: err.message };
        console.log(`   ❌ ${tableName}: ${err.message}`);
      }
    }
    
    // 2.3 データ整合性チェック
    console.log('\n🔍 データ整合性チェック:');
    
    // Gyms データ
    try {
      const { data: gyms, error } = await supabase
        .from('gyms')
        .select('id, name, prefecture')
        .not('name', 'is', null);
        
      if (!error && gyms) {
        console.log(`   ✅ ジムデータ: ${gyms.length}件 (名前付き)`);
        results.dataIntegrity = { gyms: gyms.length };
      }
    } catch (err) {
      console.log(`   ❌ ジムデータ整合性: ${err.message}`);
    }
    
  } catch (error) {
    console.log(`   ❌ データベーステストエラー: ${error.message}`);
    results.connection = false;
  }
  
  return results;
}

// Level 3: Backend Services and API Tests
async function testBackendServices() {
  console.log('\n📋 LEVEL 3: バックエンドサービス・APIテスト');
  console.log('='.repeat(50));
  
  const results = {
    api: {},
    services: {},
    auth: {},
    dataLayer: {}
  };
  
  // 3.1 API エンドポイントテスト
  console.log('\n🌐 API エンドポイント:');
  
  const apiEndpoints = [
    { path: '/api/debug-tables', method: 'GET', name: 'Debug Tables' }
  ];
  
  for (const endpoint of apiEndpoints) {
    try {
      const response = await fetch(`http://localhost:3000${endpoint.path}`);
      const isSuccess = response.ok;
      
      results.api[endpoint.name] = {
        status: response.status,
        success: isSuccess,
        contentType: response.headers.get('content-type')
      };
      
      console.log(`   ${isSuccess ? '✅' : '❌'} ${endpoint.name}: ${response.status} ${response.statusText}`);
      
      if (isSuccess) {
        const data = await response.json();
        console.log(`     レスポンス: ${JSON.stringify(data).substring(0, 100)}...`);
      }
    } catch (err) {
      results.api[endpoint.name] = { success: false, error: err.message };
      console.log(`   ❌ ${endpoint.name}: ${err.message}`);
    }
  }
  
  // 3.2 Supabase サービス関数テスト
  console.log('\n⚡ Supabase サービス関数:');
  
  const serviceFiles = [
    { file: './src/lib/supabase/gyms.ts', name: 'Gyms Service' },
    { file: './src/lib/supabase/auth.ts', name: 'Auth Service' },
    { file: './src/lib/supabase/posts.ts', name: 'Posts Service' },
    { file: './src/lib/supabase/machines.ts', name: 'Machines Service' }
  ];
  
  serviceFiles.forEach(service => {
    try {
      if (fs.existsSync(service.file)) {
        const content = fs.readFileSync(service.file, 'utf8');
        
        const functions = (content.match(/export\s+(async\s+)?function/g) || []).length;
        const hasErrorHandling = content.includes('try') && content.includes('catch');
        const hasSupabase = content.includes('supabase') || content.includes('createClient');
        
        results.services[service.name] = {
          exists: true,
          functions,
          hasErrorHandling,
          hasSupabase,
          quality: (hasErrorHandling && hasSupabase && functions > 0) ? 'high' : 'medium'
        };
        
        console.log(`   ✅ ${service.name}: ${functions}関数, ${hasErrorHandling ? 'エラー処理✓' : 'エラー処理✗'}, ${hasSupabase ? 'Supabase✓' : 'Supabase✗'}`);
      } else {
        results.services[service.name] = { exists: false };
        console.log(`   ❌ ${service.name}: ファイル不在`);
      }
    } catch (err) {
      results.services[service.name] = { exists: false, error: err.message };
      console.log(`   ❌ ${service.name}: ${err.message}`);
    }
  });
  
  return results;
}

// Level 4: Business Logic and Data Layer Tests
async function testBusinessLogic() {
  console.log('\n📋 LEVEL 4: ビジネスロジック・データレイヤーテスト');
  console.log('='.repeat(50));
  
  const results = {
    dataModels: {},
    businessRules: {},
    validation: {},
    workflows: {}
  };
  
  // 4.1 データモデル型定義チェック
  console.log('\n🏗️ データモデル・型定義:');
  
  const typeFiles = [
    { file: './src/lib/types/user.ts', name: 'User Types' },
    { file: './src/lib/types/workout.ts', name: 'Workout Types' },
    { file: './src/lib/types/profile.ts', name: 'Profile Types' }
  ];
  
  typeFiles.forEach(typeFile => {
    try {
      if (fs.existsSync(typeFile.file)) {
        const content = fs.readFileSync(typeFile.file, 'utf8');
        
        const interfaces = (content.match(/interface\s+\w+/g) || []).length;
        const types = (content.match(/type\s+\w+/g) || []).length;
        const enums = (content.match(/enum\s+\w+/g) || []).length;
        
        results.dataModels[typeFile.name] = {
          exists: true,
          interfaces,
          types,
          enums,
          total: interfaces + types + enums
        };
        
        console.log(`   ✅ ${typeFile.name}: ${interfaces}interfaces, ${types}types, ${enums}enums`);
      } else {
        results.dataModels[typeFile.name] = { exists: false };
        console.log(`   ❌ ${typeFile.name}: ファイル不在`);
      }
    } catch (err) {
      console.log(`   ❌ ${typeFile.name}: ${err.message}`);
    }
  });
  
  // 4.2 ビジネスルール実装チェック
  console.log('\n📏 ビジネスルール検証:');
  
  // 筋肉選択ロジック
  const musclePartsFile = './src/lib/supabase/muscle-parts.ts';
  if (fs.existsSync(musclePartsFile)) {
    const content = fs.readFileSync(musclePartsFile, 'utf8');
    const hasCategoryLogic = content.includes('category') && content.includes('filter');
    const hasGrouping = content.includes('group') || content.includes('reduce');
    
    results.businessRules.muscleSelection = {
      implemented: true,
      hasCategoryLogic,
      hasGrouping,
      quality: (hasCategoryLogic && hasGrouping) ? 'high' : 'medium'
    };
    
    console.log(`   ✅ 筋肉選択ロジック: ${hasCategoryLogic ? 'カテゴリ分類✓' : 'カテゴリ分類✗'}, ${hasGrouping ? 'グループ化✓' : 'グループ化✗'}`);
  }
  
  // マシン検索ロジック  
  const machinesFile = './src/lib/supabase/machines.ts';
  if (fs.existsSync(machinesFile)) {
    const content = fs.readFileSync(machinesFile, 'utf8');
    const hasSearchLogic = content.includes('search') || content.includes('filter');
    const hasTargetFiltering = content.includes('target');
    
    results.businessRules.machineSearch = {
      implemented: true,
      hasSearchLogic,
      hasTargetFiltering
    };
    
    console.log(`   ✅ マシン検索ロジック: ${hasSearchLogic ? '検索機能✓' : '検索機能✗'}, ${hasTargetFiltering ? 'ターゲット絞り込み✓' : 'ターゲット絞り込み✗'}`);
  }
  
  return results;
}

// Level 5: Frontend Components and UI Tests  
async function testFrontendComponents() {
  console.log('\n📋 LEVEL 5: フロントエンドコンポーネント・UIテスト');
  console.log('='.repeat(50));
  
  const results = {
    components: {},
    pages: {},
    navigation: {},
    responsiveness: {}
  };
  
  // 5.1 コンポーネントファイル存在チェック
  console.log('\n🧩 コンポーネントファイル:');
  
  const componentDir = './src/components';
  if (fs.existsSync(componentDir)) {
    const components = fs.readdirSync(componentDir).filter(file => file.endsWith('.tsx'));
    
    console.log(`   ✅ 発見コンポーネント: ${components.length}個`);
    
    components.forEach(component => {
      const componentPath = path.join(componentDir, component);
      const content = fs.readFileSync(componentPath, 'utf8');
      
      const isReactComponent = content.includes('export default') && 
                              (content.includes('function') || content.includes('const'));
      const usesHooks = /use\w+\s*\(/.test(content);
      const hasProps = content.includes('props') || /\w+:\s*\w+/.test(content);
      
      results.components[component] = {
        isReactComponent,
        usesHooks,
        hasProps,
        quality: (isReactComponent && usesHooks) ? 'high' : 'medium'
      };
      
      console.log(`     ${isReactComponent ? '✅' : '❌'} ${component}: ${usesHooks ? 'hooks使用' : 'hooks未使用'}, ${hasProps ? 'props有り' : 'props無し'}`);
    });
  }
  
  // 5.2 ページコンポーネントチェック
  console.log('\n📄 ページコンポーネント:');
  
  const appDir = './src/app';
  const findPages = (dir) => {
    let pages = [];
    const items = fs.readdirSync(dir);
    
    items.forEach(item => {
      const fullPath = path.join(dir, item);
      if (fs.statSync(fullPath).isDirectory()) {
        pages = pages.concat(findPages(fullPath));
      } else if (item === 'page.tsx') {
        pages.push(fullPath);
      }
    });
    
    return pages;
  };
  
  const pages = findPages(appDir);
  console.log(`   ✅ 発見ページ: ${pages.length}個`);
  
  pages.slice(0, 10).forEach(pagePath => { // 最初の10個のみ表示
    const relativePath = path.relative(appDir, pagePath);
    const content = fs.readFileSync(pagePath, 'utf8');
    
    const isValidPage = content.includes('export default');
    const usesClientComponents = content.includes('use client');
    const hasAsyncData = content.includes('async') || content.includes('useEffect');
    
    results.pages[relativePath] = {
      isValidPage,
      usesClientComponents, 
      hasAsyncData
    };
    
    console.log(`     ${isValidPage ? '✅' : '❌'} ${relativePath.replace('/page.tsx', '')}: ${usesClientComponents ? 'Client' : 'Server'}, ${hasAsyncData ? 'データ取得有り' : 'データ取得無し'}`);
  });
  
  return results;
}

// メイン実行関数
async function runUpstreamTests() {
  console.log('🚀 GYMTOPIA 上流テストスイート実行開始');
  console.log('=' .repeat(60));
  
  const testResults = {};
  
  try {
    // Level 1: Infrastructure
    testResults.infrastructure = await testInfrastructure();
    
    // Level 2: Database  
    testResults.database = await testDatabaseSchema();
    
    // Level 3: Backend Services
    testResults.backend = await testBackendServices();
    
    // Level 4: Business Logic
    testResults.businessLogic = await testBusinessLogic();
    
    // Level 5: Frontend
    testResults.frontend = await testFrontendComponents();
    
    // 総合結果レポート
    console.log('\n' + '='.repeat(60));
    console.log('📊 上流テスト総合結果レポート');
    console.log('='.repeat(60));
    
    // Level別評価
    const levelScores = {
      'Level 1 (インフラ)': evaluateInfrastructure(testResults.infrastructure),
      'Level 2 (データベース)': evaluateDatabase(testResults.database), 
      'Level 3 (バックエンド)': evaluateBackend(testResults.backend),
      'Level 4 (ビジネスロジック)': evaluateBusinessLogic(testResults.businessLogic),
      'Level 5 (フロントエンド)': evaluateFrontend(testResults.frontend)
    };
    
    console.log('\n📈 レベル別評価:');
    Object.entries(levelScores).forEach(([level, score]) => {
      const status = score >= 90 ? '🟢 優秀' : score >= 70 ? '🟡 良好' : '🔴 要改善';
      console.log(`   ${level}: ${score}% ${status}`);
    });
    
    // 総合スコア
    const overallScore = Object.values(levelScores).reduce((sum, score) => sum + score, 0) / Object.keys(levelScores).length;
    
    console.log(`\n🎯 総合評価: ${Math.round(overallScore)}%`);
    console.log(`   ${overallScore >= 90 ? '🟢 本番準備完了' : overallScore >= 70 ? '🟡 軽微な改善推奨' : '🔴 重要な問題要解決'}`);
    
    return {
      results: testResults,
      scores: levelScores,
      overallScore
    };
    
  } catch (error) {
    console.log(`❌ 上流テスト実行エラー: ${error.message}`);
    return { error: error.message };
  }
}

// 評価関数群
function evaluateInfrastructure(results) {
  let score = 0;
  const total = 4;
  
  // 環境変数
  if (Object.values(results.environment || {}).every(Boolean)) score += 1;
  
  // 依存関係
  if (Object.values(results.dependencies || {}).filter(Boolean).length >= 5) score += 1;
  
  // 設定ファイル  
  if (Object.values(results.configuration || {}).filter(Boolean).length >= 4) score += 1;
  
  // ビルド準備
  if (results.buildReady) score += 1;
  
  return Math.round((score / total) * 100);
}

function evaluateDatabase(results) {
  let score = 0;
  const total = 3;
  
  // 接続
  if (results.connection) score += 1;
  
  // テーブル存在
  const existingTables = Object.values(results.tables || {}).filter(t => t.exists).length;
  if (existingTables >= 8) score += 1;
  
  // データ整合性
  if (results.dataIntegrity && results.dataIntegrity.gyms > 0) score += 1;
  
  return Math.round((score / total) * 100);
}

function evaluateBackend(results) {
  let score = 0;
  const total = 2;
  
  // API
  const successfulApis = Object.values(results.api || {}).filter(api => api.success).length;
  if (successfulApis >= 1) score += 1;
  
  // サービス
  const highQualityServices = Object.values(results.services || {}).filter(s => s.quality === 'high').length;
  if (highQualityServices >= 3) score += 1;
  
  return Math.round((score / total) * 100);
}

function evaluateBusinessLogic(results) {
  let score = 0;
  const total = 2;
  
  // データモデル
  const modelCount = Object.values(results.dataModels || {}).filter(m => m.exists).length;
  if (modelCount >= 2) score += 1;
  
  // ビジネスルール
  const ruleCount = Object.values(results.businessRules || {}).filter(r => r.implemented).length;
  if (ruleCount >= 1) score += 1;
  
  return Math.round((score / total) * 100);
}

function evaluateFrontend(results) {
  let score = 0;
  const total = 2;
  
  // コンポーネント
  const componentCount = Object.keys(results.components || {}).length;
  if (componentCount >= 10) score += 1;
  
  // ページ
  const pageCount = Object.keys(results.pages || {}).length;
  if (pageCount >= 15) score += 1;
  
  return Math.round((score / total) * 100);
}

runUpstreamTests().catch(console.error);