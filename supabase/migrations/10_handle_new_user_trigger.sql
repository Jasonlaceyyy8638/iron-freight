-- 10. Create profile (and optional carrier) on sign-up so RLS doesn't block the insert
-- Trigger runs with SECURITY DEFINER and bypasses RLS. App passes role (and MC/DOT for carrier) in signUp options.

-- Ensure 'admin' is allowed in profiles.role (fixes "Database error saving new user" for staff signup)
DO $$
BEGIN
  ALTER TABLE public.profiles DROP CONSTRAINT IF EXISTS profiles_role_check;
  ALTER TABLE public.profiles ADD CONSTRAINT profiles_role_check
    CHECK (role IN ('broker', 'carrier', 'shipper', 'driver', 'admin'));
EXCEPTION WHEN OTHERS THEN NULL;
END $$;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger AS $$
DECLARE
  meta jsonb;
  r text;
  fn text;
  mn text;
  dn text;
  ln text;
BEGIN
  meta := COALESCE(NEW.raw_user_meta_data, '{}'::jsonb);
  r := COALESCE(meta->>'role', 'broker');
  fn := meta->>'full_name';
  mn := meta->>'mc_number';
  dn := meta->>'dot_number';
  ln := meta->>'legal_name';

  INSERT INTO public.profiles (id, email, full_name, role)
  VALUES (NEW.id, COALESCE(NEW.email, ''), NULLIF(trim(fn), ''), r);

  IF (mn IS NOT NULL AND trim(mn) <> '') OR (dn IS NOT NULL AND trim(dn) <> '') THEN
    BEGIN
      UPDATE public.profiles SET mc_number = NULLIF(trim(mn), ''), dot_number = NULLIF(trim(dn), '') WHERE id = NEW.id;
    EXCEPTION WHEN OTHERS THEN NULL;
    END;
  END IF;

  IF r = 'carrier' AND mn IS NOT NULL AND trim(mn) <> '' THEN
    INSERT INTO public.carriers (profile_id, legal_name, mc_number, dot_number)
    VALUES (
      NEW.id,
      COALESCE(NULLIF(trim(ln), ''), NULLIF(trim(fn), ''), NEW.email, ''),
      trim(mn),
      NULLIF(trim(dn), '')
    );
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();
