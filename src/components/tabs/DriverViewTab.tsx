'use client'

import {
  MapPin,
  Truck,
  Shield,
  ScanQrCode,
  FileText,
  Headphones,
  History,
  Bell,
} from 'lucide-react'

export function DriverViewTab() {
  return (
    <div className="mx-auto max-w-[420px] flex flex-col pb-8">
      {/* Header */}
      <header className="border-b border-divider bg-surface px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-display text-title-md font-extrabold text-primary">IRONFREIGHT</span>
            <p className="text-label-sm text-[#A3A3A3]">Driver ID: #4492-TX</p>
          </div>
          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded bg-[#262626] text-[#F9FAFB]"
            aria-label="Notifications"
          >
            <Bell className="h-5 w-5" />
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-6 pt-6">
        {/* Current load */}
        <div className="flex items-center justify-between">
          <h2 className="font-display text-title-lg font-extrabold text-[#F9FAFB]">Current Load</h2>
          <span className="rounded bg-success/22 px-2 py-1 text-label-sm font-bold text-success">EN ROUTE</span>
        </div>
        <div className="rounded border border-divider bg-surface shadow-sm overflow-hidden">
          <div className="bg-[#262626] px-6 py-3 flex items-center justify-between">
            <span className="font-display text-label-lg font-bold text-primary">LOAD #IF-99283</span>
            <span className="text-label-sm text-[#A3A3A3]">Carrier: SwiftLink Logistics</span>
          </div>
          <div className="space-y-6 p-6">
            <div className="flex gap-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-[#262626]">
                <MapPin className="h-[18px] w-[18px] text-primary" />
              </span>
              <div>
                <p className="text-label-sm text-[#A3A3A3]">Pickup (Shipper)</p>
                <p className="text-body-md font-semibold text-[#F9FAFB]">
                  Port of Houston - Dock 7<br />
                  1212 Barbours Cut Blvd, TX
                </p>
              </div>
            </div>
            <div className="ml-4 h-5 w-0.5 bg-divider" />
            <div className="flex gap-4">
              <span className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded bg-[#262626]">
                <Truck className="h-[18px] w-[18px] text-primary" />
              </span>
              <div>
                <p className="text-label-sm text-[#A3A3A3]">Delivery (Receiver)</p>
                <p className="text-body-md font-semibold text-[#F9FAFB]">
                  Distribution Center Alpha<br />
                  4500 Industrial Pkwy, Chicago, IL
                </p>
              </div>
            </div>
            <div className="h-px bg-divider" />
            <div className="flex gap-6">
              <div>
                <p className="text-label-sm text-[#A3A3A3]">Cargo Weight</p>
                <p className="text-body-lg font-bold text-[#F9FAFB]">42,000 lbs</p>
              </div>
              <div>
                <p className="text-label-sm text-[#A3A3A3]">Equipment</p>
                <p className="text-body-lg font-bold text-[#F9FAFB]">53&apos; Dry Van</p>
              </div>
            </div>
          </div>
        </div>

        {/* IronGate verification */}
        <div className="rounded border border-[#FFEDD5] bg-[#FFF7ED] p-6">
          <div className="flex items-center gap-2">
            <Shield className="h-5 w-5 text-primary" />
            <span className="font-display text-sm font-bold text-[#9A3412]">IronGate Verification</span>
          </div>
          <p className="mt-2 text-body-sm text-[#C2410C]">
            You must be within 500m of the shipper dock to generate the secure handshake QR code.
          </p>
          <button
            type="button"
            className="mt-4 flex w-full items-center justify-center gap-2 rounded bg-primary py-4 font-extrabold text-black"
          >
            <ScanQrCode className="h-5 w-5" />
            SCAN IRON_GATE QR
          </button>
        </div>

        {/* GPS status */}
        <div className="flex items-center justify-between border-t border-divider bg-surface px-6 py-4">
          <div className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-success" />
            <span className="font-display text-label-md text-success">GPS Signal Active</span>
          </div>
          <span className="text-label-sm text-[#A3A3A3]">Last Sync: Just now</span>
        </div>

        {/* Driver tools */}
        <div>
          <h3 className="font-display text-label-lg font-bold text-[#A3A3A3]">Driver Tools</h3>
          <div className="mt-4 grid grid-cols-3 gap-4">
            <button
              type="button"
              className="flex flex-col items-center gap-2 rounded border border-divider bg-surface p-4 hover:bg-white/5"
            >
              <FileText className="h-6 w-6 text-[#A3A3A3]" />
              <span className="text-label-sm text-[#F9FAFB]">Documents</span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-2 rounded border border-divider bg-surface p-4 hover:bg-white/5"
            >
              <Headphones className="h-6 w-6 text-[#A3A3A3]" />
              <span className="text-label-sm text-[#F9FAFB]">Dispatch</span>
            </button>
            <button
              type="button"
              className="flex flex-col items-center gap-2 rounded border border-divider bg-surface p-4 hover:bg-white/5"
            >
              <History className="h-6 w-6 text-[#A3A3A3]" />
              <span className="text-label-sm text-[#F9FAFB]">History</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
