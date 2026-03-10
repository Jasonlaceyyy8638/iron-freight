import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/verify-qr
 * Body: { loadNumber: string, token: string }
 * Token from driver's QR (ironfreight://verify?token=xxx). Validates token, marks used, records custody.
 */
export async function POST(request: Request) {
  try {
    const authHeader = request.headers.get('authorization')
    const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
    if (!accessToken) {
      return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
    }

    const body = await request.json().catch(() => ({}))
    const loadNumber = typeof body.loadNumber === 'string' ? body.loadNumber.trim() : ''
    const token = typeof body.token === 'string' ? body.token.trim() : ''

    if (!loadNumber || !token) {
      return NextResponse.json(
        { error: 'loadNumber and token are required' },
        { status: 400 }
      )
    }

    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
    const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
    if (!supabaseUrl || !anonKey || !serviceKey) {
      return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
    }

    const supabase = createClient(supabaseUrl, anonKey, {
      global: { headers: { Authorization: `Bearer ${accessToken}` } },
    })
    const { data: { user } } = await supabase.auth.getUser(accessToken)
    if (!user) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
    }

    const { data: profile } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', user.id)
      .single()
    const role = (profile as { role?: string } | null)?.role
    if (role !== 'broker' && role !== 'shipper') {
      return NextResponse.json({ error: 'Only brokers and shippers can verify at gate' }, { status: 403 })
    }

    const { data: loadRow, error: loadError } = await supabase
      .from('loads')
      .select('id, load_number, driver_id, carrier_id, broker_profile_id, shipper_id')
      .eq('load_number', loadNumber)
      .single()

    if (loadError || !loadRow) {
      return NextResponse.json({ error: 'Load not found' }, { status: 404 })
    }

    const load = loadRow as {
      id: string
      load_number: string
      driver_id: string | null
      carrier_id: string | null
      broker_profile_id: string | null
      shipper_id: string | null
    }

    if (role === 'broker' && load.broker_profile_id !== user.id) {
      return NextResponse.json({ error: 'Load not found' }, { status: 404 })
    }
    if (role === 'shipper') {
      const { data: shipperRow } = await supabase
        .from('shippers')
        .select('id')
        .eq('profile_id', user.id)
        .single()
      if (!shipperRow?.id || load.shipper_id !== shipperRow.id) {
        return NextResponse.json({ error: 'Load not found' }, { status: 404 })
      }
    }

    const { data: tokenRow, error: tokenError } = await supabase
      .from('qr_tokens')
      .select('id, load_id, used_at, expires_at, token_type')
      .eq('token_hash', token)
      .single()

    if (tokenError || !tokenRow) {
      return NextResponse.json({ error: 'Invalid or unknown QR code' }, { status: 400 })
    }

    const qrToken = tokenRow as {
      id: string
      load_id: string
      used_at: string | null
      expires_at: string
      token_type: string
    }

    if (qrToken.load_id !== load.id) {
      return NextResponse.json(
        { error: 'QR code is for a different load. Ensure the driver is showing the QR for this load.' },
        { status: 400 }
      )
    }

    if (qrToken.used_at) {
      return NextResponse.json({ error: 'This QR code has already been used' }, { status: 400 })
    }

    const expiresAt = new Date(qrToken.expires_at).getTime()
    if (expiresAt < Date.now()) {
      return NextResponse.json({ error: 'QR code expired' }, { status: 400 })
    }

    const serviceClient = createClient(supabaseUrl, serviceKey)
    const { error: updateError } = await serviceClient
      .from('qr_tokens')
      .update({ used_at: new Date().toISOString() })
      .eq('id', qrToken.id)

    if (updateError) {
      console.error('qr_tokens update used_at error:', updateError)
      return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
    }

    let driverName: string | null = null
    let carrierName: string | null = null
    if (load.driver_id) {
      const { data: d } = await supabase.from('drivers').select('full_name').eq('id', load.driver_id).single()
      driverName = (d as { full_name?: string } | null)?.full_name ?? null
    }
    if (load.carrier_id) {
      const { data: c } = await supabase.from('carriers').select('legal_name').eq('id', load.carrier_id).single()
      carrierName = (c as { legal_name?: string } | null)?.legal_name ?? null
    }

    const actorType = role === 'shipper' ? 'shipper' : 'broker'
    const { error: custodyError } = await supabase.from('custody_events').insert({
      load_id: load.id,
      event_type: 'driver_verified',
      actor_type: actorType,
      actor_id: user.id,
      qr_token_id: qrToken.id,
      metadata: { source: 'gate_qr_scan' },
    })

    if (custodyError) {
      console.error('custody_events insert error:', custodyError)
    }

    const { error: logErr } = await supabase.from('verification_logs').insert({
      load_id: load.id,
      scan_time: new Date().toISOString(),
      biometric_status: 'MATCH',
    })
    if (logErr) console.error('verification_logs insert (optional):', logErr)

    return NextResponse.json({
      success: true,
      load_number: load.load_number,
      driver_name: driverName,
      carrier_name: carrierName,
    })
  } catch (err) {
    console.error('verify-qr error:', err)
    return NextResponse.json({ error: 'Verification failed' }, { status: 500 })
  }
}
