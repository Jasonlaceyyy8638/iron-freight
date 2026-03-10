-- 19. Driver locations (live GPS for broker tracking)
-- One row per (driver_id, load_id); updated when driver reports position.
CREATE TABLE IF NOT EXISTS public.driver_locations (
  driver_id UUID NOT NULL REFERENCES public.drivers(id) ON DELETE CASCADE,
  load_id UUID NOT NULL REFERENCES public.loads(id) ON DELETE CASCADE,
  latitude DECIMAL(10, 8) NOT NULL,
  longitude DECIMAL(11, 8) NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  PRIMARY KEY (driver_id, load_id)
);

CREATE INDEX IF NOT EXISTS idx_driver_locations_load ON public.driver_locations(load_id);

ALTER TABLE public.driver_locations ENABLE ROW LEVEL SECURITY;

-- Read: broker who owns the load, carrier assigned to the load, or driver assigned to the load
CREATE POLICY "View driver location if can view load"
  ON public.driver_locations FOR SELECT TO authenticated
  USING (
    EXISTS (
      SELECT 1 FROM public.loads l
      WHERE l.id = driver_locations.load_id
      AND (
        l.broker_profile_id = auth.uid()
        OR l.carrier_id IN (SELECT id FROM public.carriers WHERE profile_id = auth.uid())
        OR l.driver_id IN (SELECT id FROM public.drivers WHERE profile_id = auth.uid())
      )
    )
  );

-- Insert/update: only the driver assigned to this load
CREATE POLICY "Driver can upsert own location for assigned load"
  ON public.driver_locations FOR ALL TO authenticated
  USING (
    driver_id IN (SELECT id FROM public.drivers WHERE profile_id = auth.uid())
  )
  WITH CHECK (
    driver_id IN (SELECT id FROM public.drivers WHERE profile_id = auth.uid())
  );
