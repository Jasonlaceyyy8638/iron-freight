-- 17. Store Stripe customer ID on profiles for broker $10/verified-load invoice items
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_customer_id TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_customer ON public.profiles(stripe_customer_id)
  WHERE stripe_customer_id IS NOT NULL;

COMMENT ON COLUMN public.profiles.stripe_customer_id IS 'Stripe Customer ID; set when user completes checkout. Used to add $10 IronGate verification invoice items for brokers.';
