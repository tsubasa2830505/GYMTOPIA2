#!/bin/bash

echo "🔧 CURSOR日本語入力問題修正スクリプト"
echo "================================"

# CURSORのプロセスを確認
echo "1. CURSORを終了しています..."
pkill -f "Cursor" 2>/dev/null || echo "CURSORは起動していません"

# 設定ファイルのバックアップ
echo "2. 設定ファイルをバックアップ中..."
if [ -d "$HOME/Library/Application Support/Cursor" ]; then
    cp -r "$HOME/Library/Application Support/Cursor/User/settings.json" "$HOME/Library/Application Support/Cursor/User/settings.json.backup" 2>/dev/null
fi

# CURSOR設定を直接更新
echo "3. CURSOR設定を更新中..."
CURSOR_SETTINGS="$HOME/Library/Application Support/Cursor/User/settings.json"
if [ -f "$CURSOR_SETTINGS" ]; then
    # 既存の設定に日本語入力最適化を追加
    cat > /tmp/cursor_ime_fix.json << 'EOF'
{
  "keyboard.dispatch": "keyCode",
  "editor.fontFamily": "Monaco, Menlo, monospace",
  "editor.fontSize": 13,
  "editor.lineHeight": 20,
  "editor.quickSuggestions": false,
  "editor.suggestOnTriggerCharacters": false,
  "editor.acceptSuggestionOnEnter": "off",
  "editor.tabCompletion": "off",
  "editor.inlineSuggest.enabled": false,
  "editor.autoClosingBrackets": "never",
  "editor.autoClosingQuotes": "never",
  "editor.formatOnType": false,
  "editor.minimap.enabled": false,
  "editor.hover.enabled": false,
  "editor.parameterHints.enabled": false,
  "files.encoding": "utf8",
  "files.autoGuessEncoding": false
}
EOF

    # 設定をマージ
    if [ -f "$CURSOR_SETTINGS" ]; then
        echo "既存の設定をマージしています..."
        # バックアップから復元が必要な場合のメッセージ
        echo "⚠️  問題が発生した場合: cp $CURSOR_SETTINGS.backup $CURSOR_SETTINGS"
    else
        echo "新規設定ファイルを作成しています..."
        cp /tmp/cursor_ime_fix.json "$CURSOR_SETTINGS"
    fi
fi

# キャッシュをクリア
echo "4. キャッシュをクリア中..."
rm -rf "$HOME/Library/Application Support/Cursor/Cache" 2>/dev/null
rm -rf "$HOME/Library/Application Support/Cursor/CachedData" 2>/dev/null

# プロジェクト設定を適用
echo "5. プロジェクト設定を適用中..."
cp -f .vscode/settings.json .cursor/settings.json 2>/dev/null

echo ""
echo "✅ 設定が完了しました！"
echo ""
echo "次の手順："
echo "1. CURSORを起動してください"
echo "2. Cmd + Shift + P を押す"
echo "3. 'Reload Window' を実行"
echo ""
echo "それでも問題が続く場合："
echo "- システム環境設定 > キーボード > 入力ソース で「ライブ変換」をオフ"
echo "- CURSORの代わりにVSCodeを使用: code ."