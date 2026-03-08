/**
 * Shipper Team Member Invite
 * Subject: Access Granted: IronFreight Warehouse Gate Verification
 */

import { buildEmailLayout } from './layout'
import { getEmailFooterText } from './footer'
import { EMAIL } from './constants'

export function getShipperInviteSubject(warehouseName: string): string {
  return `Access Granted: IronFreight Warehouse Gate Verification`
}

export function buildShipperInviteEmail(params: {
  recipientName: string | null
  warehouseName: string
  inviteUrl: string
}): { subject: string; html: string; text: string } {
  const { recipientName, warehouseName, inviteUrl } = params
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hi,'

  const bodyHtml = `
    <p style="margin: 0 0 16px;">${greeting}</p>
    <p style="margin: 0 0 16px;">You have been added as an authorized Shipper for <strong>${warehouseName}</strong>.</p>
    <p style="margin: 0 0 16px;">Your account allows you to utilize the <strong>IronGate Scanner</strong> to verify driver identities and license plates before releasing freight. This system is your final line of defense against cargo theft and unauthorized pickups.</p>
    <p style="margin: 0 0 8px; color: ${EMAIL.TEXT_MUTED}; font-size: 14px;">Secure your gate access. This link expires in 7 days.</p>
  `.trim()

  const html = buildEmailLayout({
    preheader: `IronFreight gate verification access for ${warehouseName}.`,
    bodyHtml,
    ctaLabel: 'Secure Your Gate Access',
    ctaUrl: inviteUrl,
  })

  const text = [
    greeting,
    '',
    `You have been added as an authorized Shipper for ${warehouseName}.`,
    '',
    'Your account allows you to utilize the IronGate Scanner to verify driver identities and license plates before releasing freight. This system is your final line of defense against cargo theft and unauthorized pickups.',
    '',
    'Secure your gate access (link expires in 7 days):',
    inviteUrl,
    '',
    getEmailFooterText(),
  ].join('\n')

  return {
    subject: getShipperInviteSubject(warehouseName),
    html,
    text,
  }
}
