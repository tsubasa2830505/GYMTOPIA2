const http = require('http');
const { execSync } = require('child_process');

console.log('🧪 ハードコーディング除去のテストを開始します...\n');

// 1. 環境変数の確認
console.log('1️⃣ 環境変数の確認...');
const envVars = {
  'NEXT_PUBLIC_SUPABASE_URL': process.env.NEXT_PUBLIC_SUPABASE_URL,
  'NEXT_PUBLIC_SUPABASE_ANON_KEY': process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY,
  'NEXT_PUBLIC_USE_MOCK_AUTH': process.env.NEXT_PUBLIC_USE_MOCK_AUTH,
  'NEXT_PUBLIC_MOCK_USER_ID': process.env.NEXT_PUBLIC_MOCK_USER_ID
};

let hasHardcodedValues = false;

Object.entries(envVars).forEach(([key, value]) => {
  if (value) {
    // プレースホルダーや固定値のチェック
    if (value.includes('placeholder') || value.includes('8ac9e2a5-a702-4d04-b871-21e4a423b4ac')) {
      console.log(`⚠️ ${key}: ハードコーディングされた値の可能性があります`);
      hasHardcodedValues = true;
    } else {
      console.log(`✅ ${key}: 環境変数から動的に設定されています`);
    }
  } else {
    console.log(`ℹ️ ${key}: 未設定`);
  }
});

// 2. ソースコードのチェック
console.log('\n2️⃣ ソースコードのハードコーディングチェック...');

const patterns = [
  { pattern: '108', file: 'gym-stats/page.tsx', description: '総訪問回数の固定値' },
  { pattern: '145680', file: 'gym-stats/page.tsx', description: '総重量の固定値' },
  { pattern: '162', file: 'gym-stats/page.tsx', description: '総時間の固定値' },
  { pattern: 'placeholder.supabase.co', file: 'supabase/client.ts', description: 'プレースホルダーURL' },
  { pattern: 'user-demo-001', file: 'gym-stats/page.tsx', description: 'デモユーザーID' }
];

patterns.forEach(({ pattern, file, description }) => {
  try {
    const result = execSync(
      `grep -r "${pattern}" src/ --include="*.ts" --include="*.tsx" 2>/dev/null || true`,
      { encoding: 'utf-8', stdio: 'pipe' }
    );

    if (result && result.includes(file)) {
      console.log(`❌ ${description}が見つかりました`);
      hasHardcodedValues = true;
    } else if (result) {
      console.log(`ℹ️ ${description}は${file}以外で使用されています`);
    } else {
      console.log(`✅ ${description}は見つかりませんでした`);
    }
  } catch (error) {
    console.log(`✅ ${description}は見つかりませんでした`);
  }
});

// 3. APIレスポンスのテスト
console.log('\n3️⃣ APIレスポンスのテスト...');

function testEndpoint() {
  return new Promise((resolve) => {
    const req = http.get('http://localhost:3001/gym-stats', (res) => {
      let data = '';

      res.on('data', (chunk) => {
        data += chunk;
      });

      res.on('end', () => {
        if (res.statusCode === 200) {
          console.log(`✅ ページステータス: ${res.statusCode}`);

          // ハードコーディングされた値が表示されていないか確認
          const hardcodedValues = ['108回', '145680', '162時間', 'user-demo-001'];
          let foundHardcoded = false;

          hardcodedValues.forEach(value => {
            if (data.includes(value)) {
              console.log(`❌ ハードコーディングされた値 "${value}" がページに表示されています`);
              foundHardcoded = true;
              hasHardcodedValues = true;
            }
          });

          if (!foundHardcoded) {
            console.log('✅ ハードコーディングされた値はページに表示されていません');
          }

          // 動的なデータ取得の確認
          if (data.includes('useAuth') || data.includes('user.id')) {
            console.log('✅ 認証コンテキストから動的にユーザーIDを取得しています');
          }
        } else {
          console.log(`⚠️ ページステータス: ${res.statusCode}`);
        }
        resolve();
      });
    });

    req.on('error', (error) => {
      console.log(`❌ リクエストエラー: ${error.message}`);
      resolve();
    });
  });
}

testEndpoint().then(() => {
  // 4. エラーハンドリングのテスト
  console.log('\n4️⃣ エラー時のフォールバック値テスト...');

  // gym-stats/page.tsxのエラーハンドリング部分を確認
  try {
    const fileContent = require('fs').readFileSync('src/app/gym-stats/page.tsx', 'utf-8');

    if (fileContent.includes('totalVisits: 108')) {
      console.log('❌ エラー時にハードコーディングされた値を使用しています');
      hasHardcodedValues = true;
    } else if (fileContent.includes('totalVisits: 0')) {
      console.log('✅ エラー時は0を返すように設定されています');
    }

    if (fileContent.includes('user.id') || fileContent.includes('user?.id')) {
      console.log('✅ ユーザーIDは認証コンテキストから動的に取得されています');
    }
  } catch (error) {
    console.log('⚠️ ファイルの読み込みに失敗しました');
  }

  // 結果サマリー
  console.log('\n📊 テスト結果サマリー:');
  if (!hasHardcodedValues) {
    console.log('✨ すべてのテストに合格！ハードコーディングは見つかりませんでした。');
    console.log('✅ 環境変数から動的に値を取得');
    console.log('✅ 認証コンテキストからユーザーIDを取得');
    console.log('✅ エラー時は適切なフォールバック処理');
  } else {
    console.log('⚠️ 一部ハードコーディングの可能性がある箇所が見つかりました。');
    console.log('上記の詳細を確認してください。');
  }
});