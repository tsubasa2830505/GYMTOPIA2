#!/usr/bin/env node
/*
 Runtime DB Audit (non-destructive)
 - Uses Supabase to probe per-table/column non-null presence with minimal queries.
 - Prefers service role key for full visibility; falls back to anon.
 - Input: db-usage-audit.json (from static analysis) for target tables/columns.
 - Output: runtime-db-audit.json (presence report) + console summary.
*/
const fs = require('fs');
const path = require('path');
const { createClient } = require('@supabase/supabase-js');

const REPO = path.resolve(__dirname, '..');
const APP = path.join(REPO, 'gymtopia-app');

function loadEnv() {
  // Try process.env first
  let url = process.env.SUPABASE_URL || process.env.NEXT_PUBLIC_SUPABASE_URL || '';
  let key = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || '';

  // Fallback to .env.local in app
  try {
    const envPath = path.join(APP, '.env.local');
    if (fs.existsSync(envPath)) {
      const lines = fs.readFileSync(envPath, 'utf8').split(/\r?\n/);
      for (const line of lines) {
        const m = line.match(/^([A-Z0-9_]+)=(.*)$/);
        if (!m) continue;
        const k = m[1];
        const v = m[2];
        if (!url && (k === 'SUPABASE_URL' || k === 'NEXT_PUBLIC_SUPABASE_URL')) url = v;
        if (!key && (k === 'SUPABASE_SERVICE_ROLE_KEY' || k === 'NEXT_PUBLIC_SUPABASE_ANON_KEY')) key = v;
      }
    }
  } catch {}
  return { url, key };
}

async function probeColumn(supabase, table, column) {
  try {
    // Check if any non-null row exists for this column
    const { data, error } = await supabase
      .from(table)
      .select(column)
      .not(column, 'is', null)
      .limit(1);
    if (error) return { ok: false, reason: String(error.message || error) };
    return { ok: true, hasNonNull: Array.isArray(data) && data.length > 0 };
  } catch (e) {
    return { ok: false, reason: String(e && e.message || e) };
  }
}

async function main() {
  const usagePath = path.join(REPO, 'db-usage-audit.json');
  if (!fs.existsSync(usagePath)) {
    console.error('Missing db-usage-audit.json. Run: node scripts/audit-db-usage.js');
    process.exit(1);
  }
  const usage = JSON.parse(fs.readFileSync(usagePath, 'utf8'));
  const { report } = usage;

  const { url, key } = loadEnv();
  if (!url || !key) {
    console.error('Missing Supabase URL or Key. Set env vars or gymtopia-app/.env.local');
    process.exit(1);
  }
  const supabase = createClient(url, key);

  const out = { url, auth: key === process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ? 'anon' : 'service_or_custom', checkedAt: new Date().toISOString(), columns: {} };

  for (const [table, info] of Object.entries(report)) {
    const cols = Array.from(new Set([...(info.used || []), ...(info.declared || [])])).sort();
    out.columns[table] = {};
    for (const col of cols) {
      // Skip wildcard or suspicious names
      if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col)) continue;
      /* eslint-disable no-await-in-loop */
      const res = await probeColumn(supabase, table, col);
      out.columns[table][col] = res;
    }
  }

  const outPath = path.join(REPO, 'runtime-db-audit.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));

  // Summary
  let total = 0, nonNull = 0, errors = 0;
  for (const t of Object.values(out.columns)) {
    for (const c of Object.values(t)) {
      total++;
      if (c.ok && c.hasNonNull) nonNull++;
      if (!c.ok) errors++;
    }
  }
  console.log(`Runtime audit complete. Columns checked: ${total}, with data: ${nonNull}, errors: ${errors}`);
  console.log(`Wrote ${outPath}`);
}

main().catch((e) => { console.error(e); process.exit(1); });

