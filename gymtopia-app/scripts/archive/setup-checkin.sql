-- チェックインテーブルのセットアップ
-- Supabase SQLエディタで実行してください

-- 1. チェックインテーブルの作成
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

-- 2. インデックスを作成
CREATE INDEX IF NOT EXISTS idx_check_ins_user_id ON check_ins(user_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_gym_id ON check_ins(gym_id);
CREATE INDEX IF NOT EXISTS idx_check_ins_checked_in_at ON check_ins(checked_in_at DESC);

-- 3. RLSポリシーを設定
ALTER TABLE check_ins ENABLE ROW LEVEL SECURITY;

-- 既存のポリシーを削除（存在する場合）
DROP POLICY IF EXISTS "Users can view own check-ins" ON check_ins;
DROP POLICY IF EXISTS "Users can create own check-ins" ON check_ins;
DROP POLICY IF EXISTS "Anyone can view public check-ins" ON check_ins;

-- 開発用のRLSポリシー（誰でも読み書き可能）
CREATE POLICY "Anyone can view public check-ins" ON check_ins
  FOR SELECT USING (true);

CREATE POLICY "Anyone can create check-ins" ON check_ins
  FOR INSERT WITH CHECK (true);

-- 4. サンプルデータの挿入
-- デモユーザーのチェックインデータ
DO $$
DECLARE
  demo_user_id UUID := '0ab7b9a0-fbf6-447c-9af5-ff5b12e92fa8';
  gym1_id UUID;
  gym2_id UUID;
  gym3_id UUID;
BEGIN
  -- 最初の3つのジムIDを取得
  SELECT id INTO gym1_id FROM gyms ORDER BY created_at LIMIT 1;
  SELECT id INTO gym2_id FROM gyms ORDER BY created_at OFFSET 1 LIMIT 1;
  SELECT id INTO gym3_id FROM gyms ORDER BY created_at OFFSET 2 LIMIT 1;

  -- 今日のチェックイン
  INSERT INTO check_ins (user_id, gym_id, checked_in_at, note, latitude, longitude)
  VALUES (demo_user_id, gym1_id, NOW() - INTERVAL '2 hours', '朝トレ完了！最高の汗かけた💪', 35.6762, 139.6503);

  INSERT INTO check_ins (user_id, gym_id, checked_in_at, note, latitude, longitude)
  VALUES (demo_user_id, gym2_id, NOW() - INTERVAL '5 hours', 'ベンチプレス100kg達成！🎯', 35.6895, 139.6917);

  -- 昨日のチェックイン
  INSERT INTO check_ins (user_id, gym_id, checked_in_at, note, latitude, longitude)
  VALUES (demo_user_id, gym1_id, NOW() - INTERVAL '1 day 3 hours', '背中の日。デッドリフト頑張った', 35.6762, 139.6503);

  INSERT INTO check_ins (user_id, gym_id, checked_in_at, note, latitude, longitude)
  VALUES (demo_user_id, gym3_id, NOW() - INTERVAL '1 day 7 hours', 'カーディオ30分完走', 35.7090, 139.7319);

  -- 2日前のチェックイン
  INSERT INTO check_ins (user_id, gym_id, checked_in_at, note, latitude, longitude)
  VALUES (demo_user_id, gym2_id, NOW() - INTERVAL '2 days 4 hours', '肩と腕の日。パンプ最高！💯', 35.6895, 139.6917);

  -- 3日前のチェックイン
  INSERT INTO check_ins (user_id, gym_id, checked_in_at, note, latitude, longitude)
  VALUES (demo_user_id, gym1_id, NOW() - INTERVAL '3 days 6 hours', 'フルボディワークアウト', 35.6762, 139.6503);

  -- 4日前のチェックイン
  INSERT INTO check_ins (user_id, gym_id, checked_in_at, note, latitude, longitude)
  VALUES (demo_user_id, gym3_id, NOW() - INTERVAL '4 days 5 hours', 'HIITトレーニング。きつかった...', 35.6580, 139.7016);

  -- 5日前のチェックイン
  INSERT INTO check_ins (user_id, gym_id, checked_in_at, note, latitude, longitude)
  VALUES (demo_user_id, gym1_id, NOW() - INTERVAL '5 days 3 hours', '胸トレ。ベンチプレス調子良い', 35.6762, 139.6503);

  -- 6日前のチェックイン
  INSERT INTO check_ins (user_id, gym_id, checked_in_at, note, latitude, longitude)
  VALUES (demo_user_id, gym2_id, NOW() - INTERVAL '6 days 4 hours', '脚の日。レッグプレス200kg！', 35.6895, 139.6917);

  -- 7日前のチェックイン（連続記録スタート）
  INSERT INTO check_ins (user_id, gym_id, checked_in_at, note, latitude, longitude)
  VALUES (demo_user_id, gym1_id, NOW() - INTERVAL '7 days 5 hours', '新しい週のスタート！目標達成するぞ', 35.6762, 139.6503);

  RAISE NOTICE 'チェックインデータを作成しました';
END $$;

-- 5. 作成結果の確認
SELECT
  COUNT(*) as total_checkins,
  COUNT(DISTINCT gym_id) as unique_gyms,
  COUNT(DISTINCT DATE(checked_in_at)) as unique_days
FROM check_ins
WHERE user_id = '0ab7b9a0-fbf6-447c-9af5-ff5b12e92fa8';