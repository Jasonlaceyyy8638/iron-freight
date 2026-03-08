/**
 * Base layout for IronFreight emails: Security-First design with shield header.
 */

import { EMAIL, SHIELD_ICON_SVG } from './constants'
import { getEmailFooterHtml } from './footer'

export type EmailLayoutParams = {
  /** Preheader / first line (some clients show this) */
  preheader?: string
  /** Main body HTML (paragraphs, lists, notes) */
  bodyHtml: string
  /** CTA button label */
  ctaLabel: string
  /** CTA button URL */
  ctaUrl: string
  /** Optional custom footer HTML; defaults to common footer */
  footerHtml?: string
  /** Optional background color (e.g. #0A0A0B for quote emails) */
  backgroundColor?: string
}

export function buildEmailLayout(params: EmailLayoutParams): string {
  const { preheader, bodyHtml, ctaLabel, ctaUrl, footerHtml, backgroundColor } = params
  const footer = footerHtml ?? getEmailFooterHtml()
  const bg = backgroundColor ?? EMAIL.BG_DARK

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>IronFreight</title>
  ${preheader ? `<meta name="description" content="${preheader.replace(/"/g, '&quot;')}">` : ''}
</head>
<body style="margin:0; padding:0; background-color:${bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${bg};">
    <tr>
      <td align="center" style="padding: 40px 20px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px;">
          <!-- Header: Shield + IRONFREIGHT -->
          <tr>
            <td style="padding-bottom: 28px; border-bottom: 1px solid ${EMAIL.BORDER};">
              <table role="presentation" cellspacing="0" cellpadding="0">
                <tr>
                  <td style="vertical-align: middle; padding-right: 12px;">${SHIELD_ICON_SVG}</td>
                  <td style="vertical-align: middle;">
                    <span style="font-size: 22px; font-weight: 800; letter-spacing: 0.02em; color:${EMAIL.TEXT};">IRONFREIGHT</span>
                  </td>
                </tr>
              </table>
            </td>
          </tr>
          <!-- Body -->
          <tr>
            <td style="padding: 32px 0 24px; color:${EMAIL.TEXT}; font-size: 15px; line-height: 1.65;">
              ${bodyHtml}
            </td>
          </tr>
          <!-- CTA -->
          <tr>
            <td style="padding: 8px 0 32px;">
              <a href="${ctaUrl}" style="display: inline-block; background-color:${EMAIL.BRAND}; color:${EMAIL.CTA_TEXT}; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 6px; letter-spacing: 0.02em;">${ctaLabel}</a>
            </td>
          </tr>
          <!-- Footer -->
          <tr>
            <td>${footer}</td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`.trim()
}
