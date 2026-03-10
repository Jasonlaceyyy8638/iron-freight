-- 20. Subscription status for paywall: require active/trialing to access dashboard after trial
ALTER TABLE public.profiles
  ADD COLUMN IF NOT EXISTS stripe_subscription_id TEXT,
  ADD COLUMN IF NOT EXISTS stripe_subscription_status TEXT;

CREATE INDEX IF NOT EXISTS idx_profiles_stripe_subscription_id ON public.profiles(stripe_subscription_id)
  WHERE stripe_subscription_id IS NOT NULL;

COMMENT ON COLUMN public.profiles.stripe_subscription_id IS 'Stripe Subscription ID; set on checkout, used to enforce access after trial.';
COMMENT ON COLUMN public.profiles.stripe_subscription_status IS 'Stripe subscription status: active, trialing, past_due, canceled, etc. Dashboard access only when active or trialing.';
