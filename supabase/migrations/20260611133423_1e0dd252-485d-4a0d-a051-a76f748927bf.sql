CREATE POLICY "Club assets read own org"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'club-assets'
  AND (storage.foldername(name))[1] = private.current_org_id()::text
);

CREATE POLICY "Club assets write own org"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'club-assets'
  AND (storage.foldername(name))[1] = private.current_org_id()::text
);

CREATE POLICY "Club assets update own org"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'club-assets'
  AND (storage.foldername(name))[1] = private.current_org_id()::text
)
WITH CHECK (
  bucket_id = 'club-assets'
  AND (storage.foldername(name))[1] = private.current_org_id()::text
);

CREATE POLICY "Club assets delete own org"
ON storage.objects FOR DELETE TO authenticated
USING (
  bucket_id = 'club-assets'
  AND (storage.foldername(name))[1] = private.current_org_id()::text
);