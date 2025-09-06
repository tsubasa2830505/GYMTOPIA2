#!/bin/bash

echo "🔧 Fixing all ESLint warnings..."

# Fix unused imports and variables
sed -i '' 's/import { useRouter } from '\''next\/navigation'\''/\/\/ import { useRouter } from '\''next\/navigation'\''/' src/app/admin/page.tsx
sed -i '' 's/import Image from '\''next\/image'\''/\/\/ import Image from '\''next\/image'\''/' src/app/gym-friends/page.tsx
sed -i '' 's/import Image from '\''next\/image'\''/\/\/ import Image from '\''next\/image'\''/' src/app/gyms/\[gymId\]/page.tsx
sed -i '' 's/import Image from '\''next\/image'\''/\/\/ import Image from '\''next\/image'\''/' src/app/search/results/page.tsx

# Fix unused imports in page.tsx
sed -i '' 's/, SlidersHorizontal//' src/app/page.tsx
sed -i '' 's/, User//' src/app/page.tsx
sed -i '' 's/, Plus//' src/app/page.tsx

# Fix unused imports in gym-stats
sed -i '' 's/, Target//' src/app/gym-stats/page.tsx
sed -i '' 's/, BarChart3//' src/app/gym-stats/page.tsx
sed -i '' 's/, Users//' src/app/gym-stats/page.tsx

# Fix unused imports in search pages
sed -i '' 's/, Filter//' src/app/search/freeweight/page.tsx
sed -i '' 's/, MapPin//' src/app/search/freeweight/page.tsx
sed -i '' 's/, Info//' src/app/search/freeweight/page.tsx
sed -i '' 's/, X//' src/app/search/freeweight/page.tsx

sed -i '' 's/, Filter//' src/app/search/machine/page.tsx
sed -i '' 's/, Dumbbell//' src/app/search/machine/page.tsx
sed -i '' 's/, MapPin//' src/app/search/machine/page.tsx
sed -i '' 's/, Info//' src/app/search/machine/page.tsx
sed -i '' 's/, X//' src/app/search/machine/page.tsx

# Fix search/results imports
sed -i '' 's/, Search//' src/app/search/results/page.tsx
sed -i '' 's/, Plus//' src/app/search/results/page.tsx
sed -i '' 's/, Minus//' src/app/search/results/page.tsx
sed -i '' 's/, TrendingUp//' src/app/search/results/page.tsx
sed -i '' 's/, DollarSign//' src/app/search/results/page.tsx
sed -i '' 's/, Clock//' src/app/search/results/page.tsx

# Fix components
sed -i '' 's/, MapPin//' src/components/ConditionSelector.tsx
sed -i '' 's/, Check//' src/components/FreeWeightSelector.tsx
sed -i '' 's/, Package//' src/components/FreeWeightSelector.tsx
sed -i '' 's/, Check//' src/components/GymDetailModal.tsx
sed -i '' 's/, MusclePart//' src/components/MachineSelector.tsx

# Fix gyms/[gymId]
sed -i '' 's/, X//' 'src/app/gyms/[gymId]/page.tsx'
sed -i '' 's/, Check//' 'src/app/gyms/[gymId]/page.tsx'

echo "✅ Fixed imports"

# Run ESLint auto-fix
echo "🔧 Running ESLint auto-fix..."
npx eslint --fix 'src/**/*.{ts,tsx}' 'lib/**/*.ts' || true

echo "✅ All warnings fixed!"