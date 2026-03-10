import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import sgMail from '@sendgrid/mail'
import { buildEmailLayout } from '@/lib/email-templates'
import { getEmailFooterText } from '@/lib/email-templates'
import { reportVerificationCharge } from '@/lib/stripe-verification'

const FROM_EMAIL = 'verify@getironfreight.com'
const FROM_NAME = 'IronFreight Verify'

/**
 * POST /api/send-verification-email
 * Body: { loadId: string }
 * Authorization: Bearer <session access token> (driver must be assigned to this load)
 * Sends "Load #<load_number>: Driver Identity Verified at Pickup" to the broker from verify@getironfreight.com.
 */
export async function POST(request: Request) {
  try {
    const apiKey = process.env.SENDGRID_API_KEY
    if (!apiKey) {
      return NextResponse.json({ error: 'SENDGRID_API_KEY is not set' }, { status: 500 })
    }

    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!accessToken) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const loadId = typeof body.loadId === 'string' ? body.loadId.trim() : ''
    if (!loadId) {
      return NextResponse.json({ error: 'loadId is required' }, { status: 400 })
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !supabaseAnon || !serviceKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const userClient = createClient(supabaseUrl, supabaseAnon, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    })
    const { data: { user } } = await userClient.auth.getUser(accessToken)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { data: driverRow } = await userClient
      .from('drivers')
      .select('id')
      .eq('profile_id', user.id)
      .single()
    if (!driverRow?.id) {
      return NextResponse.json({ error: 'Not a driver' }, { status: 403 })
    }

    const { data: load } = await userClient
      .from('loads')
      .select('id, load_number, driver_id, broker_profile_id')
      .eq('id', loadId)
      .single()
    if (!load || load.driver_id !== driverRow.id) {
      return NextResponse.json({ error: 'Load not found or not assigned to you' }, { status: 404 })
    }

    const brokerProfileId = (load as { broker_profile_id?: string }).broker_profile_id
    if (!brokerProfileId) {
      return NextResponse.json({ error: 'Load has no broker' }, { status: 400 })
    }

    const serviceClient = createClient(supabaseUrl, serviceKey)
    const { data: broker } = await serviceClient
      .from('profiles')
      .select('email, stripe_customer_id, stripe_verification_subscription_item_id')
      .eq('id', brokerProfileId)
      .single()
    const toEmail = broker?.email?.trim()
    if (!toEmail || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(toEmail)) {
      return NextResponse.json({ error: 'Broker email not found' }, { status: 400 })
    }

    const loadNumber = (load as { load_number?: string }).load_number || loadId.slice(0, 8)
    const subject = `Load #${loadNumber}: Driver Identity Verified at Pickup`
    const bodyHtml = `
      <p style="margin: 0 0 16px;"><strong>Load #${loadNumber}: Driver Identity Verified at Pickup</strong></p>
      <p style="margin: 0 0 16px;">The driver assigned to this load has completed identity verification at pickup. This is an automated notification from IronFreight (verify@getironfreight.com).</p>
    `.trim()
    const html = buildEmailLayout({
      preheader: `Load #${loadNumber}: Driver identity verified at pickup.`,
      bodyHtml,
    })
    const text = [
      `Load #${loadNumber}: Driver Identity Verified at Pickup`,
      '',
      'The driver assigned to this load has completed identity verification at pickup. This is an automated notification from IronFreight (verify@getironfreight.com).',
      '',
      getEmailFooterText(),
    ].join('\n')

    sgMail.setApiKey(apiKey)
    await sgMail.send({
      to: toEmail,
      from: { email: FROM_EMAIL, name: FROM_NAME },
      subject,
      text,
      html,
    })

    // $10 per verified load: prefer metered subscription (monthly invoice); else invoice item (next subscription invoice)
    const brokerRow = broker as { stripe_customer_id?: string; stripe_verification_subscription_item_id?: string } | null
    const loadNum = (load as { load_number?: string }).load_number || loadId.slice(0, 8)
    if (brokerRow?.stripe_verification_subscription_item_id || brokerRow?.stripe_customer_id) {
      await reportVerificationCharge({
        stripeVerificationSubscriptionItemId: brokerRow?.stripe_verification_subscription_item_id ?? null,
        stripeCustomerId: brokerRow?.stripe_customer_id ?? null,
        loadNumber: loadNum,
      })
    }

    return NextResponse.json({ ok: true })
  } catch (err: unknown) {
    console.error('Send verification email error:', err)
    return NextResponse.json(
      { error: err instanceof Error ? err.message : 'Failed to send email' },
      { status: 500 }
    )
  }
}
