-- サンプルチェックインデータの挿入
-- デモユーザーID: 0ab7b9a0-fbf6-447c-9af5-ff5b12e92fa8

-- 過去1週間のチェックインデータを作成
INSERT INTO check_ins (user_id, gym_id, checked_in_at, note, latitude, longitude, created_at) VALUES
-- 今日（3回チェックイン）
('0ab7b9a0-fbf6-447c-9af5-ff5b12e92fa8', '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', NOW() - INTERVAL '2 hours', '朝トレ完了！最高の汗かけた💪', 35.6762, 139.6503, NOW() - INTERVAL '2 hours'),
('0ab7b9a0-fbf6-447c-9af5-ff5b12e92fa8', '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', NOW() - INTERVAL '5 hours', 'ベンチプレス100kg達成！🎯', 35.6895, 139.6917, NOW() - INTERVAL '5 hours'),
('0ab7b9a0-fbf6-447c-9af5-ff5b12e92fa8', '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r', NOW() - INTERVAL '8 hours', 'スクワットデー。脚がプルプル😅', 35.6580, 139.7016, NOW() - INTERVAL '8 hours'),

-- 昨日（2回チェックイン）
('0ab7b9a0-fbf6-447c-9af5-ff5b12e92fa8', '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', NOW() - INTERVAL '1 day 3 hours', '背中の日。デッドリフト頑張った', 35.6762, 139.6503, NOW() - INTERVAL '1 day 3 hours'),
('0ab7b9a0-fbf6-447c-9af5-ff5b12e92fa8', '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s', NOW() - INTERVAL '1 day 7 hours', 'カーディオ30分完走', 35.7090, 139.7319, NOW() - INTERVAL '1 day 7 hours'),

-- 2日前（1回チェックイン）
('0ab7b9a0-fbf6-447c-9af5-ff5b12e92fa8', '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', NOW() - INTERVAL '2 days 4 hours', '肩と腕の日。パンプ最高！💯', 35.6895, 139.6917, NOW() - INTERVAL '2 days 4 hours'),

-- 3日前（2回チェックイン）
('0ab7b9a0-fbf6-447c-9af5-ff5b12e92fa8', '5e6f7g8h-9i0j-1k2l-3m4n-5o6p7q8r9s0t', NOW() - INTERVAL '3 days 2 hours', '新しいジム初訪問！設備が充実してる', 35.6312, 139.7363, NOW() - INTERVAL '3 days 2 hours'),
('0ab7b9a0-fbf6-447c-9af5-ff5b12e92fa8', '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', NOW() - INTERVAL '3 days 6 hours', 'フルボディワークアウト', 35.6762, 139.6503, NOW() - INTERVAL '3 days 6 hours'),

-- 4日前（1回チェックイン）
('0ab7b9a0-fbf6-447c-9af5-ff5b12e92fa8', '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r', NOW() - INTERVAL '4 days 5 hours', 'HIITトレーニング。きつかった...', 35.6580, 139.7016, NOW() - INTERVAL '4 days 5 hours'),

-- 5日前（2回チェックイン）
('0ab7b9a0-fbf6-447c-9af5-ff5b12e92fa8', '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', NOW() - INTERVAL '5 days 3 hours', '胸トレ。ベンチプレス調子良い', 35.6762, 139.6503, NOW() - INTERVAL '5 days 3 hours'),
('0ab7b9a0-fbf6-447c-9af5-ff5b12e92fa8', '6f7g8h9i-0j1k-2l3m-4n5o-6p7q8r9s0t1u', NOW() - INTERVAL '5 days 8 hours', 'ヨガクラス参加。柔軟性向上中', 35.6684, 139.7690, NOW() - INTERVAL '5 days 8 hours'),

-- 6日前（1回チェックイン）
('0ab7b9a0-fbf6-447c-9af5-ff5b12e92fa8', '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', NOW() - INTERVAL '6 days 4 hours', '脚の日。レッグプレス200kg！', 35.6895, 139.6917, NOW() - INTERVAL '6 days 4 hours'),

-- 7日前（1回チェックイン - 連続記録スタート）
('0ab7b9a0-fbf6-447c-9af5-ff5b12e92fa8', '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', NOW() - INTERVAL '7 days 5 hours', '新しい週のスタート！目標達成するぞ', 35.6762, 139.6503, NOW() - INTERVAL '7 days 5 hours'),

-- 他のユーザーのチェックイン（フィード表示用）
('5da8ed48-e07f-47f8-9fa5-56b5c4a0b6f0', '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', NOW() - INTERVAL '1 hour', 'モーニングワークアウト☀️', 35.6762, 139.6503, NOW() - INTERVAL '1 hour'),
('8bc6a4d3-9e9e-41c4-9b77-6d2e8c5a1f3e', '2b3c4d5e-6f7g-8h9i-0j1k-2l3m4n5o6p7q', NOW() - INTERVAL '3 hours', '今日も頑張った！', 35.6895, 139.6917, NOW() - INTERVAL '3 hours'),
('cde7a8b9-1234-5678-90ab-cdef12345678', '3c4d5e6f-7g8h-9i0j-1k2l-3m4n5o6p7q8r', NOW() - INTERVAL '4 hours', '初めてのジム、緊張した〜', 35.6580, 139.7016, NOW() - INTERVAL '4 hours'),
('def89abc-2345-6789-01bc-def234567890', '1a2b3c4d-5e6f-7g8h-9i0j-1k2l3m4n5o6p', NOW() - INTERVAL '6 hours', 'パーソナルトレーニング受けてきた', 35.6762, 139.6503, NOW() - INTERVAL '6 hours'),
('ef90abcd-3456-7890-12cd-ef3456789012', '4d5e6f7g-8h9i-0j1k-2l3m-4n5o6p7q8r9s', NOW() - INTERVAL '7 hours', 'ランニング10km完走！', 35.7090, 139.7319, NOW() - INTERVAL '7 hours');

-- チェックイン統計の確認用クエリ
-- SELECT
--   COUNT(*) as total_checkins,
--   COUNT(DISTINCT gym_id) as unique_gyms,
--   COUNT(DISTINCT DATE(checked_in_at)) as unique_days,
--   COUNT(CASE WHEN checked_in_at > NOW() - INTERVAL '7 days' THEN 1 END) as this_week
-- FROM check_ins
-- WHERE user_id = '0ab7b9a0-fbf6-447c-9af5-ff5b12e92fa8';