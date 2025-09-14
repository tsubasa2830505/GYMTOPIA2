-- =============================================
-- Migration: Add JSONB facilities to gyms
-- Applies to minimal and extended schemas
-- =============================================

-- Add facilities JSONB column if not present
ALTER TABLE public.gyms
ADD COLUMN IF NOT EXISTS facilities JSONB DEFAULT '{}'::jsonb;

-- Optional: ensure default is an object
UPDATE public.gyms SET facilities = '{}'::jsonb WHERE facilities IS NULL;

-- Index for JSONB containment queries
CREATE INDEX IF NOT EXISTS idx_gyms_facilities_gin ON public.gyms USING GIN (facilities);

