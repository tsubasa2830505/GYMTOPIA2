# DB Cleanup Manifest (Living Document)

目的: 現行コードでの実使用・将来計画・保守性を踏まえて、テーブル/カラムの扱いを「保持/保留/候補」に分類し、無闇な削除を避けつつ段階的な整理を行うための合意ドキュメント。

更新原則
- まず非破壊: 直ちにDROPせず、型/実装の整合→非推奨マーキング→十分な観測の後に削除
- 製品方針優先: 将来使用の可能性があるものは「保留」へ。PRD/ロードマップ確定後に見直す
- 可観測性: ランタイム監査（service key推奨）で実データの有無を確認し、判断材料にする

分類定義
- 保持(Keep): 現行で使用 or 近々の実装で使用予定
- 保留(TBD): 将来的に使用する可能性あり（要判断期限）
- 候補(Candidate): 現行未使用・将来計画なし（十分な観測期間の後に削除検討）

このファイルは `scripts/audit-db-usage.js` の結果（`db-usage-audit.json`）を元に手動でキュレーションします。

---

## テーブル概要（初期案）

保持(Keep)
- users: コア。未宣言の使用カラム（例: `is_verified`, `prefecture`）は型整合要検討
- gyms: コア。UI/検索で利用。宣言のみのカラムは一部「保留」に移行
- gym_posts, follows, favorite_gyms, workout_sessions: ソーシャル/アクティビティ中核

保留(TBD)
- user_profiles: 拡張プロファイル（可視性設定/体組成など）。当面は継続、将来のUIで活用検討
- achievements, personal_records: 実データ/UIの整備に応じて拡張予定（削除不可）
- notifications: 将来の通知センターに活用

候補(Candidate)
- owner_applications, post_comments, user_statistics, exercises: 現行UI未使用。要判断期限の設定
- freeweight_categories, facility_categories, machine_categories: 新UIのカテゴリ体系と重複の可能性。統合方針を定めるまで保留→候補へ
- gym_equipment, gym_machines, gym_free_weights, gym_facilities 等の重複名: 新スキーマへ統合済みか重複のため、マッピング確認後に候補

※ 各テーブルのカラム単位の詳細は次節を参照。

---

## カラム詳細（抜粋・初期スナップショット）

users（型未宣言→使用）
- is_verified, prefecture, city, has_24h, has_locker, has_parking, has_sauna, has_shower: 型追加候補（UI/検索で利用しているため保持）

gyms（宣言のみ→未使用）
- address, opening_hours, website など: 今後の詳細ページで活用可能なため「保留」

gym_posts（宣言のみ→未使用）
- image_urls, shares_count など: フィード拡張時に使用の可能性があるため「保留」。廃止するなら型からも削除

achievements/personal_records
- 細粒度のメトリクス（calories/duration等）は現状UIに未露出→「保留」

---

## 判断フローと期限
1) 型整合（non-destructive）
   - 実使用だが未宣言のカラムは `src/types/database.ts` に追加（PR）
   - 宣言のみのカラムは「保留」マーク（コメント）し維持
2) ランタイム監査（30日継続推奨）
   - `scripts/runtime-db-audit.js` をservice keyで週次実行し、各カラムの非NULL出現を観測
3) 意思決定
   - 「候補」カラム/テーブルはプロダクト合意後、マイグレーションを作成（Drop or Rename）

---

## 実行方法
- 静的解析: `node scripts/audit-db-usage.js` → `db-usage-audit.json`
- ランタイム監査: `node scripts/runtime-db-audit.js`（service key推奨）

---

メンテナ
- オーナー: プロダクト/データ責任者
- 更新頻度: 仕様の変化/大きなリリース毎

