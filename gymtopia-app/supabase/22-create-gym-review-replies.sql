-- =====================================================
-- Gym review replies (simple owner replies to reviews)
-- =====================================================

CREATE TABLE IF NOT EXISTS public.gym_review_replies (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  review_id UUID NOT NULL REFERENCES public.gym_reviews(id) ON DELETE CASCADE,
  responder_user_id UUID REFERENCES public.users(id) ON DELETE SET NULL,
  role TEXT DEFAULT 'owner',
  content TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

CREATE INDEX IF NOT EXISTS idx_gym_review_replies_review ON public.gym_review_replies(review_id);
CREATE INDEX IF NOT EXISTS idx_gym_review_replies_created ON public.gym_review_replies(created_at DESC);

-- For development convenience, keep RLS disabled so anon can insert from UI.
-- In production, enable RLS and restrict INSERT to authenticated owners.
ALTER TABLE public.gym_review_replies DISABLE ROW LEVEL SECURITY;

