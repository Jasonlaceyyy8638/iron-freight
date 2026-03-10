# Stripe setup for IronFreight

## 1. What to call the payments (products & prices)

Create **one Stripe Product per role**, each with **two recurring Prices** (Monthly and Yearly). Use these names so they match the links you send.

| Role    | Product name (in Stripe)   | Price 1      | Price 2     |
|---------|----------------------------|-------------|-------------|
| Broker  | **IronFreight Broker**     | Monthly     | Yearly      |
| Carrier | **IronFreight Carrier**    | Monthly     | Yearly      |
| Shipper | **IronFreight Shipper**    | Monthly     | Yearly      |

- In Stripe: **Products** → Create product (e.g. “IronFreight Broker”) → **Add price** (recurring Monthly) → **Add another price** (recurring Yearly). Repeat for Carrier and Shipper.
- Copy each **Price ID** (`price_xxx`) into `.env.local` (see below). The app applies a **7-day free trial** at checkout; you do **not** need to set the trial on the Price in Stripe.

## 2. Subscribe links (what to send to Broker / Carrier / Shipper)

Each link goes to your site and then redirects to Stripe Checkout with the right price and **7-day trial**.

| Recipient | Monthly link | Yearly link |
|-----------|--------------|-------------|
| **Broker**  | `https://your-domain.com/subscribe/broker/monthly`  | `https://your-domain.com/subscribe/broker/yearly`  |
| **Carrier** | `https://your-domain.com/subscribe/carrier/monthly` | `https://your-domain.com/subscribe/carrier/yearly` |
| **Shipper** | `https://your-domain.com/subscribe/shipper/monthly` | `https://your-domain.com/subscribe/shipper/yearly` |

Use these in emails, quote follow-ups, or dashboard. Each link is tied to that role’s set pricing (the Price IDs you set in env).

## 3. Env vars (add to `.env.local`)

```bash
STRIPE_PUBLISHABLE_KEY=pk_test_...   # or pk_live_...
STRIPE_SECRET_KEY=sk_test_...        # or sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...     # after creating webhook endpoint

# Price IDs – from Stripe Dashboard → Products → [IronFreight Broker/Carrier/Shipper] → copy Price ID
STRIPE_PRICE_BROKER_MONTHLY=price_...
STRIPE_PRICE_BROKER_YEARLY=price_...
STRIPE_PRICE_BROKER_VERIFICATION_METERED=price_...   # metered $10/unit, monthly (brokers only)
STRIPE_PRICE_CARRIER_MONTHLY=price_...
STRIPE_PRICE_CARRIER_YEARLY=price_...
STRIPE_PRICE_SHIPPER_MONTHLY=price_...
STRIPE_PRICE_SHIPPER_YEARLY=price_...
```

Get API keys: [Stripe Dashboard → Developers → API keys](https://dashboard.stripe.com/apikeys).

## 4. 7-day trial

The app adds a **7-day free trial** when creating Checkout for role-based links (`/subscribe/{role}/{interval}`). No need to configure trial on the Price in Stripe. After 7 days, Stripe charges according to the chosen price (monthly or yearly).

## 5. API summary

| Purpose | Call / link |
|--------|-------------|
| **Link for emails** | Use `getSubscribeUrl(role, interval)` from `@/lib/stripe-prices` (e.g. in quote or invite emails), or build manually: `{NEXT_PUBLIC_SITE_URL}/subscribe/{role}/{interval}`. |
| **Create checkout (role + interval)** | `POST /api/stripe/create-checkout-session` with body `{ "role": "broker", "interval": "monthly" }` (or `yearly`). Returns `{ url }`; redirect user to `url`. Trial is applied automatically. |
| **Create checkout (raw price)** | `POST /api/stripe/create-checkout-session` with body `{ "priceId": "price_xxx" }`. No trial unless you add it. |
| **Webhook** | `POST /api/stripe/webhook` – configure in Stripe (Developers → Webhooks). Handle `checkout.session.completed`, `customer.subscription.updated`, etc. |

## 6. Suggested flow

1. **Stripe Dashboard**: Create 3 products (IronFreight Broker, Carrier, Shipper), each with Monthly and Yearly recurring prices. Copy the 6 Price IDs into `.env.local`.
2. **Emails / UI**: Send the subscribe link for the right role and interval (e.g. broker monthly: `https://yoursite.com/subscribe/broker/monthly`).
3. **User clicks link** → your site loads `/subscribe/broker/monthly` → page calls the API with `role` + `interval` → redirect to Stripe Checkout (with 7-day trial).
4. **Webhook**: Save `customer_id` to the profile when you receive `checkout.session.completed` (matched by customer email). This is used for the $10/verified-load charge below.

---

## 7. $10 per successfully verified load (brokers only) — charged monthly

Brokers are charged **$10** per load when the driver completes identity verification at pickup. These charges are **invoiced every month** for all brokers, including those on a **yearly** platform plan.

**How it works**

- When a **broker** completes checkout (monthly or yearly), the webhook (1) saves their **Stripe Customer ID** on `profiles.stripe_customer_id`, and (2) creates a **second Stripe subscription**: a **metered** price ($10/unit) that **bills monthly**. The webhook stores that subscription's item ID on `profiles.stripe_verification_subscription_item_id`.
- When a load is verified, the app reports **usage** to that metered subscription (`quantity: 1`). Stripe aggregates usage and **invoices the broker once per month** for that subscription (e.g. 5 loads × $10 = $50). So yearly brokers get their **platform** fee once a year and their **verification** charges once a month.
- If a broker doesn't have the metered subscription yet (e.g. subscribed before this was set up), the app falls back to adding a **$10 invoice item** to their Stripe customer; that attaches to their next subscription invoice (monthly or yearly).

**What you need to do in Stripe**

- Create a **metered price** for brokers: Product "IronFreight Broker Verification" (or add to your Broker product) → **Add price** → **Recurring** → **Monthly** → **Usage type: Metered** → **Price: $10.00 per unit**. Copy the Price ID.
- In `.env.local` set **`STRIPE_PRICE_BROKER_VERIFICATION_METERED=price_xxx`**.

**Migrations**

- Run `17_profiles_stripe_customer_id.sql` and `18_profiles_stripe_verification_subscription_item.sql` so `profiles` has `stripe_customer_id` and `stripe_verification_subscription_item_id`.

**Webhook**

- `checkout.session.completed` must run and have access to `STRIPE_PRICE_BROKER_MONTHLY`, `STRIPE_PRICE_BROKER_YEARLY`, and `STRIPE_PRICE_BROKER_VERIFICATION_METERED` so it can create the metered subscription for brokers. `SUPABASE_SERVICE_ROLE_KEY` and `NEXT_PUBLIC_SUPABASE_URL` must be set.

**If a broker has no metered subscription** (e.g. they subscribed before this was set up), the app still adds a $10 invoice item to their next subscription invoice. If they have no `stripe_customer_id`, the verification email sends but no charge is created.
