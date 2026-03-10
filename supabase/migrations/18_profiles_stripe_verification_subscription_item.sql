-- 18. Broker monthly $10/load: Stripe subscription item ID for metered usage (billed monthly even on yearly plan)
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_verification_subscription_item_id TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_verification_si ON public.profiles(stripe_verification_subscription_item_id)
  WHERE stripe_verification_subscription_item_id IS NOT NULL;

COMMENT ON COLUMN public.profiles.stripe_verification_subscription_item_id IS 'Stripe Subscription Item ID for broker metered $10/verified-load; used to report usage monthly.';
