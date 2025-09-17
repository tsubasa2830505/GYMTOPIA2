-- ユーザーの連続記録を計算するSQL関数を作成
CREATE OR REPLACE FUNCTION calculate_user_streak(target_user_id UUID)
RETURNS JSON
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
    current_streak INTEGER := 0;
    longest_streak INTEGER := 0;
    temp_streak INTEGER := 0;
    last_date DATE := NULL;
    workout_date DATE;
    today DATE := CURRENT_DATE;
    yesterday DATE := CURRENT_DATE - INTERVAL '1 day';
BEGIN
    -- ワークアウトの日付を降順で取得
    FOR workout_date IN
        SELECT DISTINCT DATE(started_at) as workout_day
        FROM workout_sessions 
        WHERE user_id = target_user_id
        ORDER BY DATE(started_at) DESC
        LIMIT 100
    LOOP
        IF last_date IS NULL THEN
            -- 最初の日付の処理
            IF workout_date = today OR workout_date = yesterday::date THEN
                temp_streak := 1;
                current_streak := 1;
            END IF;
        ELSE
            -- 前の日付との差を計算
            IF (last_date - workout_date) = 1 THEN
                -- 連続している
                temp_streak := temp_streak + 1;
                -- 現在の連続記録の更新（最近30日以内のみ）
                IF workout_date >= (today - INTERVAL '30 days')::date THEN
                    current_streak := temp_streak;
                END IF;
            ELSE
                -- 連続が途切れた
                longest_streak := GREATEST(longest_streak, temp_streak);
                temp_streak := 1;
            END IF;
        END IF;
        
        last_date := workout_date;
    END LOOP;
    
    -- 最後の連続記録も考慮
    longest_streak := GREATEST(longest_streak, temp_streak);
    
    RETURN json_build_object(
        'current_streak', current_streak,
        'longest_streak', longest_streak
    );
END;
$$;;
