import Link from 'next/link'
import { Logo } from '@/components/Logo'

export const metadata = {
  title: 'Trust Center – IronFreight',
  description: 'IronFreight security, compliance, and trust resources.',
}

export default function TrustCenterPage() {
  return (
    <div className="min-h-screen flex flex-col bg-matte text-[#E5E5E5]">
      <header className="border-b border-white/10 bg-matte/95 backdrop-blur sticky top-0 z-10">
        <div className="mx-auto max-w-4xl px-4 py-4 sm:px-6">
          <Link href="/" className="inline-flex">
            <Logo className="text-white" accent="lime" />
          </Link>
        </div>
      </header>

      <main className="flex-1 mx-auto w-full max-w-4xl px-4 py-10 sm:px-6">
        <h1 className="font-display text-2xl sm:text-3xl font-bold text-lime tracking-tight mb-2">
          Trust Center
        </h1>
        <p className="text-sm text-white/50 mb-10">Security, compliance, and transparency</p>

        <article className="space-y-6 text-sm leading-relaxed text-white/90">
          <p>
            The IronFreight Trust Center provides security, compliance, and incident information. For legal terms and data practices, see our <Link href="/terms" className="text-lime hover:text-lime/90">Terms of Service</Link> and <Link href="/privacy" className="text-lime hover:text-lime/90">Privacy Policy</Link>. For security or verification inquiries, use the Security Hub links in the footer.
          </p>
          <div className="pt-8 border-t border-white/10">
            <Link href="/" className="text-lime hover:text-lime/90 text-sm font-medium">← Back to IronFreight</Link>
          </div>
        </article>
      </main>
    </div>
  )
}
