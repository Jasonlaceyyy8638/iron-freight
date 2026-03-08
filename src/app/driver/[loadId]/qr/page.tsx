'use client'

import { useState, useEffect } from 'react'
import { useParams } from 'next/navigation'
import Link from 'next/link'
import QRCode from 'qrcode'
import { Logo } from '@/components/Logo'

export default function DriverQRPage() {
  const params = useParams()
  const loadId = (params?.loadId as string) ?? ''
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const payload = `ironfreight://verify?load=${loadId}&ts=${Date.now()}&exp=300`

  useEffect(() => {
    QRCode.toDataURL(payload, { width: 260, margin: 2 }).then(setQrDataUrl)
  }, [loadId])

  return (
    <div className="flex min-h-screen flex-col bg-iron-950">
      <header className="border-b border-iron-800 bg-iron-900/80">
        <div className="mx-auto flex max-w-lg items-center justify-between px-4 py-3">
          <Link href="/driver" className="text-iron-400 hover:text-iron-200">← Back</Link>
          <Logo variant="icon" className="h-8 w-8 text-iron-100" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center px-4 py-8">
        <h1 className="text-lg font-bold text-iron-100">IronGate QR</h1>
        <p className="mt-1 text-center text-sm text-iron-400">Shipper scans for geofenced, time-stamped verification.</p>
        <div className="mt-8 rounded-2xl border-2 border-iron-600 bg-white p-4">
          {qrDataUrl ? <img src={qrDataUrl} alt="Verification QR" className="h-64 w-64" /> : <div className="h-64 w-64 animate-pulse rounded bg-iron-700" />}
        </div>
        <p className="mt-4 text-xs text-iron-500">Time-sensitive · Expires in 5 min</p>
      </main>
    </div>
  )
}
