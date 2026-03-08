import { NextResponse } from 'next/server'
import sgMail from '@sendgrid/mail'
import { createSupabaseWithAuth } from '@/lib/supabase/server'
import {
  buildInternalInviteEmail,
  buildCarrierInviteEmail,
  buildBrokerInviteEmail,
} from '@/lib/email-templates'
import { randomUUID } from 'crypto'

const FROM_EMAIL = 'info@getironfreight.com'
const FROM_NAME = 'IronFreight'
const INVITE_EXIRY_DAYS = 7

function getSiteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? process.env.VERCEL_URL
    ? `https://${process.env.VERCEL_URL}`
    : 'http://localhost:3000'
}

type StaffBody = { type: 'staff'; email: string; full_name?: string; staff_role?: 'admin' | 'billing' | 'support' }
type CarrierBody = { type: 'carrier'; email: string; full_name?: string; carrier_id: string }
type BrokerBody = { type: 'broker'; email: string; full_name?: string }
type Body = StaffBody | CarrierBody | BrokerBody

export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createSupabaseWithAuth(token)
    if (!supabase) {
      return NextResponse.json({ error: 'Server configuration error' }, { status: 500 })
    }

    const { data: { user } } = await supabase.auth.getUser(token)
    if (!user) {
      return NextResponse.json({ error: 'Invalid or expired session' }, { status: 401 })
    }

    const body = (await request.json()) as Body
    const email = typeof body.email === 'string' ? body.email.trim().toLowerCase() : ''
    if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json({ error: 'Valid email is required' }, { status: 400 })
    }

    const fullName = typeof body.full_name === 'string' ? body.full_name.trim() || null : null
    const siteUrl = getSiteUrl()

    if (body.type === 'staff') {
      const staffRole = body.staff_role && ['admin', 'billing', 'support'].includes(body.staff_role) ? body.staff_role : 'admin'
      const inviteToken = randomUUID()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + INVITE_EXIRY_DAYS)

      const { error } = await supabase.from('staff_invites').insert({
        email,
        full_name: fullName,
        staff_role: staffRole,
        token: inviteToken,
        created_by: user.id,
        expires_at: expiresAt.toISOString(),
      })
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      const inviteLink = `${siteUrl}/admin/login?invite=${inviteToken}`
      const { subject, html, text } = buildInternalInviteEmail({
        recipientName: fullName,
        role: staffRole,
        inviteUrl: inviteLink,
      })
      await sendEmail({ to: email, subject, html, text })
      return NextResponse.json({ ok: true, message: 'Invite sent' })
    }

    if (body.type === 'carrier') {
      const carrierId = body.carrier_id
      if (!carrierId) {
        return NextResponse.json({ error: 'carrier_id is required' }, { status: 400 })
      }
      const inviteToken = randomUUID()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + INVITE_EXIRY_DAYS)

      const { error } = await supabase.from('carrier_invites').insert({
        carrier_id: carrierId,
        email,
        full_name: fullName,
        token: inviteToken,
        created_by: user.id,
        expires_at: expiresAt.toISOString(),
      })
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      const { data: carrier } = await supabase.from('carriers').select('legal_name').eq('id', carrierId).single()
      const carrierName = carrier?.legal_name ?? 'Your Carrier'
      const inviteLink = `${siteUrl}/login?invite=${inviteToken}&type=carrier`
      const { subject, html, text } = buildCarrierInviteEmail({
        recipientName: fullName,
        carrierName,
        inviteUrl: inviteLink,
      })
      await sendEmail({ to: email, subject, html, text })
      return NextResponse.json({ ok: true, message: 'Invite sent' })
    }

    if (body.type === 'broker') {
      const inviteToken = randomUUID()
      const expiresAt = new Date()
      expiresAt.setDate(expiresAt.getDate() + INVITE_EXIRY_DAYS)

      const { error } = await supabase.from('broker_invites').insert({
        broker_profile_id: user.id,
        email,
        full_name: fullName,
        token: inviteToken,
        created_by: user.id,
        expires_at: expiresAt.toISOString(),
      })
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 400 })
      }

      const inviteLink = `${siteUrl}/login?invite=${inviteToken}&type=broker`
      const { data: inviterProfile } = await supabase.from('profiles').select('full_name').eq('id', user.id).single()
      const brokerageName = inviterProfile?.full_name?.trim() || 'Our Broker Desk'
      const { subject, html, text } = buildBrokerInviteEmail({
        recipientName: fullName,
        brokerageName,
        inviteUrl: inviteLink,
      })
      await sendEmail({ to: email, subject, html, text })
      return NextResponse.json({ ok: true, message: 'Invite sent' })
    }

    return NextResponse.json({ error: 'Invalid invite type' }, { status: 400 })
  } catch (e) {
    console.error('Invite send error:', e)
    return NextResponse.json({ error: 'Failed to send invite' }, { status: 500 })
  }
}

async function sendEmail(params: {
  to: string
  subject: string
  html: string
  text: string
}) {
  const apiKey = process.env.SENDGRID_API_KEY
  if (!apiKey) {
    throw new Error('SENDGRID_API_KEY is not set')
  }
  sgMail.setApiKey(apiKey)
  await sgMail.send({
    to: params.to,
    from: { email: FROM_EMAIL, name: FROM_NAME },
    subject: params.subject,
    text: params.text,
    html: params.html,
  })
}
