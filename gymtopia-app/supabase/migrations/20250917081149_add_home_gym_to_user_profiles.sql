-- ユーザープロフィールにホームジム設定を追加
ALTER TABLE user_profiles 
ADD COLUMN IF NOT EXISTS primary_gym_id UUID REFERENCES gyms(id),
ADD COLUMN IF NOT EXISTS secondary_gym_ids UUID[] DEFAULT '{}',
ADD COLUMN IF NOT EXISTS gym_membership_type TEXT CHECK (gym_membership_type IN ('visitor', 'member', 'premium', 'owner'));

-- インデックスを追加
CREATE INDEX IF NOT EXISTS idx_user_profiles_primary_gym ON user_profiles(primary_gym_id);

COMMENT ON COLUMN user_profiles.primary_gym_id IS 'ユーザーのメインジム';
COMMENT ON COLUMN user_profiles.secondary_gym_ids IS 'サブジム（複数可）';
COMMENT ON COLUMN user_profiles.gym_membership_type IS '会員種別';;
