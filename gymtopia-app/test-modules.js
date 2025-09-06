const fs = require('fs');
const path = require('path');

// モジュール単位テストスクリプト
console.log('🔧 GYMTOPIA モジュール単位テスト開始...\n');

// 1. 全てのTypeScriptファイルをスキャン
function scanFiles(dir, fileList = []) {
  const files = fs.readdirSync(dir);
  
  files.forEach(file => {
    const filePath = path.join(dir, file);
    const stat = fs.statSync(filePath);
    
    if (stat.isDirectory() && !file.startsWith('.') && !file.includes('node_modules')) {
      scanFiles(filePath, fileList);
    } else if (file.endsWith('.ts') || file.endsWith('.tsx')) {
      fileList.push(filePath);
    }
  });
  
  return fileList;
}

// 2. インポート依存関係チェック
function checkImports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const imports = [];
    const importRegex = /import.*?from\s+['"](.+?)['"]/g;
    let match;
    
    while ((match = importRegex.exec(content)) !== null) {
      imports.push(match[1]);
    }
    
    return imports;
  } catch (error) {
    return [];
  }
}

// 3. エクスポート関数チェック
function checkExports(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const exports = [];
    
    // export function
    const functionRegex = /export\s+(async\s+)?function\s+(\w+)/g;
    let match;
    while ((match = functionRegex.exec(content)) !== null) {
      exports.push({ type: 'function', name: match[2] });
    }
    
    // export const
    const constRegex = /export\s+const\s+(\w+)/g;
    while ((match = constRegex.exec(content)) !== null) {
      exports.push({ type: 'const', name: match[1] });
    }
    
    // export interface
    const interfaceRegex = /export\s+interface\s+(\w+)/g;
    while ((match = interfaceRegex.exec(content)) !== null) {
      exports.push({ type: 'interface', name: match[1] });
    }
    
    // export type
    const typeRegex = /export\s+type\s+(\w+)/g;
    while ((match = typeRegex.exec(content)) !== null) {
      exports.push({ type: 'type', name: match[1] });
    }
    
    // default export
    if (content.includes('export default')) {
      exports.push({ type: 'default', name: 'default' });
    }
    
    return exports;
  } catch (error) {
    return [];
  }
}

// 4. コンポーネント分析
function analyzeComponent(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const analysis = {
      isReactComponent: false,
      hooks: [],
      props: null,
      hasError: false
    };
    
    // React コンポーネントかチェック
    if (content.includes('import React') || content.includes('from "react"') || content.includes('from \'react\'')) {
      analysis.isReactComponent = true;
    }
    
    // フック使用チェック
    const hookMatches = content.match(/use\w+/g);
    if (hookMatches) {
      analysis.hooks = [...new Set(hookMatches)];
    }
    
    return analysis;
  } catch (error) {
    return { hasError: true, error: error.message };
  }
}

// 5. メイン実行
async function runModuleTests() {
  const srcDir = './src';
  const allFiles = scanFiles(srcDir);
  
  console.log(`📁 スキャン完了: ${allFiles.length} ファイル発見\n`);
  
  const results = {
    totalFiles: allFiles.length,
    components: 0,
    libModules: 0,
    apiRoutes: 0,
    issues: [],
    modules: []
  };
  
  // カテゴリ別分析
  const categories = {
    components: allFiles.filter(f => f.includes('/components/')),
    pages: allFiles.filter(f => f.includes('/app/') && f.endsWith('page.tsx')),
    lib: allFiles.filter(f => f.includes('/lib/')),
    api: allFiles.filter(f => f.includes('/api/'))
  };
  
  console.log('📊 ファイル分類:');
  console.log(`  • コンポーネント: ${categories.components.length}`);
  console.log(`  • ページ: ${categories.pages.length}`);
  console.log(`  • ライブラリ: ${categories.lib.length}`);
  console.log(`  • API: ${categories.api.length}\n`);
  
  // 各カテゴリをテスト
  for (const [category, files] of Object.entries(categories)) {
    if (files.length === 0) continue;
    
    console.log(`🔍 ${category.toUpperCase()} モジュールテスト:`);
    
    for (const file of files) {
      const relativePath = path.relative(process.cwd(), file);
      const imports = checkImports(file);
      const exports = checkExports(file);
      const analysis = analyzeComponent(file);
      
      const moduleInfo = {
        path: relativePath,
        category,
        imports: imports.length,
        exports: exports.length,
        analysis
      };
      
      results.modules.push(moduleInfo);
      
      // 結果表示
      let status = '✅';
      let issues = [];
      
      if (analysis.hasError) {
        status = '❌';
        issues.push('読み込みエラー');
      }
      
      if (imports.length === 0 && category !== 'api') {
        issues.push('インポートなし');
      }
      
      if (exports.length === 0) {
        issues.push('エクスポートなし');
        status = '⚠️';
      }
      
      console.log(`  ${status} ${relativePath}`);
      console.log(`     インポート: ${imports.length}, エクスポート: ${exports.length}`);
      
      if (analysis.isReactComponent) {
        console.log(`     React コンポーネント (hooks: ${analysis.hooks.join(', ') || 'なし'})`);
      }
      
      if (issues.length > 0) {
        console.log(`     問題: ${issues.join(', ')}`);
        results.issues.push({ file: relativePath, issues });
      }
      
      console.log('');
    }
  }
  
  // 依存関係グラフ生成
  console.log('🔗 依存関係分析:');
  const dependencyMap = new Map();
  
  allFiles.forEach(file => {
    const relativePath = path.relative(process.cwd(), file);
    const imports = checkImports(file);
    const localImports = imports.filter(imp => imp.startsWith('./') || imp.startsWith('../') || imp.startsWith('@/'));
    dependencyMap.set(relativePath, localImports);
  });
  
  // 循環依存チェック
  const visited = new Set();
  const recursionStack = new Set();
  
  function hasCycle(node, path = []) {
    if (recursionStack.has(node)) {
      console.log(`  🔄 循環依存発見: ${path.join(' → ')} → ${node}`);
      return true;
    }
    
    if (visited.has(node)) return false;
    
    visited.add(node);
    recursionStack.add(node);
    
    const dependencies = dependencyMap.get(node) || [];
    
    for (const dep of dependencies) {
      // 相対パスを絶対パスに変換
      let depPath;
      if (dep.startsWith('@/')) {
        depPath = dep.replace('@/', 'src/');
      } else {
        const dir = path.dirname(node);
        depPath = path.normalize(path.join(dir, dep));
      }
      
      // 拡張子追加
      if (!depPath.endsWith('.ts') && !depPath.endsWith('.tsx')) {
        if (fs.existsSync(depPath + '.ts')) depPath += '.ts';
        else if (fs.existsSync(depPath + '.tsx')) depPath += '.tsx';
        else if (fs.existsSync(depPath + '/index.ts')) depPath += '/index.ts';
        else if (fs.existsSync(depPath + '/index.tsx')) depPath += '/index.tsx';
      }
      
      if (dependencyMap.has(depPath)) {
        if (hasCycle(depPath, [...path, node])) return true;
      }
    }
    
    recursionStack.delete(node);
    return false;
  }
  
  let cyclesFound = false;
  for (const file of dependencyMap.keys()) {
    if (!visited.has(file)) {
      if (hasCycle(file)) {
        cyclesFound = true;
      }
    }
  }
  
  if (!cyclesFound) {
    console.log('  ✅ 循環依存は見つかりませんでした');
  }
  
  // 最終レポート
  console.log('\n' + '='.repeat(60));
  console.log('📋 モジュール単位テスト結果');
  console.log('='.repeat(60));
  
  console.log(`\n📊 統計:`);
  console.log(`  • 総ファイル数: ${results.totalFiles}`);
  console.log(`  • コンポーネント: ${categories.components.length}`);
  console.log(`  • ページ: ${categories.pages.length}`);
  console.log(`  • ライブラリ: ${categories.lib.length}`);
  console.log(`  • API: ${categories.api.length}`);
  
  if (results.issues.length > 0) {
    console.log(`\n⚠️  問題のあるファイル: ${results.issues.length}`);
    results.issues.forEach(issue => {
      console.log(`  • ${issue.file}: ${issue.issues.join(', ')}`);
    });
  } else {
    console.log(`\n✅ 全モジュールが正常です`);
  }
  
  // 主要モジュールの詳細
  console.log(`\n🔍 主要モジュール:`);
  const keyModules = results.modules.filter(m => 
    m.path.includes('supabase') || 
    m.path.includes('auth') ||
    m.path.includes('gyms') ||
    m.path.includes('posts') ||
    m.path.includes('workouts')
  );
  
  keyModules.forEach(mod => {
    console.log(`  • ${mod.path} (${mod.imports} imports, ${mod.exports} exports)`);
  });
  
  return results;
}

runModuleTests().catch(console.error);