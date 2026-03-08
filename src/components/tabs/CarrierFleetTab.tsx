'use client'

import {
  Settings,
  Search,
  Filter,
  Plus,
  Shield,
  Phone,
  UserPlus,
} from 'lucide-react'

const STATS = [
  { label: 'TOTAL DRIVERS', value: '12' },
  { label: 'ON LOAD', value: '08' },
  { label: 'IDLE', value: '04' },
]

const DRIVERS = [
  { initials: 'JD', name: 'John Doe', phone: '+1 (555) 012-3456', status: 'active', statusLabel: 'ON LOAD', loadInfo: 'Load #IF-9022' },
  { initials: 'MS', name: 'Marcus Sterling', phone: '+1 (555) 987-6543', status: 'idle', statusLabel: 'IDLE', loadInfo: 'Unassigned' },
  { initials: 'AR', name: 'Alex Rivera', phone: '+1 (555) 234-5678', status: 'active', statusLabel: 'ON LOAD', loadInfo: 'Load #IF-8810' },
  { initials: 'TH', name: 'Tom Henderson', phone: '+1 (555) 444-2211', status: 'idle', statusLabel: 'IDLE', loadInfo: 'Unassigned' },
]

const CHART_DATA = [12, 15, 8, 19, 22, 14, 10]
const CHART_LABELS = ['M', 'T', 'W', 'T', 'F', 'S', 'S']

export function CarrierFleetTab() {
  return (
    <div className="flex flex-col pb-24">
      {/* Header */}
      <header className="border-b-2 border-primary bg-black px-6 py-6">
        <div className="flex items-start justify-between">
          <div className="flex flex-col gap-1">
            <span className="font-display text-label-lg font-extrabold text-primary">IRONFREIGHT</span>
            <span className="text-label-sm text-[#A3A3A3]">CARRIER PORTAL</span>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded bg-[#333] text-primary"
            aria-label="Settings"
          >
            <Settings className="h-5 w-5" />
          </button>
        </div>
        <div className="mt-4 flex flex-col gap-2">
          <h1 className="font-display text-title-lg font-bold text-[#F9FAFB]">Titan Logistics Group</h1>
          <div className="flex gap-4">
            <span className="rounded bg-[#333] px-2 py-1 text-label-sm text-[#A3A3A3]">MC# 882941</span>
            <span className="rounded bg-[#333] px-2 py-1 text-label-sm text-[#A3A3A3]">DOT# 3920114</span>
          </div>
        </div>
      </header>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4 px-6 py-6">
        {STATS.map(({ label, value }) => (
          <div key={label} className="rounded border border-divider bg-surface p-4">
            <p className="text-label-sm font-semibold text-[#A3A3A3]">{label}</p>
            <p className="mt-1 font-display text-headline-md font-extrabold text-primary">{value}</p>
          </div>
        ))}
      </div>

      {/* Fleet management */}
      <div className="px-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-label-lg font-bold text-[#F9FAFB]">FLEET MANAGEMENT</h2>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded bg-primary px-3 py-2 text-sm font-bold text-black"
          >
            <Plus className="h-4 w-4" />
            ADD DRIVER
          </button>
        </div>
        <div className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[#A3A3A3]" />
            <input
              type="search"
              placeholder="Search driver name or phone..."
              className="w-full rounded border border-divider bg-surface py-3 pl-10 pr-3 text-sm text-white placeholder-white/50 outline-none"
            />
          </div>
          <button
            type="button"
            className="flex h-12 w-12 items-center justify-center rounded border border-divider bg-surface text-primary"
          >
            <Filter className="h-5 w-5" />
          </button>
        </div>
        <ul className="space-y-2">
          {DRIVERS.map((d) => (
            <li
              key={d.name}
              className="flex items-center gap-4 rounded border border-divider bg-surface p-4"
            >
              <span className="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded bg-[#333] font-display text-title-md font-bold text-primary">
                {d.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-title-md font-bold text-[#F9FAFB] truncate">{d.name}</p>
                <div className="mt-0.5 flex items-center gap-2 text-body-sm text-[#A3A3A3]">
                  <Phone className="h-3.5 w-3.5" />
                  {d.phone}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`rounded px-2 py-1 text-label-sm font-bold ${
                    d.status === 'active' ? 'bg-success/22 text-[#4ADE80]' : 'bg-primary/20 text-primary'
                  }`}
                >
                  {d.statusLabel}
                </span>
                <span className="text-label-sm text-[#A3A3A3]">{d.loadInfo}</span>
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* Weekly load volume */}
      <div className="mx-6 mt-6 rounded border border-divider bg-surface p-6">
        <h2 className="font-display text-label-lg font-bold text-[#F9FAFB]">WEEKLY LOAD VOLUME</h2>
        <div className="mt-4 flex h-[180px] items-end justify-between gap-2">
          {CHART_DATA.map((h, i) => (
            <div key={i} className="flex flex-1 flex-col items-center gap-1">
              <div
                className="w-5 rounded-sm bg-primary"
                style={{ height: `${(h / 22) * 100}%`, minHeight: 8 }}
              />
              <span className="text-label-sm text-[#A3A3A3]">{CHART_LABELS[i]}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Identity verification notice */}
      <div className="mx-6 mt-6 rounded border border-primary/30 bg-primary/11 p-4">
        <div className="flex gap-4">
          <Shield className="h-5 w-5 flex-shrink-0 text-primary" />
          <div>
            <p className="font-display text-label-md font-bold text-primary">Identity Verification Active</p>
            <p className="mt-1 text-body-sm text-[#A3A3A3]">
              All drivers must complete biometric handshake via IronGate QR at pickup docks for Chain of Custody
              compliance.
            </p>
          </div>
        </div>
      </div>

      <div className="h-8" />

      {/* FAB */}
      <div className="fixed bottom-6 right-6 flex items-center gap-2 rounded-lg bg-primary px-5 py-3 font-bold text-black shadow-lg hover:opacity-95">
        <UserPlus className="h-5 w-5" />
        New Driver
      </div>
    </div>
  )
}
