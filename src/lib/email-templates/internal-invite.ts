/**
 * Internal IronFreight Team Invite (Role-Based)
 * Subject: Action Required: Your IronFreight Internal Access Credentials
 */

import { buildEmailLayout } from './layout'
import { getEmailFooterText } from './footer'
import { EMAIL } from './constants'

const ROLE_COPY: Record<string, string> = {
  billing: `You have been granted access to the IronFreight <strong>Financial Command Center</strong>. Your role includes oversight of carrier settlements, dispute payouts, and platform fee reconciliation.`,
  admin: `You have been assigned <strong>Administrative Privileges</strong>. You are responsible for platform-wide security protocols, employee access management, and high-level system overrides.`,
  support: `You have been onboarded to the <strong>IronFreight Support Desk</strong>. You now have access to the Verification Timeline and Audit Vault to assist users with real-time freight security.`,
}

export const INTERNAL_INVITE_SUBJECT = 'Action Required: Your IronFreight Internal Access Credentials'

export function buildInternalInviteEmail(
  params: {
    recipientName: string | null
    role: 'billing' | 'admin' | 'support'
    inviteUrl: string
  },
  options?: { logoSrc?: string }
): { subject: string; html: string; text: string } {
  const { recipientName, role, inviteUrl } = params
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hi,'
  const roleCopy = ROLE_COPY[role] ?? ROLE_COPY.support

  const bodyHtml = `
    <p style="margin: 0 0 16px;">${greeting}</p>
    <p style="margin: 0 0 16px;">Your IronFreight internal access has been provisioned. This message is part of our Zero-Trust verification standards.</p>
    <p style="margin: 0 0 20px;">${roleCopy}</p>
    <p style="margin: 0 0 8px; color: ${EMAIL.TEXT_MUTED}; font-size: 14px;">Use the button below to set up your internal account. This link will expire in 7 days.</p>
  `.trim()

  const html = buildEmailLayout({
    preheader: 'Your IronFreight internal access credentials are ready.',
    bodyHtml,
    ctaLabel: 'Set Up Internal Account',
    ctaUrl: inviteUrl,
    logoSrc: options?.logoSrc,
  })

  const text = [
    greeting,
    '',
    'Your IronFreight internal access has been provisioned. This message is part of our Zero-Trust verification standards.',
    '',
    roleCopy.replace(/<[^>]+>/g, ''),
    '',
    'Set up your internal account (link expires in 7 days):',
    inviteUrl,
    '',
    getEmailFooterText(),
  ].join('\n')

  return { subject: INTERNAL_INVITE_SUBJECT, html, text }
}
