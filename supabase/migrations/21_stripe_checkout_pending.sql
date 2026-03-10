-- 21. Staging table for checkout-before-signup: when user signs up with same email, copy stripe data to profile
CREATE TABLE IF NOT EXISTS public.stripe_checkout_pending (
  email TEXT PRIMARY KEY,
  stripe_customer_id TEXT NOT NULL,
  stripe_subscription_id TEXT,
  stripe_subscription_status TEXT,
  role TEXT,
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

COMMENT ON TABLE public.stripe_checkout_pending IS 'After Stripe checkout, store by email so when user signs up we attach subscription to their profile.';

-- Trigger: when a new profile is inserted, copy stripe data from pending if email matches
CREATE OR REPLACE FUNCTION public.apply_stripe_checkout_pending()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  pending RECORD;
BEGIN
  SELECT stripe_customer_id, stripe_subscription_id, stripe_subscription_status, role
  INTO pending
  FROM public.stripe_checkout_pending
  WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email))
  LIMIT 1;
  IF FOUND THEN
    UPDATE public.profiles
    SET
      stripe_customer_id = COALESCE(pending.stripe_customer_id, stripe_customer_id),
      stripe_subscription_id = COALESCE(pending.stripe_subscription_id, stripe_subscription_id),
      stripe_subscription_status = COALESCE(pending.stripe_subscription_status, stripe_subscription_status),
      role = COALESCE(NULLIF(TRIM(pending.role), ''), role)
    WHERE id = NEW.id;
    DELETE FROM public.stripe_checkout_pending WHERE LOWER(TRIM(email)) = LOWER(TRIM(NEW.email));
  END IF;
  RETURN NEW;
END;
$$;

DROP TRIGGER IF EXISTS apply_stripe_checkout_pending_on_profiles ON public.profiles;
CREATE TRIGGER apply_stripe_checkout_pending_on_profiles
  AFTER INSERT ON public.profiles
  FOR EACH ROW
  EXECUTE FUNCTION public.apply_stripe_checkout_pending();
