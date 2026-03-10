/**
 * Server-side Stripe client. Use only in API routes or server components.
 * Never expose STRIPE_SECRET_KEY to the browser.
 */
import Stripe from 'stripe'

const secretKey = process.env.STRIPE_SECRET_KEY
if (!secretKey && process.env.NODE_ENV === 'production') {
  console.warn('STRIPE_SECRET_KEY is not set; Stripe API calls will fail.')
}

export const stripe = secretKey ? new Stripe(secretKey) : (null as unknown as Stripe)

export function getStripe(): Stripe {
  if (!stripe) throw new Error('STRIPE_SECRET_KEY is not set')
  return stripe
}
