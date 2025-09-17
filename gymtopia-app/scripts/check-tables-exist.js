#!/usr/bin/env node
/**
 * Check existence of specific tables/views on the configured Supabase project
 * using the anon key (HEAD count query). Outputs JSON with status per table.
 */
const { createClient } = require('@supabase/supabase-js')
const fs = require('fs')
const path = require('path')

// Load env from .env.local if present
const envLocalPath = path.join(__dirname, '..', '.env.local')
if (fs.existsSync(envLocalPath)) {
  require('dotenv').config({ path: envLocalPath })
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anon) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL or NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const supabase = createClient(url, anon)

// Candidate tables that might be unnecessary (from code/schema diff)
const candidates = [
  'muscle_parts',
  'workout_sets',
  'profiles',
  'gym_posts_partitioned',
  'machine_makers', // keep if machines table is in use
  'facility_types', // keep if gym_facilities is in use
  // legacy names that should have been renamed
  'posts',
  'likes',
  'comments'
]

// Tables/views referenced by the app code (src/) via supabase.from(...)
const appUsed = [
  'achievements','equipment','facility_categories','favorite_gyms','follows','freeweight_categories',
  'gym_checkins','gym_detailed_info','gym_equipment','gym_facilities','gym_free_weights','gym_freeweights',
  'gym_friends','gym_likes','gym_machines','gym_notes','gym_owner_applications','gym_owners','gym_posts',
  'gym_review_replies','gym_reviews','gyms','machine_categories','machines','muscle_groups','muscles',
  'notifications','personal_records','post_comments','post_likes','user_profiles','users',
  'workout_exercises','workout_sessions'
]

// Extra referenced-only-in-joins tables/views
const extras = [
  'facility_items', 'freeweight_items', 'equipment_categories'
]

async function headExists(table) {
  try {
    const { error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: true })
    if (!error) return { exists: true, accessible: true }
    // PostgREST 404 -> not found; RLS/permission -> exists but not accessible
    const msg = String(error.message || '')
    const code = error.code || ''
    // Heuristic: PGRST116/PGRST202/PGRST205/42P01 or generic not found patterns
    const notFound = /PGRST11|PGRST20|PGRST205|42P01|does not exist|unknown relation|not\s+found/i.test(msg)
    if (notFound) return { exists: false, accessible: false, error: msg, code }
    return { exists: true, accessible: false, error: msg, code }
  } catch (e) {
    return { exists: false, accessible: false, error: String(e && e.message || e) }
  }
}

async function getCount(table) {
  try {
    const { count, error } = await supabase
      .from(table)
      .select('*', { count: 'exact', head: false })
      .range(0, 0)
    if (error) return { ok: false, error: String(error.message || error) }
    return { ok: true, count: count ?? null }
  } catch (e) {
    return { ok: false, error: String(e && e.message || e) }
  }
}

async function main() {
  const result = { candidates: {}, appUsed: {}, extras: {}, legacyTargets: {} }
  for (const t of candidates) {
     
    const exists = await headExists(t)
    if (exists.exists) {
       
      const cnt = await getCount(t)
      result.candidates[t] = { ...exists, rows: cnt.ok ? cnt.count : null }
    } else {
      result.candidates[t] = exists
    }
  }
  for (const t of appUsed) {
     
    result.appUsed[t] = await headExists(t)
  }
  for (const t of extras) {
     
    result.extras[t] = await headExists(t)
  }
  for (const t of ['posts_legacy','likes_legacy','comments_legacy','muscle_parts_legacy','workout_sets_legacy','gym_posts_partitioned_legacy','profiles_legacy']) {
     
    result.legacyTargets[t] = await headExists(t)
  }
  console.log(JSON.stringify(result, null, 2))
}

main().catch((e) => { console.error(e); process.exit(1) })
