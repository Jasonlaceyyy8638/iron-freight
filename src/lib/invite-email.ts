/**
 * Professional invite email HTML – dark background (#0A0A0B), lime accent (#C1FF00).
 * From: Info@getironfreight.com
 */

const BRAND_COLOR = '#C1FF00'
const BG_DARK = '#0A0A0B'
const TEXT = '#F9FAFB'
const TEXT_MUTED = '#A3A3A3'

export function buildInviteEmailHtml(params: {
  recipientName: string | null
  inviteLink: string
  inviteType: 'staff' | 'carrier' | 'broker'
  contextLabel?: string // e.g. "Acme Trucking" for carrier, or "Admin team" for staff
}): string {
  const { recipientName, inviteLink, inviteType, contextLabel } = params
  const greeting = recipientName ? `Hi ${recipientName},` : 'Hi,'
  const copy =
    inviteType === 'staff'
      ? `You're invited to join the IronFreight ${contextLabel ?? 'admin team'}. Use the button below to sign in or create your account.`
      : inviteType === 'carrier'
        ? `You're invited to join ${contextLabel ?? 'our carrier team'} on IronFreight. Use the button below to sign in or create your account.`
        : `You're invited to join ${contextLabel ?? 'our broker team'} on IronFreight. Use the button below to sign in or create your account.`

  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>You're invited to IronFreight</title>
</head>
<body style="margin:0; padding:0; background-color:${BG_DARK}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${BG_DARK};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 520px;">
          <tr>
            <td style="padding-bottom: 24px;">
              <span style="font-size: 22px; font-weight: 700; color:${TEXT};">IRONFREIGHT</span>
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 0; color:${TEXT}; font-size: 16px; line-height: 1.6;">
              ${greeting}
            </td>
          </tr>
          <tr>
            <td style="color:${TEXT}; font-size: 16px; line-height: 1.6;">
              ${copy}
            </td>
          </tr>
          <tr>
            <td style="padding: 32px 0;">
              <a href="${inviteLink}" style="display: inline-block; background-color:${BRAND_COLOR}; color: #0A0A0B; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 8px;">Sign in / Sign up</a>
            </td>
          </tr>
          <tr>
            <td style="color:${TEXT_MUTED}; font-size: 13px; line-height: 1.5;">
              If you didn't expect this invite, you can ignore this email. The link will expire in 7 days.
            </td>
          </tr>
          <tr>
            <td style="padding-top: 32px; border-top: 1px solid #333; color:${TEXT_MUTED}; font-size: 12px;">
              © ${new Date().getFullYear()} IronFreight. All rights reserved.
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim()
}

export function buildInviteEmailText(params: {
  inviteLink: string
  inviteType: 'staff' | 'carrier' | 'broker'
  contextLabel?: string
}): string {
  const { inviteLink, inviteType, contextLabel } = params
  const copy =
    inviteType === 'staff'
      ? `You're invited to join the IronFreight ${contextLabel ?? 'admin team'}. Sign in or sign up here: ${inviteLink}`
      : inviteType === 'carrier'
        ? `You're invited to join ${contextLabel ?? 'our carrier team'} on IronFreight. Sign in or sign up here: ${inviteLink}`
        : `You're invited to join ${contextLabel ?? 'our broker team'} on IronFreight. Sign in or sign up here: ${inviteLink}`
  return copy + '\n\nThis link expires in 7 days.'
}
