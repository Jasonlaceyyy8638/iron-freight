'use client'

import { Building2, BadgeCheck, ScanQrCode, AlertTriangle, CheckCircle2, MapPin } from 'lucide-react'
import { Logo } from '@/components/Logo'

const DASHBOARD_TABS = [
  { id: 'load-board', label: 'Load Board' },
  { id: 'my-loads', label: 'My Loads' },
  { id: 'fleet', label: 'Fleet' },
  { id: 'gate', label: 'Gate' },
  { id: 'verification', label: 'Verification' },
]

const MOCK_LOADS = [
  { load_number: 'IF-99281', origin: 'Dallas, TX', destination: 'Phoenix, AZ', commodity: 'General', weight: '42k', status: 'assigned' },
  { load_number: 'IF-99280', origin: 'Chicago, IL', destination: 'Atlanta, GA', commodity: 'Reefer', weight: '40k', status: 'posted' },
  { load_number: 'IF-99279', origin: 'LA, CA', destination: 'Seattle, WA', commodity: 'Dry van', weight: '44k', status: 'in_transit' },
]

export function BrokerDashboardPreview() {
  return (
    <div className="rounded-xl border border-iron-700 bg-iron-950 overflow-hidden shadow-xl">
      <div className="border-b border-iron-800 bg-iron-900/95 px-3 py-2 flex items-center justify-between">
        <Logo variant="icon" className="h-6 w-6 text-iron-100" />
        <span className="text-[10px] text-iron-500">broker@company.com</span>
      </div>
      <div className="flex gap-0.5 border-b border-iron-800 px-2 pt-2">
        {DASHBOARD_TABS.map((tab, i) => (
          <span
            key={tab.id}
            className={`border-b-2 px-2 py-1.5 text-[10px] font-medium ${
              i === 0 ? 'border-primary text-primary' : 'border-transparent text-iron-400'
            }`}
          >
            {tab.label}
          </span>
        ))}
      </div>
      <div className="p-3">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-sm font-bold text-iron-100">Load Board</h2>
          <div className="flex gap-1">
            {['All', 'Posted', 'Assigned'].map((l, i) => (
              <span key={l} className={`rounded border px-2 py-0.5 text-[10px] ${i === 0 ? 'border-primary bg-primary/20 text-primary' : 'border-iron-600 text-iron-400'}`}>{l}</span>
            ))}
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-iron-700">
          <table className="min-w-full text-[10px]">
            <thead>
              <tr className="border-b border-iron-700 bg-iron-900/50">
                <th className="px-2 py-1.5 text-left font-medium text-iron-400">Load #</th>
                <th className="px-2 py-1.5 text-left font-medium text-iron-400">Origin → Dest</th>
                <th className="px-2 py-1.5 text-left font-medium text-iron-400">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-800">
              {MOCK_LOADS.map((load) => (
                <tr key={load.load_number} className="bg-iron-900/30">
                  <td className="px-2 py-1.5 font-medium text-iron-200">{load.load_number}</td>
                  <td className="px-2 py-1.5 text-iron-300">{load.origin} → {load.destination}</td>
                  <td className="px-2 py-1.5"><span className="rounded bg-iron-700 px-1.5 py-0.5 text-iron-300">{load.status.replace('_', ' ')}</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function CarrierDashboardPreview() {
  return (
    <div className="rounded-xl border border-iron-700 bg-iron-950 overflow-hidden shadow-xl">
      <div className="border-b border-iron-800 bg-iron-900/95 px-3 py-2 flex items-center justify-between">
        <Logo variant="icon" className="h-6 w-6 text-iron-100" />
        <span className="text-[10px] text-iron-500">carrier@company.com</span>
      </div>
      <div className="flex gap-0.5 border-b border-iron-800 px-2 pt-2">
        {DASHBOARD_TABS.map((tab, i) => (
          <span key={tab.id} className={`border-b-2 px-2 py-1.5 text-[10px] font-medium ${i === 1 ? 'border-primary text-primary' : 'border-transparent text-iron-400'}`}>{tab.label}</span>
        ))}
      </div>
      <div className="p-3">
        <h2 className="text-sm font-bold text-iron-100 mb-3">My Loads</h2>
        <div className="space-y-2">
          {MOCK_LOADS.filter((_, i) => i < 2).map((load) => (
            <div key={load.load_number} className="rounded-lg border border-iron-700 bg-iron-800/50 p-2">
              <p className="text-[10px] font-medium text-iron-200">{load.load_number} · {load.origin} → {load.destination}</p>
              <p className="text-[9px] text-iron-500 mt-0.5">Status: {load.status}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export function DriverAppPreview() {
  return (
    <div className="rounded-xl border border-iron-700 bg-iron-950 overflow-hidden shadow-xl">
      <div className="border-b border-iron-800 bg-iron-900/80 px-3 py-2 flex items-center justify-between">
        <Logo variant="icon" className="h-6 w-6 text-iron-100" />
        <span className="text-[9px] text-iron-500">IronGate view</span>
      </div>
      <div className="p-3">
        <div className="mb-2 rounded border border-amber-800/50 bg-amber-900/20 px-2 py-1 text-[9px] text-amber-200">
          Restricted view: Pay rate, broker name, and shipper contact are hidden.
        </div>
        <h2 className="text-sm font-bold text-iron-100">Your assigned load</h2>
        <div className="mt-2 space-y-2">
          <div className="rounded-lg border border-iron-700 bg-iron-800/50 p-2">
            <p className="text-[9px] uppercase text-iron-500">Pickup</p>
            <p className="text-[10px] font-medium text-iron-200">1234 Industrial Blvd, Dallas, TX</p>
            <p className="text-[9px] text-iron-400">Open in maps →</p>
          </div>
          <div className="rounded-lg border border-iron-700 bg-iron-800/50 p-2">
            <p className="text-[9px] uppercase text-iron-500">Delivery</p>
            <p className="text-[10px] font-medium text-iron-200">5678 Warehouse Dr, Phoenix, AZ</p>
            <p className="text-[9px] text-iron-400">Open in maps →</p>
          </div>
        </div>
        <div className="mt-3 rounded-lg bg-blue-600 py-2 text-center text-[10px] font-semibold text-white">
          Show IronGate QR code
        </div>
        <p className="mt-1 text-center text-[9px] text-iron-500">Shipper scans this for verification.</p>
      </div>
    </div>
  )
}

export function DriverQRPreview() {
  return (
    <div className="rounded-xl border border-iron-700 bg-iron-950 overflow-hidden shadow-xl">
      <div className="border-b border-iron-800 bg-iron-900/80 px-3 py-2 flex justify-center">
        <Logo variant="icon" className="h-6 w-6 text-iron-100" />
      </div>
      <div className="p-3">
        <div className="rounded-xl border-2 border-amber-400/80 bg-amber-500/15 px-3 py-3">
          <div className="flex gap-2">
            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-amber-500/30">
              <AlertTriangle className="h-4 w-4 text-amber-400" />
            </div>
            <div>
              <h3 className="text-[10px] font-bold text-amber-200">Wait for the shipper before showing the QR</h3>
              <p className="mt-1 text-[9px] text-amber-200/90">Code is only valid for 15 minutes.</p>
            </div>
          </div>
        </div>
        <p className="mt-3 text-center text-[9px] text-iron-500">When the shipper is ready, tap below.</p>
        <button type="button" className="mt-3 w-full rounded-xl bg-primary py-2.5 text-[10px] font-bold text-black">
          Shipper is ready — Show QR code
        </button>
      </div>
    </div>
  )
}

export function BrokerCarrierLiveMapPreview({ role = 'broker' }: { role?: 'broker' | 'carrier' }) {
  const email = role === 'carrier' ? 'carrier@company.com' : 'broker@company.com'
  return (
    <div className="rounded-xl border border-iron-700 bg-iron-950 overflow-hidden shadow-xl">
      <div className="border-b border-iron-800 bg-iron-900/95 px-3 py-2 flex items-center justify-between">
        <Logo variant="icon" className="h-6 w-6 text-iron-100" />
        <span className="text-[10px] text-iron-500">{email}</span>
      </div>
      <div className="p-3">
        <h2 className="text-sm font-bold text-iron-100 mb-1">Track driver (live map)</h2>
        <p className="text-[9px] text-iron-500 mb-3">Enter load number to see the driver&apos;s live location on the map.</p>
        <div className="flex flex-wrap items-end gap-2">
          <div>
            <label className="block text-[9px] font-medium text-iron-400 mb-0.5">Load number</label>
            <input readOnly value="IF-99281" className="w-28 rounded border border-iron-600 bg-iron-900 px-2 py-1.5 text-[10px] text-iron-200" />
          </div>
          <span className="rounded bg-primary px-2 py-1.5 text-[10px] font-medium text-black">Show map</span>
        </div>
        <div className="mt-3 rounded-lg border border-iron-700 bg-iron-900/50 overflow-hidden">
          <p className="px-2 py-1.5 text-[9px] font-medium text-iron-400">Live location for load IF-99281 — Marcus V. Richardson</p>
          <div className="h-24 flex items-center justify-center bg-iron-900 text-iron-500">
            <MapPin className="h-5 w-5 mr-1" /> Map · Driver + geofence
          </div>
        </div>
      </div>
    </div>
  )
}

export function BrokerMyLoadsPreview() {
  return (
    <div className="rounded-xl border border-iron-700 bg-iron-950 overflow-hidden shadow-xl">
      <div className="border-b border-iron-800 bg-iron-900/95 px-3 py-2 flex items-center justify-between">
        <Logo variant="icon" className="h-6 w-6 text-iron-100" />
        <span className="text-[10px] text-iron-500">broker@company.com</span>
      </div>
      <div className="flex gap-0.5 border-b border-iron-800 px-2 pt-2">
        {DASHBOARD_TABS.map((tab, i) => (
          <span key={tab.id} className={`border-b-2 px-2 py-1.5 text-[10px] font-medium ${i === 1 ? 'border-primary text-primary' : 'border-transparent text-iron-400'}`}>{tab.label}</span>
        ))}
      </div>
      <div className="p-3">
        <h2 className="text-sm font-bold text-iron-100 mb-3">My Loads</h2>
        <div className="overflow-hidden rounded-lg border border-iron-700">
          <table className="min-w-full text-[10px]">
            <thead>
              <tr className="border-b border-iron-700 bg-iron-900/50">
                <th className="px-2 py-1.5 text-left font-medium text-iron-400">Load #</th>
                <th className="px-2 py-1.5 text-left font-medium text-iron-400">Origin → Dest</th>
                <th className="px-2 py-1.5 text-left font-medium text-iron-400">Status</th>
                <th className="px-2 py-1.5 text-left font-medium text-iron-400">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-iron-800">
              {MOCK_LOADS.map((load) => (
                <tr key={load.load_number} className="bg-iron-900/30">
                  <td className="px-2 py-1.5 font-medium text-iron-200">{load.load_number}</td>
                  <td className="px-2 py-1.5 text-iron-300">{load.origin} → {load.destination}</td>
                  <td className="px-2 py-1.5"><span className="rounded bg-iron-700 px-1.5 py-0.5 text-iron-300">{load.status}</span></td>
                  <td className="px-2 py-1.5"><span className="text-primary">View BOL</span> · <span className="text-blue-400">Track</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function BrokerGatePreview() {
  return (
    <div className="rounded-xl border border-iron-700 bg-iron-950 overflow-hidden shadow-xl">
      <div className="border-b border-iron-800 bg-iron-900/95 px-3 py-2 flex items-center justify-between">
        <Logo variant="icon" className="h-6 w-6 text-iron-100" />
        <span className="text-[10px] text-iron-500">broker@company.com</span>
      </div>
      <div className="flex gap-0.5 border-b border-iron-800 px-2 pt-2">
        {DASHBOARD_TABS.map((tab, i) => (
          <span key={tab.id} className={`border-b-2 px-2 py-1.5 text-[10px] font-medium ${i === 3 ? 'border-primary text-primary' : 'border-transparent text-iron-400'}`}>{tab.label}</span>
        ))}
      </div>
      <div className="p-3">
        <h2 className="text-sm font-bold text-iron-100">Scan driver QR – Load IF-99281</h2>
        <div className="mt-2 rounded-lg border border-iron-700 bg-iron-800/50 p-2">
          <p className="text-[9px] font-semibold text-iron-400">Expected at dock</p>
          <div className="mt-1 flex items-center gap-2"><Building2 className="h-3 w-3 text-iron-500" /><span className="text-[10px] text-iron-200">Titan Haulage</span></div>
          <div className="mt-0.5 flex items-center gap-2"><BadgeCheck className="h-3 w-3 text-iron-500" /><span className="text-[10px] text-iron-200">Marcus V. Richardson</span></div>
        </div>
        <div className="mt-3 flex h-16 items-center justify-center rounded-lg border-2 border-dashed border-iron-600 bg-iron-900/50 text-[9px] text-iron-500">Camera view · Scan frame</div>
        <button type="button" className="mt-2 w-full rounded-lg bg-primary py-2 text-[10px] font-medium text-black">Scan QR code</button>
      </div>
    </div>
  )
}

export function CarrierFleetPreview() {
  return (
    <div className="rounded-xl border border-iron-700 bg-iron-950 overflow-hidden shadow-xl">
      <div className="border-b border-iron-800 bg-iron-900/95 px-3 py-2 flex items-center justify-between">
        <Logo variant="icon" className="h-6 w-6 text-iron-100" />
        <span className="text-[10px] text-iron-500">carrier@company.com</span>
      </div>
      <div className="flex gap-0.5 border-b border-iron-800 px-2 pt-2">
        {DASHBOARD_TABS.map((tab, i) => (
          <span key={tab.id} className={`border-b-2 px-2 py-1.5 text-[10px] font-medium ${i === 2 ? 'border-primary text-primary' : 'border-transparent text-iron-400'}`}>{tab.label}</span>
        ))}
      </div>
      <div className="p-3">
        <h2 className="text-sm font-bold text-iron-100 mb-2">Fleet</h2>
        <p className="text-[9px] text-iron-500 mb-3">Invite drivers; assign from My Loads when you win a bid.</p>
        <div className="mb-3 rounded-lg border border-iron-700 bg-iron-800/50 p-2">
          <p className="text-[9px] font-semibold text-iron-400">Invite driver</p>
          <div className="mt-1.5 flex flex-wrap gap-2">
            <input readOnly placeholder="driver@example.com" className="w-28 rounded border border-iron-600 bg-iron-900 px-2 py-1 text-[9px] text-iron-300" />
            <input readOnly placeholder="Name" className="w-20 rounded border border-iron-600 bg-iron-900 px-2 py-1 text-[9px] text-iron-300" />
            <span className="rounded bg-primary px-2 py-1 text-[9px] font-medium text-black">Send invite</span>
          </div>
        </div>
        <div className="overflow-hidden rounded-lg border border-iron-700">
          <table className="min-w-full text-[10px]">
            <thead><tr className="border-b border-iron-700 bg-iron-900/50"><th className="px-2 py-1.5 text-left font-medium text-iron-400">Driver</th><th className="px-2 py-1.5 text-left font-medium text-iron-400">CDL</th><th className="px-2 py-1.5 text-left font-medium text-iron-400">Verified</th></tr></thead>
            <tbody className="divide-y divide-iron-800">
              <tr className="bg-iron-900/30"><td className="px-2 py-1.5 font-medium text-iron-200">Marcus V. Richardson</td><td className="px-2 py-1.5 text-iron-400">***4521</td><td className="px-2 py-1.5 text-green-400">Yes</td></tr>
              <tr className="bg-iron-900/30"><td className="px-2 py-1.5 font-medium text-iron-200">J. Martinez</td><td className="px-2 py-1.5 text-iron-400">***8834</td><td className="px-2 py-1.5 text-iron-500">—</td></tr>
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

export function DriverQRDisplayPreview() {
  return (
    <div className="rounded-xl border border-iron-700 bg-iron-950 overflow-hidden shadow-xl">
      <div className="border-b border-iron-800 bg-iron-900/80 px-3 py-2 flex justify-center">
        <Logo variant="icon" className="h-6 w-6 text-iron-100" />
      </div>
      <div className="p-3 text-center">
        <h2 className="text-sm font-bold text-iron-100">IronGate QR</h2>
        <p className="text-[9px] text-iron-400 mt-0.5">Shipper scans at the dock. Valid 15 min.</p>
        <div className="mt-3 flex justify-center">
          <div className="grid h-20 w-20 grid-cols-5 gap-0.5 rounded-lg border-2 border-iron-600 bg-white p-1">
            {Array.from({ length: 25 }).map((_, i) => (
              <div key={i} className={`h-2.5 w-2.5 rounded-sm ${[0, 1, 2, 3, 4, 5, 9, 10, 14, 15, 19, 20, 21, 22, 23, 24].includes(i) ? 'bg-iron-900' : 'bg-white'}`} aria-hidden />
            ))}
          </div>
        </div>
        <p className="mt-2 text-[9px] text-iron-500">Expires in 14:32</p>
        <p className="mt-3 text-[9px] text-iron-500">Waiting for shipper to scan…</p>
      </div>
    </div>
  )
}

export function DriverVerifiedPreview() {
  return (
    <div className="rounded-xl border border-iron-700 bg-iron-950 overflow-hidden shadow-xl">
      <div className="p-4 text-center">
        <CheckCircle2 className="mx-auto h-10 w-10 text-[#22C55E]" />
        <h2 className="mt-2 text-sm font-bold text-iron-100">Verified at dock</h2>
        <p className="mt-1 text-[9px] text-iron-400">Shipper has scanned your QR. You can continue.</p>
        <button type="button" className="mt-4 w-full rounded-lg bg-primary py-2 text-[10px] font-medium text-black">Back to driver</button>
      </div>
    </div>
  )
}

export function ShipperGateLoadEntryPreview() {
  return (
    <div className="rounded-xl border border-iron-700 bg-iron-950 overflow-hidden shadow-xl">
      <div className="border-b border-iron-800 bg-iron-900/95 px-3 py-2 flex items-center justify-between">
        <Logo variant="icon" className="h-6 w-6 text-iron-100" />
        <span className="text-[10px] text-iron-500">shipper@warehouse.com</span>
      </div>
      <div className="p-3">
        <h2 className="text-sm font-bold text-iron-100">IronGate – Verify at dock</h2>
        <p className="text-[9px] text-iron-400 mt-0.5">Enter the load number, then scan the driver&apos;s QR.</p>
        <div className="mt-3">
          <label className="block text-[9px] font-medium text-iron-400">Load number</label>
          <input type="text" readOnly value="IF-99281" className="mt-0.5 block w-full rounded border border-iron-700 bg-iron-900 px-2 py-1.5 text-[10px] text-iron-200" />
        </div>
        <button type="button" className="mt-3 w-full rounded-lg bg-primary py-2 text-[10px] font-medium text-black">Continue</button>
      </div>
    </div>
  )
}

export function ShipperGatePreview() {
  return (
    <div className="rounded-xl border border-iron-700 bg-iron-950 overflow-hidden shadow-xl">
      <div className="border-b border-iron-800 bg-iron-900/95 px-3 py-2 flex items-center justify-between">
        <Logo variant="icon" className="h-6 w-6 text-iron-100" />
        <span className="text-[10px] text-iron-500">shipper@warehouse.com</span>
      </div>
      <div className="p-3">
        <h2 className="text-sm font-bold text-iron-100">Scan driver QR – Load IF-99281</h2>
        <div className="mt-2 rounded-lg border border-iron-700 bg-iron-800/50 p-2">
          <p className="text-[9px] font-semibold text-iron-400">Expected at dock</p>
          <div className="mt-1.5 flex items-center gap-2">
            <Building2 className="h-3.5 w-3.5 text-iron-500" />
            <span className="text-[10px] text-iron-200">Titan Haulage Solutions</span>
          </div>
          <div className="mt-1 flex items-center gap-2">
            <BadgeCheck className="h-3.5 w-3.5 text-iron-500" />
            <span className="text-[10px] text-iron-200">Marcus V. Richardson</span>
          </div>
        </div>
        <div className="mt-3 flex h-14 items-center justify-center rounded-lg border-2 border-primary bg-black/50 text-[9px] text-primary">Scan frame</div>
        <button type="button" className="mt-2 flex w-full items-center justify-center gap-1.5 rounded-lg border border-primary/50 bg-primary/10 py-2 text-[10px] font-medium text-primary">
          <ScanQrCode className="h-3.5 w-3.5" /> Scan QR code
        </button>
      </div>
    </div>
  )
}

export function ShipperSuccessPreview() {
  return (
    <div className="rounded-xl border-2 border-[#22C55E]/50 bg-[#22C55E]/10 overflow-hidden shadow-xl">
      <div className="p-4 text-center">
        <CheckCircle2 className="mx-auto h-12 w-12 text-[#22C55E]" />
        <h2 className="mt-2 text-sm font-bold text-[#F9FAFB]">Driver & carrier verified</h2>
        <p className="mt-1 text-[9px] text-iron-400">Load <strong className="text-iron-200">IF-99281</strong></p>
        <div className="mt-3 space-y-2 rounded-lg border border-iron-700 bg-iron-900/50 p-2 text-left">
          <div className="flex items-center gap-2">
            <Building2 className="h-4 w-4 text-primary" />
            <div><p className="text-[8px] text-iron-500">Carrier</p><p className="text-[10px] font-medium text-iron-200">Titan Haulage Solutions</p></div>
          </div>
          <div className="flex items-center gap-2">
            <BadgeCheck className="h-4 w-4 text-primary" />
            <div><p className="text-[8px] text-iron-500">Driver</p><p className="text-[10px] font-medium text-iron-200">Marcus V. Richardson</p></div>
          </div>
        </div>
        <div className="mt-3 flex gap-2">
          <span className="flex-1 rounded border border-primary py-1.5 text-center text-[9px] text-primary">Scan another</span>
          <span className="flex-1 rounded border border-iron-600 py-1.5 text-center text-[9px] text-iron-400">Different load</span>
        </div>
      </div>
    </div>
  )
}
