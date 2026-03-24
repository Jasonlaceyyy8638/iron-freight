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
  CheckCircle2,
  ArrowRight,
  ChevronDown,
  Download,
} from 'lucide-react'

function ChainIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" className={className} aria-hidden>
      <path d="M10 13a5 5 0 0 0 7.54.54l3-3a5 5 0 0 0-7.07-7.07l-1.72 1.71" />
      <path d="M14 11a5 5 0 0 0-7.54-.54l-3 3a5 5 0 0 0 7.07 7.07l1.71-1.71" />
    </svg>
  )
}

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

const FAQ_ITEMS: { question: string; answer: string }[] = [
  {
    question: 'What is IronFreight?',
    answer:
      'IronFreight is a freight verification platform that stops double brokering and cargo theft. We verify the real carrier, confirm driver identity at the dock, and prove the actual custody transfer of freight—so brokers and shippers know exactly who has their cargo.',
  },
  {
    question: 'How does verification work at the dock?',
    answer:
      'Using IronGate™, we scan a cryptographic QR at pickup. The driver, carrier, and shipper are all verified in one handshake. Geo-Verify confirms the driver is physically at the right location. You get an instant digital chain-of-custody record and optional PDF reports sent to all parties.',
  },
  {
    question: 'Who is IronFreight for?',
    answer:
      'Brokers use IronFreight to vet carriers and verify every load with identity and custody proof. Carriers join the verified fleet and get a free driver app for pickup verification. Shippers use the IronGate Scanner at the gate to verify driver identity and release freight securely.',
  },
  {
    question: 'Is there a free trial?',
    answer:
      'Yes. You get a 7-day free trial when you sign up—no card required. Choose a monthly or yearly plan at login based on your role (broker, carrier, or shipper), or start your trial with no card and add one later when you subscribe.',
  },
  {
    question: 'How do I get started?',
    answer:
      'Click Get Started to create your account. Brokers and carriers enter their MC number and we look up your company from FMCSA and show pricing. After checkout, you can post loads, add carriers, and run verification at the dock. Need a custom quote? Use Get a quote from the button below.',
  },
]

export function LandingTab() {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [openFaqIndex, setOpenFaqIndex] = useState<number | null>(0)

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

  return (
    <div className="flex flex-col">
      {/* 7-day free trial banner — chain that can't be broken */}
      <section className="relative overflow-hidden border-b border-primary/30 bg-[#0A0A0B] px-4 py-4">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_70%_80%_at_50%_50%,rgba(193,255,0,0.06),transparent)]" />
        <div className="relative z-10 mx-auto flex max-w-5xl flex-wrap items-center justify-center gap-4 sm:gap-6">
          <div className="flex items-center gap-2 text-primary">
            <ChainIcon className="h-8 w-8 shrink-0" />
            <ChainIcon className="h-6 w-6 shrink-0 -ml-2" />
            <ChainIcon className="h-8 w-8 shrink-0 -ml-2" />
          </div>
          <div className="flex flex-col items-center gap-0.5 text-center sm:flex-row sm:gap-3 sm:text-left">
            <span className="font-display text-lg font-bold uppercase tracking-widest text-primary sm:text-xl">
              7-Day Free Trial
            </span>
            <span className="hidden text-[#737373] sm:inline">—</span>
            <span className="text-body-sm font-medium text-[#A3A3A3]">
              <strong className="text-base font-bold text-[#CA8A04] sm:text-lg animate-no-card-pulse">No card required</strong> at sign up. The chain that can&apos;t be broken—start verifying freight.
            </span>
          </div>
          <Link
            href="/login"
            className="shrink-0 rounded-lg border-2 border-primary bg-primary px-6 py-2.5 font-display text-sm font-bold uppercase tracking-wide text-[#0A0A0B] transition hover:bg-primary/90 hover:border-primary"
          >
            Get Started
          </Link>
        </div>
      </section>

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
                href="/quote"
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
          <div className="flex flex-1 flex-col items-center justify-center">
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
            <a
              href="/ironfreight-explainer.mp4"
              download="IronFreight-explainer.mp4"
              aria-label="Download home page video"
              title="Download"
              className="mt-3 inline-flex items-center text-primary hover:text-primary/80"
            >
              <Download className="h-4 w-4 shrink-0" aria-hidden />
            </a>
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

      {/* FAQ */}
      <section className="border-t border-primary/20 bg-[#141414] px-6 py-14 md:px-8">
        <div className="mx-auto max-w-2xl">
          <h2 className="font-display text-headline-md font-bold text-primary text-center">Frequently asked questions</h2>
          <p className="mt-2 text-body-md text-[#A3A3A3] text-center">
            Quick answers about IronFreight and how verification works.
          </p>
          <ul className="mt-8 space-y-2">
            {FAQ_ITEMS.map((item, index) => (
              <li
                key={index}
                className={`rounded-lg border border-divider bg-background overflow-hidden transition-colors ${
                  openFaqIndex === index ? 'border-l-4 border-l-primary' : 'border-l-4 border-l-transparent'
                } hover:bg-primary/5`}
              >
                <button
                  type="button"
                  onClick={() => setOpenFaqIndex(openFaqIndex === index ? null : index)}
                  className="flex w-full items-center justify-between gap-4 px-4 py-4 text-left font-medium text-white transition-colors"
                  aria-expanded={openFaqIndex === index}
                >
                  <span>{item.question}</span>
                  <ChevronDown
                    className={`h-5 w-5 shrink-0 text-primary transition-transform ${openFaqIndex === index ? 'rotate-180' : ''}`}
                  />
                </button>
                {openFaqIndex === index && (
                  <div className="border-t border-divider bg-primary/5 px-4 py-3 text-body-md text-[#A3A3A3]" style={{ lineHeight: 1.6 }}>
                    {item.answer}
                  </div>
                )}
              </li>
            ))}
          </ul>
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
              href="/quote"
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
