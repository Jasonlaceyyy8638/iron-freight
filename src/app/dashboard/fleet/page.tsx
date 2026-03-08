'use client'

import { useState, useEffect, useRef } from 'react'
import { useAtomValue } from 'jotai'
import { userAtom } from '@/lib/store'
import { getSupabase } from '@/lib/supabase/client'
import { compressImageForUpload } from '@/lib/image-compression'
import { Upload, Loader2 } from 'lucide-react'

function CDLViewLink({ path }: { path: string }) {
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
      View
    </a>
  )
}

interface DriverRow {
  id: string
  full_name: string
  cdl_number: string
  cdl_verified_at: string | null
  cdl_image_url: string | null
}

export default function FleetPage() {
  const user = useAtomValue(userAtom)
  const [drivers, setDrivers] = useState<DriverRow[]>([])
  const [carrierId, setCarrierId] = useState<string | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteSending, setInviteSending] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)
  const [uploadingDriverId, setUploadingDriverId] = useState<string | null>(null)
  const [uploadError, setUploadError] = useState<string | null>(null)
  const cdlInputRef = useRef<HTMLInputElement>(null)
  const isCarrier = user?.role === 'carrier'

  useEffect(() => {
    const userId = user?.id
    if (!isCarrier || !userId) {
      setDrivers([])
      setCarrierId(null)
      setLoading(false)
      return
    }
    let cancelled = false
    async function fetchFleet() {
      const supabase = getSupabase()
      if (!supabase) {
        setError('Supabase not configured')
        setDrivers([])
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      const { data: carrier } = await supabase.from('carriers').select('id').eq('profile_id', userId).single()
      if (cancelled || !carrier) {
        setDrivers([])
        setCarrierId(null)
        setLoading(false)
        return
      }
      setCarrierId(carrier.id)
      const { data, error: e } = await supabase
        .from('drivers')
        .select('id, full_name, cdl_number, cdl_verified_at, cdl_image_url')
        .eq('carrier_id', carrier.id)
        .order('full_name')
      if (cancelled) return
      if (e) setError(e.message)
      else setDrivers(data ?? [])
      setLoading(false)
    }
    fetchFleet()
    return () => { cancelled = true }
  }, [user?.id, isCarrier])

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-6 text-xl font-bold text-iron-100">Fleet</h1>
      {isCarrier ? (
        <>
          <p className="mb-4 text-sm text-iron-400">Verified drivers available for assignment. Assign from My Loads when you win a bid.</p>
          {error && <p className="mb-4 text-sm text-red-300">{error}</p>}

          <div className="mb-6 rounded-xl border border-iron-700 bg-iron-800/50 p-4">
            <h2 className="text-sm font-semibold text-iron-200">Invite driver</h2>
            <p className="mt-1 text-xs text-iron-500">Send an invite from Info@getironfreight.com. They’ll get a sign-in link to join your fleet.</p>
            <form
              onSubmit={async (e) => {
                e.preventDefault()
                if (!carrierId) return
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
                      type: 'carrier',
                      email: inviteEmail.trim(),
                      full_name: inviteName.trim() || undefined,
                      carrier_id: carrierId,
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
                  placeholder="driver@example.com"
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

          {uploadError && <p className="mb-4 text-sm text-red-300">{uploadError}</p>}
          <div className="overflow-x-auto rounded-xl border border-iron-700">
            <table className="min-w-full divide-y divide-iron-700">
              <thead>
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-iron-400">Driver</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-iron-400">CDL</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-iron-400">Verified</th>
                  <th className="px-4 py-3 text-left text-xs font-medium uppercase text-iron-400">CDL doc</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-iron-800">
                {loading ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-iron-400">Loading…</td></tr>
                ) : drivers.length === 0 ? (
                  <tr><td colSpan={4} className="px-4 py-8 text-center text-sm text-iron-400">No drivers yet.</td></tr>
                ) : drivers.map((d) => (
                  <tr key={d.id} className="hover:bg-iron-800/50">
                    <td className="px-4 py-3 text-sm font-medium text-iron-200">{d.full_name}</td>
                    <td className="px-4 py-3 text-sm text-iron-400">***{d.cdl_number.slice(-4)}</td>
                    <td className="px-4 py-3 text-sm text-green-400">{d.cdl_verified_at ? 'Yes' : '—'}</td>
                    <td className="px-4 py-3">
                      {uploadingDriverId === d.id ? (
                        <span className="inline-flex items-center gap-1 text-xs text-iron-400">
                          <Loader2 className="h-3.5 w-3.5 animate-spin" /> Uploading…
                        </span>
                      ) : d.cdl_image_url ? (
                        <CDLViewLink path={d.cdl_image_url} />
                      ) : (
                        <label className="inline-flex cursor-pointer items-center gap-1.5 text-xs font-medium text-[#C1FF00] hover:underline">
                          <Upload className="h-3.5 w-3.5" />
                          <span>Upload CDL</span>
                          <input
                            ref={cdlInputRef}
                            type="file"
                            accept="image/jpeg,image/png,image/webp"
                            className="sr-only"
                            onChange={async (e) => {
                              const file = e.target.files?.[0]
                              e.target.value = ''
                              const supabase = getSupabase()
                              if (!file || !supabase) return
                              setUploadError(null)
                              setUploadingDriverId(d.id)
                              try {
                                const compressed = await compressImageForUpload(file)
                                const ext = file.name.split('.').pop()?.toLowerCase() || 'jpg'
                                const path = `cdl/${d.id}/${crypto.randomUUID()}.${ext === 'png' || ext === 'webp' ? ext : 'jpg'}`
                                const { error: upErr } = await supabase.storage.from('documents').upload(path, compressed, { upsert: true })
                                if (upErr) throw upErr
                                const { error: dbErr } = await supabase.from('drivers').update({ cdl_image_url: path }).eq('id', d.id)
                                if (dbErr) throw dbErr
                                setDrivers((prev) => prev.map((dr) => (dr.id === d.id ? { ...dr, cdl_image_url: path } : dr)))
                              } catch (err) {
                                setUploadError(err instanceof Error ? err.message : 'Upload failed')
                              } finally {
                                setUploadingDriverId(null)
                              }
                            }}
                          />
                        </label>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </>
      ) : (
        <p className="text-sm text-iron-500">Fleet is available to carriers. Brokers see carrier verification in Bids Received.</p>
      )}
    </div>
  )
}
