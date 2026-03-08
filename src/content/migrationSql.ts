// IronFreight Load Board migration – copy from left sidebar into Supabase SQL Editor
export const MIGRATION_SQL = `-- IronFreight Load Board: Real-Time Bidding & Seamless Handoff
-- Run in Supabase SQL Editor. Replaces "Trust" with "Verification."

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- PROFILES (broker, carrier, driver)
-- ============================================
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  role TEXT NOT NULL CHECK (role IN ('broker', 'carrier', 'driver')),
  company_name TEXT,
  mc_number TEXT,
  verified_status TEXT DEFAULT 'pending' CHECK (verified_status IN ('pending', 'verified', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_mc ON public.profiles(mc_number) WHERE mc_number IS NOT NULL;

-- ============================================
-- LOADS (Broker posts; status flow: open → bidding → awarded → in-transit → delivered)
-- ============================================
CREATE TABLE IF NOT EXISTS public.loads (
  uuid UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'bidding', 'awarded', 'in-transit', 'delivered')),
  listing_type TEXT NOT NULL CHECK (listing_type IN ('buy_now', 'bidding')),
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  weight INTEGER,
  equipment_type TEXT,
  broker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  carrier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  pay_rate_cents INTEGER,
  broker_contact TEXT,
  shipper_contact TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_loads_status ON public.loads(status);
CREATE INDEX idx_loads_broker ON public.loads(broker_id);
CREATE INDEX idx_loads_carrier ON public.loads(carrier_id);
CREATE INDEX idx_loads_driver ON public.loads(driver_id);

-- ============================================
-- BIDS (Carrier bids on loads)
-- ============================================
CREATE TABLE IF NOT EXISTS public.bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  load_id UUID NOT NULL REFERENCES public.loads(uuid) ON DELETE CASCADE,
  carrier_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount INTEGER NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_bids_load ON public.bids(load_id);
CREATE INDEX idx_bids_carrier ON public.bids(carrier_id);

-- ============================================
-- VERIFICATIONS (IronGate: driver biometric, pickup timestamp, geofence)
-- ============================================
CREATE TABLE IF NOT EXISTS public.verifications (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  load_id UUID NOT NULL REFERENCES public.loads(uuid) ON DELETE CASCADE,
  driver_biometric_hash TEXT,
  pickup_timestamp TIMESTAMPTZ,
  delivery_timestamp TIMESTAMPTZ,
  geofence_coords JSONB,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX idx_verifications_load ON public.verifications(load_id);

-- ============================================
-- RLS
-- ============================================
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verifications ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own profile" ON public.profiles FOR SELECT USING (auth.uid() = id);
CREATE POLICY "Users can update own profile" ON public.profiles FOR UPDATE USING (auth.uid() = id);
CREATE POLICY "Users can insert own profile" ON public.profiles FOR INSERT WITH CHECK (auth.uid() = id);

CREATE POLICY "Authenticated can view loads" ON public.loads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Brokers can insert loads" ON public.loads FOR INSERT TO authenticated WITH CHECK (broker_id = auth.uid());
CREATE POLICY "Brokers can update own loads" ON public.loads FOR UPDATE TO authenticated USING (broker_id = auth.uid());
CREATE POLICY "Carriers can update assigned loads" ON public.loads FOR UPDATE TO authenticated USING (carrier_id = auth.uid());

CREATE POLICY "Carriers can place bids" ON public.bids FOR INSERT TO authenticated WITH CHECK (carrier_id = auth.uid());
CREATE POLICY "Authenticated can view bids" ON public.bids FOR SELECT TO authenticated USING (true);
CREATE POLICY "Brokers can update bid status" ON public.bids FOR UPDATE TO authenticated USING (true);

CREATE POLICY "Authenticated can view verifications" ON public.verifications FOR SELECT TO authenticated USING (true);
CREATE POLICY "Drivers can insert verifications" ON public.verifications FOR INSERT TO authenticated WITH CHECK (true);

-- ============================================
-- TRIGGER: updated_at
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
CREATE TRIGGER loads_updated_at BEFORE UPDATE ON public.loads
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
`
