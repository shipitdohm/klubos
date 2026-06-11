ALTER TABLE public.organizations
  ADD COLUMN IF NOT EXISTS logo_url text,
  ADD COLUMN IF NOT EXISTS tennis_de_url text,
  ADD COLUMN IF NOT EXISTS eversports_url text,
  ADD COLUMN IF NOT EXISTS members_synced_at timestamptz;

ALTER TABLE public.members
  ADD COLUMN IF NOT EXISTS nuliga_id text,
  ADD COLUMN IF NOT EXISTS lk_rating text,
  ADD COLUMN IF NOT EXISTS birth_year integer;

CREATE TABLE IF NOT EXISTS public.teams (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  organization_id uuid NOT NULL REFERENCES public.organizations(id) ON DELETE CASCADE,
  name text NOT NULL,
  league text,
  season text,
  age_group text,
  association text,
  captain text,
  training_time text,
  external_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

GRANT SELECT, INSERT, UPDATE, DELETE ON public.teams TO authenticated;
GRANT ALL ON public.teams TO service_role;

ALTER TABLE public.teams ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Org teams access" ON public.teams
  FOR ALL TO authenticated
  USING (organization_id = private.current_org_id())
  WITH CHECK (organization_id = private.current_org_id());

CREATE OR REPLACE FUNCTION public.touch_updated_at()
RETURNS trigger
LANGUAGE plpgsql
AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS teams_touch_updated_at ON public.teams;
CREATE TRIGGER teams_touch_updated_at
BEFORE UPDATE ON public.teams
FOR EACH ROW EXECUTE FUNCTION public.touch_updated_at();