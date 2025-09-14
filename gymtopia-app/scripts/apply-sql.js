#!/usr/bin/env node
/**
 * Apply a SQL file to Supabase Postgres using a direct connection.
 * Env:
 *   SUPABASE_DB_URL (preferred)  e.g. postgres://USER:PASSWORD@HOST:PORT/dbname
 *   or SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (will try pgpass via pool config)
 */

const fs = require('fs')
const path = require('path')
const { Client } = require('pg')

// Resolve SQL path
const sqlArg = process.argv[2]
if (!sqlArg) {
  console.error('Usage: node scripts/apply-sql.js <path-to-sql>')
  process.exit(1)
}

const sqlPath = path.resolve(process.cwd(), sqlArg)
if (!fs.existsSync(sqlPath)) {
  console.error(`SQL file not found: ${sqlPath}`)
  process.exit(1)
}

const sql = fs.readFileSync(sqlPath, 'utf8')

// Connection preference: SUPABASE_DB_URL
const dbUrl = process.env.SUPABASE_DB_URL
let client

async function main() {
  if (!dbUrl) {
    console.error('Missing SUPABASE_DB_URL. Provide a Postgres connection string to apply SQL safely.')
    process.exit(1)
  }

  client = new Client({ connectionString: dbUrl, ssl: { rejectUnauthorized: false } })
  await client.connect()

  // Split statements on semicolon at line end (naive but works for our views)
  const statements = sql
    .split(/;\s*\n/)
    .map(s => s.trim())
    .filter(Boolean)

  let ok = 0
  let fail = 0
  for (const stmt of statements) {
    try {
      await client.query(stmt)
      ok++
    } catch (err) {
      // Idempotency: ignore "already exists" when possible
      const msg = String(err.message || '')
      if (/already exists|duplicate object|duplicate key/i.test(msg)) {
        fail++ // count but continue
        console.warn(`WARN: ${msg}`)
        continue
      }
      console.error(`ERROR applying statement: ${msg}`)
      fail++
    }
  }

  await client.end()
  console.log(`Done. Success: ${ok}, Warnings/Failures: ${fail}`)
}

main().catch(async (e) => {
  console.error(e)
  try { await client?.end() } catch {}
  process.exit(1)
})

