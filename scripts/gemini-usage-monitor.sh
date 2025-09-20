#!/bin/bash

# Gemini API使用量監視スクリプト
# 各モデルの制限と現在の使用状況を追跡

API_KEY="AIzaSyDxpSTjK60s37i60G17YK3xgwO8MNt-OdA"
LOG_FILE="/tmp/gemini_usage.log"

# モデル別制限設定（互換性のため配列を避ける）
get_model_limits() {
    case $1 in
        "gemini-2.0-flash-lite") echo "30,1000000,200" ;;
        "gemini-2.0-flash") echo "15,1000000,200" ;;
        "gemini-2.5-flash-lite") echo "15,250000,1000" ;;
        "gemini-2.5-flash") echo "10,250000,250" ;;
        "gemini-2.5-pro") echo "5,250000,100" ;;
        *) echo "0,0,0" ;;
    esac
}

# 使用量記録
log_usage() {
    local model=$1
    local tokens=$2
    local timestamp=$(date '+%Y-%m-%d %H:%M:%S')
    echo "$timestamp,$model,$tokens" >> "$LOG_FILE"
}

# 制限チェック
check_limits() {
    local model=$1
    local limits=$(get_model_limits "$model")
    IFS=',' read -r rpm tpm rpd <<< "$limits"

    echo "🔍 $model の制限:"
    echo "  - 分間リクエスト: $rpm RPM"
    echo "  - 分間トークン: $tpm TPM"
    echo "  - 日間リクエスト: $rpd RPD"
}

# 推奨モデル選択
recommend_model() {
    echo "🚀 推奨フォールバック順序:"
    echo "1. gemini-2.0-flash-lite (30 RPM) - 最優先"
    echo "2. gemini-2.0-flash (15 RPM)"
    echo "3. gemini-2.5-flash-lite (15 RPM, 1000 RPD)"
    echo "4. gemini-2.5-flash (10 RPM)"
    echo "5. gemini-2.5-pro (5 RPM) - 高品質"
}

# 簡単な使用量テスト
test_model() {
    local model=$1
    echo "🧪 $model をテスト中..."

    response=$(curl -s "https://generativelanguage.googleapis.com/v1beta/models/$model:generateContent" \
        -H 'Content-Type: application/json' \
        -H "X-goog-api-key: $API_KEY" \
        -X POST \
        -d '{
            "contents": [
                {
                    "parts": [
                        {
                            "text": "Hello, respond with exactly 5 words"
                        }
                    ]
                }
            ]
        }')

    if echo "$response" | grep -q "candidates"; then
        tokens=$(echo "$response" | grep -o '"totalTokenCount":[0-9]*' | cut -d':' -f2)
        tokens=${tokens:-"N/A"}
        echo "  ✅ 成功: $tokens トークン使用"
        log_usage "$model" "$tokens"
    else
        echo "  ❌ エラー: $(echo $response | head -c 100)..."
    fi
}

# メイン実行
main() {
    echo "=== Gemini API 使用量監視システム ==="
    echo ""

    case ${1:-"help"} in
        "limits")
            for model in "gemini-2.0-flash-lite" "gemini-2.0-flash" "gemini-2.5-flash-lite" "gemini-2.5-flash" "gemini-2.5-pro"; do
                check_limits "$model"
                echo ""
            done
            ;;
        "recommend")
            recommend_model
            ;;
        "test")
            test_model "gemini-2.0-flash-lite"
            test_model "gemini-2.0-flash"
            ;;
        "log")
            if [ -f "$LOG_FILE" ]; then
                echo "📊 使用履歴:"
                tail -10 "$LOG_FILE"
            else
                echo "📊 使用履歴なし"
            fi
            ;;
        *)
            echo "使用方法:"
            echo "  $0 limits     - モデル別制限表示"
            echo "  $0 recommend  - 推奨フォールバック順序"
            echo "  $0 test       - モデル動作テスト"
            echo "  $0 log        - 使用履歴表示"
            ;;
    esac
}

main "$@"