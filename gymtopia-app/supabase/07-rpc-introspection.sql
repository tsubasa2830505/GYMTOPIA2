-- =====================================================
-- RPCs for MCP-based introspection from Supabase
-- =====================================================

-- List public tables
CREATE OR REPLACE FUNCTION public.get_public_tables()
RETURNS TABLE(table_name text)
LANGUAGE sql STABLE AS $$
  SELECT tablename
  FROM pg_catalog.pg_tables
  WHERE schemaname = 'public'
  ORDER BY 1
$$;

-- Get column schema for a public table
CREATE OR REPLACE FUNCTION public.get_table_schema(p_table text)
RETURNS TABLE(column_name text, data_type text, is_nullable text)
LANGUAGE sql STABLE AS $$
  SELECT column_name, data_type, is_nullable
  FROM information_schema.columns
  WHERE table_schema = 'public' AND table_name = p_table
  ORDER BY ordinal_position
$$;

GRANT EXECUTE ON FUNCTION public.get_public_tables() TO anon, authenticated;
GRANT EXECUTE ON FUNCTION public.get_table_schema(text) TO anon, authenticated;

-- Usage:
-- SELECT * FROM public.get_public_tables();
-- SELECT * FROM public.get_table_schema('gyms');

