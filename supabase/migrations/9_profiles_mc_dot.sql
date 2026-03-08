-- 9. Broker MC/DOT on profiles (for brokers; carriers use carriers.mc_number/dot_number)
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='mc_number') THEN
    ALTER TABLE public.profiles ADD COLUMN mc_number TEXT;
  END IF;
  IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_schema='public' AND table_name='profiles' AND column_name='dot_number') THEN
    ALTER TABLE public.profiles ADD COLUMN dot_number TEXT;
  END IF;
END $$;
