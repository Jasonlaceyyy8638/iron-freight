import type { Metadata } from 'next'
import { DriverPWA } from '@/components/DriverPWA'

export const metadata: Metadata = {
  title: 'IronFreight Driver',
  description: 'View your assigned load and show IronGate QR for verification',
  themeColor: '#C1FF00',
  viewport: { width: 'device-width', initialScale: 1, maximumScale: 1, userScalable: false },
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
