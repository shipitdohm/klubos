CREATE SCHEMA IF NOT EXISTS private;
REVOKE ALL ON SCHEMA private FROM PUBLIC;
GRANT USAGE ON SCHEMA private TO authenticated, service_role;

CREATE OR REPLACE FUNCTION private.current_org_id()
RETURNS uuid
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT organization_id FROM public.profiles WHERE id = auth.uid();
$$;

REVOKE ALL ON FUNCTION private.current_org_id() FROM PUBLIC;
GRANT EXECUTE ON FUNCTION private.current_org_id() TO authenticated, service_role;

ALTER POLICY "Own ai threads" ON public.ai_threads
  USING (user_id = auth.uid())
  WITH CHECK ((user_id = auth.uid()) AND (organization_id = private.current_org_id()));
ALTER POLICY "Org bookings access" ON public.bookings
  USING (organization_id = private.current_org_id())
  WITH CHECK (organization_id = private.current_org_id());
ALTER POLICY "Org events access" ON public.events
  USING (organization_id = private.current_org_id())
  WITH CHECK (organization_id = private.current_org_id());
ALTER POLICY "Org finances access" ON public.finances
  USING (organization_id = private.current_org_id())
  WITH CHECK (organization_id = private.current_org_id());
ALTER POLICY "Org members access" ON public.members
  USING (organization_id = private.current_org_id())
  WITH CHECK (organization_id = private.current_org_id());
ALTER POLICY "Create org when none" ON public.organizations
  WITH CHECK (private.current_org_id() IS NULL);
ALTER POLICY "Update own org" ON public.organizations
  USING (id = private.current_org_id());
ALTER POLICY "View own organization" ON public.organizations
  USING (id = private.current_org_id());
ALTER POLICY "View own profile" ON public.profiles
  USING ((id = auth.uid()) OR (organization_id = private.current_org_id()));
ALTER POLICY "Org sponsors access" ON public.sponsors
  USING (organization_id = private.current_org_id())
  WITH CHECK (organization_id = private.current_org_id());

DROP FUNCTION public.current_org_id();