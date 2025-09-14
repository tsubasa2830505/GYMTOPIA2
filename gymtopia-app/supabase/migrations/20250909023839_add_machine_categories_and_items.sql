-- マシンカテゴリテーブル
CREATE TABLE IF NOT EXISTS machine_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- マシンテーブルの拡張（既存のテーブルに列を追加）
ALTER TABLE machines 
ADD COLUMN IF NOT EXISTS category_id UUID REFERENCES machine_categories(id),
ADD COLUMN IF NOT EXISTS brand VARCHAR(100),
ADD COLUMN IF NOT EXISTS description TEXT,
ADD COLUMN IF NOT EXISTS display_order INTEGER DEFAULT 0;

-- フリーウェイトカテゴリテーブル
CREATE TABLE IF NOT EXISTS freeweight_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- フリーウェイトアイテムテーブル
CREATE TABLE IF NOT EXISTS freeweight_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES freeweight_categories(id) ON DELETE CASCADE,
  slug VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  weight_range VARCHAR(50),
  unit VARCHAR(10) DEFAULT 'kg',
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- 施設カテゴリテーブル
CREATE TABLE IF NOT EXISTS facility_categories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug VARCHAR(50) UNIQUE NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  icon VARCHAR(50),
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- 施設アイテムテーブル
CREATE TABLE IF NOT EXISTS facility_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  category_id UUID REFERENCES facility_categories(id) ON DELETE CASCADE,
  slug VARCHAR(100) NOT NULL,
  name VARCHAR(100) NOT NULL,
  description TEXT,
  display_order INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(category_id, slug)
);

-- ジムと施設の関連テーブル
CREATE TABLE IF NOT EXISTS gym_facilities (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  facility_id UUID REFERENCES facility_items(id) ON DELETE CASCADE,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(gym_id, facility_id)
);

-- ジムとフリーウェイトの関連テーブル
CREATE TABLE IF NOT EXISTS gym_freeweights (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE,
  freeweight_id UUID REFERENCES freeweight_items(id) ON DELETE CASCADE,
  quantity INTEGER DEFAULT 1,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(gym_id, freeweight_id)
);

-- インデックス追加
CREATE INDEX IF NOT EXISTS idx_machines_category_id ON machines(category_id);
CREATE INDEX IF NOT EXISTS idx_freeweight_items_category_id ON freeweight_items(category_id);
CREATE INDEX IF NOT EXISTS idx_facility_items_category_id ON facility_items(category_id);
CREATE INDEX IF NOT EXISTS idx_gym_facilities_gym_id ON gym_facilities(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_freeweights_gym_id ON gym_freeweights(gym_id);

-- RLSポリシー
ALTER TABLE machine_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE freeweight_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE freeweight_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_categories ENABLE ROW LEVEL SECURITY;
ALTER TABLE facility_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_facilities ENABLE ROW LEVEL SECURITY;
ALTER TABLE gym_freeweights ENABLE ROW LEVEL SECURITY;

-- 読み取りポリシー（全員が閲覧可能）
CREATE POLICY "Machine categories are viewable by everyone" ON machine_categories FOR SELECT USING (true);
CREATE POLICY "Freeweight categories are viewable by everyone" ON freeweight_categories FOR SELECT USING (true);
CREATE POLICY "Freeweight items are viewable by everyone" ON freeweight_items FOR SELECT USING (true);
CREATE POLICY "Facility categories are viewable by everyone" ON facility_categories FOR SELECT USING (true);
CREATE POLICY "Facility items are viewable by everyone" ON facility_items FOR SELECT USING (true);
CREATE POLICY "Gym facilities are viewable by everyone" ON gym_facilities FOR SELECT USING (true);
CREATE POLICY "Gym freeweights are viewable by everyone" ON gym_freeweights FOR SELECT USING (true);;
