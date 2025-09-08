#!/usr/bin/env node
// Minimal MCP server to browse Supabase tables via MCP tools
import fs from 'node:fs'
import path from 'node:path'
import dotenv from 'dotenv'
dotenv.config()
const localEnvPath = path.resolve(process.cwd(), '.env.local')
if (fs.existsSync(localEnvPath)) {
  dotenv.config({ path: localEnvPath, override: true })
}
import { createClient } from '@supabase/supabase-js'
import { Server } from '@modelcontextprotocol/sdk/server/index.js'
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js'

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
const SUPABASE_PROJECT_REF = process.env.SUPABASE_PROJECT_REF || process.env.SUPABASE_PROJECT_ID
const SUPABASE_ACCESS_TOKEN = process.env.SUPABASE_ACCESS_TOKEN

function ensureClient() {
  if (!SUPABASE_URL || !SUPABASE_KEY) {
    const missing = [
      SUPABASE_URL ? null : 'NEXT_PUBLIC_SUPABASE_URL',
      SUPABASE_KEY ? null : 'SUPABASE_SERVICE_ROLE_KEY or NEXT_PUBLIC_SUPABASE_ANON_KEY',
    ].filter(Boolean).join(', ')
    throw new Error(`Missing environment variables: ${missing}`)
  }
  return createClient(SUPABASE_URL, SUPABASE_KEY)
}

const server = new Server(
  { name: 'gymtopia-supabase-mcp', version: '0.1.0' },
  { capabilities: { tools: {} } }
)

server.tool(
  'list_tables',
  {
    description: 'List tables in a schema (default: public)',
    inputSchema: {
      type: 'object',
      properties: { schema: { type: 'string', default: 'public' } },
      additionalProperties: false,
    },
  },
  async (input) => {
    const supabase = ensureClient()
    const schema = input?.schema || 'public'

    // Prefer RPC if available
    try {
      const { data: rpcData, error: rpcErr } = await supabase
        .rpc('get_public_tables', schema === 'public' ? {} : { p_schema: schema })

      if (!rpcErr && rpcData) {
        const tables = rpcData.map((r) => r.table_name ?? r.tablename ?? r)
        return { content: [{ type: 'text', text: JSON.stringify({ schema, tables }, null, 2) }] }
      }
    } catch (_) {
      // ignore and fallback below
    }

    // Fallback: try information_schema (may be blocked by PostgREST)
    try {
      const { data, error } = await supabase
        .from('information_schema.tables')
        .select('table_name')
        .eq('table_schema', schema)

      if (!error && data) {
        const tables = data.map((r) => r.table_name)
        return { content: [{ type: 'text', text: JSON.stringify({ schema, tables }, null, 2) }] }
      }
    } catch (e) {
      // ignore and surface RPC instruction below
    }

    const sqlCreate = `
CREATE OR REPLACE FUNCTION public.get_public_tables()
RETURNS TABLE(table_name text)
LANGUAGE sql STABLE AS $$
  SELECT tablename
  FROM pg_catalog.pg_tables
  WHERE schemaname = 'public'
  ORDER BY 1
$$;
GRANT EXECUTE ON FUNCTION public.get_public_tables() TO anon, authenticated;`.trim()

    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: [
            `Could not list tables via PostgREST.`,
            `Define the RPC in Supabase SQL editor then retry:`,
            sqlCreate,
          ].join('\n'),
        },
      ],
    }
  }
)

server.tool(
  'get_table_schema',
  {
    description: 'Get columns/types for a table in public schema',
    inputSchema: {
      type: 'object',
      required: ['table'],
      properties: { table: { type: 'string' } },
      additionalProperties: false,
    },
  },
  async (input) => {
    const supabase = ensureClient()
    const table = input.table

    // Try RPC first
    try {
      const { data: rpcData, error: rpcErr } = await supabase
        .rpc('get_table_schema', { p_table: table })
      if (!rpcErr && rpcData) {
        return { content: [{ type: 'text', text: JSON.stringify(rpcData, null, 2) }] }
      }
    } catch (_) {}

    // Fallback: information_schema.columns (may be blocked)
    try {
      const { data, error } = await supabase
        .from('information_schema.columns')
        .select('column_name,data_type,is_nullable')
        .eq('table_schema', 'public')
        .eq('table_name', table)
        .order('ordinal_position', { ascending: true })
      if (!error && data) {
        return { content: [{ type: 'text', text: JSON.stringify(data, null, 2) }] }
      }
    } catch (e) {}

    const sql = `
CREATE OR REPLACE FUNCTION public.get_table_schema(p_table text)
RETURNS TABLE(column_name text, data_type text, is_nullable text)
LANGUAGE sql STABLE AS $$
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = p_table
  ORDER BY ordinal_position
$$;
GRANT EXECUTE ON FUNCTION public.get_table_schema(text) TO anon, authenticated;`.trim()

    return {
      isError: true,
      content: [
        {
          type: 'text',
          text: `Could not fetch schema for ${table}. Create this RPC then retry:\n${sql}`,
        },
      ],
    }
  }
)

async function runSql(sql) {
  if (!SUPABASE_PROJECT_REF || !SUPABASE_ACCESS_TOKEN) {
    const missing = [
      SUPABASE_PROJECT_REF ? null : 'SUPABASE_PROJECT_REF',
      SUPABASE_ACCESS_TOKEN ? null : 'SUPABASE_ACCESS_TOKEN',
    ].filter(Boolean).join(', ')
    throw new Error(`Missing env for SQL API: ${missing}`)
  }
  const endpoint = `https://api.supabase.com/v1/projects/${SUPABASE_PROJECT_REF}/sql`
  const res = await fetch(endpoint, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${SUPABASE_ACCESS_TOKEN}`,
      'apikey': SUPABASE_ACCESS_TOKEN,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({ query: sql }),
  })
  if (!res.ok) {
    const text = await res.text()
    throw new Error(`SQL API error ${res.status}: ${text}`)
  }
  const data = await res.json().catch(() => ({}))
  return data
}

server.tool(
  'apply_sql',
  {
    description: 'Execute raw SQL via Supabase SQL API. Requires SUPABASE_PROJECT_REF and SUPABASE_ACCESS_TOKEN.',
    inputSchema: {
      type: 'object',
      required: ['sql'],
      properties: {
        sql: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  async (input) => {
    const result = await runSql(input.sql)
    return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] }
  }
)

server.tool(
  'apply_sql_file',
  {
    description: 'Execute a local .sql file via Supabase SQL API',
    inputSchema: {
      type: 'object',
      required: ['path'],
      properties: {
        path: { type: 'string' },
      },
      additionalProperties: false,
    },
  },
  async (input) => {
    const filePath = path.resolve(process.cwd(), input.path)
    if (!fs.existsSync(filePath)) {
      return { isError: true, content: [{ type: 'text', text: `File not found: ${filePath}` }] }
    }
    const sql = fs.readFileSync(filePath, 'utf8')
    const result = await runSql(sql)
    return { content: [{ type: 'text', text: JSON.stringify({ file: input.path, result }, null, 2) }] }
  }
)

server.tool(
  'ping',
  {
    description: 'Health check',
    inputSchema: { type: 'object', properties: {} },
  },
  async () => ({ content: [{ type: 'text', text: 'ok' }] })
)

await server.connect(new StdioServerTransport())
