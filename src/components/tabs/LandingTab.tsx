'use client'

import { useRef, useEffect, useState } from 'react'
import Link from 'next/link'
import {
  Shield,
  ShieldCheck,
  MapPin,
  QrCode,
  Lock,
  ScanQrCode,
  UserSearch,
  Navigation,
  FileCheck,
  Building2,
  Truck,
  Warehouse,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react'

type QuoteRole = 'broker' | 'carrier' | 'shipper'

const TRUST_BADGES = [
  { icon: ShieldCheck, label: 'MC/DOT Verified' },
  { icon: MapPin, label: 'GPS Geo-Fencing' },
  { icon: QrCode, label: 'IronGate™ Auth' },
]

const STATS = [
  { value: '0%', label: 'FRAUD RATE' },
  { value: '500m', label: 'DOCK PRECISION' },
  { value: '24/7', label: 'IDENTITY PROTECTION' },
]

const FEATURES = [
  {
    icon: ScanQrCode,
    title: 'IronGate™ Auth',
    description: 'Cryptographic QR handshake verifying Driver, Carrier, and Shipper at the dock.',
  },
  {
    icon: UserSearch,
    title: 'MC Lookup',
    description: 'Real-time vetting of carrier credentials and safety ratings.',
  },
  {
    icon: Navigation,
    title: 'Geo-Verify',
    description: 'Automatic validation that the driver is physically at the dock.',
  },
  {
    icon: FileCheck,
    title: 'Digital Chain',
    description: 'Instant PDF custody reports sent via SendGrid to all parties.',
  },
]

const QUOTE_ROLES: { value: QuoteRole; label: string; description: string; icon: typeof Building2 }[] = [
  { value: 'broker', label: 'Broker', description: 'Secure your pipeline', icon: Building2 },
  { value: 'carrier', label: 'Carrier', description: 'Join the verified fleet', icon: Truck },
  { value: 'shipper', label: 'Shipper', description: 'Gate security for your facility', icon: Warehouse },
]

export function LandingTab() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [quoteRole, setQuoteRole] = useState<QuoteRole>('broker')
  const [quoteName, setQuoteName] = useState('')
  const [quoteEmail, setQuoteEmail] = useState('')
  const [quoteLoading, setQuoteLoading] = useState(false)
  const [quoteSuccess, setQuoteSuccess] = useState(false)
  const [quoteError, setQuoteError] = useState('')

  // Mute and pause video when it scrolls out of view
  useEffect(() => {
    const video = videoRef.current
    if (!video) return
    const observer = new IntersectionObserver(
      (entries) => {
        const [e] = entries
        if (!e) return
        if (e.isIntersecting) {
          video.muted = true
          // Optionally auto-play when in view (muted); leave paused if user had paused
          // video.play().catch(() => {})
        } else {
          video.pause()
          video.muted = true
        }
      },
      { threshold: 0.25, rootMargin: '0px' }
    )
    observer.observe(video)
    return () => observer.disconnect()
  }, [])

  async function handleGetQuote(e: React.FormEvent) {
    e.preventDefault()
    setQuoteError('')
    setQuoteSuccess(false)
    if (!quoteName.trim() || !quoteEmail.trim()) {
      setQuoteError('Please enter your name and email.')
      return
    }
    setQuoteLoading(true)
    try {
      const res = await fetch('/api/send-quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          to: quoteEmail.trim(),
          name: quoteName.trim(),
          role: quoteRole,
        }),
      })
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setQuoteError(data.error || 'Something went wrong.')
        return
      }
      setQuoteSuccess(true)
      setQuoteName('')
      setQuoteEmail('')
    } catch {
      setQuoteError('Network error. Please try again.')
    } finally {
      setQuoteLoading(false)
    }
  }

  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary px-6 py-16 md:py-20">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_60%_at_50%_0%,rgba(193,255,0,0.08),transparent)]" />
        <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />
        <div className="relative z-10 flex flex-col gap-8 md:flex-row md:items-center md:gap-12">
          <div className="flex flex-1 flex-col gap-5">
            <span className="inline-flex w-fit items-center rounded-full border border-primary/50 bg-primary/10 px-4 py-2">
              <span className="font-display text-label-sm font-bold uppercase tracking-widest text-primary">
                Secure Freight Verification
              </span>
            </span>
            <h1 className="font-display text-headline-lg font-bold leading-[1.1] tracking-tight text-white md:text-[2.75rem]">
              Verify the Real Carrier.
              <br />
              Confirm the Driver. Prove the Handoff.
            </h1>
            <p className="max-w-xl text-body-lg text-[#A3A3A3]" style={{ lineHeight: 1.5 }}>
              IronFreight confirms the carrier who booked the load, verifies driver identity at pickup, and proves the actual custody transfer of freight—so you stop double brokering and know exactly who has your cargo.
            </p>
            <div className="flex flex-wrap gap-4">
              <Link
                href="/login"
                className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-semibold text-[#0A0A0B] transition hover:bg-primary/90"
              >
                Get Started
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="#get-quote"
                className="inline-flex items-center justify-center rounded-lg border border-white/30 bg-white/5 px-8 py-4 text-base font-medium text-white backdrop-blur-sm transition hover:bg-white/10"
              >
                Get a quote
              </Link>
              <Link
                href="/login"
                className="inline-flex items-center justify-center rounded-lg border border-white/20 px-8 py-4 text-base font-medium text-white/90 transition hover:border-white/40 hover:text-white"
              >
                Sign in
              </Link>
            </div>
          </div>
          <div className="flex flex-1 justify-center">
            <video
              ref={videoRef}
              src="/ironfreight-explainer.mp4"
              controls
              playsInline
              muted
              className="max-h-[340px] w-full max-w-lg rounded-2xl border border-white/10 bg-black/20 object-contain shadow-2xl ring-1 ring-white/5"
              aria-label="IronFreight system explainer"
            >
              Your browser does not support the video tag.
            </video>
          </div>
        </div>
        <div className="absolute right-0 top-0 opacity-[0.07]" style={{ transform: 'rotate(12deg)' }}>
          <Shield className="h-[240px] w-[240px] text-primary" />
        </div>
      </section>

      {/* Trust badges */}
      <section className="flex flex-wrap items-center justify-center gap-4 border-b border-divider bg-background px-6 py-8">
        {TRUST_BADGES.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-3 rounded-full border border-divider bg-surface px-6 py-3 shadow-sm transition hover:border-primary/30"
          >
            <Icon className="h-5 w-5 text-primary" />
            <span className="font-display text-label-md font-semibold text-[#F9FAFB]">{label}</span>
          </div>
        ))}
      </section>

      {/* Stats row */}
      <section className="bg-surface px-6 py-10 md:px-8">
        <div className="mx-auto flex max-w-4xl flex-wrap justify-center gap-12 md:gap-16">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center gap-1">
              <span className="font-display text-headline-md font-extrabold text-primary">{value}</span>
              <span className="font-display text-label-sm font-bold uppercase tracking-wider text-[#A3A3A3]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="flex flex-col gap-10 bg-background px-6 py-14 md:px-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <p className="font-display text-label-sm font-bold uppercase tracking-widest text-primary">Industrial Grade Security</p>
          <h2 className="font-display text-headline-md font-bold text-[#F9FAFB]">Eliminate Cargo Theft</h2>
        </div>
        <div className="mx-auto grid max-w-5xl gap-6 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-4 rounded-xl border border-divider bg-surface p-6 shadow-sm transition hover:border-primary/20 hover:shadow-md"
            >
              <span className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15">
                <Icon className="h-7 w-7 text-primary" />
              </span>
              <h3 className="font-display text-title-lg font-extrabold text-[#F9FAFB]">{title}</h3>
              <p className="text-body-md text-[#A3A3A3]" style={{ lineHeight: 1.6 }}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What we verify */}
      <section className="mx-4 my-6 rounded-2xl border border-divider bg-secondary p-8 md:mx-6 md:p-10">
        <h2 className="font-display text-title-lg font-bold text-white">What IronFreight Verifies</h2>
        <p className="mt-3 text-body-md text-[#A3A3A3]" style={{ lineHeight: 1.6 }}>
          It&apos;s not just about double brokering. We confirm the full chain: the real carrier booking the load, driver identity at pickup, and the actual custody transfer of the freight.
        </p>
        <ul className="mt-5 space-y-3 text-body-md text-[#F9FAFB]" style={{ lineHeight: 1.6 }}>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <span><strong className="text-primary">Real carrier</strong> — The carrier who booked the load is the one hauling it. No double brokering.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <span><strong className="text-primary">Driver identity at pickup</strong> — Verified at the dock so the right person takes custody.</span>
          </li>
          <li className="flex items-start gap-3">
            <CheckCircle2 className="mt-0.5 h-5 w-5 flex-shrink-0 text-primary" />
            <span><strong className="text-primary">Actual custody transfer</strong> — Cryptographic proof that freight changed hands at the right place and time.</span>
          </li>
        </ul>
        <div className="mt-6 flex items-start gap-3 rounded-lg border border-primary/20 bg-primary/5 p-4">
          <Lock className="h-6 w-6 flex-shrink-0 text-primary" />
          <p className="font-display text-label-md font-semibold text-white">
            Secure freight verification and identity protection for modern logistics.
          </p>
        </div>
      </section>

      {/* Get Quote / Pricing by role */}
      <section id="get-quote" className="scroll-mt-6 border-t border-divider bg-surface px-6 py-14 md:px-8">
        <div className="mx-auto max-w-3xl">
          <div className="text-center">
            <h2 className="font-display text-headline-md font-bold text-white">Get a quote</h2>
            <p className="mt-2 text-body-md text-[#A3A3A3]">
              Tell us who you are and we&apos;ll send a tailored quote to your inbox from billing@getironfreight.com.
            </p>
          </div>
          <div className="mt-8 flex flex-wrap justify-center gap-2">
            {QUOTE_ROLES.map(({ value, label, description, icon: Icon }) => (
              <button
                key={value}
                type="button"
                onClick={() => setQuoteRole(value)}
                className={`flex flex-col items-center gap-1 rounded-xl border px-6 py-4 text-left transition md:min-w-[140px] ${
                  quoteRole === value
                    ? 'border-primary bg-primary/15 text-primary'
                    : 'border-divider bg-background text-[#A3A3A3] hover:border-white/30 hover:text-[#F9FAFB]'
                }`}
              >
                <Icon className="h-6 w-6" />
                <span className="font-display font-semibold">{label}</span>
                <span className="text-xs opacity-90">{description}</span>
              </button>
            ))}
          </div>
          <form onSubmit={handleGetQuote} className="mt-8 flex flex-col gap-4 rounded-xl border border-divider bg-background p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="flex flex-col gap-1">
                <span className="font-display text-label-sm font-semibold text-[#F9FAFB]">Name</span>
                <input
                  type="text"
                  value={quoteName}
                  onChange={(e) => setQuoteName(e.target.value)}
                  placeholder="Your name"
                  className="rounded-lg border border-divider bg-surface px-4 py-3 text-white placeholder:text-[#71717A] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={quoteLoading}
                />
              </label>
              <label className="flex flex-col gap-1">
                <span className="font-display text-label-sm font-semibold text-[#F9FAFB]">Email</span>
                <input
                  type="email"
                  value={quoteEmail}
                  onChange={(e) => setQuoteEmail(e.target.value)}
                  placeholder="you@company.com"
                  className="rounded-lg border border-divider bg-surface px-4 py-3 text-white placeholder:text-[#71717A] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  disabled={quoteLoading}
                />
              </label>
            </div>
            {quoteError && <div className="text-sm text-red-400" role="alert">{quoteError}</div>}
            {quoteSuccess && (
              <div className="flex items-center gap-2 text-sm text-primary" role="status">
                <CheckCircle2 className="h-4 w-4" aria-hidden /> Check your inbox for your role-based quote.
              </div>
            )}
            <button
              type="submit"
              disabled={quoteLoading}
              className="rounded-lg bg-primary px-6 py-3 font-semibold text-[#0A0A0B] transition hover:bg-primary/90 disabled:opacity-60"
            >
              {quoteLoading ? 'Sending…' : 'Send my quote'}
            </button>
          </form>
        </div>
      </section>

      {/* Final CTA */}
      <section className="bg-secondary px-6 py-14 md:px-8">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-headline-md font-bold text-white">Ready to secure your freight?</h2>
          <p className="mt-3 text-body-md text-[#A3A3A3]">
            Join brokers, carriers, and shippers who trust IronFreight for verification at the dock.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-4">
            <Link
              href="/login"
              className="inline-flex items-center gap-2 rounded-lg bg-primary px-8 py-4 text-base font-semibold text-[#0A0A0B] transition hover:bg-primary/90"
            >
              Get Started
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="#get-quote"
              className="inline-flex items-center justify-center rounded-lg border border-white/30 px-8 py-4 text-base font-medium text-white transition hover:bg-white/10"
            >
              Get a quote
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
