#!/usr/bin/env node
// Apply local SQL files to Supabase via Management SQL API
// Requires: SUPABASE_ACCESS_TOKEN and SUPABASE_PROJECT_REF
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'

// Load env from repo root and app folder
dotenv.config()
const envLocal = path.join(process.cwd(), '.env.local')
if (fs.existsSync(envLocal)) dotenv.config({ path: envLocal, override: true })
const appEnvLocal = path.join(process.cwd(), 'gymtopia-app/.env.local')
if (fs.existsSync(appEnvLocal)) dotenv.config({ path: appEnvLocal, override: true })

function getProjectRef() {
  const fromEnv = process.env.SUPABASE_PROJECT_REF || process.env.SUPABASE_PROJECT_ID
  if (fromEnv) return fromEnv
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
  try {
    const ref = new URL(url).hostname.split('.')[0]
    return ref || ''
  } catch {
    return ''
  }
}

async function applySql(sql) {
  const ref = getProjectRef()
  const token = process.env.SUPABASE_ACCESS_TOKEN
  if (!ref || !token) {
    console.error('Missing env. Need both SUPABASE_PROJECT_REF and SUPABASE_ACCESS_TOKEN')
    console.error('Current:', { ref, token: token ? 'set' : 'missing' })
    process.exit(1)
  }
  const endpoint = `https://api.supabase.com/v1/projects/${ref}/database/query`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${token}`,
      apikey: token,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql })
  })
  const text = await res.text()
  if (!res.ok) {
    console.error('SQL API Error', res.status, res.statusText)
    console.error(text)
    process.exit(1)
  }
  try {
    const json = JSON.parse(text)
    console.log('OK:', JSON.stringify(json, null, 2))
  } catch {
    console.log('OK (text):', text)
  }
}

async function main() {
  const args = process.argv.slice(2)
  const files = args.length > 0 ? args : [
    'supabase/08-unified-schema.sql',
    'supabase/09-align-schema-with-app.sql'
  ]
  for (const f of files) {
    const p = path.join(process.cwd(), 'gymtopia-app', f)
    if (!fs.existsSync(p)) {
      console.error('File not found:', p)
      process.exit(1)
    }
    console.log('Applying:', f)
    const sql = fs.readFileSync(p, 'utf8')
    await applySql(sql)
  }
}

main().catch((e) => { console.error(e); process.exit(1) })
