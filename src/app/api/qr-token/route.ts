import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'
import { randomUUID } from 'crypto'

const GATE_TOKEN_VALIDITY_MS = 15 * 60 * 1000 // 15 minutes

/**
 * POST /api/qr-token
 * Body: { loadId: string }
 * Driver only; must be assigned to this load. Creates a single-use gate token valid 15 min.
 * Returns { token_hash, expires_at } for QR payload: ironfreight://verify?token=<token_hash>
 */
export async function POST(request: Request) {
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
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY
  if (!supabaseUrl || !anonKey || !serviceKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const userClient = createClient(supabaseUrl, anonKey, {
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
    .select('id, driver_id')
    .eq('id', loadId)
    .single()
  if (!load || load.driver_id !== driverRow.id) {
    return NextResponse.json({ error: 'Load not found or not assigned to you' }, { status: 404 })
  }

  const expiresAt = new Date(Date.now() + GATE_TOKEN_VALIDITY_MS)
  const tokenHash = randomUUID()

  const serviceClient = createClient(supabaseUrl, serviceKey)
  const { error } = await serviceClient.from('qr_tokens').insert({
    load_id: loadId,
    token_type: 'gate',
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  })

  if (error) {
    console.error('qr_tokens insert error:', error)
    return NextResponse.json({ error: 'Failed to create QR token' }, { status: 500 })
  }

  return NextResponse.json({
    token_hash: tokenHash,
    expires_at: expiresAt.toISOString(),
  })
}
