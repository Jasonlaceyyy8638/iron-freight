'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Download, ArrowLeft } from 'lucide-react'
import { Logo } from '@/components/Logo'

/** Canonical app icon used for download page, desktop installers, and app store submissions. */
const APP_ICON = '/icons/icon-192.png'

const WINDOWS_URL = process.env.NEXT_PUBLIC_DOWNLOAD_WIN_URL || ''
const MACOS_URL = process.env.NEXT_PUBLIC_DOWNLOAD_MAC_URL || ''

export default function DownloadPage() {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <header className="flex-shrink-0 border-b border-divider bg-surface">
        <div className="flex items-center justify-between px-4 py-3 md:px-6">
          <Link href="/" className="inline-flex">
            <Logo className="text-white" />
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 rounded-lg border border-divider px-4 py-2 text-sm text-white/80 hover:bg-white/5 hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to home
          </Link>
        </div>
      </header>

      <main className="flex-1 flex flex-col items-center justify-center px-6 py-16">
        <div className="w-full max-w-lg text-center">
          <div className="inline-flex items-center justify-center rounded-2xl border border-primary/30 bg-primary/10 p-4 mb-6 ring-2 ring-primary/20">
            <Image src={APP_ICON} alt="IronFreight" width={96} height={96} className="h-20 w-20 sm:h-24 sm:w-24" priority />
          </div>
          <h1 className="font-display text-headline-lg font-bold text-white">
            Download IronFreight for desktop
          </h1>
          <p className="mt-3 text-body-md text-[#A3A3A3]">
            Run the installer and choose your installation folder. Same app as the web—verify freight, manage loads, and use the driver app from your desktop.
          </p>

          <div className="mt-10 flex flex-col sm:flex-row gap-4 justify-center">
            {WINDOWS_URL ? (
              <a
                href={WINDOWS_URL}
                download
                className="inline-flex items-center justify-center gap-3 rounded-xl border-2 border-primary bg-primary px-8 py-4 text-base font-semibold text-[#0A0A0B] transition hover:bg-primary/90"
              >
                <Download className="h-5 w-5 shrink-0" />
                Download for Windows
              </a>
            ) : (
              <div className="rounded-xl border border-divider bg-surface/50 px-8 py-4 text-center">
                <p className="text-body-sm text-[#A3A3A3]">Windows installer</p>
                <p className="mt-1 text-xs text-[#737373]">Build with: <code className="rounded bg-black/30 px-1">cd desktop && npm run dist:win</code></p>
              </div>
            )}
            {MACOS_URL ? (
              <a
                href={MACOS_URL}
                download
                className="inline-flex items-center justify-center gap-3 rounded-xl border-2 border-primary/50 bg-primary/10 px-8 py-4 text-base font-semibold text-primary transition hover:bg-primary/20"
              >
                <Download className="h-5 w-5 shrink-0" />
                Download for macOS
              </a>
            ) : null}
          </div>

          {(WINDOWS_URL || MACOS_URL) ? (
            <div className="mt-12 rounded-xl border border-divider bg-surface/30 p-6 text-left">
              <h2 className="font-display text-label-lg font-semibold text-white">After downloading</h2>
              <ul className="mt-3 space-y-2 text-body-sm text-[#A3A3A3]">
                {WINDOWS_URL ? (
                  <li><strong className="text-white">Windows:</strong> Run the .exe, choose your installation directory in the wizard, then launch IronFreight from the shortcut. If Windows shows &quot;Windows protected your PC,&quot; click <strong className="text-white">More info</strong> then <strong className="text-white">Run anyway</strong>—the app is not yet code-signed; this is normal and safe for our official installer.</li>
                ) : null}
                {MACOS_URL ? (
                  <li><strong className="text-white">macOS:</strong> Open the .dmg, drag IronFreight to Applications, then open it from Launchpad or Spotlight.</li>
                ) : null}
              </ul>
            </div>
          ) : null}

          <p className="mt-8 text-body-sm text-[#737373]">
            Prefer the browser? <Link href="/" className="text-primary hover:underline">Use IronFreight in the web app</Link>—no install required.
          </p>
        </div>
      </main>
    </div>
  )
}
