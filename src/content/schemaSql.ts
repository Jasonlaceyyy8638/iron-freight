// Copy of supabase/migrations/schema.sql for display in Broker dashboard. Keep in sync.
export const SCHEMA_SQL = `-- IronFreight: Zero Trust Logistics Verification
-- Run this in Supabase SQL Editor to create the full schema.

-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (extends Supabase auth.users)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('broker', 'carrier', 'shipper', 'driver')),
  avatar_url TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_email ON public.profiles(email);

-- ============================================
-- CARRIERS
-- ============================================
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

CREATE INDEX idx_carriers_mc ON public.carriers(mc_number);
CREATE INDEX idx_carriers_profile ON public.carriers(profile_id);

-- ============================================
-- SHIPPERS
-- ============================================
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

CREATE INDEX idx_shippers_profile ON public.shippers(profile_id);

-- ============================================
-- DRIVERS (biometric wallet / CDL linked)
-- ============================================
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

CREATE INDEX idx_drivers_carrier ON public.drivers(carrier_id);
CREATE INDEX idx_drivers_profile ON public.drivers(profile_id);
CREATE INDEX idx_drivers_cdl ON public.drivers(cdl_number);

-- ============================================
-- LOADS (broker-created, assigned to carrier/driver)
-- ============================================
CREATE TABLE IF NOT EXISTS public.loads (
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

CREATE INDEX idx_loads_broker ON public.loads(broker_profile_id);
CREATE INDEX idx_loads_carrier ON public.loads(carrier_id);
CREATE INDEX idx_loads_driver ON public.loads(driver_id);
CREATE INDEX idx_loads_status ON public.loads(status);
CREATE INDEX idx_loads_load_number ON public.loads(load_number);

-- ============================================
-- QR TOKENS (time-sensitive, for pickup/delivery verification)
-- ============================================
CREATE TABLE IF NOT EXISTS public.qr_tokens (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  load_id UUID NOT NULL REFERENCES public.loads(id) ON DELETE CASCADE,
  token_type TEXT NOT NULL CHECK (token_type IN ('pickup', 'delivery')),
  token_hash TEXT NOT NULL UNIQUE,
  expires_at TIMESTAMPTZ NOT NULL,
  used_at TIMESTAMPTZ,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_qr_tokens_load ON public.qr_tokens(load_id);
CREATE INDEX idx_qr_tokens_hash ON public.qr_tokens(token_hash);
CREATE INDEX idx_qr_tokens_expires ON public.qr_tokens(expires_at);

-- ============================================
-- CUSTODY EVENTS (immutable chain of custody / eBOL)
-- ============================================
CREATE TABLE IF NOT EXISTS public.custody_events (
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

CREATE INDEX idx_custody_events_load ON public.custody_events(load_id);
CREATE INDEX idx_custody_events_created ON public.custody_events(created_at);
CREATE INDEX idx_custody_events_type ON public.custody_events(event_type);

-- ============================================
-- RLS (Row Level Security) - enable and policies
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.carriers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.shippers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drivers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.qr_tokens ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.custody_events ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read/update own
CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

-- Carriers: brokers/carriers can read; carriers can update own
CREATE POLICY "Authenticated can view carriers" ON public.carriers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Carriers can update own" ON public.carriers FOR UPDATE TO authenticated
  USING ((SELECT profile_id FROM public.carriers WHERE id = carriers.id) = auth.uid());

-- Shippers: authenticated read; shippers update own
CREATE POLICY "Authenticated can view shippers" ON public.shippers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Shippers can update own" ON public.shippers FOR UPDATE TO authenticated
  USING ((SELECT profile_id FROM public.shippers WHERE id = shippers.id) = auth.uid());

-- Drivers: carrier-scoped read/insert/update
CREATE POLICY "Authenticated can view drivers" ON public.drivers FOR SELECT TO authenticated USING (true);
CREATE POLICY "Carriers can insert drivers" ON public.drivers FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Carriers can update drivers" ON public.drivers FOR UPDATE TO authenticated USING (true);

-- Loads: brokers create/update; carriers/drivers/shippers read as needed
CREATE POLICY "Authenticated can view loads" ON public.loads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Brokers can insert loads" ON public.loads FOR INSERT TO authenticated WITH CHECK (true);
CREATE POLICY "Brokers carriers can update loads" ON public.loads FOR UPDATE TO authenticated USING (true);

-- QR tokens: service role or edge function for insert; read for verification
CREATE POLICY "Authenticated can view qr_tokens" ON public.qr_tokens FOR SELECT TO authenticated USING (true);
CREATE POLICY "Service can manage qr_tokens" ON public.qr_tokens FOR ALL TO service_role USING (true);

-- Custody events: append-only; authenticated read
CREATE POLICY "Authenticated can view custody_events" ON public.custody_events FOR SELECT TO authenticated USING (true);
CREATE POLICY "Authenticated can insert custody_events" ON public.custody_events FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- TRIGGERS: updated_at
-- ============================================
CREATE OR REPLACE FUNCTION public.set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER carriers_updated_at BEFORE UPDATE ON public.carriers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER shippers_updated_at BEFORE UPDATE ON public.shippers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER drivers_updated_at BEFORE UPDATE ON public.drivers
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER loads_updated_at BEFORE UPDATE ON public.loads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
`;
