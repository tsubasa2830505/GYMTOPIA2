-- Life Fitness マシン
INSERT INTO machines (id, name, target, maker, type, target_category, target_detail) VALUES
-- 胸部
('lf-chest-press', 'チェストプレス', '胸', 'life-fitness', 'machine', 'chest', '大胸筋'),
('lf-pec-fly', 'ペックフライ', '胸', 'life-fitness', 'machine', 'chest', '大胸筋'),
('lf-incline-press', 'インクラインプレス', '胸', 'life-fitness', 'machine', 'chest', '上部'),
-- 背中
('lf-lat-pulldown', 'ラットプルダウン', '背中', 'life-fitness', 'machine', 'back', '広背筋'),
('lf-seated-row', 'シーテッドロウ', '背中', 'life-fitness', 'machine', 'back', '中部'),
('lf-low-row', 'ローロウ', '背中', 'life-fitness', 'machine', 'back', '下部'),
-- 肩
('lf-shoulder-press', 'ショルダープレス', '肩', 'life-fitness', 'machine', 'shoulder', '三角筋'),
('lf-lateral-raise', 'ラテラルレイズ', '肩', 'life-fitness', 'machine', 'shoulder', '側部'),
-- 脚
('lf-leg-press', 'レッグプレス', '脚', 'life-fitness', 'machine', 'legs', '大腿四頭筋'),
('lf-leg-extension', 'レッグエクステンション', '脚', 'life-fitness', 'machine', 'legs', '大腿四頭筋'),
('lf-leg-curl', 'レッグカール', '脚', 'life-fitness', 'machine', 'legs', 'ハムストリング'),
('lf-calf-raise', 'カーフレイズ', '脚', 'life-fitness', 'machine', 'legs', 'ふくらはぎ'),
-- 腕
('lf-bicep-curl', 'バイセップカール', '腕', 'life-fitness', 'machine', 'arms', '上腕二頭筋'),
('lf-tricep-extension', 'トライセップエクステンション', '腕', 'life-fitness', 'machine', 'arms', '上腕三頭筋'),
-- 体幹
('lf-ab-crunch', 'アブドミナルクランチ', '体幹', 'life-fitness', 'machine', 'core', '腹直筋'),
('lf-back-extension', 'バックエクステンション', '体幹', 'life-fitness', 'machine', 'core', '脊柱起立筋'),

-- Hammer Strength マシン
-- 胸部
('hs-chest-press', 'チェストプレス', '胸', 'hammer', 'machine', 'chest', '大胸筋'),
('hs-iso-lateral-chest', 'アイソラテラルチェストプレス', '胸', 'hammer', 'machine', 'chest', '大胸筋'),
('hs-decline-press', 'デクラインプレス', '胸', 'hammer', 'machine', 'chest', '下部'),
('hs-iso-wide-chest', 'アイソワイドチェストプレス', '胸', 'hammer', 'machine', 'chest', '大胸筋'),
-- 背中
('hs-iso-lateral-row', 'アイソラテラルロウ', '背中', 'hammer', 'machine', 'back', '中部'),
('hs-high-row', 'ハイロウ', '背中', 'hammer', 'machine', 'back', '僧帽筋'),
('hs-pulldown', 'プルダウン', '背中', 'hammer', 'machine', 'back', '広背筋'),
('hs-iso-lat-front', 'アイソラテラルフロントプルダウン', '背中', 'hammer', 'machine', 'back', '広背筋'),
-- 肩
('hs-shoulder-press', 'ショルダープレス', '肩', 'hammer', 'machine', 'shoulder', '三角筋'),
('hs-iso-lateral-shoulder', 'アイソラテラルショルダープレス', '肩', 'hammer', 'machine', 'shoulder', '三角筋'),
-- 脚
('hs-leg-press', 'レッグプレス', '脚', 'hammer', 'machine', 'legs', '大腿四頭筋'),
('hs-hack-squat', 'ハックスクワット', '脚', 'hammer', 'machine', 'legs', '大腿四頭筋'),
('hs-leg-curl', 'レッグカール', '脚', 'hammer', 'machine', 'legs', 'ハムストリング'),

-- Cybex マシン
-- 胸部
('cy-chest-press', 'チェストプレス', '胸', 'cybex', 'machine', 'chest', '大胸筋'),
('cy-fly', 'フライ', '胸', 'cybex', 'machine', 'chest', '大胸筋'),
-- 背中
('cy-lat-pulldown', 'ラットプルダウン', '背中', 'cybex', 'machine', 'back', '広背筋'),
('cy-row', 'ロウ', '背中', 'cybex', 'machine', 'back', '中部'),
-- 肩
('cy-overhead-press', 'オーバーヘッドプレス', '肩', 'cybex', 'machine', 'shoulder', '三角筋'),
('cy-lateral-raise', 'ラテラルレイズ', '肩', 'cybex', 'machine', 'shoulder', '側部'),
-- 脚
('cy-leg-press', 'レッグプレス', '脚', 'cybex', 'machine', 'legs', '大腿四頭筋'),
('cy-squat-press', 'スクワットプレス', '脚', 'cybex', 'machine', 'legs', '大腿四頭筋'),
('cy-calf-raise', 'カーフレイズ', '脚', 'cybex', 'machine', 'legs', 'ふくらはぎ'),
-- 腕
('cy-arm-curl', 'アームカール', '腕', 'cybex', 'machine', 'arms', '上腕二頭筋'),
('cy-tricep-press', 'トライセッププレス', '腕', 'cybex', 'machine', 'arms', '上腕三頭筋'),
-- 体幹
('cy-ab-crunch', 'アブクランチ', '体幹', 'cybex', 'machine', 'core', '腹直筋'),
('cy-torso-rotation', 'トルソローテーション', '体幹', 'cybex', 'machine', 'core', '腹斜筋'),

-- Technogym マシン
-- 胸部
('tg-chest-press', 'チェストプレス', '胸', 'technogym', 'machine', 'chest', '大胸筋'),
('tg-pectoral', 'ペクトラル', '胸', 'technogym', 'machine', 'chest', '大胸筋'),
-- 背中
('tg-lat-machine', 'ラットマシン', '背中', 'technogym', 'machine', 'back', '広背筋'),
('tg-vertical-traction', 'バーティカルトラクション', '背中', 'technogym', 'machine', 'back', '広背筋'),
('tg-low-row', 'ローロウ', '背中', 'technogym', 'machine', 'back', '中部'),
-- 肩
('tg-shoulder-press', 'ショルダープレス', '肩', 'technogym', 'machine', 'shoulder', '三角筋'),
('tg-deltoid-raise', 'デルトイドレイズ', '肩', 'technogym', 'machine', 'shoulder', '側部'),
-- 脚
('tg-leg-press', 'レッグプレス', '脚', 'technogym', 'machine', 'legs', '大腿四頭筋'),
('tg-leg-extension', 'レッグエクステンション', '脚', 'technogym', 'machine', 'legs', '大腿四頭筋'),
('tg-leg-curl', 'レッグカール', '脚', 'technogym', 'machine', 'legs', 'ハムストリング'),
('tg-adductor', 'アダクター', '脚', 'technogym', 'machine', 'legs', '内転筋'),
('tg-abductor', 'アブダクター', '脚', 'technogym', 'machine', 'legs', '臀筋'),
-- 体幹
('tg-abdominal-crunch', 'アブドミナルクランチ', '体幹', 'technogym', 'machine', 'core', '腹直筋'),
('tg-rotary-torso', 'ロータリートルソ', '体幹', 'technogym', 'machine', 'core', '腹斜筋'),

-- Matrix マシン
-- 胸部
('mx-chest-press', 'チェストプレス', '胸', 'matrix', 'machine', 'chest', '大胸筋'),
('mx-incline-press', 'インクラインプレス', '胸', 'matrix', 'machine', 'chest', '上部'),
-- 背中
('mx-diverging-lat-pulldown', 'ダイバージングラットプルダウン', '背中', 'matrix', 'machine', 'back', '広背筋'),
('mx-seated-row', 'シーテッドロウ', '背中', 'matrix', 'machine', 'back', '中部'),
-- 肩
('mx-shoulder-press', 'ショルダープレス', '肩', 'matrix', 'machine', 'shoulder', '三角筋'),
-- 脚
('mx-leg-press', 'レッグプレス', '脚', 'matrix', 'machine', 'legs', '大腿四頭筋'),
('mx-hack-squat', 'ハックスクワット', '脚', 'matrix', 'machine', 'legs', '大腿四頭筋'),
-- 腕
('mx-bicep-curl', 'バイセップカール', '腕', 'matrix', 'machine', 'arms', '上腕二頭筋'),
('mx-tricep-dip', 'トライセップディップ', '腕', 'matrix', 'machine', 'arms', '上腕三頭筋'),

-- Nautilus マシン
-- 胸部
('nt-nitro-chest-press', 'ナイトロチェストプレス', '胸', 'nautilus', 'machine', 'chest', '大胸筋'),
('nt-pec-fly', 'ペックフライ', '胸', 'nautilus', 'machine', 'chest', '大胸筋'),
-- 背中
('nt-compound-row', 'コンパウンドロウ', '背中', 'nautilus', 'machine', 'back', '中部'),
('nt-pullover', 'プルオーバー', '背中', 'nautilus', 'machine', 'back', '広背筋'),
-- 肩
('nt-lateral-raise', 'ラテラルレイズ', '肩', 'nautilus', 'machine', 'shoulder', '側部'),
-- 脚
('nt-leg-press', 'レッグプレス', '脚', 'nautilus', 'machine', 'legs', '大腿四頭筋'),
('nt-leg-extension', 'レッグエクステンション', '脚', 'nautilus', 'machine', 'legs', '大腿四頭筋'),
('nt-seated-leg-curl', 'シーテッドレッグカール', '脚', 'nautilus', 'machine', 'legs', 'ハムストリング'),
-- 体幹
('nt-ab-crunch', 'アブクランチ', '体幹', 'nautilus', 'machine', 'core', '腹直筋'),

-- フリーウェイト器具 (Hammer Strength)
('hs-olympic-bench', 'オリンピックベンチ', '胸', 'hammer', 'free-weight', 'chest', '大胸筋'),
('hs-incline-bench', 'インクラインベンチ', '胸', 'hammer', 'free-weight', 'chest', '上部'),
('hs-decline-bench', 'デクラインベンチ', '胸', 'hammer', 'free-weight', 'chest', '下部'),
('hs-olympic-military-bench', 'オリンピックミリタリーベンチ', '肩', 'hammer', 'free-weight', 'shoulder', '三角筋'),
('hs-squat-rack', 'スクワットラック', '脚', 'hammer', 'free-weight', 'legs', '大腿四頭筋'),
('hs-power-rack', 'パワーラック', '脚', 'hammer', 'free-weight', 'legs', '大腿四頭筋'),

-- フリーウェイト器具 (Life Fitness)
('lf-olympic-flat-bench', 'オリンピックフラットベンチ', '胸', 'life-fitness', 'free-weight', 'chest', '大胸筋'),
('lf-adjustable-bench', 'アジャスタブルベンチ', '胸', 'life-fitness', 'free-weight', 'chest', '大胸筋'),
('lf-preacher-bench', 'プリーチャーベンチ', '腕', 'life-fitness', 'free-weight', 'arms', '上腕二頭筋'),
('lf-smith-machine', 'スミスマシン', '脚', 'life-fitness', 'free-weight', 'legs', '大腿四頭筋')

ON CONFLICT (id) DO UPDATE SET
  name = EXCLUDED.name,
  target = EXCLUDED.target,
  maker = EXCLUDED.maker,
  type = EXCLUDED.type,
  target_category = EXCLUDED.target_category,
  target_detail = EXCLUDED.target_detail,
  updated_at = NOW();;
