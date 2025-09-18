-- チェックインテーブルの拡張
-- 位置情報検証とコレクション要素の追加

-- 1. check_insテーブルに新しいカラムを追加
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS distance_from_gym DOUBLE PRECISION;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS location_accuracy DOUBLE PRECISION;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS verified BOOLEAN DEFAULT false;
ALTER TABLE check_ins ADD COLUMN IF NOT EXISTS verification_method TEXT; -- 'gps', 'manual', 'qr_code'等

-- 2. gymsテーブルに訪問者数カウント用カラムを追加
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS visit_count INTEGER DEFAULT 0;
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS first_visitor_id UUID REFERENCES auth.users(id);
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS rarity_score INTEGER DEFAULT 100; -- レア度スコア（0-100）

-- 3. ユーザー実績テーブルの作成
CREATE TABLE IF NOT EXISTS user_achievements (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL, -- 'first_visitor', 'city_explorer', 'rare_gym_hunter', etc
  achievement_name TEXT NOT NULL,
  achieved_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  metadata JSONB,
  UNIQUE(user_id, achievement_type)
);

-- 4. ジムコレクションテーブル（ユーザーが訪問したジムの記録）
CREATE TABLE IF NOT EXISTS gym_collections (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  first_visit_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  total_visits INTEGER DEFAULT 1,
  favorite BOOLEAN DEFAULT false,
  notes TEXT,
  UNIQUE(user_id, gym_id)
);

-- 5. 位置検証ログテーブル
CREATE TABLE IF NOT EXISTS location_verification_logs (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  check_in_id UUID REFERENCES check_ins(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  user_latitude DOUBLE PRECISION NOT NULL,
  user_longitude DOUBLE PRECISION NOT NULL,
  gym_latitude DOUBLE PRECISION NOT NULL,
  gym_longitude DOUBLE PRECISION NOT NULL,
  calculated_distance DOUBLE PRECISION NOT NULL,
  location_accuracy DOUBLE PRECISION,
  is_valid BOOLEAN NOT NULL,
  rejection_reason TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 6. インデックスを作成
CREATE INDEX IF NOT EXISTS idx_gym_collections_user_id ON gym_collections(user_id);
CREATE INDEX IF NOT EXISTS idx_user_achievements_user_id ON user_achievements(user_id);
CREATE INDEX IF NOT EXISTS idx_location_verification_logs_user_id ON location_verification_logs(user_id);

-- 7. RLSポリシー設定
ALTER TABLE user_achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_collections ENABLE ROW LEVEL SECURITY;
ALTER TABLE location_verification_logs ENABLE ROW LEVEL SECURITY;

-- 自分の実績を見ることができる
CREATE POLICY "Users can view own achievements" ON user_achievements
  FOR SELECT USING (auth.uid() = user_id);

-- 自分のコレクションを管理できる
CREATE POLICY "Users can manage own collections" ON gym_collections
  FOR ALL USING (auth.uid() = user_id);

-- 自分の検証ログを見ることができる
CREATE POLICY "Users can view own verification logs" ON location_verification_logs
  FOR SELECT USING (auth.uid() = user_id);

-- 8. トリガー関数：チェックイン時に自動的に処理
CREATE OR REPLACE FUNCTION process_check_in()
RETURNS TRIGGER AS $$
BEGIN
  -- gym_collectionsを更新または作成
  INSERT INTO gym_collections (user_id, gym_id, first_visit_at, total_visits)
  VALUES (NEW.user_id, NEW.gym_id, NEW.checked_in_at, 1)
  ON CONFLICT (user_id, gym_id)
  DO UPDATE SET total_visits = gym_collections.total_visits + 1;

  -- gymsの訪問者数を更新
  UPDATE gyms
  SET visit_count = visit_count + 1
  WHERE id = NEW.gym_id;

  -- 距離が100m以内なら検証済みフラグを立てる
  IF NEW.distance_from_gym IS NOT NULL AND NEW.distance_from_gym <= 100 THEN
    UPDATE check_ins
    SET verified = true,
        verification_method = 'gps'
    WHERE id = NEW.id;
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 9. トリガーを設定
DROP TRIGGER IF EXISTS process_check_in_trigger ON check_ins;
CREATE TRIGGER process_check_in_trigger
  AFTER INSERT ON check_ins
  FOR EACH ROW
  EXECUTE FUNCTION process_check_in();

-- 10. 実績判定関数
CREATE OR REPLACE FUNCTION check_achievements(p_user_id UUID)
RETURNS void AS $$
DECLARE
  v_unique_gyms INTEGER;
  v_unique_cities INTEGER;
  v_rare_gyms INTEGER;
  v_total_checkins INTEGER;
BEGIN
  -- ユニークジム数を取得
  SELECT COUNT(DISTINCT gym_id) INTO v_unique_gyms
  FROM gym_collections
  WHERE user_id = p_user_id;

  -- ユニーク都市数を取得
  SELECT COUNT(DISTINCT CONCAT(g.prefecture, '-', g.city)) INTO v_unique_cities
  FROM gym_collections gc
  JOIN gyms g ON gc.gym_id = g.id
  WHERE gc.user_id = p_user_id;

  -- レアジム訪問数を取得
  SELECT COUNT(DISTINCT gc.gym_id) INTO v_rare_gyms
  FROM gym_collections gc
  JOIN gyms g ON gc.gym_id = g.id
  WHERE gc.user_id = p_user_id
  AND g.visit_count < 100;

  -- 実績を付与
  -- 10ジム開拓
  IF v_unique_gyms >= 10 THEN
    INSERT INTO user_achievements (user_id, achievement_type, achievement_name, metadata)
    VALUES (p_user_id, 'gym_explorer_10', '10ジム開拓者', jsonb_build_object('gyms', v_unique_gyms))
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;

  -- 50ジム開拓
  IF v_unique_gyms >= 50 THEN
    INSERT INTO user_achievements (user_id, achievement_type, achievement_name, metadata)
    VALUES (p_user_id, 'gym_explorer_50', '50ジムマスター', jsonb_build_object('gyms', v_unique_gyms))
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;

  -- 5都市制覇
  IF v_unique_cities >= 5 THEN
    INSERT INTO user_achievements (user_id, achievement_type, achievement_name, metadata)
    VALUES (p_user_id, 'city_explorer_5', 'シティトラベラー', jsonb_build_object('cities', v_unique_cities))
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;

  -- レアジムハンター
  IF v_rare_gyms >= 3 THEN
    INSERT INTO user_achievements (user_id, achievement_type, achievement_name, metadata)
    VALUES (p_user_id, 'rare_gym_hunter', 'レアジムハンター', jsonb_build_object('rare_gyms', v_rare_gyms))
    ON CONFLICT (user_id, achievement_type) DO NOTHING;
  END IF;
END;
$$ LANGUAGE plpgsql;