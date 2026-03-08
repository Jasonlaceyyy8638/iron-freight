'use client'

import { useState } from 'react'
import {
  Shield,
  Building2,
  Truck,
  Briefcase,
  BadgeCheck,
  Lock,
  Info,
  ArrowRight,
  Link,
} from 'lucide-react'

const ROLES = [
  { id: 'broker', label: 'BROKER', icon: Building2, selected: true },
  { id: 'shipper', label: 'SHIPPER', icon: Truck, selected: false },
  { id: 'carrier', label: 'CARRIER', icon: Briefcase, selected: false },
]

export function AuthTab() {
  const [selectedRole, setSelectedRole] = useState('broker')

  return (
    <div className="flex flex-col min-h-full">
      {/* Header */}
      <header className="border-b-4 border-primary bg-black px-6 py-8 md:py-10">
        <div className="flex flex-col items-center gap-4">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded bg-primary">
              <Shield className="h-6 w-6 text-black" />
            </span>
            <span className="font-display text-headline-md font-extrabold text-primary">IRONFREIGHT</span>
          </div>
          <p className="font-display text-label-sm font-extrabold uppercase text-[#666666]">
            SECURE LOGISTICS GATEWAY
          </p>
        </div>
      </header>

      <div className="flex-1 px-6 py-8 md:px-8">
        <div className="mx-auto max-w-md flex flex-col gap-8">
          {/* Role selection */}
          <div className="flex flex-col gap-4">
            <h2 className="font-display text-title-md font-extrabold text-[#F9FAFB]">SELECT ACCESS LEVEL</h2>
            <div className="flex gap-2">
              {ROLES.map(({ id, label, icon: Icon }) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setSelectedRole(id)}
                  className={`flex flex-1 flex-col items-center gap-1 rounded border px-4 py-3 transition ${
                    selectedRole === id
                      ? 'border-primary bg-primary text-black shadow-sm'
                      : 'border-divider bg-surface text-[#F9FAFB] hover:border-primary/50'
                  }`}
                >
                  <Icon className={`h-7 w-7 ${selectedRole === id ? 'text-black' : 'text-primary'}`} />
                  <span className="font-display text-label-lg font-bold">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Login form */}
          <div className="rounded border border-divider bg-surface p-6">
            <h3 className="font-display text-label-lg font-bold text-[#A3A3A3]">IDENTIFICATION REQUIRED</h3>
            <div className="mt-4 flex flex-col gap-4">
              <div className="flex flex-col gap-1">
                <label className="font-display text-label-sm font-bold text-[#A3A3A3]">CORPORATE EMAIL / MC#</label>
                <div className="flex items-center gap-2 rounded border border-divider bg-surface">
                  <BadgeCheck className="ml-3 h-4 w-4 text-[#A3A3A3]" />
                  <input
                    type="text"
                    placeholder="Enter credentials"
                    className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-white/40 outline-none"
                  />
                </div>
              </div>
              <div className="flex flex-col gap-1">
                <label className="font-display text-label-sm font-bold text-[#A3A3A3]">SECURE PASSWORD</label>
                <div className="flex items-center gap-2 rounded border border-divider bg-surface">
                  <Lock className="ml-3 h-4 w-4 text-[#A3A3A3]" />
                  <input
                    type="password"
                    placeholder="••••••••"
                    className="flex-1 bg-transparent px-3 py-2.5 text-sm text-white placeholder-white/40 outline-none"
                  />
                </div>
              </div>
              <div className="rounded border border-primary/20 bg-primary/11 p-3">
                <div className="flex gap-2">
                  <Info className="h-[18px] w-[18px] flex-shrink-0 text-primary" />
                  <p className="text-body-sm text-[#F9FAFB]">
                    Multi-factor authentication may be required based on your IP reputation.
                  </p>
                </div>
              </div>
              <button
                type="button"
                className="flex w-full items-center justify-center gap-2 rounded bg-primary py-4 text-base font-extrabold text-black hover:opacity-95"
              >
                AUTHORIZE ACCESS
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Links */}
          <div className="flex flex-col gap-4">
            <div className="flex items-center justify-between">
              <button type="button" className="text-label-sm text-[#A3A3A3] hover:text-white">
                FORGOT KEY
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-1 rounded border border-primary px-3 py-1.5 text-label-sm text-primary"
              >
                <Link className="h-3.5 w-3.5" />
                REMOTE DRIVER SIGN-IN
              </button>
            </div>
            <div className="h-px bg-divider" />
            <div className="flex flex-col items-center gap-2">
              <p className="text-label-sm text-[#A3A3A3]">NEW TO THE PLATFORM?</p>
              <button
                type="button"
                className="w-full rounded border border-[#F9FAFB] py-2.5 text-sm font-bold text-[#F9FAFB] hover:bg-white/5"
              >
                INITIALIZE VETTING PROCESS
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Footer bar */}
      <footer className="mt-auto border-t border-divider bg-black px-6 py-4">
        <div className="flex items-center justify-between">
          <div className="flex flex-col gap-0.5">
            <span className="text-label-sm text-success">ENCRYPTION: AES-256</span>
            <span className="text-label-sm text-success">SYSTEM STATUS: OPERATIONAL</span>
          </div>
          <span className="text-[#666666]">Linux</span>
        </div>
      </footer>
    </div>
  )
}
