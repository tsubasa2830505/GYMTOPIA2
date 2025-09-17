# GYMTOPIA 2.0

## 概要
GYMTOPIAは、ジム愛好家のためのソーシャルフィットネスプラットフォームです。ワークアウトの記録、ジムの検索、フィットネスコミュニティとの交流を通じて、健康的なライフスタイルをサポートします。

## 主な機能

### 🏋️ ワークアウト管理
- トレーニング記録の作成・管理
- 個人記録の追跡
- 統計情報の可視化

### 🔍 ジム検索
- 近隣のジム検索
- 設備・機材の詳細情報
- レビューと評価

### 👥 ソーシャル機能
- フォロー/フォロワーシステム
- 相互フォロー機能
- 投稿とコメント
- いいね機能

### 📊 統計・分析
- 週次・月次統計
- トレーニング傾向の分析
- パフォーマンスの追跡

## 技術スタック

- **フロントエンド**: Next.js 15.5, React 19, TypeScript
- **スタイリング**: Tailwind CSS 3.4
- **データベース**: Supabase (PostgreSQL)
- **認証**: Supabase Auth
- **マップ**: Leaflet / React-Leaflet

## セットアップ

### 必要条件
- Node.js 18以上
- npm または yarn
- Supabaseアカウント

### インストール

1. リポジトリをクローン
```bash
git clone https://github.com/tsubasa2830505/GYMTOPIA2.git
cd GYMTOPIA2.0/gymtopia-app
```

2. 依存関係をインストール
```bash
npm install
```

3. 環境変数を設定
```bash
cp .env.example .env.local
# .env.localファイルを編集し、必要な値を設定
```

4. 開発サーバーを起動
```bash
npm run dev
```

## スクリプト

- `npm run dev` - 開発サーバー起動
- `npm run build` - プロダクションビルド
- `npm run start` - プロダクションサーバー起動
- `npm run lint` - ESLintチェック
- `npm run typecheck` - TypeScriptチェック

## プロジェクト構造

```
gymtopia-app/
├── src/
│   ├── app/           # Next.js App Router ページ
│   ├── components/    # 再利用可能なコンポーネント
│   ├── contexts/      # Reactコンテキスト
│   ├── lib/          # ユーティリティ関数とAPI
│   └── types/        # TypeScript型定義
├── public/           # 静的ファイル
└── scripts/         # ビルドとメンテナンススクリプト
```

## バージョン履歴

### v2.4.1 (最新)
- ジム友機能を削除し、フォローシステムに統合
- データベース最適化
- UI/UXの改善

## ライセンス
Private Repository

## 貢献
現在、プライベートプロジェクトとして開発中です。