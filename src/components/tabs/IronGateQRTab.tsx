'use client'

import { X, HelpCircle, MapPin, CheckCircle, Shield, RefreshCw, User, Truck, Building2, Info } from 'lucide-react'
import { useState, useEffect } from 'react'
import QRCode from 'qrcode'

export function IronGateQRTab() {
  const [qrDataUrl, setQrDataUrl] = useState('')
  useEffect(() => {
    QRCode.toDataURL('IRONGATE-IF-99284-' + Date.now(), { width: 200, margin: 1 }).then(setQrDataUrl)
  }, [])

  return (
    <div className="mx-auto flex max-w-[420px] flex-col pb-8">
      {/* Header */}
      <header className="flex items-center justify-between border-b border-divider px-6 py-4">
        <button type="button" className="p-1 text-[#F9FAFB]" aria-label="Close">
          <X className="h-6 w-6" />
        </button>
        <div className="flex flex-col items-center">
          <span className="font-display text-label-sm font-extrabold text-primary">IRON_GATE SECURE</span>
          <span className="text-body-sm font-semibold text-[#A3A3A3]">LOAD #IF-99284</span>
        </div>
        <button type="button" className="p-1 text-[#A3A3A3]" aria-label="Help">
          <HelpCircle className="h-[22px] w-[22px]" />
        </button>
      </header>

      {/* GPS validated */}
      <div className="mx-6 mt-6 flex items-center gap-4 rounded border border-divider bg-surface p-4">
        <span className="flex h-12 w-12 items-center justify-center rounded bg-success/22">
          <MapPin className="h-7 w-7 text-success" />
        </span>
        <div className="min-w-0 flex-1">
          <p className="font-display text-label-sm font-bold text-success">GPS VALIDATED</p>
          <p className="text-body-sm text-[#F9FAFB]">Within 150m of Shipper Dock</p>
        </div>
        <CheckCircle className="h-5 w-5 text-success" />
      </div>

      {/* QR code */}
      <div className="mt-6 px-6">
        <div className="flex flex-col items-center rounded-lg border-2 border-primary bg-surface p-8 shadow-lg">
          <div className="relative flex h-[220px] w-[220px] items-center justify-center rounded bg-white p-2">
            {qrDataUrl ? (
              <img src={qrDataUrl} alt="IronGate QR" className="h-full w-full object-contain" />
            ) : (
              <div className="h-full w-full rounded bg-gray-200 flex items-center justify-center text-black text-sm">
                QR
              </div>
            )}
            <span className="absolute flex h-10 w-10 items-center justify-center rounded border-2 border-primary bg-surface">
              <Shield className="h-8 w-8 text-primary" />
            </span>
          </div>
          <p className="mt-4 font-display text-title-md font-extrabold text-[#F9FAFB]">SCAN TO VERIFY</p>
          <p className="mt-1 font-display text-label-md text-[#A3A3A3]">Expires in 04:59</p>
        </div>
      </div>

      {/* Handshake protocol */}
      <div className="mx-6 mt-6 rounded border border-divider bg-surface p-6">
        <h3 className="font-display text-label-sm font-bold text-[#A3A3A3]">HANDSHAKE PROTOCOL</h3>
        <ul className="mt-4 space-y-4">
          {[
            { icon: User, label: 'ASSIGNED DRIVER', value: 'Marcus Thorne' },
            { icon: Truck, label: 'CARRIER', value: 'Apex Logistics Group' },
            { icon: Building2, label: 'SHIPPER DOCK', value: 'Global Port Terminal B' },
          ].map(({ icon: Icon, label, value }) => (
            <li key={label} className="flex items-center gap-4">
              <span className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded border border-divider bg-surface">
                <Icon className="h-5 w-5 text-primary" />
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-label-sm text-[#A3A3A3]">{label}</p>
                <p className="text-body-md font-semibold text-[#F9FAFB] truncate">{value}</p>
              </div>
            </li>
          ))}
        </ul>
        <div className="my-4 h-px bg-divider" />
        <div className="flex items-center justify-between">
          <div>
            <p className="text-label-sm text-[#A3A3A3]">CHAIN OF CUSTODY</p>
            <p className="text-body-sm text-[#F9FAFB]">Digital Report Pending</p>
          </div>
          <span className="rounded bg-primary/20 px-2 py-1 text-label-sm font-bold text-primary">SECURE</span>
        </div>
      </div>

      {/* Info */}
      <div className="mx-6 mt-6 rounded border border-[#333] bg-[#1A1A1A] p-4">
        <div className="flex gap-4">
          <Info className="h-5 w-5 flex-shrink-0 text-primary" />
          <p className="text-body-sm text-[#A3A3A3]" style={{ lineHeight: 1.5 }}>
            Present this code to the dock manager. Ensure they scan via the IronFreight Shipper Portal to
            authorize gate release.
          </p>
        </div>
      </div>

      <div className="mt-6 border-t border-divider px-6 pt-6">
        <button
          type="button"
          className="flex w-full items-center justify-center gap-2 rounded bg-primary py-4 font-bold text-background"
        >
          <RefreshCw className="h-5 w-5" />
          REFRESH SECURITY TOKEN
        </button>
      </div>
    </div>
  )
}
