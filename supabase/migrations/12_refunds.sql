-- 12. Refunds: billing (and admin) can grant credits, dollar amount, or percentage refunds

CREATE TABLE IF NOT EXISTS public.refunds (
  id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  recipient_profile_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  refund_type TEXT NOT NULL CHECK (refund_type IN ('credits', 'amount', 'percentage')),
  value DECIMAL(12, 2) NOT NULL CHECK (value >= 0),
  created_by UUID NOT NULL REFERENCES public.profiles(id) ON DELETE SET NULL,
  notes TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW() NOT NULL
);

COMMENT ON TABLE public.refunds IS 'Refunds/credits issued by billing or admin: credits (platform credits), amount ($1-$9999), or percentage.';
COMMENT ON COLUMN public.refunds.refund_type IS 'credits = platform credits; amount = dollars; percentage = 1-100.';
COMMENT ON COLUMN public.refunds.value IS 'Dollars for amount, percentage 1-100 for percentage, credit amount for credits.';

CREATE INDEX IF NOT EXISTS idx_refunds_recipient ON public.refunds(recipient_profile_id);
CREATE INDEX IF NOT EXISTS idx_refunds_created_by ON public.refunds(created_by);
CREATE INDEX IF NOT EXISTS idx_refunds_created_at ON public.refunds(created_at);

ALTER TABLE public.refunds ENABLE ROW LEVEL SECURITY;

-- Only admins can manage refunds (billing staff have role=admin; restrict by staff_role in app)
DROP POLICY IF EXISTS "Admins can view refunds" ON public.refunds;
DROP POLICY IF EXISTS "Admins can insert refunds" ON public.refunds;
CREATE POLICY "Admins can view refunds" ON public.refunds FOR SELECT TO authenticated USING (public.is_admin());
CREATE POLICY "Admins can insert refunds" ON public.refunds FOR INSERT TO authenticated WITH CHECK (public.is_admin());
