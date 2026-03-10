'use client'

import { Suspense, useState, useEffect } from 'react'
import { useRouter, useSearchParams } from 'next/navigation'
import Link from 'next/link'
import { type Role } from '@/lib/store'
import { signIn, signUp, getProfile } from '@/lib/auth'
import { getSupabase } from '@/lib/supabase/client'
import { Logo } from '@/components/Logo'
import { Footer } from '@/components/Footer'
import { Search, Eye, EyeOff, X } from 'lucide-react'

type NonAdminRole = 'broker' | 'carrier' | 'shipper' | 'driver'

const ROLES: { value: NonAdminRole; label: string }[] = [
  { value: 'broker', label: 'Broker' },
  { value: 'carrier', label: 'Carrier' },
  { value: 'shipper', label: 'Shipper' },
  { value: 'driver', label: 'Driver' },
]
/** Signup only: Broker, Carrier, Shipper. Driver is invite-only. */
const SIGNUP_ROLES = ROLES.filter((r) => r.value !== 'driver')

function LoginContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const inviteToken = searchParams?.get('invite') ?? null
  const inviteTypeParam = searchParams?.get('type') ?? null // 'carrier' | 'broker'
  const checkoutSuccess = searchParams?.get('checkout') === 'success'
  const [mode, setMode] = useState<'signin' | 'signup'>(checkoutSuccess ? 'signup' : 'signin')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [mcNumber, setMcNumber] = useState('')
  const [dotNumber, setDotNumber] = useState('')
  const [cdlNumber, setCdlNumber] = useState('')
  const [role, setRoleLocal] = useState<NonAdminRole>('broker')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [showPassword, setShowPassword] = useState(false)
  const [inviteCarrierId, setInviteCarrierId] = useState<string | null>(null)
  const [inviteCarrierName, setInviteCarrierName] = useState<string | null>(null)
  const [fmcsaLookupLoading, setFmcsaLookupLoading] = useState(false)
  const [fmcsaLookupError, setFmcsaLookupError] = useState<string | null>(null)
  const [showPricingModal, setShowPricingModal] = useState(false)
  const [pricingModalRole, setPricingModalRole] = useState<'broker' | 'carrier' | null>(null)
  const [preferTrialNoCard, setPreferTrialNoCard] = useState(false)

  useEffect(() => {
    if (!inviteToken || !inviteTypeParam) return
    const supabase = getSupabase()
    if (!supabase) return
    let cancelled = false
    if (inviteTypeParam === 'carrier') {
      supabase.rpc('get_carrier_invite_by_token', { t: inviteToken }).then(({ data }) => {
        if (cancelled || !data) return
        const d = data as { email?: string; full_name?: string; carrier_id?: string; carrier_name?: string } | null
        if (d?.email) setEmail(d.email)
        if (d?.full_name) setFullName(d.full_name)
        if (d?.carrier_id) setInviteCarrierId(d.carrier_id)
        if (d?.carrier_name) setInviteCarrierName(d.carrier_name)
        setRoleLocal('driver')
        setMode('signup')
      })
    } else if (inviteTypeParam === 'broker') {
      supabase.rpc('get_broker_invite_by_token', { t: inviteToken }).then(({ data }) => {
        if (cancelled || !data) return
        const d = data as { email?: string; full_name?: string } | null
        if (d?.email) setEmail(d.email)
        if (d?.full_name) setFullName(d.full_name)
        setRoleLocal('broker')
        setMode('signup')
      })
    }
    return () => { cancelled = true }
  }, [inviteToken, inviteTypeParam])

  const isInviteFlow = Boolean(inviteToken && inviteTypeParam)
  const isCarrierInvite = inviteTypeParam === 'carrier'
  const needsMcDot = (role === 'broker' || role === 'carrier') && mode === 'signup' && !isCarrierInvite

  const handleFmcsaLookup = async () => {
    const mc = mcNumber.trim()
    const dot = dotNumber.trim()
    if (!mc && !dot) {
      setFmcsaLookupError('Enter MC or DOT number first.')
      return
    }
    setFmcsaLookupError(null)
    setFmcsaLookupLoading(true)
    try {
      const params = mc ? `mc=${encodeURIComponent(mc)}` : `dot=${encodeURIComponent(dot)}`
      const res = await fetch(`/api/fmcsa-lookup?${params}`)
      const data = await res.json().catch(() => ({}))
      if (!res.ok) {
        setFmcsaLookupError(data.error ?? 'Lookup failed')
        return
      }
      if (data.legalName) setFullName(data.legalName)
      if (data.dotNumber) setDotNumber(data.dotNumber)
      if (data.mcNumber && mc) setMcNumber(data.mcNumber)
      const resolvedRole: 'broker' | 'carrier' =
        data.suggestedRole === 'broker' || data.suggestedRole === 'carrier'
          ? data.suggestedRole
          : role === 'broker' || role === 'carrier'
            ? role
            : 'broker'
      if (data.suggestedRole && (data.suggestedRole === 'broker' || data.suggestedRole === 'carrier')) {
        setRoleLocal(data.suggestedRole)
      } else if (role !== 'broker' && role !== 'carrier') {
        setRoleLocal(resolvedRole)
      }
      if (mode === 'signup' && !isCarrierInvite) {
        setPricingModalRole(resolvedRole)
        setShowPricingModal(true)
      }
    } catch {
      setFmcsaLookupError('Lookup failed')
    } finally {
      setFmcsaLookupLoading(false)
    }
  }

  const openFmcsaSafer = () => {
    const mc = mcNumber.trim().replace(/\D/g, '') || ''
    const dot = dotNumber.trim().replace(/\D/g, '') || ''
    const searchVal = mc || dot || '000000'
    const param = dot && !mc ? 'USDOT' : 'MC_MX'
    const q = encodeURIComponent(searchVal)
    window.open(`https://safer.fmcsa.dot.gov/query.asp?query_param=${param}&query_string=${q}&query_type=queryCarrierSnapshot`, '_blank', 'noopener,noreferrer')
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    if (mode === 'signup' && isCarrierInvite && !cdlNumber.trim()) {
      setError('CDL number is required for driver signup.')
      return
    }
    if (mode === 'signup' && needsMcDot && !mcNumber.trim()) {
      setError('MC number is required for brokers and carriers.')
      return
    }
    setLoading(true)
    try {
      if (mode === 'signup') {
        const data = await signUp(
          email.trim(),
          password,
          role,
          fullName.trim() || undefined,
          needsMcDot
            ? { mcNumber: mcNumber.trim(), dotNumber: dotNumber.trim() || undefined, legalName: fullName.trim() || undefined }
            : undefined
        )
        if (role === 'driver' && inviteCarrierId && data?.user && cdlNumber.trim()) {
          const supabase = getSupabase()
          if (supabase) {
            await supabase.from('drivers').insert({
              carrier_id: inviteCarrierId,
              profile_id: data.user.id,
              full_name: fullName.trim() || email.trim(),
              cdl_number: cdlNumber.trim(),
            })
          }
        }
        if (preferTrialNoCard && (role === 'broker' || role === 'carrier' || role === 'shipper')) {
          try {
            const trialRes = await fetch('/api/stripe/start-trial', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({ email: email.trim().toLowerCase(), role }),
            })
            if (!trialRes.ok) {
              const err = await trialRes.json().catch(() => ({}))
              console.error('Start trial failed:', err)
            }
            setPreferTrialNoCard(false)
          } catch (e) {
            console.error('Start trial error:', e)
          }
        }
        if (role === 'driver') router.push('/driver')
        else router.push('/dashboard')
      } else {
        const data = await signIn(email.trim(), password)
        const profile = data?.user?.id ? await getProfile(data.user.id) : null
        if (profile?.role === 'driver') router.push('/driver')
        else if (profile?.role === 'admin') router.push('/admin')
        else router.push('/dashboard')
      }
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : mode === 'signup' ? 'Sign up failed' : 'Sign in failed'
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
          <Link href="/" className="text-sm text-[#A3A3A3] hover:text-[#F9FAFB]">
            Back to home
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

          {checkoutSuccess && (
            <p className="mb-3 rounded-lg border border-primary/30 bg-primary/10 px-3 py-2 text-body-sm text-primary">
              Your 7-day free trial has started. Create your account below using the <strong>same email</strong> you used at checkout.
            </p>
          )}
          {isInviteFlow && !checkoutSuccess && (
            <p className="mb-3 rounded-lg border border-[#C1FF00]/30 bg-[#C1FF00]/10 px-3 py-2 text-body-sm text-[#C1FF00]">
              {isCarrierInvite && inviteCarrierName
                ? `You're invited to join ${inviteCarrierName} as a driver. Create your account below.`
                : inviteTypeParam === 'broker'
                  ? "You're invited to join our broker team. Create your account below."
                  : null}
            </p>
          )}
          <h1 className="font-display text-headline-md font-bold text-[#F9FAFB]">
            {mode === 'signup' ? 'Create account' : 'Sign in'}
          </h1>
          <p className="mt-1 text-body-sm text-[#A3A3A3]">
            {mode === 'signup' ? 'Brokers and carriers: enter MC number and click Look up to see your plan and pricing.' : 'Choose your role for redirect after sign-in.'}
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

            {needsMcDot && (
              <div className="space-y-3 rounded-lg border border-divider bg-surface/50 p-3">
                <div>
                  <label htmlFor="mcNumber" className="block text-label-lg font-medium text-[#A3A3A3]">
                    MC number <span className="text-primary">*</span>
                  </label>
                  <div className="mt-1 flex gap-2">
                    <input
                      id="mcNumber"
                      type="text"
                      value={mcNumber}
                      onChange={(e) => setMcNumber(e.target.value)}
                      required={needsMcDot}
                      className="block flex-1 rounded-lg border border-divider bg-surface px-3 py-2.5 text-[#F9FAFB] placeholder-[#525252] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                      placeholder="e.g. 123456"
                    />
                    <button
                      type="button"
                      onClick={handleFmcsaLookup}
                      disabled={fmcsaLookupLoading}
                      className="inline-flex items-center gap-1.5 rounded-lg border border-primary/50 bg-primary/10 px-3 py-2.5 text-sm font-medium text-primary hover:bg-primary/20 disabled:opacity-50"
                      title="Look up carrier and auto-fill name / DOT"
                    >
                      {fmcsaLookupLoading ? (
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-primary border-t-transparent" />
                      ) : (
                        <Search className="h-4 w-4" />
                      )}
                      {fmcsaLookupLoading ? 'Looking up…' : 'Look up'}
                    </button>
                  </div>
                  {fmcsaLookupError && <p className="mt-1 text-xs text-red-400">{fmcsaLookupError}</p>}
                  <p className="mt-1 text-xs text-[#525252]">Look up auto-fills legal name and DOT. <button type="button" onClick={openFmcsaSafer} className="text-primary hover:underline">Open in FMCSA Safer</button></p>
                </div>
                <div>
                  <label htmlFor="dotNumber" className="block text-label-lg font-medium text-[#A3A3A3]">
                    DOT number <span className="text-[#525252]">(optional)</span>
                  </label>
                  <input
                    id="dotNumber"
                    type="text"
                    value={dotNumber}
                    onChange={(e) => setDotNumber(e.target.value)}
                    className="mt-1 block w-full rounded-lg border border-divider bg-surface px-3 py-2.5 text-[#F9FAFB] placeholder-[#525252] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                    placeholder="e.g. 1234567"
                  />
                </div>
              </div>
            )}

            {mode === 'signup' && isCarrierInvite && (
              <div>
                <label htmlFor="cdlNumber" className="block text-label-lg font-medium text-[#A3A3A3]">
                  CDL number <span className="text-primary">*</span>
                </label>
                <input
                  id="cdlNumber"
                  type="text"
                  value={cdlNumber}
                  onChange={(e) => setCdlNumber(e.target.value)}
                  required={isCarrierInvite}
                  className="mt-1 block w-full rounded-lg border border-divider bg-surface px-3 py-2.5 text-[#F9FAFB] placeholder-[#525252] focus:border-primary focus:outline-none focus:ring-1 focus:ring-primary"
                  placeholder="e.g. 12345678"
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
            {mode === 'signup' && (
              <div>
                <label className="block text-label-lg font-medium text-[#A3A3A3]">Role</label>
              {isInviteFlow ? (
                <p className="mt-1 text-body-sm text-[#F9FAFB]">You’re signing up as <strong>{role === 'driver' ? 'Driver' : 'Broker'}</strong> (from invite).</p>
              ) : (
                <>
                  <p className="mt-0.5 text-body-sm text-[#525252]">Used for redirect; your profile role is set on sign-up.</p>
                  <div className="mt-2 flex flex-wrap gap-2">
                    {SIGNUP_ROLES.map((r) => (
                      <button
                        key={r.value}
                        type="button"
                        onClick={() => setRoleLocal(r.value)}
                        className={`rounded-lg border px-3 py-2 text-sm font-medium transition-colors ${
                          role === r.value
                            ? 'border-primary bg-primary/20 text-primary'
                            : 'border-divider bg-surface text-[#A3A3A3] hover:border-primary/50 hover:text-[#F9FAFB]'
                        }`}
                      >
                        {r.label}
                      </button>
                      ))}
                    </div>
                  </>
                )}
              </div>
            )}
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
            <a href="mailto:Support@getironfreight.com" className="text-primary hover:underline">
              Support@getironfreight.com
            </a>
          </p>
          <p className="mt-2 text-center text-body-sm text-[#525252]">
            <Link href="/admin/login" className="text-[#737373] hover:text-[#A3A3A3]">
              Staff sign in
            </Link>
          </p>

          {showPricingModal && pricingModalRole && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70" role="dialog" aria-modal="true" aria-labelledby="pricing-modal-title">
              <div className="relative w-full max-w-md rounded-xl border border-divider bg-[#141414] p-6 shadow-xl">
                <div className="flex items-start justify-between gap-4">
                  <h2 id="pricing-modal-title" className="font-display text-lg font-bold text-[#F9FAFB]">
                    Choose your plan
                  </h2>
                  <button
                    type="button"
                    onClick={() => {
                      setShowPricingModal(false)
                      setPricingModalRole(null)
                    }}
                    className="-m-1.5 flex h-8 w-8 shrink-0 items-center justify-center rounded-lg text-primary hover:bg-primary/10 focus:outline-none focus:ring-2 focus:ring-primary"
                    aria-label="Close"
                  >
                    <X className="h-5 w-5" />
                  </button>
                </div>
                <p className="mt-2 text-body-sm text-[#A3A3A3]">
                  {fullName ? (
                    <>We found <strong className="text-[#F9FAFB]">{fullName}</strong>. Based on FMCSA records, you&apos;re identified as a <strong className="text-primary">{pricingModalRole === 'broker' ? 'Broker' : 'Carrier'}</strong>.</>
                  ) : (
                    <>Based on FMCSA records, you&apos;re identified as a <strong className="text-primary">{pricingModalRole === 'broker' ? 'Broker' : 'Carrier'}</strong>.</>
                  )}
                </p>
                <div className="mt-4 rounded-lg border border-divider bg-surface/50 p-3 text-body-sm text-[#A3A3A3]">
                  {pricingModalRole === 'broker' ? (
                    <>Broker: <strong className="text-[#F9FAFB]">$299/mo</strong> or <strong className="text-[#F9FAFB]">$2,990/year</strong> (2 months free). Includes unlimited carrier vetting; IronGate verification $10/verified load.</>
                  ) : (
                    <>Carrier: <strong className="text-[#F9FAFB]">$99/mo</strong> or <strong className="text-[#F9FAFB]">$990/year</strong> (2 months free). Driver app always free.</>
                  )}
                </div>
                <p className="mt-3 text-xs text-[#A3A3A3]">Start your 7-day free trial. No card required—add one later when you subscribe.</p>
                <div className="mt-4 flex flex-col gap-2">
                  <button
                    type="button"
                    onClick={() => {
                      setPreferTrialNoCard(true)
                      setShowPricingModal(false)
                      setPricingModalRole(null)
                    }}
                    className="rounded-lg border-2 border-primary bg-primary py-2.5 text-center font-medium text-black hover:bg-primary/90"
                  >
                    Start free trial (no card required)
                  </button>
                  <Link
                    href={`/subscribe/${pricingModalRole}/monthly`}
                    className="rounded-lg border border-primary/50 bg-primary/10 py-2.5 text-center font-medium text-primary hover:bg-primary/20"
                  >
                    Pay monthly (7-day free trial)
                  </Link>
                  <Link
                    href={`/subscribe/${pricingModalRole}/yearly`}
                    className="rounded-lg border border-primary/50 bg-primary/10 py-2.5 text-center font-medium text-primary hover:bg-primary/20"
                  >
                    Pay yearly (7-day free trial, save 2 months)
                  </Link>
                </div>
              </div>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  )
}

export default function LoginPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen flex-col items-center justify-center bg-background">
          <div className="h-8 w-8 animate-spin rounded-full border-2 border-primary border-t-transparent" />
        </div>
      }
    >
      <LoginContent />
    </Suspense>
  )
}