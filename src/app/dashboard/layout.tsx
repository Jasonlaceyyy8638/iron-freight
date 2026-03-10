'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useAtomValue } from 'jotai'
import { userAtom, authReadyAtom } from '@/lib/store'
import { signOut } from '@/lib/auth'
import { Logo } from '@/components/Logo'

const SUBSCRIPTION_REQUIRED_ROLES = ['broker', 'carrier', 'shipper'] as const
function hasActiveSubscription(status: string | null | undefined): boolean {
  return status === 'active' || status === 'trialing'
}

const TABS = [
  { id: 'load-board', label: 'Load Board' },
  { id: 'my-loads', label: 'My Loads' },
  { id: 'fleet', label: 'Fleet' },
  { id: 'verification', label: 'Verification' },
] as const

export default function DashboardLayout({
  children,
}: { children: React.ReactNode }) {
  const pathname = usePathname()
  const router = useRouter()
  const user = useAtomValue(userAtom)
  const authReady = useAtomValue(authReadyAtom)
  const currentTab = pathname?.split('/').pop() || 'load-board'

  useEffect(() => {
    if (!authReady) return
    if (!user) {
      router.replace('/login')
      return
    }
    const role = user.role
    if (SUBSCRIPTION_REQUIRED_ROLES.includes(role as (typeof SUBSCRIPTION_REQUIRED_ROLES)[number])) {
      const status = user.stripe_subscription_status
      if (!hasActiveSubscription(status)) {
        router.replace('/subscribe-required')
      }
    }
  }, [authReady, user, router])

  return (
    <div className="flex min-h-screen flex-col bg-iron-950">
      <header className="sticky top-0 z-10 border-b border-iron-800 bg-iron-900/95 backdrop-blur">
        <div className="flex items-center justify-between px-4 py-3 sm:px-6">
          <Link href="/dashboard" className="inline-flex">
            <Logo className="text-iron-100" />
          </Link>
          <div className="flex items-center gap-4">
            {user?.role === 'admin' && (
              <Link
                href="/admin"
                className="rounded border border-primary/50 bg-primary/10 px-3 py-1.5 text-sm font-medium text-primary hover:bg-primary/20"
              >
                Master Admin
              </Link>
            )}
            <span className="text-xs text-iron-500 sm:text-sm">{user?.email}</span>
            <span className="rounded bg-iron-700 px-2 py-0.5 text-xs font-medium text-iron-300 capitalize">{user?.role}</span>
            <button
              type="button"
              onClick={async () => {
                await signOut()
                router.push('/')
              }}
              className="text-sm text-iron-400 hover:text-iron-200"
            >
              Sign out
            </button>
          </div>
        </div>
        <div className="flex gap-1 border-t border-iron-800 px-4 sm:px-6">
          {TABS.map((tab) => (
            <Link
              key={tab.id}
              href={`/dashboard/${tab.id}`}
              className={`border-b-2 px-4 py-2.5 text-sm font-medium transition-colors ${
                currentTab === tab.id
                  ? 'border-primary text-primary'
                  : 'border-transparent text-iron-400 hover:text-iron-200'
              }`}
            >
              {tab.label}
            </Link>
          ))}
        </div>
      </header>

      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  )
}
