import { NextResponse } from 'next/server'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import sgMail from '@sendgrid/mail'
import { buildQuoteEmail, type QuoteRole } from '@/lib/email-templates'
import { getSubscribeUrl } from '@/lib/stripe-prices'

const FROM_EMAIL = 'billing@getironfreight.com'
const FROM_NAME = 'IronFreight'

const LOGO_CONTENT_ID = 'ironfreight-logo'

function getSiteUrl(): string {
  return (
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'https://getironfreight.com')
  )
}

/** Read logo from public/icons/icon-192.png so we can attach it inline (Outlook shows it; external URLs are often blocked). */
function readLogoBuffer(): Buffer | null {
  const cwd = process.cwd()
  const candidates = [
    join(cwd, 'public', 'icons', 'icon-192.png'),
    join(cwd, '..', 'public', 'icons', 'icon-192.png'),
  ]
  for (const p of candidates) {
    if (existsSync(p)) {
      try {
        return readFileSync(p)
      } catch {
        break
      }
    }
  }
  return null
}

const VALID_ROLES: QuoteRole[] = ['broker', 'carrier', 'shipper']

export async function POST(request: Request) {
  try {
    const apiKey = process.env.SENDGRID_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'SENDGRID_API_KEY is not set' }, { status: 500 })
    }

    const body = await request.json().catch(() => ({}))
    const to = typeof body.to === 'string' ? body.to.trim().toLowerCase() : ''
    const name = typeof body.name === 'string' ? body.name.trim() : ''
    const role = typeof body.role === 'string' && VALID_ROLES.includes(body.role as QuoteRole) ? (body.role as QuoteRole) : null
    const customCtaUrl = typeof body.ctaUrl === 'string' && body.ctaUrl.startsWith('http') ? body.ctaUrl : null

    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return NextResponse.json({ error: 'Valid "to" email is required' }, { status: 400 })
    }
    if (!name) {
      return NextResponse.json({ error: '"name" is required' }, { status: 400 })
    }
    if (!role) {
      return NextResponse.json({ error: '"role" must be one of: broker, carrier, shipper' }, { status: 400 })
    }

    const monthlySubscribeUrl = getSubscribeUrl(role, 'monthly')
    const yearlySubscribeUrl = getSubscribeUrl(role, 'yearly')
    const logoBuffer = readLogoBuffer()
    const useInlineLogo = Boolean(logoBuffer)

    const { subject, html, text } = buildQuoteEmail({
      name: name || 'there',
      role,
      ctaUrl: customCtaUrl ?? `${getSiteUrl()}/login`,
      monthlySubscribeUrl,
      yearlySubscribeUrl,
      logoSrc: useInlineLogo ? `cid:${LOGO_CONTENT_ID}` : undefined,
    })

    const attachments = useInlineLogo
      ? [
          {
            content: logoBuffer!.toString('base64'),
            filename: 'icon-192.png',
            type: 'image/png',
            disposition: 'inline' as const,
            content_id: LOGO_CONTENT_ID,
          },
        ]
      : undefined

    sgMail.setApiKey(apiKey)
    await sgMail.send({
      to,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject,
      html,
      text,
      attachments,
      headers: {
        'List-Unsubscribe': '<mailto:Billing@getironfreight.com?subject=Unsubscribe%20quote%20emails>',
        'X-Entity-Ref-ID': 'ironfreight-quote',
      },
    })

    return NextResponse.json({ ok: true, message: 'Quote email sent' })
  } catch (err: unknown) {
    const rawMessage = err instanceof Error ? err.message : 'Failed to send quote email'
    console.error('Send quote error:', err)
    // SendGrid 403 = usually sender not verified (billing@getironfreight.com must be verified in SendGrid)
    if (rawMessage.toLowerCase().includes('forbidden') || (err as { code?: number })?.code === 403) {
      console.error('Hint: Verify the sender email (billing@getironfreight.com) in SendGrid Single Sender Verification or Domain Authentication.')
    }
    // Don't expose raw provider errors to the client
    return NextResponse.json(
      { error: 'We couldn’t send the quote email right now. Please try again later or contact support.' },
      { status: 500 }
    )
  }
}
