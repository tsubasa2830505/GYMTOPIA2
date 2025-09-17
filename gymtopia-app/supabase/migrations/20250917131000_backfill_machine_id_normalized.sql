-- Normalize name matching by stripping whitespace for better backfill
UPDATE public.gym_machines gm
SET machine_id = m.id::text
FROM public.machines m
WHERE gm.machine_id IS NULL
  AND lower(regexp_replace(gm.name, '\\s+', '', 'g')) = lower(regexp_replace(m.name, '\\s+', '', 'g'));
