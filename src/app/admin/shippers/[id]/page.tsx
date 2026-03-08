'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { getSupabase } from '@/lib/supabase/client'
import { Logo } from '@/components/Logo'
import { ArrowLeft, Package, Loader2 } from 'lucide-react'

function formatLoc(city: string | null, state: string | null) {
  return [city, state].filter(Boolean).join(', ') || '—'
}

type LoadRow = {
  id: string
  load_number: string
  status: string
  origin: string
  destination: string
  commodity: string | null
  weight_lbs: number | null
}

export default function AdminShipperViewPage() {
  const params = useParams()
  const id = params?.id as string
  const [shipper, setShipper] = useState<{ legal_name: string; email: string; full_name: string | null } | null>(null)
  const [loads, setLoads] = useState<LoadRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!id) return
    let cancelled = false
    async function fetchData() {
      const client = getSupabase()
      if (!client) {
        setError('Supabase not configured')
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      const [shipperRes, loadsRes] = await Promise.all([
        client.from('shippers').select('profile_id, legal_name').eq('id', id).single(),
        client.from('loads').select('id, load_number, status, origin_city, origin_state, dest_city, dest_state, commodity, weight_lbs').eq('shipper_id', id).order('created_at', { ascending: false }),
      ])
      if (cancelled) return
      if (shipperRes.error || !shipperRes.data) {
        setError(shipperRes.error?.message ?? 'Shipper not found')
        setLoading(false)
        return
      }
      const profileId = shipperRes.data.profile_id
      let email = '—'
      let full_name: string | null = null
      if (profileId) {
        const profileRes = await client.from('profiles').select('email, full_name').eq('id', profileId).single()
        if (!cancelled && profileRes.data) {
          email = profileRes.data.email ?? '—'
          full_name = profileRes.data.full_name ?? null
        }
      }
      setShipper({
        legal_name: shipperRes.data.legal_name,
        email,
        full_name,
      })
      setLoads(
        (loadsRes.data ?? []).map((r) => ({
          id: r.id,
          load_number: r.load_number,
          status: r.status,
          origin: formatLoc(r.origin_city, r.origin_state),
          destination: formatLoc(r.dest_city, r.dest_state),
          commodity: r.commodity ?? null,
          weight_lbs: r.weight_lbs ?? null,
        }))
      )
      setLoading(false)
    }
    fetchData()
    return () => { cancelled = true }
  }, [id])

  return (
    <div className="min-h-screen bg-background text-[#F9FAFB]">
      <header className="sticky top-0 z-10 border-b border-divider bg-surface">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="inline-flex">
            <Logo className="text-white" />
          </Link>
          <div className="flex items-center gap-4">
            <Link href="/admin" className="flex items-center gap-1.5 text-sm text-[#A3A3A3] hover:text-primary">
              <ArrowLeft className="h-4 w-4" /> Master Admin
            </Link>
            <Link href="/admin/support" className="text-sm text-[#A3A3A3] hover:text-primary">Support</Link>
            <Link href="/dashboard" className="rounded-lg border border-primary/50 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20">Dashboard</Link>
          </div>
        </div>
      </header>

      <main className="p-4 sm:p-6 max-w-4xl mx-auto">
        {error && (
          <p className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
        )}
        {loading ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-primary" />
          </div>
        ) : !shipper ? (
          <p className="text-[#A3A3A3]">Shipper not found.</p>
        ) : (
          <>
            <div className="mb-8 flex items-center gap-3">
              <Package className="h-8 w-8 text-primary" />
              <div>
                <h1 className="font-display text-xl font-bold text-primary">{shipper.legal_name}</h1>
                <p className="text-sm text-[#A3A3A3]">{shipper.email}</p>
                <p className="text-xs text-[#525252] mt-0.5">Shipper · Full access view (admin/support)</p>
              </div>
            </div>

            <section className="rounded-xl border border-divider bg-surface overflow-hidden">
              <div className="border-b border-divider px-4 py-3 font-display text-sm font-semibold text-[#A3A3A3] flex items-center gap-2">
                <Package className="h-4 w-4" /> Loads ({loads.length})
              </div>
              {loads.length === 0 ? (
                <div className="px-4 py-8 text-center text-sm text-[#A3A3A3]">No loads.</div>
              ) : (
                <ul className="divide-y divide-divider">
                  {loads.map((l) => (
                    <li key={l.id} className="px-4 py-3 flex flex-wrap items-center gap-2">
                      <span className="font-medium text-primary">{l.load_number}</span>
                      <span className="text-[#A3A3A3]">{l.origin} → {l.destination}</span>
                      {l.commodity && <span className="text-xs text-[#525252]">{l.commodity}</span>}
                      {l.weight_lbs != null && <span className="text-xs text-[#525252]">{l.weight_lbs} lbs</span>}
                      <span className="rounded bg-[#333] px-1.5 py-0.5 text-xs">{l.status}</span>
                    </li>
                  ))}
                </ul>
              )}
            </section>
          </>
        )}
      </main>
    </div>
  )
}
