-- 13. Invites: staff (admin team), carrier (drivers), broker (team)
-- Token is used in sign-in/sign-up link; expires_at typically 7 days.

CREATE TABLE IF NOT EXISTS public.staff_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  email TEXT NOT NULL,
  full_name TEXT,
  staff_role TEXT NOT NULL DEFAULT 'admin' CHECK (staff_role IN ('admin', 'billing', 'support')),
  token TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_staff_invites_token ON public.staff_invites(token);
CREATE INDEX IF NOT EXISTS idx_staff_invites_email ON public.staff_invites(email);
ALTER TABLE public.staff_invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Admins can manage staff_invites" ON public.staff_invites;
CREATE POLICY "Admins can manage staff_invites" ON public.staff_invites FOR ALL TO authenticated USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.carrier_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  carrier_id UUID NOT NULL REFERENCES public.carriers(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  token TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_carrier_invites_token ON public.carrier_invites(token);
CREATE INDEX IF NOT EXISTS idx_carrier_invites_carrier ON public.carrier_invites(carrier_id);
ALTER TABLE public.carrier_invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Carrier can manage own invites" ON public.carrier_invites;
CREATE POLICY "Carrier can manage own invites" ON public.carrier_invites FOR ALL TO authenticated
  USING (auth.uid() = (SELECT profile_id FROM public.carriers WHERE id = carrier_invites.carrier_id));
DROP POLICY IF EXISTS "Admins can manage carrier_invites" ON public.carrier_invites;
CREATE POLICY "Admins can manage carrier_invites" ON public.carrier_invites FOR ALL TO authenticated USING (public.is_admin());

CREATE TABLE IF NOT EXISTS public.broker_invites (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  broker_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  email TEXT NOT NULL,
  full_name TEXT,
  token TEXT NOT NULL UNIQUE,
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  expires_at TIMESTAMPTZ NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);
CREATE INDEX IF NOT EXISTS idx_broker_invites_token ON public.broker_invites(token);
CREATE INDEX IF NOT EXISTS idx_broker_invites_broker ON public.broker_invites(broker_profile_id);
ALTER TABLE public.broker_invites ENABLE ROW LEVEL SECURITY;
DROP POLICY IF EXISTS "Broker can manage own invites" ON public.broker_invites;
CREATE POLICY "Broker can manage own invites" ON public.broker_invites FOR ALL TO authenticated
  USING (auth.uid() = broker_profile_id);
DROP POLICY IF EXISTS "Admins can manage broker_invites" ON public.broker_invites;
CREATE POLICY "Admins can manage broker_invites" ON public.broker_invites FOR ALL TO authenticated USING (public.is_admin());

COMMENT ON TABLE public.staff_invites IS 'Admin team invites; email sent from Info@ with link to /admin/login?invite=token';
COMMENT ON TABLE public.carrier_invites IS 'Carrier driver invites; link to /login?invite=token&type=carrier';
COMMENT ON TABLE public.broker_invites IS 'Broker team invites; link to /login?invite=token&type=broker';

-- Lookup invite by token (for login pages; anon can call to prefill email)
CREATE OR REPLACE FUNCTION public.get_staff_invite_by_token(t TEXT)
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT json_build_object('email', email, 'full_name', full_name, 'staff_role', staff_role)
  FROM public.staff_invites
  WHERE token = t AND expires_at > NOW()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_carrier_invite_by_token(t TEXT)
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT json_build_object('email', i.email, 'full_name', i.full_name, 'carrier_id', i.carrier_id, 'carrier_name', c.legal_name)
  FROM public.carrier_invites i
  JOIN public.carriers c ON c.id = i.carrier_id
  WHERE i.token = t AND i.expires_at > NOW()
  LIMIT 1;
$$;

CREATE OR REPLACE FUNCTION public.get_broker_invite_by_token(t TEXT)
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
STABLE
AS $$
  SELECT json_build_object('email', email, 'full_name', full_name)
  FROM public.broker_invites
  WHERE token = t AND expires_at > NOW()
  LIMIT 1;
$$;

GRANT EXECUTE ON FUNCTION public.get_staff_invite_by_token(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_carrier_invite_by_token(TEXT) TO anon;
GRANT EXECUTE ON FUNCTION public.get_broker_invite_by_token(TEXT) TO anon;
