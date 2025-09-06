-- フォロー・フォロワー機能のテストデータ追加

-- 他のテストユーザーを作成（筋トレマニア太郎がフォローする相手）
INSERT INTO public.profiles (
  id, username, display_name, bio, avatar_url, location, 
  training_frequency, is_verified, is_public, joined_date, created_at, updated_at
) VALUES 
  ('user-fitness-girl', 'fitness_girl_tokyo', 'フィットネス女子まい', 'ヨガ＆筋トレでボディメイク中💕 理想のスタイルを目指してます！', '/default-avatar.png', '東京', '週4-5回', false, true, '2023-05-01 10:00:00', '2023-05-01 10:00:00', NOW()),
  ('user-powerlifter', 'heavy_lifter_japan', 'パワーリフター健', 'パワーリフティング歴8年。SBD合計600kg突破が目標🔥', '/default-avatar.png', '大阪', '週6-7回', true, true, '2022-03-15 14:30:00', '2022-03-15 14:30:00', NOW()),
  ('user-beginner', 'gym_newbie_2024', 'ジム初心者ゆうき', '2024年からジムデビュー！先輩方、よろしくお願いします🙇‍♂️', '/default-avatar.png', '埼玉', '週2-3回', false, true, '2024-01-01 09:00:00', '2024-01-01 09:00:00', NOW()),
  ('user-crossfit', 'crossfit_master_ryu', 'クロスフィット龍', 'CrossFit Level 2 Trainer | 毎日が筋肉痛💪', '/default-avatar.png', '神奈川', '毎日', true, true, '2021-08-20 16:45:00', '2021-08-20 16:45:00', NOW()),
  ('user-bodybuilder', 'physique_champion', 'ボディビルダー誠', 'フィジーク競技者 | 2023年関東大会3位入賞🏆', '/default-avatar.png', '千葉', '週5-6回', true, true, '2020-06-10 11:20:00', '2020-06-10 11:20:00', NOW())
ON CONFLICT (id) DO UPDATE SET
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio,
  updated_at = NOW();

-- 筋トレマニア太郎のフォロー関係を設定
-- 太郎がフォローしているユーザー
INSERT INTO public.follows (
  id, follower_id, following_id, created_at
) VALUES 
  (gen_random_uuid(), 'mock-user-id', 'user-fitness-girl', '2023-07-15 10:30:00'),
  (gen_random_uuid(), 'mock-user-id', 'user-powerlifter', '2023-08-20 14:45:00'),
  (gen_random_uuid(), 'mock-user-id', 'user-crossfit', '2023-09-10 16:20:00'),
  (gen_random_uuid(), 'mock-user-id', 'user-bodybuilder', '2023-10-05 11:15:00')
ON CONFLICT (follower_id, following_id) DO NOTHING;

-- 太郎をフォローしているユーザー
INSERT INTO public.follows (
  id, follower_id, following_id, created_at
) VALUES 
  (gen_random_uuid(), 'user-fitness-girl', 'mock-user-id', '2023-07-20 12:00:00'),
  (gen_random_uuid(), 'user-powerlifter', 'mock-user-id', '2023-08-25 15:30:00'),
  (gen_random_uuid(), 'user-beginner', 'mock-user-id', '2024-01-02 09:45:00'),
  (gen_random_uuid(), 'user-crossfit', 'mock-user-id', '2023-09-15 18:10:00'),
  (gen_random_uuid(), 'user-bodybuilder', 'mock-user-id', '2023-10-10 13:25:00'),
  -- 追加フォロワー（他のユーザー同士もフォローし合う）
  (gen_random_uuid(), 'user-beginner', 'user-fitness-girl', '2024-01-05 10:15:00'),
  (gen_random_uuid(), 'user-fitness-girl', 'user-powerlifter', '2023-09-01 14:20:00'),
  (gen_random_uuid(), 'user-crossfit', 'user-bodybuilder', '2023-11-01 16:30:00')
ON CONFLICT (follower_id, following_id) DO NOTHING;

-- ジム友関係も追加
INSERT INTO public.gym_friends (
  id, user1_id, user2_id, gym_id, initiated_by, friendship_status, created_at, accepted_at
) VALUES 
  (gen_random_uuid(), 'mock-user-id', 'user-powerlifter', 'gym-shibuya-01', 'mock-user-id', 'accepted', '2023-08-30 17:00:00', '2023-08-31 10:30:00'),
  (gen_random_uuid(), 'mock-user-id', 'user-crossfit', 'gym-shinjuku-01', 'user-crossfit', 'accepted', '2023-09-20 19:15:00', '2023-09-21 08:45:00')
ON CONFLICT (user1_id, user2_id) DO NOTHING;

-- 他のユーザーの投稿も少し追加（フィードを豊かにするため）
INSERT INTO public.gym_posts (
  id, user_id, content, training_details, 
  is_public, likes_count, comments_count, shares_count, created_at, updated_at
) VALUES 
  (gen_random_uuid(), 'user-fitness-girl', 
   'ヒップアップ集中トレーニング🍑 スクワット頑張りました！', 
   '{"exercises": [{"name": "スクワット", "weight": [40], "sets": 4, "reps": [15, 12, 10, 8]}, {"name": "ヒップスラスト", "weight": [60], "sets": 3, "reps": [12, 10, 8]}]}',
   true, 8, 2, 1, '2024-01-04 18:20:00', '2024-01-04 18:20:00'),
  (gen_random_uuid(), 'user-powerlifter', 
   'SBD練習日💪 デッドリフト200kg×3できた！調子上がってきてる🔥', 
   '{"exercises": [{"name": "デッドリフト", "weight": [200], "sets": 5, "reps": [3, 3, 3, 2, 1]}, {"name": "ベンチプレス", "weight": [120], "sets": 4, "reps": [5, 4, 3, 2]}]}',
   true, 12, 5, 3, '2024-01-02 20:45:00', '2024-01-02 20:45:00'),
  (gen_random_uuid(), 'user-beginner', 
   'ジム2週間目！まだ筋肉痛がひどいけど、続けてます😅 アドバイスお願いします！', 
   '{"exercises": [{"name": "ベンチプレス", "weight": [40], "sets": 3, "reps": [10, 8, 6]}, {"name": "ラットプルダウン", "weight": [35], "sets": 3, "reps": [12, 10, 8]}]}',
   true, 6, 8, 0, '2024-01-06 16:30:00', '2024-01-06 16:30:00')
ON CONFLICT DO NOTHING;

-- いいねも追加（投稿間の相互作用）
INSERT INTO public.post_likes (
  id, user_id, post_id, created_at
) VALUES 
  -- 太郎の投稿への「いいね」
  (gen_random_uuid(), 'user-fitness-girl', (SELECT id FROM gym_posts WHERE user_id = 'mock-user-id' ORDER BY created_at DESC LIMIT 1), '2024-01-05 20:00:00'),
  (gen_random_uuid(), 'user-powerlifter', (SELECT id FROM gym_posts WHERE user_id = 'mock-user-id' ORDER BY created_at DESC LIMIT 1), '2024-01-05 20:15:00'),
  (gen_random_uuid(), 'user-beginner', (SELECT id FROM gym_posts WHERE user_id = 'mock-user-id' ORDER BY created_at DESC LIMIT 1), '2024-01-06 10:30:00'),
  -- 太郎が他の投稿に「いいね」
  (gen_random_uuid(), 'mock-user-id', (SELECT id FROM gym_posts WHERE user_id = 'user-fitness-girl' LIMIT 1), '2024-01-04 19:00:00'),
  (gen_random_uuid(), 'mock-user-id', (SELECT id FROM gym_posts WHERE user_id = 'user-powerlifter' LIMIT 1), '2024-01-03 07:30:00'),
  (gen_random_uuid(), 'mock-user-id', (SELECT id FROM gym_posts WHERE user_id = 'user-beginner' LIMIT 1), '2024-01-06 17:00:00')
ON CONFLICT (user_id, post_id) DO NOTHING;

-- コメントも追加
INSERT INTO public.post_comments (
  id, user_id, post_id, content, created_at, updated_at
) VALUES 
  -- 太郎の投稿へのコメント
  (gen_random_uuid(), 'user-powerlifter', 
   (SELECT id FROM gym_posts WHERE user_id = 'mock-user-id' ORDER BY created_at DESC LIMIT 1), 
   'さすが太郎さん！115kg上がるなんて凄いです💪', '2024-01-05 20:30:00', '2024-01-05 20:30:00'),
  (gen_random_uuid(), 'user-fitness-girl', 
   (SELECT id FROM gym_posts WHERE user_id = 'mock-user-id' ORDER BY created_at DESC LIMIT 1), 
   'いつもお疲れ様です✨ 私も頑張ります！', '2024-01-05 21:00:00', '2024-01-05 21:00:00'),
  -- 太郎が他の投稿にコメント
  (gen_random_uuid(), 'mock-user-id', 
   (SELECT id FROM gym_posts WHERE user_id = 'user-beginner' LIMIT 1), 
   '始めたばかりでも継続が一番大事！一緒に頑張りましょう🔥', '2024-01-06 17:30:00', '2024-01-06 17:30:00')
ON CONFLICT DO NOTHING;

-- 統計を更新するために、投稿のいいね数とコメント数を更新
UPDATE public.gym_posts 
SET likes_count = (SELECT COUNT(*) FROM post_likes WHERE post_id = gym_posts.id),
    comments_count = (SELECT COUNT(*) FROM post_comments WHERE post_id = gym_posts.id)
WHERE user_id IN ('mock-user-id', 'user-fitness-girl', 'user-powerlifter', 'user-beginner');

-- 完了メッセージ
DO $$
BEGIN
    RAISE NOTICE 'ソーシャル機能のテストデータ投入完了！';
    RAISE NOTICE '✅ テストユーザー: 5人';
    RAISE NOTICE '✅ フォロー関係: 太郎→4人フォロー、太郎←5人フォロワー';
    RAISE NOTICE '✅ ジム友: 2人';
    RAISE NOTICE '✅ 他ユーザーの投稿: 3件';
    RAISE NOTICE '✅ いいね・コメント: 相互作用あり';
    RAISE NOTICE '';
    RAISE NOTICE 'フォロー・フォロワー数がプロフィールに反映されます！';
END $$;