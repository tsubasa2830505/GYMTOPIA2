const { createClient } = require('@supabase/supabase-js');

const supabaseUrl = 'https://htytewqvkgwyuvcsvjwm.supabase.co';
const supabaseServiceKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc1NzEzNDI0NiwiZXhwIjoyMDcyNzEwMjQ2fQ.VVNIX12yaN7t3seEzRwbMRtmNEbHoEkPXYeBzt60JBs';

const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function applyMigration() {
  console.log('GPS認証フィールドの追加を開始...');

  try {
    // 1. テーブルにカラムを追加
    const { error: alterError } = await supabase.rpc('exec_sql', {
      sql: `
        ALTER TABLE gym_posts
        ADD COLUMN IF NOT EXISTS is_verified BOOLEAN DEFAULT false,
        ADD COLUMN IF NOT EXISTS checkin_id UUID REFERENCES gym_checkins(id) ON DELETE SET NULL,
        ADD COLUMN IF NOT EXISTS verification_method TEXT CHECK (verification_method IN ('check_in', 'manual', NULL)),
        ADD COLUMN IF NOT EXISTS distance_from_gym INTEGER;
      `
    });

    if (alterError) {
      console.error('テーブル変更エラー:', alterError);
      // エラーが発生しても続行（既にカラムが存在する可能性があるため）
    } else {
      console.log('✅ テーブルカラム追加完了');
    }

    // 2. インデックスを追加
    const { error: indexError1 } = await supabase.rpc('exec_sql', {
      sql: `CREATE INDEX IF NOT EXISTS idx_gym_posts_is_verified ON gym_posts(is_verified);`
    });

    const { error: indexError2 } = await supabase.rpc('exec_sql', {
      sql: `CREATE INDEX IF NOT EXISTS idx_gym_posts_checkin_id ON gym_posts(checkin_id);`
    });

    if (!indexError1 && !indexError2) {
      console.log('✅ インデックス追加完了');
    }

    // 3. ビューを再作成
    const { error: viewError } = await supabase.rpc('exec_sql', {
      sql: `
        CREATE OR REPLACE VIEW gym_posts_with_counts AS
        SELECT
          gp.*,
          gp.is_verified,
          gp.checkin_id,
          gp.verification_method,
          gp.distance_from_gym,
          COALESCE(lc.count, 0) AS likes_count_live,
          COALESCE(cc.count, 0) AS comments_count_live
        FROM gym_posts gp
        LEFT JOIN (
          SELECT post_id, COUNT(*) as count
          FROM post_likes
          GROUP BY post_id
        ) lc ON gp.id = lc.post_id
        LEFT JOIN (
          SELECT post_id, COUNT(*) as count
          FROM post_comments
          GROUP BY post_id
        ) cc ON gp.id = cc.post_id;
      `
    });

    if (!viewError) {
      console.log('✅ ビュー再作成完了');
    }

    // 4. 既存のチェックイン投稿を更新
    const { error: updateError } = await supabase.rpc('exec_sql', {
      sql: `
        UPDATE gym_posts gp
        SET
          is_verified = true,
          verification_method = 'check_in'
        FROM gym_checkins gc
        WHERE gp.user_id = gc.user_id
          AND gp.gym_id = gc.gym_id
          AND gp.created_at BETWEEN gc.check_in_time AND gc.check_in_time + interval '4 hours'
          AND gp.is_verified IS NULL;
      `
    });

    if (!updateError) {
      console.log('✅ 既存投稿の更新完了');
    }

    console.log('🎉 GPS認証フィールドの追加が完了しました！');

  } catch (error) {
    console.error('マイグレーションエラー:', error);
  }
}

applyMigration();