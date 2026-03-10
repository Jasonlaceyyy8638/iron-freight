/**
 * Broker Team Member Invite
 * Subject: Invitation to Join the [Brokerage Name] Desk on IronFreight
 */

import { buildEmailLayout } from './layout'
import { getEmailFooterText } from './footer'

export function getBrokerInviteSubject(brokerageName: string): string {
  return `Invitation to Join the ${brokerageName} Desk on IronFreight`
}

export function buildBrokerInviteEmail(
  params: {
    recipientName: string | null
    brokerageName: string
    inviteUrl: string
  },
  options?: { logoSrc?: string }
): { subject: string; html: string; text: string } {
  const { recipientName, brokerageName, inviteUrl } = params
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hi,'

  const bodyHtml = `
    <p style="margin: 0 0 16px;">${greeting}</p>
    <p style="margin: 0 0 16px;">You have been invited to manage freight operations for <strong>${brokerageName}</strong>.</p>
    <p style="margin: 0 0 16px;">IronFreight provides you with an ironclad shield against double-brokering by ensuring every carrier on your board is biometrically verified. Use this portal to post loads, review carrier vetting scores, and monitor live chain-of-custody.</p>
    <p style="margin: 0 0 8px; color: #94a3b8; font-size: 14px;">Activate your broker portal. This link expires in 7 days.</p>
  `.trim()

  const html = buildEmailLayout({
    preheader: `You're invited to the ${brokerageName} desk on IronFreight.`,
    bodyHtml,
    ctaLabel: 'Activate Broker Portal',
    ctaUrl: inviteUrl,
    logoSrc: options?.logoSrc,
  })

  const text = [
    greeting,
    '',
    `You have been invited to manage freight operations for ${brokerageName}.`,
    '',
    'IronFreight provides you with an ironclad shield against double-brokering by ensuring every carrier on your board is biometrically verified. Use this portal to post loads, review carrier vetting scores, and monitor live chain-of-custody.',
    '',
    'Activate your broker portal (link expires in 7 days):',
    inviteUrl,
    '',
    getEmailFooterText(),
  ].join('\n')

  return {
    subject: getBrokerInviteSubject(brokerageName),
    html,
    text,
  }
}
