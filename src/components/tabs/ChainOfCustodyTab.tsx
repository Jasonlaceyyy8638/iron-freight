'use client'

import dynamic from 'next/dynamic'
import {
  Shield,
  CheckCircle,
  History,
  Download,
  Share2,
} from 'lucide-react'

const GeofenceMap = dynamic(
  () => import('@/components/GeofenceMap').then((mod) => ({ default: mod.GeofenceMap })),
  { ssr: false }
)

const LOG_ENTRIES = [
  { time: '10:42 AM', event: 'Geo-Fence Entry', detail: 'Driver entered 500m perimeter of Shipper Dock A.', color: 'success' },
  { time: '10:45 AM', event: 'IronGate Handshake', detail: 'QR Code generated and scanned by Shipper Terminal #4.', color: 'primary' },
  { time: '10:46 AM', event: 'Identity Verified', detail: 'Carrier/Driver link confirmed via IronFreight DB.', color: 'success' },
  { time: '10:50 AM', event: 'Bill of Lading Signed', detail: 'Digital signature captured. Chain of custody sealed.', color: 'dark' },
]

export function ChainOfCustodyTab() {
  return (
    <div className="flex flex-col">
      {/* Report header */}
      <header className="rounded-b-lg bg-[#1A1A1A] px-6 py-8 md:px-8">
        <div className="flex items-start justify-between">
          <Shield className="h-8 w-8 text-primary" />
          <span className="rounded bg-primary px-3 py-1 text-label-sm font-bold text-[#1A1A1A]">VERIFIED</span>
        </div>
        <h1 className="mt-4 font-display text-headline-md font-extrabold text-white">Chain of Custody</h1>
        <p className="mt-1 text-body-sm font-bold text-primary">REF: IF-99284-X</p>
      </header>

      <div className="flex flex-col gap-6 px-6 py-8 md:px-8">
        {/* Load assignment card */}
        <div className="rounded border border-divider bg-surface p-6 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-title-sm text-[#A3A3A3]">Load Assignment</span>
            <CheckCircle className="h-[18px] w-[18px] text-success" />
          </div>
          <div className="mt-4 flex flex-wrap gap-4">
            <div className="flex-1 min-w-[140px] rounded border border-divider bg-surface p-4">
              <p className="text-label-sm text-[#A3A3A3]">Carrier</p>
              <p className="text-body-md font-bold text-[#F9FAFB]">Ironclad Logistics</p>
            </div>
            <div className="flex-1 min-w-[100px] rounded border border-divider bg-surface p-4">
              <p className="text-label-sm text-[#A3A3A3]">MC#</p>
              <p className="text-body-md font-bold text-[#F9FAFB]">MC-109283</p>
            </div>
            <div className="flex-1 min-w-[140px] rounded border border-divider bg-surface p-4">
              <p className="text-label-sm text-[#A3A3A3]">Driver</p>
              <p className="text-body-md font-bold text-[#F9FAFB]">Marcus Thorne</p>
            </div>
            <div className="flex-1 min-w-[100px] rounded border border-divider bg-surface p-4">
              <p className="text-label-sm text-[#A3A3A3]">Device ID</p>
              <p className="text-body-md font-bold text-[#F9FAFB]">UID-8821-PX</p>
            </div>
          </div>
        </div>

        {/* Pickup verification location – geofence map */}
        <div>
          <h2 className="text-title-sm font-bold text-[#F9FAFB]">Pickup Verification Location</h2>
          <p className="mt-1 text-body-sm text-[#A3A3A3]">Geofence (500m) and scan location. GPS precision: 4.2m</p>
          <div className="mt-3">
            <GeofenceMap
              center={[34.0522, -118.2437]}
              zoom={14}
              circles={[{ lat: 34.0522, lng: -118.2437, radiusMeters: 500, label: 'Pickup geofence (500m)' }]}
              markers={[{ lat: 34.0522, lng: -118.2437, label: 'Pickup scan location', color: '#C1FF00' }]}
              height="240px"
            />
          </div>
        </div>

        {/* Delivery verification location – geofence map */}
        <div>
          <h2 className="text-title-sm font-bold text-[#F9FAFB]">Delivery Verification Location</h2>
          <p className="mt-1 text-body-sm text-[#A3A3A3]">Geofence (500m) and scan location. Chicago, IL.</p>
          <div className="mt-3">
            <GeofenceMap
              center={[41.8781, -87.6298]}
              zoom={14}
              circles={[{ lat: 41.8781, lng: -87.6298, radiusMeters: 500, label: 'Delivery geofence (500m)' }]}
              markers={[{ lat: 41.8781, lng: -87.6298, label: 'Delivery scan location', color: '#22C55E' }]}
              height="240px"
            />
          </div>
        </div>

        {/* Security event log */}
        <div className="rounded border border-divider bg-surface p-6">
          <div className="flex items-center gap-2">
            <History className="h-5 w-5 text-primary" />
            <h2 className="text-title-sm font-bold text-[#F9FAFB]">Security Event Log</h2>
          </div>
          <ul className="mt-4 space-y-0">
            {LOG_ENTRIES.map((entry, i) => (
              <li key={entry.time} className="flex gap-4">
                <div className="flex flex-col items-center">
                  <span
                    className={`h-3 w-3 rounded-full border-2 border-[#1A1A1A] ${
                      entry.color === 'success' ? 'bg-success' : entry.color === 'primary' ? 'bg-primary' : 'bg-[#1A1A1A]'
                    }`}
                  />
                  {i < LOG_ENTRIES.length - 1 && <div className="w-0.5 flex-1 bg-divider" style={{ minHeight: 40 }} />}
                </div>
                <div className="pb-6">
                  <p className="text-label-sm text-[#A3A3A3]">{entry.time}</p>
                  <p className="text-body-md font-semibold text-[#F9FAFB]">{entry.event}</p>
                  <p className="text-body-sm text-[#A3A3A3] max-w-md">{entry.detail}</p>
                </div>
              </li>
            ))}
          </ul>
        </div>

        {/* Shipper authorization */}
        <div className="rounded border border-divider bg-[#F8F9FA] p-6">
          <div className="flex items-center gap-6">
            <div className="flex-1">
              <p className="text-label-sm text-[#A3A3A3]">Shipper Authorization</p>
              <p className="text-body-md font-semibold text-[#1A1A1A]">Verified by: Sarah Jenkins</p>
              <p className="text-label-sm text-[#A3A3A3]">Timestamp: 2023-10-24 10:50:12 UTC</p>
            </div>
            <div className="h-20 w-20 rounded border border-divider bg-white flex items-center justify-center text-[#A3A3A3] text-xs">
              QR
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex gap-4">
          <button
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded border border-[#F9FAFB] py-3 text-[#F9FAFB] hover:bg-white/5"
          >
            <Download className="h-4 w-4" />
            Download PDF
          </button>
          <button
            type="button"
            className="flex-1 inline-flex items-center justify-center gap-2 rounded bg-primary py-3 font-bold text-[#1A1A1A]"
          >
            <Share2 className="h-4 w-4" />
            Share Report
          </button>
        </div>
        <div className="flex flex-col items-center gap-1 py-4">
          <p className="text-label-sm text-hint">Secured by IronFreight Identity Protection</p>
          <p className="text-center text-label-sm text-hint">Preventing double brokering through cryptographic verification.</p>
        </div>
      </div>
    </div>
  )
}
