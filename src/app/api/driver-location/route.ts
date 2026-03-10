import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * POST /api/driver-location
 * Body: { load_id: string, latitude: number, longitude: number }
 * Auth: Bearer token; must be the driver assigned to this load.
 * Upserts driver_locations so brokers can see live position.
 */
export async function POST(request: Request) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  let body: { load_id?: string; latitude?: number; longitude?: number }
  try {
    body = await request.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }
  const loadId = typeof body.load_id === 'string' ? body.load_id.trim() : ''
  const lat = typeof body.latitude === 'number' ? body.latitude : Number(body.latitude)
  const lng = typeof body.longitude === 'number' ? body.longitude : Number(body.longitude)
  if (!loadId || Number.isNaN(lat) || Number.isNaN(lng) || lat < -90 || lat > 90 || lng < -180 || lng > 180) {
    return NextResponse.json({ error: 'load_id, latitude, and longitude required and valid' }, { status: 400 })
  }

  const { data: driver } = await supabase.from('drivers').select('id').eq('profile_id', user.id).single()
  if (!driver) {
    return NextResponse.json({ error: 'Not a driver' }, { status: 403 })
  }

  const { data: load } = await supabase
    .from('loads')
    .select('id, driver_id')
    .eq('id', loadId)
    .in('status', ['assigned', 'in_transit', 'pickup_verified', 'delivery_verified'])
    .single()
  if (!load || load.driver_id !== driver.id) {
    return NextResponse.json({ error: 'Load not assigned to you' }, { status: 403 })
  }

  const { error } = await supabase.from('driver_locations').upsert(
    {
      driver_id: driver.id,
      load_id: loadId,
      latitude: lat,
      longitude: lng,
      updated_at: new Date().toISOString(),
    },
    { onConflict: 'driver_id,load_id' }
  )
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({ ok: true })
}

/**
 * GET /api/driver-location?load_id=xxx
 * Auth: Bearer token; caller must be broker/carrier/driver with access to this load.
 * Returns latest driver position for that load (if any).
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const token = authHeader?.startsWith('Bearer ') ? authHeader.slice(7) : null
  if (!token) {
    return NextResponse.json({ error: 'Authorization required' }, { status: 401 })
  }

  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
  const anonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
  if (!supabaseUrl || !anonKey) {
    return NextResponse.json({ error: 'Supabase not configured' }, { status: 500 })
  }

  const supabase = createClient(supabaseUrl, anonKey, {
    global: { headers: { Authorization: `Bearer ${token}` } },
  })
  const { data: { user } } = await supabase.auth.getUser(token)
  if (!user) {
    return NextResponse.json({ error: 'Invalid token' }, { status: 401 })
  }

  const { searchParams } = new URL(request.url)
  const loadId = searchParams.get('load_id')?.trim()
  if (!loadId) {
    return NextResponse.json({ error: 'load_id required' }, { status: 400 })
  }

  const { data: row, error } = await supabase
    .from('driver_locations')
    .select('latitude, longitude, updated_at')
    .eq('load_id', loadId)
    .single()
  if (error) {
    if (error.code === 'PGRST116') {
      return NextResponse.json({ latitude: null, longitude: null, updated_at: null })
    }
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
  return NextResponse.json({
    latitude: Number(row.latitude),
    longitude: Number(row.longitude),
    updated_at: row.updated_at,
  })
}
