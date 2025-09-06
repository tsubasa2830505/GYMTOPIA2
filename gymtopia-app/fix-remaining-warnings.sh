#!/bin/bash

echo "🔧 Fixing remaining warnings..."

# Fix unused params in gyms/[gymId]/page.tsx
sed -i '' 's/const params = await Promise.resolve(props.params)/\/\/ const params = await Promise.resolve(props.params) \/\/ 未使用/' 'src/app/gyms/[gymId]/page.tsx'

# Fix unused sortBy and setSortBy in search/results/page.tsx
sed -i '' 's/const \[sortBy, setSortBy\] = useState/\/\/ const \[sortBy, setSortBy\] = useState/' src/app/search/results/page.tsx

# Fix unused setSelectedExercises in workout/page.tsx
sed -i '' 's/const \[selectedExercises, setSelectedExercises\]/const \[selectedExercises\]/' src/app/workout/page.tsx

# Fix unused gymId in GymDetailModal
sed -i '' 's/gymId: gymId/\/\/ gymId: gymId/' src/components/GymDetailModal.tsx

# Fix React Hook dependency in test-supabase
sed -i '' 's/}, \[\])/}, \[tableData\])/' src/app/test-supabase/page.tsx

echo "✅ Fixed all remaining warnings!"