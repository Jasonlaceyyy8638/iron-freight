import type { Metadata } from 'next'
import { Inter, Space_Grotesk } from 'next/font/google'
import './globals.css'
import { Footer } from '@/components/Footer'
import { AuthSync } from '@/components/AuthSync'
import { RegisterSW } from '@/components/RegisterSW'

const inter = Inter({ subsets: ['latin'], variable: '--font-inter' })
const spaceGrotesk = Space_Grotesk({ subsets: ['latin'], variable: '--font-space-grotesk' })

export const metadata: Metadata = {
  title: 'IronFreight – The Ironclad Shield Against Double Brokering',
  description: 'Prevent double brokering. Secure freight verification and IronFreight identity protection.',
  manifest: '/manifest.json',
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
