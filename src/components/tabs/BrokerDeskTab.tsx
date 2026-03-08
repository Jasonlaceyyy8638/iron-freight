'use client'

import { Shield, Bell, CheckCircle, MapPin, Plus } from 'lucide-react'

const STATS = [
  { label: 'ACTIVE LOADS', value: '24' },
  { label: 'IN TRANSIT', value: '18' },
  { label: 'VERIFIED', value: '100%' },
]

const LOADS = [
  { id: '8821', origin: 'Chicago, IL', destination: 'Austin, TX', status: 'Verified', carrier: 'Titan Logistics', driver: 'M. Rossi', rate: '$2,450' },
  { id: '8825', origin: 'Savannah, GA', destination: 'Detroit, MI', status: 'Pending', carrier: 'Blue Sky Trucking', driver: 'Unassigned', rate: '$1,800' },
  { id: '8829', origin: 'Phoenix, AZ', destination: 'Seattle, WA', status: 'In Transit', carrier: 'Iron Road Carriers', driver: 'S. Chen', rate: '$3,100' },
]

function StatusChip({ status }: { status: string }) {
  const isVerified = status === 'Verified'
  const isPending = status === 'Pending'
  const bg = isVerified ? 'bg-[#065F46]' : isPending ? 'bg-[#92400E]' : 'bg-surface'
  const text = isVerified ? 'text-[#34D399]' : isPending ? 'text-[#FBBF24]' : 'text-[#A3A3A3]'
  return (
    <span className={`rounded px-2 py-1 text-label-sm font-bold ${bg} ${text}`}>{status}</span>
  )
}

export function BrokerDeskTab() {
  return (
    <div className="flex flex-col pb-20">
      {/* Header */}
      <header className="border-b-2 border-primary bg-black px-4 py-3 md:px-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-primary">
              <Shield className="h-5 w-5 text-black" />
            </span>
            <span className="font-display text-title-lg font-extrabold text-[#F9FAFB]">IRONFREIGHT</span>
          </div>
          <div className="flex items-center gap-4">
            <button type="button" className="p-1 text-[#F9FAFB]" aria-label="Notifications">
              <Bell className="h-5 w-5" />
            </button>
            <span className="flex h-9 w-9 items-center justify-center rounded-full bg-primary text-sm font-bold text-black">
              JD
            </span>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 px-6 py-6">
        {STATS.map(({ label, value }) => (
          <div key={label} className="rounded border border-divider bg-surface p-4">
            <p className="text-label-sm text-[#A3A3A3]">{label}</p>
            <p className="mt-1 font-display text-headline-md font-extrabold text-[#F9FAFB]">{value}</p>
          </div>
        ))}
      </div>

      {/* MC Lookup */}
      <div className="mx-4 mb-6 rounded border border-[#333] bg-[#1E1E1E] p-6 md:mx-6">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-primary" />
          <h2 className="font-display text-label-lg font-bold text-primary">CARRIER VETTING: MC LOOKUP</h2>
        </div>
        <div className="mt-4 flex gap-4">
          <input
            type="text"
            placeholder="Enter MC# or DOT#"
            className="flex-1 rounded border border-divider bg-[#121212] px-3 py-2.5 text-sm text-white placeholder-white/50 outline-none"
          />
          <button
            type="button"
            className="rounded bg-primary px-4 py-2.5 font-bold text-black hover:opacity-95"
          >
            VERIFY IDENTITY
          </button>
        </div>
        <div className="mt-4 rounded border border-divider bg-[#121212] p-4">
          <div className="flex items-center gap-4">
            <CheckCircle className="h-6 w-6 flex-shrink-0 text-success" />
            <div className="min-w-0 flex-1">
              <p className="font-bold text-[#F9FAFB]">TITAN LOGISTICS GROUP (MC-992834)</p>
              <p className="text-body-sm text-success">Insurance Active • Safety Rating: Satisfactory</p>
            </div>
            <button type="button" className="text-sm text-primary">Details</button>
          </div>
        </div>
      </div>

      {/* Load management */}
      <div className="flex-1 px-6">
        <div className="mb-4 flex flex-wrap items-center justify-between gap-4">
          <h2 className="font-display text-title-md font-extrabold text-[#F9FAFB]">LOAD MANAGEMENT</h2>
          <div className="flex gap-2">
            <span className="rounded bg-primary px-3 py-1.5 text-label-sm font-medium text-black">All</span>
            <button type="button" className="rounded px-3 py-1.5 text-label-sm text-[#A3A3A3] hover:text-white">
              Active
            </button>
            <button type="button" className="rounded px-3 py-1.5 text-label-sm text-[#A3A3A3] hover:text-white">
              Pending
            </button>
          </div>
        </div>
        <ul className="space-y-4">
          {LOADS.map((load) => (
            <li
              key={load.id}
              className="rounded border border-divider bg-surface p-6"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex flex-col gap-0.5">
                  <p className="text-label-sm font-extrabold text-[#A3A3A3]">LOAD #{load.id}</p>
                  <p className="font-display text-title-md font-bold text-[#F9FAFB]">
                    {load.origin} → {load.destination}
                  </p>
                </div>
                <StatusChip status={load.status} />
              </div>
              <div className="my-3 h-px bg-divider" />
              <div className="flex flex-wrap gap-6">
                <div>
                  <p className="text-label-sm text-hint">CARRIER</p>
                  <p className="text-body-md text-[#F9FAFB] truncate">{load.carrier}</p>
                </div>
                <div>
                  <p className="text-label-sm text-hint">DRIVER</p>
                  <p className="text-body-md text-[#F9FAFB] truncate">{load.driver}</p>
                </div>
                <div className="ml-auto text-right">
                  <p className="text-label-sm text-hint">RATE</p>
                  <p className="font-display text-body-lg font-extrabold text-primary">{load.rate}</p>
                </div>
              </div>
              <div className="mt-4 flex gap-2">
                <button
                  type="button"
                  className="flex-1 rounded border border-[#F9FAFB] py-2 text-sm text-[#F9FAFB] hover:bg-white/5"
                >
                  View Manifest
                </button>
                <button
                  type="button"
                  className="flex-1 inline-flex items-center justify-center gap-2 rounded bg-primary py-2 text-sm font-bold text-black"
                >
                  <MapPin className="h-4 w-4" />
                  Track GPS
                </button>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* FAB */}
      <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-bold text-black shadow-lg hover:opacity-95">
        <Plus className="h-5 w-5" />
        POST NEW LOAD
      </div>
    </div>
  )
}
