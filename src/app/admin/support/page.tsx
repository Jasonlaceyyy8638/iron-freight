'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import {
  Shield,
  Search,
  AlertTriangle,
  FileCheck,
  UserCheck,
  Clock,
  ChevronRight,
  Download,
  MessageSquare,
  Loader2,
} from 'lucide-react'
import { Logo } from '@/components/Logo'

const BG = '#0A0A0B'
const ACCENT = '#C1FF00'

// Real-time clock
function useClock() {
  const [now, setNow] = useState(() => new Date())
  useEffect(() => {
    const t = setInterval(() => setNow(new Date()), 1000)
    return () => clearInterval(t)
  }, [])
  return now
}

// Mock data
const MOCK_METRICS = {
  activeLoads: 847,
  disputes: 12,
  pendingVettings: 23,
  securityAlerts: 3,
}

const MOCK_RED_FLAGS = [
  { id: '1', loadId: '402', msg: 'Driver GPS deviation detected', time: '2m ago' },
  { id: '2', loadId: '891', msg: 'Biometric mismatch at pickup', time: '5m ago' },
  { id: '3', loadId: '156', msg: 'Duplicate MC# submission', time: '12m ago' },
  { id: '4', loadId: '223', msg: 'Geofence exit before delivery scan', time: '18m ago' },
  { id: '5', loadId: '667', msg: 'Late document upload after 24h', time: '22m ago' },
]

const MOCK_VETTING_QUEUE = [
  { id: 'v1', carrier: 'North Star Logistics', mc: '882941', uploaded: '1h ago' },
  { id: 'v2', carrier: 'Swift Haul Co', mc: '901223', uploaded: '2h ago' },
  { id: 'v3', carrier: 'Elite Freight LLC', mc: '774552', uploaded: '3h ago' },
]

const MOCK_TIMELINE = [
  { time: 'Mar 5, 08:00', text: 'Load Awarded to Carrier Titan Logistics (MC# 882941).' },
  { time: 'Mar 5, 14:22', text: 'Driver J. Martinez Assigned (Biometric Pass).' },
  { time: 'Mar 6, 06:15', text: 'Pickup QR Scanned at 41.8781° N, 87.6298° W (Chicago, IL).' },
  { time: 'Mar 7, 11:42', text: 'Delivery QR Scanned at 34.0522° N, 118.2437° W (Los Angeles, CA).' },
]

export default function AdminSupportPage() {
  const now = useClock()
  const [searchQuery, setSearchQuery] = useState('')
  const [disputeLoadId, setDisputeLoadId] = useState('')
  const [disputeTimeline, setDisputeTimeline] = useState<typeof MOCK_TIMELINE | null>(null)
  const [staffHubLoadId, setStaffHubLoadId] = useState('')
  const [staffHubNotes, setStaffHubNotes] = useState('')
  const [internalNotes, setInternalNotes] = useState<{ loadId: string; text: string; at: string }[]>([])

  const handleVerify = (id: string) => {
    console.log('Verify', id)
  }
  const handleReject = (id: string) => {
    console.log('Reject', id)
  }

  const handleLoadDisputeLookup = () => {
    if (!disputeLoadId.trim()) return
    setDisputeTimeline(MOCK_TIMELINE)
  }

  const addStaffNote = () => {
    if (!staffHubLoadId.trim() || !staffHubNotes.trim()) return
    setInternalNotes((prev) => [
      ...prev,
      { loadId: staffHubLoadId.trim(), text: staffHubNotes.trim(), at: new Date().toISOString() },
    ])
    setStaffHubNotes('')
  }

  const timeStr = now.toLocaleTimeString('en-US', { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })
  const dateStr = now.toLocaleDateString('en-US', { weekday: 'short', month: 'short', day: 'numeric' })

  return (
    <div className="flex min-h-screen bg-[#0A0A0B] text-white/90">
      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        <header className="flex-shrink-0 border-b border-white/10 bg-[#0A0A0B] px-4 py-3 sm:px-6">
          <div className="flex items-center justify-between gap-4">
            <div className="flex items-center gap-4">
              <Link href="/" className="inline-flex">
                <Logo className="text-white" accent="lime" />
              </Link>
              <Link href="/admin" className="text-sm text-white/60 hover:text-[#C1FF00]">
                Master Admin
              </Link>
            </div>
            <div className="flex items-center gap-6">
              <div className="flex items-center gap-2 text-right">
                <span className="text-[11px] uppercase tracking-wider text-white/50">{dateStr}</span>
                <span className="font-mono text-sm font-semibold text-[#C1FF00]" aria-live="polite">
                  {timeStr}
                </span>
              </div>
              <span className="inline-flex items-center gap-1.5 rounded border border-[#C1FF00]/40 bg-[#C1FF00]/10 px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wider text-[#C1FF00]">
                <span className="h-1.5 w-1.5 rounded-full bg-[#C1FF00]" />
                Systems Status: Online
              </span>
            </div>
          </div>
          <h1 className="mt-3 font-display text-lg font-bold tracking-tight text-white sm:text-xl">
            Support Command Center
          </h1>
        </header>

        <main className="flex-1 overflow-auto p-4 sm:p-6">
          {/* Metric row */}
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4 sm:gap-4 mb-6">
            {[
              { label: 'Total Active Loads', value: MOCK_METRICS.activeLoads, icon: FileCheck },
              { label: 'Unresolved Disputes', value: MOCK_METRICS.disputes, icon: AlertTriangle },
              { label: 'Pending Vettings', value: MOCK_METRICS.pendingVettings, icon: UserCheck },
              { label: 'Security Alerts', value: MOCK_METRICS.securityAlerts, icon: Shield, alert: true },
            ].map(({ label, value, icon: Icon, alert }) => (
              <div
                key={label}
                className="rounded border border-white/10 bg-white/[0.03] p-4"
              >
                <div className="flex items-center justify-between">
                  <span className="text-[11px] font-medium uppercase tracking-wider text-white/50">{label}</span>
                  <Icon className={`h-4 w-4 ${alert ? 'text-red-400' : 'text-[#C1FF00]/80'}`} />
                </div>
                <p className={`mt-1 font-display text-2xl font-bold ${alert ? 'text-red-400' : 'text-white'}`}>
                  {value}
                </p>
              </div>
            ))}
          </div>

          {/* User search */}
          <section className="mb-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-2">User Search</h2>
            <div className="flex gap-2">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40" />
                <input
                  type="text"
                  placeholder="Search by Name, MC#, or Email…"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full rounded border border-white/15 bg-white/5 py-2.5 pl-10 pr-3 text-sm text-white placeholder-white/40 outline-none focus:border-[#C1FF00]/50 focus:ring-1 focus:ring-[#C1FF00]/30"
                />
              </div>
              <button
                type="button"
                className="rounded border border-[#C1FF00]/40 bg-[#C1FF00]/10 px-4 py-2.5 text-sm font-medium text-[#C1FF00] hover:bg-[#C1FF00]/20"
              >
                Search
              </button>
            </div>
          </section>

          <div className="grid gap-6 lg:grid-cols-2">
            {/* Red-flag feed */}
            <section>
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-2">
                Live Red-Flag Feed
              </h2>
              <div className="max-h-[220px] overflow-y-auto rounded border border-white/10 bg-white/[0.03]">
                <ul className="divide-y divide-white/5">
                  {MOCK_RED_FLAGS.map((f) => (
                    <li key={f.id} className="flex items-center justify-between gap-3 px-4 py-2.5">
                      <div className="min-w-0 flex-1">
                        <span className="font-mono text-[11px] text-[#C1FF00]">Load #{f.loadId}</span>
                        <span className="ml-2 text-xs text-white/80">{f.msg}</span>
                      </div>
                      <span className="text-[10px] text-white/40">{f.time}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </section>

            {/* Vetting queue */}
            <section>
              <h2 className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-2">
                Vetting Queue
              </h2>
              <div className="overflow-x-auto rounded border border-white/10 bg-white/[0.03]">
                <table className="w-full min-w-[320px] text-left text-xs">
                  <thead>
                    <tr className="border-b border-white/10 text-[10px] uppercase tracking-wider text-white/50">
                      <th className="px-4 py-2.5 font-medium">Carrier</th>
                      <th className="px-4 py-2.5 font-medium">MC#</th>
                      <th className="px-4 py-2.5 font-medium">Uploaded</th>
                      <th className="px-4 py-2.5 font-medium text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-white/5">
                    {MOCK_VETTING_QUEUE.map((r) => (
                      <tr key={r.id} className="text-white/80">
                        <td className="px-4 py-2.5">{r.carrier}</td>
                        <td className="px-4 py-2.5 font-mono">{r.mc}</td>
                        <td className="px-4 py-2.5 text-white/50">{r.uploaded}</td>
                        <td className="px-4 py-2.5 text-right">
                          <button
                            type="button"
                            onClick={() => handleVerify(r.id)}
                            className="mr-2 rounded border border-[#C1FF00]/40 bg-[#C1FF00]/10 px-2 py-1 text-[11px] font-medium text-[#C1FF00] hover:bg-[#C1FF00]/20"
                          >
                            Verify
                          </button>
                          <button
                            type="button"
                            onClick={() => handleReject(r.id)}
                            className="rounded border border-red-500/40 bg-red-500/10 px-2 py-1 text-[11px] font-medium text-red-400 hover:bg-red-500/20"
                          >
                            Reject
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          </div>

          {/* Dispute resolution */}
          <section className="mt-6 rounded border border-white/10 bg-white/[0.03] p-4 sm:p-6">
            <h2 className="text-[11px] font-semibold uppercase tracking-wider text-white/50 mb-3">
              Dispute Resolution — Verification Timeline
            </h2>
            <div className="flex flex-wrap items-end gap-3 mb-4">
              <div className="flex-1 min-w-[160px]">
                <label htmlFor="dispute-load-id" className="block text-[11px] text-white/50 mb-1">Load ID</label>
                <input
                  id="dispute-load-id"
                  type="text"
                  placeholder="e.g. IF-99281"
                  value={disputeLoadId}
                  onChange={(e) => setDisputeLoadId(e.target.value)}
                  className="w-full rounded border border-white/15 bg-white/5 px-3 py-2 text-sm text-white placeholder-white/40 outline-none focus:border-[#C1FF00]/50"
                />
              </div>
              <button
                type="button"
                onClick={handleLoadDisputeLookup}
                className="rounded border border-[#C1FF00]/40 bg-[#C1FF00]/10 px-4 py-2 text-sm font-medium text-[#C1FF00] hover:bg-[#C1FF00]/20"
              >
                Load Timeline
              </button>
            </div>
            {disputeTimeline && (
              <>
                <div className="space-y-2 rounded border border-white/10 bg-black/20 p-4">
                  {disputeTimeline.map((e, i) => (
                    <div key={i} className="flex gap-3 text-xs">
                      <span className="font-mono text-[#C1FF00] shrink-0 w-[120px]">{e.time}</span>
                      <span className="text-white/80">{e.text}</span>
                    </div>
                  ))}
                </div>
                <div className="mt-4">
                  <button
                    type="button"
                    className="inline-flex items-center gap-2 rounded border border-[#C1FF00]/40 bg-[#C1FF00]/10 px-4 py-2 text-sm font-medium text-[#C1FF00] hover:bg-[#C1FF00]/20"
                  >
                    <Download className="h-4 w-4" />
                    Export Audit PDF for Insurance
                  </button>
                </div>
              </>
            )}
          </section>
        </main>
      </div>

      {/* StaffHub sidebar */}
      <aside className="hidden w-[320px] flex-shrink-0 border-l border-white/10 bg-black/30 xl:block">
        <div className="sticky top-0 flex h-screen flex-col p-4">
          <h2 className="flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider text-white/50">
            <MessageSquare className="h-3.5 w-3.5" />
            StaffHub
          </h2>
          <p className="mt-1 text-[11px] text-white/40">Internal notes on loads/accounts.</p>
          <div className="mt-4 space-y-2">
            <input
              type="text"
              placeholder="Load ID or account"
              value={staffHubLoadId}
              onChange={(e) => setStaffHubLoadId(e.target.value)}
              className="w-full rounded border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder-white/40 outline-none focus:border-[#C1FF00]/50"
            />
            <textarea
              placeholder="Add a note…"
              value={staffHubNotes}
              onChange={(e) => setStaffHubNotes(e.target.value)}
              rows={2}
              className="w-full resize-none rounded border border-white/15 bg-white/5 px-2.5 py-1.5 text-xs text-white placeholder-white/40 outline-none focus:border-[#C1FF00]/50"
            />
            <button
              type="button"
              onClick={addStaffNote}
              className="w-full rounded border border-[#C1FF00]/40 bg-[#C1FF00]/10 py-1.5 text-[11px] font-medium text-[#C1FF00] hover:bg-[#C1FF00]/20"
            >
              Save Note
            </button>
          </div>
          <div className="mt-4 flex-1 overflow-y-auto">
            {internalNotes.length === 0 ? (
              <p className="text-[11px] text-white/40">No notes yet.</p>
            ) : (
              <ul className="space-y-2">
                {internalNotes.map((n, i) => (
                  <li key={i} className="rounded border border-white/10 bg-white/5 p-2">
                    <span className="font-mono text-[10px] text-[#C1FF00]">#{n.loadId}</span>
                    <p className="mt-0.5 text-[11px] text-white/80">{n.text}</p>
                    <p className="mt-1 text-[10px] text-white/40">{new Date(n.at).toLocaleString()}</p>
                  </li>
                ))}
              </ul>
            )}
          </div>
        </div>
      </aside>
    </div>
  )
}
