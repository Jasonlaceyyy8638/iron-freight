-- 7. Internal notes (StaffHub / Support Command Center)
CREATE TABLE IF NOT EXISTS public.internal_notes (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  load_id UUID REFERENCES public.loads(id) ON DELETE CASCADE,
  profile_id UUID REFERENCES public.profiles(id) ON DELETE CASCADE,
  author_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  body TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  CONSTRAINT internal_notes_target_check CHECK (
    load_id IS NOT NULL OR profile_id IS NOT NULL
  )
);

CREATE INDEX IF NOT EXISTS idx_internal_notes_load ON public.internal_notes(load_id);
CREATE INDEX IF NOT EXISTS idx_internal_notes_profile ON public.internal_notes(profile_id);
CREATE INDEX IF NOT EXISTS idx_internal_notes_author ON public.internal_notes(author_id);
CREATE INDEX IF NOT EXISTS idx_internal_notes_created ON public.internal_notes(created_at DESC);

COMMENT ON TABLE public.internal_notes IS 'Staff-only notes on loads or profiles; used by Support Command Center (StaffHub).';

ALTER TABLE public.internal_notes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Authenticated can view internal_notes" ON public.internal_notes;
DROP POLICY IF EXISTS "Authenticated can insert internal_notes" ON public.internal_notes;
DROP POLICY IF EXISTS "Authenticated can update own internal_notes" ON public.internal_notes;
DROP POLICY IF EXISTS "Authenticated can delete own internal_notes" ON public.internal_notes;
CREATE POLICY "Authenticated can view internal_notes" ON public.internal_notes
  FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert internal_notes" ON public.internal_notes
  FOR INSERT TO authenticated WITH CHECK (auth.uid() = author_id);
CREATE POLICY "Authenticated can update own internal_notes" ON public.internal_notes
  FOR UPDATE TO authenticated USING (auth.uid() = author_id);
CREATE POLICY "Authenticated can delete own internal_notes" ON public.internal_notes
  FOR DELETE TO authenticated USING (auth.uid() = author_id);

DROP TRIGGER IF EXISTS internal_notes_updated_at ON public.internal_notes;
CREATE TRIGGER internal_notes_updated_at
  BEFORE UPDATE ON public.internal_notes
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
