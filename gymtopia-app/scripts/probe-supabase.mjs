#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import 'dotenv/config'
import dotenv from 'dotenv'

// Try to load .env.local if present (Next.js style)
const envLocal = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envLocal)) {
  dotenv.config({ path: envLocal, override: true })
}

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const anon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !anon) {
  console.error('Missing env: NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

async function head(path) {
  const res = await fetch(`${url}/rest/v1/${path}`, {
    headers: {
      apikey: anon,
      Authorization: `Bearer ${anon}`,
      Prefer: 'count=exact'
    }
  })
  return res
}

async function main() {
  console.log('🔎 Probing Supabase REST...')
  try {
    const r = await head('gyms?select=id&limit=1')
    console.log('GET /rest/v1/gyms →', r.status, r.statusText)
    if (!r.ok) {
      const text = await r.text()
      console.log('Body:', text.slice(0, 200))
    }
  } catch (e) {
    console.error('Failed to query gyms:', e.message)
  }
}

main()
