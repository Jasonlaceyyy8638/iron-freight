'use client'

import { useState, useRef, useCallback } from 'react'
import { useAtomValue } from 'jotai'
import { userAtom } from '@/lib/store'
import { getSupabase } from '@/lib/supabase/client'
import { CameraAccess } from '@/components/CameraAccess'
import { useQRScanner, type IronFreightQRPayload } from '@/hooks/useQRScanner'
import {
  Building2,
  BadgeCheck,
  ScanQrCode,
  CheckCircle2,
  XCircle,
  Loader2,
  ArrowLeft,
} from 'lucide-react'

type LoadInfo = {
  id: string
  load_number: string
  status: string
  driver_name: string | null
  carrier_name: string | null
  origin: string | null
  destination: string | null
}

type VerifyResult =
  | { success: true; load_number: string; driver_name: string | null; carrier_name: string | null }
  | { success: false; error: string }

export default function GatePage() {
  const user = useAtomValue(userAtom)
  const [loadNumberInput, setLoadNumberInput] = useState('')
  const [loadInfo, setLoadInfo] = useState<LoadInfo | null>(null)
  const [loadError, setLoadError] = useState<string | null>(null)
  const [loadingLoad, setLoadingLoad] = useState(false)
  const [scanning, setScanning] = useState(false)
  const [verifyResult, setVerifyResult] = useState<VerifyResult | null>(null)
  const [verifying, setVerifying] = useState(false)

  const fetchLoad = useCallback(async () => {
    const num = loadNumberInput.trim()
    if (!num) {
      setLoadError('Enter a load number')
      return
    }
    setLoadError(null)
    setLoadingLoad(true)
    try {
      const supabase = getSupabase()
      if (!supabase) {
        setLoadError('Not signed in')
        return
      }
      const { data: { session } } = await supabase.auth.getSession()
      const token = session?.access_token
      if (!token) {
        setLoadError('Not signed in')
        return
      }
      const res = await fetch(`/api/loads/by-number?load_number=${encodeURIComponent(num)}`, {
        headers: { Authorization: `Bearer ${token}` },
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setLoadInfo(null)
        setLoadError(data.error || 'Load not found')
        return
      }
      setLoadInfo({
        id: data.id,
        load_number: data.load_number,
        status: data.status,
        driver_name: data.driver_name ?? null,
        carrier_name: data.carrier_name ?? null,
        origin: data.origin ?? null,
        destination: data.destination ?? null,
      })
    } finally {
      setLoadingLoad(false)
    }
  }, [loadNumberInput])

  const handleScan = useCallback(
    async (payload: IronFreightQRPayload) => {
      if (!loadInfo || verifying) return
      setVerifying(true)
      setVerifyResult(null)
      try {
        const supabase = getSupabase()
        if (!supabase) {
          setVerifyResult({ success: false, error: 'Not signed in' })
          return
        }
        const { data: { session } } = await supabase.auth.getSession()
        const token = session?.access_token
        if (!token) {
          setVerifyResult({ success: false, error: 'Not signed in' })
          return
        }
        const res = await fetch('/api/verify-qr', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
          body: JSON.stringify({
            loadNumber: loadInfo.load_number,
            token: payload.token,
          }),
        })
        const data = await res.json().catch(() => ({}))
        if (!res.ok) {
          setVerifyResult({ success: false, error: data.error || 'Verification failed' })
          return
        }
        setVerifyResult({
          success: true,
          load_number: data.load_number ?? loadInfo.load_number,
          driver_name: data.driver_name ?? loadInfo.driver_name ?? null,
          carrier_name: data.carrier_name ?? loadInfo.carrier_name ?? null,
        })
        setScanning(false)
      } finally {
        setVerifying(false)
      }
    },
    [loadInfo, verifying]
  )

  const resetToLoadInput = () => {
    setLoadInfo(null)
    setLoadNumberInput('')
    setLoadError(null)
    setVerifyResult(null)
    setScanning(false)
  }

  const resetToScan = () => {
    setVerifyResult(null)
    setScanning(true)
  }

  if (!user || (user.role !== 'broker' && user.role !== 'shipper')) {
    return (
      <div className="p-4 sm:p-6">
        <p className="text-iron-400">Gate verification is only available for brokers and shippers.</p>
      </div>
    )
  }

  if (verifyResult?.success) {
    return (
      <div className="p-4 sm:p-6">
        <div className="mx-auto max-w-md rounded-xl border-2 border-[#22C55E] bg-[#22C55E]/10 p-6 text-center">
          <div className="flex justify-center">
            <CheckCircle2 className="h-16 w-16 text-[#22C55E]" />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-[#F9FAFB]">Driver & carrier verified</h2>
          <p className="mt-2 text-body-sm text-[#A3A3A3]">
            Load <strong className="text-[#F9FAFB]">{verifyResult.load_number}</strong>
          </p>
          <div className="mt-6 space-y-3 rounded-lg border border-iron-700 bg-iron-900/50 p-4 text-left">
            {verifyResult.carrier_name && (
              <div className="flex items-center gap-3">
                <Building2 className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-iron-500">Carrier</p>
                  <p className="font-medium text-[#F9FAFB]">{verifyResult.carrier_name}</p>
                </div>
              </div>
            )}
            {verifyResult.driver_name && (
              <div className="flex items-center gap-3">
                <BadgeCheck className="h-5 w-5 text-primary" />
                <div>
                  <p className="text-xs text-iron-500">Driver</p>
                  <p className="font-medium text-[#F9FAFB]">{verifyResult.driver_name}</p>
                </div>
              </div>
            )}
          </div>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={resetToScan}
              className="w-full rounded-lg border-2 border-primary bg-primary/10 py-3 font-medium text-primary hover:bg-primary/20"
            >
              Scan another (same load)
            </button>
            <button
              type="button"
              onClick={resetToLoadInput}
              className="w-full rounded-lg border border-iron-600 py-3 font-medium text-iron-300 hover:bg-iron-800"
            >
              Verify a different load
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (verifyResult && !verifyResult.success) {
    return (
      <div className="p-4 sm:p-6">
        <div className="mx-auto max-w-md rounded-xl border-2 border-red-500/50 bg-red-500/10 p-6 text-center">
          <div className="flex justify-center">
            <XCircle className="h-16 w-16 text-red-400" />
          </div>
          <h2 className="mt-4 font-display text-xl font-bold text-[#F9FAFB]">Verification failed</h2>
          <p className="mt-2 text-body-sm text-red-300">{verifyResult.error}</p>
          <div className="mt-6 flex flex-col gap-3">
            <button
              type="button"
              onClick={() => setVerifyResult(null)}
              className="w-full rounded-lg border-2 border-primary bg-primary/10 py-3 font-medium text-primary hover:bg-primary/20"
            >
              Try scanning again
            </button>
            <button
              type="button"
              onClick={resetToLoadInput}
              className="w-full rounded-lg border border-iron-600 py-3 font-medium text-iron-300 hover:bg-iron-800"
            >
              Choose a different load
            </button>
          </div>
        </div>
      </div>
    )
  }

  if (!loadInfo) {
    return (
      <div className="p-4 sm:p-6">
        <h1 className="mb-2 text-xl font-bold text-iron-100">IronGate – Verify at dock</h1>
        <p className="mb-6 text-sm text-iron-400">
          Enter the load number for the shipment you’re verifying, then scan the driver’s QR code.
        </p>
        <div className="mx-auto max-w-md space-y-4">
          <div>
            <label htmlFor="gate-load-number" className="block text-sm font-medium text-iron-300">
              Load number
            </label>
            <input
              id="gate-load-number"
              type="text"
              value={loadNumberInput}
              onChange={(e) => setLoadNumberInput(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && fetchLoad()}
              placeholder="e.g. IF-99281"
              className="mt-1 block w-full rounded-lg border border-iron-700 bg-iron-900 px-3 py-2.5 text-[#F9FAFB] placeholder-iron-500 focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
            />
          </div>
          {loadError && <p className="text-sm text-red-400">{loadError}</p>}
          <button
            type="button"
            onClick={fetchLoad}
            disabled={loadingLoad}
            className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-medium text-black hover:bg-primary/90 disabled:opacity-50"
          >
            {loadingLoad ? (
              <>
                <Loader2 className="h-5 w-5 animate-spin" />
                Looking up…
              </>
            ) : (
              'Continue'
            )}
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="p-4 sm:p-6">
      <div className="mx-auto max-w-lg">
        <button
          type="button"
          onClick={resetToLoadInput}
          className="mb-4 flex items-center gap-2 text-sm text-iron-400 hover:text-iron-200"
        >
          <ArrowLeft className="h-4 w-4" />
          Different load
        </button>
        <h1 className="mb-2 text-xl font-bold text-iron-100">Scan driver QR – Load {loadInfo.load_number}</h1>

        <div className="mb-6 rounded-lg border border-iron-700 bg-iron-900/50 p-4">
          <h2 className="text-sm font-semibold text-iron-400">Expected at dock</h2>
          <ul className="mt-3 space-y-2">
            {loadInfo.carrier_name && (
              <li className="flex items-center gap-3">
                <Building2 className="h-4 w-4 text-iron-500" />
                <span className="text-[#F9FAFB]">{loadInfo.carrier_name}</span>
              </li>
            )}
            {loadInfo.driver_name && (
              <li className="flex items-center gap-3">
                <BadgeCheck className="h-4 w-4 text-iron-500" />
                <span className="text-[#F9FAFB]">{loadInfo.driver_name}</span>
              </li>
            )}
            {!loadInfo.driver_name && !loadInfo.carrier_name && (
              <li className="text-sm text-iron-500">No driver assigned yet</li>
            )}
          </ul>
        </div>

        <CameraAccess facingMode="environment" requestOnMount={false}>
          {({ stream, requestAccess, stopStream }) => (
            <GateScanner
              stream={stream}
              scanning={scanning}
              verifying={verifying}
              loadInfo={loadInfo}
              onStartScan={() => {
                setVerifyResult(null)
                requestAccess()
                setScanning(true)
              }}
              onStopScan={() => {
                stopStream()
                setScanning(false)
              }}
              onScan={handleScan}
            />
          )}
        </CameraAccess>
      </div>
    </div>
  )
}

function GateScanner({
  stream,
  scanning,
  verifying,
  loadInfo: _loadInfo,
  onStartScan,
  onStopScan,
  onScan,
}: {
  stream: MediaStream | null
  scanning: boolean
  verifying: boolean
  loadInfo: LoadInfo
  onStartScan: () => void
  onStopScan: () => void
  onScan: (payload: IronFreightQRPayload) => void
}) {
  const { setVideoRef, setCanvasRef } = useQRScanner(stream, scanning && !verifying, onScan)

  return (
    <div className="space-y-4">
      <div className="relative flex h-[280px] items-center justify-center overflow-hidden rounded-xl border-2 border-iron-700 bg-black">
        {stream && scanning ? (
          <>
            <video
              ref={setVideoRef}
              autoPlay
              playsInline
              muted
              className="h-full w-full object-cover"
              style={{ transform: 'scaleX(-1)' }}
            />
            <canvas ref={setCanvasRef} className="hidden" aria-hidden />
            <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
              <div className="flex h-[200px] w-[200px] flex-col items-center justify-center rounded-xl border-2 border-primary bg-transparent">
                <span className="text-label-lg font-bold text-primary">Scan frame</span>
              </div>
            </div>
            {verifying && (
              <div className="absolute inset-0 flex items-center justify-center bg-black/70">
                <div className="flex flex-col items-center gap-2 text-primary">
                  <Loader2 className="h-10 w-10 animate-spin" />
                  <span className="text-sm font-medium">Verifying…</span>
                </div>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center gap-4 text-center">
            <ScanQrCode className="h-14 w-14 text-iron-600" />
            <p className="text-sm text-iron-400">
              {scanning ? 'Starting camera…' : 'Position the driver’s IronGate QR code inside the frame.'}
            </p>
          </div>
        )}
      </div>
      <button
        type="button"
        onClick={stream && scanning ? onStopScan : onStartScan}
        disabled={verifying}
        className="flex w-full items-center justify-center gap-2 rounded-lg bg-primary py-3 font-medium text-black hover:bg-primary/90 disabled:opacity-50"
      >
        {stream && scanning ? (
          'Stop camera'
        ) : (
          <>
            <ScanQrCode className="h-5 w-5" />
            Scan QR code
          </>
        )}
      </button>
    </div>
  )
}
