#!/usr/bin/env node

/**
 * ジムトピア - 網羅的テストスクリプト
 * 全ページと主要機能をテストします
 */

const http = require('http');
const https = require('https');

// テスト対象のベースURL
const BASE_URL = 'http://localhost:3001';

// テスト結果を格納
const testResults = {
  passed: [],
  failed: [],
  warnings: []
};

// 色付きコンソール出力
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  magenta: '\x1b[35m'
};

// テスト対象のページ
const pages = [
  { path: '/', name: 'ホームページ', expectedStatus: 200 },
  { path: '/feed', name: 'フィードページ', expectedStatus: 200 },
  { path: '/profile', name: 'プロフィールページ', expectedStatus: 200 },
  { path: '/search', name: '検索ページ', expectedStatus: 200 },
  { path: '/search/results', name: '検索結果ページ', expectedStatus: 200 },
  { path: '/gym-stats', name: 'ジム統計ページ', expectedStatus: 200 },
  { path: '/gym-friends', name: 'ジム友達ページ', expectedStatus: 200 },
  { path: '/following', name: 'フォロー中ページ', expectedStatus: 200 },
  { path: '/followers', name: 'フォロワーページ', expectedStatus: 200 },
  { path: '/add', name: '投稿追加ページ', expectedStatus: 200 },
  { path: '/nonexistent', name: '404ページテスト', expectedStatus: 404 }
];

// HTTPリクエストを送信
function makeRequest(path) {
  return new Promise((resolve, reject) => {
    const url = `${BASE_URL}${path}`;
    http.get(url, (res) => {
      let data = '';
      res.on('data', (chunk) => {
        data += chunk;
      });
      res.on('end', () => {
        resolve({
          statusCode: res.statusCode,
          headers: res.headers,
          body: data,
          size: data.length
        });
      });
    }).on('error', (err) => {
      reject(err);
    });
  });
}

// ページテスト
async function testPage(page) {
  console.log(`\n${colors.blue}テスト中:${colors.reset} ${page.name} (${page.path})`);

  try {
    const startTime = Date.now();
    const response = await makeRequest(page.path);
    const responseTime = Date.now() - startTime;

    // ステータスコードチェック
    if (response.statusCode === page.expectedStatus) {
      console.log(`  ${colors.green}✓${colors.reset} ステータスコード: ${response.statusCode}`);
      testResults.passed.push(`${page.name}: ステータスOK`);
    } else {
      console.log(`  ${colors.red}✗${colors.reset} ステータスコード: ${response.statusCode} (期待値: ${page.expectedStatus})`);
      testResults.failed.push(`${page.name}: ステータスエラー (${response.statusCode})`);
    }

    // レスポンスタイムチェック
    if (responseTime < 1000) {
      console.log(`  ${colors.green}✓${colors.reset} レスポンスタイム: ${responseTime}ms`);
    } else if (responseTime < 3000) {
      console.log(`  ${colors.yellow}⚠${colors.reset} レスポンスタイム: ${responseTime}ms (遅い)`);
      testResults.warnings.push(`${page.name}: レスポンスが遅い (${responseTime}ms)`);
    } else {
      console.log(`  ${colors.red}✗${colors.reset} レスポンスタイム: ${responseTime}ms (非常に遅い)`);
      testResults.failed.push(`${page.name}: レスポンスタイムアウト (${responseTime}ms)`);
    }

    // コンテンツサイズチェック
    console.log(`  ${colors.blue}ℹ${colors.reset} コンテンツサイズ: ${(response.size / 1024).toFixed(2)}KB`);

    // HTMLコンテンツチェック
    if (response.statusCode === 200) {
      if (response.body.includes('<!DOCTYPE html>') || response.body.includes('<html')) {
        console.log(`  ${colors.green}✓${colors.reset} HTMLコンテンツ検出`);
      } else if (response.body.includes('Internal Server Error')) {
        console.log(`  ${colors.red}✗${colors.reset} Internal Server Error検出`);
        testResults.failed.push(`${page.name}: Internal Server Error`);
      }
    }

  } catch (error) {
    console.log(`  ${colors.red}✗${colors.reset} エラー: ${error.message}`);
    testResults.failed.push(`${page.name}: ${error.message}`);
  }
}

// Supabase接続テスト
async function testSupabaseConnection() {
  console.log(`\n${colors.magenta}=== Supabase接続テスト ===${colors.reset}`);

  try {
    // 環境変数チェック
    const envPath = require('path').join(__dirname, '../.env.local');
    const fs = require('fs');

    if (fs.existsSync(envPath)) {
      console.log(`  ${colors.green}✓${colors.reset} 環境変数ファイル存在`);
      testResults.passed.push('環境変数ファイル: OK');
    } else {
      console.log(`  ${colors.yellow}⚠${colors.reset} 環境変数ファイルが見つかりません`);
      testResults.warnings.push('環境変数ファイル: 未検出');
    }
  } catch (error) {
    console.log(`  ${colors.red}✗${colors.reset} 環境変数チェックエラー: ${error.message}`);
  }
}

// パフォーマンステスト
async function performanceTest() {
  console.log(`\n${colors.magenta}=== パフォーマンステスト ===${colors.reset}`);

  const requests = 10;
  const startTime = Date.now();
  const promises = [];

  for (let i = 0; i < requests; i++) {
    promises.push(makeRequest('/'));
  }

  try {
    await Promise.all(promises);
    const totalTime = Date.now() - startTime;
    const avgTime = totalTime / requests;

    console.log(`  ${colors.blue}ℹ${colors.reset} ${requests}リクエストの合計時間: ${totalTime}ms`);
    console.log(`  ${colors.blue}ℹ${colors.reset} 平均レスポンスタイム: ${avgTime.toFixed(2)}ms`);

    if (avgTime < 500) {
      console.log(`  ${colors.green}✓${colors.reset} パフォーマンス: 優秀`);
      testResults.passed.push('パフォーマンス: 優秀');
    } else if (avgTime < 1000) {
      console.log(`  ${colors.yellow}⚠${colors.reset} パフォーマンス: 普通`);
      testResults.warnings.push('パフォーマンス: 改善の余地あり');
    } else {
      console.log(`  ${colors.red}✗${colors.reset} パフォーマンス: 要改善`);
      testResults.failed.push('パフォーマンス: 要改善');
    }
  } catch (error) {
    console.log(`  ${colors.red}✗${colors.reset} パフォーマンステストエラー: ${error.message}`);
  }
}

// メインテスト実行
async function runTests() {
  console.log(`${colors.magenta}========================================`);
  console.log(`     ジムトピア - 網羅的テスト`);
  console.log(`========================================${colors.reset}`);
  console.log(`\nテスト開始時刻: ${new Date().toLocaleString('ja-JP')}`);
  console.log(`ベースURL: ${BASE_URL}`);

  // サーバー起動確認
  console.log(`\n${colors.blue}サーバー接続確認中...${colors.reset}`);
  try {
    await makeRequest('/');
    console.log(`${colors.green}✓ サーバーは稼働中です${colors.reset}`);
  } catch (error) {
    console.log(`${colors.red}✗ サーバーに接続できません。`);
    console.log(`  npm run dev でサーバーを起動してください。${colors.reset}`);
    process.exit(1);
  }

  // 各種テスト実行
  console.log(`\n${colors.magenta}=== ページアクセステスト ===${colors.reset}`);
  for (const page of pages) {
    await testPage(page);
  }

  await testSupabaseConnection();
  await performanceTest();

  // テスト結果サマリー
  console.log(`\n${colors.magenta}========================================`);
  console.log(`           テスト結果サマリー`);
  console.log(`========================================${colors.reset}`);

  console.log(`\n${colors.green}✓ 成功: ${testResults.passed.length}項目${colors.reset}`);
  testResults.passed.forEach(item => {
    console.log(`  - ${item}`);
  });

  if (testResults.warnings.length > 0) {
    console.log(`\n${colors.yellow}⚠ 警告: ${testResults.warnings.length}項目${colors.reset}`);
    testResults.warnings.forEach(item => {
      console.log(`  - ${item}`);
    });
  }

  if (testResults.failed.length > 0) {
    console.log(`\n${colors.red}✗ 失敗: ${testResults.failed.length}項目${colors.reset}`);
    testResults.failed.forEach(item => {
      console.log(`  - ${item}`);
    });
  }

  // 総合評価
  console.log(`\n${colors.magenta}=== 総合評価 ===${colors.reset}`);
  const successRate = (testResults.passed.length / (testResults.passed.length + testResults.failed.length)) * 100;

  if (successRate === 100) {
    console.log(`${colors.green}🎉 すべてのテストに合格しました！${colors.reset}`);
  } else if (successRate >= 80) {
    console.log(`${colors.green}✓ テスト成功率: ${successRate.toFixed(1)}% - 良好${colors.reset}`);
  } else if (successRate >= 60) {
    console.log(`${colors.yellow}⚠ テスト成功率: ${successRate.toFixed(1)}% - 改善が必要${colors.reset}`);
  } else {
    console.log(`${colors.red}✗ テスト成功率: ${successRate.toFixed(1)}% - 重大な問題があります${colors.reset}`);
  }

  console.log(`\nテスト完了時刻: ${new Date().toLocaleString('ja-JP')}`);

  // Exit code
  process.exit(testResults.failed.length > 0 ? 1 : 0);
}

// テスト実行
runTests().catch(error => {
  console.error(`${colors.red}テスト実行エラー: ${error.message}${colors.reset}`);
  process.exit(1);
});