'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import QRCode from 'qrcode'
import { Logo } from '@/components/Logo'
import { useAtomValue } from 'jotai'
import { userAtom } from '@/lib/store'
import { getSupabase } from '@/lib/supabase/client'
import { BiometricCapture } from '@/components/BiometricCapture'
import { DocumentScanner } from '@/components/DocumentScanner'
import { IdCard, FileCheck, User, Loader2 } from 'lucide-react'

export default function DriverQRPage() {
  const params = useParams()
  const router = useRouter()
  const user = useAtomValue(userAtom)
  const loadId = (params?.loadId as string) ?? ''
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [driverId, setDriverId] = useState<string | null>(null)
  const [showBiometric, setShowBiometric] = useState(false)
  const [showCdlScanner, setShowCdlScanner] = useState(false)
  const [showBolScanner, setShowBolScanner] = useState(false)
  const payload = `ironfreight://verify?load=${loadId}&ts=${Date.now()}&exp=300`

  useEffect(() => {
    QRCode.toDataURL(payload, { width: 260, margin: 2 }).then(setQrDataUrl)
  }, [loadId])

  useEffect(() => {
    if (!user?.id || !loadId) return
    let cancelled = false
    const supabase = getSupabase()
    if (!supabase) return
    supabase
      .from('drivers')
      .select('id')
      .eq('profile_id', user.id)
      .single()
      .then(({ data }) => {
        if (!cancelled && data?.id) setDriverId(data.id)
      })
    return () => { cancelled = true }
  }, [user?.id, loadId])

  if (!loadId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-iron-950 px-4">
        <p className="text-iron-400">Invalid load.</p>
        <Link href="/driver" className="mt-4 text-[#C1FF00] hover:underline">← Back to driver</Link>
      </div>
    )
  }

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

        {/* Security step: Biometric + CDL + BOL */}
        <div className="mt-10 w-full space-y-6">
          <h2 className="flex items-center gap-2 text-sm font-semibold text-iron-200">
            <User className="h-4 w-4 text-[#C1FF00]" />
            Security verification
          </h2>
          <p className="text-xs text-iron-500">Complete these steps to verify identity and documents. All uploads go to IronVault (encrypted).</p>

          {!driverId ? (
            <div className="flex items-center gap-2 rounded-lg border border-iron-700 bg-iron-900/50 px-4 py-3 text-sm text-iron-400">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading…
            </div>
          ) : (
            <>
              {/* Biometric selfie */}
              <div className="rounded-xl border border-iron-700 bg-iron-900/50 p-4">
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C1FF00]">
                  <User className="h-3.5 w-3.5" />
                  Biometric selfie
                </h3>
                {showBiometric ? (
                  <div className="mt-3">
                    <BiometricCapture
                      loadId={loadId}
                      driverId={driverId}
                      onSuccess={() => {
                        setShowBiometric(false)
                        router.push('/driver')
                      }}
                      onCancel={() => setShowBiometric(false)}
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowBiometric(true)}
                    className="mt-3 w-full rounded-lg border-2 border-[#C1FF00]/50 py-2.5 text-sm font-medium text-[#C1FF00] hover:bg-[#C1FF00]/10"
                  >
                    Capture biometric selfie
                  </button>
                )}
              </div>

              {/* CDL scan */}
              <div className="rounded-xl border border-iron-700 bg-iron-900/50 p-4">
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C1FF00]">
                  <IdCard className="h-3.5 w-3.5" />
                  CDL (driver license)
                </h3>
                {showCdlScanner ? (
                  <div className="mt-3">
                    <DocumentScanner
                      loadId={loadId}
                      driverId={driverId}
                      type="cdl"
                      onSuccess={() => setShowCdlScanner(false)}
                      onCancel={() => setShowCdlScanner(false)}
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowCdlScanner(true)}
                    className="mt-3 w-full rounded-lg border-2 border-[#C1FF00]/50 py-2.5 text-sm font-medium text-[#C1FF00] hover:bg-[#C1FF00]/10"
                  >
                    Scan CDL
                  </button>
                )}
              </div>

              {/* BOL scan */}
              <div className="rounded-xl border border-iron-700 bg-iron-900/50 p-4">
                <h3 className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wider text-[#C1FF00]">
                  <FileCheck className="h-3.5 w-3.5" />
                  BOL (bill of lading)
                </h3>
                {showBolScanner ? (
                  <div className="mt-3">
                    <DocumentScanner
                      loadId={loadId}
                      driverId={driverId}
                      type="bol"
                      onSuccess={() => setShowBolScanner(false)}
                      onCancel={() => setShowBolScanner(false)}
                    />
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => setShowBolScanner(true)}
                    className="mt-3 w-full rounded-lg border-2 border-[#C1FF00]/50 py-2.5 text-sm font-medium text-[#C1FF00] hover:bg-[#C1FF00]/10"
                  >
                    Scan BOL
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </main>
    </div>
  )
}
