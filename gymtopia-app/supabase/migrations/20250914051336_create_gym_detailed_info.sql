-- ジムオーナー詳細情報テーブル作成
CREATE TABLE IF NOT EXISTS gym_detailed_info (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  pricing_details TEXT,
  membership_plans TEXT,
  business_hours_details TEXT,
  staff_hours TEXT,
  rules_and_regulations TEXT,
  dress_code TEXT,
  beginner_support TEXT,
  trial_info TEXT,
  access_details TEXT,
  parking_details TEXT,
  special_programs TEXT,
  announcements TEXT,
  additional_info TEXT,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(gym_id)
);

-- RLS(Row Level Security)を有効化
ALTER TABLE gym_detailed_info ENABLE ROW LEVEL SECURITY;

-- 誰でも読み取り可能
CREATE POLICY "Anyone can view gym detailed info" ON gym_detailed_info FOR SELECT USING (true);

-- ジムオーナーのみ更新可能（将来の実装用）
CREATE POLICY "Gym owners can update their gym detailed info" ON gym_detailed_info FOR ALL USING (true);;
