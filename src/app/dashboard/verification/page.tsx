'use client'

import { useAtomValue } from 'jotai'
import { userAtom } from '@/lib/store'

export default function VerificationPage() {
  const user = useAtomValue(userAtom)

  return (
    <div className="p-4 sm:p-6">
      <h1 className="mb-6 text-xl font-bold text-iron-100">Verification</h1>
      <div className="space-y-6 rounded-xl border border-iron-700 bg-iron-800/50 p-6">
        <div>
          <h2 className="text-sm font-semibold text-iron-200">Profile verification</h2>
          <p className="mt-1 text-sm text-iron-400">Status: {user?.verified_status ?? 'pending'}</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-iron-200">IronGate (driver view)</h2>
          <p className="mt-1 text-sm text-iron-400">Drivers see only: pickup/delivery address (with nav link), appointment times, and IronGate QR. Pay rate, broker name, and shipper contact are hidden to prevent back-solicitation.</p>
        </div>
        <div>
          <h2 className="text-sm font-semibold text-iron-200">Verifications table</h2>
          <p className="mt-1 text-sm text-iron-400">Stores load_id, driver_biometric_hash, pickup_timestamp, delivery_timestamp, geofence_coords for audit.</p>
        </div>
      </div>
    </div>
  )
}
