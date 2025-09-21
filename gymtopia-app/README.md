# GYMTOPIA - ジム特化型SNSアプリケーション

## 概要
GYMTOPIAは、ジム愛好者のためのソーシャルネットワーキングサービスです。トレーニング記録の共有、ジムでのチェックイン、トレーニング仲間とのつながりを通じて、フィットネスライフをより充実させます。

## 主な機能

### 🏋️ コア機能
- **ジムチェックイン**: GPS認証による位置確認
- **トレーニング投稿**: ワークアウト記録の共有
- **フォローシステム**: トレーニング仲間とつながる
- **ジム検索**: 近くのジムを地図で探索
- **プロフィール管理**: 実績・統計の可視化

### 🚀 最近の更新
- GPS認証バッジ機能の実装
- プロフィールページのモーダル表示改善
- フィードページの「同じジム」タブ復活

## 技術スタック

- **フロントエンド**: Next.js 15.5.2, React 19, TypeScript
- **バックエンド**: Supabase (PostgreSQL, Auth, Storage)
- **スタイリング**: Tailwind CSS
- **デプロイ**: Vercel

## 開発環境セットアップ

```bash
# 依存関係のインストール
npm install

# 開発サーバーの起動
npm run dev

# ビルド
npm run build

# 型チェック
npm run typecheck

# リント
npm run lint
```

## 環境変数

`.env.local`ファイルに以下を設定:

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key
```

## プロジェクト構成

```
gymtopia-app/
├── src/
│   ├── app/          # Next.js App Router
│   ├── components/   # Reactコンポーネント
│   ├── lib/         # ユーティリティ・API
│   └── contexts/    # React Context
├── public/          # 静的ファイル
├── supabase/        # データベース設定
└── docs/           # ドキュメント
```

## ライセンス

Proprietary - All rights reserved