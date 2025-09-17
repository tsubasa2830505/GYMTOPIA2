-- Attempt to validate FK after additional backfill
DO $$
BEGIN
  BEGIN
    ALTER TABLE public.gym_machines VALIDATE CONSTRAINT fk_gym_machines_machine;
  EXCEPTION WHEN others THEN
    NULL;
  END;
END $$;
