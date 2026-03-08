// Display in left sidebar for easy copy-paste into Supabase SQL Editor
export const SUPABASE_MIGRATIONS = `-- IronFreight Zero-Trust Logistics
-- Run in Supabase SQL Editor. Copy from left sidebar.

CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- PROFILES (BROKER, CARRIER, SHIPPER, DRIVER)
CREATE TABLE IF NOT EXISTS public.profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  role TEXT NOT NULL CHECK (role IN ('BROKER', 'CARRIER', 'SHIPPER', 'DRIVER')),
  mc_number TEXT,
  full_name TEXT,
  company_name TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_profiles_role ON public.profiles(role);
CREATE INDEX idx_profiles_mc ON public.profiles(mc_number) WHERE mc_number IS NOT NULL;

-- LOADS (id, broker_id, carrier_id, driver_id, origin, destination, rate, status)
CREATE TABLE IF NOT EXISTS public.loads (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broker_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  carrier_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  driver_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
  origin TEXT NOT NULL,
  destination TEXT NOT NULL,
  rate DECIMAL(12, 2),
  status TEXT NOT NULL DEFAULT 'open' CHECK (status IN ('open', 'bidding', 'awarded', 'in-transit', 'delivered')),
  equipment_type TEXT,
  weight_lbs INTEGER,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_loads_broker ON public.loads(broker_id);
CREATE INDEX idx_loads_carrier ON public.loads(carrier_id);
CREATE INDEX idx_loads_driver ON public.loads(driver_id);
CREATE INDEX idx_loads_status ON public.loads(status);

-- BIDS (id, load_id, carrier_id, amount, status)
CREATE TABLE IF NOT EXISTS public.bids (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  load_id UUID NOT NULL REFERENCES public.loads(id) ON DELETE CASCADE,
  carrier_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  amount DECIMAL(12, 2) NOT NULL,
  status TEXT NOT NULL DEFAULT 'submitted' CHECK (status IN ('submitted', 'accepted', 'rejected')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_bids_load ON public.bids(load_id);
CREATE INDEX idx_bids_carrier ON public.bids(carrier_id);

-- VERIFICATION_LOGS (load_id, scan_time, gps_coords, biometric_status)
CREATE TABLE IF NOT EXISTS public.verification_logs (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  load_id UUID NOT NULL REFERENCES public.loads(id) ON DELETE CASCADE,
  scan_time TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  gps_coords JSONB,
  biometric_status TEXT NOT NULL CHECK (biometric_status IN ('MATCH', 'FRAUD_ALERT', 'PENDING')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX idx_verification_logs_load ON public.verification_logs(load_id);

-- RLS
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.loads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.bids ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.verification_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users own profile" ON public.profiles FOR ALL USING (auth.uid() = id);
CREATE POLICY "Authenticated view loads" ON public.loads FOR SELECT TO authenticated USING (true);
CREATE POLICY "Brokers insert/update loads" ON public.loads FOR ALL TO authenticated USING (broker_id = auth.uid());
CREATE POLICY "Carriers update assigned" ON public.loads FOR UPDATE TO authenticated USING (carrier_id = auth.uid());
CREATE POLICY "Bids" ON public.bids FOR ALL TO authenticated USING (true);
CREATE POLICY "Verification logs" ON public.verification_logs FOR ALL TO authenticated USING (true);

-- updated_at trigger
CREATE OR REPLACE FUNCTION public.set_updated_at() RETURNS TRIGGER AS $$
BEGIN NEW.updated_at = NOW(); RETURN NEW; END;
$$ LANGUAGE plpgsql;
CREATE TRIGGER profiles_updated_at BEFORE UPDATE ON public.profiles FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
CREATE TRIGGER loads_updated_at BEFORE UPDATE ON public.loads FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
`
