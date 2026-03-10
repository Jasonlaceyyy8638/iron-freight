import { NextResponse } from 'next/server'
import { createClient } from '@supabase/supabase-js'

/**
 * GET /api/loads/by-number?load_number=IF-12345
 * Returns load with driver and carrier names for gate verification.
 * Broker: own loads (broker_profile_id = user). Shipper: loads where shipper_id = their shipper id.
 */
export async function GET(request: Request) {
  const url = new URL(request.url)
  const loadNumber = url.searchParams.get('load_number')?.trim()
  if (!loadNumber) {
    return NextResponse.json({ error: 'load_number is required' }, { status: 400 })
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

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()
  const role = (profile as { role?: string } | null)?.role
  if (role !== 'broker' && role !== 'shipper') {
    return NextResponse.json({ error: 'Only brokers and shippers can look up loads for gate verification' }, { status: 403 })
  }

  const loadSelect = 'id, load_number, status, driver_id, carrier_id, broker_profile_id, shipper_id, origin_city, origin_state, dest_city, dest_state'
  let loadQuery = supabase
    .from('loads')
    .select(loadSelect)
    .eq('load_number', loadNumber)
    .limit(1)

  const { data: loads, error: loadError } = await loadQuery
  if (loadError || !loads?.length) {
    return NextResponse.json({ error: 'Load not found' }, { status: 404 })
  }
  const load = loads[0] as {
    id: string
    load_number: string
    status: string
    driver_id: string | null
    carrier_id: string | null
    broker_profile_id: string | null
    shipper_id: string | null
    origin_city: string | null
    origin_state: string | null
    dest_city: string | null
    dest_state: string | null
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

  let driverName: string | null = null
  let carrierName: string | null = null
  if (load.driver_id) {
    const { data: driverRow } = await supabase
      .from('drivers')
      .select('full_name')
      .eq('id', load.driver_id)
      .single()
    driverName = (driverRow as { full_name?: string } | null)?.full_name ?? null
  }
  if (load.carrier_id) {
    const { data: carrierRow } = await supabase
      .from('carriers')
      .select('legal_name')
      .eq('id', load.carrier_id)
      .single()
    carrierName = (carrierRow as { legal_name?: string } | null)?.legal_name ?? null
  }

  return NextResponse.json({
    id: load.id,
    load_number: load.load_number,
    status: load.status,
    driver_id: load.driver_id,
    carrier_id: load.carrier_id,
    driver_name: driverName,
    carrier_name: carrierName,
    origin: [load.origin_city, load.origin_state].filter(Boolean).join(', ') || null,
    destination: [load.dest_city, load.dest_state].filter(Boolean).join(', ') || null,
  })
}
