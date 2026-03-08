'use client'

import { useState, useEffect } from 'react'
import { useAtomValue } from 'jotai'
import { userAtom } from '@/lib/store'
import { getSupabase } from '@/lib/supabase/client'

type LoadStatus = 'draft' | 'posted' | 'assigned' | 'in_transit' | 'pickup_verified' | 'delivery_verified' | 'completed' | 'cancelled'

interface LoadRow {
  id: string
  load_number: string
  status: string
  origin: string
  destination: string
  weight_lbs: number | null
  commodity: string | null
}

function formatLocation(city: string | null, state: string | null): string {
  if (city && state) return `${city}, ${state}`
  return [city, state].filter(Boolean).join(', ') || '—'
}

export default function LoadBoardPage() {
  const user = useAtomValue(userAtom)
  const [filter, setFilter] = useState<'all' | LoadStatus>('all')
  const [loads, setLoads] = useState<LoadRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchLoads() {
      setLoading(true)
      setError(null)
      const supabase = getSupabase()
      if (!supabase) {
        setError('Supabase not configured')
        setLoads([])
        setLoading(false)
        return
      }
      const q = supabase
        .from('loads')
        .select('id, load_number, status, origin_city, origin_state, dest_city, dest_state, weight_lbs, commodity')
        .order('created_at', { ascending: false })
      if (filter !== 'all') {
        q.eq('status', filter)
      }
      const { data, error: e } = await q
      if (cancelled) return
      if (e) {
        setError(e.message)
        setLoads([])
      } else {
        setLoads(
          (data ?? []).map((row) => ({
            id: row.id,
            load_number: row.load_number,
            status: row.status,
            origin: formatLocation(row.origin_city, row.origin_state),
            destination: formatLocation(row.dest_city, row.dest_state),
            weight_lbs: row.weight_lbs,
            commodity: row.commodity,
          }))
        )
      }
      setLoading(false)
    }
    fetchLoads()
    return () => {
      cancelled = true
    }
  }, [filter])

  const statusFilters: { value: 'all' | LoadStatus; label: string }[] = [
    { value: 'all', label: 'All' },
    { value: 'posted', label: 'Posted' },
    { value: 'assigned', label: 'Assigned' },
    { value: 'in_transit', label: 'In transit' },
    { value: 'completed', label: 'Completed' },
  ]

  return (
    <div className="p-4 sm:p-6">
      <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
        <h1 className="text-xl font-bold text-iron-100">Load Board</h1>
        <div className="flex gap-2">
          {statusFilters.map(({ value, label }) => (
            <button
              key={value}
              type="button"
              onClick={() => setFilter(value)}
              className={`rounded-lg border px-3 py-1.5 text-sm font-medium ${
                filter === value ? 'border-primary bg-primary/20 text-primary' : 'border-iron-600 text-iron-400 hover:bg-iron-800'
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>

      {error && (
        <p className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
      )}

      <div className="overflow-x-auto rounded-xl border border-iron-700">
        <table className="min-w-full divide-y divide-iron-700">
          <thead>
            <tr>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-iron-400">Load #</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-iron-400">Origin → Dest</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-iron-400">Commodity</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-iron-400">Weight</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-iron-400">Status</th>
              <th className="px-4 py-3 text-left text-xs font-medium uppercase text-iron-400">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-iron-800">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-iron-400">Loading…</td>
              </tr>
            ) : loads.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-sm text-iron-400">No loads found.</td>
              </tr>
            ) : (
              loads.map((load) => (
                <tr key={load.id} className="hover:bg-iron-800/50">
                  <td className="px-4 py-3 text-sm font-medium text-iron-200">{load.load_number}</td>
                  <td className="px-4 py-3 text-sm font-medium text-iron-200">{load.origin} → {load.destination}</td>
                  <td className="px-4 py-3 text-sm text-iron-400">{load.commodity ?? '—'}</td>
                  <td className="px-4 py-3 text-sm text-iron-400">{load.weight_lbs != null ? `${(load.weight_lbs / 1000).toFixed(0)}k` : '—'}</td>
                  <td className="px-4 py-3">
                    <span className="inline-flex rounded-full bg-iron-700 px-2 py-0.5 text-xs text-iron-300">{load.status.replace('_', ' ')}</span>
                  </td>
                  <td className="px-4 py-3">
                    {user?.role === 'carrier' && load.status === 'posted' && (
                      <button type="button" className="text-sm font-medium text-blue-400 hover:underline">Place bid</button>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
