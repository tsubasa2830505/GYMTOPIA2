#!/bin/bash

# Fix all Supabase files that initialize client at top level

FILES=(
  "src/lib/supabase/statistics.ts"
  "src/lib/supabase/achievements.ts"
  "src/lib/supabase/search.ts"
  "src/lib/supabase/notifications.ts"
  "src/lib/supabase/workouts.ts"
  "src/lib/supabase/admin-statistics.ts"
  "src/lib/supabase/muscle-parts.ts"
  "src/lib/supabase/follows.ts"
  "src/lib/supabase/posts.ts"
  "src/lib/supabase/profile.ts"
  "src/lib/supabase/machines.ts"
  "src/lib/supabase/gyms.ts"
  "src/lib/supabase/auth.ts"
)

for file in "${FILES[@]}"; do
  echo "Fixing $file..."
  
  # Create a backup
  cp "$file" "$file.bak"
  
  # Replace the problematic lines
  sed -i '' '
    # Replace the direct initialization lines
    s/^const supabaseUrl = process\.env\.NEXT_PUBLIC_SUPABASE_URL!$/\/\/ Moved to getSupabaseClient function/
    s/^const supabaseAnonKey = process\.env\.NEXT_PUBLIC_SUPABASE_ANON_KEY!$/\/\/ Moved to getSupabaseClient function/
    s/^const supabase = createClient(supabaseUrl, supabaseAnonKey)$/\/\/ Create Supabase client in each function/
  ' "$file"
  
  # Add the getSupabaseClient function after imports if not exists
  if ! grep -q "function getSupabaseClient()" "$file"; then
    # Find the line after imports and add the function
    awk '
      /^import/ { imports = 1 }
      !imports && NR > 1 && !added {
        print ""
        print "// Get Supabase client with error handling"
        print "function getSupabaseClient() {"
        print "  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL"
        print "  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY"
        print "  "
        print "  if (!supabaseUrl || !supabaseAnonKey) {"
        print "    throw new Error(\"Supabase configuration is missing\")"
        print "  }"
        print "  "
        print "  return createClient(supabaseUrl, supabaseAnonKey)"
        print "}"
        added = 1
      }
      { print }
    ' "$file" > "$file.tmp" && mv "$file.tmp" "$file"
  fi
done

echo "Done! Now we need to update all function calls to use getSupabaseClient()"