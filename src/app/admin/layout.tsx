'use client'

import { useAtomValue } from 'jotai'
import { useRouter, usePathname } from 'next/navigation'
import { useEffect } from 'react'
import { userAtom, authReadyAtom } from '@/lib/store'

export default function AdminLayout({
  children,
}: { children: React.ReactNode }) {
  const user = useAtomValue(userAtom)
  const authReady = useAtomValue(authReadyAtom)
  const router = useRouter()
  const pathname = usePathname()
  const isStaffLogin = pathname === '/admin/login'

  useEffect(() => {
    if (isStaffLogin) return
    if (!authReady) return
    if (!user || user.role !== 'admin') router.replace('/admin/login')
  }, [authReady, user, router, isStaffLogin])

  if (isStaffLogin) return <>{children}</>
  if (!authReady || !user || user.role !== 'admin') {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0A0A0B]">
        <p className="text-sm text-white/50">Checking access…</p>
      </div>
    )
  }

  return <>{children}</>
}
