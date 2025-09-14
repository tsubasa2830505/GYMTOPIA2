-- ジムオーナーが記入する詳細情報テーブル
CREATE TABLE IF NOT EXISTS gym_detailed_info (
  id UUID DEFAULT uuid_generate_v4() PRIMARY KEY,
  gym_id UUID REFERENCES gyms(id) ON DELETE CASCADE UNIQUE, -- ジムごとに1つの詳細情報

  -- 料金関連
  pricing_details TEXT, -- 詳細な料金体系（月額、日額、学生割引、法人契約など）
  membership_plans TEXT, -- 会員プランの詳細説明

  -- 営業時間関連
  business_hours_details TEXT, -- 営業時間の詳細（祝日、年末年始、特別営業など）
  staff_hours TEXT, -- スタッフ在中時間

  -- 施設ルール
  rules_and_regulations TEXT, -- 利用規約、ジムルール
  dress_code TEXT, -- 服装規定

  -- 初心者向け情報
  beginner_support TEXT, -- 初心者サポートの詳細
  trial_info TEXT, -- 体験利用の詳細

  -- アクセス
  access_details TEXT, -- 詳細なアクセス方法
  parking_details TEXT, -- 駐車場の詳細（料金、台数、提携など）

  -- その他
  special_programs TEXT, -- 特別プログラム、イベント情報
  announcements TEXT, -- お知らせ、重要事項
  additional_info TEXT, -- その他の情報（オーナーが自由に記載）

  -- メタデータ
  created_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT TIMEZONE('utc', NOW()),
  updated_by UUID REFERENCES auth.users(id)
);

-- インデックス
CREATE INDEX idx_gym_detailed_info_gym_id ON gym_detailed_info(gym_id);

-- RLS を有効化
ALTER TABLE gym_detailed_info ENABLE ROW LEVEL SECURITY;

-- ポリシー
-- 誰でも閲覧可能
CREATE POLICY "Anyone can view gym detailed info" ON gym_detailed_info
  FOR SELECT USING (true);

-- ジムオーナーのみ編集可能（今回は簡易的に認証ユーザーなら編集可能とする）
CREATE POLICY "Authenticated users can manage gym detailed info" ON gym_detailed_info
  FOR ALL USING (auth.uid() IS NOT NULL);

-- 更新時刻を自動更新するトリガー（既存の関数を再利用）
CREATE TRIGGER update_gym_detailed_info_updated_at
  BEFORE UPDATE ON gym_detailed_info
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- コメント
COMMENT ON TABLE gym_detailed_info IS 'ジムオーナーが管理する詳細情報';
COMMENT ON COLUMN gym_detailed_info.pricing_details IS '料金体系の詳細説明（月額、日額、学生割引など）';
COMMENT ON COLUMN gym_detailed_info.membership_plans IS '会員プランの詳細（レギュラー、プレミアム、法人など）';
COMMENT ON COLUMN gym_detailed_info.business_hours_details IS '営業時間の詳細（祝日対応、年末年始など）';
COMMENT ON COLUMN gym_detailed_info.staff_hours IS 'スタッフ在中時間、パーソナルトレーナー対応時間';
COMMENT ON COLUMN gym_detailed_info.rules_and_regulations IS '利用規約、ジムルール、禁止事項';
COMMENT ON COLUMN gym_detailed_info.dress_code IS '服装規定、シューズ規定';
COMMENT ON COLUMN gym_detailed_info.beginner_support IS '初心者向けサポート内容';
COMMENT ON COLUMN gym_detailed_info.trial_info IS '体験利用、見学の詳細';
COMMENT ON COLUMN gym_detailed_info.access_details IS '最寄り駅からの道順、目印など';
COMMENT ON COLUMN gym_detailed_info.parking_details IS '駐車場の台数、料金、提携駐車場情報';
COMMENT ON COLUMN gym_detailed_info.special_programs IS '特別プログラム、グループレッスン、イベント';
COMMENT ON COLUMN gym_detailed_info.announcements IS '重要なお知らせ、臨時休業情報など';
COMMENT ON COLUMN gym_detailed_info.additional_info IS 'その他オーナーが追記したい情報';