'use client'

import Link from 'next/link'
import { useAtomValue } from 'jotai'
import { userAtom } from '@/lib/store'
import { signOut } from '@/lib/auth'
import { Logo } from '@/components/Logo'
import { LandingTab } from '@/components/tabs/LandingTab'

export default function AppPage() {
  const user = useAtomValue(userAtom)

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="flex-shrink-0 border-b border-divider bg-surface">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <Link href="/" className="inline-flex">
            <Logo className="text-white" />
          </Link>
          <nav className="flex items-center gap-3">
            {user ? (
              <>
                {user.role === 'driver' ? (
                  <Link
                    href="/driver"
                    className="rounded-lg border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
                  >
                    Driver view
                  </Link>
                ) : user.role === 'admin' ? (
                  <Link
                    href="/admin"
                    className="rounded-lg border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
                  >
                    Admin
                  </Link>
                ) : (
                  <Link
                    href="/dashboard"
                    className="rounded-lg border border-primary/50 bg-primary/10 px-4 py-2 text-sm font-medium text-primary hover:bg-primary/20"
                  >
                    Dashboard
                  </Link>
                )}
                <span className="text-xs text-white/60">{user.email}</span>
                <button
                  type="button"
                  onClick={() => signOut()}
                  className="text-xs text-white/50 hover:text-white/80"
                >
                  Sign out
                </button>
              </>
            ) : (
              <Link
                href="/login"
                className="rounded-lg bg-primary px-4 py-2 text-sm font-medium text-black hover:opacity-95"
              >
                Sign in
              </Link>
            )}
          </nav>
        </div>
      </header>

      <main className="flex-1 bg-background">
        <LandingTab />
      </main>
    </div>
  )
}
