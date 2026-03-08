'use client'

import {
  Shield,
  CheckCircle,
  Building2,
  Users,
  Bell,
  ChevronRight,
  Mail,
  Phone,
  User,
} from 'lucide-react'

const SETTINGS_ITEMS = [
  { icon: Building2, title: 'Company Profile', subtitle: 'Update address and billing info' },
  { icon: Users, title: 'Fleet Management', subtitle: 'Add or remove linked drivers' },
  { icon: Bell, title: 'Load Alerts', subtitle: 'Push notifications for new bids' },
  { icon: Shield, title: 'IronGate Security', subtitle: 'Manage QR handshake protocols' },
]

export function UserProfileTab() {
  return (
    <div className="flex flex-col">
      {/* Profile header with gradient */}
      <div
        className="flex flex-col items-center gap-4 py-10"
        style={{ background: 'linear-gradient(to bottom right, #1A1A1A, #000000)', minHeight: 180 }}
      >
        <span className="flex h-20 w-20 items-center justify-center rounded-sm bg-primary font-display text-2xl font-bold text-black">
          JD
        </span>
        <div className="flex flex-col items-center gap-1">
          <h1 className="font-display text-title-lg font-extrabold text-[#F9FAFB]">Jetstream Logistics Inc.</h1>
          <div className="flex gap-2">
            <span className="rounded border border-primary bg-primary/20 px-2 py-0.5 text-label-sm font-bold text-primary">
              CARRIER
            </span>
            <span className="rounded bg-success px-2 py-0.5 text-label-sm font-bold text-background">VERIFIED</span>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-6 px-6 py-8">
        {/* Company identity */}
        <div className="rounded-sm border border-divider bg-surface p-6">
          <div className="mb-4 flex items-center justify-between">
            <h2 className="font-display text-label-lg font-extrabold text-primary">COMPANY IDENTITY</h2>
            <CheckCircle className="h-[18px] w-[18px] text-success" />
          </div>
          <div className="h-px bg-divider" />
          <div className="mt-4 grid gap-4 sm:grid-cols-2">
            <div>
              <p className="text-label-sm font-semibold text-[#A3A3A3]">MC NUMBER</p>
              <p className="text-body-md text-[#F9FAFB]">MC-992831</p>
            </div>
            <div>
              <p className="text-label-sm font-semibold text-[#A3A3A3]">DOT NUMBER</p>
              <p className="text-body-md text-[#F9FAFB]">DOT-3302918</p>
            </div>
            <div>
              <p className="text-label-sm font-semibold text-[#A3A3A3]">TAX ID (EIN)</p>
              <p className="text-body-md text-[#F9FAFB]">XX-XXX4492</p>
            </div>
            <div>
              <p className="text-label-sm font-semibold text-[#A3A3A3]">FLEET SIZE</p>
              <p className="text-body-md text-[#F9FAFB]">14 Drivers</p>
            </div>
          </div>
        </div>

        {/* Account settings */}
        <div>
          <h2 className="mb-2 font-display text-label-lg font-bold text-[#A3A3A3]">ACCOUNT SETTINGS</h2>
          <ul className="space-y-2">
            {SETTINGS_ITEMS.map(({ icon: Icon, title, subtitle }) => (
              <li
                key={title}
                className="flex items-center gap-4 rounded-sm border border-divider bg-surface p-4"
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-sm bg-background">
                  <Icon className="h-5 w-5 text-primary" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="font-display text-label-lg font-semibold text-[#F9FAFB]">{title}</p>
                  <p className="text-body-sm text-[#A3A3A3]">{subtitle}</p>
                </div>
                <ChevronRight className="h-5 w-5 text-divider" />
              </li>
            ))}
          </ul>
        </div>

        {/* Primary contact */}
        <div className="rounded-sm border border-divider bg-surface p-6">
          <h2 className="font-display text-label-lg font-extrabold text-primary">PRIMARY CONTACT</h2>
          <div className="mt-4 flex gap-4">
            <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-sm bg-background">
              <User className="h-6 w-6 text-[#F9FAFB]" />
            </span>
            <div className="min-w-0 flex-1">
              <p className="text-body-lg font-semibold text-[#F9FAFB]">John Doe</p>
              <p className="text-body-sm text-[#A3A3A3]">Operations Manager</p>
              <div className="mt-3 space-y-2">
                <div className="flex items-center gap-2 text-body-md text-[#F9FAFB]">
                  <Mail className="h-4 w-4 text-[#A3A3A3]" />
                  ops@jetstreamlogistics.com
                </div>
                <div className="flex items-center gap-2 text-body-md text-[#F9FAFB]">
                  <Phone className="h-4 w-4 text-[#A3A3A3]" />
                  +1 (555) 012-3456
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-4">
          <button
            type="button"
            className="w-full rounded-sm bg-primary py-4 text-body-md font-extrabold text-background"
          >
            EDIT PROFILE
          </button>
          <button
            type="button"
            className="w-full rounded-sm border border-error py-4 text-body-md font-extrabold text-error hover:bg-error/10"
          >
            SIGN OUT
          </button>
        </div>

        <div className="flex flex-col items-center gap-1 py-6">
          <p className="text-label-sm text-hint">IronFreight v2.4.0-PRO</p>
          <p className="text-label-sm text-success">Secure Chain of Custody Enabled</p>
        </div>
      </div>
    </div>
  )
}
