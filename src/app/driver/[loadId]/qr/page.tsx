'use client'

import { useState, useEffect, useRef } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import QRCode from 'qrcode'
import { Logo } from '@/components/Logo'
import { useAtomValue } from 'jotai'
import { userAtom } from '@/lib/store'
import { getSupabase } from '@/lib/supabase/client'
import { CheckCircle2, Loader2, XCircle, AlertTriangle } from 'lucide-react'

const POLL_INTERVAL_MS = 3000

export default function DriverQRPage() {
  const params = useParams()
  const router = useRouter()
  const user = useAtomValue(userAtom)
  const loadId = (params?.loadId as string) ?? ''
  const [tokenHash, setTokenHash] = useState<string | null>(null)
  const [expiresAt, setExpiresAt] = useState<Date | null>(null)
  const [qrDataUrl, setQrDataUrl] = useState<string>('')
  const [status, setStatus] = useState<'ready' | 'creating' | 'pending' | 'used' | 'expired' | 'error'>('ready')
  const [errorMessage, setErrorMessage] = useState<string | null>(null)
  const [now, setNow] = useState(Date.now())
  const pollRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    if (status !== 'pending') return
    const interval = setInterval(() => setNow(Date.now()), 1000)
    return () => clearInterval(interval)
  }, [status])

  const createToken = () => {
    const supabase = getSupabase()
    if (!supabase) {
      setStatus('error')
      setErrorMessage('Not signed in')
      return
    }
    setStatus('creating')
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (!session?.access_token) {
        setStatus('error')
        setErrorMessage('Not signed in')
        return
      }
      fetch('/api/qr-token', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${session.access_token}` },
        body: JSON.stringify({ loadId }),
      })
        .then((res) => res.json())
        .then((data) => {
          if (data.error || !data.token_hash) {
            setStatus('error')
            setErrorMessage(data.error || 'Failed to create QR')
            return
          }
          setTokenHash(data.token_hash)
          setExpiresAt(data.expires_at ? new Date(data.expires_at) : null)
          setStatus('pending')
          const payload = `ironfreight://verify?token=${data.token_hash}`
          QRCode.toDataURL(payload, { width: 260, margin: 2 }).then(setQrDataUrl)
        })
        .catch(() => {
          setStatus('error')
          setErrorMessage('Failed to create QR')
        })
    })
  }

  useEffect(() => {
    if (status !== 'pending' || !tokenHash) return
    const client = getSupabase()
    if (!client) return

    function poll() {
      if (!client) return
      client.auth.getSession().then(({ data: { session } }) => {
        if (!session?.access_token || !tokenHash) return
        fetch(`/api/qr-token-status?token=${encodeURIComponent(tokenHash)}`, {
          headers: { Authorization: `Bearer ${session.access_token}` },
        })
          .then((res) => res.json())
          .then((data) => {
            if (data.status === 'used') setStatus('used')
            else if (data.status === 'expired') setStatus('expired')
          })
          .catch(() => {})
      })
    }

    poll()
    pollRef.current = setInterval(poll, POLL_INTERVAL_MS)
    return () => {
      if (pollRef.current) clearInterval(pollRef.current)
      pollRef.current = null
    }
  }, [status, tokenHash])

  useEffect(() => {
    if (status !== 'pending' || !expiresAt) return
    const t = expiresAt.getTime() - Date.now()
    if (t <= 0) {
      setStatus('expired')
      return
    }
    const timeout = setTimeout(() => setStatus('expired'), t)
    return () => clearTimeout(timeout)
  }, [status, expiresAt])

  if (!loadId) {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-iron-950 px-4">
        <p className="text-iron-400">Invalid load.</p>
        <Link href="/driver" className="mt-4 text-[#C1FF00] hover:underline">← Back to driver</Link>
      </div>
    )
  }

  if (status === 'ready') {
    return (
      <div className="flex min-h-screen flex-col bg-iron-950">
        <header className="border-b border-iron-800 bg-iron-900/80">
          <div className="mx-auto flex max-w-lg items-center justify-center px-4 py-3">
            <Logo variant="icon" className="h-8 w-8 text-iron-100" />
          </div>
        </header>
        <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-8">
          <div
            className="w-full rounded-xl border-2 border-amber-400/80 bg-amber-500/15 px-5 py-5 shadow-[0_0_24px_rgba(251,191,36,0.2)]"
            role="alert"
          >
            <div className="flex gap-4">
              <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-amber-500/30">
                <AlertTriangle className="h-7 w-7 text-amber-400" aria-hidden />
              </div>
              <div>
                <h2 className="font-display text-lg font-bold text-amber-200">
                  Wait for the shipper before showing the QR
                </h2>
                <p className="mt-2 text-sm leading-relaxed text-amber-200/90">
                  Do not create the QR code until the shipper is at the gate and ready to scan. The code is only valid for <strong className="text-amber-100">15 minutes</strong>. Once you tap below, the countdown starts.
                </p>
              </div>
            </div>
          </div>
          <p className="mt-6 text-center text-sm text-iron-500">
            When the shipper is ready with their scanner, tap the button below.
          </p>
          <button
            type="button"
            onClick={createToken}
            className="mt-6 w-full max-w-sm rounded-xl bg-primary py-4 font-display text-lg font-bold text-black shadow-lg hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 focus:ring-offset-iron-950"
          >
            Shipper is ready — Show QR code
          </button>
          <Link href="/driver" className="mt-6 text-sm text-iron-500 hover:text-iron-300">
            ← Back to driver
          </Link>
        </main>
      </div>
    )
  }

  if (status === 'error') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-iron-950 px-4">
        <XCircle className="h-12 w-12 text-red-400" />
        <p className="mt-4 text-iron-200">{errorMessage ?? 'Something went wrong'}</p>
        <Link href="/driver" className="mt-6 text-[#C1FF00] hover:underline">← Back to driver</Link>
      </div>
    )
  }

  if (status === 'used') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-iron-950 px-4">
        <CheckCircle2 className="h-16 w-16 text-[#22C55E]" />
        <h1 className="mt-4 text-xl font-bold text-iron-100">Verified at dock</h1>
        <p className="mt-2 text-center text-sm text-iron-400">Shipper has scanned your QR. You can continue.</p>
        <button
          type="button"
          onClick={() => router.push('/driver')}
          className="mt-8 rounded-lg bg-primary px-6 py-3 font-medium text-black hover:bg-primary/90"
        >
          Back to driver
        </button>
      </div>
    )
  }

  if (status === 'expired') {
    return (
      <div className="flex min-h-screen flex-col items-center justify-center bg-iron-950 px-4">
        <XCircle className="h-12 w-12 text-amber-400" />
        <h1 className="mt-4 text-xl font-bold text-iron-100">QR expired</h1>
        <p className="mt-2 text-center text-sm text-iron-400">This code was valid for 15 minutes. Return to driver to get a new one if needed.</p>
        <Link href="/driver" className="mt-8 inline-block rounded-lg bg-primary px-6 py-3 font-medium text-black hover:bg-primary/90">
          Back to driver
        </Link>
      </div>
    )
  }

  const expiresIn = expiresAt ? Math.max(0, Math.ceil((expiresAt.getTime() - now) / 1000)) : 0
  const minutes = Math.floor(expiresIn / 60)
  const seconds = expiresIn % 60

  return (
    <div className="flex min-h-screen flex-col bg-iron-950">
      <header className="border-b border-iron-800 bg-iron-900/80">
        <div className="mx-auto flex max-w-lg items-center justify-center px-4 py-3">
          <Logo variant="icon" className="h-8 w-8 text-iron-100" />
        </div>
      </header>

      <main className="mx-auto flex w-full max-w-lg flex-1 flex-col items-center justify-center px-4 py-8">
        {status === 'creating' ? (
          <div className="flex flex-col items-center gap-4">
            <Loader2 className="h-10 w-10 animate-spin text-primary" />
            <p className="text-iron-400">Creating QR code…</p>
          </div>
        ) : (
          <>
            <h1 className="text-lg font-bold text-iron-100">IronGate QR</h1>
            <p className="mt-1 text-center text-sm text-iron-400">Shipper scans this code at the dock. Valid 15 min.</p>
            <div className="mt-8 rounded-2xl border-2 border-iron-600 bg-white p-4">
              {qrDataUrl ? (
                <img src={qrDataUrl} alt="Verification QR" className="h-64 w-64" />
              ) : (
                <div className="h-64 w-64 animate-pulse rounded bg-iron-700" />
              )}
            </div>
            <p className="mt-4 text-xs text-iron-500">
              Expires in {minutes}:{seconds.toString().padStart(2, '0')}
            </p>
            <p className="mt-6 text-center text-sm text-iron-500">Waiting for shipper to scan…</p>
            <p className="mt-2 text-center text-xs text-iron-600">Keep this screen open. You can leave after it’s scanned.</p>
          </>
        )}
      </main>
    </div>
  )
}
