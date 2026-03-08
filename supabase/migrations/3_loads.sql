-- 3. Loads (broker-created, assigned to carrier/driver)
-- If you get "column broker_profile_id does not exist", the loads table was created from an incomplete script.
-- The DROP statements below reset loads and dependents; re-run migrations 4–7 after this.
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
