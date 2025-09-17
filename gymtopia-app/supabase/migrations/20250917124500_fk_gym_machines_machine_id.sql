-- Add FK from gym_machines.machine_id -> machines(id) safely
DO $$
BEGIN
  -- Ensure column exists (added in previous migration)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema='public' AND table_name='gym_machines' AND column_name='machine_id'
  ) THEN
    EXECUTE 'ALTER TABLE public.gym_machines ADD COLUMN machine_id text';
  END IF;

  -- Add constraint NOT VALID first, then validate (safer on large tables)
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.table_constraints
    WHERE table_schema='public' AND table_name='gym_machines' AND constraint_name='fk_gym_machines_machine'
  ) THEN
    EXECUTE 'ALTER TABLE public.gym_machines
             ADD CONSTRAINT fk_gym_machines_machine
             FOREIGN KEY (machine_id) REFERENCES public.machines(id)
             ON DELETE CASCADE NOT VALID';
  END IF;

  -- Try to validate; if it fails, keep NOT VALID to allow further backfill
  BEGIN
    EXECUTE 'ALTER TABLE public.gym_machines VALIDATE CONSTRAINT fk_gym_machines_machine';
  EXCEPTION WHEN others THEN
    -- Leave as NOT VALID (compat mode)
    NULL;
  END;
END $$;
