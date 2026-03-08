'use client'

import dynamic from 'next/dynamic'
import Link from 'next/link'
import { Logo } from '@/components/Logo'

/** Skeleton shown only on server and until HomePageClient chunk loads. Must match so no hydration mismatch. */
function PageSkeleton() {
  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex-shrink-0 border-b border-divider bg-surface">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <Link href="/" className="inline-flex">
            <Logo className="text-white" />
          </Link>
          <nav className="flex items-center gap-3">
            <Link href="/login" className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-black hover:opacity-95">
              Sign in
            </Link>
          </nav>
        </div>
      </header>
      <main className="flex flex-1 flex-col items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" aria-hidden />
      </main>
    </div>
  )
}

const HomePageClient = dynamic(() => import('./HomePageClient'), {
  ssr: false,
  loading: PageSkeleton,
})

export default function AppPage() {
  return <HomePageClient />
}
