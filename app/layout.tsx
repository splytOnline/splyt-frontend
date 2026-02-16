
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers';

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Splyt',
  description: 'Splyt makes splitting bills as easy as Venmo, but using USDC on Arbitrum with zero gas fees for users.'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
      <html lang="en">
        <body className={`font-sans antialiased`}>
        <Providers>
          {children}
          </Providers>
        </body>
      </html>
  )
}
