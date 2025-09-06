INSERT INTO users (id, email, username, display_name, bio, is_active, email_verified)
VALUES (
  'mock-user-id',
  'test@gymtopia.app',
  'muscle_taro',
  '筋トレマニア太郎',
  '筋トレが人生！毎日ジムに通って理想のボディを目指してます💪',
  true,
  true
) ON CONFLICT (id) DO UPDATE SET
  email = EXCLUDED.email,
  username = EXCLUDED.username,
  display_name = EXCLUDED.display_name,
  bio = EXCLUDED.bio;

INSERT INTO user_profiles (user_id, gym_experience_years, training_frequency, training_goals, preferred_training_time, height_cm, weight_kg, body_fat_percentage, profile_visibility, show_stats)
VALUES (
  'mock-user-id',
  5,
  'daily',
  'muscle_gain',
  'morning',
  175,
  75,
  12.5,
  'public',
  true
) ON CONFLICT (user_id) DO UPDATE SET
  gym_experience_years = EXCLUDED.gym_experience_years,
  training_frequency = EXCLUDED.training_frequency,
  training_goals = EXCLUDED.training_goals,
  preferred_training_time = EXCLUDED.preferred_training_time,
  height_cm = EXCLUDED.height_cm,
  weight_kg = EXCLUDED.weight_kg,
  body_fat_percentage = EXCLUDED.body_fat_percentage,
  profile_visibility = EXCLUDED.profile_visibility,
  show_stats = EXCLUDED.show_stats;

INSERT INTO user_profile_stats (
  user_id, total_workouts, total_sets, total_reps, total_volume, 
  average_workout_duration, streak, favorite_exercise, strongest_lift, 
  max_bench, max_squat, max_deadlift, workout_frequency
) VALUES (
  'mock-user-id',
  42,
  256,
  3840,
  15680,
  75,
  7,
  'ベンチプレス',
  'デッドリフト',
  100,
  120,
  140,
  4.2
) ON CONFLICT (user_id) DO UPDATE SET
  total_workouts = EXCLUDED.total_workouts,
  total_sets = EXCLUDED.total_sets,
  total_reps = EXCLUDED.total_reps,
  total_volume = EXCLUDED.total_volume,
  average_workout_duration = EXCLUDED.average_workout_duration,
  streak = EXCLUDED.streak,
  favorite_exercise = EXCLUDED.favorite_exercise,
  strongest_lift = EXCLUDED.strongest_lift,
  max_bench = EXCLUDED.max_bench,
  max_squat = EXCLUDED.max_squat,
  max_deadlift = EXCLUDED.max_deadlift,
  workout_frequency = EXCLUDED.workout_frequency;

INSERT INTO achievements (id, user_id, type, title, description, icon, earned_at, is_unlocked) VALUES
  ('ach-1', 'mock-user-id', 'strength', 'ベンチプレス100kg達成', 'ベンチプレスで100kgを達成しました！', '💪', NOW() - INTERVAL '7 days', true),
  ('ach-2', 'mock-user-id', 'consistency', '7日連続トレーニング', '7日連続でトレーニングを行いました！', '🔥', NOW() - INTERVAL '1 day', true),
  ('ach-3', 'mock-user-id', 'milestone', '初回ワークアウト', 'GYMTOPIAでの初めてのワークアウトを記録しました！', '🎉', NOW() - INTERVAL '30 days', true)
ON CONFLICT (id) DO UPDATE SET
  type = EXCLUDED.type,
  title = EXCLUDED.title,
  description = EXCLUDED.description,
  icon = EXCLUDED.icon,
  earned_at = EXCLUDED.earned_at,
  is_unlocked = EXCLUDED.is_unlocked;

INSERT INTO personal_records (id, user_id, exercise, weight, reps, one_rep_max, achieved_at, notes) VALUES
  ('pr-1', 'mock-user-id', 'ベンチプレス', 100, 1, 100, NOW() - INTERVAL '7 days', '念願の100kg達成！'),
  ('pr-2', 'mock-user-id', 'スクワット', 120, 3, 127, NOW() - INTERVAL '14 days', '3回できた！次は125kgに挑戦'),
  ('pr-3', 'mock-user-id', 'デッドリフト', 140, 1, 140, NOW() - INTERVAL '21 days', 'フォーム意識して安全に'),
  ('pr-4', 'mock-user-id', 'ショルダープレス', 60, 5, 67, NOW() - INTERVAL '28 days', '肩の調子が良好')
ON CONFLICT (id) DO UPDATE SET
  exercise = EXCLUDED.exercise,
  weight = EXCLUDED.weight,
  reps = EXCLUDED.reps,
  one_rep_max = EXCLUDED.one_rep_max,
  achieved_at = EXCLUDED.achieved_at,
  notes = EXCLUDED.notes;

INSERT INTO posts (id, user_id, content, post_type, workout_data, created_at) VALUES
  ('mock-post-1', 'mock-user-id', '今日は胸トレ完了！新しいHammer Strengthのマシンが最高でした。フォームが安定して重量も上がった感じです。', 'workout', '{"exercises": [{"name": "ベンチプレス", "sets": 4, "reps": 8, "weight": 95}, {"name": "インクラインプレス", "sets": 3, "reps": 10, "weight": 70}], "duration": 75}', NOW() - INTERVAL '2 hours'),
  ('mock-post-2', 'mock-user-id', 'プロテインバーのレビュー：チョコレート味は美味しいけど、ちょっと甘すぎるかな。トレーニング後のエネルギー補給には十分です💪', 'review', NULL, NOW() - INTERVAL '1 day'),
  ('mock-post-3', 'mock-user-id', '新しいジム「ROGUEクロストレーニング新宿」に行ってきました！設備が充実していて、特にクロスフィット用の器具が豊富でした。スタッフも親切で初心者にも優しそうです。', 'gym_review', '{"gym_id": "gym-2", "rating": 4.6}', NOW() - INTERVAL '3 days'),
  ('mock-post-4', 'mock-user-id', 'スクワットでついに120kg×3回達成！ 前回は2回で限界だったから、着実に進歩してる。次の目標は125kg×1回。', 'achievement', '{"exercise": "スクワット", "weight": 120, "reps": 3}', NOW() - INTERVAL '5 days')
ON CONFLICT (id) DO UPDATE SET
  content = EXCLUDED.content,
  post_type = EXCLUDED.post_type,
  workout_data = EXCLUDED.workout_data,
  created_at = EXCLUDED.created_at;

INSERT INTO post_likes (id, post_id, user_id, created_at) VALUES
  (gen_random_uuid(), 'mock-post-1', 'mock-user-id', NOW() - INTERVAL '1 hour'),
  (gen_random_uuid(), 'mock-post-3', 'mock-user-id', NOW() - INTERVAL '2 days'),
  (gen_random_uuid(), 'mock-post-4', 'mock-user-id', NOW() - INTERVAL '4 days')
ON CONFLICT DO NOTHING;

INSERT INTO user_posts (id, user_id, title, content, images, created_at) VALUES
  ('user-post-1', 'mock-user-id', 'ベンチプレス100kg達成記録', 'ついにベンチプレスで100kgを達成しました！長い道のりでしたが、毎日の積み重ねが実を結びました。フォームを意識して安全第一でトレーニングを続けた結果です。', '[]', NOW() - INTERVAL '7 days'),
  ('user-post-2', 'mock-user-id', '筋トレ1年間の変化', '筋トレを始めて1年が経過しました。体重は5kg増加しましたが、体脂肪率は3%減少。筋肉量が確実に増えています。継続は力なり！', '[]', NOW() - INTERVAL '20 days'),
  ('user-post-3', 'mock-user-id', 'おすすめプロテインレビュー', '最近試したプロテインの中で一番美味しかったのはチョコレート風味のもの。溶けやすさも◎で、トレーニング後の回復が早くなった気がします。', '[]', NOW() - INTERVAL '15 days')
ON CONFLICT (id) DO UPDATE SET
  title = EXCLUDED.title,
  content = EXCLUDED.content,
  images = EXCLUDED.images,
  created_at = EXCLUDED.created_at;

INSERT INTO users (id, email, username, display_name, is_active) VALUES
  ('user-2', 'user2@example.com', 'gym_buddy', 'ジム仲間', true),
  ('user-3', 'user3@example.com', 'fitness_lover', 'フィットネス愛好家', true)
ON CONFLICT (id) DO NOTHING;

INSERT INTO follows (follower_id, following_id, created_at) VALUES
  ('user-2', 'mock-user-id', NOW() - INTERVAL '10 days'),
  ('user-3', 'mock-user-id', NOW() - INTERVAL '5 days'),
  ('mock-user-id', 'user-2', NOW() - INTERVAL '8 days')
ON CONFLICT (follower_id, following_id) DO NOTHING;