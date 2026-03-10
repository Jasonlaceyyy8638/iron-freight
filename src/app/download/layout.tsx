import type { Metadata } from 'next'

/** App icon used for download page, desktop installers, PWA, and app store submissions. */
const APP_ICON = '/icons/icon-192.png'
const APP_ICON_LARGE = '/icons/icon-512.png'
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://getironfreight.com'
const BASE = SITE_URL.replace(/\/$/, '')

export const metadata: Metadata = {
  title: 'Download IronFreight for desktop',
  description: 'Download the IronFreight desktop app for Windows and macOS. Secure freight verification and identity protection.',
  openGraph: {
    title: 'Download IronFreight for desktop',
    description: 'Download the IronFreight desktop app for Windows and macOS.',
    url: `${BASE}/download`,
    siteName: 'IronFreight',
    images: [{ url: `${BASE}${APP_ICON_LARGE}`, width: 512, height: 512, alt: 'IronFreight' }],
  },
  twitter: {
    card: 'summary',
    title: 'Download IronFreight for desktop',
    description: 'Download the IronFreight desktop app for Windows and macOS.',
    images: [`${BASE}${APP_ICON_LARGE}`],
  },
  icons: {
    icon: APP_ICON,
    apple: APP_ICON,
  },
}

export default function DownloadLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
