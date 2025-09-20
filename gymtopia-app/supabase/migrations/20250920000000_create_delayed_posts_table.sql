-- 遅延投稿機能のためのテーブル作成
-- チェックイン後の自動投稿を指定時間後に実行するためのスケジューリングテーブル

CREATE TABLE delayed_posts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  checkin_id UUID NOT NULL,
  gym_data JSONB NOT NULL, -- { id: string, name: string, area?: string }
  badges JSONB NOT NULL DEFAULT '[]'::jsonb, -- Array<{ badge_name: string, badge_icon: string, rarity: string }>
  options JSONB NOT NULL, -- { shareLevel: string, audience: string }
  scheduled_at TIMESTAMPTZ NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'posted', 'failed', 'cancelled')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- インデックス作成
CREATE INDEX idx_delayed_posts_user_id ON delayed_posts(user_id);
CREATE INDEX idx_delayed_posts_status ON delayed_posts(status);
CREATE INDEX idx_delayed_posts_scheduled_at ON delayed_posts(scheduled_at);
CREATE INDEX idx_delayed_posts_status_scheduled ON delayed_posts(status, scheduled_at) WHERE status = 'pending';

-- RLS (Row Level Security) 有効化
ALTER TABLE delayed_posts ENABLE ROW LEVEL SECURITY;

-- RLSポリシー設定
-- ユーザーは自分の遅延投稿のみアクセス可能
CREATE POLICY "Users can view own delayed posts" ON delayed_posts
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own delayed posts" ON delayed_posts
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own delayed posts" ON delayed_posts
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own delayed posts" ON delayed_posts
  FOR DELETE USING (auth.uid() = user_id);

-- トリガー: updated_at の自動更新
CREATE OR REPLACE FUNCTION update_delayed_posts_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_delayed_posts_updated_at
  BEFORE UPDATE ON delayed_posts
  FOR EACH ROW
  EXECUTE FUNCTION update_delayed_posts_updated_at();

-- コメント追加
COMMENT ON TABLE delayed_posts IS '遅延投稿スケジューリングテーブル - チェックイン後の自動投稿を指定時間後に実行';
COMMENT ON COLUMN delayed_posts.id IS '遅延投稿ID';
COMMENT ON COLUMN delayed_posts.user_id IS 'ユーザーID';
COMMENT ON COLUMN delayed_posts.checkin_id IS '関連するチェックインID';
COMMENT ON COLUMN delayed_posts.gym_data IS 'ジム情報（JSON）';
COMMENT ON COLUMN delayed_posts.badges IS '獲得バッジ情報（JSON配列）';
COMMENT ON COLUMN delayed_posts.options IS '投稿オプション（共有レベル、公開範囲など）';
COMMENT ON COLUMN delayed_posts.scheduled_at IS '実行予定日時';
COMMENT ON COLUMN delayed_posts.status IS '実行ステータス（pending, posted, failed, cancelled）';
COMMENT ON COLUMN delayed_posts.created_at IS '作成日時';
COMMENT ON COLUMN delayed_posts.updated_at IS '更新日時';