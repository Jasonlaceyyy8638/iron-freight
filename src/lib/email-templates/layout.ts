/**
 * Base layout for IronFreight emails: Security-First design with logo header.
 */

import { EMAIL, getLogoDataUrl } from './constants'
import { getEmailFooterHtml } from './footer'

export type EmailLayoutParams = {
  /** Preheader / first line (some clients show this) */
  preheader?: string
  /** Main body HTML (paragraphs, lists, notes) */
  bodyHtml: string
  /** CTA button label (optional – omit for no button) */
  ctaLabel?: string
  /** CTA button URL (optional – omit for no button) */
  ctaUrl?: string
  /** Optional custom footer HTML; defaults to common footer */
  footerHtml?: string
  /** Optional background color */
  backgroundColor?: string
  /** Optional logo src: use 'cid:ironfreight-logo' when attaching logo inline (e.g. for Outlook) */
  logoSrc?: string
}

export function buildEmailLayout(params: EmailLayoutParams): string {
  const { preheader, bodyHtml, ctaLabel, ctaUrl, footerHtml, backgroundColor, logoSrc } = params
  const footer = footerHtml ?? getEmailFooterHtml()
  const bg = backgroundColor ?? EMAIL.BG_DARK
  const logoUrl = logoSrc ?? getLogoDataUrl()
  const hasCta = Boolean(ctaLabel && ctaUrl)

  return `
<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <meta http-equiv="X-UA-Compatible" content="IE=edge">
  <title>IronFreight</title>
  <style>@import url('https://fonts.googleapis.com/css2?family=Bebas+Neue&display=swap');</style>
  ${preheader ? `<meta name="description" content="${preheader.replace(/"/g, '&quot;')}">` : ''}
</head>
<body style="margin:0; padding:0; background-color:${bg}; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="background-color:${bg};">
    <tr>
      <td align="center" style="padding: 88px 24px 56px;">
        <table role="presentation" width="100%" cellspacing="0" cellpadding="0" style="max-width: 560px;">
          <!-- Header: Full-size logo (no compression), then IRONFREIGHT, then body below -->
          <tr>
            <td align="center" style="padding: 24px 0 16px; width: 100%; background-color: transparent;">
              <img src="${logoUrl}" alt="IronFreight" width="320" height="320" style="display: block; width: 320px; height: 320px; max-width: 320px; max-height: 320px; border: 0; outline: none; margin: 0 auto; background: transparent;" />
            </td>
          </tr>
          <tr>
            <td align="center" style="padding-bottom: 32px; border-bottom: 1px solid ${EMAIL.BORDER};">
              <span style="font-size: 32px; letter-spacing: 0.08em; line-height: 1.2; font-family: 'Bebas Neue', Impact, 'Arial Black', Arial, sans-serif;"><span style="color: #FFFFFF;">IRON</span><span style="color: ${EMAIL.BRAND};">FREIGHT</span></span>
            </td>
          </tr>
          <!-- Body (starts below logo) -->
          <tr>
            <td style="padding: 40px 0 32px; color: ${EMAIL.TEXT}; font-size: 16px; line-height: 1.7;">
              ${bodyHtml}
            </td>
          </tr>
          ${hasCta ? `<!-- CTA -->
          <tr>
            <td style="padding: 16px 0 40px;">
              <a href="${ctaUrl}" style="display: inline-block; background-color:${EMAIL.BRAND}; color:${EMAIL.CTA_TEXT}; font-size: 14px; font-weight: 700; text-decoration: none; padding: 14px 28px; border-radius: 6px; letter-spacing: 0.02em;">${ctaLabel}</a>
            </td>
          </tr>` : ''}
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
