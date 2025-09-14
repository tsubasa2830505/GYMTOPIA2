-- =====================================================
-- Social core alignment (FKs + RLS) for public.users
-- Non-destructive, idempotent where possible
-- =====================================================

-- follows: ensure FKs to users
ALTER TABLE IF EXISTS public.follows
  DROP CONSTRAINT IF EXISTS follows_follower_id_fkey,
  DROP CONSTRAINT IF EXISTS follows_following_id_fkey;
ALTER TABLE IF EXISTS public.follows
  ADD CONSTRAINT follows_follower_id_fkey FOREIGN KEY (follower_id) REFERENCES public.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT follows_following_id_fkey FOREIGN KEY (following_id) REFERENCES public.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_follows_follower ON public.follows(follower_id);
CREATE INDEX IF NOT EXISTS idx_follows_following ON public.follows(following_id);

-- gym_posts: ensure FK to users
ALTER TABLE IF EXISTS public.gym_posts
  DROP CONSTRAINT IF EXISTS gym_posts_user_id_fkey;
ALTER TABLE IF EXISTS public.gym_posts
  ADD CONSTRAINT gym_posts_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_gym_posts_user ON public.gym_posts(user_id);

-- post_likes: ensure FKs
ALTER TABLE IF EXISTS public.post_likes
  DROP CONSTRAINT IF EXISTS post_likes_user_id_fkey,
  DROP CONSTRAINT IF EXISTS post_likes_post_id_fkey;
ALTER TABLE IF EXISTS public.post_likes
  ADD CONSTRAINT post_likes_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT post_likes_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.gym_posts(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_post_likes_user ON public.post_likes(user_id);
CREATE INDEX IF NOT EXISTS idx_post_likes_post ON public.post_likes(post_id);

-- post_comments: ensure FKs
ALTER TABLE IF EXISTS public.post_comments
  DROP CONSTRAINT IF EXISTS post_comments_user_id_fkey,
  DROP CONSTRAINT IF EXISTS post_comments_post_id_fkey;
ALTER TABLE IF EXISTS public.post_comments
  ADD CONSTRAINT post_comments_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT post_comments_post_id_fkey FOREIGN KEY (post_id) REFERENCES public.gym_posts(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_post_comments_user ON public.post_comments(user_id);
CREATE INDEX IF NOT EXISTS idx_post_comments_post ON public.post_comments(post_id);

-- gym_friends: align to users (user_id, friend_id)
ALTER TABLE IF EXISTS public.gym_friends
  DROP CONSTRAINT IF EXISTS gym_friends_user_id_fkey,
  DROP CONSTRAINT IF EXISTS gym_friends_friend_id_fkey;
ALTER TABLE IF EXISTS public.gym_friends
  ADD CONSTRAINT gym_friends_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT gym_friends_friend_id_fkey FOREIGN KEY (friend_id) REFERENCES public.users(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_gym_friends_user ON public.gym_friends(user_id);
CREATE INDEX IF NOT EXISTS idx_gym_friends_friend ON public.gym_friends(friend_id);

-- favorite_gyms: ensure FK to users/gyms
ALTER TABLE IF EXISTS public.favorite_gyms
  DROP CONSTRAINT IF EXISTS favorite_gyms_user_id_fkey,
  DROP CONSTRAINT IF EXISTS favorite_gyms_gym_id_fkey;
ALTER TABLE IF EXISTS public.favorite_gyms
  ADD CONSTRAINT favorite_gyms_user_id_fkey FOREIGN KEY (user_id) REFERENCES public.users(id) ON DELETE CASCADE,
  ADD CONSTRAINT favorite_gyms_gym_id_fkey FOREIGN KEY (gym_id) REFERENCES public.gyms(id) ON DELETE CASCADE;

CREATE INDEX IF NOT EXISTS idx_favorite_gyms_user ON public.favorite_gyms(user_id);
CREATE INDEX IF NOT EXISTS idx_favorite_gyms_gym ON public.favorite_gyms(gym_id);

-- RLS minimal policies (idempotent)
ALTER TABLE IF EXISTS public.follows ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gym_posts ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.post_likes ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.post_comments ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.gym_friends ENABLE ROW LEVEL SECURITY;
ALTER TABLE IF EXISTS public.favorite_gyms ENABLE ROW LEVEL SECURITY;

DO $$ BEGIN
  -- follows
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='follows' AND policyname='follows_select_public') THEN
    CREATE POLICY follows_select_public ON public.follows FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='follows' AND policyname='follows_insert_self') THEN
    CREATE POLICY follows_insert_self ON public.follows FOR INSERT WITH CHECK (auth.uid() = follower_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='follows' AND policyname='follows_delete_self') THEN
    CREATE POLICY follows_delete_self ON public.follows FOR DELETE USING (auth.uid() = follower_id);
  END IF;

  -- gym_posts (read public or self, write self)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gym_posts' AND policyname='gym_posts_read_public') THEN
    CREATE POLICY gym_posts_read_public ON public.gym_posts FOR SELECT USING (is_public = true OR user_id = auth.uid());
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gym_posts' AND policyname='gym_posts_mutate_self') THEN
    CREATE POLICY gym_posts_mutate_self ON public.gym_posts FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  -- post_likes/comments (self)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='post_likes' AND policyname='post_likes_select_public') THEN
    CREATE POLICY post_likes_select_public ON public.post_likes FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='post_likes' AND policyname='post_likes_mutate_self') THEN
    CREATE POLICY post_likes_mutate_self ON public.post_likes FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='post_comments' AND policyname='post_comments_select_public') THEN
    CREATE POLICY post_comments_select_public ON public.post_comments FOR SELECT USING (true);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='post_comments' AND policyname='post_comments_mutate_self') THEN
    CREATE POLICY post_comments_mutate_self ON public.post_comments FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;

  -- gym_friends (self rows)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gym_friends' AND policyname='gym_friends_select_self') THEN
    CREATE POLICY gym_friends_select_self ON public.gym_friends FOR SELECT USING (auth.uid() IN (user_id, friend_id));
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gym_friends' AND policyname='gym_friends_mutate_self') THEN
    CREATE POLICY gym_friends_mutate_self ON public.gym_friends FOR ALL USING (auth.uid() IN (user_id, friend_id)) WITH CHECK (auth.uid() IN (user_id, friend_id));
  END IF;

  -- favorite_gyms (self)
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='favorite_gyms' AND policyname='favorite_gyms_select_self') THEN
    CREATE POLICY favorite_gyms_select_self ON public.favorite_gyms FOR SELECT USING (auth.uid() = user_id);
  END IF;
  IF NOT EXISTS (SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='favorite_gyms' AND policyname='favorite_gyms_mutate_self') THEN
    CREATE POLICY favorite_gyms_mutate_self ON public.favorite_gyms FOR ALL USING (auth.uid() = user_id) WITH CHECK (auth.uid() = user_id);
  END IF;
END $$;

