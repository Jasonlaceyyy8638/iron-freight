-- =============================================================================
-- IRONFREIGHT – FULL DATABASE MIGRATION (run once in Supabase SQL Editor)
-- Run this entire file in order. Safe on fresh database.
-- =============================================================================

-- =============================================================================
-- 1. Extension + Profiles
-- =============================================================================
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('broker', 'carrier', 'shipper', 'driver', 'admin')),
  avatar_url TEXT,
  mc_number TEXT,
  dot_number TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_profiles_role ON public.profiles(role);
CREATE INDEX IF NOT EXISTS idx_profiles_email ON public.profiles(email);

-- =============================================================================
-- 2. Carriers, Shippers, Drivers
-- =============================================================================
CREATE TABLE IF NOT EXISTS public.carriers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  legal_name TEXT NOT NULL,
  mc_number TEXT NOT NULL UNIQUE,
  dot_number TEXT,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  phone TEXT,
  verified_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_carriers_mc ON public.carriers(mc_number);
CREATE INDEX IF NOT EXISTS idx_carriers_profile ON public.carriers(profile_id);

CREATE TABLE IF NOT EXISTS public.shippers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  legal_name TEXT NOT NULL,
  address_line1 TEXT,
  address_line2 TEXT,
  city TEXT,
  state TEXT,
  zip TEXT,
  phone TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_shippers_profile ON public.shippers(profile_id);

CREATE TABLE IF NOT EXISTS public.drivers (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  carrier_id UUID REFERENCES public.carriers(id) ON DELETE CASCADE,
  full_name TEXT NOT NULL,
  cdl_number TEXT NOT NULL,
  cdl_state TEXT,
  cdl_expiry DATE,
  phone TEXT,
  cdl_verified_at TIMESTAMPTZ,
  biometric_verified_at TIMESTAMPTZ,
  selfie_check_passed BOOLEAN DEFAULT FALSE,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_drivers_carrier ON public.drivers(carrier_id);
CREATE INDEX IF NOT EXISTS idx_drivers_profile ON public.drivers(profile_id);
CREATE INDEX IF NOT EXISTS idx_drivers_cdl ON public.drivers(cdl_number);

-- =============================================================================
-- 3. Loads
-- =============================================================================
DROP TABLE IF EXISTS public.internal_notes CASCADE;
DROP TABLE IF EXISTS public.custody_events CASCADE;
DROP TABLE IF EXISTS public.qr_tokens CASCADE;
DROP TABLE IF EXISTS public.loads CASCADE;

CREATE TABLE public.loads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broker_profile_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  carrier_id UUID REFERENCES public.carriers(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES public.drivers(id) ON DELETE SET NULL,
  shipper_id UUID REFERENCES public.shippers(id) ON DELETE SET NULL,
  load_number TEXT NOT NULL UNIQUE,
  status TEXT NOT NULL DEFAULT 'draft' CHECK (status IN (
    'draft', 'posted', 'assigned', 'in_transit', 'pickup_verified', 'delivery_verified', 'completed', 'cancelled'
  )),
  origin_address TEXT,
  origin_city TEXT,
  origin_state TEXT,
  origin_zip TEXT,
  origin_geofence_lat DECIMAL(10, 8),
  origin_geofence_lng DECIMAL(11, 8),
  origin_geofence_radius_meters INTEGER DEFAULT 500,
  dest_address TEXT,
  dest_city TEXT,
  dest_state TEXT,
  dest_zip TEXT,
  dest_geofence_lat DECIMAL(10, 8),
  dest_geofence_lng DECIMAL(11, 8),
  dest_geofence_radius_meters INTEGER DEFAULT 500,
  pickup_window_start TIMESTAMPTZ,
  pickup_window_end TIMESTAMPTZ,
  delivery_window_start TIMESTAMPTZ,
  delivery_window_end TIMESTAMPTZ,
  commodity TEXT,
  weight_lbs INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_loads_broker ON public.loads(broker_profile_id);
CREATE INDEX IF NOT EXISTS idx_loads_carrier ON public.loads(carrier_id);
CREATE INDEX IF NOT EXISTS idx_loads_driver ON public.loads(driver_id);
CREATE INDEX IF NOT EXISTS idx_loads_status ON public.loads(status);
CREATE INDEX IF NOT EXISTS idx_loads_load_number ON public.loads(load_number);

-- =============================================================================
-- 4. QR tokens + Custody events
-- =============================================================================
DROP TABLE IF EXISTS public.custody_events CASCADE;
DROP TABLE IF EXISTS public.qr_tokens CASCADE;

CREATE TABLE public.qr_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  load_id UUID NOT NULL REFERENCES public.loads(id) ON DELETE CASCADE,
  token_type TEXT NOT NULL CHECK (token_type IN ('pickup', 'delivery')),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_qr_tokens_load ON public.qr_tokens(load_id);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_hash ON public.qr_tokens(token_hash);
CREATE INDEX IF NOT EXISTS idx_qr_tokens_expires ON public.qr_tokens(expires_at);

CREATE TABLE public.custody_events (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  load_id UUID NOT NULL REFERENCES public.loads(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL CHECK (event_type IN (
    'pickup_scan', 'delivery_scan', 'biometric_signature', 'driver_verified', 'geofence_entered', 'geofence_exited'
  )),
  actor_type TEXT NOT NULL CHECK (actor_type IN ('driver', 'shipper', 'carrier', 'broker', 'system')),
  actor_id UUID,
  qr_token_id UUID REFERENCES public.qr_tokens(id) ON DELETE SET NULL,
  latitude DECIMAL(10, 8),
  longitude DECIMAL(11, 8),
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_custody_events_load ON public.custody_events(load_id);
CREATE INDEX IF NOT EXISTS idx_custody_events_created ON public.custody_events(created_at);
CREATE INDEX IF NOT EXISTS idx_custody_events_type ON public.custody_events(event_type);

-- =============================================================================
-- 5. Row Level Security
-- =============================================================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shippers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custody_events ENABLE ROW LEVEL SECURITY;

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

DROP POLICY IF EXISTS "Authenticated can view qr_tokens" ON public.qr_tokens;
DROP POLICY IF EXISTS "Service can manage qr_tokens" ON public.qr_tokens;
CREATE POLICY "Authenticated can view qr_tokens" ON public.qr_tokens FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service can manage qr_tokens" ON public.qr_tokens FOR ALL TO service_role USING (true);

DROP POLICY IF EXISTS "Authenticated can view custody_events" ON public.custody_events;
DROP POLICY IF EXISTS "Authenticated can insert custody_events" ON public.custody_events;
CREATE POLICY "Authenticated can view custody_events" ON public.custody_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert custody_events" ON public.custody_events FOR INSERT TO authenticated WITH CHECK (true);

-- =============================================================================
-- 5b. Master admin: is_admin() + admin RLS (full access)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.is_admin()
RETURNS boolean AS $$
  SELECT EXISTS (SELECT 1 FROM public.profiles WHERE id = auth.uid() AND role = 'admin');
$$ LANGUAGE sql SECURITY DEFINER STABLE SET search_path = public;

DROP POLICY IF EXISTS "Admins can view all profiles" ON public.profiles;
DROP POLICY IF EXISTS "Admins can update all profiles" ON public.profiles;
CREATE POLICY "Admins can view all profiles" ON public.profiles FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can update all profiles" ON public.profiles FOR UPDATE TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage carriers" ON public.carriers;
CREATE POLICY "Admins can manage carriers" ON public.carriers FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage shippers" ON public.shippers;
CREATE POLICY "Admins can manage shippers" ON public.shippers FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage drivers" ON public.drivers;
CREATE POLICY "Admins can manage drivers" ON public.drivers FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage loads" ON public.loads;
CREATE POLICY "Admins can manage loads" ON public.loads FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage qr_tokens" ON public.qr_tokens;
CREATE POLICY "Admins can manage qr_tokens" ON public.qr_tokens FOR ALL TO authenticated USING (public.is_admin());

DROP POLICY IF EXISTS "Admins can manage custody_events" ON public.custody_events;
CREATE POLICY "Admins can manage custody_events" ON public.custody_events FOR ALL TO authenticated USING (public.is_admin());

-- =============================================================================
-- 6. updated_at triggers
-- =============================================================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS profiles_updated_at ON public.profiles;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS carriers_updated_at ON public.carriers;
CREATE TRIGGER carriers_updated_at BEFORE UPDATE ON public.carriers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS shippers_updated_at ON public.shippers;
CREATE TRIGGER shippers_updated_at BEFORE UPDATE ON public.shippers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS drivers_updated_at ON public.drivers;
CREATE TRIGGER drivers_updated_at BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

DROP TRIGGER IF EXISTS loads_updated_at ON public.loads;
CREATE TRIGGER loads_updated_at BEFORE UPDATE ON public.loads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- =============================================================================
-- 7. Internal notes (Support / StaffHub)
-- =============================================================================
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

DROP POLICY IF EXISTS "Admins can manage internal_notes" ON public.internal_notes;
CREATE POLICY "Admins can manage internal_notes" ON public.internal_notes FOR ALL TO authenticated USING (public.is_admin());

-- =============================================================================
-- 8. Create profile on sign-up (bypasses RLS; app passes role in auth metadata)
-- =============================================================================
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  meta jsonb;
  r text;
  fn text;
  mn text;
  dn text;
  ln text;
BEGIN
  meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  r := COALESCE(meta->>'role', 'broker');
  fn := meta->>'full_name';
  mn := meta->>'mc_number';
  dn := meta->>'dot_number';
  ln := meta->>'legal_name';

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.email, ''), NULLIF(trim(fn), ''), r);

  IF (mn IS NOT NULL AND trim(mn) <> '') OR (dn IS NOT NULL AND trim(dn) <> '') THEN
    BEGIN
      UPDATE public.profiles SET mc_number = NULLIF(trim(mn), ''), dot_number = NULLIF(trim(dn), '') WHERE id = NEW.id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;

  IF r = 'carrier' AND mn IS NOT NULL AND trim(mn) <> '' THEN
    INSERT INTO public.carriers (profile_id, legal_name, mc_number, dot_number)
    VALUES (
      NEW.id,
      COALESCE(NULLIF(trim(ln), ''), NULLIF(trim(fn), ''), NEW.email, ''),
      trim(mn),
      NULLIF(trim(dn), '')
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- =============================================================================
-- Done. Tables: profiles, carriers, shippers, drivers, loads, qr_tokens,
-- custody_events, internal_notes. RLS and triggers applied. Profile created on sign-up.
-- =============================================================================
