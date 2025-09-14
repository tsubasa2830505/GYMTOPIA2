-- サンプルジムオーナーデータの挿入
-- 注: 実際の運用では、管理画面から設定するか、別の方法で行います

-- 最初のユーザーを最初のジムのオーナーに設定
INSERT INTO gym_owners (user_id, gym_id, role, permissions)
SELECT 
  u.id,
  g.id,
  'owner',
  '{"canEditBasicInfo": true, "canManageEquipment": true, "canReplyReviews": true, "canViewStats": true}'::jsonb
FROM users u
CROSS JOIN gyms g
WHERE u.email IS NOT NULL
  AND g.name LIKE '%ハンマーストレングス%'
LIMIT 1
ON CONFLICT (user_id, gym_id) DO UPDATE
SET role = 'owner',
    permissions = '{"canEditBasicInfo": true, "canManageEquipment": true, "canReplyReviews": true, "canViewStats": true}'::jsonb,
    updated_at = NOW();

-- ユーザーのロールを更新
UPDATE users 
SET is_gym_owner = true, 
    role = 'gym_owner'
WHERE id IN (
  SELECT user_id FROM gym_owners
);;
