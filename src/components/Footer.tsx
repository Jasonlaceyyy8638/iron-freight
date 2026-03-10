import Link from 'next/link'
import { Logo } from '@/components/Logo'

const legalLinks = [
  { label: 'Terms of Service', href: '/terms' },
  { label: 'Privacy Policy', href: '/privacy' },
  { label: 'Cookie Policy', href: '/cookie-policy' },
  { label: 'Trust & Compliance', href: '/trust-center' },
]

const supportLinks = [
  { label: 'General Inquiry', href: 'mailto:Info@getironfreight.com' },
  { label: 'Billing & Finance', href: 'mailto:Billing@getironfreight.com' },
  { label: 'Identity Verification', href: 'mailto:Verify@getironfreight.com' },
  { label: 'Dispute Resolution', href: 'mailto:Disputes@getironfreight.com' },
  { label: 'Carrier Onboarding', href: 'mailto:Vetting@getironfreight.com' },
  { label: 'Technical Support', href: 'mailto:Support@getironfreight.com' },
]

export function Footer() {
  return (
    <footer className="border-t border-white/10 bg-[#0A0A0B] text-white/80">
      <div className="mx-auto max-w-6xl px-6 py-14 sm:px-8 lg:px-10">
        <div className="grid grid-cols-1 gap-14 md:grid-cols-3 md:gap-16">
          {/* Column 1: Branding */}
          <div className="space-y-5">
            <Logo className="text-white" variant="full" accent="lime" />
            <p className="max-w-[280px] text-[13px] leading-relaxed text-white/70">
              The ironclad shield against double brokering, fraud, and load theft—with verified chain of custody, identity verification, and geofenced pickup and delivery.
            </p>
            <Link href="/investors" className="text-[13px] font-medium text-[#C1FF00] hover:underline">
              For Investors →
            </Link>
            <p className="text-[12px] text-white/50">
              © 2026 IronFreight. All Rights Reserved.
            </p>
          </div>

          {/* Column 2: Legal & Policy */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-white/50 mb-5">
              Legal & Policy
            </h3>
            <ul className="space-y-3">
              {legalLinks.map(({ label, href }) => (
                <li key={label}>
                  <Link
                    href={href}
                    className="text-[12px] sm:text-[13px] text-white/70 transition-colors hover:text-[#C1FF00]"
                  >
                    {label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* Column 3: Support Center */}
          <div>
            <h3 className="text-[11px] font-semibold uppercase tracking-widest text-white/50 mb-5">
              Support Center
            </h3>
            <ul className="space-y-3">
              {supportLinks.map(({ label, href }) => (
                <li key={label}>
                  <a
                    href={href}
                    className="text-[12px] sm:text-[13px] text-white/70 transition-colors hover:text-[#C1FF00]"
                  >
                    {label}
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </div>
    </footer>
  )
}
