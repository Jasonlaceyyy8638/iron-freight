-- 15. iron-vault bucket: driver ID uploads; only driver can upload own, only Admin or assigned Broker can view
-- Path convention: driver/{driver_id}/... (e.g. driver/{uuid}/id.jpg)

INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'iron-vault',
  'iron-vault',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO NOTHING;

-- INSERT: only the authenticated Driver can upload to their own path (driver/{their_driver_id}/...)
DROP POLICY IF EXISTS "Iron-vault: driver upload own ID" ON storage.objects;
CREATE POLICY "Iron-vault: driver upload own ID"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'iron-vault'
  AND (storage.foldername(name))[1] = 'driver'
  AND (storage.foldername(name))[2] = (
    SELECT id::text FROM public.drivers WHERE profile_id = auth.uid() LIMIT 1
  )
);

-- SELECT: only Admin (role = 'admin') or the assigned Broker (loads.broker_profile_id = auth.uid() for that driver) can view
DROP POLICY IF EXISTS "Iron-vault: admin or assigned broker view" ON storage.objects;
CREATE POLICY "Iron-vault: admin or assigned broker view"
ON storage.objects FOR SELECT TO authenticated
USING (
  bucket_id = 'iron-vault'
  AND (
    public.is_admin()
    OR EXISTS (
      SELECT 1 FROM public.loads
      WHERE broker_profile_id = auth.uid()
        AND driver_id = ((storage.foldername(name))[2])::uuid
    )
  )
);

-- UPDATE: same as INSERT (driver can replace their own ID image)
DROP POLICY IF EXISTS "Iron-vault: driver update own ID" ON storage.objects;
CREATE POLICY "Iron-vault: driver update own ID"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'iron-vault'
  AND (storage.foldername(name))[1] = 'driver'
  AND (storage.foldername(name))[2] = (
    SELECT id::text FROM public.drivers WHERE profile_id = auth.uid() LIMIT 1
  )
)
WITH CHECK (
  bucket_id = 'iron-vault'
  AND (storage.foldername(name))[1] = 'driver'
  AND (storage.foldername(name))[2] = (
    SELECT id::text FROM public.drivers WHERE profile_id = auth.uid() LIMIT 1
  )
);
