-- GYMTOPIA 2.0 - Gym Activity Enhancements
-- Enhanced workout tracking and body composition monitoring
-- Created: 2025-09-06

-- ========================================
-- 1. ENHANCED WORKOUT TRACKING
-- ========================================

-- Exercise templates (predefined exercises)
CREATE TABLE IF NOT EXISTS public.exercise_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category TEXT NOT NULL, -- 'strength', 'cardio', 'flexibility', 'balance'
    target_muscles TEXT[] NOT NULL,
    equipment_needed TEXT[],
    instructions TEXT,
    form_tips TEXT,
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    estimated_calories_per_minute DECIMAL(4,1),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout routines/programs
CREATE TABLE IF NOT EXISTS public.workout_routines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    goal TEXT, -- 'strength', 'muscle_gain', 'weight_loss', 'endurance', 'general_fitness'
    difficulty_level INTEGER CHECK (difficulty_level BETWEEN 1 AND 5),
    estimated_duration_minutes INTEGER,
    frequency_per_week INTEGER,
    is_public BOOLEAN DEFAULT false,
    likes_count INTEGER DEFAULT 0,
    times_used INTEGER DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Exercises within routines
CREATE TABLE IF NOT EXISTS public.routine_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    routine_id UUID REFERENCES public.workout_routines(id) ON DELETE CASCADE,
    exercise_template_id UUID REFERENCES public.exercise_templates(id),
    order_in_routine INTEGER NOT NULL,
    target_sets INTEGER,
    target_reps INTEGER,
    target_weight DECIMAL(5,2),
    rest_seconds INTEGER,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enhanced workout exercises with more detailed tracking
ALTER TABLE public.workout_exercises 
ADD COLUMN IF NOT EXISTS exercise_template_id UUID REFERENCES public.exercise_templates(id),
ADD COLUMN IF NOT EXISTS superset_group INTEGER,
ADD COLUMN IF NOT EXISTS difficulty_rating INTEGER CHECK (difficulty_rating BETWEEN 1 AND 10),
ADD COLUMN IF NOT EXISTS perceived_exertion INTEGER CHECK (perceived_exertion BETWEEN 1 AND 10),
ADD COLUMN IF NOT EXISTS form_rating INTEGER CHECK (form_rating BETWEEN 1 AND 5);

-- Individual sets tracking (more detailed than arrays)
CREATE TABLE IF NOT EXISTS public.exercise_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_exercise_id UUID REFERENCES public.workout_exercises(id) ON DELETE CASCADE,
    set_number INTEGER NOT NULL,
    reps INTEGER,
    weight DECIMAL(5,2),
    rest_seconds INTEGER,
    is_failure BOOLEAN DEFAULT false,
    is_warmup BOOLEAN DEFAULT false,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 2. BODY COMPOSITION & MEASUREMENTS
-- ========================================

-- Body measurements tracking
CREATE TABLE IF NOT EXISTS public.body_measurements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    measured_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    weight_kg DECIMAL(5,2),
    body_fat_percentage DECIMAL(4,1),
    muscle_mass_kg DECIMAL(5,2),
    visceral_fat_level INTEGER,
    bmr_calories INTEGER,
    -- Circumference measurements in cm
    neck_cm DECIMAL(4,1),
    chest_cm DECIMAL(4,1),
    waist_cm DECIMAL(4,1),
    hip_cm DECIMAL(4,1),
    thigh_cm DECIMAL(4,1),
    bicep_cm DECIMAL(4,1),
    forearm_cm DECIMAL(4,1),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 3. PROGRESS PHOTOS
-- ========================================

-- Progress photos
CREATE TABLE IF NOT EXISTS public.progress_photos (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    image_url TEXT NOT NULL,
    photo_type TEXT CHECK (photo_type IN ('front', 'back', 'side', 'other')),
    taken_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    weight_kg DECIMAL(5,2),
    notes TEXT,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- ========================================
-- 4. NUTRITION TRACKING (BASIC)
-- ========================================

-- Daily nutrition logs (basic calorie tracking)
CREATE TABLE IF NOT EXISTS public.nutrition_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    log_date DATE DEFAULT CURRENT_DATE,
    calories_consumed INTEGER,
    protein_g DECIMAL(6,2),
    carbs_g DECIMAL(6,2),
    fat_g DECIMAL(6,2),
    water_liters DECIMAL(3,1),
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, log_date)
);

-- ========================================
-- 5. GOALS & CHALLENGES
-- ========================================

-- Personal fitness goals
CREATE TABLE IF NOT EXISTS public.fitness_goals (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    goal_type TEXT NOT NULL, -- 'weight_loss', 'muscle_gain', 'strength', 'endurance', 'body_fat', 'measurement'
    title TEXT NOT NULL,
    description TEXT,
    target_value DECIMAL(8,2),
    current_value DECIMAL(8,2) DEFAULT 0,
    unit TEXT, -- 'kg', '%', 'cm', 'minutes', 'reps'
    target_date DATE,
    is_achieved BOOLEAN DEFAULT false,
    achieved_at TIMESTAMP WITH TIME ZONE,
    is_public BOOLEAN DEFAULT false,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Workout streaks and achievements
CREATE TABLE IF NOT EXISTS public.achievements (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    achievement_type TEXT NOT NULL, -- 'streak', 'personal_record', 'consistency', 'milestone'
    title TEXT NOT NULL,
    description TEXT,
    badge_icon TEXT,
    earned_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    metadata JSONB -- Store additional achievement data
);

-- ========================================
-- 6. ENHANCED PERSONAL RECORDS
-- ========================================

-- Add volume-based records and time-based records
ALTER TABLE public.personal_records 
ADD COLUMN IF NOT EXISTS volume_kg DECIMAL(10,2), -- total weight moved (sets x reps x weight)
ADD COLUMN IF NOT EXISTS duration_seconds INTEGER, -- for time-based exercises
ADD COLUMN IF NOT EXISTS distance_meters DECIMAL(8,2), -- for cardio
ADD COLUMN IF NOT EXISTS calories_burned INTEGER,
ADD COLUMN IF NOT EXISTS notes TEXT;

-- ========================================
-- 7. WORKOUT ANALYSIS & INSIGHTS
-- ========================================

-- Weekly/Monthly workout summaries
CREATE TABLE IF NOT EXISTS public.workout_summaries (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
    period_type TEXT CHECK (period_type IN ('week', 'month', 'quarter', 'year')),
    period_start DATE NOT NULL,
    period_end DATE NOT NULL,
    total_workouts INTEGER DEFAULT 0,
    total_duration_minutes INTEGER DEFAULT 0,
    total_weight_lifted_kg DECIMAL(10,2) DEFAULT 0,
    total_calories_burned INTEGER DEFAULT 0,
    avg_workout_duration DECIMAL(5,1),
    most_trained_muscle_groups TEXT[],
    workout_frequency DECIMAL(3,1), -- workouts per week
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, period_type, period_start)
);

-- ========================================
-- 8. INDEXES FOR PERFORMANCE
-- ========================================

-- Workout-related indexes
CREATE INDEX IF NOT EXISTS idx_workout_sessions_user_date ON public.workout_sessions(user_id, started_at);
CREATE INDEX IF NOT EXISTS idx_workout_exercises_session ON public.workout_exercises(session_id);
CREATE INDEX IF NOT EXISTS idx_exercise_sets_workout_exercise ON public.exercise_sets(workout_exercise_id);
CREATE INDEX IF NOT EXISTS idx_personal_records_user_exercise ON public.personal_records(user_id, exercise_name);
CREATE INDEX IF NOT EXISTS idx_body_measurements_user_date ON public.body_measurements(user_id, measured_at);
CREATE INDEX IF NOT EXISTS idx_progress_photos_user_date ON public.progress_photos(user_id, taken_at);
CREATE INDEX IF NOT EXISTS idx_fitness_goals_user_status ON public.fitness_goals(user_id, is_achieved);
CREATE INDEX IF NOT EXISTS idx_workout_summaries_user_period ON public.workout_summaries(user_id, period_type, period_start);

-- ========================================
-- 9. VIEWS FOR COMMON QUERIES
-- ========================================

-- View for latest body measurements per user
CREATE OR REPLACE VIEW public.latest_body_measurements AS
SELECT DISTINCT ON (user_id) 
    user_id,
    weight_kg,
    body_fat_percentage,
    muscle_mass_kg,
    measured_at
FROM public.body_measurements
ORDER BY user_id, measured_at DESC;

-- View for active fitness goals
CREATE OR REPLACE VIEW public.active_fitness_goals AS
SELECT *
FROM public.fitness_goals
WHERE is_achieved = false 
  AND (target_date IS NULL OR target_date >= CURRENT_DATE)
ORDER BY target_date ASC NULLS LAST;

-- View for recent personal records (last 30 days)
CREATE OR REPLACE VIEW public.recent_personal_records AS
SELECT *
FROM public.personal_records
WHERE achieved_at >= CURRENT_DATE - INTERVAL '30 days'
ORDER BY achieved_at DESC;

-- ========================================
-- 10. ROW LEVEL SECURITY (RLS)
-- ========================================

-- Enable RLS on all tables
ALTER TABLE public.exercise_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_routines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.routine_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercise_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_measurements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.progress_photos ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.nutrition_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.fitness_goals ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_summaries ENABLE ROW LEVEL SECURITY;

-- RLS policies for user data
CREATE POLICY "Users can view their own workout routines" ON public.workout_routines
  FOR ALL USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can manage their own body measurements" ON public.body_measurements
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own progress photos" ON public.progress_photos
  FOR ALL USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can manage their own nutrition logs" ON public.nutrition_logs
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can manage their own fitness goals" ON public.fitness_goals
  FOR ALL USING (user_id = auth.uid() OR is_public = true);

CREATE POLICY "Users can view their own achievements" ON public.achievements
  FOR ALL USING (user_id = auth.uid());

CREATE POLICY "Users can view their own workout summaries" ON public.workout_summaries
  FOR ALL USING (user_id = auth.uid());

-- Exercise templates are publicly readable
CREATE POLICY "Exercise templates are publicly readable" ON public.exercise_templates
  FOR SELECT USING (true);

-- Routine exercises follow the routine's policy
CREATE POLICY "Routine exercises follow routine visibility" ON public.routine_exercises
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workout_routines 
      WHERE id = routine_id 
      AND (user_id = auth.uid() OR is_public = true)
    )
  );

-- Exercise sets follow the workout exercise's user
CREATE POLICY "Exercise sets follow workout user" ON public.exercise_sets
  FOR ALL USING (
    EXISTS (
      SELECT 1 FROM public.workout_exercises we
      JOIN public.workout_sessions ws ON we.session_id = ws.id
      WHERE we.id = workout_exercise_id 
      AND ws.user_id = auth.uid()
    )
  );

-- ========================================
-- SAMPLE EXERCISE TEMPLATES
-- ========================================

-- Insert common exercise templates
INSERT INTO public.exercise_templates (name, category, target_muscles, equipment_needed, instructions, difficulty_level, estimated_calories_per_minute) VALUES
('ベンチプレス', 'strength', ARRAY['大胸筋中部', '三角筋前部', '上腕三頭筋'], ARRAY['バーベル', 'ベンチ'], 'バーをゆっくりと胸まで下ろし、力強く押し上げる。', 3, 5.5),
('スクワット', 'strength', ARRAY['大腿四頭筋', 'ハムストリングス', '大臀筋'], ARRAY['バーベル'], '足を肩幅に開き、お尻を後ろに引きながら膝を曲げる。', 2, 7.0),
('デッドリフト', 'strength', ARRAY['脊柱起立筋', 'ハムストリングス', '僧帽筋', '広背筋'], ARRAY['バーベル'], '床からバーを持ち上げ、直立姿勢まで引き上げる。', 4, 6.5),
('ラットプルダウン', 'strength', ARRAY['広背筋', '僧帽筋中部', '上腕二頭筋'], ARRAY['ラットプルダウンマシン'], '肩甲骨を寄せながらバーを胸に向けて引く。', 2, 4.5),
('ランニング', 'cardio', ARRAY['脚部全体', '体幹'], ARRAY['トレッドミル'], '一定のペースで継続的に走る。', 1, 12.0),
('バーピー', 'strength', ARRAY['全身'], ARRAY[], 'スクワット、プランク、ジャンプを連続で行う。', 4, 8.5)
ON CONFLICT DO NOTHING;

COMMIT;