-- 既存の関数を削除して再作成
DROP FUNCTION IF EXISTS calculate_user_total_weight(UUID);

-- ユーザーの総重量を計算するSQL関数を作成
CREATE OR REPLACE FUNCTION calculate_user_total_weight(target_user_id UUID)
RETURNS NUMERIC
LANGUAGE plpgsql
SECURITY DEFINER -- これによりRLSを回避
AS $$
DECLARE
    total_weight NUMERIC := 0;
    exercise_record RECORD;
    set_record RECORD;
BEGIN
    -- ユーザーのワークアウトセッションに関連するエクササイズを取得
    FOR exercise_record IN
        SELECT we.sets
        FROM workout_exercises we
        JOIN workout_sessions ws ON we.session_id = ws.id
        WHERE ws.user_id = target_user_id
    LOOP
        -- 各エクササイズのセットデータをループ
        FOR set_record IN
            SELECT 
                (set_data->>'weight')::NUMERIC as weight,
                (set_data->>'reps')::NUMERIC as reps
            FROM jsonb_array_elements(exercise_record.sets::jsonb) as set_data
            WHERE (set_data->>'weight') IS NOT NULL 
                AND (set_data->>'reps') IS NOT NULL
                AND (set_data->>'weight')::NUMERIC > 0
                AND (set_data->>'reps')::NUMERIC > 0
        LOOP
            total_weight := total_weight + (set_record.weight * set_record.reps);
        END LOOP;
    END LOOP;
    
    RETURN total_weight;
END;
$$;;
