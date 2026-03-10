import { NextResponse } from 'next/server'
import { getStripe } from '@/lib/stripe'
import { getPriceId, type SubscriptionRole, type SubscriptionInterval } from '@/lib/stripe-prices'

const TRIAL_DAYS = 7
const VALID_ROLES: SubscriptionRole[] = ['broker', 'carrier', 'shipper']
const VALID_INTERVALS: SubscriptionInterval[] = ['monthly', 'yearly']

/**
 * POST /api/stripe/create-checkout-session
 * Body (option A – role-based): { role: 'broker'|'carrier'|'shipper', interval: 'monthly'|'yearly', successUrl?, cancelUrl?, clientReferenceId? }
 * Body (option B – raw): { priceId: string, successUrl?, cancelUrl?, clientReferenceId? }
 * Creates a Stripe Checkout session (with 7-day trial for role-based) and returns { url }.
 */
export async function POST(request: Request) {
  try {
    const stripe = getStripe()
    const body = await request.json().catch(() => ({}))
    const baseUrl =
      process.env.NEXT_PUBLIC_SITE_URL ||
      (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
    const successUrl = typeof body.successUrl === 'string' && body.successUrl ? body.successUrl : `${baseUrl}/login?checkout=success`
    const cancelUrl = typeof body.cancelUrl === 'string' && body.cancelUrl ? body.cancelUrl : `${baseUrl}/dashboard?checkout=cancelled`
    const clientReferenceId = typeof body.clientReferenceId === 'string' ? body.clientReferenceId : undefined

    let priceId: string | null = null
    let trialPeriodDays: number | undefined = TRIAL_DAYS

    const role = VALID_ROLES.includes(body.role) ? body.role : null
    const interval = VALID_INTERVALS.includes(body.interval) ? body.interval : null
    if (role && interval) {
      priceId = getPriceId(role, interval)
      if (!priceId) {
        return NextResponse.json(
          { error: `Price not configured for ${role}/${interval}. Set STRIPE_PRICE_${role.toUpperCase()}_${interval.toUpperCase()} in .env.` },
          { status: 400 }
        )
      }
    } else {
      trialPeriodDays = undefined
      const raw = typeof body.priceId === 'string' ? body.priceId.trim() : ''
      if (!raw || !raw.startsWith('price_')) {
        return NextResponse.json(
          { error: 'Either (role + interval) or priceId (e.g. price_xxx) is required.' },
          { status: 400 }
        )
      }
      priceId = raw
    }

    const session = await stripe.checkout.sessions.create({
      mode: 'subscription',
      line_items: [{ price: priceId!, quantity: 1 }],
      success_url: successUrl,
      cancel_url: cancelUrl,
      client_reference_id: clientReferenceId,
      allow_promotion_codes: true,
      subscription_data: trialPeriodDays ? { trial_period_days: trialPeriodDays } : undefined,
    })

    return NextResponse.json({ url: session.url })
  } catch (err) {
    console.error('Stripe create-checkout-session error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to create checkout session' },
      { status: 500 }
    )
  }
}
