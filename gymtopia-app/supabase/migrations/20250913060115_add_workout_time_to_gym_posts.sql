-- gym_postsテーブルに開始時間と終了時間を追加
ALTER TABLE gym_posts 
ADD COLUMN IF NOT EXISTS workout_started_at TIME,
ADD COLUMN IF NOT EXISTS workout_ended_at TIME,
ADD COLUMN IF NOT EXISTS workout_duration_calculated INTEGER; -- 分単位で自動計算

-- workout_durationを自動計算するトリガー関数
CREATE OR REPLACE FUNCTION calculate_gym_post_workout_duration()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.workout_started_at IS NOT NULL AND NEW.workout_ended_at IS NOT NULL THEN
    -- 時間差を分単位で計算
    NEW.workout_duration_calculated := EXTRACT(EPOCH FROM (NEW.workout_ended_at - NEW.workout_started_at)::INTERVAL) / 60;
    -- duration_minutesフィールドも更新（既存のフィールドがある場合）
    IF NEW.workout_duration_calculated IS NOT NULL THEN
      NEW.duration_minutes := NEW.workout_duration_calculated::INTEGER;
    END IF;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- トリガーを作成
DROP TRIGGER IF EXISTS calculate_gym_post_workout_duration_trigger ON gym_posts;
CREATE TRIGGER calculate_gym_post_workout_duration_trigger
BEFORE INSERT OR UPDATE ON gym_posts
FOR EACH ROW
EXECUTE FUNCTION calculate_gym_post_workout_duration();;
