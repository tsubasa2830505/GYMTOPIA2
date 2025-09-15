#!/bin/bash

# すべての開発サーバープロセスを強制終了するスクリプト

echo "🛑 すべての開発サーバープロセスを強制終了中..."

# Next.jsプロセスを停止
echo "📍 Next.jsプロセスを停止中..."
pkill -9 -f "next dev" 2>/dev/null || true
pkill -9 -f "next-server" 2>/dev/null || true

# Node.jsの開発関連プロセスを停止（Claude Codeは除外）
echo "📍 Node.js開発プロセスを停止中（Claude Codeは保持）..."
# 開発プロセスのみを対象にして終了
ps aux | grep -E "node.*dev" | grep -v grep | grep -v ".claude" | awk '{print $2}' | xargs -r kill -9 2>/dev/null || true
ps aux | grep -E "npm run dev" | grep -v grep | grep -v ".claude" | awk '{print $2}' | xargs -r kill -9 2>/dev/null || true

# ポート3000のみを解放（Claude Code用の3001は保持）
echo "📍 ポート3000を解放中（3001はClaude Code用に保持）..."
if lsof -i :3000 >/dev/null 2>&1; then
    echo "  ポート3000を解放..."
    lsof -ti :3000 | xargs kill -9 2>/dev/null || true
fi

# .nextディレクトリのロックファイルを削除
echo "🗑️  ロックファイルを削除中..."
rm -rf .next/cache/*.lock 2>/dev/null || true

# プロセスが完全に終了するまで待機
sleep 2

# 残っている開発サーバープロセスを確認
remaining=$(ps aux | grep -E "(next|node.*dev)" | grep -v grep | grep -v ".claude" | wc -l | tr -d ' ')
if [ "$remaining" -gt 0 ]; then
    echo "⚠️  まだ$remaining個の開発サーバープロセスが残っています。強制終了中..."
    ps aux | grep -E "(next|node.*dev)" | grep -v grep | grep -v ".claude" | awk '{print $2}' | xargs kill -9 2>/dev/null || true
fi

echo "✅ すべてのプロセスを終了しました！"
echo ""
echo "📌 新しいサーバーを起動するには:"
echo "   npm run dev"
echo ""