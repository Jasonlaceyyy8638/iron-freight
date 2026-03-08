-- 8. Master admin role and RLS (run if you already have migrations 1–7)
-- Adds 'admin' to profiles.role and gives admins full access to all tables.

ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
  CHECK (role IN ('broker', 'carrier', 'shipper', 'driver', 'admin'));

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

DROP POLICY IF EXISTS "Admins can manage internal_notes" ON public.internal_notes;
CREATE POLICY "Admins can manage internal_notes" ON public.internal_notes FOR ALL TO authenticated USING (public.is_admin());
