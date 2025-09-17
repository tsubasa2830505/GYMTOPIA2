#!/usr/bin/env node
/**
 * DB usage audit: cross-reference app code column usage vs. declared DB types.
 * - Scans gymtopia-app/src for supabase query patterns to collect used tables/columns
 * - Parses gymtopia-app/src/types/database.ts to collect declared columns per table
 * - Emits JSON and human-readable summaries of potentially unused columns/tables
 */
const fs = require('fs');
const path = require('path');

const REPO_ROOT = path.resolve(__dirname, '..');
const SRC_DIR = path.join(REPO_ROOT, 'gymtopia-app', 'src');
const TYPES_FILE = path.join(SRC_DIR, 'types', 'database.ts');

function walk(dir, acc = []) {
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const e of entries) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) walk(p, acc);
    else if (/\.(ts|tsx|js|mjs|cjs)$/.test(e.name)) acc.push(p);
  }
  return acc;
}

function stripComments(code) {
  return code
    .replace(/\/\*[\s\S]*?\*\//g, '') // block comments
    .replace(/([^:])\/\/.*$/gm, '$1'); // line comments (avoid URLs like http://)
}

function parseUsedColumns(files) {
  const tableUsage = {}; // { table: Set(columns) }

  for (const file of files) {
    const raw = fs.readFileSync(file, 'utf8');
    const code = stripComments(raw);

    // Find all occurrences of supabase.from('table')
    const fromRegex = /\bsupabase\s*\.\s*from\(\s*['\"]([a-zA-Z0-9_]+)['\"]\s*\)/g;
    let m;
    while ((m = fromRegex.exec(code))) {
      const table = m[1];
      if (!tableUsage[table]) tableUsage[table] = new Set();

      // Look ahead within a limited window for .select('..'), filters, order, etc.
      const windowStart = m.index;
      const windowEnd = Math.min(code.length, windowStart + 2000); // 2k chars lookahead
      const windowCode = code.slice(windowStart, windowEnd);

      // .select('a,b,c') or template backticks
      const selectRegex = /\.select\(\s*([`'\"])\s*([\s\S]*?)\1\s*\)/g;
      let s;
      while ((s = selectRegex.exec(windowCode))) {
        const body = s[2];
        // Split by commas; capture only simple identifier tokens
        body.split(',').forEach((seg) => {
          let col = seg.trim();
          if (!col) return;
          // Drop join fragments, nested selects, aliases
          if (/[()!]/.test(col)) return;
          if (/\s/.test(col)) return; // spaces indicate complex expr
          if (col === '*') return;
          if (!/^[a-zA-Z_][a-zA-Z0-9_]*$/.test(col)) return;
          tableUsage[table].add(col);
        });
      }

      // Filters/order columns e.g., .eq('col',...), .gte('col',...), .order('col', ...)
      const filterRegex = /\.(eq|neq|lt|lte|gt|gte|like|ilike|is|contains|containedBy|order)\(\s*['\"]([a-zA-Z_][a-zA-Z0-9_]*)['\"]/g;
      let f;
      while ((f = filterRegex.exec(windowCode))) {
        tableUsage[table].add(f[2]);
      }
    }
  }

  // Convert sets to arrays
  const used = {};
  for (const [t, set] of Object.entries(tableUsage)) used[t] = Array.from(set).sort();
  return used;
}

function parseDeclaredTypes(typesFile) {
  const raw = fs.readFileSync(typesFile, 'utf8');
  const code = stripComments(raw);

  // Map interface name -> fields
  const ifaceRegex = /export\s+interface\s+(\w+)\s*\{([\s\S]*?)\}/g;
  const ifaces = {};
  let m;
  while ((m = ifaceRegex.exec(code))) {
    const name = m[1];
    const body = m[2];
    const fields = [];
    const fieldRegex = /\s*(\w+)\??:\s*[^;]+;/g;
    let f;
    while ((f = fieldRegex.exec(body))) fields.push(f[1]);
    ifaces[name] = fields;
  }

  // Extract table mapping: export type DatabaseTables = { users: DatabaseUser; ... }
  const mapMatch = code.match(/export\s+type\s+DatabaseTables\s*=\s*\{([\s\S]*?)\}\s*;/);
  const tableMap = {};
  if (mapMatch) {
    const lines = mapMatch[1].split(/\n|,/).map((l) => l.trim()).filter(Boolean);
    for (const line of lines) {
      const m2 = line.match(/^(\w+)\s*:\s*(\w+)/);
      if (m2) tableMap[m2[1]] = m2[2];
    }
  }

  // Build declared columns per table using interface fields
  const declared = {};
  for (const [table, iface] of Object.entries(tableMap)) {
    declared[table] = (ifaces[iface] || []).slice().sort();
  }
  return { ifaces, tableMap, declared };
}

function main() {
  const files = walk(SRC_DIR);
  const used = parseUsedColumns(files);
  const { declared } = parseDeclaredTypes(TYPES_FILE);

  // Summaries
  const allTables = Array.from(new Set([...Object.keys(used), ...Object.keys(declared)])).sort();
  const report = {};
  const summary = { tablesReferenced: Object.keys(used).length, tablesDeclared: Object.keys(declared).length, tablesOnlyDeclared: [], tablesOnlyReferenced: [] };

  for (const table of allTables) {
    const usedCols = new Set(used[table] || []);
    const declCols = new Set(declared[table] || []);
    const unused = [...declCols].filter((c) => !usedCols.has(c)).sort();
    const missingInTypes = [...usedCols].filter((c) => !declCols.has(c)).sort();

    report[table] = {
      used: [...usedCols].sort(),
      declared: [...declCols].sort(),
      unusedDeclaredColumns: unused,
      usedButUndeclaredColumns: missingInTypes,
    };

    if (!used[table] && declared[table]) summary.tablesOnlyDeclared.push(table);
    if (used[table] && !declared[table]) summary.tablesOnlyReferenced.push(table);
  }

  // Print human readable
  console.log('=== DB Usage Audit (static analysis) ===');
  console.log(`Scanned source: ${SRC_DIR}`);
  console.log(`Types file: ${TYPES_FILE}`);
  console.log(`Tables referenced in code: ${Object.keys(used).length}`);
  console.log(`Tables declared in types: ${Object.keys(declared).length}`);
  console.log('');

  for (const table of allTables) {
    const r = report[table];
    const status = (!r.used.length && r.declared.length) ? 'DECLARED_ONLY' : (r.used.length && !r.declared.length) ? 'REFERENCED_ONLY' : 'OK';
    console.log(`- ${table} [${status}]`);
    if (r.used.length) console.log(`  • Used cols (${r.used.length}): ${r.used.join(', ')}`);
    if (r.declared.length) console.log(`  • Declared cols (${r.declared.length}): ${r.declared.join(', ')}`);
    if (r.unusedDeclaredColumns.length) console.log(`  • Unused declared: ${r.unusedDeclaredColumns.join(', ')}`);
    if (r.usedButUndeclaredColumns.length) console.log(`  • Used but undeclared: ${r.usedButUndeclaredColumns.join(', ')}`);
  }

  // Also emit JSON for tooling
  const out = { summary, report };
  const outPath = path.join(REPO_ROOT, 'db-usage-audit.json');
  fs.writeFileSync(outPath, JSON.stringify(out, null, 2));
  console.log(`\nWrote machine-readable report: ${outPath}`);
}

main();
