-- 11. Admin team: staff roles (billing, support, admin) for master admin page
-- Only profiles with role = 'admin' can have a row here.

CREATE TABLE IF NOT EXISTS public.admin_team (
  profile_id UUID PRIMARY KEY REFERENCES public.profiles(id) ON DELETE CASCADE,
  staff_role TEXT NOT NULL DEFAULT 'admin'
    CHECK (staff_role IN ('admin', 'billing', 'support')),
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL,
  updated_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_admin_team_staff_role ON public.admin_team(staff_role);

COMMENT ON TABLE public.admin_team IS 'Staff role (billing, support, admin) for admin users; used on Master Admin team section.';

ALTER TABLE public.admin_team ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "Admins can view admin_team" ON public.admin_team;
DROP POLICY IF EXISTS "Admins can manage admin_team" ON public.admin_team;
CREATE POLICY "Admins can view admin_team" ON public.admin_team
  FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can manage admin_team" ON public.admin_team
  FOR ALL TO authenticated USING (public.is_admin());

DROP TRIGGER IF EXISTS admin_team_updated_at ON public.admin_team;
CREATE TRIGGER admin_team_updated_at BEFORE UPDATE ON public.admin_team
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();
