'use client'

import { useEffect } from 'react'
import { useSetAtom } from 'jotai'
import { userAtom, roleAtom, authReadyAtom } from '@/lib/store'
import { getSupabase } from '@/lib/supabase/client'
import { getProfile } from '@/lib/auth'

export function AuthSync({ children }: { children: React.ReactNode }) {
  const setUser = useSetAtom(userAtom)
  const setRole = useSetAtom(roleAtom)
  const setAuthReady = useSetAtom(authReadyAtom)

  useEffect(() => {
    const supabase = getSupabase()
    if (!supabase) {
      setAuthReady(true)
      return
    }
    const sync = async () => {
      const { data: { session } } = await supabase.auth.getSession()
      if (!session?.user) {
        setUser(null)
        setRole(null)
      } else {
        const profile = await getProfile(session.user.id)
        if (profile) {
          setUser(profile)
          setRole(profile.role)
        } else {
          setUser(null)
          setRole(null)
        }
      }
      setAuthReady(true)
    }

    sync()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(sync)
    return () => subscription.unsubscribe()
  }, [setUser, setRole, setAuthReady])

  return <>{children}</>
}
