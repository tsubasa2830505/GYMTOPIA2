#!/bin/bash

echo "🔴 完全リセットを実行中..."
echo "================================================"

# Step 1: 開発サーバー関連のプロセスのみを終了（Claude Codeは除外）
echo "1️⃣ 開発サーバープロセスを終了（Claude Codeは保持）..."
# Next.js開発サーバーのみを終了
pkill -9 -f "next dev" 2>/dev/null || true
pkill -9 -f "next-server" 2>/dev/null || true
# npm run devのみを終了（Claude Code関連は除外）
pkill -9 -f "npm run dev" 2>/dev/null || true
sleep 2

# Step 2: ポート3000のみを解放（3001はClaude Code用に保持）
echo "2️⃣ ポート3000を解放..."
# Claude Codeが使用する3001番ポートは除外
lsof -ti :3000 2>/dev/null | xargs -r kill -9 2>/dev/null || true

# Step 3: .nextディレクトリとnode_modulesのクリーンアップ
echo "3️⃣ キャッシュをクリーンアップ..."
rm -rf .next
rm -rf node_modules/.cache
rm -f package-lock.json.lock

# Step 4: 開発サーバープロセスの確認
echo "4️⃣ 開発サーバープロセスチェック..."
remaining=$(ps aux | grep -E "next dev|next-server|npm run dev" | grep -v grep | grep -v ".claude" | wc -l | tr -d ' ')
if [ "$remaining" -eq "0" ]; then
    echo "✅ すべての開発サーバープロセスが正常に終了しました"
else
    echo "⚠️  $remaining個の開発サーバープロセスが検出されました。強制終了中..."
    ps aux | grep -E "next dev|next-server|npm run dev" | grep -v grep | grep -v ".claude" | awk '{print $2}' | xargs -r kill -9 2>/dev/null || true
fi

echo "================================================"
echo "✨ リセット完了！"
echo ""
echo "新しいサーバーを起動するには:"
echo "  npm run dev"
echo ""