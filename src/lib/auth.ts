import { getSupabase } from '@/lib/supabase/client'
import type { UserProfile } from '@/lib/store'

export async function signIn(email: string, password: string) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')
  const { data, error } = await supabase.auth.signInWithPassword({ email, password })
  if (error) throw error
  return data
}

export async function signUp(
  email: string,
  password: string,
  role: 'broker' | 'carrier' | 'shipper' | 'driver' | 'admin',
  fullName?: string,
  options?: { mcNumber?: string; dotNumber?: string; legalName?: string }
) {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')
  const metadata: Record<string, unknown> = {
    full_name: fullName ?? null,
    role,
  }
  if (options?.mcNumber != null) metadata.mc_number = options.mcNumber
  if (options?.dotNumber != null) metadata.dot_number = options.dotNumber
  if (role === 'carrier' && (options?.legalName != null || fullName != null)) {
    metadata.legal_name = (options?.legalName?.trim() || fullName?.trim()) ?? null
  }
  const { data: authData, error: authError } = await supabase.auth.signUp({
    email,
    password,
    options: { data: metadata },
  })
  if (authError) throw authError
  if (!authData.user) return authData
  return authData
}

export async function signOut() {
  const supabase = getSupabase()
  if (!supabase) throw new Error('Supabase not configured')
  const { error } = await supabase.auth.signOut()
  if (error) throw error
}

export async function getProfile(userId: string, email?: string): Promise<UserProfile | null> {
  const supabase = getSupabase()
  if (!supabase) return null
  const { data, error } = await supabase
    .from('profiles')
    .select('id, email, full_name, role, stripe_subscription_status')
    .eq('id', userId)
    .single()
  if (!error && data) {
    const role = data.role as UserProfile['role']
    return {
      id: data.id,
      email: data.email ?? '',
      full_name: data.full_name ?? null,
      role,
      verified_status: 'pending',
      stripe_subscription_status: (data as { stripe_subscription_status?: string }).stripe_subscription_status ?? null,
    }
  }
  const { data: user } = await supabase.auth.getUser()
  if (!user?.user) return null
  const { error: insertErr } = await supabase.from('profiles').insert({
    id: user.user.id,
    email: user.user.email ?? email ?? '',
    full_name: user.user.user_metadata?.full_name ?? null,
    role: 'broker',
  })
  if (insertErr) return null
  const { data: inserted } = await supabase.from('profiles').select('id, email, full_name, role, stripe_subscription_status').eq('id', userId).single()
  if (!inserted) return null
  return {
    id: inserted.id,
    email: inserted.email ?? '',
    full_name: inserted.full_name ?? null,
    role: inserted.role as UserProfile['role'],
    verified_status: 'pending',
    stripe_subscription_status: (inserted as { stripe_subscription_status?: string }).stripe_subscription_status ?? null,
  }
}
