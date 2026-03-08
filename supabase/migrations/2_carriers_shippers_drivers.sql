-- 2. Carriers, Shippers, Drivers
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
