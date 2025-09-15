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

# ポート3000-3010を使用しているプロセスを強制終了
echo "📍 ポート3000-3010を解放中..."
for port in {3000..3010}; do
    if lsof -i :$port >/dev/null 2>&1; then
        echo "  ポート$portを解放..."
        lsof -ti :$port | xargs kill -9 2>/dev/null || true
    fi
done

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