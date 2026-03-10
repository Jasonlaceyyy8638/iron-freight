-- 22. Add 'gate' token type for IronGate dock verification
-- Gate tokens: driver requests one token per load; valid 15 min from creation; single-use.
-- Constraint name may be qr_tokens_token_type_check (Postgres default for column CHECK).
ALTER TABLE public.qr_tokens
  DROP CONSTRAINT IF EXISTS qr_tokens_token_type_check;

ALTER TABLE public.qr_tokens
  ADD CONSTRAINT qr_tokens_token_type_check
  CHECK (token_type IN ('pickup', 'delivery', 'gate'));
