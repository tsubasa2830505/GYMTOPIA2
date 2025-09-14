-- 既存のテーブルを削除して再作成
DROP TABLE IF EXISTS gym_machines CASCADE;
DROP TABLE IF EXISTS gym_free_weights CASCADE;

-- マシン設備を管理するテーブル
CREATE TABLE gym_machines (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  count INTEGER DEFAULT 1,
  condition TEXT DEFAULT '良好',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- フリーウェイト設備を管理するテーブル  
CREATE TABLE gym_free_weights (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  gym_id UUID NOT NULL REFERENCES gyms(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  brand TEXT,
  count INTEGER,
  weight_range TEXT,
  condition TEXT DEFAULT '良好',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_by UUID REFERENCES auth.users(id)
);

-- facilitiesカラムが存在しない場合は追加
DO $$ 
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns 
    WHERE table_name = 'gyms' AND column_name = 'facilities'
  ) THEN
    ALTER TABLE gyms ADD COLUMN facilities JSONB DEFAULT '{
      "24hours": false,
      "shower": false,
      "parking": false,
      "locker": false,
      "wifi": false,
      "chalk": false,
      "belt_rental": false,
      "personal_training": false,
      "group_lesson": false,
      "studio": false,
      "sauna": false,
      "pool": false,
      "jacuzzi": false,
      "massage_chair": false,
      "cafe": false,
      "women_only": false,
      "barrier_free": false,
      "kids_room": false,
      "english_support": false
    }'::jsonb;
  END IF;
END $$;

-- 既存のbooleanカラムからfacilities JSONBへデータを移行
UPDATE gyms SET facilities = jsonb_build_object(
  '24hours', COALESCE(has_24h, false),
  'shower', COALESCE(has_shower, false),
  'parking', COALESCE(has_parking, false),
  'locker', COALESCE(has_locker, false),
  'wifi', false,
  'chalk', false,
  'belt_rental', false,
  'personal_training', false,
  'group_lesson', false,
  'studio', false,
  'sauna', COALESCE(has_sauna, false),
  'pool', false,
  'jacuzzi', false,
  'massage_chair', false,
  'cafe', false,
  'women_only', false,
  'barrier_free', false,
  'kids_room', false,
  'english_support', false
)
WHERE facilities IS NULL OR facilities = '{}'::jsonb;

-- インデックス作成
CREATE INDEX IF NOT EXISTS idx_gym_machines_gym_id ON gym_machines(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_free_weights_gym_id ON gym_free_weights(gym_id);
CREATE INDEX IF NOT EXISTS idx_gyms_facilities ON gyms USING GIN(facilities);

-- RLSポリシー設定
ALTER TABLE gym_machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_free_weights ENABLE ROW LEVEL SECURITY;

-- 読み取りポリシー
CREATE POLICY "gym_machines_read" ON gym_machines FOR SELECT USING (true);
CREATE POLICY "gym_free_weights_read" ON gym_free_weights FOR SELECT USING (true);

-- 書き込みポリシー
CREATE POLICY "gym_machines_write" ON gym_machines FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "gym_machines_update" ON gym_machines FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "gym_machines_delete" ON gym_machines FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "gym_free_weights_write" ON gym_free_weights FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);
CREATE POLICY "gym_free_weights_update" ON gym_free_weights FOR UPDATE USING (auth.uid() IS NOT NULL);
CREATE POLICY "gym_free_weights_delete" ON gym_free_weights FOR DELETE USING (auth.uid() IS NOT NULL);;
