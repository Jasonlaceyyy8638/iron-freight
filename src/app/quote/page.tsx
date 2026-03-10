'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Logo } from '@/components/Logo'
import { Search } from 'lucide-react'

type QuoteRole = 'broker' | 'carrier' | 'shipper'

const ROLES: { value: QuoteRole; label: string }[] = [
  { value: 'broker', label: 'Broker' },
  { value: 'carrier', label: 'Carrier' },
  { value: 'shipper', label: 'Shipper' },
]

export default function QuotePage() {
  const [role, setRole] = useState<QuoteRole>('broker')
  const [name, setName] = useState('')
  const [companyName, setCompanyName] = useState('')
  const [mcNumber, setMcNumber] = useState('')
  const [dotNumber, setDotNumber] = useState('')
  const [phone, setPhone] = useState('')
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [lookupLoading, setLookupLoading] = useState(false)
  const [lookupError, setLookupError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const needsMcDot = role === 'broker' || role === 'carrier'

  async function handleLookup() {
    const mc = mcNumber.trim()
    const dot = dotNumber.trim()
    if (!mc && !dot) {
      setLookupError('Enter MC or DOT number first.')
      return
    }
    setLookupError(null)
    setLookupLoading(true)
    try {
      const params = mc ? `mc=${encodeURIComponent(mc)}` : `dot=${encodeURIComponent(dot)}`
      const res = await fetch(`/api/fmcsa-lookup?${params}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setLookupError(data.error ?? 'Lookup failed')
        return
      }
      if (data.legalName) {
        setName(data.legalName)
        setCompanyName(data.legalName)
      }
      if (data.dotNumber) setDotNumber(data.dotNumber)
      if (data.mcNumber && mc) setMcNumber(data.mcNumber)
    } catch {
      setLookupError('Lookup failed')
    } finally {
      setLookupLoading(false)
    }
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    setError(null)
    setSuccess(false)
    if (!name.trim()) {
      setError('Name is required.')
      return
    }
    if (!email.trim()) {
      setError('Email is required.')
      return
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      setError('Please enter a valid email address.')
      return
    }
    if (needsMcDot && !mcNumber.trim()) {
      setError('MC number is required for brokers and carriers.')
      return
    }
    setLoading(true)
    try {
      const res = await fetch('/api/send-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: email.trim(),
          name: name.trim(),
          role,
          companyName: companyName.trim() || undefined,
          phone: phone.trim() || undefined,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setError(data.error ?? 'Something went wrong. Please try again.')
        return
      }
      setSuccess(true)
    } catch {
      setError('Something went wrong. Please try again.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-[#0A0A0B]">
      <header className="border-b border-[#262626] bg-[#141414]">
        <div className="mx-auto flex max-w-5xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="inline-flex">
            <Logo className="h-8 text-white" />
          </Link>
          <Link
            href="/"
            className="text-sm text-[#A3A3A3] hover:text-[#C1FF00]"
          >
            Back to home
          </Link>
        </div>
      </header>

      <main className="mx-auto max-w-xl px-4 py-12 sm:px-6">
        <h1 className="font-display text-2xl font-bold text-white sm:text-3xl">
          Get a quote
        </h1>
        <p className="mt-2 text-[#A3A3A3]">
          We&apos;ll send a tailored quote to your inbox from billing@getironfreight.com within 15–30 minutes.
        </p>

        {success ? (
          <div className="mt-10 rounded-xl border border-[#C1FF00]/30 bg-[#C1FF00]/10 p-8">
            <p className="font-display text-lg font-semibold text-[#C1FF00]">
              Request received
            </p>
            <p className="mt-3 text-[#E5E5E5]">
              Someone will be in contact with you soon. You&apos;ll receive your quote from <strong>billing@getironfreight.com</strong> within 15–30 minutes.
            </p>
            <Link
              href="/"
              className="mt-6 inline-block rounded-lg bg-[#C1FF00] px-6 py-2.5 font-medium text-[#0A0A0B] hover:bg-[#C1FF00]/90"
            >
              Back to home
            </Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-10 space-y-6">
            <div>
              <label className="block text-sm font-medium text-[#A3A3A3]">I am a</label>
              <div className="mt-2 flex flex-wrap gap-2">
                {ROLES.map((r) => (
                  <button
                    key={r.value}
                    type="button"
                    onClick={() => setRole(r.value)}
                    className={`rounded-lg border px-4 py-2 text-sm font-medium transition-colors ${
                      role === r.value
                        ? 'border-[#C1FF00] bg-[#C1FF00]/20 text-[#C1FF00]'
                        : 'border-[#404040] bg-[#262626] text-[#A3A3A3] hover:border-[#525252] hover:text-white'
                    }`}
                  >
                    {r.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <label htmlFor="quote-name" className="block text-sm font-medium text-[#A3A3A3]">
                Full name <span className="text-[#C1FF00]">*</span>
              </label>
              <input
                id="quote-name"
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-[#404040] bg-[#262626] px-4 py-3 text-white placeholder:text-[#71717A] focus:border-[#C1FF00] focus:outline-none focus:ring-1 focus:ring-[#C1FF00]"
                placeholder="Your name"
              />
            </div>

            {needsMcDot && (
              <div className="space-y-4 rounded-xl border border-[#404040] bg-[#1A1A1A] p-4">
                <div>
                  <label htmlFor="quote-mc" className="block text-sm font-medium text-[#A3A3A3]">
                    MC number <span className="text-[#C1FF00]">*</span>
                  </label>
                  <div className="mt-1 flex gap-2">
                    <input
                      id="quote-mc"
                      type="text"
                      value={mcNumber}
                      onChange={(e) => setMcNumber(e.target.value)}
                      required={needsMcDot}
                      className="block flex-1 rounded-lg border border-[#404040] bg-[#262626] px-4 py-3 text-white placeholder:text-[#71717A] focus:border-[#C1FF00] focus:outline-none focus:ring-1 focus:ring-[#C1FF00]"
                      placeholder="e.g. 123456"
                    />
                    <button
                      type="button"
                      onClick={handleLookup}
                      disabled={lookupLoading}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-[#C1FF00]/50 bg-[#C1FF00]/10 px-4 py-3 text-sm font-medium text-[#C1FF00] hover:bg-[#C1FF00]/20 disabled:opacity-50"
                    >
                      {lookupLoading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-[#C1FF00] border-t-transparent" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      Look up
                    </button>
                  </div>
                  {lookupError && <p className="mt-1 text-xs text-red-400">{lookupError}</p>}
                  <p className="mt-1 text-xs text-[#737373]">
                    Look up auto-fills name, company, and DOT below.
                  </p>
                </div>
                <div>
                  <label htmlFor="quote-dot" className="block text-sm font-medium text-[#A3A3A3]">
                    DOT number <span className="text-[#737373]">(optional)</span>
                  </label>
                  <input
                    id="quote-dot"
                    type="text"
                    value={dotNumber}
                    onChange={(e) => setDotNumber(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-[#404040] bg-[#262626] px-4 py-3 text-white placeholder:text-[#71717A] focus:border-[#C1FF00] focus:outline-none focus:ring-1 focus:ring-[#C1FF00]"
                    placeholder="e.g. 1234567"
                  />
                </div>
              </div>
            )}

            <div>
              <label htmlFor="quote-company" className="block text-sm font-medium text-[#A3A3A3]">
                Company name
              </label>
              <input
                id="quote-company"
                type="text"
                value={companyName}
                onChange={(e) => setCompanyName(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-[#404040] bg-[#262626] px-4 py-3 text-white placeholder:text-[#71717A] focus:border-[#C1FF00] focus:outline-none focus:ring-1 focus:ring-[#C1FF00]"
                placeholder={needsMcDot ? 'Fills from Look up' : 'Company or DBA name'}
              />
            </div>

            <div>
              <label htmlFor="quote-phone" className="block text-sm font-medium text-[#A3A3A3]">
                Phone number
              </label>
              <input
                id="quote-phone"
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                className="mt-1 block w-full rounded-lg border border-[#404040] bg-[#262626] px-4 py-3 text-white placeholder:text-[#71717A] focus:border-[#C1FF00] focus:outline-none focus:ring-1 focus:ring-[#C1FF00]"
                placeholder="(555) 123-4567"
              />
            </div>

            <div>
              <label htmlFor="quote-email" className="block text-sm font-medium text-[#A3A3A3]">
                Email <span className="text-[#C1FF00]">*</span>
              </label>
              <input
                id="quote-email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-[#404040] bg-[#262626] px-4 py-3 text-white placeholder:text-[#71717A] focus:border-[#C1FF00] focus:outline-none focus:ring-1 focus:ring-[#C1FF00]"
                placeholder="you@company.com"
              />
            </div>

            {error && (
              <p className="rounded-lg border border-red-500/50 bg-red-500/10 px-4 py-2 text-sm text-red-300" role="alert">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-[#C1FF00] py-3.5 font-display text-base font-bold text-[#0A0A0B] hover:bg-[#C1FF00]/90 disabled:opacity-50"
            >
              {loading ? 'Sending…' : 'Send my quote'}
            </button>
          </form>
        )}
      </main>
    </div>
  )
}
