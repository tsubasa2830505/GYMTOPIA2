-- 筋トレ種目マスタデータの投入

-- 腹筋種目
INSERT INTO exercise_master (name, base_mets, equipment_type, category, description) VALUES
('アブドミナル', 4.3, 'machine', 'abs', '腹筋マシンを使用した腹直筋トレーニング'),
('アブドミナルマシン', 3.6, 'machine', 'abs', 'マシンで負荷を調整できる腹筋運動'),
('アブローラー', 6.0, 'bodyweight', 'abs', '腹筋ローラーを使用した高強度コアトレーニング'),
('クランチ', 3.0, 'bodyweight', 'abs', '基本的な腹筋運動'),
('トーソローテーション', 4.5, 'machine', 'abs', '腹斜筋を鍛える回旋運動'),
('プランク', 3.0, 'bodyweight', 'abs', '体幹を鍛える静的エクササイズ'),
('レッグレイズ', 4.0, 'bodyweight', 'abs', '下腹部を重点的に鍛える');

-- 腕種目
INSERT INTO exercise_master (name, base_mets, equipment_type, category, description) VALUES
('EZバーカール', 3.5, 'freeweight', 'arms', 'EZバーを使用した上腕二頭筋トレーニング'),
('アームカール', 3.5, 'freeweight', 'arms', '基本的な上腕二頭筋運動'),
('インクラインアームカール', 3.5, 'freeweight', 'arms', '傾斜をつけたカール運動'),
('インクラインダンベルカール', 3.5, 'freeweight', 'arms', '傾斜ベンチでのダンベルカール'),
('インクラインハンマーカール', 3.5, 'freeweight', 'arms', '前腕も同時に鍛えるカール'),
('ケーブルカール', 3.5, 'cable', 'arms', 'ケーブルマシンでの上腕二頭筋運動'),
('ケーブルプレスダウン', 3.5, 'cable', 'arms', '上腕三頭筋を鍛えるケーブル運動'),
('スカルクラッシャー', 3.5, 'freeweight', 'arms', '上腕三頭筋の集中トレーニング'),
('ダンベルカール', 4.0, 'freeweight', 'arms', 'ダンベルを使用した基本カール'),
('トライセプスディップス', 5.0, 'bodyweight', 'arms', '自重での上腕三頭筋運動'),
('バーベルカール', 4.0, 'freeweight', 'arms', 'バーベルでの上腕二頭筋トレーニング'),
('ハンマーカール', 4.0, 'freeweight', 'arms', '前腕と上腕二頭筋を同時に鍛える'),
('フレンチプレス', 3.5, 'freeweight', 'arms', '上腕三頭筋の頭上運動');

-- 背中種目
INSERT INTO exercise_master (name, base_mets, equipment_type, category, description) VALUES
('ケーブルプルオーバー', 3.5, 'cable', 'back', '広背筋を鍛えるケーブル運動'),
('シーテッドロー', 3.5, 'machine', 'back', '座位での引き寄せ運動'),
('チンニング', 8.0, 'bodyweight', 'back', '懸垂運動（高強度）'),
('デッドリフト', 6.0, 'freeweight', 'back', '全身を使う複合運動'),
('ベントオーバーロウ', 6.0, 'freeweight', 'back', '前傾姿勢での引き寄せ運動'),
('ラットプルダウン', 5.0, 'machine', 'back', '広背筋を鍛えるマシン運動'),
('ワンハンドローイング', 3.5, 'freeweight', 'back', '片手での背中トレーニング');

-- 有酸素運動
-- ウォーキング系
INSERT INTO exercise_master (name, base_mets, equipment_type, category, description) VALUES
('ウォーキング', 3.5, 'treadmill', 'cardio', '通常速度の歩行'),
('ウォーキング（ゆっくり）', 2.8, 'treadmill', 'cardio', 'ゆっくりペースの歩行'),
('ウォーキング（普通）', 3.5, 'treadmill', 'cardio', '普通ペースの歩行'),
('ウォーキング（速い）', 4.3, 'treadmill', 'cardio', '速歩');

-- ランニング系
INSERT INTO exercise_master (name, base_mets, equipment_type, category, description) VALUES
('ジョギング', 7.0, 'treadmill', 'cardio', '軽いランニング'),
('ランニング', 8.0, 'treadmill', 'cardio', '通常のランニング'),
('ランニング（8km/h）', 8.0, 'treadmill', 'cardio', '時速8kmのランニング'),
('ランニング（10km/h）', 10.0, 'treadmill', 'cardio', '時速10kmのランニング');

-- サイクリング系
INSERT INTO exercise_master (name, base_mets, equipment_type, category, description) VALUES
('サイクリング（軽い）', 4.0, 'bike', 'cardio', '軽い負荷のサイクリング'),
('サイクリング（普通）', 6.0, 'bike', 'cardio', '通常負荷のサイクリング');

-- エリプティカル系
INSERT INTO exercise_master (name, base_mets, equipment_type, category, description) VALUES
('エリプティカル（軽い）', 4.0, 'elliptical', 'cardio', '軽い負荷'),
('エリプティカル', 5.0, 'elliptical', 'cardio', '通常負荷'),
('エリプティカル（きつい）', 8.0, 'elliptical', 'cardio', '高負荷');

-- ステアクライマー系
INSERT INTO exercise_master (name, base_mets, equipment_type, category, description) VALUES
('ステアクライマー（40ステップ/分）', 4.0, 'stairclimber', 'cardio', '低速'),
('ステアクライマー（50ステップ/分）', 5.0, 'stairclimber', 'cardio', 'やや低速'),
('ステアクライマー（60ステップ/分）', 7.0, 'stairclimber', 'cardio', '中速'),
('ステアクライマー（70ステップ/分）', 8.8, 'stairclimber', 'cardio', 'やや高速'),
('ステアクライマー（80ステップ/分）', 10.0, 'stairclimber', 'cardio', '高速'),
('ステアクライマー（90ステップ/分）', 12.0, 'stairclimber', 'cardio', '非常に高速'),
('ステアクライマー（100ステップ/分以上）', 15.0, 'stairclimber', 'cardio', '超高速');

-- 水泳系
INSERT INTO exercise_master (name, base_mets, equipment_type, category, description) VALUES
('水中ウォーキング', 4.8, 'pool', 'cardio', 'プール内歩行'),
('背泳ぎ', 4.8, 'pool', 'cardio', '背面泳法'),
('平泳ぎ', 5.3, 'pool', 'cardio', '平泳ぎ'),
('クロール/自由形', 5.8, 'pool', 'cardio', '自由形泳法'),
('レジャー遊泳', 6.0, 'pool', 'cardio', '自由な泳ぎ'),
('水中エアロビクス/ジョギング', 7.5, 'pool', 'cardio', '水中運動'),
('バタフライ', 13.8, 'pool', 'cardio', '高強度泳法');

-- その他
INSERT INTO exercise_master (name, base_mets, equipment_type, category, description) VALUES
('エアロビクス', 5.0, 'studio', 'cardio', 'スタジオエクササイズ');

-- 胸種目
INSERT INTO exercise_master (name, base_mets, equipment_type, category, description) VALUES
('インクラインダンベルフライ', 3.0, 'freeweight', 'chest', '傾斜ベンチでの胸筋ストレッチ運動'),
('インクラインダンベルプレス', 3.5, 'freeweight', 'chest', '傾斜ベンチでのプレス運動'),
('インクラインプレス', 3.5, 'freeweight', 'chest', '上部胸筋を重点的に鍛える'),
('インクラインベンチプレス', 3.5, 'freeweight', 'chest', 'バーベルでの傾斜プレス'),
('ケーブルクロスオーバー', 3.0, 'cable', 'chest', 'ケーブルでの胸筋収縮運動'),
('ケーブルフライ', 3.0, 'cable', 'chest', 'ケーブルでの胸筋ストレッチ運動'),
('ダンベルフライ', 5.5, 'freeweight', 'chest', 'ダンベルでの胸筋ストレッチ運動'),
('ダンベルプレス', 3.5, 'freeweight', 'chest', 'ダンベルでの基本プレス運動'),
('チェストプレス', 3.5, 'machine', 'chest', 'マシンでの胸筋プレス'),
('ディップス', 8.0, 'bodyweight', 'chest', '自重での胸筋・三頭筋運動'),
('プッシュアップ', 3.8, 'bodyweight', 'chest', '腕立て伏せ'),
('ペクトラルフライ', 3.0, 'machine', 'chest', 'マシンでの胸筋フライ運動'),
('ベンチプレス', 5.0, 'freeweight', 'chest', 'バーベルでの基本胸筋運動');

-- 臀筋種目
INSERT INTO exercise_master (name, base_mets, equipment_type, category, description) VALUES
('ヒップアダクション', 3.8, 'machine', 'glutes', '内転筋群を鍛える'),
('ヒップアブダクション', 4.0, 'machine', 'glutes', '中臀筋を鍛える'),
('ヒップスラスト', 6.0, 'machine', 'glutes', '大臀筋の集中トレーニング');

-- 脚種目
INSERT INTO exercise_master (name, base_mets, equipment_type, category, description) VALUES
('カーフレイズ', 6.5, 'freeweight', 'legs', 'ふくらはぎのトレーニング'),
('スクワット', 6.0, 'freeweight', 'legs', '下半身の基本複合運動'),
('ブルガリアンスクワット', 6.0, 'freeweight', 'legs', '片足での高強度スクワット'),
('ランジ', 5.0, 'bodyweight', 'legs', '前後への踏み込み運動'),
('レッグエクステンション', 6.0, 'machine', 'legs', '大腿四頭筋の単関節運動'),
('レッグカール', 4.0, 'machine', 'legs', 'ハムストリングスの単関節運動'),
('レッグプレス', 6.0, 'machine', 'legs', 'マシンでの脚部プレス運動');

-- 肩種目
INSERT INTO exercise_master (name, base_mets, equipment_type, category, description) VALUES
('アーノルドプレス', 3.5, 'freeweight', 'shoulders', '回旋を加えたショルダープレス'),
('インクラインサイドレイズ', 3.0, 'freeweight', 'shoulders', '傾斜をつけた側方挙上'),
('ケーブルサイドレイズ', 3.0, 'cable', 'shoulders', 'ケーブルでの側方挙上'),
('サイドレイズ', 3.0, 'freeweight', 'shoulders', '三角筋中部の基本運動'),
('ショルダープレス', 5.0, 'freeweight', 'shoulders', '肩の基本プレス運動'),
('ダンベルショルダープレス', 3.5, 'freeweight', 'shoulders', 'ダンベルでの肩プレス'),
('フロントレイズ', 3.0, 'freeweight', 'shoulders', '三角筋前部の運動'),
('ミリタリープレス', 3.5, 'freeweight', 'shoulders', '立位でのバーベルプレス'),
('リアデルト', 3.0, 'machine', 'shoulders', '三角筋後部のマシン運動'),
('リアレイズ', 3.0, 'freeweight', 'shoulders', '三角筋後部の運動');