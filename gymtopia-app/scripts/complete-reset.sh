#!/bin/bash

echo "🔴 完全リセットを実行中..."
echo "================================================"

# Step 1: すべてのNode/Next.jsプロセスを終了
echo "1️⃣ すべてのNode.js/Next.jsプロセスを終了..."
pkill -9 -f "node" 2>/dev/null || true
pkill -9 -f "next" 2>/dev/null || true
pkill -9 -f "npm" 2>/dev/null || true
sleep 2

# Step 2: ポート3000-3010を強制解放
echo "2️⃣ ポート3000-3010を解放..."
for port in {3000..3010}; do
    lsof -ti :$port 2>/dev/null | xargs -r kill -9 2>/dev/null || true
done

# Step 3: .nextディレクトリとnode_modulesのクリーンアップ
echo "3️⃣ キャッシュをクリーンアップ..."
rm -rf .next
rm -rf node_modules/.cache
rm -f package-lock.json.lock

# Step 4: 残っているプロセスの確認
echo "4️⃣ プロセスチェック..."
remaining=$(ps aux | grep -E "node|next|npm" | grep -v grep | wc -l | tr -d ' ')
if [ "$remaining" -eq "0" ]; then
    echo "✅ すべてのプロセスが正常に終了しました"
else
    echo "⚠️  $remaining個のプロセスが検出されました。強制終了中..."
    ps aux | grep -E "node|next|npm" | grep -v grep | awk '{print $2}' | xargs -r kill -9 2>/dev/null || true
fi

echo "================================================"
echo "✨ リセット完了！"
echo ""
echo "新しいサーバーを起動するには:"
echo "  npm run dev"
echo ""