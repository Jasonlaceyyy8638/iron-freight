/**
 * Carrier Team Member Invite
 * Subject: Identity Verification Required: Join [Carrier Company Name] on IronFreight
 */

import { buildEmailLayout } from './layout'
import { getEmailFooterText } from './footer'
import { EMAIL } from './constants'

export function getCarrierInviteSubject(carrierName: string): string {
  return `Identity Verification Required: Join ${carrierName} on IronFreight`
}

export function buildCarrierInviteEmail(params: {
  recipientName: string | null
  carrierName: string
  inviteUrl: string
}): { subject: string; html: string; text: string } {
  const { recipientName, carrierName, inviteUrl } = params
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hi,'

  const bodyHtml = `
    <p style="margin: 0 0 16px;">${greeting}</p>
    <p style="margin: 0 0 16px;">Your organization has added you to their IronFreight fleet. To maintain our <strong>Zero-Trust</strong> security standard, you are required to complete your biometric profile.</p>
    <p style="margin: 0 0 16px;">Once verified, you will have access to assigned loads, digital eBOLs, and the IronGate QR verification system.</p>
    <p style="margin: 0 0 20px; padding: 12px 16px; background-color: ${EMAIL.BG_CARD}; border-left: 4px solid ${EMAIL.BRAND}; color: ${EMAIL.TEXT_MUTED}; font-size: 14px;">
      <strong style="color: ${EMAIL.TEXT};">Safety note:</strong> IronFreight ensures all GPS and biometric data is encrypted and used strictly for freight custody verification.
    </p>
    <p style="margin: 0 0 8px; color: ${EMAIL.TEXT_MUTED}; font-size: 14px;">Complete onboarding to join <strong>${carrierName}</strong>. This link expires in 7 days.</p>
  `.trim()

  const html = buildEmailLayout({
    preheader: `Join ${carrierName} on IronFreight—complete your verification.`,
    bodyHtml,
    ctaLabel: 'Complete Driver/Dispatcher Onboarding',
    ctaUrl: inviteUrl,
  })

  const text = [
    greeting,
    '',
    'Your organization has added you to their IronFreight fleet. To maintain our Zero-Trust security standard, you are required to complete your biometric profile.',
    '',
    'Once verified, you will have access to assigned loads, digital eBOLs, and the IronGate QR verification system.',
    '',
    'Safety note: IronFreight ensures all GPS and biometric data is encrypted and used strictly for freight custody verification.',
    '',
    `Complete onboarding to join ${carrierName} (link expires in 7 days):`,
    inviteUrl,
    '',
    getEmailFooterText(),
  ].join('\n')

  return {
    subject: getCarrierInviteSubject(carrierName),
    html,
    text,
  }
}
