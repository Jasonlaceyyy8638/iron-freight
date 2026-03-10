/**
 * $10 per successfully verified load for brokers.
 * Prefer metered subscription (monthly invoice) when broker has stripe_verification_subscription_item_id;
 * otherwise fall back to invoice item (adds to next subscription invoice, which is yearly for yearly brokers).
 */
import { getStripe } from './stripe'

const VERIFICATION_CHARGE_CENTS = 1000 // $10
const CURRENCY = 'usd'

/** Report usage to a metered subscription item (Stripe REST API; SDK removed createUsageRecord in v18+). */
async function createUsageRecord(subscriptionItemId: string, quantity: number, timestamp: number): Promise<void> {
  const secretKey = process.env.STRIPE_SECRET_KEY
  if (!secretKey) throw new Error('STRIPE_SECRET_KEY is not set')
  const body = new URLSearchParams({
    quantity: String(quantity),
    timestamp: String(timestamp),
  })
  const res = await fetch(`https://api.stripe.com/v1/subscription_items/${subscriptionItemId}/usage_records`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${secretKey}`,
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: body.toString(),
  })
  if (!res.ok) {
    const err = await res.text()
    throw new Error(err || `Stripe API ${res.status}`)
  }
}

export async function reportVerificationCharge(params: {
  /** When set, report usage to this subscription item → broker gets a monthly invoice for verification charges. */
  stripeVerificationSubscriptionItemId?: string | null
  /** Fallback: add $10 invoice item to customer (attaches to next subscription invoice). */
  stripeCustomerId?: string | null
  loadNumber: string
}): Promise<{ ok: boolean; error?: string }> {
  const stripe = getStripe()

  if (params.stripeVerificationSubscriptionItemId) {
    try {
      await createUsageRecord(
        params.stripeVerificationSubscriptionItemId,
        1,
        Math.floor(Date.now() / 1000)
      )
      return { ok: true }
    } catch (err) {
      console.error('Stripe verification usage record error:', err)
      return { ok: false, error: err instanceof Error ? err.message : 'Failed to report usage' }
    }
  }

  if (params.stripeCustomerId) {
    try {
      await stripe.invoiceItems.create({
        customer: params.stripeCustomerId,
        amount: VERIFICATION_CHARGE_CENTS,
        currency: CURRENCY,
        description: `IronGate verification — Load #${params.loadNumber}`,
      })
      return { ok: true }
    } catch (err) {
      console.error('Stripe verification invoice item error:', err)
      return { ok: false, error: err instanceof Error ? err.message : 'Failed to create invoice item' }
    }
  }

  return { ok: false, error: 'No Stripe billing ID for broker' }
}
