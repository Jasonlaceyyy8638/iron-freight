-- 14. CDL and BOL document storage (image URLs + bucket)
ALTER TABLE public.drivers ADD COLUMN IF NOT EXISTS cdl_image_url TEXT;
ALTER TABLE public.loads ADD COLUMN IF NOT EXISTS bol_image_url TEXT;

-- Storage bucket for CDL and BOL images (private, 5MB limit, images only)
INSERT INTO storage.buckets (id, name, public, file_size_limit, allowed_mime_types)
VALUES (
  'documents',
  'documents',
  false,
  5242880,
  ARRAY['image/jpeg', 'image/png', 'image/webp']
)
ON CONFLICT (id) DO UPDATE SET
  file_size_limit = EXCLUDED.file_size_limit,
  allowed_mime_types = EXCLUDED.allowed_mime_types;

-- RLS: authenticated users can upload to cdl/ and bol/ paths only
DROP POLICY IF EXISTS "Documents bucket insert" ON storage.objects;
CREATE POLICY "Documents bucket insert"
ON storage.objects FOR INSERT TO authenticated
WITH CHECK (
  bucket_id = 'documents'
  AND ((storage.foldername(name))[1] = 'cdl' OR (storage.foldername(name))[1] = 'bol')
);

-- Authenticated can read from documents bucket (for signed URLs / display)
DROP POLICY IF EXISTS "Documents bucket select" ON storage.objects;
CREATE POLICY "Documents bucket select"
ON storage.objects FOR SELECT TO authenticated
USING (bucket_id = 'documents');

-- Allow update for overwriting (e.g. replace CDL/BOL)
DROP POLICY IF EXISTS "Documents bucket update" ON storage.objects;
CREATE POLICY "Documents bucket update"
ON storage.objects FOR UPDATE TO authenticated
USING (bucket_id = 'documents')
WITH CHECK (bucket_id = 'documents');
