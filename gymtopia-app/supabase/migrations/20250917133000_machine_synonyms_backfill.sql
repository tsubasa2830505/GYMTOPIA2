-- Machine name synonyms table to aid normalization and FK validation
CREATE TABLE IF NOT EXISTS public.machine_name_synonyms (
  synonym TEXT PRIMARY KEY,
  machine_id TEXT NOT NULL REFERENCES public.machines(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Functional index to accelerate normalized matching
CREATE INDEX IF NOT EXISTS idx_machine_name_synonyms_norm
ON public.machine_name_synonyms (lower(regexp_replace(synonym, '\\s+', '', 'g')));

-- Backfill gym_machines.machine_id using synonyms (non-destructive)
UPDATE public.gym_machines gm
SET machine_id = s.machine_id
FROM public.machine_name_synonyms s
WHERE gm.machine_id IS NULL
  AND lower(regexp_replace(gm.name, '\\s+', '', 'g')) = lower(regexp_replace(s.synonym, '\\s+', '', 'g'));

-- Try FK validation again
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.gym_machines VALIDATE CONSTRAINT fk_gym_machines_machine;
  EXCEPTION WHEN others THEN
    NULL;
  END;
END $$;

