import { atom } from 'jotai'

export type Role = 'broker' | 'carrier' | 'shipper' | 'driver' | 'admin'

export interface UserProfile {
  id: string
  email: string
  full_name: string | null
  role: Role
  company_name?: string | null
  mc_number?: string | null
  verified_status?: 'pending' | 'verified' | 'rejected'
  stripe_subscription_status?: string | null
}

export const userAtom = atom<UserProfile | null>(null)
export const roleAtom = atom<Role | null>(null)
export const authReadyAtom = atom<boolean>(false)
