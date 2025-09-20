# 🌍 環境変数管理ガイド - 長期運用対応版

## 📋 概要

このドキュメントでは、GYMTOPIA 2.0プロジェクトの環境変数管理について、長期運用を考慮したベストプラクティスを記載します。

## 🔑 必須環境変数一覧

### 本番環境（Vercel Production）

| 変数名 | 説明 | 設定場所 | 重要度 |
|--------|------|----------|---------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabaseプロジェクト公開URL | Vercel Dashboard | 🔴 必須 |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase匿名キー | Vercel Dashboard | 🔴 必須 |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabaseサービスロールキー | Vercel Dashboard | 🟡 推奨 |

### 開発環境（ローカル）

| 変数名 | ファイル | 説明 |
|--------|----------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | `.env.local` | 開発用SupabaseプロジェクトURL |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | `.env.local` | 開発用Supabase匿名キー |
| `SUPABASE_SERVICE_ROLE_KEY` | `.env.local` | 開発用Supabaseサービスロールキー |

## 🚀 Vercel環境変数設定手順

### 方法1: Vercelダッシュボード（推奨）

1. **Vercelダッシュボードにアクセス**
   ```
   https://vercel.com/dashboard
   ```

2. **プロジェクト選択**
   - `gymtopia-2` プロジェクトを選択

3. **環境変数設定**
   ```
   Settings → Environment Variables
   ```

4. **各環境変数を追加**
   ```
   Key: NEXT_PUBLIC_SUPABASE_URL
   Value: https://htytewqvkgwyuvcsvjwm.supabase.co
   Environment: Production, Preview, Development

   Key: NEXT_PUBLIC_SUPABASE_ANON_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Environment: Production, Preview, Development

   Key: SUPABASE_SERVICE_ROLE_KEY
   Value: eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...
   Environment: Production, Preview, Development
   ```

5. **デプロイメント再実行**
   ```
   Deployments → 最新デプロイメント → Redeploy
   ```

### 方法2: GitHub Actions（自動化）

```yaml
# .github/workflows/setup-vercel-env.yml を使用
name: Setup Vercel Environment Variables
on:
  workflow_dispatch:
    inputs:
      environment:
        description: 'Target environment'
        required: true
        default: 'production'
```

**実行手順:**
1. GitHubリポジトリの Actions タブ
2. "Setup Vercel Environment Variables" ワークフロー選択
3. "Run workflow" → 環境選択 → 実行

### 方法3: Vercel CLI（手動）

```bash
# プロジェクトリンク
vercel link

# 環境変数追加
echo "your_secret_value" | vercel env add SUPABASE_SERVICE_ROLE_KEY production

# 確認
vercel env ls
```

## 🛡️ セキュリティベストプラクティス

### 1. キーの管理

- **Service Role Key**: 絶対に公開しない
- **Anon Key**: 公開されても問題ないが、RLS設定が重要
- **定期ローテーション**: 3-6ヶ月ごとにキーを更新

### 2. 環境分離

```bash
# 本番環境
SUPABASE_URL=https://htytewqvkgwyuvcsvjwm.supabase.co

# 開発環境（別プロジェクト推奨）
SUPABASE_URL=https://dev-htytewqvkgwyuvcsvjwm.supabase.co
```

### 3. バックアップ

```bash
# 現在の環境変数をバックアップ
vercel env ls > env-backup-$(date +%Y%m%d).txt
```

## 🔧 堅牢なAPIルート設計

### 環境変数不備への対応

```typescript
// upload-avatar/route.ts の改善例
function validateEnvironmentVariables(): { isValid: boolean; error?: string } {
  if (!supabaseUrl) {
    return { isValid: false, error: 'NEXT_PUBLIC_SUPABASE_URL environment variable is not configured' }
  }
  if (!supabaseServiceKey) {
    return { isValid: false, error: 'SUPABASE_SERVICE_ROLE_KEY environment variable is not configured' }
  }
  return { isValid: true }
}
```

**メリット:**
- ビルド時エラーの回避
- 運用時の適切なエラーハンドリング
- デバッグ情報の提供

## 🚨 トラブルシューティング

### よくある問題と解決策

#### 1. デプロイ時「supabaseKey is required」エラー

**原因**: `SUPABASE_SERVICE_ROLE_KEY`環境変数未設定

**解決策**:
```bash
# Vercelダッシュボードで環境変数設定
# または
vercel env add SUPABASE_SERVICE_ROLE_KEY production
```

#### 2. 権限エラー「Not authorized: Trying to access resource under scope」

**原因**: Vercel CLIトークンの権限不足

**解決策**:
1. Vercelダッシュボードで手動設定（推奨）
2. 新しいトークンの生成
3. GitHub Actionsの使用

#### 3. アバターアップロード機能が動作しない

**原因**: 環境変数設定後のデプロイ未実行

**解決策**:
```bash
# 強制再デプロイ
vercel --prod --force
```

## 📊 モニタリングと運用

### 1. 健全性チェック

```bash
# API エンドポイントのテスト
curl -X POST https://your-domain.vercel.app/api/upload-avatar \
  -F "file=@test.jpg" \
  -F "userId=test-user-id"
```

### 2. ログ監視

```bash
# Vercelログの確認
vercel logs --follow
```

### 3. 定期メンテナンス

- **月次**: 環境変数の確認
- **四半期**: キーのローテーション
- **年次**: セキュリティ設定の見直し

## 🔮 今後の改善計画

### 1. 自動化の強化

- CI/CDパイプラインでの環境変数検証
- デプロイ前の自動テスト
- ヘルスチェックの自動化

### 2. セキュリティの向上

- Supabase RLSポリシーの強化
- API レート制限の実装
- 監査ログの導入

### 3. 運用効率化

- 環境変数管理ツールの導入
- アラート機能の実装
- 自動復旧システムの構築

## 📞 緊急時連絡先

**問題が解決しない場合:**
1. このドキュメントの確認
2. TROUBLESHOOTING.mdの参照
3. GitHub Issues での報告

---

**最終更新**: 2025-09-20
**バージョン**: v2.9.0
**責任者**: Development Team