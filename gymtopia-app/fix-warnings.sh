#!/bin/bash

# Fix all ESLint warnings and errors automatically

echo "Fixing all warnings and errors..."

# Fix unused imports/variables in each file
files=(
  "src/app/admin/page.tsx"
  "src/app/gym-friends/page.tsx"
  "src/app/gym-stats/page.tsx"
  "src/app/gyms/[gymId]/page.tsx"
  "src/app/page.tsx"
  "src/app/search/freeweight/page.tsx"
  "src/app/search/machine/page.tsx"
  "src/app/search/results/page.tsx"
  "src/app/workout/page.tsx"
  "src/components/ConditionSelector.tsx"
  "src/components/FreeWeightSelector.tsx"
  "src/components/GymDetailModal.tsx"
  "src/components/MachineSelector.tsx"
  "lib/supabase.ts"
)

# Run ESLint auto-fix
npx eslint --fix src/**/*.{ts,tsx} lib/**/*.{ts,tsx}

echo "Auto-fix complete. Running build to check remaining issues..."
npm run build