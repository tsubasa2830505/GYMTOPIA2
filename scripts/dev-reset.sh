#!/bin/bash

echo "🔧 Next.js開発サーバーのリセットを開始..."

# ポート4000のプロセスを確認・終了
echo "📡 ポート4000のプロセスをチェック中..."
if lsof -Pi :4000 -sTCP:LISTEN -t >/dev/null; then
    echo "⚠️  ポート4000が使用中です。プロセスを終了します..."
    lsof -Pi :4000 -sTCP:LISTEN -t | xargs kill
    sleep 2
else
    echo "✅ ポート4000は利用可能です"
fi

# .nextフォルダを削除（オプション）
if [ "$1" = "--clean" ]; then
    echo "🧹 .nextフォルダをクリーンアップ中..."
    rm -rf .next
fi

# node_modulesの依存関係チェック
echo "📦 依存関係をチェック中..."
npm install --silent

# 開発サーバー起動
echo "🚀 開発サーバーを起動中..."
npm run dev