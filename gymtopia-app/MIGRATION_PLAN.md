# gym-topia.com への移行計画

## 現在の状況
- **現在のアカウント**: tsubasaa2830505-7621s-projects
- **移行先アカウント**: takanami-yuta (gym-topia.com)
- **GitHubリポジトリ**: https://github.com/tsubasa2830505/GYMTOPIA2

## 移行に必要なアクション

### 1. アクセス権限の取得
- [ ] takanami-yutaさんからVercelチーム招待を受ける
- [ ] または、GitHubリポジトリへのアクセス権を付与

### 2. 環境変数の移行
```
NEXT_PUBLIC_SUPABASE_URL=https://htytewqvkgwyuvcsvjwm.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=[移行が必要]
NEXT_PUBLIC_GOOGLE_MAPS_API_KEY=[移行が必要]
```

### 3. デプロイ設定
- プロダクションブランチ: main
- ビルドコマンド: npm run build
- 出力ディレクトリ: .next

## 連絡事項
takanami-yutaさんに以下を依頼：

1. Vercelプロジェクトへのアクセス権限
2. 環境変数の設定権限
3. デプロイ権限

## 移行後のURL
- カスタムドメイン: https://gym-topia.com
- Vercelドメイン: https://gymtopia-2-45s22ravc-gymtopia-b483a455.vercel.app
