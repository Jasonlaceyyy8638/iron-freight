'use client'

import dynamic from 'next/dynamic'
import {
  Radio,
  MapPin,
  Building2,
  BadgeCheck,
  Truck,
  AlertTriangle,
  ScanQrCode,
} from 'lucide-react'

const GeofenceMap = dynamic(
  () => import('@/components/GeofenceMap').then((mod) => ({ default: mod.GeofenceMap })),
  { ssr: false }
)

export function ShipperGateTab() {
  return (
    <div className="flex flex-col pb-8">
      {/* Header */}
      <header className="border-b-4 border-primary bg-[#1A1A1A] px-6 py-4">
        <div className="flex items-center justify-between">
          <div>
            <span className="font-display text-title-lg font-extrabold text-primary font-mono">IRONFREIGHT</span>
            <p className="text-label-sm text-[#666] font-mono">SECURE GATEWAY v2.4</p>
          </div>
          <button type="button" className="p-1 text-primary" aria-label="Settings">
            <Radio className="h-6 w-6" />
          </button>
        </div>
      </header>

      <div className="flex flex-col gap-6 px-6 py-6">
        {/* Load card */}
        <div className="rounded border border-divider bg-surface p-6 shadow-sm">
          <div className="flex items-start justify-between">
            <div>
              <p className="font-display text-title-md font-bold text-[#F9FAFB]">LOAD #IF-99281</p>
              <p className="text-body-sm text-[#A3A3A3]">Status: Pending Verification</p>
            </div>
            <span className="rounded bg-success/22 px-2 py-1 text-label-sm font-bold text-success">SECURE</span>
          </div>
          {/* Geofence map: dock 140m radius, driver inside */}
          <div className="mt-4">
            <p className="text-label-sm text-[#A3A3A3]">Dock geofence (140m) – driver position</p>
            <GeofenceMap
              center={[33.9416, -118.4085]}
              zoom={15}
              circles={[{ lat: 33.9416, lng: -118.4085, radiusMeters: 140, label: 'Dock geofence (140m)' }]}
              markers={[
                { lat: 33.9416, lng: -118.4085, label: 'Dock', color: '#C1FF00' },
                { lat: 33.9422, lng: -118.4078, label: 'Driver (within 140m)', color: '#22C55E' },
              ]}
              height="200px"
              className="mt-2"
            />
          </div>
          {/* Scan frame */}
          <div className="mt-4 flex h-[200px] items-center justify-center rounded border-2 border-[#333] bg-black">
            <div className="flex h-[160px] w-[160px] flex-col items-center justify-center rounded-xl border-2 border-primary">
              <span className="text-label-lg font-bold text-primary">Scan frame</span>
            </div>
          </div>
          <div className="mt-2 flex items-center justify-center gap-2 rounded bg-black/80 py-2 border border-success">
            <MapPin className="h-4 w-4 text-success" />
            <span className="font-display text-label-lg font-bold text-success">DRIVER WITHIN 140m</span>
          </div>
        </div>

        {/* Expected carrier identity */}
        <div>
          <h2 className="text-label-sm font-bold text-[#A3A3A3]">EXPECTED CARRIER IDENTITY</h2>
          <div className="mt-3 rounded border border-divider bg-surface p-4">
            <ul className="space-y-4">
              {[
                { icon: Building2, label: 'CARRIER', value: 'Titan Haulage Solutions' },
                { icon: BadgeCheck, label: 'ASSIGNED DRIVER', value: 'Marcus V. Richardson' },
                { icon: Truck, label: 'EQUIPMENT', value: "53' Reefer - Plate #TRK-882" },
              ].map(({ icon: Icon, label, value }) => (
                <li key={label} className="flex items-center gap-4">
                  <Icon className="h-[18px] w-[18px] text-[#A3A3A3]" />
                  <div className="min-w-0 flex-1">
                    <p className="text-label-sm text-[#A3A3A3]">{label}</p>
                    <p className="text-body-md font-semibold text-[#F9FAFB] truncate">{value}</p>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          <div className="mt-4 rounded border border-primary/20 bg-primary/11 p-4">
            <div className="flex gap-3">
              <AlertTriangle className="h-5 w-5 flex-shrink-0 text-primary" />
              <p className="text-body-sm text-primary" style={{ lineHeight: 1.4 }}>
                Ensure driver identity matches the digital chain of custody before releasing the seal.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4 border-t border-divider bg-surface pt-6">
          <button
            type="button"
            className="w-full rounded border border-[#F9FAFB] py-3 text-body-md text-[#F9FAFB] hover:bg-white/5"
          >
            MANUAL VERIFICATION
          </button>
          <button
            type="button"
            className="flex h-16 w-full items-center justify-center gap-4 rounded bg-primary shadow-md"
          >
            <ScanQrCode className="h-6 w-6 text-black" />
            <span className="font-display text-title-md font-extrabold text-black">SCAN IRON_GATE CODE</span>
          </button>
          <p className="text-center text-label-sm text-hint font-mono">
            SECURED BY IRONFREIGHT IDENTITY PROTECTION
          </p>
        </div>
      </div>
    </div>
  )
}
