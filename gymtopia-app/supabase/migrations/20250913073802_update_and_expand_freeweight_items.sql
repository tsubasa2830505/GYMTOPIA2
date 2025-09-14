-- 既存のアイテムを詳細化・更新
UPDATE freeweight_items SET 
  weight_range = '1-50',
  description = '初心者から上級者まで対応、六角形で転がらない設計'
WHERE slug = 'hex_dumbbells';

UPDATE freeweight_items SET 
  weight_range = '1-40', 
  description = '丸型デザイン、クラシックなダンベル'
WHERE slug = 'round_dumbbells';

UPDATE freeweight_items SET 
  weight_range = '2.5-24',
  description = 'ダイヤル式で瞬時に重量変更、省スペース設計'
WHERE slug = 'adjustable_dumbbells';

UPDATE freeweight_items SET 
  weight_range = '2-50',
  description = '角型デザイン、コンパクトな可変式ダンベル'
WHERE slug = 'powerblock';

UPDATE freeweight_items SET 
  weight_range = '20',
  description = 'スリーブ径50mm、全長220cm、競技規格対応'
WHERE slug = 'olympic_bar';

UPDATE freeweight_items SET 
  weight_range = '8-12',
  description = 'カーブした形状で腕のトレーニングに特化、手首負担軽減'
WHERE slug = 'ez_bar';

UPDATE freeweight_items SET 
  weight_range = '10-20',
  description = 'ストレート形状、基本的なバーベルトレーニング用'
WHERE slug = 'straight_bar';

UPDATE freeweight_items SET 
  weight_range = '20-25',
  description = 'デッドリフトやシュラッグに適した六角形バー、腰部負担軽減'
WHERE slug = 'trap_bar';

UPDATE freeweight_items SET 
  weight_range = '10,15,20,25',
  description = '厚ゴム層、ドロップ対応、ウェイトリフティング・クロスフィット用'
WHERE slug = 'bumper_plates';

UPDATE freeweight_items SET 
  weight_range = '1.25,2.5,5,10,15,20,25',
  description = '穴径50mm、標準的な鋳鉄プレート、最も一般的'
WHERE slug = 'iron_plates';

UPDATE freeweight_items SET 
  weight_range = '0.25,0.5,1',
  description = '記録更新用微増量プレート、競技・上級者向け'
WHERE slug = 'fractional_plates';

-- 新しいアイテムを追加（重複しないもののみ）
WITH barbell_cat AS (SELECT id FROM freeweight_categories WHERE slug = 'barbells')
INSERT INTO freeweight_items (category_id, slug, name, weight_range, unit, description, display_order)
SELECT 
  barbell_cat.id,
  items.slug,
  items.name,
  items.weight_range,
  items.unit,
  items.description,
  items.display_order
FROM barbell_cat, (VALUES
  ('olympic_bar_15kg_women', 'オリンピックバー（女性用）', '15', 'kg', 'スリーブ径25mm、全長201cm、女性向け規格', 11),
  ('standard_bar_28mm', 'スタンダードバー', '10', 'kg', 'スリーブ径28mm、家庭用・ジム初心者向け', 12),
  ('powerlifting_bar_29mm', 'パワーリフティングバー', '20', 'kg', 'シャフト径29mm、BIG3競技用、高い剛性', 13),
  ('colorado_bar_multi', 'コロラドバー（多目的）', '20', 'kg', 'シャフト径28.5mm、クロスフィット・ウェイトリフティング対応', 14)
) AS items(slug, name, weight_range, unit, description, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM freeweight_items fi WHERE fi.slug = items.slug
);

-- ダンベルの詳細分類を追加
WITH dumbbell_cat AS (SELECT id FROM freeweight_categories WHERE slug = 'dumbbells')
INSERT INTO freeweight_items (category_id, slug, name, weight_range, unit, description, display_order)
SELECT 
  dumbbell_cat.id,
  items.slug,
  items.name,
  items.weight_range,
  items.unit,
  items.description,
  items.display_order
FROM dumbbell_cat, (VALUES
  ('chrome_dumbbells', 'クロームダンベル', '1-20', 'kg', 'クロームメッキ仕上げ、高級感のある外観', 21),
  ('rubber_hex_dumbbells', 'ラバーヘックスダンベル', '1-50', 'kg', 'ゴムコーティング、静音性・床保護', 22),
  ('adjustable_plate_dumbbells', 'プレート式可変ダンベル', '5-30', 'kg', 'プレート着脱式、バーベル連結可能な3way仕様', 23)
) AS items(slug, name, weight_range, unit, description, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM freeweight_items fi WHERE fi.slug = items.slug
);

-- プレートの詳細分類を追加
WITH plate_cat AS (SELECT id FROM freeweight_categories WHERE slug = 'plates')
INSERT INTO freeweight_items (category_id, slug, name, weight_range, unit, description, display_order)
SELECT 
  plate_cat.id,
  items.slug,
  items.name,
  items.weight_range,
  items.unit,
  items.description,
  items.display_order
FROM plate_cat, (VALUES
  ('rubber_plates', 'ラバープレート', '1.25,2.5,5,10,15,20,25', 'kg', 'ゴムコーティング、静音性・床保護、一般ジム向け', 31),
  ('calibrated_plates_ipf', 'キャリブレイテッドプレート（IPF公認）', '0.25,0.5,1,1.25,2.5,5,10,15,20,25', 'kg', '競技用高精度、誤差±10g以内、カラーコード付き', 32),
  ('standard_plates_28mm', 'スタンダードプレート', '1.25,2.5,5,10,15,20', 'kg', '穴径28mm、家庭用バーベル対応', 33),
  ('plate_set_beginner', 'プレートセット（初心者）', '95', 'kg', 'バー20kg + プレート75kg、基本セット', 34),
  ('plate_set_intermediate', 'プレートセット（中級者）', '175', 'kg', 'バー20kg + プレート155kg、充実セット', 35),
  ('plate_set_advanced', 'プレートセット（上級者）', '255', 'kg', 'バー20kg + プレート235kg、本格セット', 36)
) AS items(slug, name, weight_range, unit, description, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM freeweight_items fi WHERE fi.slug = items.slug
);

-- アクセサリーカテゴリが存在しない場合は追加
INSERT INTO freeweight_categories (slug, name, description, display_order)
SELECT 'accessories', 'アクセサリー', 'ラック、ベンチ、トレーニング補助器具', 10
WHERE NOT EXISTS (SELECT 1 FROM freeweight_categories WHERE slug = 'accessories');

-- アクセサリー関連のアイテムを追加
WITH accessory_cat AS (SELECT id FROM freeweight_categories WHERE slug = 'accessories')
INSERT INTO freeweight_items (category_id, slug, name, weight_range, unit, description, display_order)
SELECT 
  accessory_cat.id,
  items.slug,
  items.name,
  items.weight_range,
  items.unit,
  items.description,
  items.display_order
FROM accessory_cat, (VALUES
  ('power_rack', 'パワーラック', '', '台', '安全バー付き、スクワット・ベンチプレス対応', 41),
  ('squat_rack', 'スクワットラック', '', '台', 'スクワット専用ラック、省スペース', 42),
  ('half_rack', 'ハーフラック', '', '台', '省スペース型パワーラック', 43),
  ('olympic_bench_flat', 'オリンピックフラットベンチ', '', '台', 'バーベル用フラットベンチ、高耐荷重', 44),
  ('adjustable_bench', 'アジャスタブルベンチ', '', '台', 'インクライン・デクライン調整可能', 45),
  ('barbell_collars', 'バーベルカラー', '', '組', 'プレート固定用クリップ、安全確保', 46),
  ('weight_belt', 'トレーニングベルト', '', '本', '腰部サポート、高重量時の安全確保', 47),
  ('lifting_straps', 'リフティングストラップ', '', '組', '握力補助、デッドリフト・懸垂用', 48),
  ('chalk', 'チョーク', '', '個', '滑り止め、グリップ力向上', 49)
) AS items(slug, name, weight_range, unit, description, display_order)
WHERE NOT EXISTS (
  SELECT 1 FROM freeweight_items fi WHERE fi.slug = items.slug
);;
