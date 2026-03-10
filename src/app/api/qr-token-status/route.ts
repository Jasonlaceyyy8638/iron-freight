import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/qr-token-status?token=<token_hash>
 * Driver only; token must belong to a load assigned to this driver.
 * Returns { status: 'pending' | 'used' | 'expired', used_at?: string }.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const token = url.searchParams.get('token')?.trim()
  if (!token) {
    return NextResponse.json({ error: 'token is required' }, { status: 400 })
  }

  const authHeader = request.headers.get('authorization')
  const accessToken = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!accessToken) {
    return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
  const { data: { user } } = await supabase.auth.getUser(accessToken)
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const { data: driverRow } = await supabase
    .from('drivers')
    .select('id')
    .eq('profile_id', user.id)
    .single()
  if (!driverRow?.id) {
    return NextResponse.json({ error: 'Not a driver' }, { status: 403 })
  }

  const { data: tokenRow, error: tokenError } = await supabase
    .from('qr_tokens')
    .select('id, load_id, used_at, expires_at')
    .eq('token_hash', token)
    .single()

  if (tokenError || !tokenRow) {
    return NextResponse.json({ error: 'Token not found' }, { status: 404 })
  }

  const { data: load } = await supabase
    .from('loads')
    .select('driver_id')
    .eq('id', tokenRow.load_id)
    .single()
  if (!load || load.driver_id !== driverRow.id) {
    return NextResponse.json({ error: 'Token not found' }, { status: 404 })
  }

  const usedAt = (tokenRow as { used_at?: string | null }).used_at
  const expiresAt = (tokenRow as { expires_at?: string }).expires_at
  const isExpired = expiresAt ? new Date(expiresAt).getTime() < Date.now() : true

  let status: 'pending' | 'used' | 'expired' = 'pending'
  if (usedAt) status = 'used'
  else if (isExpired) status = 'expired'

  return NextResponse.json({
    status,
    used_at: usedAt ?? undefined,
  })
}
