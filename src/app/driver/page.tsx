'use client'

import { useState, useEffect, useRef, useCallback } from 'react'
import { useRouter } from 'next/navigation'
import { useAtomValue } from 'jotai'
import { userAtom, authReadyAtom } from '@/lib/store'
import { signOut } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase/client'
import { Logo } from '@/components/Logo'
import Link from 'next/link'

const LOCATION_REPORT_INTERVAL_MS = 20_000

// Throttle: only send to API at most every 20s (watchPosition can fire more often)
function useThrottledReport(loadId: string | undefined) {
  const lastSentRef = useRef<number>(0)
  const supabase = getSupabase()

  const sendIfAllowed = useCallback(
    (latitude: number, longitude: number) => {
      if (!loadId || !supabase) return
      const now = Date.now()
      if (now - lastSentRef.current < LOCATION_REPORT_INTERVAL_MS) return
      lastSentRef.current = now
      supabase.auth.getSession().then(({ data: { session } }) => {
        const token = session?.access_token
        if (!token) return
        fetch('/api/driver-location', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({ load_id: loadId, latitude, longitude }),
        }).catch(() => {})
      })
    },
    [loadId, supabase]
  )
  return sendIfAllowed
}

function formatAddress(addr: string | null, city: string | null, state: string | null, zip: string | null): string {
  const parts = [addr, city, state, zip].filter(Boolean)
  return parts.length ? parts.join(', ') : '—'
}

function formatWindow(start: string | null, end: string | null): string {
  if (!start && !end) return '—'
  const s = start ? new Date(start).toLocaleString(undefined, { month: 'short', day: 'numeric', year: 'numeric', hour: 'numeric', minute: '2-digit' }) : '?'
  const e = end ? new Date(end).toLocaleString(undefined, { hour: 'numeric', minute: '2-digit' }) : '?'
  return start && end ? `${s} – ${e}` : s
}

export default function DriverIronGatePage() {
  const user = useAtomValue(userAtom)
  const authReady = useAtomValue(authReadyAtom)
  const router = useRouter()
  const [load, setLoad] = useState<{
    id: string
    origin: string
    destination: string
    pickup_appointment: string
    delivery_appointment: string
  } | null>(null)
  const [loading, setLoading] = useState(true)
  const [locationSharing, setLocationSharing] = useState(false)
  const watchIdRef = useRef<number | null>(null)
  const wakeLockRef = useRef<{ release: () => Promise<void> } | null>(null)
  const sendPosition = useThrottledReport(load?.id)

  useEffect(() => {
    if (authReady && !user) router.replace('/login')
  }, [authReady, user, router])

  useEffect(() => {
    if (!user?.id) {
      setLoad(null)
      setLoading(false)
      return
    }
    let cancelled = false
    async function fetchAssignedLoad() {
      const supabase = getSupabase()
      if (!supabase || !user) return
      const { data: driver } = await supabase.from('drivers').select('id').eq('profile_id', user.id).single()
      if (cancelled || !driver) {
        setLoad(null)
        setLoading(false)
        return
      }
      const { data: row } = await supabase
        .from('loads')
        .select('id, origin_address, origin_city, origin_state, origin_zip, dest_address, dest_city, dest_state, dest_zip, pickup_window_start, pickup_window_end, delivery_window_start, delivery_window_end')
        .eq('driver_id', driver.id)
        .in('status', ['assigned', 'in_transit', 'pickup_verified', 'delivery_verified'])
        .order('created_at', { ascending: false })
        .limit(1)
        .single()
      if (cancelled) return
      if (!row) {
        setLoad(null)
      } else {
        setLoad({
          id: row.id,
          origin: formatAddress(row.origin_address, row.origin_city, row.origin_state, row.origin_zip),
          destination: formatAddress(row.dest_address, row.dest_city, row.dest_state, row.dest_zip),
          pickup_appointment: formatWindow(row.pickup_window_start, row.pickup_window_end),
          delivery_appointment: formatWindow(row.delivery_window_start, row.delivery_window_end),
        })
      }
      setLoading(false)
    }
    fetchAssignedLoad()
    return () => { cancelled = true }
  }, [user?.id])

  // Continuous location: watchPosition so the browser can keep delivering updates
  // (e.g. when app is in foreground or, on some devices, in background). Throttle API to every 20s.
  useEffect(() => {
    if (!load?.id) {
      if (watchIdRef.current != null) {
        navigator.geolocation.clearWatch(watchIdRef.current)
        watchIdRef.current = null
      }
      setLocationSharing(false)
      return
    }

    const watchId = navigator.geolocation.watchPosition(
      (position) => {
        setLocationSharing(true)
        sendPosition(position.coords.latitude, position.coords.longitude)
      },
      () => setLocationSharing(false),
      { enableHighAccuracy: true, maximumAge: 30_000, timeout: 15_000 }
    )
    watchIdRef.current = watchId
    return () => {
      navigator.geolocation.clearWatch(watchId)
      watchIdRef.current = null
      setLocationSharing(false)
    }
  }, [load?.id, sendPosition])

  // Screen Wake Lock: keep device from sleeping while app is visible and driver has a load,
  // so location updates keep firing. Released when tab is hidden or load is cleared.
  useEffect(() => {
    if (!load?.id || typeof document === 'undefined') return

    const requestWakeLock = async () => {
      if (!('wakeLock' in navigator)) return
      try {
        const wl = await (navigator as unknown as { wakeLock: { request: (t: string) => Promise<{ release: () => Promise<void> }> } }).wakeLock.request('screen')
        wakeLockRef.current = wl
      } catch {
        wakeLockRef.current = null
      }
    }

    const releaseWakeLock = () => {
      if (wakeLockRef.current) {
        wakeLockRef.current.release().catch(() => {})
        wakeLockRef.current = null
      }
    }

    if (document.visibilityState === 'visible') requestWakeLock()

    const onVisibilityChange = () => {
      if (document.visibilityState === 'visible') requestWakeLock()
      else releaseWakeLock()
    }
    document.addEventListener('visibilitychange', onVisibilityChange)

    return () => {
      document.removeEventListener('visibilitychange', onVisibilityChange)
      releaseWakeLock()
    }
  }, [load?.id])

  if (authReady && !user) return null

  return (
    <div className="flex min-h-screen flex-col bg-iron-950">
      <header className="border-b border-iron-800 bg-iron-900/80">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Logo variant="icon" className="h-8 w-8 text-iron-100" />
          <div className="flex items-center gap-3">
            <span className="text-xs text-iron-500">IronGate view</span>
            <button type="button" onClick={async () => { await signOut(); router.push('/') }} className="text-xs text-iron-400 hover:text-iron-200">Sign out</button>
          </div>
        </div>
      </header>

      <main className="mx-auto w-full max-w-lg flex-1 px-4 py-6">
        <div className="mb-4 rounded-lg border border-amber-800/50 bg-amber-900/20 px-3 py-2 text-xs text-amber-200">
          Restricted view: Pay rate, broker name, and shipper contact are hidden to protect margins and prevent back-solicitation.
        </div>

        <h1 className="text-lg font-bold text-iron-100">Your assigned load</h1>

        {loading ? (
          <p className="mt-4 text-sm text-iron-400">Loading…</p>
        ) : !load ? (
          <p className="mt-4 text-sm text-iron-400">No load assigned. Check with your carrier.</p>
        ) : (
          <>
            <div className="mt-4 space-y-4">
              <div className="rounded-xl border border-iron-700 bg-iron-800/50 p-4">
                <p className="text-xs uppercase tracking-wider text-iron-500">Pickup</p>
                <p className="mt-1 font-medium text-iron-200">{load.origin}</p>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(load.origin)}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-blue-400 hover:underline">
                  Open in maps →
                </a>
                <p className="mt-2 text-sm text-iron-400">Appointment: {load.pickup_appointment}</p>
              </div>

              <div className="rounded-xl border border-iron-700 bg-iron-800/50 p-4">
                <p className="text-xs uppercase tracking-wider text-iron-500">Delivery</p>
                <p className="mt-1 font-medium text-iron-200">{load.destination}</p>
                <a href={`https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(load.destination)}`} target="_blank" rel="noopener noreferrer" className="mt-2 inline-block text-sm text-blue-400 hover:underline">
                  Open in maps →
                </a>
                <p className="mt-2 text-sm text-iron-400">Appointment: {load.delivery_appointment}</p>
              </div>
            </div>

            <p className="mt-4 text-center text-xs text-iron-400">
              {locationSharing ? 'Sharing your location with the broker.' : 'Requesting location…'}
            </p>
            <p className="mt-1 text-center text-xs text-iron-500">Keep this app open (or in background) so tracking stays active.</p>
            <div className="mt-8">
              <Link
                href={`/driver/${load.id}/qr`}
                className="flex w-full items-center justify-center rounded-xl bg-blue-600 py-3 font-semibold text-white hover:bg-blue-500"
              >
                Show IronGate QR code
              </Link>
              <p className="mt-2 text-center text-xs text-iron-500">Shipper scans this for verification (geofenced, timestamped).</p>
            </div>
          </>
        )}
      </main>
    </div>
  )
}
