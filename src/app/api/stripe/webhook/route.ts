import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'
import { getStripe } from '@/lib/stripe'

/**
 * POST /api/stripe/webhook
 * Stripe sends events here. Add this URL in Dashboard → Developers → Webhooks.
 * Set STRIPE_WEBHOOK_SECRET to the signing secret from that endpoint.
 */
export async function POST(request: Request) {
  try {
    const stripe = getStripe()
    const body = await request.text()
    const headersList = await headers()
    const signature = headersList.get('stripe-signature')
    const secret = process.env.STRIPE_WEBHOOK_SECRET
    if (!secret || !signature) {
      return NextResponse.json({ error: 'Webhook secret or signature missing' }, { status: 400 })
    }

    let event: Stripe.Event
    try {
      event = stripe.webhooks.constructEvent(body, signature, secret)
    } catch (err) {
      console.error('Stripe webhook signature verification failed:', err)
      return NextResponse.json({ error: 'Invalid signature' }, { status: 400 })
    }

    switch (event.type) {
      case 'checkout.session.completed': {
        const session = event.data.object as Stripe.Checkout.Session
        const customerId = typeof session.customer === 'string' ? session.customer : session.customer?.id
        if (!customerId) break
        try {
          const customer = await stripe.customers.retrieve(customerId)
          const email = (customer as Stripe.Customer).email?.trim().toLowerCase()
          if (!email) break
          const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
          const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
          if (supabaseUrl && serviceKey) {
            const supabase = createClient(supabaseUrl, serviceKey)
            await supabase.from('profiles').update({ stripe_customer_id: customerId }).eq('email', email)

            // If this is a broker subscription, add a second monthly metered subscription for $10/verified load
            const subscriptionId = typeof session.subscription === 'string' ? session.subscription : session.subscription?.id
            const meteredPriceId = process.env.STRIPE_PRICE_BROKER_VERIFICATION_METERED?.trim()
            if (subscriptionId && meteredPriceId?.startsWith('price_')) {
              const sub = await stripe.subscriptions.retrieve(subscriptionId, { expand: ['items.data.price'] })
              const firstPriceId = sub.items.data[0]?.price?.id
              const brokerMonthly = process.env.STRIPE_PRICE_BROKER_MONTHLY?.trim()
              const brokerYearly = process.env.STRIPE_PRICE_BROKER_YEARLY?.trim()
              const isBroker = firstPriceId === brokerMonthly || firstPriceId === brokerYearly
              if (isBroker) {
                const meteredSub = await stripe.subscriptions.create({
                  customer: customerId,
                  items: [{ price: meteredPriceId }],
                })
                const verificationItemId = meteredSub.items.data[0]?.id
                if (verificationItemId) {
                  await supabase.from('profiles').update({ stripe_verification_subscription_item_id: verificationItemId }).eq('email', email)
                }
              }
            }
          }
        } catch (e) {
          console.error('Webhook: checkout.session.completed', e)
        }
        break
      }
      case 'customer.subscription.updated':
      case 'customer.subscription.deleted': {
        const sub = event.data.object as Stripe.Subscription
        console.log('Subscription updated:', sub.id, sub.status)
        break
      }
      case 'invoice.paid':
      case 'invoice.payment_failed': {
        const invoice = event.data.object as Stripe.Invoice
        console.log('Invoice:', event.type, invoice.id)
        break
      }
      default:
        console.log('Unhandled Stripe event:', event.type)
    }

    return NextResponse.json({ received: true })
  } catch (err) {
    console.error('Stripe webhook error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Webhook handler failed' },
      { status: 500 }
    )
  }
}
