/**
 * Role-based Stripe Price IDs. Set in .env: STRIPE_PRICE_BROKER_MONTHLY, etc.
 * Used to build subscribe links: Broker/Carrier/Shipper × Monthly/Yearly (7-day trial in checkout).
 */
export type SubscriptionRole = 'broker' | 'carrier' | 'shipper'
export type SubscriptionInterval = 'monthly' | 'yearly'

const KEY_MAP: Record<SubscriptionRole, Record<SubscriptionInterval, string>> = {
  broker: {
    monthly: 'STRIPE_PRICE_BROKER_MONTHLY',
    yearly: 'STRIPE_PRICE_BROKER_YEARLY',
  },
  carrier: {
    monthly: 'STRIPE_PRICE_CARRIER_MONTHLY',
    yearly: 'STRIPE_PRICE_CARRIER_YEARLY',
  },
  shipper: {
    monthly: 'STRIPE_PRICE_SHIPPER_MONTHLY',
    yearly: 'STRIPE_PRICE_SHIPPER_YEARLY',
  },
}

export function getPriceId(role: SubscriptionRole, interval: SubscriptionInterval): string | null {
  const key = KEY_MAP[role]?.[interval]
  if (!key) return null
  const value = process.env[key]?.trim()
  return value && value.startsWith('price_') ? value : null
}

export function getSubscribePath(role: SubscriptionRole, interval: SubscriptionInterval): string {
  return `/subscribe/${role}/${interval}`
}

/** Base URL for subscribe links in emails (e.g. https://yoursite.com/subscribe/broker/monthly) */
export function getSubscribeUrl(role: SubscriptionRole, interval: SubscriptionInterval): string {
  const base =
    process.env.NEXT_PUBLIC_SITE_URL ||
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')
  return `${base.replace(/\/$/, '')}${getSubscribePath(role, interval)}`
}
