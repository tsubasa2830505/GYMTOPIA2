# UI崩れ・ビルドエラー防止システム

## 🛡️ 設定済み保護機能

### 1. Git Pre-commitフック
- **場所**: `.githooks/pre-commit`
- **機能**:
  - 重要ファイル（`globals.css`, `package.json`など）の変更を自動検出
  - `globals.css`のTailwind設定の整合性チェック
  - Lint・TypeScriptエラーの事前チェック
  - 変更確認プロンプトで誤った変更を防止

### 2. 自動バックアップシステム
- **場所**: `scripts/auto-backup.sh`
- **実行方法**:
  ```bash
  npm run backup          # 手動バックアップ
  npm run safe-commit     # バックアップ付きコミット
  ```

### 3. VS Code設定
- **場所**: `.vscode/settings.json`
- **機能**:
  - 保存時の自動フォーマット
  - ESLintの自動修正
  - Tailwind CSSのサポート強化

### 4. Git属性設定
- **場所**: `.gitattributes`
- **機能**:
  - 重要ファイルの特別な取り扱い
  - 改行コードの統一
  - バイナリファイルの適切な識別

## 🚀 使用方法

### 日常的な開発
```bash
# 開発サーバー起動
npm run dev

# コード品質チェック
npm run lint
npm run typecheck

# 安全なコミット（自動バックアップ付き）
npm run safe-commit -m "機能追加: ユーザー認証"
```

### 重要な変更前
```bash
# 手動バックアップ作成
npm run backup

# 変更後の確認
git status
git diff
```

### トラブル発生時
```bash
# 最新のバックアップブランチを確認
git branch | grep backup_

# 特定のファイルを復元
git restore path/to/file

# 完全にバックアップに戻す
git checkout backup_YYYYMMDD_HHMMSS
```

## ⚠️ 保護されているファイル

以下のファイルは特別な保護下にあります：

1. **`gymtopia-app/src/app/globals.css`**
   - Tailwind CSSの設定ファイル
   - UI全体に影響する重要なファイル

2. **`gymtopia-app/package.json`**
   - 依存関係とスクリプトの定義
   - ビルドプロセスに直接影響

3. **`gymtopia-app/tailwind.config.js`**
   - Tailwindの設定ファイル

4. **`gymtopia-app/next.config.js`**
   - Next.jsの設定ファイル

## 🔧 カスタマイズ

### 保護ファイルの追加
`.githooks/pre-commit`の`PROTECTED_FILES`配列に追加：

```bash
PROTECTED_FILES=(
    "gymtopia-app/src/app/globals.css"
    "gymtopia-app/package.json"
    "your/new/protected/file.js"  # ←ここに追加
)
```

### バックアップの保持期間変更
`scripts/auto-backup.sh`の`CUTOFF_DATE`計算を修正：

```bash
# 現在: 7日間保持
CUTOFF_DATE=$(date -d '7 days ago' '+%Y%m%d')

# 変更例: 30日間保持
CUTOFF_DATE=$(date -d '30 days ago' '+%Y%m%d')
```

## 💡 ベストプラクティス

1. **重要な変更前は必ずバックアップ**
   ```bash
   npm run backup
   ```

2. **コミット前の確認習慣**
   ```bash
   git status
   git diff
   npm run lint
   npm run typecheck
   ```

3. **定期的なバックアップブランチの確認**
   ```bash
   git branch | grep backup_ | head -5
   ```

4. **エラー発生時の迅速な復旧**
   ```bash
   git restore problematic-file.css
   ```

これらの設定により、UI崩れやビルドエラーを大幅に減らすことができます。