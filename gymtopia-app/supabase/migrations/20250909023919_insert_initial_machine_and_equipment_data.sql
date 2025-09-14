-- マシンカテゴリのデータ挿入
INSERT INTO machine_categories (slug, name, description, icon, display_order) VALUES
('chest', '胸部マシン', 'チェストプレス、ペックフライなど', '💪', 1),
('back', '背中マシン', 'ラットプルダウン、ローイングなど', '🦾', 2),
('legs', '脚部マシン', 'レッグプレス、レッグカールなど', '🦵', 3),
('shoulders', '肩マシン', 'ショルダープレス、サイドレイズなど', '🎯', 4),
('arms', '腕マシン', 'アームカール、トライセプスなど', '💪', 5),
('abs', '腹筋マシン', 'アブドミナル、クランチなど', '🎯', 6),
('cardio', '有酸素マシン', 'トレッドミル、バイクなど', '🏃', 7),
('functional', 'ファンクショナル', 'ケーブルマシン、TRXなど', '🤸', 8)
ON CONFLICT (slug) DO NOTHING;

-- 既存のマシンデータをカテゴリと関連付け（サンプル）
UPDATE machines 
SET category_id = (SELECT id FROM machine_categories WHERE slug = 'chest')
WHERE type = 'チェストプレス' OR name LIKE '%チェスト%';

UPDATE machines 
SET category_id = (SELECT id FROM machine_categories WHERE slug = 'back')
WHERE type = 'ラットプルダウン' OR name LIKE '%ラット%' OR name LIKE '%ロー%';

UPDATE machines 
SET category_id = (SELECT id FROM machine_categories WHERE slug = 'legs')
WHERE type = 'レッグプレス' OR name LIKE '%レッグ%' OR name LIKE '%スクワット%';

-- フリーウェイトカテゴリのデータ挿入
INSERT INTO freeweight_categories (slug, name, description, icon, display_order) VALUES
('dumbbells', 'ダンベル', '各種重量のダンベル', '🏋️', 1),
('barbells', 'バーベル', 'オリンピックバー、EZバーなど', '🏋️‍♂️', 2),
('kettlebells', 'ケトルベル', '各種重量のケトルベル', '🏋️', 3),
('plates', 'プレート', 'バーベル用プレート', '⚫', 4),
('specialty', '特殊器具', 'メディシンボール、サンドバッグなど', '🎯', 5)
ON CONFLICT (slug) DO NOTHING;

-- フリーウェイトアイテムのデータ挿入
INSERT INTO freeweight_items (category_id, slug, name, weight_range, unit, display_order) VALUES
-- ダンベル
((SELECT id FROM freeweight_categories WHERE slug = 'dumbbells'), 'hex_dumbbells', 'ヘックスダンベル', '1-50', 'kg', 1),
((SELECT id FROM freeweight_categories WHERE slug = 'dumbbells'), 'round_dumbbells', 'ラウンドダンベル', '1-40', 'kg', 2),
((SELECT id FROM freeweight_categories WHERE slug = 'dumbbells'), 'adjustable_dumbbells', '可変式ダンベル', '2.5-24', 'kg', 3),
((SELECT id FROM freeweight_categories WHERE slug = 'dumbbells'), 'powerblock', 'パワーブロック', '2-40', 'kg', 4),
-- バーベル
((SELECT id FROM freeweight_categories WHERE slug = 'barbells'), 'olympic_bar', 'オリンピックバー', '20', 'kg', 1),
((SELECT id FROM freeweight_categories WHERE slug = 'barbells'), 'ez_bar', 'EZバー', '10-15', 'kg', 2),
((SELECT id FROM freeweight_categories WHERE slug = 'barbells'), 'straight_bar', 'ストレートバー', '10-20', 'kg', 3),
((SELECT id FROM freeweight_categories WHERE slug = 'barbells'), 'trap_bar', 'トラップバー', '25-30', 'kg', 4),
-- ケトルベル
((SELECT id FROM freeweight_categories WHERE slug = 'kettlebells'), 'cast_iron_kettlebell', '鋳鉄ケトルベル', '4-48', 'kg', 1),
((SELECT id FROM freeweight_categories WHERE slug = 'kettlebells'), 'competition_kettlebell', '競技用ケトルベル', '8-32', 'kg', 2),
((SELECT id FROM freeweight_categories WHERE slug = 'kettlebells'), 'adjustable_kettlebell', '可変式ケトルベル', '4-18', 'kg', 3),
-- プレート
((SELECT id FROM freeweight_categories WHERE slug = 'plates'), 'bumper_plates', 'バンパープレート', '5-25', 'kg', 1),
((SELECT id FROM freeweight_categories WHERE slug = 'plates'), 'iron_plates', 'アイアンプレート', '1.25-25', 'kg', 2),
((SELECT id FROM freeweight_categories WHERE slug = 'plates'), 'fractional_plates', '小数プレート', '0.25-2.5', 'kg', 3),
-- 特殊器具
((SELECT id FROM freeweight_categories WHERE slug = 'specialty'), 'medicine_ball', 'メディシンボール', '1-10', 'kg', 1),
((SELECT id FROM freeweight_categories WHERE slug = 'specialty'), 'slam_ball', 'スラムボール', '3-20', 'kg', 2),
((SELECT id FROM freeweight_categories WHERE slug = 'specialty'), 'sandbag', 'サンドバッグ', '5-30', 'kg', 3),
((SELECT id FROM freeweight_categories WHERE slug = 'specialty'), 'battle_rope', 'バトルロープ', '9-15', 'm', 4)
ON CONFLICT (category_id, slug) DO NOTHING;

-- 施設カテゴリのデータ挿入
INSERT INTO facility_categories (slug, name, description, icon, display_order) VALUES
('amenities', '基本設備', 'シャワー、ロッカーなど', '🚿', 1),
('training', 'トレーニング施設', 'スタジオ、プールなど', '🏋️', 2),
('relaxation', 'リラクゼーション', 'サウナ、スパなど', '♨️', 3),
('services', 'サービス', 'パーソナルトレーニングなど', '👥', 4),
('accessibility', 'アクセシビリティ', '駐車場、アクセスなど', '🚗', 5)
ON CONFLICT (slug) DO NOTHING;

-- 施設アイテムのデータ挿入
INSERT INTO facility_items (category_id, slug, name, description, display_order) VALUES
-- 基本設備
((SELECT id FROM facility_categories WHERE slug = 'amenities'), 'shower', 'シャワー', '更衣室内シャワー設備', 1),
((SELECT id FROM facility_categories WHERE slug = 'amenities'), 'locker', 'ロッカー', '鍵付きロッカー', 2),
((SELECT id FROM facility_categories WHERE slug = 'amenities'), 'towel_service', 'タオルサービス', 'レンタルタオル', 3),
((SELECT id FROM facility_categories WHERE slug = 'amenities'), 'water_cooler', 'ウォーターサーバー', '無料給水設備', 4),
-- トレーニング施設
((SELECT id FROM facility_categories WHERE slug = 'training'), 'studio', 'スタジオ', 'グループレッスン用スタジオ', 1),
((SELECT id FROM facility_categories WHERE slug = 'training'), 'pool', 'プール', '屋内プール', 2),
((SELECT id FROM facility_categories WHERE slug = 'training'), 'boxing_ring', 'ボクシングリング', '格闘技用リング', 3),
((SELECT id FROM facility_categories WHERE slug = 'training'), 'crossfit_area', 'クロスフィットエリア', '専用トレーニングエリア', 4),
-- リラクゼーション
((SELECT id FROM facility_categories WHERE slug = 'relaxation'), 'sauna', 'サウナ', 'ドライサウナ', 1),
((SELECT id FROM facility_categories WHERE slug = 'relaxation'), 'steam_room', 'スチームルーム', 'スチームサウナ', 2),
((SELECT id FROM facility_categories WHERE slug = 'relaxation'), 'jacuzzi', 'ジャグジー', '温水ジャグジー', 3),
((SELECT id FROM facility_categories WHERE slug = 'relaxation'), 'massage_room', 'マッサージルーム', 'リラクゼーションルーム', 4),
-- サービス
((SELECT id FROM facility_categories WHERE slug = 'services'), 'personal_training', 'パーソナルトレーニング', '個別指導サービス', 1),
((SELECT id FROM facility_categories WHERE slug = 'services'), 'nutrition_counseling', '栄養相談', '栄養士による相談', 2),
((SELECT id FROM facility_categories WHERE slug = 'services'), 'body_composition', '体組成測定', 'InBody測定など', 3),
((SELECT id FROM facility_categories WHERE slug = 'services'), 'group_classes', 'グループクラス', 'ヨガ、ピラティスなど', 4),
-- アクセシビリティ
((SELECT id FROM facility_categories WHERE slug = 'accessibility'), 'parking', '駐車場', '専用駐車場', 1),
((SELECT id FROM facility_categories WHERE slug = 'accessibility'), 'bike_parking', '駐輪場', '自転車置き場', 2),
((SELECT id FROM facility_categories WHERE slug = 'accessibility'), 'wheelchair_access', 'バリアフリー', '車椅子対応', 3),
((SELECT id FROM facility_categories WHERE slug = 'accessibility'), '24hours', '24時間営業', '24時間利用可能', 4)
ON CONFLICT (category_id, slug) DO NOTHING;;
