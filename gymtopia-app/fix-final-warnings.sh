#!/bin/bash

echo "🔧 最終警告修正を開始..."

# 1. 未使用インポートの削除
echo "📦 未使用インポートを削除中..."

# src/app/search/machine/page.tsx から Dumbbell を削除
sed -i '' 's/import { Dumbbell, Check/import { Check/' src/app/search/machine/page.tsx

# src/app/search/results/page.tsx から Search を削除
sed -i '' 's/import { Search, Star/import { Star/' src/app/search/results/page.tsx

# src/app/page.tsx から Search を削除
sed -i '' 's/import { Search, MapPin/import { MapPin/' src/app/page.tsx

# src/components/MachineSelector.tsx から MusclePart を削除
sed -i '' 's/import type { MusclePart } from/\/\/ import type { MusclePart } from/' src/components/MachineSelector.tsx

echo "✅ 未使用インポート削除完了"

# 2. 未使用変数の修正
echo "🔧 未使用変数を修正中..."

# gyms/[gymId]/page.tsx の params を削除
sed -i '' '/const params = await Promise.resolve(props.params)/d' 'src/app/gyms/[gymId]/page.tsx'

# GymDetailModal.tsx の gymId パラメータを削除（使用していない箇所）
sed -i '' 's/onConfirm: (selectedEquipment: string\[\], gymId: string)/onConfirm: (selectedEquipment: string\[\])/' src/components/GymDetailModal.tsx

echo "✅ 未使用変数修正完了"

echo "🎉 すべての警告修正が完了しました！"