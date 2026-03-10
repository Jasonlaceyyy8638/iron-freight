'use client'

import { useState, useEffect, useRef } from 'react'
import dynamic from 'next/dynamic'
import { useAtomValue } from 'jotai'
import { userAtom } from '@/lib/store'
import { getSupabase } from '@/lib/supabase/client'
import { compressImageForUpload } from '@/lib/image-compression'
import { Upload, Loader2, MapPin, X } from 'lucide-react'
import type { GeofenceCircle, GeofenceMarker } from '@/components/GeofenceMap'

const GeofenceMap = dynamic(
  () => import('@/components/GeofenceMap').then((mod) => ({ default: mod.GeofenceMap })),
  { ssr: false }
)

interface MyLoadRow {
  id: string
  load_number: string
  status: string
  origin: string
  destination: string
  bol_image_url: string | null
  driver_id?: string | null
  driver_name?: string | null
  origin_geofence_lat?: number | null
  origin_geofence_lng?: number | null
  origin_geofence_radius_meters?: number | null
  dest_geofence_lat?: number | null
  dest_geofence_lng?: number | null
  dest_geofence_radius_meters?: number | null
}

function formatLoc(city: string | null, state: string | null) {
  return [city, state].filter(Boolean).join(', ') || '—'
}

function BOLViewLink({ path }: { path: string }) {
  const [href, setHref] = useState<string | null>(null)
  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) return
    supabase.storage.from('documents').createSignedUrl(path, 3600).then(({ data }) => {
      if (data?.signedUrl) setHref(data.signedUrl)
    })
  }, [path])
  if (!href) return <span className="text-xs text-iron-500">…</span>
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1 text-xs font-medium text-[#C1FF00] hover:underline">
      View BOL
    </a>
  )
}

const DISPATCHED_STATUSES = ['assigned', 'in_transit', 'pickup_verified', 'delivery_verified']

function TrackDriverMap({
  load,
  onClose,
}: {
  load: MyLoadRow
  onClose: () => void
}) {
  const [driverLoc, setDriverLoc] = useState<{ lat: number; lng: number } | null>(null)
  const [loading, setLoading] = useState(true)
  const supabase = getSupabase()

  useEffect(() => {
    if (!supabase || !load.id) return
    let cancelled = false
    async function poll() {
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token || cancelled) return
      const res = await fetch(`/api/driver-location?load_id=${encodeURIComponent(load.id)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      if (cancelled) return
      const data = await res.json().catch(() => ({}))
      if (data.latitude != null && data.longitude != null) {
        setDriverLoc({ lat: data.latitude, lng: data.longitude })
      }
      setLoading(false)
    }
    poll()
    const interval = setInterval(poll, 15_000)
    return () => {
      cancelled = true
      clearInterval(interval)
    }
  }, [supabase, load.id])

  const circles: GeofenceCircle[] = []
  if (load.origin_geofence_lat != null && load.origin_geofence_lng != null) {
    circles.push({
      lat: Number(load.origin_geofence_lat),
      lng: Number(load.origin_geofence_lng),
      radiusMeters: load.origin_geofence_radius_meters ?? 500,
      label: 'Pickup',
    })
  }
  if (load.dest_geofence_lat != null && load.dest_geofence_lng != null) {
    circles.push({
      lat: Number(load.dest_geofence_lat),
      lng: Number(load.dest_geofence_lng),
      radiusMeters: load.dest_geofence_radius_meters ?? 500,
      label: 'Delivery',
    })
  }
  const markers: GeofenceMarker[] = []
  if (driverLoc) {
    markers.push({
      lat: driverLoc.lat,
      lng: driverLoc.lng,
      label: load.driver_name ? `Driver: ${load.driver_name}` : 'Driver',
      color: '#3B82F6',
    })
  }
  const center: [number, number] =
    driverLoc
      ? [driverLoc.lat, driverLoc.lng]
      : circles.length
        ? [circles[0].lat, circles[0].lng]
        : [39.5, -98.5]

  return (
    <div className="rounded-lg border border-iron-700 bg-iron-900/50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-medium text-iron-200">
          Live location for load {load.load_number}
          {load.driver_name && ` — ${load.driver_name}`}
        </span>
        <button type="button" onClick={onClose} className="rounded p-1 text-iron-400 hover:bg-iron-800 hover:text-iron-200">
          <X className="h-4 w-4" />
        </button>
      </div>
      {loading && !driverLoc ? (
        <p className="py-8 text-center text-sm text-iron-400">Waiting for driver location… (driver must have the load open on their device)</p>
      ) : (
        <GeofenceMap
          center={center}
          zoom={circles.length + markers.length > 1 ? undefined : 10}
          circles={circles}
          markers={markers}
          height="280px"
          className="w-full"
        />
      )}
    </div>
  )
}

export default function MyLoadsPage() {
  const user = useAtomValue(userAtom)
  const [showPostModal, setShowPostModal] = useState(false)
  const [loads, setLoads] = useState<MyLoadRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteSending, setInviteSending] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)
  const [uploadingLoadId, setUploadingLoadId] = useState<string | null>(null)
  const [bolUploadError, setBolUploadError] = useState<string | null>(null)
  const [trackLoadNumberInput, setTrackLoadNumberInput] = useState('')
  const [trackLoad, setTrackLoad] = useState<MyLoadRow | null>(null)
  const [trackLoadError, setTrackLoadError] = useState<string | null>(null)
  const [trackLoadSearching, setTrackLoadSearching] = useState(false)
  const bolInputRef = useRef<HTMLInputElement>(null)
  const isBroker = user?.role === 'broker'
  const isCarrier = user?.role === 'carrier'
  const canUploadBOL = isBroker || isCarrier

  useEffect(() => {
    const userId = user?.id
    if (!userId) {
      setLoads([])
      setLoading(false)
      return
    }
    let cancelled = false
    async function fetchMyLoads() {
      const supabase = getSupabase()
      if (!supabase) {
        setError('Supabase not configured')
        setLoads([])
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      if (isBroker) {
        const { data, error: e } = await supabase
          .from('loads')
          .select(`
            id, load_number, status, origin_city, origin_state, dest_city, dest_state, bol_image_url,
            driver_id, origin_geofence_lat, origin_geofence_lng, origin_geofence_radius_meters,
            dest_geofence_lat, dest_geofence_lng, dest_geofence_radius_meters,
            drivers(full_name)
          `)
          .eq('broker_profile_id', userId)
          .order('created_at', { ascending: false })
        if (cancelled) return
        if (e) setError(e.message)
        else setLoads((data ?? []).map((r: Record<string, unknown>) => ({
          id: r.id as string,
          load_number: r.load_number as string,
          status: r.status as string,
          origin: formatLoc(r.origin_city as string | null, r.origin_state as string | null),
          destination: formatLoc(r.dest_city as string | null, r.dest_state as string | null),
          bol_image_url: (r.bol_image_url as string | null) ?? null,
          driver_id: r.driver_id as string | null ?? null,
          driver_name: (r.drivers as { full_name?: string } | null)?.full_name ?? null,
          origin_geofence_lat: r.origin_geofence_lat as number | null ?? null,
          origin_geofence_lng: r.origin_geofence_lng as number | null ?? null,
          origin_geofence_radius_meters: r.origin_geofence_radius_meters as number | null ?? null,
          dest_geofence_lat: r.dest_geofence_lat as number | null ?? null,
          dest_geofence_lng: r.dest_geofence_lng as number | null ?? null,
          dest_geofence_radius_meters: r.dest_geofence_radius_meters as number | null ?? null,
        })))
      } else if (isCarrier) {
        const { data: carrier } = await supabase.from('carriers').select('id').eq('profile_id', userId).single()
        if (cancelled || !carrier) {
          setLoads([])
          setLoading(false)
          return
        }
        const { data, error: e } = await supabase
          .from('loads')
          .select('id, load_number, status, origin_city, origin_state, dest_city, dest_state, bol_image_url')
          .eq('carrier_id', carrier.id)
          .order('created_at', { ascending: false })
        if (cancelled) return
        if (e) setError(e.message)
        else setLoads((data ?? []).map((r) => ({
          id: r.id,
          load_number: r.load_number,
          status: r.status,
          origin: formatLoc(r.origin_city, r.origin_state),
          destination: formatLoc(r.dest_city, r.dest_state),
          bol_image_url: r.bol_image_url ?? null,
        })))
      } else {
        const { data: driver } = await supabase.from('drivers').select('id').eq('profile_id', userId).single()
        if (cancelled || !driver) {
          setLoads([])
          setLoading(false)
          return
        }
        const { data, error: e } = await supabase
          .from('loads')
          .select('id, load_number, status, origin_city, origin_state, dest_city, dest_state, bol_image_url')
          .eq('driver_id', driver.id)
          .order('created_at', { ascending: false })
        if (cancelled) return
        if (e) setError(e.message)
        else setLoads((data ?? []).map((r) => ({
          id: r.id,
          load_number: r.load_number,
          status: r.status,
          origin: formatLoc(r.origin_city, r.origin_state),
          destination: formatLoc(r.dest_city, r.dest_state),
          bol_image_url: r.bol_image_url ?? null,
        })))
      }
      setLoading(false)
    }
    fetchMyLoads()
    return () => { cancelled = true }
  }, [user?.id, isBroker, isCarrier])

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-iron-100">My Loads</h1>
        {isBroker && (
          <button
            type="button"
            onClick={() => setShowPostModal(true)}
            className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500"
          >
            + Post load
          </button>
        )}
      </div>

      {isBroker && (
        <>
          <div className="mb-6 rounded-xl border border-iron-700 bg-iron-800/50 p-4">
            <h2 className="text-sm font-semibold text-iron-200">Invite team member</h2>
            <p className="mt-1 text-xs text-iron-500">Send an invite from Info@getironfreight.com so they can sign in or sign up as a broker.</p>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                const supabase = getSupabase()
                if (!supabase) return
                setInviteSending(true)
                setInviteSuccess(null)
                setError(null)
                try {
                  const { data: { session } } = await supabase.auth.getSession()
                  const token = session?.access_token
                  if (!token) {
                    setError('Not signed in')
                    setInviteSending(false)
                    return
                  }
                  const res = await fetch('/api/invites/send', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
                    body: JSON.stringify({
                      type: 'broker',
                      email: inviteEmail.trim(),
                      full_name: inviteName.trim() || undefined,
                    }),
                  })
                  const data = await res.json().catch(() => ({}))
                  if (!res.ok) {
                    setError(data.error ?? 'Failed to send invite')
                    setInviteSending(false)
                    return
                  }
                  setInviteSuccess(`Invite sent to ${inviteEmail.trim()}`)
                  setInviteEmail('')
                  setInviteName('')
                } finally {
                  setInviteSending(false)
                }
              }}
              className="mt-3 flex flex-wrap items-end gap-3"
            >
              <div>
                <label className="block text-xs font-medium text-iron-400 mb-1">Email</label>
                <input
                  type="email"
                  value={inviteEmail}
                  onChange={(e) => setInviteEmail(e.target.value)}
                  required
                  placeholder="teammate@company.com"
                  className="w-48 rounded border border-iron-600 bg-iron-900 px-3 py-2 text-sm text-iron-200 focus:border-[#C1FF00] focus:outline-none"
                />
              </div>
              <div>
                <label className="block text-xs font-medium text-iron-400 mb-1">Name (optional)</label>
                <input
                  type="text"
                  value={inviteName}
                  onChange={(e) => setInviteName(e.target.value)}
                  placeholder="Full name"
                  className="w-40 rounded border border-iron-600 bg-iron-900 px-3 py-2 text-sm text-iron-200 focus:border-[#C1FF00] focus:outline-none"
                />
              </div>
              <button
                type="submit"
                disabled={inviteSending}
                className="rounded-lg bg-[#C1FF00] px-4 py-2 text-sm font-medium text-iron-950 hover:bg-[#C1FF00]/90 disabled:opacity-50"
              >
                {inviteSending ? 'Sending…' : 'Send invite'}
              </button>
            </form>
            {inviteSuccess && <p className="mt-2 text-sm text-[#C1FF00]">{inviteSuccess}</p>}
          </div>
          <div className="mb-6 rounded-xl border border-iron-700 bg-iron-800/50 p-4">
            <h2 className="text-sm font-semibold text-iron-200">Bids received</h2>
            <p className="mt-1 text-xs text-iron-500">Carrier safety scores and verification status shown on each bid.</p>
            <div className="mt-3 space-y-2">
              {[
                { carrier: 'ABC Trucking', mc: 'MC 111222', amount: 1850, verified: true },
                { carrier: 'Elite Freight', mc: 'MC 123456', amount: 1920, verified: true },
              ].map((b) => (
                <div key={b.mc} className="flex items-center justify-between rounded-lg border border-iron-600 bg-iron-900 px-3 py-2">
                  <div>
                    <span className="text-sm font-medium text-iron-200">{b.carrier}</span>
                    <span className="ml-2 text-xs text-iron-500">{b.mc}</span>
                    {b.verified && <span className="ml-2 text-xs text-green-400">Verified</span>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-iron-300">${(b.amount / 100).toFixed(0)}</span>
                    <button
                      type="button"
                      className="rounded bg-green-600 px-2 py-1 text-xs font-medium text-white hover:bg-green-500"
                    >
                      Award
                    </button>
                  </div>
                </div>
              ))}
            </div>
            <p className="mt-2 text-xs text-iron-500">Award: load moves to carrier&apos;s &quot;Assigned&quot; table (seamless handoff).</p>
          </div>
        </>
      )}

      {isBroker && (
        <div className="mb-6 rounded-xl border border-iron-700 bg-iron-800/50 p-4">
          <h2 className="text-sm font-semibold text-iron-200">Track driver (live map)</h2>
          <p className="mt-1 text-xs text-iron-500">Enter your load number to see the driver&apos;s live location on the map.</p>
          <form
            className="mt-3 flex flex-wrap items-end gap-3"
            onSubmit={async (e) => {
              e.preventDefault()
              const num = trackLoadNumberInput.trim()
              if (!num || !user?.id) return
              const supabase = getSupabase()
              if (!supabase) return
              setTrackLoadError(null)
              setTrackLoadSearching(true)
              try {
                const { data, error: e2 } = await supabase
                  .from('loads')
                  .select(`
                    id, load_number, status, origin_city, origin_state, dest_city, dest_state, bol_image_url,
                    driver_id, origin_geofence_lat, origin_geofence_lng, origin_geofence_radius_meters,
                    dest_geofence_lat, dest_geofence_lng, dest_geofence_radius_meters,
                    drivers(full_name)
                  `)
                  .eq('broker_profile_id', user.id)
                  .eq('load_number', num)
                  .maybeSingle()
                if (e2) {
                  setTrackLoadError(e2.message)
                  setTrackLoad(null)
                  return
                }
                if (!data) {
                  setTrackLoadError('Load not found. Check the load number.')
                  setTrackLoad(null)
                  return
                }
                const r = data as Record<string, unknown>
                if (!r.driver_id || !DISPATCHED_STATUSES.includes((r.status as string) ?? '')) {
                  setTrackLoadError('That load has no dispatched driver yet.')
                  setTrackLoad(null)
                  return
                }
                setTrackLoad({
                  id: r.id as string,
                  load_number: r.load_number as string,
                  status: r.status as string,
                  origin: formatLoc(r.origin_city as string | null, r.origin_state as string | null),
                  destination: formatLoc(r.dest_city as string | null, r.dest_state as string | null),
                  bol_image_url: (r.bol_image_url as string | null) ?? null,
                  driver_id: r.driver_id as string | null ?? null,
                  driver_name: (r.drivers as { full_name?: string } | null)?.full_name ?? null,
                  origin_geofence_lat: r.origin_geofence_lat as number | null ?? null,
                  origin_geofence_lng: r.origin_geofence_lng as number | null ?? null,
                  origin_geofence_radius_meters: r.origin_geofence_radius_meters as number | null ?? null,
                  dest_geofence_lat: r.dest_geofence_lat as number | null ?? null,
                  dest_geofence_lng: r.dest_geofence_lng as number | null ?? null,
                  dest_geofence_radius_meters: r.dest_geofence_radius_meters as number | null ?? null,
                })
              } finally {
                setTrackLoadSearching(false)
              }
            }}
          >
            <div>
              <label htmlFor="track-load-number" className="block text-xs font-medium text-iron-400 mb-1">Load number</label>
              <input
                id="track-load-number"
                type="text"
                value={trackLoadNumberInput}
                onChange={(e) => setTrackLoadNumberInput(e.target.value)}
                placeholder="e.g. IF-99284"
                className="w-48 rounded border border-iron-600 bg-iron-900 px-3 py-2 text-sm text-iron-200 placeholder:text-iron-500 focus:border-[#C1FF00] focus:outline-none"
              />
            </div>
            <button
              type="submit"
              disabled={trackLoadSearching || !trackLoadNumberInput.trim()}
              className="inline-flex items-center gap-2 rounded-lg bg-[#C1FF00] px-4 py-2 text-sm font-medium text-iron-950 hover:bg-[#C1FF00]/90 disabled:opacity-50"
            >
              {trackLoadSearching ? <Loader2 className="h-4 w-4 animate-spin" /> : <MapPin className="h-4 w-4" />}
              {trackLoadSearching ? 'Looking up…' : 'Show map'}
            </button>
          </form>
          {trackLoadError && <p className="mt-2 text-sm text-red-400">{trackLoadError}</p>}
          {trackLoad && (
            <div className="mt-4">
              <TrackDriverMap load={trackLoad} onClose={() => { setTrackLoad(null); setTrackLoadError(null) }} />
            </div>
          )}
        </div>
      )}

      {bolUploadError && <p className="mb-4 text-sm text-red-300">{bolUploadError}</p>}
      <div className="overflow-x-auto rounded-xl border border-iron-700">
        <table className="min-w-full divide-y divide-iron-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-iron-400">Route</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-iron-400">Status</th>
              {isBroker && <th className="px-4 py-3 text-left text-xs font-medium uppercase text-iron-400">Bids</th>}
              {isBroker && <th className="px-4 py-3 text-left text-xs font-medium uppercase text-iron-400">Winner</th>}
              {isCarrier && <th className="px-4 py-3 text-left text-xs font-medium uppercase text-iron-400">Action</th>}
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-iron-400">BOL</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-iron-800">
            {loading ? (
              <tr><td colSpan={isBroker ? 5 : isCarrier ? 4 : 3} className="px-4 py-8 text-center text-sm text-iron-400">Loading…</td></tr>
            ) : error ? (
              <tr><td colSpan={isBroker ? 5 : isCarrier ? 4 : 3} className="px-4 py-4 text-sm text-red-300">{error}</td></tr>
            ) : loads.length === 0 ? (
              <tr><td colSpan={isBroker ? 5 : isCarrier ? 4 : 3} className="px-4 py-8 text-center text-sm text-iron-400">No loads.</td></tr>
            ) : loads.map((load) => (
              <tr key={load.id} className="hover:bg-iron-800/50">
                <td className="px-4 py-3 text-sm font-medium text-iron-200">{load.origin} → {load.destination}</td>
                <td className="px-4 py-3">
                  <span className="inline-flex rounded-full bg-iron-700 px-2 py-0.5 text-xs text-iron-300">{load.status.replace('_', ' ')}</span>
                </td>
                {isBroker && <td className="px-4 py-3 text-sm text-iron-400">—</td>}
                {isBroker && <td className="px-4 py-3 text-sm text-iron-400">—</td>}
                {isCarrier && (load.status === 'assigned' || load.status === 'posted') && (
                  <td className="px-4 py-3">
                    <select className="rounded border border-iron-600 bg-iron-800 px-2 py-1 text-sm text-iron-200">
                      <option value="">Assign driver</option>
                    </select>
                  </td>
                )}
                <td className="px-4 py-3">
                  {uploadingLoadId === load.id ? (
                    <span className="inline-flex items-center gap-1 text-xs text-iron-400">
                      <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
                    </span>
                  ) : load.bol_image_url ? (
                    <BOLViewLink path={load.bol_image_url} />
                  ) : canUploadBOL ? (
                    <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-[#C1FF00] hover:underline">
                      <Upload className="h-3.5 w-3.5" />
                      <span>Upload BOL</span>
                      <input
                        ref={bolInputRef}
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        className="sr-only"
                        onChange={async (e) => {
                          const file = e.target.files?.[0]
                          e.target.value = ''
                          const supabase = getSupabase()
                          if (!file || !supabase) return
                          setBolUploadError(null)
                          setUploadingLoadId(load.id)
                          try {
                            const compressed = await compressImageForUpload(file)
                            const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
                            const path = `bol/${load.id}/${crypto.randomUUID()}.${ext === 'png' || ext === 'webp' ? ext : 'jpg'}`
                            const { error: upErr } = await supabase.storage.from('documents').upload(path, compressed, { upsert: true })
                            if (upErr) throw upErr
                            const { error: dbErr } = await supabase.from('loads').update({ bol_image_url: path }).eq('id', load.id)
                            if (dbErr) throw dbErr
                            setLoads((prev) => prev.map((l) => (l.id === load.id ? { ...l, bol_image_url: path } : l)))
                          } catch (err) {
                            setBolUploadError(err instanceof Error ? err.message : 'Upload failed')
                          } finally {
                            setUploadingLoadId(null)
                          }
                        }}
                      />
                    </label>
                  ) : (
                    <span className="text-xs text-iron-500">—</span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {showPostModal && (
        <div className="fixed inset-0 z-20 flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-md rounded-xl border border-iron-700 bg-iron-900 p-6">
            <h3 className="text-lg font-semibold text-iron-100">Post load</h3>
            <p className="mt-1 text-sm text-iron-400">Buy Now or Bidding. Bids will appear in My Loads.</p>
            <div className="mt-4 space-y-3">
              <div>
                <label className="block text-xs font-medium text-iron-400">Listing type</label>
                <select className="mt-1 w-full rounded border border-iron-600 bg-iron-800 px-3 py-2 text-sm text-iron-200">
                  <option value="buy_now">Buy Now</option>
                  <option value="bidding">Bidding</option>
                </select>
              </div>
              <div>
                <label className="block text-xs font-medium text-iron-400">Origin</label>
                <input type="text" className="mt-1 w-full rounded border border-iron-600 bg-iron-800 px-3 py-2 text-sm text-iron-200" placeholder="City, ST" />
              </div>
              <div>
                <label className="block text-xs font-medium text-iron-400">Destination</label>
                <input type="text" className="mt-1 w-full rounded border border-iron-600 bg-iron-800 px-3 py-2 text-sm text-iron-200" placeholder="City, ST" />
              </div>
              <div>
                <label className="block text-xs font-medium text-iron-400">Weight (lbs)</label>
                <input type="number" className="mt-1 w-full rounded border border-iron-600 bg-iron-800 px-3 py-2 text-sm text-iron-200" placeholder="42000" />
              </div>
              <div>
                <label className="block text-xs font-medium text-iron-400">Equipment</label>
                <input type="text" className="mt-1 w-full rounded border border-iron-600 bg-iron-800 px-3 py-2 text-sm text-iron-200" placeholder="Dry Van" />
              </div>
            </div>
            <div className="mt-6 flex justify-end gap-2">
              <button type="button" onClick={() => setShowPostModal(false)} className="rounded-lg border border-iron-600 px-4 py-2 text-sm text-iron-300 hover:bg-iron-800">
                Cancel
              </button>
              <button type="button" className="rounded-lg bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-500">
                Post
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
