# GYMTOPIA 2.0 デプロイメントガイド

## 🚀 デプロイメント方法

### 方法1: GitHub経由の自動デプロイ（推奨）
```bash
# 1. 変更をコミット
git add -A
git commit -m "feat: 機能説明"

# 2. GitHubへプッシュ
git push origin main

# 3. Vercelが自動でデプロイ
```

### 方法2: Vercel CLIで手動デプロイ
```bash
# プレビューデプロイ
vercel

# 本番デプロイ
vercel --prod
```

## 📋 環境変数の管理

### ローカル開発用 (.env.local)
```
NEXT_PUBLIC_SUPABASE_URL=https://htytewqvkgwyuvcsvjwm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### Vercel環境変数
Vercelダッシュボード > Settings > Environment Variables で設定

## 🔍 デプロイ状況の確認
- GitHub Actions: https://github.com/tsubasa2830505/GYMTOPIA2/actions
- Vercel: https://vercel.com/tsubasaa2830505-7621s-projects/gymtopia-2

## ⚠️ トラブルシューティング

### Gitが使えない場合
```bash
sudo xcodebuild -license
```

### ビルドエラーの場合
```bash
npm run typecheck
npm run lint
npm run build
```

## 📱 開発環境の切り替え

### Claude Code ↔ Cursor
```bash
# Claude Code → Cursor
./scripts/complete-reset.sh

# Cursor → Claude Code  
PORT=3001 npm run dev
```
