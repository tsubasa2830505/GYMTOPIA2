/**
 * チェックインテーブル作成スクリプト
 */

const { createClient } = require('@supabase/supabase-js');

// Supabase設定
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://htytewqvkgwyuvcsvjwm.supabase.co';
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEzNDI0NiwiZXhwIjoyMDcyNzEwMjQ2fQ.VVNIX12yaN7t3seEzRwbMRtmNEbHoEkPXYeBzt60JBs';

const supabase = createClient(supabaseUrl, supabaseServiceKey, {
  auth: {
    autoRefreshToken: false,
    persistSession: false
  }
});

async function createCheckInsTable() {
  console.log('🚀 チェックインテーブルの作成を開始します...\n');

  try {
    // テーブルを作成
    const createTableQuery = `
      -- チェックインテーブルの作成
      CREATE TABLE IF NOT EXISTS check_ins (
        id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
        user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
        gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
        checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
        note TEXT,
        latitude DOUBLE PRECISION,
        longitude DOUBLE PRECISION,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
      );
    `;

    console.log('📝 テーブルを作成中...');
    const { error: createError } = await supabase.rpc('exec_sql', {
      sql: createTableQuery
    }).single();

    if (createError && !createError.message?.includes('already exists')) {
      console.log('⚠️ テーブル作成時の警告（既存の場合は無視）:', createError);
    }

    // インデックスを作成
    const createIndexQueries = [
      'CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);',
      'CREATE INDEX IF NOT EXISTS idx_check_ins_gym_id ON check_ins(gym_id);',
      'CREATE INDEX IF NOT EXISTS idx_check_ins_checked_in_at ON check_ins(checked_in_at DESC);'
    ];

    console.log('🔍 インデックスを作成中...');
    for (const query of createIndexQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query }).single();
      if (error && !error.message?.includes('already exists')) {
        console.log('⚠️ インデックス作成時の警告:', error);
      }
    }

    // RLSを有効化
    console.log('🔐 RLSポリシーを設定中...');
    const rlsQueries = [
      'ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;',
      'DROP POLICY IF EXISTS "Users can view own check-ins" ON check_ins;',
      'DROP POLICY IF EXISTS "Users can create own check-ins" ON check_ins;',
      'DROP POLICY IF EXISTS "Anyone can view public check-ins" ON check_ins;',
      `CREATE POLICY "Users can view own check-ins" ON check_ins
        FOR SELECT USING (auth.uid() = user_id);`,
      `CREATE POLICY "Users can create own check-ins" ON check_ins
        FOR INSERT WITH CHECK (auth.uid() = user_id);`,
      `CREATE POLICY "Anyone can view public check-ins" ON check_ins
        FOR SELECT USING (true);`
    ];

    for (const query of rlsQueries) {
      const { error } = await supabase.rpc('exec_sql', { sql: query }).single();
      if (error && !error.message?.includes('already exists')) {
        console.log('⚠️ RLS設定時の警告:', error);
      }
    }

    // テーブルの存在確認
    console.log('\n✅ テーブルの作成を確認中...');
    const { data: tables, error: checkError } = await supabase
      .from('check_ins')
      .select('id')
      .limit(1);

    if (checkError && !checkError.message?.includes('no rows')) {
      // 直接SQLで作成を試みる
      console.log('⚠️ Supabase RPCが利用できない場合、直接作成を試みます...');

      // テーブルが存在するかチェック
      const { error: testError } = await supabase
        .from('check_ins')
        .select('*')
        .limit(1);

      if (testError?.message?.includes('table') || testError?.message?.includes('not found')) {
        console.log('\n❌ テーブルが作成されていません。Supabaseダッシュボードで以下のSQLを実行してください：\n');
        console.log('```sql');
        console.log(createTableQuery);
        createIndexQueries.forEach(q => console.log(q));
        rlsQueries.forEach(q => console.log(q));
        console.log('```\n');
        return;
      }
    }

    console.log('\n✨ チェックインテーブルの作成が完了しました！');
    console.log('📊 テーブル構造:');
    console.log('   - id (UUID): 主キー');
    console.log('   - user_id (UUID): ユーザーID');
    console.log('   - gym_id (UUID): ジムID');
    console.log('   - checked_in_at (TIMESTAMP): チェックイン日時');
    console.log('   - note (TEXT): メモ');
    console.log('   - latitude/longitude: 位置情報');
    console.log('   - created_at (TIMESTAMP): 作成日時');

  } catch (error) {
    console.error('❌ エラーが発生しました:', error);

    // Supabaseダッシュボード用のSQL出力
    console.log('\n📋 以下のSQLをSupabaseのSQLエディタで実行してください：\n');
    console.log('```sql');
    console.log(`-- チェックインテーブルの作成
CREATE TABLE IF NOT EXISTS check_ins (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  checked_in_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  note TEXT,
  latitude DOUBLE PRECISION,
  longitude DOUBLE PRECISION,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックスを作成
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_gym_id ON check_ins(gym_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_checked_in_at ON check_ins(checked_in_at DESC);

-- RLSポリシーを設定
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Users can view own check-ins" ON check_ins;
DROP POLICY IF EXISTS "Users can create own check-ins" ON check_ins;
DROP POLICY IF EXISTS "Anyone can view public check-ins" ON check_ins;

-- 自分のチェックインを見ることができる
CREATE POLICY "Users can view own check-ins" ON check_ins
  FOR SELECT USING (auth.uid() = user_id);

-- 自分のチェックインを作成できる
CREATE POLICY "Users can create own check-ins" ON check_ins
  FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 公開チェックイン（フィードなど）を見ることができる
CREATE POLICY "Anyone can view public check-ins" ON check_ins
  FOR SELECT USING (true);`);
    console.log('```\n');
  }
}

// スクリプトを実行
createCheckInsTable();