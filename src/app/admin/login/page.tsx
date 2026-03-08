'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { signIn, signUp } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase/client'
import { Logo } from '@/components/Logo'
import { Eye, EyeOff } from 'lucide-react'

function AdminLoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams?.get('invite') ?? null
  const [mode, setMode] = useState<'signin' | 'signup'>('signup')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [inviteRole, setInviteRole] = useState<string | null>(null)

  useEffect(() => {
    if (!inviteToken) return
    const supabase = getSupabase()
    if (!supabase) return
    let cancelled = false
    supabase.rpc('get_staff_invite_by_token', { t: inviteToken }).then(({ data }) => {
      if (cancelled || !data) return
      const d = data as { email?: string; full_name?: string; staff_role?: string } | null
      if (d?.email) setEmail(d.email)
      if (d?.full_name) setFullName(d.full_name)
      if (d?.staff_role) setInviteRole(d.staff_role)
      setMode('signup')
    })
    return () => { cancelled = true }
  }, [inviteToken])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    setLoading(true)
    try {
      if (mode === 'signup') {
        const data = await signUp(email.trim(), password, 'admin', fullName.trim() || undefined)
        if (inviteToken && inviteRole && data?.user) {
          const supabase = getSupabase()
          if (supabase) {
            await supabase.from('admin_team').upsert(
              { profile_id: data.user.id, staff_role: inviteRole },
              { onConflict: 'profile_id' }
            )
          }
        }
        router.push('/admin')
      } else {
        await signIn(email.trim(), password)
        router.push('/admin')
      }
    } catch (err: unknown) {
      const message: string | null =
        (err instanceof Error ? err.message : null) ||
        (err && typeof err === 'object' && 'message' in err ? String((err as { message: unknown }).message) : null) ||
        (mode === 'signup' ? 'Sign up failed' : 'Sign in failed')
      setError(message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="border-b border-divider bg-surface">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
          <Link href="/" className="inline-flex">
            <Logo className="text-white" />
          </Link>
          <Link href="/login" className="text-sm text-[#A3A3A3] hover:text-[#F9FAFB]">
            Back to sign in
          </Link>
        </div>
      </header>

      <main className="flex flex-1 items-center justify-center px-4 py-12">
        <div className="w-full max-w-md">
          <div className="mb-6 flex gap-2 border-b border-divider">
            <button
              type="button"
              onClick={() => { setMode('signin'); setError(null) }}
              className={`border-b-2 px-2 py-2 text-sm font-medium transition-colors ${
                mode === 'signin'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-[#A3A3A3] hover:text-[#F9FAFB]'
              }`}
            >
              Sign in
            </button>
            <button
              type="button"
              onClick={() => { setMode('signup'); setError(null) }}
              className={`border-b-2 px-2 py-2 text-sm font-medium transition-colors ${
                mode === 'signup'
                  ? 'border-primary text-primary'
                  : 'border-transparent text-[#A3A3A3] hover:text-[#F9FAFB]'
              }`}
            >
              Sign up
            </button>
          </div>

          <h1 className="font-display text-headline-md font-bold text-[#F9FAFB]">
            Staff (Internal)
          </h1>
          {inviteToken && (
            <p className="mt-1 rounded-lg border border-[#C1FF00]/30 bg-[#C1FF00]/10 px-3 py-2 text-body-sm text-[#C1FF00]">
              You’re invited to join the IronFreight admin team. Create your account below.
            </p>
          )}
          <p className="mt-1 text-body-sm text-[#A3A3A3]">
            {mode === 'signup' ? 'Create an admin account.' : 'Sign in to the admin portal.'}
          </p>

          <form onSubmit={handleSubmit} className="mt-6 space-y-5">
            {mode === 'signup' && (
              <div>
                <label htmlFor="fullName" className="block text-label-lg font-medium text-[#A3A3A3]">
                  Full name
                </label>
                <input
                  id="fullName"
                  type="text"
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="mt-1 block w-full rounded-lg border border-divider bg-surface px-3 py-2.5 text-[#F9FAFB] placeholder-[#525252] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="Jane Smith"
                />
              </div>
            )}
            <div>
              <label htmlFor="email" className="block text-label-lg font-medium text-[#A3A3A3]">
                Email
              </label>
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                className="mt-1 block w-full rounded-lg border border-divider bg-surface px-3 py-2.5 text-[#F9FAFB] placeholder-[#525252] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                placeholder="you@company.com"
              />
            </div>
            <div>
              <label htmlFor="password" className="block text-label-lg font-medium text-[#A3A3A3]">
                Password
              </label>
              <div className="relative mt-1">
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  minLength={6}
                  className="block w-full rounded-lg border border-divider bg-surface py-2.5 pl-3 pr-10 text-[#F9FAFB] placeholder-[#525252] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="••••••••"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 rounded p-1.5 text-[#A3A3A3] hover:text-[#F9FAFB]"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>
            </div>
            {error && (
              <p className="rounded-lg border border-error/50 bg-error/10 px-3 py-2 text-body-sm text-red-300">
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full rounded-lg bg-primary py-3 font-display text-label-lg font-bold text-black hover:opacity-95 disabled:opacity-50"
            >
              {loading
                ? (mode === 'signup' ? 'Creating account…' : 'Signing in…')
                : (mode === 'signup' ? 'Create account' : 'Sign in')}
            </button>
          </form>

          <p className="mt-6 text-center text-body-sm text-[#525252]">
            <Link href="/login" className="text-primary hover:underline">
              Broker / Carrier / Shipper sign in
            </Link>
          </p>
        </div>
      </main>
    </div>
  )
}

export default function AdminLoginPage() {
  return (
    <Suspense fallback={
      <div className="flex min-h-screen flex-col items-center justify-center bg-background">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
      </div>
    }>
      <AdminLoginContent />
    </Suspense>
  )
}
