'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

const ROLES = ['broker', 'carrier', 'shipper'] as const
const INTERVALS = ['monthly', 'yearly'] as const

export default function SubscribeRedirectPage() {
  const params = useParams()
  const router = useRouter()
  const role = (params?.role as string)?.toLowerCase()
  const interval = (params?.interval as string)?.toLowerCase()
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!role || !interval) return
    if (!ROLES.includes(role as (typeof ROLES)[number]) || !INTERVALS.includes(interval as (typeof INTERVALS)[number])) {
      setError('Invalid subscription link. Use /subscribe/broker/monthly, /subscribe/carrier/yearly, etc.')
      return
    }

    let cancelled = false
    fetch('/api/stripe/create-checkout-session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ role, interval }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (cancelled) return
        if (data.url) {
          window.location.href = data.url
          return
        }
        setError(data.error || 'Could not start checkout')
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message || 'Something went wrong')
      })
    return () => {
      cancelled = true
    }
  }, [role, interval])

  if (error) {
    return (
      <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-6">
        <Link href="/" className="mb-8">
          <Logo className="h-10" />
        </Link>
        <p className="text-[#F9FAFB] text-center max-w-md mb-6">{error}</p>
        <Link
          href="/"
          className="text-[#C1FF00] hover:underline font-medium"
        >
          Return home
        </Link>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B] flex flex-col items-center justify-center p-6">
      <Link href="/" className="mb-8">
        <Logo className="h-10" />
      </Link>
      <p className="text-[#A3A3A3]">Redirecting to checkout…</p>
    </div>
  )
}
