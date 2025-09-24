#!/bin/bash

echo "=== エッジケーステスト開始 ==="
BASE_URL="http://localhost:3002"

# 1. 長い文字列入力テスト
echo -e "\n1. 長い文字列入力テスト"
LONG_STRING=$(python3 -c "print('a' * 10000)")
curl -X POST "$BASE_URL/api/follow" \
  -H "Content-Type: application/json" \
  -d "{\"followerId\": \"$LONG_STRING\", \"followingId\": \"test\", \"action\": \"follow\"}" \
  -s -o /dev/null -w "Status: %{http_code}\n"

# 2. 特殊文字入力テスト
echo -e "\n2. 特殊文字入力テスト"
curl -X POST "$BASE_URL/api/follow" \
  -H "Content-Type: application/json" \
  -d '{"followerId": "<script>alert(1)</script>", "followingId": "'; DROP TABLE users;--", "action": "follow"}' \
  -s -o /dev/null -w "Status: %{http_code}\n"

# 3. NULL値テスト
echo -e "\n3. NULL値テスト"
curl -X POST "$BASE_URL/api/follow" \
  -H "Content-Type: application/json" \
  -d '{"followerId": null, "followingId": null, "action": null}' \
  -s -o /dev/null -w "Status: %{http_code}\n"

# 4. 空オブジェクトテスト
echo -e "\n4. 空オブジェクトテスト"
curl -X POST "$BASE_URL/api/follow" \
  -H "Content-Type: application/json" \
  -d '{}' \
  -s -o /dev/null -w "Status: %{http_code}\n"

# 5. 不正なJSON形式テスト
echo -e "\n5. 不正なJSON形式テスト"
curl -X POST "$BASE_URL/api/follow" \
  -H "Content-Type: application/json" \
  -d '{invalid json}' \
  -s -o /dev/null -w "Status: %{http_code}\n"

# 6. 巨大なペイロードテスト
echo -e "\n6. 巨大なペイロードテスト (1MB)"
BIG_DATA=$(python3 -c "import json; print(json.dumps({'data': 'x' * 1000000}))")
curl -X POST "$BASE_URL/api/follow" \
  -H "Content-Type: application/json" \
  -d "$BIG_DATA" \
  -s -o /dev/null -w "Status: %{http_code}\n"

echo -e "\n=== エッジケーステスト完了 ==="
