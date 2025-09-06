#!/usr/bin/env node
// Make a specific user become "筋トレマニア太郎" (test user) safely via Service Role
// Usage:
//   SUPABASE_URL=... SUPABASE_SERVICE_ROLE_KEY=... \
//   TARGET_EMAIL=tsubasa.a.283.0505@gmail.com \
//   node scripts/make-me-muscle-taro.js

const { createClient } = require('@supabase/supabase-js')

async function main() {
  const url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  const targetEmail = process.env.TARGET_EMAIL || 'tsubasa.a.283.0505@gmail.com'

  if (!url || !serviceKey) {
    console.error('Missing env. Required: SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY')
    process.exit(1)
  }

  const supabase = createClient(url, serviceKey)

  console.log(`🔎 Finding user by email: ${targetEmail}`)
  // Supabase Admin API does not have direct get-by-email; list and filter
  const { data: list, error: listErr } = await supabase.auth.admin.listUsers({ page: 1, perPage: 1000 })
  if (listErr) {
    console.error('Failed to list users:', listErr.message)
    process.exit(1)
  }
  const user = list.users.find(u => (u.email || '').toLowerCase() === targetEmail.toLowerCase())
  if (!user) {
    console.error(`User not found in auth.users: ${targetEmail}`)
    process.exit(1)
  }
  console.log(`✅ Found user: id=${user.id}`)

  // Upsert into profiles
  console.log('🛠  Upserting profiles...')
  const { error: upErr } = await supabase
    .from('profiles')
    .upsert({
      id: user.id,
      username: 'muscle_taro',
      display_name: '筋トレマニア太郎',
      bio: 'テストユーザー（本人アカウント）。自動設定スクリプトにより更新。'
    }, { onConflict: 'id' })
  if (upErr) {
    console.warn('⚠️  profiles upsert failed (continuing):', upErr.message)
  } else {
    console.log('✅ profiles upsert complete')
  }

  // Try to update optional public.users table if it exists
  console.log('🛠  Updating users (optional)...')
  const { error: usersErr } = await supabase
    .from('users')
    .upsert({ id: user.id, username: 'muscle_taro', display_name: '筋トレマニア太郎' }, { onConflict: 'id' })
  if (usersErr) {
    console.warn('ℹ️  users table not updated (may not exist):', usersErr.message)
  } else {
    console.log('✅ users upsert complete')
  }

  console.log('🎉 Done. This account is now set as 筋トレマニア太郎.')
}

main().catch(err => {
  console.error('Unexpected error:', err)
  process.exit(1)
})

