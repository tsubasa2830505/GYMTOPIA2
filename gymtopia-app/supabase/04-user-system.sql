-- =====================================================
-- GYMTOPIA 2.0 - ユーザーシステム実装
-- =====================================================
-- 実行前提: Supabase Authenticationを有効化してください
-- Dashboard → Authentication → Settings → Enable Email
-- =====================================================

-- =====================================================
-- 1. profiles テーブル（ユーザープロフィール）
-- =====================================================
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    username TEXT UNIQUE NOT NULL,
    display_name TEXT NOT NULL,
    bio TEXT,
    avatar_url TEXT,
    location TEXT,
    training_level TEXT CHECK (training_level IN ('beginner', 'intermediate', 'advanced', 'professional')),
    training_years INTEGER,
    favorite_gym_id UUID REFERENCES public.gyms(id) ON DELETE SET NULL,
    is_public BOOLEAN DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_profiles_username ON public.profiles(username);
CREATE INDEX IF NOT EXISTS idx_profiles_favorite_gym ON public.profiles(favorite_gym_id);

-- =====================================================
-- 2. follows テーブル（フォロー関係）
-- =====================================================
CREATE TABLE IF NOT EXISTS public.follows (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    follower_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    following_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(follower_id, following_id),
    CHECK (follower_id != following_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- =====================================================
-- 3. gym_reviews テーブル（ジムレビュー）
-- =====================================================
CREATE TABLE IF NOT EXISTS public.gym_reviews (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
    title TEXT,
    content TEXT NOT NULL,
    visit_date DATE,
    is_member BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(gym_id, user_id)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_gym_reviews_gym ON public.gym_reviews(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_reviews_user ON public.gym_reviews(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_reviews_rating ON public.gym_reviews(rating);

-- =====================================================
-- 4. gym_likes テーブル（ジムのお気に入り/行きたい）
-- =====================================================
CREATE TABLE IF NOT EXISTS public.gym_likes (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    gym_id UUID NOT NULL REFERENCES public.gyms(id) ON DELETE CASCADE,
    like_type TEXT NOT NULL CHECK (like_type IN ('favorite', 'want_to_go', 'visited')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, gym_id, like_type)
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_gym_likes_user ON public.gym_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_likes_gym ON public.gym_likes(gym_id);
CREATE INDEX IF NOT EXISTS idx_gym_likes_type ON public.gym_likes(like_type);

-- =====================================================
-- 5. personal_records テーブル（パーソナルレコード）
-- =====================================================
CREATE TABLE IF NOT EXISTS public.personal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    exercise_name TEXT NOT NULL,
    record_type TEXT NOT NULL CHECK (record_type IN ('1rm', '3rm', '5rm', '10rm', 'max_reps', 'max_time')),
    weight DECIMAL(5, 2),
    reps INTEGER,
    duration_seconds INTEGER,
    gym_id UUID REFERENCES public.gyms(id) ON DELETE SET NULL,
    notes TEXT,
    achieved_at DATE NOT NULL DEFAULT CURRENT_DATE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- インデックス
CREATE INDEX IF NOT EXISTS idx_personal_records_user ON public.personal_records(user_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_exercise ON public.personal_records(exercise_name);
CREATE INDEX IF NOT EXISTS idx_personal_records_achieved_at ON public.personal_records(achieved_at DESC);

-- =====================================================
-- 6. トリガー: 新規ユーザー登録時にプロフィール作成
-- =====================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
    INSERT INTO public.profiles (id, username, display_name)
    VALUES (
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'username', NEW.email),
        COALESCE(NEW.raw_user_meta_data->>'full_name', NEW.raw_user_meta_data->>'name', 'ユーザー')
    );
    RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- トリガー削除（既存の場合）して再作成
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =====================================================
-- 7. トリガー: updated_at自動更新
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- 各テーブルにトリガー設定
CREATE TRIGGER update_profiles_updated_at BEFORE UPDATE ON public.profiles
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_gym_reviews_updated_at BEFORE UPDATE ON public.gym_reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_personal_records_updated_at BEFORE UPDATE ON public.personal_records
    FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- =====================================================
-- 8. RLS（Row Level Security）ポリシー
-- =====================================================

-- profiles テーブルのRLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;

-- 誰でもプロフィールを閲覧可能（公開設定の場合）
CREATE POLICY "Public profiles are viewable by everyone" ON public.profiles
    FOR SELECT USING (is_public = true);

-- 自分のプロフィールは常に閲覧可能
CREATE POLICY "Users can view own profile" ON public.profiles
    FOR SELECT USING (auth.uid() = id);

-- 自分のプロフィールのみ更新可能
CREATE POLICY "Users can update own profile" ON public.profiles
    FOR UPDATE USING (auth.uid() = id);

-- follows テーブルのRLS
ALTER TABLE public.follows ENABLE ROW LEVEL SECURITY;

-- 誰でもフォロー関係を閲覧可能
CREATE POLICY "Follow relationships are public" ON public.follows
    FOR SELECT USING (true);

-- ログインユーザーはフォロー可能
CREATE POLICY "Authenticated users can follow" ON public.follows
    FOR INSERT WITH CHECK (auth.uid() = follower_id);

-- 自分のフォローのみ削除可能
CREATE POLICY "Users can unfollow" ON public.follows
    FOR DELETE USING (auth.uid() = follower_id);

-- gym_reviews テーブルのRLS
ALTER TABLE public.gym_reviews ENABLE ROW LEVEL SECURITY;

-- 誰でもレビューを閲覧可能
CREATE POLICY "Reviews are public" ON public.gym_reviews
    FOR SELECT USING (true);

-- ログインユーザーはレビュー投稿可能
CREATE POLICY "Authenticated users can create reviews" ON public.gym_reviews
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 自分のレビューのみ更新可能
CREATE POLICY "Users can update own reviews" ON public.gym_reviews
    FOR UPDATE USING (auth.uid() = user_id);

-- 自分のレビューのみ削除可能
CREATE POLICY "Users can delete own reviews" ON public.gym_reviews
    FOR DELETE USING (auth.uid() = user_id);

-- gym_likes テーブルのRLS
ALTER TABLE public.gym_likes ENABLE ROW LEVEL SECURITY;

-- 誰でもいいね数を閲覧可能
CREATE POLICY "Likes are public" ON public.gym_likes
    FOR SELECT USING (true);

-- ログインユーザーはいいね可能
CREATE POLICY "Authenticated users can like" ON public.gym_likes
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 自分のいいねのみ削除可能
CREATE POLICY "Users can unlike" ON public.gym_likes
    FOR DELETE USING (auth.uid() = user_id);

-- personal_records テーブルのRLS
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;

-- 自分の記録のみ閲覧可能（プライバシー保護）
CREATE POLICY "Users can view own records" ON public.personal_records
    FOR SELECT USING (auth.uid() = user_id);

-- 自分の記録のみ作成可能
CREATE POLICY "Users can create own records" ON public.personal_records
    FOR INSERT WITH CHECK (auth.uid() = user_id);

-- 自分の記録のみ更新可能
CREATE POLICY "Users can update own records" ON public.personal_records
    FOR UPDATE USING (auth.uid() = user_id);

-- 自分の記録のみ削除可能
CREATE POLICY "Users can delete own records" ON public.personal_records
    FOR DELETE USING (auth.uid() = user_id);

-- =====================================================
-- 9. ビュー: ユーザー統計情報
-- =====================================================
CREATE OR REPLACE VIEW public.user_stats AS
SELECT 
    p.id as user_id,
    p.username,
    p.display_name,
    p.avatar_url,
    (SELECT COUNT(*) FROM public.follows WHERE follower_id = p.id) as following_count,
    (SELECT COUNT(*) FROM public.follows WHERE following_id = p.id) as followers_count,
    (SELECT COUNT(*) FROM public.gym_reviews WHERE user_id = p.id) as review_count,
    (SELECT COUNT(*) FROM public.gym_likes WHERE user_id = p.id) as likes_count,
    (SELECT COUNT(*) FROM public.personal_records WHERE user_id = p.id) as pr_count,
    p.created_at
FROM public.profiles p;

-- =====================================================
-- 10. 関数: ジムの評価を更新
-- =====================================================
CREATE OR REPLACE FUNCTION public.update_gym_rating()
RETURNS TRIGGER AS $$
BEGIN
    UPDATE public.gyms
    SET 
        rating = (
            SELECT AVG(rating)::DECIMAL(2,1)
            FROM public.gym_reviews
            WHERE gym_id = COALESCE(NEW.gym_id, OLD.gym_id)
        ),
        review_count = (
            SELECT COUNT(*)
            FROM public.gym_reviews
            WHERE gym_id = COALESCE(NEW.gym_id, OLD.gym_id)
        )
    WHERE id = COALESCE(NEW.gym_id, OLD.gym_id);
    
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- レビュー追加/更新/削除時に評価を自動更新
CREATE TRIGGER update_gym_rating_on_review
    AFTER INSERT OR UPDATE OR DELETE ON public.gym_reviews
    FOR EACH ROW EXECUTE FUNCTION public.update_gym_rating();

-- =====================================================
-- テストユーザー作成用（開発環境のみ）
-- =====================================================
-- 注意: 本番環境では実行しないでください
-- Supabase AuthのダッシュボードまたはAPIでユーザーを作成後、
-- 以下のようなSQLでテストデータを投入できます

/*
-- テストユーザーのプロフィール（Auth登録後に実行）
INSERT INTO public.profiles (id, username, display_name, bio, training_level, training_years)
VALUES 
    ('YOUR_AUTH_USER_ID_1', 'test_user1', 'テストユーザー1', 'フィットネス愛好家です', 'intermediate', 3),
    ('YOUR_AUTH_USER_ID_2', 'test_user2', 'テストユーザー2', '筋トレ初心者です', 'beginner', 1);

-- テストレビュー
INSERT INTO public.gym_reviews (gym_id, user_id, rating, title, content)
SELECT 
    g.id,
    p.id,
    4,
    '素晴らしいジム',
    '設備が充実していて、スタッフも親切です。'
FROM public.gyms g
CROSS JOIN public.profiles p
WHERE g.name LIKE '%ゴールドジム%'
AND p.username = 'test_user1'
LIMIT 1;
*/

-- =====================================================
-- 動作確認用クエリ
-- =====================================================
-- SELECT * FROM public.profiles;
-- SELECT * FROM public.user_stats;
-- SELECT * FROM public.gym_reviews ORDER BY created_at DESC;
-- SELECT g.name, g.rating, g.review_count FROM public.gyms g WHERE g.review_count > 0;