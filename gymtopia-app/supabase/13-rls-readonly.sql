-- =====================================================
-- Harden read-only tables with RLS (public SELECT)
-- Idempotent: checks existing policies
-- Tables: gyms, machines, machine_makers, gym_machines, muscle_groups
-- =====================================================

DO $$ BEGIN
  -- Helper to enable RLS if table exists
  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='gyms';
  IF FOUND THEN
    EXECUTE 'ALTER TABLE public.gyms ENABLE ROW LEVEL SECURITY';
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gyms' AND policyname='gyms_select_all'
    ) THEN
      EXECUTE 'CREATE POLICY gyms_select_all ON public.gyms FOR SELECT USING (true)';
    END IF;
  END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='machines';
  IF FOUND THEN
    EXECUTE 'ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY';
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='machines' AND policyname='machines_select_all'
    ) THEN
      EXECUTE 'CREATE POLICY machines_select_all ON public.machines FOR SELECT USING (true)';
    END IF;
  END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='machine_makers';
  IF FOUND THEN
    EXECUTE 'ALTER TABLE public.machine_makers ENABLE ROW LEVEL SECURITY';
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='machine_makers' AND policyname='machine_makers_select_all'
    ) THEN
      EXECUTE 'CREATE POLICY machine_makers_select_all ON public.machine_makers FOR SELECT USING (true)';
    END IF;
  END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='gym_machines';
  IF FOUND THEN
    EXECUTE 'ALTER TABLE public.gym_machines ENABLE ROW LEVEL SECURITY';
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='gym_machines' AND policyname='gym_machines_select_all'
    ) THEN
      EXECUTE 'CREATE POLICY gym_machines_select_all ON public.gym_machines FOR SELECT USING (true)';
    END IF;
  END IF;

  PERFORM 1 FROM information_schema.tables WHERE table_schema='public' AND table_name='muscle_groups';
  IF FOUND THEN
    EXECUTE 'ALTER TABLE public.muscle_groups ENABLE ROW LEVEL SECURITY';
    IF NOT EXISTS (
      SELECT 1 FROM pg_policies WHERE schemaname='public' AND tablename='muscle_groups' AND policyname='muscle_groups_select_all'
    ) THEN
      EXECUTE 'CREATE POLICY muscle_groups_select_all ON public.muscle_groups FOR SELECT USING (true)';
    END IF;
  END IF;
END $$;

