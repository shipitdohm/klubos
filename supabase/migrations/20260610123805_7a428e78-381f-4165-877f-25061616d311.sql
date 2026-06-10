
DROP POLICY IF EXISTS "Anyone can create org" ON public.organizations;
CREATE POLICY "Create org when none" ON public.organizations
  FOR INSERT TO authenticated
  WITH CHECK (public.current_org_id() IS NULL);

REVOKE EXECUTE ON FUNCTION public.current_org_id() FROM PUBLIC, anon, authenticated;
REVOKE EXECUTE ON FUNCTION public.handle_new_user() FROM PUBLIC, anon, authenticated;
