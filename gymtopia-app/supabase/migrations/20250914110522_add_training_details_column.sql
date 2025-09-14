-- gym_posts テーブルにtraining_detailsカラムを追加
ALTER TABLE gym_posts 
ADD COLUMN IF NOT EXISTS training_details JSONB;;
