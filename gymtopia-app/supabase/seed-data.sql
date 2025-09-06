-- GYMTOPIA 2.0 Sample Seed Data
-- サンプルデータの投入

-- ========================================
-- 1. Equipment Categories
-- ========================================
INSERT INTO public.equipment_categories (name, description, icon, sort_order) VALUES
('チェストプレス', '胸部を鍛えるマシン', 'dumbbell', 1),
('バックエクステンション', '背中を鍛えるマシン', 'activity', 2),
('レッグプレス', '脚部を鍛えるマシン', 'trending-up', 3),
('ショルダープレス', '肩を鍛えるマシン', 'target', 4),
('アームカール', '腕を鍛えるマシン', 'zap', 5),
('アブドミナル', '腹筋を鍛えるマシン', 'shield', 6),
('フリーウェイト', 'ダンベル・バーベル', 'weight', 7),
('カーディオ', '有酸素運動マシン', 'heart', 8);

-- ========================================
-- 2. Equipment
-- ========================================
INSERT INTO public.equipment (category_id, name, maker, model, target_muscles, type, description) VALUES
-- チェストプレス系
((SELECT id FROM equipment_categories WHERE name = 'チェストプレス'), 
 'チェストプレス', 'Technogym', 'Selection Pro', 
 ARRAY['大胸筋', '三角筋前部', '上腕三頭筋'], 'machine', 
 'プロ仕様のチェストプレスマシン'),

((SELECT id FROM equipment_categories WHERE name = 'チェストプレス'), 
 'インクラインチェストプレス', 'Life Fitness', 'Signature Series', 
 ARRAY['大胸筋上部', '三角筋前部'], 'machine', 
 '上部胸筋を効果的に鍛える'),

-- バック系
((SELECT id FROM equipment_categories WHERE name = 'バックエクステンション'), 
 'ラットプルダウン', 'Precor', 'Vitality Series', 
 ARRAY['広背筋', '僧帽筋', '上腕二頭筋'], 'machine', 
 '背中の広がりを作る'),

((SELECT id FROM equipment_categories WHERE name = 'バックエクステンション'), 
 'ローイング', 'Hammer Strength', 'Plate-Loaded', 
 ARRAY['広背筋', '僧帽筋中部', '菱形筋'], 'machine', 
 '背中の厚みを作る'),

-- レッグ系
((SELECT id FROM equipment_categories WHERE name = 'レッグプレス'), 
 'レッグプレス', 'Cybex', 'Eagle NX', 
 ARRAY['大腿四頭筋', 'ハムストリングス', '大臀筋'], 'machine', 
 '脚全体を鍛える基本マシン'),

((SELECT id FROM equipment_categories WHERE name = 'レッグプレス'), 
 'レッグカール', 'Matrix', 'Ultra Series', 
 ARRAY['ハムストリングス'], 'machine', 
 'ハムストリングス専用マシン'),

-- フリーウェイト
((SELECT id FROM equipment_categories WHERE name = 'フリーウェイト'), 
 'ダンベル', 'IVANKO', 'プロシリーズ', 
 ARRAY['全身'], 'free_weight', 
 '1kg〜50kgまで完備'),

((SELECT id FROM equipment_categories WHERE name = 'フリーウェイト'), 
 'バーベル', 'ELEIKO', 'オリンピックバー', 
 ARRAY['全身'], 'free_weight', 
 'オリンピック規格20kg');

-- ========================================
-- 3. Sample Gyms
-- ========================================
INSERT INTO public.gyms (
    name, area, address, latitude, longitude, 
    phone, website, is_24_hours, has_parking, 
    day_pass_fee, rating
) VALUES
('ハンマーストレングス渋谷', '渋谷', '東京都渋谷区道玄坂1-1-1', 
 35.6580, 139.6989, '03-1234-5678', 'https://example.com', 
 true, false, 3000, 4.5),

('ゴールドジム原宿', '原宿', '東京都渋谷区神宮前3-2-1', 
 35.6721, 139.7099, '03-2345-6789', 'https://example.com', 
 false, true, 2800, 4.3),

('24/7ワークアウト新宿', '新宿', '東京都新宿区西新宿2-1-1', 
 35.6896, 139.6921, '03-3456-7890', 'https://example.com', 
 true, true, 3500, 4.7),

('エニタイムフィットネス池袋', '池袋', '東京都豊島区西池袋1-1-1', 
 35.7295, 139.7109, '03-4567-8901', 'https://example.com', 
 true, false, 2500, 4.2),

('ティップネス六本木', '六本木', '東京都港区六本木4-1-1', 
 35.6641, 139.7315, '03-5678-9012', 'https://example.com', 
 false, true, 4000, 4.6);

-- ========================================
-- 4. Gym Equipment Inventory
-- ========================================
-- ハンマーストレングス渋谷の設備
INSERT INTO public.gym_equipment (gym_id, equipment_id, count, max_weight, condition) 
SELECT 
    (SELECT id FROM gyms WHERE name = 'ハンマーストレングス渋谷'),
    e.id,
    CASE 
        WHEN e.type = 'machine' THEN floor(random() * 3 + 1)::int
        WHEN e.name = 'ダンベル' THEN 20
        ELSE 5
    END,
    CASE 
        WHEN e.name = 'ダンベル' THEN 50
        WHEN e.type = 'machine' THEN 200
        ELSE NULL
    END,
    CASE 
        WHEN random() > 0.7 THEN 'excellent'
        WHEN random() > 0.4 THEN 'good'
        ELSE 'fair'
    END
FROM public.equipment e;

-- ゴールドジム原宿の設備
INSERT INTO public.gym_equipment (gym_id, equipment_id, count, max_weight, condition) 
SELECT 
    (SELECT id FROM gyms WHERE name = 'ゴールドジム原宿'),
    e.id,
    CASE 
        WHEN e.type = 'machine' THEN floor(random() * 4 + 2)::int
        WHEN e.name = 'ダンベル' THEN 30
        ELSE 8
    END,
    CASE 
        WHEN e.name = 'ダンベル' THEN 60
        WHEN e.type = 'machine' THEN 250
        ELSE NULL
    END,
    'excellent'
FROM public.equipment e;

-- ========================================
-- 5. Sample User Profiles
-- ========================================
-- Note: ユーザーはSupabase Authで作成後、以下を実行
-- INSERT INTO public.profiles (id, username, display_name, bio, location, training_frequency) VALUES
-- (auth.uid(), 'muscle_taro', '筋肉太郎', 'ベンチプレス100kg目標！毎日がトレーニング日和', '東京', '週5-6回'),
-- (auth.uid(), 'fitness_hanako', 'フィットネス花子', 'ボディメイク頑張ってます💪', '渋谷', '週3-4回'),
-- (auth.uid(), 'power_jiro', 'パワー次郎', 'パワーリフティング選手｜デッドリフト200kg', '新宿', '週6-7回');

-- ========================================
-- 6. Sample Reviews
-- ========================================
-- Note: ユーザー作成後に実行
-- INSERT INTO public.gym_reviews (gym_id, user_id, rating, title, content, visit_date) VALUES
-- ((SELECT id FROM gyms WHERE name = 'ハンマーストレングス渋谷'),
--  (SELECT id FROM profiles WHERE username = 'muscle_taro'),
--  5, '最高の設備！', '設備が充実していて、特にフリーウェイトエリアが広くて使いやすいです。', CURRENT_DATE - INTERVAL '7 days'),
-- 
-- ((SELECT id FROM gyms WHERE name = 'ゴールドジム原宿'),
--  (SELECT id FROM profiles WHERE username = 'fitness_hanako'),
--  4, '女性にも優しいジム', '清潔で明るい雰囲気。スタッフも親切で初心者でも安心です。', CURRENT_DATE - INTERVAL '14 days');

-- ========================================
-- END OF SEED DATA
-- ========================================