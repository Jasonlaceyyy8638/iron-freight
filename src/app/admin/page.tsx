'use client'

import { useState, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Link from 'next/link'
import { useAtomValue } from 'jotai'
import { getSupabase } from '@/lib/supabase/client'
import { Logo } from '@/components/Logo'
import { userAtom } from '@/lib/store'
import { ChevronRight, Building2, Truck, Package, User, Loader2, MapPin, Users, DollarSign } from 'lucide-react'
const GeofenceMap = dynamic(
  () => import('@/components/GeofenceMap').then((mod) => ({ default: mod.GeofenceMap })),
  { ssr: false }
)

type BrokerRow = { id: string; email: string; full_name: string | null }
type CarrierRow = { id: string; profile_id: string; legal_name: string; mc_number: string; email: string; full_name: string | null }
type ShipperRow = { id: string; profile_id: string; legal_name: string; email: string; full_name: string | null }

type LoadRow = { id: string; load_number: string; status: string; origin: string; destination: string }
type DriverRow = { id: string; full_name: string; cdl_number: string }
type TeamRow = { id: string; email: string; full_name: string | null; staff_role: string }

function formatLoc(city: string | null, state: string | null) {
  return [city, state].filter(Boolean).join(', ') || '—'
}

const STAFF_ROLES = ['admin', 'billing', 'support'] as const
const REFUND_TYPES = ['credits', 'amount', 'percentage'] as const
type RefundType = typeof REFUND_TYPES[number]

type CustomerOption = { id: string; email: string; full_name: string | null; role: string }
type RefundRow = { id: string; recipient_email: string; refund_type: string; value: number; notes: string | null; created_at: string }

export default function AdminDashboardPage() {
  const currentUser = useAtomValue(userAtom)
  const [tab, setTab] = useState<'brokers' | 'carriers' | 'shippers' | 'team' | 'refunds'>('brokers')
  const [brokers, setBrokers] = useState<BrokerRow[]>([])
  const [carriers, setCarriers] = useState<CarrierRow[]>([])
  const [shippers, setShippers] = useState<ShipperRow[]>([])
  const [team, setTeam] = useState<TeamRow[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [selectedBroker, setSelectedBroker] = useState<BrokerRow | null>(null)
  const [selectedCarrier, setSelectedCarrier] = useState<CarrierRow | null>(null)
  const [selectedShipper, setSelectedShipper] = useState<ShipperRow | null>(null)
  const [detailLoads, setDetailLoads] = useState<LoadRow[]>([])
  const [detailDrivers, setDetailDrivers] = useState<DriverRow[]>([])
  const [detailLoading, setDetailLoading] = useState(false)
  const [updatingRole, setUpdatingRole] = useState<string | null>(null)
  const [staffRole, setStaffRole] = useState<string | null>(null)
  const [customers, setCustomers] = useState<CustomerOption[]>([])
  const [refunds, setRefunds] = useState<RefundRow[]>([])
  const [refundForm, setRefundForm] = useState({ recipient_profile_id: '', refund_type: 'amount' as RefundType, value: '', notes: '' })
  const [refundSubmitting, setRefundSubmitting] = useState(false)
  const [inviteEmail, setInviteEmail] = useState('')
  const [inviteName, setInviteName] = useState('')
  const [inviteRole, setInviteRole] = useState<'admin' | 'billing' | 'support'>('admin')
  const [inviteSending, setInviteSending] = useState(false)
  const [inviteSuccess, setInviteSuccess] = useState<string | null>(null)

  useEffect(() => {
    let cancelled = false
    async function fetchAll() {
      const client = getSupabase()
      if (!client) {
        setError('Supabase not configured')
        setLoading(false)
        return
      }
      setLoading(true)
      setError(null)
      const [brokersRes, carriersRes, shippersRes, adminsRes, teamRes] = await Promise.all([
        client.from('profiles').select('id, email, full_name').eq('role', 'broker').order('email'),
        client.from('carriers').select('id, profile_id, legal_name, mc_number').order('legal_name'),
        client.from('shippers').select('id, profile_id, legal_name').order('legal_name'),
        client.from('profiles').select('id, email, full_name').eq('role', 'admin').order('email'),
        client.from('admin_team').select('profile_id, staff_role'),
      ])
      if (cancelled) return
      if (brokersRes.error) setError(brokersRes.error.message)
      else setBrokers(brokersRes.data ?? [])
      if (carriersRes.error) setError(carriersRes.error.message)
      else {
        const carrierIds = (carriersRes.data ?? []).map((c) => c.profile_id).filter(Boolean)
        const profiles = carrierIds.length
          ? await client.from('profiles').select('id, email, full_name').in('id', carrierIds)
          : { data: [] as { id: string; email: string; full_name: string | null }[] }
        const profileMap = new Map((profiles.data ?? []).map((p) => [p.id, p]))
        setCarriers(
          (carriersRes.data ?? []).map((c) => ({
            ...c,
            email: profileMap.get(c.profile_id)?.email ?? '—',
            full_name: profileMap.get(c.profile_id)?.full_name ?? null,
          }))
        )
      }
      if (shippersRes.error) setError(shippersRes.error.message)
      else {
        const shipperIds = (shippersRes.data ?? []).map((s) => s.profile_id).filter(Boolean)
        const profiles = shipperIds.length
          ? await client.from('profiles').select('id, email, full_name').in('id', shipperIds)
          : { data: [] as { id: string; email: string; full_name: string | null }[] }
        const profileMap = new Map((profiles.data ?? []).map((p) => [p.id, p]))
        setShippers(
          (shippersRes.data ?? []).map((s) => ({
            ...s,
            email: profileMap.get(s.profile_id)?.email ?? '—',
            full_name: profileMap.get(s.profile_id)?.full_name ?? null,
          }))
        )
      }
      if (adminsRes.error) setError(adminsRes.error.message)
      else {
        const roleByProfile = new Map((teamRes.data ?? []).map((r: { profile_id: string; staff_role: string }) => [r.profile_id, r.staff_role]))
        setTeam(
          (adminsRes.data ?? []).map((p) => ({
            id: p.id,
            email: p.email,
            full_name: p.full_name,
            staff_role: roleByProfile.get(p.id) ?? 'admin',
          }))
        )
      }
      setLoading(false)
    }
    fetchAll()
    return () => { cancelled = true }
  }, [])

  useEffect(() => {
    const client = getSupabase()
    if (!client) return
    const broker = selectedBroker
    const carrier = selectedCarrier
    const shipper = selectedShipper
    if (!broker && !carrier && !shipper) {
      setDetailLoads([])
      setDetailDrivers([])
      return
    }
    let cancelled = false
    setDetailLoading(true)
    async function fetchDetail() {
      if (!client) return
      if (broker) {
        const { data } = await client
          .from('loads')
          .select('id, load_number, status, origin_city, origin_state, dest_city, dest_state')
          .eq('broker_profile_id', broker.id)
          .order('created_at', { ascending: false })
        if (cancelled) return
        setDetailLoads(
          (data ?? []).map((r) => ({
            id: r.id,
            load_number: r.load_number,
            status: r.status,
            origin: formatLoc(r.origin_city, r.origin_state),
            destination: formatLoc(r.dest_city, r.dest_state),
          }))
        )
        setDetailDrivers([])
      } else if (carrier) {
        const [loadsRes, driversRes] = await Promise.all([
          client
            .from('loads')
            .select('id, load_number, status, origin_city, origin_state, dest_city, dest_state')
            .eq('carrier_id', carrier.id)
            .order('created_at', { ascending: false }),
          client.from('drivers').select('id, full_name, cdl_number').eq('carrier_id', carrier.id).order('full_name'),
        ])
        if (cancelled) return
        setDetailLoads(
          (loadsRes.data ?? []).map((r) => ({
            id: r.id,
            load_number: r.load_number,
            status: r.status,
            origin: formatLoc(r.origin_city, r.origin_state),
            destination: formatLoc(r.dest_city, r.dest_state),
          }))
        )
        setDetailDrivers(driversRes.data ?? [])
      } else if (shipper) {
        const { data } = await client
          .from('loads')
          .select('id, load_number, status, origin_city, origin_state, dest_city, dest_state')
          .eq('shipper_id', shipper.id)
          .order('created_at', { ascending: false })
        if (cancelled) return
        setDetailLoads(
          (data ?? []).map((r) => ({
            id: r.id,
            load_number: r.load_number,
            status: r.status,
            origin: formatLoc(r.origin_city, r.origin_state),
            destination: formatLoc(r.dest_city, r.dest_state),
          }))
        )
        setDetailDrivers([])
      }
      setDetailLoading(false)
    }
    fetchDetail()
    return () => { cancelled = true }
  }, [selectedBroker, selectedCarrier, selectedShipper])

  useEffect(() => {
    const uid = currentUser?.id
    if (!uid) return
    let cancelled = false
    async function fetchStaffRole() {
      const client = getSupabase()
      if (!client) return
      const { data } = await client.from('admin_team').select('staff_role').eq('profile_id', uid).single()
      if (cancelled) return
      setStaffRole(data?.staff_role ?? 'admin')
    }
    fetchStaffRole()
    return () => { cancelled = true }
  }, [currentUser?.id])

  useEffect(() => {
    if (tab !== 'refunds') return
    let cancelled = false
    async function fetchRefundData() {
      const client = getSupabase()
      if (!client) return
      const [profilesRes, refundsRes] = await Promise.all([
        client.from('profiles').select('id, email, full_name, role').in('role', ['broker', 'carrier', 'shipper']).order('email'),
        client.from('refunds').select('id, recipient_profile_id, refund_type, value, notes, created_at').order('created_at', { ascending: false }).limit(50),
      ])
      if (cancelled) return
      setCustomers(profilesRes.data ?? [])
      const profileIds = (refundsRes.data ?? []).map((r) => r.recipient_profile_id).filter(Boolean)
      const recipientProfiles = profileIds.length
        ? await client.from('profiles').select('id, email').in('id', [...new Set(profileIds)])
        : { data: [] as { id: string; email: string }[] }
      const emailMap = new Map((recipientProfiles.data ?? []).map((p) => [p.id, p.email]))
      setRefunds(
        (refundsRes.data ?? []).map((r) => ({
          id: r.id,
          recipient_email: emailMap.get(r.recipient_profile_id) ?? r.recipient_profile_id,
          refund_type: r.refund_type,
          value: Number(r.value),
          notes: r.notes ?? null,
          created_at: r.created_at,
        }))
      )
    }
    fetchRefundData()
    return () => { cancelled = true }
  }, [tab])

  const selected = selectedBroker || selectedCarrier || selectedShipper
  const selectedLabel =
    selectedBroker ? `${selectedBroker.full_name || selectedBroker.email}` :
    selectedCarrier ? `${selectedCarrier.legal_name} (MC ${selectedCarrier.mc_number})` :
    selectedShipper ? selectedShipper.legal_name : null

  return (
    <div className="min-h-screen bg-background text-[#F9FAFB]">
      <header className="sticky top-0 z-10 border-b border-divider bg-surface">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/" className="inline-flex">
            <Logo className="text-white" />
          </Link>
          <div className="flex items-center gap-4">
            <Link
              href="/admin/support"
              className="text-sm text-[#A3A3A3] hover:text-primary"
            >
              Support Command Center
            </Link>
            <Link
              href="/dashboard"
              className="rounded-lg border border-primary/50 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20"
            >
              Dashboard
            </Link>
          </div>
        </div>
        <h1 className="px-4 pb-3 font-display text-xl font-bold sm:px-6">Master Admin</h1>
      </header>

      <main className="p-4 sm:p-6">
        {error && (
          <p className="mb-4 rounded-lg border border-red-500/50 bg-red-500/10 px-3 py-2 text-sm text-red-300">{error}</p>
        )}

        <section className="mb-6">
          <h2 className="mb-2 flex items-center gap-2 font-display text-sm font-semibold text-[#A3A3A3]">
            <MapPin className="h-4 w-4" /> Map
          </h2>
          <GeofenceMap
            center={[39.8283, -98.5795]}
            zoom={3}
            height="320px"
            className="w-full"
          />
        </section>

        <div className="flex gap-2 border-b border-divider mb-4">
          {(['brokers', 'carriers', 'shippers', 'team', 'refunds'] as const).map((t) => (
            <button
              key={t}
              type="button"
              onClick={() => {
                setTab(t)
                setSelectedBroker(null)
                setSelectedCarrier(null)
                setSelectedShipper(null)
              }}
              className={`border-b-2 px-4 py-2 text-sm font-medium capitalize ${
                tab === t ? 'border-primary text-primary' : 'border-transparent text-[#A3A3A3] hover:text-[#F9FAFB]'
              }`}
            >
              {t === 'brokers' && <Building2 className="mr-1.5 inline h-4 w-4" />}
              {t === 'carriers' && <Truck className="mr-1.5 inline h-4 w-4" />}
              {t === 'shippers' && <Package className="mr-1.5 inline h-4 w-4" />}
              {t === 'team' && <Users className="mr-1.5 inline h-4 w-4" />}
              {t === 'refunds' && <DollarSign className="mr-1.5 inline h-4 w-4" />}
              {t}
            </button>
          ))}
        </div>

        <div className="grid gap-6 lg:grid-cols-2">
          <div className="rounded-xl border border-divider bg-surface overflow-hidden">
            <div className="border-b border-divider px-4 py-3 font-display text-sm font-semibold text-[#A3A3A3]">
              {tab === 'brokers' && 'All brokers'}
              {tab === 'carriers' && 'All carriers'}
              {tab === 'shippers' && 'All shippers'}
              {tab === 'team' && 'Team members'}
              {tab === 'refunds' && 'Grant refund'}
            </div>
            {loading ? (
              <div className="flex items-center justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-primary" />
              </div>
            ) : (
              <ul className="divide-y divide-divider max-h-[400px] overflow-auto">
                {tab === 'brokers' && brokers.length === 0 && (
                  <li className="px-4 py-8 text-center text-sm text-[#A3A3A3]">No brokers yet.</li>
                )}
                {tab === 'brokers' && brokers.map((b) => (
                  <li key={b.id} className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedBroker(selectedBroker?.id === b.id ? null : b)
                        setSelectedCarrier(null)
                        setSelectedShipper(null)
                      }}
                      className={`flex flex-1 min-w-0 items-center justify-between px-4 py-3 text-left hover:bg-white/5 ${
                        selectedBroker?.id === b.id ? 'bg-primary/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <User className="h-4 w-4 shrink-0 text-[#A3A3A3]" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{b.full_name || b.email}</p>
                          <p className="text-xs text-[#A3A3A3] truncate">{b.email}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-[#A3A3A3]" />
                    </button>
                    <Link
                      href={`/admin/brokers/${b.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 rounded px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
                      title="View full profile"
                    >
                      View
                    </Link>
                  </li>
                ))}
                {tab === 'carriers' && carriers.length === 0 && (
                  <li className="px-4 py-8 text-center text-sm text-[#A3A3A3]">No carriers yet.</li>
                )}
                {tab === 'carriers' && carriers.map((c) => (
                  <li key={c.id} className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedCarrier(selectedCarrier?.id === c.id ? null : c)
                        setSelectedBroker(null)
                        setSelectedShipper(null)
                      }}
                      className={`flex flex-1 min-w-0 items-center justify-between px-4 py-3 text-left hover:bg-white/5 ${
                        selectedCarrier?.id === c.id ? 'bg-primary/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Truck className="h-4 w-4 shrink-0 text-[#A3A3A3]" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{c.legal_name}</p>
                          <p className="text-xs text-[#A3A3A3] truncate">MC {c.mc_number} · {c.email}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-[#A3A3A3]" />
                    </button>
                    <Link
                      href={`/admin/carriers/${c.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 rounded px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
                      title="View full profile"
                    >
                      View
                    </Link>
                  </li>
                ))}
                {tab === 'shippers' && shippers.length === 0 && (
                  <li className="px-4 py-8 text-center text-sm text-[#A3A3A3]">No shippers yet.</li>
                )}
                {tab === 'shippers' && shippers.map((s) => (
                  <li key={s.id} className="flex items-center justify-between gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedShipper(selectedShipper?.id === s.id ? null : s)
                        setSelectedBroker(null)
                        setSelectedCarrier(null)
                      }}
                      className={`flex flex-1 min-w-0 items-center justify-between px-4 py-3 text-left hover:bg-white/5 ${
                        selectedShipper?.id === s.id ? 'bg-primary/10' : ''
                      }`}
                    >
                      <div className="flex items-center gap-3 min-w-0">
                        <Package className="h-4 w-4 shrink-0 text-[#A3A3A3]" />
                        <div className="min-w-0">
                          <p className="font-medium truncate">{s.legal_name}</p>
                          <p className="text-xs text-[#A3A3A3] truncate">{s.email}</p>
                        </div>
                      </div>
                      <ChevronRight className="h-4 w-4 shrink-0 text-[#A3A3A3]" />
                    </button>
                    <Link
                      href={`/admin/shippers/${s.id}`}
                      onClick={(e) => e.stopPropagation()}
                      className="shrink-0 rounded px-2 py-1.5 text-xs font-medium text-primary hover:bg-primary/10"
                      title="View full profile"
                    >
                      View
                    </Link>
                  </li>
                ))}
                {tab === 'refunds' && (
                  <li className="list-none p-4 space-y-4">
                    {(staffRole === 'admin' || staffRole === 'billing') ? (
                      <>
                        <p className="text-xs text-[#A3A3A3]">Billing and admin can grant refunds as credits, dollar amount ($1–$9999), or percentage.</p>
                        <form
                          onSubmit={async (e) => {
                            e.preventDefault()
                            const client = getSupabase()
                            const uid = currentUser?.id
                            if (!client || !uid || !refundForm.recipient_profile_id) return
                            const val = Number(refundForm.value)
                            if (Number.isNaN(val) || val < 0) return
                            if (refundForm.refund_type === 'amount' && (val < 1 || val > 9999)) return
                            if (refundForm.refund_type === 'percentage' && (val < 1 || val > 100)) return
                            setRefundSubmitting(true)
                            const { error: err } = await client.from('refunds').insert({
                              recipient_profile_id: refundForm.recipient_profile_id,
                              refund_type: refundForm.refund_type,
                              value: val,
                              created_by: uid,
                              notes: refundForm.notes.trim() || null,
                            })
                            if (err) setError(err.message)
                            else {
                              setRefundForm({ recipient_profile_id: '', refund_type: 'amount', value: '', notes: '' })
                              const { data } = await client.from('refunds').select('id, recipient_profile_id, refund_type, value, notes, created_at').order('created_at', { ascending: false }).limit(1).single()
                              if (data) {
                                const { data: p } = await client.from('profiles').select('email').eq('id', data.recipient_profile_id).single()
                                setRefunds((prev) => [{ id: data.id, recipient_email: p?.email ?? data.recipient_profile_id, refund_type: data.refund_type, value: Number(data.value), notes: data.notes ?? null, created_at: data.created_at }, ...prev])
                              }
                            }
                            setRefundSubmitting(false)
                          }}
                          className="space-y-3"
                        >
                          <div>
                            <label className="block text-xs font-medium text-[#A3A3A3] mb-1">Recipient (customer)</label>
                            <select
                              value={refundForm.recipient_profile_id}
                              onChange={(e) => setRefundForm((f) => ({ ...f, recipient_profile_id: e.target.value }))}
                              required
                              className="w-full rounded border border-divider bg-background px-3 py-2 text-sm text-[#F9FAFB] focus:border-primary focus:outline-none"
                            >
                              <option value="">Select customer…</option>
                              {customers.map((c) => (
                                <option key={c.id} value={c.id}>{c.full_name || c.email} ({c.email}) · {c.role}</option>
                              ))}
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#A3A3A3] mb-1">Type</label>
                            <select
                              value={refundForm.refund_type}
                              onChange={(e) => setRefundForm((f) => ({ ...f, refund_type: e.target.value as RefundType }))}
                              className="w-full rounded border border-divider bg-background px-3 py-2 text-sm text-[#F9FAFB] focus:border-primary focus:outline-none"
                            >
                              <option value="credits">Credits (platform credits)</option>
                              <option value="amount">Amount ($1–$9999)</option>
                              <option value="percentage">Percentage (1–100%)</option>
                            </select>
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#A3A3A3] mb-1">
                              {refundForm.refund_type === 'amount' ? 'Amount ($)' : refundForm.refund_type === 'percentage' ? 'Percentage (1–100)' : 'Credit amount'}
                            </label>
                            <input
                              type="number"
                              min={refundForm.refund_type === 'percentage' ? 1 : refundForm.refund_type === 'amount' ? 1 : 0}
                              max={refundForm.refund_type === 'percentage' ? 100 : refundForm.refund_type === 'amount' ? 9999 : undefined}
                              step={refundForm.refund_type === 'percentage' ? 1 : 0.01}
                              value={refundForm.value}
                              onChange={(e) => setRefundForm((f) => ({ ...f, value: e.target.value }))}
                              required
                              placeholder={refundForm.refund_type === 'amount' ? '1–9999' : refundForm.refund_type === 'percentage' ? '1–100' : ''}
                              className="w-full rounded border border-divider bg-background px-3 py-2 text-sm text-[#F9FAFB] focus:border-primary focus:outline-none"
                            />
                          </div>
                          <div>
                            <label className="block text-xs font-medium text-[#A3A3A3] mb-1">Notes (optional)</label>
                            <input
                              type="text"
                              value={refundForm.notes}
                              onChange={(e) => setRefundForm((f) => ({ ...f, notes: e.target.value }))}
                              placeholder="Optional note"
                              className="w-full rounded border border-divider bg-background px-3 py-2 text-sm text-[#F9FAFB] focus:border-primary focus:outline-none"
                            />
                          </div>
                          <button
                            type="submit"
                            disabled={refundSubmitting}
                            className="w-full rounded bg-primary px-3 py-2 text-sm font-medium text-background hover:bg-primary/90 disabled:opacity-50"
                          >
                            {refundSubmitting ? 'Submitting…' : 'Grant refund'}
                          </button>
                        </form>
                      </>
                    ) : (
                      <p className="text-sm text-[#A3A3A3]">Only billing and admin can grant refunds. Your role: {staffRole ?? '…'}.</p>
                    )}
                  </li>
                )}
                {tab === 'team' && team.length === 0 && !loading && (
                  <li className="px-4 py-8 text-center text-sm text-[#A3A3A3]">No team members yet. Add staff via Admin login, then assign roles here.</li>
                )}
                {tab === 'team' && team.map((m) => (
                  <li key={m.id} className="flex items-center justify-between gap-2 border-b border-divider px-4 py-3 last:border-0">
                    <div className="flex min-w-0 items-center gap-3">
                      <User className="h-4 w-4 shrink-0 text-[#A3A3A3]" />
                      <div className="min-w-0">
                        <p className="font-medium truncate">{m.full_name || m.email}</p>
                        <p className="text-xs text-[#A3A3A3] truncate">{m.email}</p>
                      </div>
                    </div>
                    <select
                      value={m.staff_role}
                      disabled={updatingRole === m.id}
                      onChange={async (e) => {
                        const newRole = e.target.value as typeof STAFF_ROLES[number]
                        const client = getSupabase()
                        if (!client) return
                        setUpdatingRole(m.id)
                        const { error: upsertErr } = await client.from('admin_team').upsert(
                          { profile_id: m.id, staff_role: newRole },
                          { onConflict: 'profile_id' }
                        )
                        if (upsertErr) setError(upsertErr.message)
                        else setTeam((prev) => prev.map((x) => (x.id === m.id ? { ...x, staff_role: newRole } : x)))
                        setUpdatingRole(null)
                      }}
                      className="rounded border border-divider bg-background px-2 py-1.5 text-sm text-[#F9FAFB] focus:border-primary focus:outline-none"
                    >
                      {STAFF_ROLES.map((r) => (
                        <option key={r} value={r}>{r}</option>
                      ))}
                    </select>
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div className="rounded-xl border border-divider bg-surface overflow-hidden">
            <div className="border-b border-divider px-4 py-3 font-display text-sm font-semibold text-[#A3A3A3]">
              {tab === 'team' ? 'Add team member' : tab === 'refunds' ? 'Recent refunds' : 'Profile & data'}
            </div>
            {tab === 'refunds' ? (
              <div className="max-h-[400px] overflow-auto p-4">
                {refunds.length === 0 ? (
                  <p className="text-sm text-[#A3A3A3]">No refunds recorded yet.</p>
                ) : (
                  <ul className="space-y-2">
                    {refunds.map((r) => (
                      <li key={r.id} className="rounded-lg border border-divider bg-background/50 px-3 py-2 text-sm">
                        <span className="font-medium text-primary">{r.recipient_email}</span>
                        <span className="mx-2 text-[#A3A3A3]">{r.refund_type}</span>
                        <span className="text-[#F9FAFB]">{r.value}{r.refund_type === 'percentage' ? '%' : r.refund_type === 'amount' ? '$' : ' credits'}</span>
                        {r.notes && <span className="ml-2 text-xs text-[#525252]">— {r.notes}</span>}
                        <span className="ml-2 text-xs text-[#525252]">{new Date(r.created_at).toLocaleDateString()}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            ) : tab === 'team' ? (
              <div className="max-h-[400px] overflow-auto p-4">
                <p className="text-sm text-[#A3A3A3] mb-4">
                  Send an invite from <strong className="text-[#F9FAFB]">Info@getironfreight.com</strong>. They’ll get a sign-in link and can create an account; then assign their role in the list on the left.
                </p>
                <form
                  onSubmit={async (e) => {
                    e.preventDefault()
                    const client = getSupabase()
                    if (!client) return
                    setInviteSending(true)
                    setInviteSuccess(null)
                    setError(null)
                    try {
                      const { data: { session } } = await client.auth.getSession()
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
                          type: 'staff',
                          email: inviteEmail.trim(),
                          full_name: inviteName.trim() || undefined,
                          staff_role: inviteRole,
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
                  className="space-y-3"
                >
                  <div>
                    <label className="block text-xs font-medium text-[#A3A3A3] mb-1">Email</label>
                    <input
                      type="email"
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required
                      placeholder="colleague@company.com"
                      className="w-full rounded border border-divider bg-background px-3 py-2 text-sm text-[#F9FAFB] focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#A3A3A3] mb-1">Full name (optional)</label>
                    <input
                      type="text"
                      value={inviteName}
                      onChange={(e) => setInviteName(e.target.value)}
                      placeholder="Jane Smith"
                      className="w-full rounded border border-divider bg-background px-3 py-2 text-sm text-[#F9FAFB] focus:border-primary focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[#A3A3A3] mb-1">Role</label>
                    <select
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value as 'admin' | 'billing' | 'support')}
                      className="w-full rounded border border-divider bg-background px-3 py-2 text-sm text-[#F9FAFB] focus:border-primary focus:outline-none"
                    >
                      <option value="admin">Admin</option>
                      <option value="billing">Billing</option>
                      <option value="support">Support</option>
                    </select>
                  </div>
                  <button
                    type="submit"
                    disabled={inviteSending}
                    className="w-full rounded bg-primary px-3 py-2 text-sm font-medium text-background hover:bg-primary/90 disabled:opacity-50"
                  >
                    {inviteSending ? 'Sending…' : 'Send invite email'}
                  </button>
                </form>
                {inviteSuccess && <p className="mt-3 text-sm text-primary">{inviteSuccess}</p>}
                <p className="mt-4 text-xs text-[#525252]">
                  Existing team members appear in the list on the left; use the role dropdown to change admin, billing, or support.
                </p>
              </div>
            ) : !selected ? (
              <div className="flex flex-col items-center justify-center py-16 text-center">
                <User className="h-12 w-12 text-[#333]" />
                <p className="mt-2 text-sm text-[#A3A3A3]">Select a {tab.slice(0, -1)} to view profile and their loads.</p>
              </div>
            ) : (
              <div className="max-h-[400px] overflow-auto p-4">
                <h3 className="font-display font-semibold text-primary">{selectedLabel}</h3>
                {selectedBroker && (
                  <p className="mt-1 text-sm text-[#A3A3A3]">{selectedBroker.email}</p>
                )}
                {selectedCarrier && (
                  <>
                    <p className="mt-1 text-sm text-[#A3A3A3]">{selectedCarrier.email}</p>
                    <p className="mt-1 text-xs text-[#525252]">MC {selectedCarrier.mc_number}</p>
                  </>
                )}
                {selectedShipper && (
                  <p className="mt-1 text-sm text-[#A3A3A3]">{selectedShipper.email}</p>
                )}

                <h4 className="mt-6 font-display text-sm font-semibold text-[#F9FAFB]">Loads</h4>
                {detailLoading ? (
                  <div className="flex items-center gap-2 py-4">
                    <Loader2 className="h-4 w-4 animate-spin text-primary" />
                    <span className="text-sm text-[#A3A3A3]">Loading…</span>
                  </div>
                ) : detailLoads.length === 0 ? (
                  <p className="py-2 text-sm text-[#A3A3A3]">No loads.</p>
                ) : (
                  <ul className="mt-2 space-y-2">
                    {detailLoads.map((l) => (
                      <li key={l.id} className="rounded-lg border border-divider bg-background/50 px-3 py-2 text-sm">
                        <span className="font-medium text-primary">{l.load_number}</span>
                        <span className="mx-2 text-[#A3A3A3]">·</span>
                        <span className="text-[#A3A3A3]">{l.origin} → {l.destination}</span>
                        <span className="ml-2 rounded bg-[#333] px-1.5 py-0.5 text-xs">{l.status}</span>
                      </li>
                    ))}
                  </ul>
                )}

                {selectedCarrier && (
                  <>
                    <h4 className="mt-6 font-display text-sm font-semibold text-[#F9FAFB]">Drivers</h4>
                    {detailLoading ? null : detailDrivers.length === 0 ? (
                      <p className="py-2 text-sm text-[#A3A3A3]">No drivers.</p>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {detailDrivers.map((d) => (
                          <li key={d.id} className="rounded-lg border border-divider bg-background/50 px-3 py-2 text-sm">
                            <span className="font-medium">{d.full_name}</span>
                            <span className="ml-2 text-xs text-[#A3A3A3]">CDL ***{d.cdl_number.slice(-4)}</span>
                          </li>
                        ))}
                      </ul>
                    )}
                  </>
                )}
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
