'use client'

import { useState } from 'react'
import {
  X,
  ArrowRight,
  Search,
  Plus,
  Shield,
  CheckCircle,
  Circle,
  Phone,
} from 'lucide-react'

const DRIVERS = [
  { initials: 'JD', name: 'John Doe', phone: '+1 (555) 010-2234', status: 'Available', selected: true },
  { initials: 'MS', name: 'Marcus Sterling', phone: '+1 (555) 010-8891', status: 'On Trip', selected: false },
  { initials: 'RH', name: 'Ricardo Hayes', phone: '+1 (555) 010-4452', status: 'Available', selected: false },
  { initials: 'AL', name: 'Alex Low', phone: '+1 (555) 010-7712', status: 'Off Duty', selected: false },
]

export function LoadAssignmentTab() {
  const [selectedId, setSelectedId] = useState('JD')

  return (
    <div className="flex flex-col pb-28">
      {/* Header */}
      <header className="border-b-2 border-primary bg-[#121212] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="font-display text-label-lg font-extrabold text-primary">ASSIGN DRIVER</h1>
            <p className="font-display text-lg font-bold text-[#F9FAFB]">Load #IF-99281</p>
          </div>
          <button type="button" className="p-1 text-[#F9FAFB]" aria-label="Close">
            <X className="h-6 w-6" />
          </button>
        </div>
      </header>

      {/* Load summary card */}
      <div className="mx-6 mt-6 rounded border-l-4 border-primary border-divider bg-surface p-6 shadow-md">
        <div className="mb-4 flex items-center justify-between">
          <span className="rounded bg-primary/20 px-2 py-1 text-label-sm font-bold text-primary">ACCEPTED</span>
          <span className="font-display text-title-md font-bold text-success">Rate: $2,450.00</span>
        </div>
        <div className="h-px bg-divider" />
        <div className="mt-4 flex items-start gap-6">
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-label-sm text-[#A3A3A3]">ORIGIN</p>
              <p className="text-body-md font-semibold text-[#F9FAFB]">Chicago, IL (Dock A)</p>
            </div>
            <div>
              <p className="text-label-sm text-[#A3A3A3]">PICKUP DATE</p>
              <p className="text-body-md font-semibold text-[#F9FAFB]">Oct 27, 08:00 AM</p>
            </div>
          </div>
          <ArrowRight className="h-5 w-5 flex-shrink-0 text-[#A3A3A3]" />
          <div className="flex-1 space-y-3">
            <div>
              <p className="text-label-sm text-[#A3A3A3]">DESTINATION</p>
              <p className="text-body-md font-semibold text-[#F9FAFB]">Nashville, TN</p>
            </div>
            <div>
              <p className="text-label-sm text-[#A3A3A3]">DELIVERY BY</p>
              <p className="text-body-md font-semibold text-[#F9FAFB]">Oct 28, 04:00 PM</p>
            </div>
          </div>
        </div>
      </div>

      {/* Driver selection */}
      <div className="px-6 pt-6">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="font-display text-title-md font-bold text-[#F9FAFB]">Select Verified Driver</h2>
          <button type="button" className="inline-flex items-center gap-1 text-label-sm text-primary">
            <Plus className="h-3.5 w-3.5" />
            Add New Driver
          </button>
        </div>
        <input
          type="search"
          placeholder="Search by name or phone..."
          className="mb-4 w-full rounded border border-divider bg-surface py-2.5 pl-10 pr-3 text-sm text-white placeholder-white/50 outline-none"
        />
        <ul className="space-y-2">
          {DRIVERS.map((d) => (
            <li
              key={d.name}
              onClick={() => setSelectedId(d.initials)}
              className={`flex cursor-pointer items-center gap-4 rounded border p-4 transition ${
                selectedId === d.initials ? 'border-primary bg-surface' : 'border-divider bg-surface'
              }`}
            >
              <span
                className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded text-sm font-semibold ${
                  selectedId === d.initials ? 'bg-primary text-black' : 'bg-background text-[#F9FAFB]'
                }`}
              >
                {d.initials}
              </span>
              <div className="min-w-0 flex-1">
                <p className="font-display text-title-md font-semibold text-[#F9FAFB]">{d.name}</p>
                <div className="flex items-center gap-2 text-body-sm text-[#A3A3A3]">
                  <Phone className="h-3.5 w-3.5" />
                  {d.phone}
                </div>
              </div>
              <div className="flex flex-col items-end gap-1">
                <span
                  className={`text-label-sm font-bold ${
                    d.status === 'Available' ? 'text-success' : 'text-error'
                  }`}
                >
                  {d.status}
                </span>
                {selectedId === d.initials ? (
                  <CheckCircle className="h-5 w-5 text-primary" />
                ) : (
                  <Circle className="h-5 w-5 text-divider" />
                )}
              </div>
            </li>
          ))}
        </ul>
      </div>

      {/* IronGate protocol notice */}
      <div className="mx-6 mt-6 rounded border border-[#333] bg-[#1A1A1A] p-4">
        <div className="flex gap-4">
          <Shield className="h-6 w-6 flex-shrink-0 text-primary" />
          <div>
            <p className="font-display text-label-sm font-extrabold text-primary">IRON-GATE PROTOCOL</p>
            <p className="mt-1 text-body-sm text-[#A3A3A3]">
              Assignment will generate a unique encrypted QR code accessible only by the selected driver&apos;s
              device. GPS verification will be required at the dock.
            </p>
          </div>
        </div>
      </div>

      <div className="h-24" />

      {/* FAB */}
      <div className="fixed bottom-6 left-1/2 flex -translate-x-1/2 items-center gap-2 rounded bg-primary px-6 py-4 font-bold text-black shadow-lg hover:opacity-95">
        <CheckCircle className="h-5 w-5" />
        CONFIRM ASSIGNMENT
      </div>
    </div>
  )
}
