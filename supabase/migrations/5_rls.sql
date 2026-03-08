-- 5. Row Level Security (enable + policies)
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shippers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loads ENABLE ROW LEVEL SECURITY;
-- qr_tokens and custody_events only if they exist (created in migration 4)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'qr_tokens') THEN
    ALTER TABLE public.qr_tokens ENABLE ROW LEVEL SECURITY;
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'custody_events') THEN
    ALTER TABLE public.custody_events ENABLE ROW LEVEL SECURITY;
  END IF;
END $$;

DROP POLICY IF EXISTS "Users can view own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can update own profile" ON public.profiles;
DROP POLICY IF EXISTS "Users can insert own profile" ON public.profiles;
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

DROP POLICY IF EXISTS "Authenticated can view carriers" ON public.carriers;
DROP POLICY IF EXISTS "Carriers can update own" ON public.carriers;
CREATE POLICY "Authenticated can view carriers" ON public.carriers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Carriers can update own" ON public.carriers FOR UPDATE TO authenticated
  USING ((SELECT profile_id FROM public.carriers WHERE id = carriers.id) = auth.uid());

DROP POLICY IF EXISTS "Authenticated can view shippers" ON public.shippers;
DROP POLICY IF EXISTS "Shippers can update own" ON public.shippers;
CREATE POLICY "Authenticated can view shippers" ON public.shippers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Shippers can update own" ON public.shippers FOR UPDATE TO authenticated
  USING ((SELECT profile_id FROM public.shippers WHERE id = shippers.id) = auth.uid());

DROP POLICY IF EXISTS "Authenticated can view drivers" ON public.drivers;
DROP POLICY IF EXISTS "Carriers can insert drivers" ON public.drivers;
DROP POLICY IF EXISTS "Carriers can update drivers" ON public.drivers;
CREATE POLICY "Authenticated can view drivers" ON public.drivers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Carriers can insert drivers" ON public.drivers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Carriers can update drivers" ON public.drivers FOR UPDATE TO authenticated USING (true);

DROP POLICY IF EXISTS "Authenticated can view loads" ON public.loads;
DROP POLICY IF EXISTS "Brokers can insert loads" ON public.loads;
DROP POLICY IF EXISTS "Brokers carriers can update loads" ON public.loads;
CREATE POLICY "Authenticated can view loads" ON public.loads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Brokers can insert loads" ON public.loads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Brokers carriers can update loads" ON public.loads FOR UPDATE TO authenticated USING (true);

-- Policies for qr_tokens and custody_events (only if tables exist)
DO $$
BEGIN
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'qr_tokens') THEN
    DROP POLICY IF EXISTS "Authenticated can view qr_tokens" ON public.qr_tokens;
    DROP POLICY IF EXISTS "Service can manage qr_tokens" ON public.qr_tokens;
    CREATE POLICY "Authenticated can view qr_tokens" ON public.qr_tokens FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Service can manage qr_tokens" ON public.qr_tokens FOR ALL TO service_role USING (true);
  END IF;
  IF EXISTS (SELECT 1 FROM information_schema.tables WHERE table_schema = 'public' AND table_name = 'custody_events') THEN
    DROP POLICY IF EXISTS "Authenticated can view custody_events" ON public.custody_events;
    DROP POLICY IF EXISTS "Authenticated can insert custody_events" ON public.custody_events;
    CREATE POLICY "Authenticated can view custody_events" ON public.custody_events FOR SELECT TO authenticated USING (true);
    CREATE POLICY "Authenticated can insert custody_events" ON public.custody_events FOR INSERT TO authenticated WITH CHECK (true);
  END IF;
END $$;
