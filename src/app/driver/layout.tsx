import type { Metadata, Viewport } from 'next'
import { DriverPWA } from '@/components/DriverPWA'

export const metadata: Metadata = {
  title: 'IronFreight Driver',
  description: 'View your assigned load and show IronGate QR for verification',
}

export const viewport: Viewport = {
  themeColor: '#C1FF00',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 1,
  userScalable: false,
}

export default function DriverLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <DriverPWA />
      {children}
    </>
  )
}
