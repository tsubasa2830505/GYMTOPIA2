#!/bin/bash

# 開発サーバー再起動スクリプト
# 複数のNext.jsプロセスが起動するのを防ぐ

echo "🔄 開発サーバーをリセット中..."

# 既存のNext.jsプロセスをすべて停止
echo "📍 既存のNext.jsプロセスを停止中..."
pkill -f "next dev" 2>/dev/null || true
sleep 1

# ポート3000と3001を使用しているプロセスを確認
if lsof -i :3000 >/dev/null 2>&1; then
    echo "⚠️  ポート3000が使用中です。プロセスを停止します..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null || true
fi

if lsof -i :3001 >/dev/null 2>&1; then
    echo "⚠️  ポート3001が使用中です。プロセスを停止します..."
    lsof -ti :3001 | xargs kill -9 2>/dev/null || true
fi

# --cleanオプションが指定された場合は.nextディレクトリも削除
if [ "$1" = "--clean" ]; then
    echo "🗑️  .nextディレクトリを削除中..."
    rm -rf .next
fi

echo "✅ リセット完了！"
echo "🚀 新しい開発サーバーを起動中..."

# 単一の開発サーバーを起動
exec next dev