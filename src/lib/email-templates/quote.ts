/**
 * Role-based pricing quote emails: Broker (Shield), Carrier (Elite), Shipper (Gatekeeper).
 * Theme: Dark #0A0A0B, accent #C1FF00, professional sans-serif.
 */

import { buildEmailLayout } from './layout'
import { getEmailFooterText } from './footer'
import { EMAIL } from './constants'

const BG_DARK = '#0A0A0B'

export type QuoteRole = 'broker' | 'carrier' | 'shipper'

const PRICING_TABLE_STYLE = `margin: 20px 0; background-color: #1A1A1A; border-radius: 8px; border: 1px solid ${EMAIL.BORDER};`
const ROW_STYLE = `padding: 12px 20px; color: ${EMAIL.TEXT_MUTED}; font-size: 14px; line-height: 1.6; border-top: 1px solid ${EMAIL.BORDER};`

const QUOTE_CONFIG: Record<
  QuoteRole,
  { subject: string; preheader: string; bodyIntro: string; pricingHtml: string; ctaLabel: string }
> = {
  broker: {
    subject: 'Your IronFreight Brokerage Quote: Securing Your Pipeline',
    preheader: 'Your IronFreight brokerage quote and pricing.',
    bodyIntro: `Thank you for your interest in IronFreight. As a Broker, your reputation is your most valuable asset. Our <strong style="color: ${EMAIL.BRAND};">Ironclad Shield</strong> package is designed to protect it.`,
    pricingHtml: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="${PRICING_TABLE_STYLE}">
        <tr><td style="padding: 16px 20px; color: ${EMAIL.TEXT}; font-size: 14px;"><strong style="color: ${EMAIL.BRAND};">Pricing</strong></td></tr>
        <tr><td style="${ROW_STYLE}"><strong style="color: ${EMAIL.TEXT};">Monthly:</strong> $299/mo — Platform subscription (includes unlimited carrier vetting). IronGate Verification: <strong style="color: ${EMAIL.TEXT};">$10</strong> per successfully verified load.</td></tr>
        <tr><td style="${ROW_STYLE}"><strong style="color: ${EMAIL.TEXT};">Annual:</strong> $2,990/year — <strong style="color: ${EMAIL.BRAND};">Save 2 months:</strong> pay for 10 months, get 12. Same platform and $10/verified load. Billed annually.</td></tr>
      </table>
      <p style="margin: 0 0 8px; color: ${EMAIL.TEXT_MUTED}; font-size: 13px;">Choose annual billing and your first year includes two months free. This investment pays for itself the moment we stop a single unauthorized pickup.</p>
    `,
    ctaLabel: 'Schedule a 10-Minute Demo',
  },
  carrier: {
    subject: 'IronFreight Carrier Access: Join the Elite Verified Fleet',
    preheader: 'Join the Iron-Verified carrier fleet.',
    bodyIntro: `IronFreight is where high-quality carriers go to win premium freight. By becoming an <strong style="color: ${EMAIL.BRAND};">Iron-Verified</strong> carrier, you distinguish yourself from the sea of unvetted competition.`,
    pricingHtml: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="${PRICING_TABLE_STYLE}">
        <tr><td style="padding: 16px 20px; color: ${EMAIL.TEXT}; font-size: 14px;"><strong style="color: ${EMAIL.BRAND};">Pricing</strong></td></tr>
        <tr><td style="${ROW_STYLE}"><strong style="color: ${EMAIL.TEXT};">Monthly:</strong> $99/mo per MC Number. Driver App: <strong style="color: ${EMAIL.TEXT};">Always Free</strong>.</td></tr>
        <tr><td style="${ROW_STYLE}"><strong style="color: ${EMAIL.TEXT};">Annual:</strong> $990/year — <strong style="color: ${EMAIL.BRAND};">2 months free:</strong> pay for 10 months, get 12. Billed annually. Driver App remains free.</td></tr>
      </table>
      <p style="margin: 0 0 8px; color: ${EMAIL.TEXT_MUTED}; font-size: 13px;">Your membership includes identity protection and priority access to loads from our top-tier Broker network. Select annual billing to lock in two months free.</p>
    `,
    ctaLabel: 'Get Elite Access',
  },
  shipper: {
    subject: 'IronFreight Warehouse Solutions: Automated Gate Security',
    preheader: 'IronGate Scanner for your facility.',
    bodyIntro: `Streamlining your dock operations starts here. The <strong style="color: ${EMAIL.BRAND};">IronGate Scanner</strong> eliminates manual paperwork and secures your facility against cargo theft.`,
    pricingHtml: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="${PRICING_TABLE_STYLE}">
        <tr><td style="padding: 16px 20px; color: ${EMAIL.TEXT}; font-size: 14px;"><strong style="color: ${EMAIL.BRAND};">Pricing</strong></td></tr>
        <tr><td style="${ROW_STYLE}"><strong style="color: ${EMAIL.TEXT};">Monthly:</strong> $79/mo per location. Includes: Unlimited QR scans, geofenced gate logs, and real-time driver ID verification.</td></tr>
        <tr><td style="${ROW_STYLE}"><strong style="color: ${EMAIL.TEXT};">Annual:</strong> $790/year — <strong style="color: ${EMAIL.BRAND};">2 months free:</strong> pay for 10 months, get 12. Same features. Billed annually.</td></tr>
      </table>
      <p style="margin: 0 0 8px; color: ${EMAIL.TEXT_MUTED}; font-size: 13px;">Choose annual billing and receive two months free on your facility license. Ready to clear your dock in 3 seconds?</p>
    `,
    ctaLabel: 'Finalize Facility Setup',
  },
}

export function buildQuoteEmail(params: {
  name: string
  role: QuoteRole
  /** Single CTA URL (used when monthly/yearly not provided) */
  ctaUrl?: string
  /** Subscribe monthly URL – when set with yearlyUrl, shows "Pay monthly" / "Pay yearly" buttons to Stripe */
  monthlySubscribeUrl?: string
  /** Subscribe yearly URL */
  yearlySubscribeUrl?: string
  /** Logo img src – use 'cid:ironfreight-logo' when logo is attached inline (recommended for Outlook) */
  logoSrc?: string
}): { subject: string; html: string; text: string } {
  const { name, role, ctaUrl, monthlySubscribeUrl, yearlySubscribeUrl, logoSrc } = params
  const config = QUOTE_CONFIG[role]
  const greeting = `Hello ${name},`
  const useSubscribeButtons = Boolean(monthlySubscribeUrl && yearlySubscribeUrl)

  const bodyHtml = `
    <p style="margin: 0 0 16px;">${greeting}</p>
    <p style="margin: 0 0 16px;">${config.bodyIntro}</p>
    ${config.pricingHtml}
    <p style="margin: 0 0 8px; color: ${EMAIL.TEXT_MUTED}; font-size: 14px;">${useSubscribeButtons ? 'Choose your plan below to get started.' : 'Use the button below to take the next step.'}</p>
  `.trim()

  const html = buildEmailLayout({
    preheader: config.preheader,
    bodyHtml,
    ctaLabel: useSubscribeButtons ? undefined : config.ctaLabel,
    ctaUrl: useSubscribeButtons ? undefined : ctaUrl,
    monthlyUrl: monthlySubscribeUrl,
    yearlyUrl: yearlySubscribeUrl,
    backgroundColor: BG_DARK,
    logoSrc,
  })

  const pricingText: Record<QuoteRole, string> = {
    broker: 'Monthly: $299/mo (platform + unlimited carrier vetting; IronGate $10/verified load). Annual: $2,990/year — save 2 months free (pay for 10, get 12).',
    carrier: 'Monthly: $99/mo per MC Number. Driver App: Always Free. Annual: $990/year — 2 months free (pay for 10, get 12).',
    shipper: 'Monthly: $79/mo per location (unlimited QR scans, geofenced logs, driver ID verification). Annual: $790/year — 2 months free (pay for 10, get 12).',
  }

  const ctaLines = useSubscribeButtons
    ? [`Pay monthly: ${monthlySubscribeUrl}`, `Pay yearly (save 2 months): ${yearlySubscribeUrl}`]
    : [config.ctaLabel + ':', ctaUrl || '']
  const text = [
    greeting,
    '',
    config.bodyIntro.replace(/<[^>]+>/g, ''),
    '',
    'Current Pricing Structure:',
    pricingText[role],
    '',
    ...ctaLines,
    '',
    getEmailFooterText(),
  ].join('\n')

  return { subject: config.subject, html, text }
}
