-- Test Profile Data for GYMTOPIA 2.0
-- Insert sample data to test profile functionality
-- Created: 2025-09-06

-- Insert test user profile
INSERT INTO public.profiles (
    id, 
    display_name, 
    username, 
    bio, 
    location, 
    avatar_url, 
    joined_at, 
    is_verified, 
    workout_streak, 
    total_workouts,
    created_at,
    updated_at
) VALUES (
    'mock-user-id',
    '筋トレマニア太郎',
    'muscle_taro',
    '筋トレ歴5年｜ベンチプレス115kg｜スクワット150kg｜デッドリフト180kg｜ジムで最高の一日を',
    '東京',
    '/muscle-taro-avatar.svg',
    '2023-04-01 00:00:00+00',
    true,
    7,
    108,
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    display_name = EXCLUDED.display_name,
    username = EXCLUDED.username,
    bio = EXCLUDED.bio,
    location = EXCLUDED.location,
    avatar_url = EXCLUDED.avatar_url,
    joined_at = EXCLUDED.joined_at,
    is_verified = EXCLUDED.is_verified,
    workout_streak = EXCLUDED.workout_streak,
    total_workouts = EXCLUDED.total_workouts,
    updated_at = NOW();

-- Insert test gym
INSERT INTO public.gyms (id, name, area, description, created_at, updated_at)
VALUES (
    'test-gym-1',
    'ハンマーストレングス渋谷',
    '渋谷',
    '最新のマシンが揃ったプレミアムジム',
    NOW(),
    NOW()
) ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    area = EXCLUDED.area,
    description = EXCLUDED.description,
    updated_at = NOW();

-- Insert test workout sessions (last 2 weeks)
INSERT INTO public.workout_sessions (id, user_id, gym_id, started_at, ended_at, total_weight_lifted, exercises_count, notes, created_at)
VALUES 
    ('session-1', 'mock-user-id', 'test-gym-1', '2025-09-05 18:00:00+00', '2025-09-05 19:45:00+00', 2850, 6, '胸・三頭筋の日', NOW()),
    ('session-2', 'mock-user-id', 'test-gym-1', '2025-09-04 19:00:00+00', '2025-09-04 20:30:00+00', 3100, 7, '脚トレDAY', NOW()),
    ('session-3', 'mock-user-id', 'test-gym-1', '2025-09-03 18:30:00+00', '2025-09-03 20:00:00+00', 2750, 5, '背中・二頭筋', NOW()),
    ('session-4', 'mock-user-id', 'test-gym-1', '2025-09-02 18:00:00+00', '2025-09-02 19:30:00+00', 2400, 6, '肩・体幹', NOW()),
    ('session-5', 'mock-user-id', 'test-gym-1', '2025-09-01 17:30:00+00', '2025-09-01 19:15:00+00', 2950, 6, '全身トレーニング', NOW())
ON CONFLICT (id) DO UPDATE SET
    started_at = EXCLUDED.started_at,
    ended_at = EXCLUDED.ended_at,
    total_weight_lifted = EXCLUDED.total_weight_lifted,
    exercises_count = EXCLUDED.exercises_count,
    notes = EXCLUDED.notes;

-- Insert test workout exercises
INSERT INTO public.workout_exercises (id, session_id, exercise_name, sets, reps, weight, created_at)
VALUES 
    ('exercise-1', 'session-1', 'ベンチプレス', 5, ARRAY[10, 8, 6, 5, 4], ARRAY[80, 90, 100, 110, 115], NOW()),
    ('exercise-2', 'session-1', 'インクラインダンベルプレス', 4, ARRAY[12, 10, 8, 6], ARRAY[30, 35, 40, 45], NOW()),
    ('exercise-3', 'session-2', 'スクワット', 5, ARRAY[12, 10, 8, 6, 5], ARRAY[100, 120, 130, 140, 150], NOW()),
    ('exercise-4', 'session-2', 'デッドリフト', 4, ARRAY[8, 6, 4, 2], ARRAY[120, 140, 160, 180], NOW())
ON CONFLICT (id) DO UPDATE SET
    sets = EXCLUDED.sets,
    reps = EXCLUDED.reps,
    weight = EXCLUDED.weight;

-- Insert test personal records
INSERT INTO public.personal_records (id, user_id, exercise_name, record_type, weight, reps, achieved_at, gym_id, created_at)
VALUES 
    ('pr-1', 'mock-user-id', 'ベンチプレス', '1rm', 120, 1, '2025-08-15 19:30:00+00', 'test-gym-1', NOW()),
    ('pr-2', 'mock-user-id', 'スクワット', '5rm', 130, 5, '2025-08-20 18:45:00+00', 'test-gym-1', NOW()),
    ('pr-3', 'mock-user-id', 'デッドリフト', '1rm', 150, 1, '2025-08-25 19:15:00+00', 'test-gym-1', NOW()),
    ('pr-4', 'mock-user-id', 'ショルダープレス', '8rm', 60, 8, '2025-08-30 18:20:00+00', 'test-gym-1', NOW())
ON CONFLICT (id) DO UPDATE SET
    weight = EXCLUDED.weight,
    reps = EXCLUDED.reps,
    achieved_at = EXCLUDED.achieved_at;

-- Insert test achievements
INSERT INTO public.achievements (id, user_id, achievement_type, title, description, badge_icon, earned_at, metadata)
VALUES 
    ('achievement-1', 'mock-user-id', 'streak', '初回記録', '初めてのワークアウト記録', '🏆', '2023-06-01 00:00:00+00', '{"workout_count": 1}'),
    ('achievement-2', 'mock-user-id', 'streak', '100日連続ジム通い', '100日間連続でジムに通いました', '🔥', '2023-08-01 00:00:00+00', '{"streak_days": 100}'),
    ('achievement-3', 'mock-user-id', 'milestone', 'ジム新人100突破', '100回のワークアウトを達成', '🎯', '2023-10-01 00:00:00+00', '{"total_workouts": 100}'),
    ('achievement-4', 'mock-user-id', 'personal_record', 'ベンチプレス100kg達成', 'ベンチプレス100kgを達成しました', '💪', '2023-12-01 00:00:00+00', '{"exercise": "ベンチプレス", "weight": 100}')
ON CONFLICT (id) DO UPDATE SET
    title = EXCLUDED.title,
    description = EXCLUDED.description,
    earned_at = EXCLUDED.earned_at,
    metadata = EXCLUDED.metadata;

-- Insert test gym posts
INSERT INTO public.gym_posts (id, user_id, workout_session_id, content, likes_count, comments_count, shares_count, is_public, created_at, updated_at)
VALUES 
    ('post-1', 'mock-user-id', 'session-1', '今日は胸トレ！新しいHammer Strengthのチェストプレス最高でした。フォームが安定して重量も上がりました。このジムのマシンは本当に質が高い！', 45, 3, 2, true, '2025-09-05 20:00:00+00', NOW()),
    ('post-2', 'mock-user-id', 'session-2', '脚トレDAY！ROGUEのパワーラックでスクワット130kg×5達成！！！ずっと目標にしていた重量です。チョークを使ったグリップも完璧', 89, 12, 5, true, '2025-09-04 21:00:00+00', NOW()),
    ('post-3', 'mock-user-id', 'session-3', '背中のトレーニング完了。Hammer Strengthのラットプルダウンは可動域が広くて効きが違う。平日昼間は空いていて快適でした。', 67, 8, 3, true, '2025-09-03 20:30:00+00', NOW()),
    ('post-4', 'mock-user-id', 'session-4', '朝トレ最高！24時間営業だから早朝も利用できるのが嬉しい。朝の時間帯は空いていて集中してトレーニングできました。今日も良い一日になりそう★', 34, 5, 1, true, '2025-09-02 19:45:00+00', NOW())
ON CONFLICT (id) DO UPDATE SET
    content = EXCLUDED.content,
    likes_count = EXCLUDED.likes_count,
    comments_count = EXCLUDED.comments_count,
    shares_count = EXCLUDED.shares_count,
    updated_at = NOW();

-- Insert test follows (followers and following)
INSERT INTO public.follows (id, follower_id, following_id, created_at)
VALUES 
    ('follow-1', 'test-user-1', 'mock-user-id', NOW()), -- Someone follows our user
    ('follow-2', 'test-user-2', 'mock-user-id', NOW()),
    ('follow-3', 'test-user-3', 'mock-user-id', NOW()),
    ('follow-4', 'mock-user-id', 'test-user-4', NOW()), -- Our user follows someone
    ('follow-5', 'mock-user-id', 'test-user-5', NOW()),
    ('follow-6', 'mock-user-id', 'test-user-6', NOW())
ON CONFLICT (id) DO NOTHING;

-- Create additional test users for follows to work
INSERT INTO public.profiles (id, display_name, username, created_at, updated_at)
VALUES 
    ('test-user-1', 'テストユーザー1', 'test_user1', NOW(), NOW()),
    ('test-user-2', 'テストユーザー2', 'test_user2', NOW(), NOW()),
    ('test-user-3', 'テストユーザー3', 'test_user3', NOW(), NOW()),
    ('test-user-4', 'テストユーザー4', 'test_user4', NOW(), NOW()),
    ('test-user-5', 'テストユーザー5', 'test_user5', NOW(), NOW()),
    ('test-user-6', 'テストユーザー6', 'test_user6', NOW(), NOW())
ON CONFLICT (id) DO NOTHING;

-- Insert test gym friends
INSERT INTO public.gym_friends (id, user1_id, user2_id, gym_id, friendship_status, initiated_by, accepted_at, created_at)
VALUES 
    ('friend-1', 'mock-user-id', 'test-user-1', 'test-gym-1', 'accepted', 'mock-user-id', NOW(), NOW()),
    ('friend-2', 'mock-user-id', 'test-user-2', 'test-gym-1', 'accepted', 'test-user-2', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    friendship_status = EXCLUDED.friendship_status,
    accepted_at = EXCLUDED.accepted_at;

-- Insert test favorite gyms
INSERT INTO public.favorite_gyms (id, user_id, gym_id, created_at)
VALUES 
    ('fav-1', 'mock-user-id', 'test-gym-1', NOW())
ON CONFLICT (id) DO NOTHING;

-- Additional gyms for favorites
INSERT INTO public.gyms (id, name, area, description, created_at, updated_at)
VALUES 
    ('gym-2', 'ROGUEクロストレーニング新宿', '新宿', 'クロストレーニング専門ジム', NOW(), NOW()),
    ('gym-3', 'プレミアムフィットネス銀座', '銀座', '高級フィットネスクラブ', NOW(), NOW()),
    ('gym-4', 'スーパーパワージム池袋', '池袋', 'パワーリフティング専門', NOW(), NOW())
ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    area = EXCLUDED.area,
    description = EXCLUDED.description,
    updated_at = NOW();

INSERT INTO public.favorite_gyms (id, user_id, gym_id, created_at)
VALUES 
    ('fav-2', 'mock-user-id', 'gym-2', NOW()),
    ('fav-3', 'mock-user-id', 'gym-3', NOW()),
    ('fav-4', 'mock-user-id', 'gym-4', NOW())
ON CONFLICT (id) DO NOTHING;

COMMIT;