-- 筋トレマニア太郎 完全テストデータ投入
-- Supabase SQLエディタで実行してください

-- プロファイル作成（テストユーザー）
INSERT INTO public.profiles (
  id, 
  username, 
  display_name, 
  bio, 
  avatar_url, 
  location, 
  training_frequency, 
  is_public, 
  created_at, 
  updated_at
) VALUES (
  'mock-user-id',  -- UUIDの代わりにテスト用文字列ID
  'muscle_taro',
  '筋トレマニア太郎',
  '筋トレ歴5年｜ベンチプレス115kg｜スクワット150kg｜デッドリフト180kg｜ジムで最高の一日を',
  '/muscle-taro-avatar.svg',
  '東京',
  '週5-6回',
  true,
  '2023-04-15 10:00:00',
  NOW()
) ON CONFLICT (id) DO UPDATE SET
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  avatar_url = EXCLUDED.avatar_url,
  location = EXCLUDED.location,
  training_frequency = EXCLUDED.training_frequency,
  updated_at = NOW();

-- パーソナルレコード投入
INSERT INTO public.personal_records (
  id, user_id, exercise_name, weight, reps, record_type, achieved_at, created_at
) VALUES 
  (gen_random_uuid(), 'mock-user-id', 'ベンチプレス', 120, 1, '1RM', '2023-12-15 18:30:00', '2023-12-15 18:30:00'),
  (gen_random_uuid(), 'mock-user-id', 'スクワット', 130, 5, '5RM', '2023-11-20 19:00:00', '2023-11-20 19:00:00'),
  (gen_random_uuid(), 'mock-user-id', 'デッドリフト', 150, 1, '1RM', '2023-10-10 17:45:00', '2023-10-10 17:45:00'),
  (gen_random_uuid(), 'mock-user-id', 'ショルダープレス', 60, 8, '8RM', '2023-09-25 18:15:00', '2023-09-25 18:15:00'),
  (gen_random_uuid(), 'mock-user-id', 'バーベルロウ', 90, 6, '6RM', '2023-08-30 19:30:00', '2023-08-30 19:30:00')
ON CONFLICT DO NOTHING;

-- 達成記録投入
INSERT INTO public.achievements (
  id, user_id, title, description, achievement_type, badge_icon, earned_at, created_at
) VALUES 
  (gen_random_uuid(), 'mock-user-id', '初回記録', '初めてのワークアウトセッションを完了', 'first_workout', '🏆', '2023-06-01 20:00:00', '2023-06-01 20:00:00'),
  (gen_random_uuid(), 'mock-user-id', '100日連続ジム通い', '100日間連続でトレーニング', 'streak', '🔥', '2023-08-15 19:30:00', '2023-08-15 19:30:00'),
  (gen_random_uuid(), 'mock-user-id', 'ジム新人100突破', 'ジム仲間100人達成', 'social', '🎯', '2023-10-20 16:00:00', '2023-10-20 16:00:00'),
  (gen_random_uuid(), 'mock-user-id', 'ベンチプレス100kg達成', 'ベンチプレス100kg突破', 'personal_record', '💪', '2023-12-01 18:00:00', '2023-12-01 18:00:00')
ON CONFLICT DO NOTHING;

-- ジム投入（もしまだなければ）
INSERT INTO public.gyms (
  id, name, area, address, latitude, longitude, 
  phone, business_hours, facilities, day_pass_fee, 
  is_24_hours, has_parking, has_shower, has_locker, 
  rating, total_reviews, created_at
) VALUES 
  ('gym-shibuya-01', 'ハンマーストレングス渋谷', '渋谷', '東京都渋谷区神南1-20-17', 35.6595, 139.7004, 
   '03-1234-5678', '{"monday": "6:00-24:00", "tuesday": "6:00-24:00", "wednesday": "6:00-24:00", "thursday": "6:00-24:00", "friday": "6:00-24:00", "saturday": "8:00-22:00", "sunday": "8:00-22:00"}', 
   '["フリーウェイト", "マシン", "カーディオ", "スタジオ"]', 2500, 
   false, true, true, true, 
   4.3, 234, '2023-01-15 10:00:00'),
  ('gym-shinjuku-01', 'ROGUEクロストレーニング新宿', '新宿', '東京都新宿区西新宿1-1-3', 35.6896, 139.6995, 
   '03-2345-6789', '{"monday": "24時間", "tuesday": "24時間", "wednesday": "24時間", "thursday": "24時間", "friday": "24時間", "saturday": "24時間", "sunday": "24時間"}', 
   '["クロスフィット", "フリーウェイト", "ファンクショナル"]', 3000, 
   true, true, true, true, 
   4.5, 189, '2023-02-01 14:30:00'),
  ('gym-ginza-01', 'プレミアムフィットネス銀座', '銀座', '東京都中央区銀座4-1-1', 35.6718, 139.7640, 
   '03-3456-7890', '{"monday": "7:00-23:00", "tuesday": "7:00-23:00", "wednesday": "7:00-23:00", "thursday": "7:00-23:00", "friday": "7:00-23:00", "saturday": "9:00-21:00", "sunday": "9:00-21:00"}', 
   '["プール", "サウナ", "マシン", "パーソナル"]', 4000, 
   false, true, true, true, 
   4.7, 456, '2023-01-20 11:15:00')
ON CONFLICT DO NOTHING;

-- お気に入りジム
INSERT INTO public.favorite_gyms (
  id, user_id, gym_id, created_at
) VALUES 
  (gen_random_uuid(), 'mock-user-id', 'gym-shibuya-01', '2023-06-10 10:30:00'),
  (gen_random_uuid(), 'mock-user-id', 'gym-shinjuku-01', '2023-07-15 14:20:00')
ON CONFLICT DO NOTHING;

-- ワークアウトセッション（最近の分）
INSERT INTO public.workout_sessions (
  id, user_id, gym_id, started_at, ended_at, total_weight_lifted, created_at
) VALUES 
  (gen_random_uuid(), 'mock-user-id', 'gym-shibuya-01', '2024-01-05 18:00:00', '2024-01-05 19:30:00', 2750, '2024-01-05 19:30:00'),
  (gen_random_uuid(), 'mock-user-id', 'gym-shinjuku-01', '2024-01-03 19:00:00', '2024-01-03 20:15:00', 3200, '2024-01-03 20:15:00'),
  (gen_random_uuid(), 'mock-user-id', 'gym-shibuya-01', '2024-01-01 17:00:00', '2024-01-01 18:45:00', 2900, '2024-01-01 18:45:00')
ON CONFLICT DO NOTHING;

-- ジム活投稿
INSERT INTO public.gym_posts (
  id, user_id, workout_session_id, content, training_details, 
  is_public, likes_count, comments_count, shares_count, created_at
) VALUES 
  (gen_random_uuid(), 'mock-user-id', 
   (SELECT id FROM public.workout_sessions WHERE user_id = 'mock-user-id' ORDER BY created_at DESC LIMIT 1),
   '今日はベンチプレス115kgが上がった！新年から絶好調💪 継続は力なり！',
   '{"exercises": [{"name": "ベンチプレス", "weight": [115], "sets": 3, "reps": [5, 4, 3]}, {"name": "インクラインプレス", "weight": [85], "sets": 3, "reps": [8, 7, 6]}]}',
   true, 15, 3, 2, '2024-01-05 19:35:00'),
  (gen_random_uuid(), 'mock-user-id', 
   (SELECT id FROM public.workout_sessions WHERE user_id = 'mock-user-id' ORDER BY created_at DESC OFFSET 1 LIMIT 1),
   '新年初トレ！ROGUEでクロストレーニング🔥 体が重いけど気合で乗り切った',
   '{"exercises": [{"name": "デッドリフト", "weight": [140], "sets": 3, "reps": [3, 2, 1]}, {"name": "スクワット", "weight": [120], "sets": 4, "reps": [8, 6, 5, 4]}]}',
   true, 12, 5, 1, '2024-01-03 20:20:00'),
  (gen_random_uuid(), 'mock-user-id', 
   (SELECT id FROM public.workout_sessions WHERE user_id = 'mock-user-id' ORDER BY created_at DESC OFFSET 2 LIMIT 1),
   '2024年のトレーニング開始！今年も筋トレ頑張るぞ💪 目標はベンチ120kg！',
   '{"exercises": [{"name": "ベンチプレス", "weight": [110], "sets": 4, "reps": [6, 5, 4, 3]}, {"name": "ダンベルフライ", "weight": [32.5], "sets": 3, "reps": [12, 10, 8]}]}',
   true, 8, 2, 0, '2024-01-01 18:50:00')
ON CONFLICT DO NOTHING;

-- プロフィール統計ビュー用のデータ確認（計算値更新）
-- これは実際のクエリで動的に計算されるため、手動挿入は不要

RAISE NOTICE 'テストデータの投入が完了しました';
RAISE NOTICE 'ユーザーID: mock-user-id (筋トレマニア太郎)';
RAISE NOTICE 'パーソナルレコード: 5件';
RAISE NOTICE '達成記録: 4件';
RAISE NOTICE 'ジム: 3件';
RAISE NOTICE 'ワークアウトセッション: 3件';
RAISE NOTICE 'ジム活投稿: 3件';