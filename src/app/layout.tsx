import type { Metadata, Viewport } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Footer } from '@/components/Footer'
import { AuthSync } from '@/components/AuthSync'
import { RegisterSW } from '@/components/RegisterSW'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

export const metadata: Metadata = {
  title: 'IronFreight – Verify Carriers. Confirm Drivers. Protect Freight.',
  description: 'Secure freight verification and identity protection. Verify the real carrier, confirm driver identity at the dock, prove custody transfer—and stop double brokering.',
  manifest: '/manifest.json',
}

export const viewport: Viewport = {
  themeColor: '#C1FF00',
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" className="dark">
      <body className={`${inter.variable} ${spaceGrotesk.variable} min-h-screen bg-background text-[#F9FAFB] font-sans antialiased`}>
        <RegisterSW />
        <AuthSync>
          <div className="min-h-screen flex flex-col">
            <div className="flex-1">{children}</div>
            <Footer />
          </div>
        </AuthSync>
      </body>
    </html>
  )
}
