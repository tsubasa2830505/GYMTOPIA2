-- =====================================================
-- Function search_pathの設定
-- セキュリティ強化のため、全関数にsearch_pathを明示的に設定
-- =====================================================

-- 1. get_nearby_gyms関数の修正
ALTER FUNCTION get_nearby_gyms(lat double precision, lng double precision, radius_km numeric, max_results integer)
SET search_path = public, pg_temp;

-- 2. process_approved_gym_owner_application関数の修正
ALTER FUNCTION process_approved_gym_owner_application()
SET search_path = public, pg_temp;

-- 3. update_gym_rating関数の修正
ALTER FUNCTION update_gym_rating()
SET search_path = public, pg_temp;

-- 4. get_user_managed_gyms関数の修正
ALTER FUNCTION get_user_managed_gyms(user_uuid uuid)
SET search_path = public, pg_temp;

-- 5. update_post_comment_count関数の修正
ALTER FUNCTION update_post_comment_count()
SET search_path = public, pg_temp;

-- 6. update_updated_at_column関数の修正
ALTER FUNCTION update_updated_at_column()
SET search_path = public, pg_temp;

-- 7. calculate_gym_post_workout_duration関数の修正
ALTER FUNCTION calculate_gym_post_workout_duration()
SET search_path = public, pg_temp;

-- 8. handle_new_auth_user関数の修正
ALTER FUNCTION handle_new_auth_user()
SET search_path = public, pg_temp;

-- 9. update_post_like_count関数の修正
ALTER FUNCTION update_post_like_count()
SET search_path = public, pg_temp;

-- 10. update_gym_owner_applications_updated_at関数の修正
ALTER FUNCTION update_gym_owner_applications_updated_at()
SET search_path = public, pg_temp;

-- 11. handle_new_user関数の修正
ALTER FUNCTION handle_new_user()
SET search_path = public, pg_temp;