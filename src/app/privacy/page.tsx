import Link from 'next/link'
import { Logo } from '@/components/Logo'

export const metadata = {
  title: 'Privacy Policy – IronFreight',
  description: 'IronFreight Privacy Policy: biometric data security, encrypted GPS logs, and chain of custody data retention.',
}

export default function PrivacyPage() {
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
          Privacy Policy
        </h1>
        <p className="text-sm text-white/50 mb-10">Last updated: March 7, 2026</p>

        <article className="space-y-10 text-sm leading-relaxed">
          <section>
            <h2 className="text-[#C1FF00] font-semibold uppercase tracking-wider text-xs mb-3">1. Scope & Controller</h2>
            <p className="text-white/90">
              This Privacy Policy describes how IronFreight (“we,” “us,” or “our”) collects, uses, and discloses information in connection with the IronFreight platform. We process high-sensitivity data necessary for freight verification and fraud prevention. By using the Platform, you agree to the practices described below.
            </p>
          </section>

          <section>
            <h2 className="text-[#C1FF00] font-semibold uppercase tracking-wider text-xs mb-3">2. Data We Collect</h2>
            <p className="text-white/90 mb-3">
              We collect:
            </p>
            <ul className="list-disc pl-5 space-y-1.5 text-white/90">
              <li><strong className="text-white">Precise Geolocation (GPS):</strong> Real-time and historical location data from devices used by Carriers and Drivers during active loads, including geofence entry/exit events. GPS data is stored in encrypted form as described in Section 4.</li>
              <li><strong className="text-white">Biometric Face-Hashes:</strong> We do not store raw photographs. We collect and store only biometric templates or hashes derived from face-scanning for identity verification. Raw images are processed and discarded after hash generation. Biometric data is secured as described in Section 3.</li>
              <li><strong className="text-white">CDL / Driver License Data:</strong> Information from government-issued driver licenses (e.g., name, license number, state, expiration) when provided for verification and vetting.</li>
              <li><strong className="text-white">ELD Telematics:</strong> Electronic logging device and related telematics data when integrated for load lifecycle and hours-of-service correlation.</li>
            </ul>
          </section>

          <section>
            <h2 className="text-[#C1FF00] font-semibold uppercase tracking-wider text-xs mb-3">3. Biometric Data Security</h2>
            <p className="text-white/90">
              Biometric identifiers are processed using industry-standard hashing and are stored in isolated, access-controlled systems. We do not retain raw facial images. Biometric data is used solely for identity verification and fraud prevention in connection with the Platform. Access to biometric data is restricted to authorized personnel and systems necessary for verification and dispute resolution. We implement technical and organizational measures consistent with applicable biometric privacy requirements.
            </p>
          </section>

          <section>
            <h2 className="text-[#C1FF00] font-semibold uppercase tracking-wider text-xs mb-3">4. Encrypted GPS Logs</h2>
            <p className="text-white/90">
              GPS and location data are transmitted and stored using encryption. Our encrypted GPS logs support chain of custody verification, geofence validation, and audit trails. Access to decrypted location data is limited to the Broker and Shipper bound to the active Load ID and to IronFreight operations required for support, compliance, or dispute resolution. We do not use location data for marketing or unrelated analytics.
            </p>
          </section>

          <section>
            <h2 className="text-[#C1FF00] font-semibold uppercase tracking-wider text-xs mb-3">5. IronVault & Secure Document Upload</h2>
            <p className="text-white/90">
              Images uploaded to the IronVault are encrypted at rest. CDL and Biometric images are never stored on the user&apos;s local device gallery; they are streamed directly to our secure servers.
            </p>
          </section>

          <section>
            <h2 className="text-[#C1FF00] font-semibold uppercase tracking-wider text-xs mb-3">6. Chain of Custody Data Retention</h2>
            <p className="text-white/90">
              Biometric hashes associated with a specific load are purged ninety (90) days after delivery of that load, unless a dispute or investigation is filed, in which case we may retain the data as necessary for the resolution of the dispute or as required by law. Encrypted GPS logs and other chain-of-custody records may be retained for a longer period as needed for compliance, audit, and legal hold. Retention schedules are designed to support freight security and regulatory requirements while minimizing data retention where no longer necessary.
            </p>
          </section>

          <section>
            <h2 className="text-[#C1FF00] font-semibold uppercase tracking-wider text-xs mb-3">7. Purpose of Processing & Third-Party Disclosure</h2>
            <p className="text-white/90">
              Data is processed solely for <strong className="text-white">Chain of Custody Verification</strong> and <strong className="text-white">Fraud Prevention</strong>. Data is only shared with the specific Broker and Shipper bound to the active Load ID to ensure freight security. We do not sell your data. We may share data with service providers who process it on our behalf under strict contractual obligations, and with law enforcement or regulators when required by law or to protect the safety and integrity of the Platform.
            </p>
          </section>

          <section>
            <h2 className="text-[#C1FF00] font-semibold uppercase tracking-wider text-xs mb-3">8. Your Rights</h2>
            <p className="text-white/90">
              Depending on your jurisdiction, you may have rights to access, correct, delete, or restrict processing of your personal data. To exercise these rights or to ask questions about this policy, contact us via the Support Center in the footer. Biometric data may be subject to additional legal requirements; we will respond in accordance with applicable law.
            </p>
          </section>

          <section>
            <h2 className="text-[#C1FF00] font-semibold uppercase tracking-wider text-xs mb-3">9. Updates</h2>
            <p className="text-white/90">
              We may update this Privacy Policy from time to time; the “Last updated” date reflects the most recent version. Continued use of the Platform after changes constitutes acceptance of the updated policy.
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
