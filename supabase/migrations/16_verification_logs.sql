-- 16. verification_logs: audit trail for security document uploads (CDL, BOL, biometric)
CREATE TABLE IF NOT EXISTS public.verification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  load_id UUID REFERENCES public.loads(id) ON DELETE CASCADE,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE CASCADE,
  doc_type TEXT NOT NULL CHECK (doc_type IN ('cdl', 'bol', 'biometric')),
  file_path TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_verification_logs_load ON public.verification_logs(load_id);
CREATE INDEX IF NOT EXISTS idx_verification_logs_driver ON public.verification_logs(driver_id);

ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can view verification_logs" ON public.verification_logs;
DROP POLICY IF EXISTS "Driver can insert own verification_logs" ON public.verification_logs;
CREATE POLICY "Authenticated can view verification_logs" ON public.verification_logs
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Driver can insert own verification_logs" ON public.verification_logs
  FOR INSERT TO authenticated
  WITH CHECK (
    driver_id = (SELECT id FROM public.drivers WHERE profile_id = auth.uid() LIMIT 1)
  );

-- Iron-vault: allow driver upload to path {load_id}/{driver_id}/{type}.jpg
DROP POLICY IF EXISTS "Iron-vault: driver upload load-scoped" ON storage.objects;
CREATE POLICY "Iron-vault: driver upload load-scoped"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'iron-vault'
  AND array_length(storage.foldername(name), 1) >= 3
  AND (storage.foldername(name))[2] = (
    SELECT id::text FROM public.drivers WHERE profile_id = auth.uid() LIMIT 1
  )
);

-- Allow driver to update/overwrite their load-scoped uploads
DROP POLICY IF EXISTS "Iron-vault: driver update load-scoped" ON storage.objects;
CREATE POLICY "Iron-vault: driver update load-scoped"
ON storage.objects FOR UPDATE TO authenticated
USING (
  bucket_id = 'iron-vault'
  AND array_length(storage.foldername(name), 1) >= 3
  AND (storage.foldername(name))[2] = (
    SELECT id::text FROM public.drivers WHERE profile_id = auth.uid() LIMIT 1
  )
)
WITH CHECK (
  bucket_id = 'iron-vault'
  AND array_length(storage.foldername(name), 1) >= 3
  AND (storage.foldername(name))[2] = (
    SELECT id::text FROM public.drivers WHERE profile_id = auth.uid() LIMIT 1
  )
);

-- SELECT for load-scoped paths: admin or broker with that load (driver_id in path segment 2)
-- Existing "Iron-vault: admin or assigned broker view" uses (storage.foldername(name))[2]::uuid as driver_id; for path load_id/driver_id/type.jpg segment 2 is driver_id, so it still works.
