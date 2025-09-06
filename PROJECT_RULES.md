# GYMTOPIA 2.0 プロジェクトルール

## プロジェクト構造

```
GYMTOPIA2.0/
├── gymtopia-app/          # メインのNext.jsアプリケーション
│   ├── src/
│   │   ├── app/          # Next.js App Router
│   │   ├── components/   # 共通コンポーネント
│   │   └── lib/          # ユーティリティ、定数、型定義
│   ├── public/           # 静的ファイル
│   ├── package.json      # プロジェクト依存関係
│   └── .env.local        # 環境変数（Supabase接続情報など）
├── CLAUDE.md             # 開発ガイドライン
├── PROJECT_RULES.md      # このファイル
└── requirements.md       # プロジェクト要件

```

## 重要なルール

### 1. パッケージ管理
- **単一のpackage.json**: `gymtopia-app/package.json`のみを使用
- ルートディレクトリにpackage.jsonやpackage-lock.jsonを作成しない
- 依存関係の追加は必ず`gymtopia-app`ディレクトリ内で行う

### 2. 開発サーバー
- 常に`gymtopia-app`ディレクトリから起動する
```bash
cd gymtopia-app
npm run dev
```
- ポート3000を使用（他のプロセスが使用している場合は終了させる）

### 3. ファイル配置ルール
- **コンポーネント**: `gymtopia-app/src/components/`
- **ページ**: `gymtopia-app/src/app/[route]/page.tsx`
- **API**: `gymtopia-app/src/app/api/[route]/route.ts`
- **型定義**: `gymtopia-app/src/lib/types/`
- **定数**: `gymtopia-app/src/lib/constants/`
- **ユーティリティ**: `gymtopia-app/src/lib/utils/`

### 4. 環境変数
- Supabase接続情報は`.env.local`で管理
- ハードコーディングは絶対に避ける
```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_anon_key
```

### 5. コーディング規約
- TypeScriptを使用
- 関数コンポーネントのみ使用（クラスコンポーネントは不可）
- Tailwind CSSでスタイリング
- lucide-reactアイコンを優先使用

### 6. データベース（Supabase）
- 接続情報は環境変数で管理
- エラーハンドリングは必須
- 型定義を明確にする
- SQLの直書きは避け、Supabaseクライアントを使用

### 7. Gitルール
- コミットメッセージは日本語で明確に
- 機能ごとにコミットを分ける
- 環境変数ファイル（.env.local）はコミットしない

## 作業開始時のチェックリスト

1. [ ] `gymtopia-app`ディレクトリに移動
2. [ ] 既存のプロセスを確認（`lsof -i :3000`）
3. [ ] 必要なら既存プロセスを終了
4. [ ] 開発サーバーを起動（`npm run dev`）
5. [ ] http://localhost:3000 でアクセス確認

## トラブルシューティング

### ポート競合の解決
```bash
# ポート3000を使用しているプロセスを確認
lsof -i :3000

# プロセスを終了
kill [PID]
```

### 複数のlockfileエラー
- ルートディレクトリのpackage-lock.jsonを削除
- `gymtopia-app/package-lock.json`のみを維持

## 更新履歴
- 2025-08-30: 初版作成、プロジェクト構造の統一化