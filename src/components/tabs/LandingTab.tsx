'use client'

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
} from 'lucide-react'

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

export function LandingTab() {
  return (
    <div className="flex flex-col">
      {/* Hero */}
      <section className="relative overflow-hidden bg-secondary px-6 py-12 md:py-14">
        <div className="relative z-10 flex flex-col gap-6">
          <span className="inline-flex w-fit items-center rounded-md border border-primary bg-primary/20 px-4 py-2">
            <span className="font-display text-label-sm font-bold uppercase tracking-wide text-primary">
              SECURE FREIGHT VERIFICATION
            </span>
          </span>
          <div className="flex flex-col gap-4">
            <h1 className="font-display text-headline-lg font-bold leading-tight text-white">
              Verify the Real Carrier.
              <br />
              Confirm the Driver. Prove the Handoff.
            </h1>
            <p className="max-w-xl text-body-lg text-[#A3A3A3]" style={{ lineHeight: 1.4 }}>
              IronFreight confirms the carrier who booked the load, verifies driver identity at pickup, and proves the actual custody transfer of freight—so you stop double brokering and know exactly who has your cargo.
            </p>
          </div>
          <div className="flex flex-wrap gap-4">
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded bg-primary px-8 py-4 text-base font-medium text-white hover:opacity-95"
            >
              Get Started
            </Link>
            <Link
              href="/login"
              className="inline-flex items-center justify-center rounded border border-white bg-transparent px-8 py-4 text-base font-medium text-white hover:bg-white/10"
            >
              Sign in
            </Link>
          </div>
        </div>
        <div className="absolute right-0 top-0 opacity-10" style={{ transform: 'rotate(15deg)' }}>
          <Shield className="h-[200px] w-[200px] text-primary" />
        </div>
      </section>

      {/* Trust badges */}
      <section className="flex flex-wrap items-center justify-center gap-4 bg-background px-6 py-6">
        {TRUST_BADGES.map(({ icon: Icon, label }) => (
          <div
            key={label}
            className="flex items-center gap-2 rounded-full border border-divider bg-surface px-6 py-3 shadow-sm"
          >
            <Icon className="h-[18px] w-[18px] text-primary" />
            <span className="font-display text-label-md font-semibold text-[#F9FAFB]">{label}</span>
          </div>
        ))}
      </section>

      {/* Stats row */}
      <section className="border-b border-divider bg-surface px-6 py-8 md:px-8">
        <div className="flex flex-wrap justify-center gap-8 md:gap-12">
          {STATS.map(({ value, label }) => (
            <div key={label} className="flex flex-1 min-w-[100px] flex-col items-start gap-1">
              <span className="font-display text-headline-md font-extrabold text-primary">{value}</span>
              <span className="font-display text-label-sm font-bold uppercase text-[#A3A3A3]">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Industrial Grade Security / Eliminate Cargo Theft + feature cards */}
      <section className="flex flex-col gap-8 bg-background px-6 py-10 md:px-8">
        <div className="flex flex-col items-center gap-2">
          <p className="font-display text-title-md font-semibold text-primary">Industrial Grade Security</p>
          <h2 className="font-display text-headline-md font-bold text-center text-[#F9FAFB]">Eliminate Cargo Theft</h2>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {FEATURES.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="flex flex-col gap-4 rounded-lg border border-divider bg-surface p-6 shadow-sm"
            >
              <span className="flex h-12 w-12 items-center justify-center rounded-md bg-primary/15">
                <Icon className="h-7 w-7 text-primary" />
              </span>
              <h3 className="font-display text-title-lg font-extrabold text-[#F9FAFB]">{title}</h3>
              <p className="text-body-md text-[#A3A3A3] line-clamp-3" style={{ lineHeight: 1.5 }}>
                {description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* What we verify: real carrier, driver identity, custody transfer, no double brokering */}
      <section className="mx-4 my-8 rounded-lg bg-secondary p-6 md:mx-6 md:p-8">
        <h2 className="font-display text-title-lg font-bold text-white">What IronFreight Verifies</h2>
        <p className="mt-3 text-body-md text-[#A3A3A3]" style={{ lineHeight: 1.6 }}>
          It&apos;s not just about double brokering. We confirm the full chain: the real carrier booking the load, driver identity at pickup, and the actual custody transfer of the freight.
        </p>
        <ul className="mt-4 space-y-2 text-body-md text-[#F9FAFB]" style={{ lineHeight: 1.6 }}>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
            <span><strong className="text-primary">Real carrier</strong> — The carrier who booked the load is the one hauling it. No double brokering.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
            <span><strong className="text-primary">Driver identity at pickup</strong> — Verified at the dock so the right person takes custody.</span>
          </li>
          <li className="flex items-start gap-2">
            <span className="mt-1.5 h-1.5 w-1.5 flex-shrink-0 rounded-full bg-primary" />
            <span><strong className="text-primary">Actual custody transfer</strong> — Cryptographic proof that freight changed hands at the right place and time.</span>
          </li>
        </ul>
        <div className="my-4 h-px bg-divider opacity-20" />
        <div className="flex items-start gap-3">
          <Lock className="h-6 w-6 flex-shrink-0 text-primary" />
          <p className="font-display text-label-md font-semibold text-white">
            Secure freight verification and identity protection for modern logistics.
          </p>
        </div>
      </section>
    </div>
  )
}
