-- =====================================================
-- RLSポリシーの追加と修正
-- =====================================================

-- 1. equipmentテーブルのRLSポリシー
-- 器具マスタデータは全員が閲覧可能
CREATE POLICY "equipment_select_policy" ON equipment
    FOR SELECT
    USING (true);

-- 器具の追加・更新・削除は管理者のみ
CREATE POLICY "equipment_insert_policy" ON equipment
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "equipment_update_policy" ON equipment
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "equipment_delete_policy" ON equipment
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- 2. makerテーブルのRLSポリシー
-- メーカーマスタデータは全員が閲覧可能
CREATE POLICY "maker_select_policy" ON maker
    FOR SELECT
    USING (true);

-- メーカーの追加・更新・削除は管理者のみ
CREATE POLICY "maker_insert_policy" ON maker
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "maker_update_policy" ON maker
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

CREATE POLICY "maker_delete_policy" ON maker
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- 3. workout_sessionsテーブルのRLSポリシー
-- 自分のワークアウトセッションのみ閲覧・操作可能
CREATE POLICY "workout_sessions_select_policy" ON workout_sessions
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "workout_sessions_insert_policy" ON workout_sessions
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "workout_sessions_update_policy" ON workout_sessions
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "workout_sessions_delete_policy" ON workout_sessions
    FOR DELETE
    USING (user_id = auth.uid());

-- 4. gym_review_repliesテーブルのRLS有効化とポリシー
ALTER TABLE gym_review_replies ENABLE ROW LEVEL SECURITY;

-- 返信は全員が閲覧可能
CREATE POLICY "gym_review_replies_select_policy" ON gym_review_replies
    FOR SELECT
    USING (true);

-- 認証済みユーザーのみ返信を投稿可能
CREATE POLICY "gym_review_replies_insert_policy" ON gym_review_replies
    FOR INSERT
    WITH CHECK (auth.uid() IS NOT NULL);

-- 自分の返信のみ更新可能
CREATE POLICY "gym_review_replies_update_policy" ON gym_review_replies
    FOR UPDATE
    USING (responder_user_id = auth.uid());

-- 自分の返信のみ削除可能（または管理者）
CREATE POLICY "gym_review_replies_delete_policy" ON gym_review_replies
    FOR DELETE
    USING (
        responder_user_id = auth.uid() OR
        EXISTS (
            SELECT 1 FROM users
            WHERE id = auth.uid()
            AND role = 'admin'
        )
    );

-- 5. workout_exercisesテーブルのRLS有効化とポリシー
ALTER TABLE workout_exercises ENABLE ROW LEVEL SECURITY;

-- 自分のワークアウトエクササイズのみ閲覧・操作可能
CREATE POLICY "workout_exercises_select_policy" ON workout_exercises
    FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM workout_sessions
            WHERE id = workout_exercises.session_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "workout_exercises_insert_policy" ON workout_exercises
    FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM workout_sessions
            WHERE id = workout_exercises.session_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "workout_exercises_update_policy" ON workout_exercises
    FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM workout_sessions
            WHERE id = workout_exercises.session_id
            AND user_id = auth.uid()
        )
    );

CREATE POLICY "workout_exercises_delete_policy" ON workout_exercises
    FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM workout_sessions
            WHERE id = workout_exercises.session_id
            AND user_id = auth.uid()
        )
    );

-- 6. personal_recordsテーブルのRLS有効化とポリシー
ALTER TABLE personal_records ENABLE ROW LEVEL SECURITY;

-- 自分の記録のみ閲覧・操作可能
CREATE POLICY "personal_records_select_policy" ON personal_records
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "personal_records_insert_policy" ON personal_records
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "personal_records_update_policy" ON personal_records
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "personal_records_delete_policy" ON personal_records
    FOR DELETE
    USING (user_id = auth.uid());

-- 7. achievementsテーブルのRLS有効化とポリシー
ALTER TABLE achievements ENABLE ROW LEVEL SECURITY;

-- 自分の実績のみ閲覧・操作可能
CREATE POLICY "achievements_select_policy" ON achievements
    FOR SELECT
    USING (user_id = auth.uid());

CREATE POLICY "achievements_insert_policy" ON achievements
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

CREATE POLICY "achievements_update_policy" ON achievements
    FOR UPDATE
    USING (user_id = auth.uid());

CREATE POLICY "achievements_delete_policy" ON achievements
    FOR DELETE
    USING (user_id = auth.uid());

-- 8. gym_checkinsテーブルのRLS有効化とポリシー
ALTER TABLE gym_checkins ENABLE ROW LEVEL SECURITY;

-- チェックインは全員が閲覧可能（統計用）
CREATE POLICY "gym_checkins_select_policy" ON gym_checkins
    FOR SELECT
    USING (true);

-- 認証済みユーザーのみチェックイン可能
CREATE POLICY "gym_checkins_insert_policy" ON gym_checkins
    FOR INSERT
    WITH CHECK (user_id = auth.uid());

-- 自分のチェックインのみ更新可能
CREATE POLICY "gym_checkins_update_policy" ON gym_checkins
    FOR UPDATE
    USING (user_id = auth.uid());

-- 自分のチェックインのみ削除可能
CREATE POLICY "gym_checkins_delete_policy" ON gym_checkins
    FOR DELETE
    USING (user_id = auth.uid());

-- 注意: spatial_ref_sysはPostGISのシステムテーブルのため、RLSは適用しません