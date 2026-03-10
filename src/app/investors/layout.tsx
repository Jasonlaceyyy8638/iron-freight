import type { Metadata } from 'next'

export const metadata: Metadata = {
  title: 'For Investors | IronFreight',
  description:
    'See the IronFreight platform: how brokers, carriers, drivers, and shippers use the product to verify freight and stop double brokering.',
}

export default function InvestorsLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return children
}
