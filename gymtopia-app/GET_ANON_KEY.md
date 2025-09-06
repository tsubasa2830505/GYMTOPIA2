# Supabase Anon Key の取得方法

## 手順

### 1. Supabaseダッシュボードにアクセス
以下のURLをクリック：
https://supabase.com/dashboard/project/onfqhnhdfbovgcnksatu/settings/api

### 2. 左メニューから「Settings」を選択
- プロジェクトのダッシュボードの左側メニューで「Settings」をクリック

### 3. 「API」セクションを選択
- Settings内の「API」をクリック

### 4. Project API keys を探す
このセクションに2つのキーがあります：
- **anon public** - これが必要なキーです（公開可能）
- **service_role secret** - これは使用しません（秘密にする）

### 5. anon publicキーをコピー
`eyJ...` で始まる長い文字列をコピーしてください。

例：
```
eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im9uZnFobmhkZmJvdmdjbmtzYXR1Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3MzQwMDAwMDAsImV4cCI6MjA0OTU3NjAwMH0.xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx
```

### 6. .env.localファイルに貼り付け
`.env.local`ファイルの以下の行を更新：
```
NEXT_PUBLIC_SUPABASE_ANON_KEY=ここにコピーしたキーを貼り付け
```

### 7. 開発サーバーを再起動
```bash
# Ctrl+C で停止してから
npm run dev
```

## 確認方法
http://localhost:3000/test-supabase にアクセスして、`muscles`テーブルのデータが表示されることを確認してください。