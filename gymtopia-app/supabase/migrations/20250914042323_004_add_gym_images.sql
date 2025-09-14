-- ジムテーブルに画像フィールドを追加
ALTER TABLE gyms ADD COLUMN IF NOT EXISTS images TEXT[] DEFAULT ARRAY[]::TEXT[];

-- サンプル画像データを追加
UPDATE gyms SET images = ARRAY[
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1571019613454-1cb2f99b2d8b?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1593079831268-3381b0db4a77?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1558611848-73f7eb4001a1?w=800&h=600&fit=crop'
] WHERE name LIKE '%ROGUE%' OR name LIKE '%パワー%';

UPDATE gyms SET images = ARRAY[
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1574680096145-d05b474e2155?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1581009146145-b5ef050c2e1e?w=800&h=600&fit=crop'
] WHERE name LIKE '%GOLD%' OR name LIKE '%ゴールド%';

UPDATE gyms SET images = ARRAY[
  'https://images.unsplash.com/photo-1570829460005-c840387bb1ca?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1534258936925-c58bed479fcb?w=800&h=600&fit=crop'
] WHERE name LIKE '%エニタイム%' OR name LIKE '%24%';

UPDATE gyms SET images = ARRAY[
  'https://images.unsplash.com/photo-1571902943202-507ec2618e8f?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1623874514711-0f321325f318?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1549060279-7e168fcee0c2?w=800&h=600&fit=crop'
] WHERE name LIKE '%プレミアム%' OR name LIKE '%フィットネス%';

-- デフォルト画像を全てのジムに設定（画像がまだ設定されていない場合）
UPDATE gyms SET images = ARRAY[
  'https://images.unsplash.com/photo-1534438327276-14e5300c3a48?w=800&h=600&fit=crop',
  'https://images.unsplash.com/photo-1540497077202-7c8a3999166f?w=800&h=600&fit=crop'
] WHERE images = '{}' OR images IS NULL;;
