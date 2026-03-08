import Link from 'next/link'
import { Logo } from '@/components/Logo'

export const metadata = {
  title: 'Terms of Service – IronFreight',
  description: 'IronFreight Terms of Service: anti-double brokering, GPS tracking consent, and biometric verification requirements.',
}

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#0A0A0B] text-[#E5E5E5]">
      <header className="border-b border-white/10 bg-[#0A0A0B]/95 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <Link href="/" className="inline-flex">
            <Logo className="text-white" accent="lime" />
          </Link>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-[#C1FF00] tracking-tight mb-2">
          Terms of Service
        </h1>
        <p className="text-sm text-white/50 mb-10">Last updated: March 7, 2026</p>

        <article className="space-y-10 text-sm leading-relaxed">
          <section>
            <h2 className="text-[#C1FF00] font-semibold uppercase tracking-wider text-xs mb-3">1. Acceptance of Terms</h2>
            <p className="text-white/90">
              By accessing or using the IronFreight platform (“Platform”), you agree to be bound by these Terms of Service (“Terms”). If you do not agree, you may not use the Platform. These Terms apply to Brokers, Shippers, Carriers, and Drivers (collectively, “Users”).
            </p>
          </section>

          <section>
            <h2 className="text-[#C1FF00] font-semibold uppercase tracking-wider text-xs mb-3">2. Biometric Verification Requirements</h2>
            <p className="text-white/90">
              Users acknowledge that access to the Platform requires biometric face-scanning and government-issued ID verification. By creating an account or using identity verification features, you consent to the collection and use of biometric identifiers and related data solely for the purpose of verifying your identity and preventing fraud. You represent that you have the authority to provide such consent and that any biometric data submitted is your own. Failure to complete required verification may result in restricted or denied access to load assignment, IronGate, and chain-of-custody features.
            </p>
          </section>

          <section>
            <h2 className="text-[#C1FF00] font-semibold uppercase tracking-wider text-xs mb-3">3. GPS Tracking Consent</h2>
            <p className="text-white/90">
              Carriers and Drivers expressly consent to persistent GPS tracking and geofencing during the lifecycle of an active load. Location data may be collected, stored, and shared with the Broker and Shipper associated with the relevant Load ID for the purposes of chain of custody verification, delivery confirmation, and fraud prevention. This consent remains in effect for the duration of the load and any applicable retention period set forth in our Privacy Policy. By accepting a load or using driver-facing features, you confirm this consent.
            </p>
          </section>

          <section>
            <h2 className="text-[#C1FF00] font-semibold uppercase tracking-wider text-xs mb-3">4. Anti-Double Brokering Enforcement</h2>
            <p className="text-white/90">
              The Platform is designed to prevent double brokering, cargo theft, and unauthorized re-brokering. Any unauthorized re-brokering, interlining, or “blind” cargo handoffs will result in immediate permanent deactivation of the MC number and reporting to the FMCSA/DOT for cargo theft investigation. Users agree to use the Platform only for lawful freight transactions and to maintain accurate carrier and driver information. IronFreight reserves the right to suspend or terminate accounts and to report suspected fraud or regulatory violations to authorities.
            </p>
          </section>

          <section>
            <h2 className="text-[#C1FF00] font-semibold uppercase tracking-wider text-xs mb-3">5. Chain of Custody</h2>
            <p className="text-white/90">
              The digital electronic bill of lading (eBOL) signature and IronGate QR scan constitute a legal transfer of custody. By signing the eBOL or scanning/being scanned via IronGate, you acknowledge the transfer of custody under the terms agreed for the applicable load. Such actions are legally binding to the same extent as a traditional paper BOL and in-person handoff where permitted by applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-[#C1FF00] font-semibold uppercase tracking-wider text-xs mb-3">6. Account & Access</h2>
            <p className="text-white/90">
              You are responsible for maintaining the confidentiality of your account credentials and for all activity under your account. IronFreight may suspend or terminate access for violation of these Terms or for any conduct that we determine threatens the security or integrity of the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-[#C1FF00] font-semibold uppercase tracking-wider text-xs mb-3">7. Limitation of Liability</h2>
            <p className="text-white/90">
              To the maximum extent permitted by law, IronFreight and its affiliates shall not be liable for any indirect, incidental, special, consequential, or punitive damages arising from your use of the Platform. Our total liability shall not exceed the fees paid by you in the twelve (12) months preceding the claim.
            </p>
          </section>

          <section>
            <h2 className="text-[#C1FF00] font-semibold uppercase tracking-wider text-xs mb-3">8. Changes & Contact</h2>
            <p className="text-white/90">
              We may update these Terms from time to time. Continued use of the Platform after changes constitutes acceptance. For questions, contact us via the Support Center links in the footer.
            </p>
          </section>
        </article>

        <div className="mt-12 pt-8 border-t border-white/10">
          <Link href="/" className="text-[#C1FF00] hover:opacity-90 text-sm font-medium transition-opacity">
            ← Back to IronFreight
          </Link>
        </div>
      </main>
    </div>
  )
}
