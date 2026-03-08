/**
 * Role-based pricing quote emails: Broker (Shield), Carrier (Elite), Shipper (Gatekeeper).
 * Theme: Dark #0A0A0B, accent #C1FF00, professional sans-serif.
 */

import { buildEmailLayout } from './layout'
import { getEmailFooterText } from './footer'
import { EMAIL } from './constants'

const BG_DARK = '#0A0A0B'

export type QuoteRole = 'broker' | 'carrier' | 'shipper'

const QUOTE_CONFIG: Record<
  QuoteRole,
  { subject: string; preheader: string; bodyIntro: string; pricingHtml: string; ctaLabel: string }
> = {
  broker: {
    subject: 'Your IronFreight Brokerage Quote: Securing Your Pipeline',
    preheader: 'Your IronFreight brokerage quote and pricing.',
    bodyIntro: `Thank you for your interest in IronFreight. As a Broker, your reputation is your most valuable asset. Our <strong style="color: ${EMAIL.BRAND};">Ironclad Shield</strong> package is designed to protect it.`,
    pricingHtml: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; background-color: #1a1f26; border-radius: 8px; border: 1px solid ${EMAIL.BORDER};">
        <tr><td style="padding: 16px 20px; color: ${EMAIL.TEXT}; font-size: 14px;"><strong style="color: ${EMAIL.BRAND};">Current Pricing Structure</strong></td></tr>
        <tr><td style="padding: 0 20px 16px; color: ${EMAIL.TEXT_MUTED}; font-size: 14px; line-height: 1.6;">Platform Subscription: <strong style="color: ${EMAIL.TEXT};">$299/mo</strong> (includes unlimited carrier vetting).<br>IronGate Verification: <strong style="color: ${EMAIL.TEXT};">$10</strong> per successfully verified load.</td></tr>
      </table>
      <p style="margin: 0 0 8px;">This investment pays for itself the moment we stop a single unauthorized pickup. Shall we schedule a 10-minute demo to walk through the Audit Vault?</p>
    `,
    ctaLabel: 'Schedule a 10-Minute Demo',
  },
  carrier: {
    subject: 'IronFreight Carrier Access: Join the Elite Verified Fleet',
    preheader: 'Join the Iron-Verified carrier fleet.',
    bodyIntro: `IronFreight is where high-quality carriers go to win premium freight. By becoming an <strong style="color: ${EMAIL.BRAND};">Iron-Verified</strong> carrier, you distinguish yourself from the sea of unvetted competition.`,
    pricingHtml: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; background-color: #1a1f26; border-radius: 8px; border: 1px solid ${EMAIL.BORDER};">
        <tr><td style="padding: 16px 20px; color: ${EMAIL.TEXT}; font-size: 14px;"><strong style="color: ${EMAIL.BRAND};">Current Pricing Structure</strong></td></tr>
        <tr><td style="padding: 0 20px 16px; color: ${EMAIL.TEXT_MUTED}; font-size: 14px; line-height: 1.6;">Verified Fleet Membership: <strong style="color: ${EMAIL.TEXT};">$79/mo</strong> per MC Number.<br>Driver App: <strong style="color: ${EMAIL.TEXT};">Always Free</strong>.</td></tr>
      </table>
      <p style="margin: 0 0 8px;">Your membership includes identity protection and priority access to loads from our top-tier Broker network.</p>
    `,
    ctaLabel: 'Get Elite Access',
  },
  shipper: {
    subject: 'IronFreight Warehouse Solutions: Automated Gate Security',
    preheader: 'IronGate Scanner for your facility.',
    bodyIntro: `Streamlining your dock operations starts here. The <strong style="color: ${EMAIL.BRAND};">IronGate Scanner</strong> eliminates manual paperwork and secures your facility against cargo theft.`,
    pricingHtml: `
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="margin: 20px 0; background-color: #1a1f26; border-radius: 8px; border: 1px solid ${EMAIL.BORDER};">
        <tr><td style="padding: 16px 20px; color: ${EMAIL.TEXT}; font-size: 14px;"><strong style="color: ${EMAIL.BRAND};">Current Pricing Structure</strong></td></tr>
        <tr><td style="padding: 0 20px 16px; color: ${EMAIL.TEXT_MUTED}; font-size: 14px; line-height: 1.6;">Facility License: <strong style="color: ${EMAIL.TEXT};">$99/mo</strong> per location.<br>Includes: Unlimited QR scans, Geofenced gate logs, and real-time driver ID verification.</td></tr>
      </table>
      <p style="margin: 0 0 8px;">Ready to clear your dock in 3 seconds? Click below to finalize your facility setup.</p>
    `,
    ctaLabel: 'Finalize Facility Setup',
  },
}

export function buildQuoteEmail(params: {
  name: string
  role: QuoteRole
  ctaUrl: string
}): { subject: string; html: string; text: string } {
  const { name, role, ctaUrl } = params
  const config = QUOTE_CONFIG[role]
  const greeting = `Hello ${name},`

  const bodyHtml = `
    <p style="margin: 0 0 16px;">${greeting}</p>
    <p style="margin: 0 0 16px;">${config.bodyIntro}</p>
    ${config.pricingHtml}
    <p style="margin: 0 0 8px; color: ${EMAIL.TEXT_MUTED}; font-size: 14px;">Use the button below to take the next step.</p>
  `.trim()

  const html = buildEmailLayout({
    preheader: config.preheader,
    bodyHtml,
    ctaLabel: config.ctaLabel,
    ctaUrl,
    backgroundColor: BG_DARK,
  })

  const pricingText: Record<QuoteRole, string> = {
    broker: 'Platform Subscription: $299/mo (includes unlimited carrier vetting). IronGate Verification: $10 per successfully verified load.',
    carrier: 'Verified Fleet Membership: $79/mo per MC Number. Driver App: Always Free.',
    shipper: 'Facility License: $99/mo per location. Includes: Unlimited QR scans, Geofenced gate logs, and real-time driver ID verification.',
  }

  const text = [
    greeting,
    '',
    config.bodyIntro.replace(/<[^>]+>/g, ''),
    '',
    'Current Pricing Structure:',
    pricingText[role],
    '',
    config.ctaLabel + ':',
    ctaUrl,
    '',
    getEmailFooterText(),
  ].join('\n')

  return { subject: config.subject, html, text }
}
