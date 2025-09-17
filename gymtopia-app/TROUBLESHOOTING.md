# GYMTOPIA トラブルシューティングガイド

## 🚨 よくある問題と解決方法

### 1. Vercelデプロイメントエラー

#### 問題: "supabaseUrl is required" エラー
```
Error: supabaseUrl is required.
Export encountered an error on /search/results/page
```

**原因**: Supabase環境変数が設定されていない

**解決方法**:
1. **Vercelダッシュボードにアクセス**
   - https://vercel.com/gymtopia-b483a455/gymtopia-2
2. **Settings > Environment Variables** に移動
3. **必須環境変数を追加**:
   ```
   NEXT_PUBLIC_SUPABASE_URL=https://htytewqvkgwyuvcsvjwm.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh0eXRld3F2a2d3eXV2Y3N2andtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NTcxMzQyNDYsImV4cCI6MjA3MjcxMDI0Nn0.xltaH28adx1dIhsqaWllLDPEjw8iDrSglDIwj19rXnA
   ```
4. **Deployments > Redeploy** を実行

#### 問題: GitHub Actions "Dependencies lock file not found"
```
Error: Dependencies lock file is not found in /home/runner/work/GYMTOPIA2/GYMTOPIA2
```

**原因**: GitHub Actionsがpackage-lock.jsonを見つけられない

**解決方法**:
`.github/workflows/e2e.yml` を修正:
```yaml
- name: Setup Node
  uses: actions/setup-node@v4
  with:
    node-version: '22'
    cache: 'npm'
    cache-dependency-path: 'gymtopia-app/package-lock.json'  # この行を追加
```

### 2. Git関連エラー

#### 問題: "You have not agreed to the Xcode license agreements"
```
You have not agreed to the Xcode license agreements. Please run 'sudo xcodebuild -license'
```

**解決方法**:
```bash
sudo xcodebuild -license
# エンターキーでライセンス表示
# スペースキーでスクロール
# 最後に "agree" と入力
```

### 3. デプロイメント確認方法

#### ステップ1: ビルド状況確認
```bash
npm run build
```
- エラーが出ないことを確認

#### ステップ2: Vercelデプロイメント確認
1. **Vercelダッシュボード**で最新デプロイメントが **Ready** 状態
2. **gym-topia.com** でサイトが正常表示

#### ステップ3: 機能テスト
- [ ] サイトが正常に読み込まれる
- [ ] Supabaseエラーが出ない
- [ ] ジム検索機能が動作
- [ ] データベース接続が正常

## 🔧 緊急時の対処手順

### デプロイメントが完全に失敗した場合

1. **環境変数の再確認**
   ```bash
   # Vercelで環境変数を確認
   NEXT_PUBLIC_SUPABASE_URL
   NEXT_PUBLIC_SUPABASE_ANON_KEY
   ```

2. **ローカルビルドテスト**
   ```bash
   npm run build
   npm run start
   ```

3. **強制デプロイメント**
   ```bash
   # 最新コードで強制デプロイ
   git add -A
   git commit -m "Fix deployment issues"
   git push origin main
   ```

4. **Vercel手動デプロイ**
   - Vercelダッシュボード > Deployments > Create Deployment

## 📞 連絡先

問題が解決しない場合:
- **開発者**: takanami-yuta
- **GitHub**: https://github.com/tsubasa2830505/GYMTOPIA2
- **Vercel**: https://vercel.com/gymtopia-b483a455/gymtopia-2

## 📋 予防的チェックリスト

新しいプロジェクト作成時:
- [ ] Supabase環境変数を設定
- [ ] GitHub Actions設定を確認
- [ ] ローカルビルドテスト実行
- [ ] 本番デプロイメントテスト
- [ ] 全機能の動作確認

定期メンテナンス:
- [ ] 月1回のデプロイメントテスト
- [ ] 環境変数の有効期限確認
- [ ] GitHub Actions実行状況確認
- [ ] Supabaseサービス状況確認