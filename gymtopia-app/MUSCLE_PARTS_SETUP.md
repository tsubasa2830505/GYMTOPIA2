# 筋肉部位データのセットアップ

## 概要
部位選択機能をSupabaseのデータベース（テーブルID: 17328）と連携させる実装です。

## セットアップ手順

### 1. Supabaseでテーブルを作成
Supabaseダッシュボードで以下のSQLを実行してください：

```sql
-- /supabase/migrations/001_create_muscle_parts.sql の内容を実行
```

### 2. 環境変数の確認
`.env.local`に以下の環境変数が設定されていることを確認：

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 3. 動作確認
1. 開発サーバーを起動: `npm run dev`
2. http://localhost:3000 にアクセス
3. 検索画面で「ターゲット（部位）」セクションを開く
4. Supabaseから取得した部位データが表示されることを確認

## 実装の詳細

### ファイル構成
- `/src/lib/types/muscle-parts.ts` - 型定義
- `/src/lib/supabase/muscle-parts.ts` - データ取得関数
- `/src/components/MachineSelector.tsx` - UIコンポーネント（更新済み）
- `/supabase/migrations/001_create_muscle_parts.sql` - テーブル作成SQL

### データ構造
```typescript
interface MusclePart {
  id: number
  category: string    // chest, back, shoulder, legs, arms, core
  name: string       // 胸, 背中, 肩, 脚, 腕, 体幹
  parts: string[]    // 詳細な部位の配列
}
```

### 特徴
- Supabaseからリアルタイムでデータを取得
- オフライン時はフォールバックデータを使用
- エラーハンドリング実装済み
- ローディング状態の表示

## トラブルシューティング

### データが表示されない場合
1. Supabaseのテーブルが正しく作成されているか確認
2. 環境変数が正しく設定されているか確認
3. ブラウザのコンソールでエラーを確認
4. Supabaseダッシュボードで RLS ポリシーを確認

### 更新方法
Supabaseダッシュボードから直接データを編集できます：
1. Table Editor でmuscle_partsテーブルを開く
2. partsカラムの配列を編集
3. 保存後、アプリケーションをリロード