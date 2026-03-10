import { NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'
import { readFileSync, existsSync } from 'fs'
import { join } from 'path'
import { buildInternalInviteEmail } from '@/lib/email-templates'

// Must match SendGrid verified sender exactly (use lowercase to match Single Sender Verification)
const FROM_EMAIL = 'info@getironfreight.com'
const FROM_NAME = 'IronFreight'

const LOGO_CID = 'ironfreight-logo'

function getLogoAttachment(): { content: string; filename: string; type: string; content_id: string; disposition: string } | null {
  const path = join(process.cwd(), 'public', 'icons', 'icon-192.png')
  if (!existsSync(path)) return null
  try {
    const buffer = readFileSync(path)
    return {
      content: buffer.toString('base64'),
      filename: 'icon-192.png',
      type: 'image/png',
      content_id: LOGO_CID,
      disposition: 'inline',
    }
  } catch {
    return null
  }
}

export async function GET(request: Request) {
  try {
    const apiKey = process.env.SENDGRID_API_KEY
    if (!apiKey) {
      const sendgridKeys = Object.keys(process.env).filter((k) => k.startsWith('SENDGRID'))
      return NextResponse.json({
        ok: false,
        error: 'SENDGRID_API_KEY is not set',
        hint: 'Add SENDGRID_API_KEY to .env.local and restart the dev server.',
        debug: {
          sendgridEnvVarsFound: sendgridKeys,
          keyLength: (process.env.SENDGRID_API_KEY || '').length,
        },
      })
    }

    const { searchParams } = new URL(request.url)
    const to = searchParams.get('to')?.trim()
    if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
      return NextResponse.json({
        ok: false,
        error: 'Add your email as the "to" query param',
        hint: 'Example: /api/invites/test?to=you@example.com',
      })
    }

    const siteUrl = process.env.NEXT_PUBLIC_SITE_URL ?? 'http://localhost:3000'
    const sampleLink = `${siteUrl}/admin/login?invite=test-token`

    const logoAttachment = getLogoAttachment()
    const { subject, html, text } = buildInternalInviteEmail(
      {
        recipientName: 'Test User',
        role: 'support',
        inviteUrl: sampleLink,
      },
      logoAttachment ? { logoSrc: `cid:${LOGO_CID}` } : undefined
    )

    sgMail.setApiKey(apiKey)
    await sgMail.send({
      to,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject: `[Test] ${subject}`,
      text,
      html,
      ...(logoAttachment && { attachments: [logoAttachment] }),
    })
    return NextResponse.json({ ok: true, message: `Test email sent to ${to}. Check your inbox.` })
  } catch (err: unknown) {
    const sg = err as { response?: { body?: unknown; statusCode?: number } }
    const body = sg?.response?.body
    const message = err instanceof Error ? err.message : 'SendGrid error'
    const detail = body != null ? body : message
    console.error('SendGrid test error:', err)
    return NextResponse.json({
      ok: false,
      error: message,
      detail,
      hint: 'In SendGrid: Settings → Sender Authentication – verify info@getironfreight.com (exact address). API key needs Mail Send permission.',
    })
  }
}
