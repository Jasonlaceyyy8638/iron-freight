-- 4. QR tokens + Custody events (chain of custody / eBOL)
-- Drop in reverse dependency order so we can recreate with correct structure.
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
