#!/usr/bin/env node
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
import openapiTS from 'openapi-typescript'
import s2o from 'swagger2openapi'

// load envs
dotenv.config()
const local = path.join(process.cwd(), '.env.local')
if (fs.existsSync(local)) dotenv.config({ path: local, override: true })

const url = process.env.NEXT_PUBLIC_SUPABASE_URL
const key = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

if (!url || !key) {
  console.error('Missing NEXT_PUBLIC_SUPABASE_URL / NEXT_PUBLIC_SUPABASE_ANON_KEY')
  process.exit(1)
}

const openapiUrl = `${url}/rest/v1/` // PostgREST exposes OpenAPI at root

async function fetchOpenAPI() {
  const res = await fetch(openapiUrl, {
    headers: {
      apikey: key,
      Authorization: `Bearer ${key}`,
      // Request swagger 2.0 (will convert to OAS3 locally)
      Accept: 'application/openapi+json'
    }
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`OpenAPI fetch failed: ${res.status} ${res.statusText}\n${text}`)
  }
  return res.json()
}

async function main() {
  const schema = await fetchOpenAPI()
  const oas = schema.swagger ? (await s2o.convertObj(schema, { patch: true, warnOnly: true })).openapi : schema
  const output = await openapiTS(oas, {
    alphabetize: true,
    transform(schemaObject, metadata) {
      return schemaObject
    }
  })
  const outPath = path.join(process.cwd(), 'src/types/supabase.ts')
  fs.mkdirSync(path.dirname(outPath), { recursive: true })
  fs.writeFileSync(outPath, output)
  console.log('Generated:', outPath)
}

main().catch((e) => { console.error(e); process.exit(1) })
