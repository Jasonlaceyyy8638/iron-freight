import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { getStripe } from '@/lib/stripe'
import { getPriceId, type SubscriptionRole } from '@/lib/stripe-prices'

const TRIAL_DAYS = 7
const VALID_ROLES: SubscriptionRole[] = ['broker', 'carrier', 'shipper']

/**
 * POST /api/stripe/start-trial
 * Body: { email: string, role: 'broker'|'carrier'|'shipper' }
 * Creates a Stripe subscription with 7-day trial and no payment method required.
 * Updates profile with stripe_customer_id, stripe_subscription_id, stripe_subscription_status.
 */
export async function POST(request: Request) {
  try {
    const stripe = getStripe()
    const body = await request.json().catch(() => ({}))
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    const role = VALID_ROLES.includes(body.role) ? body.role : null

    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }
    if (!role) {
      return NextResponse.json({ error: 'role must be broker, carrier, or shipper' }, { status: 400 })
    }

    const priceId = getPriceId(role, 'monthly')
    if (!priceId) {
      return NextResponse.json(
        { error: `Price not configured for ${role}/monthly. Set STRIPE_PRICE_${role.toUpperCase()}_MONTHLY in .env.` },
        { status: 400 }
      )
    }

    let customerId: string
    const existing = await stripe.customers.list({ email, limit: 1 })
    if (existing.data.length > 0) {
      customerId = existing.data[0].id
    } else {
      const customer = await stripe.customers.create({ email })
      customerId = customer.id
    }

    const subscription = await stripe.subscriptions.create({
      customer: customerId,
      items: [{ price: priceId, quantity: 1 }],
      trial_period_days: TRIAL_DAYS,
    })

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (supabaseUrl && serviceKey) {
      const supabase = createClient(supabaseUrl, serviceKey)
      const { data: updated } = await supabase
        .from('profiles')
        .update({
          stripe_customer_id: customerId,
          stripe_subscription_id: subscription.id,
          stripe_subscription_status: subscription.status,
        })
        .eq('email', email)
        .select('id')
      if (!updated?.length) {
        await supabase.from('stripe_checkout_pending').upsert(
          {
            email,
            stripe_customer_id: customerId,
            stripe_subscription_id: subscription.id,
            stripe_subscription_status: subscription.status,
            role,
          },
          { onConflict: 'email' }
        )
      }
    }

    return NextResponse.json({ ok: true, message: '7-day trial started' })
  } catch (err) {
    console.error('Stripe start-trial error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to start trial' },
      { status: 500 }
    )
  }
}
