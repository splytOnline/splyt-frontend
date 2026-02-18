
import type { Metadata } from 'next'
import { Geist, Geist_Mono } from 'next/font/google'
import './globals.css'
import { Providers } from '@/components/providers';
import { ComingSoonWrapper } from '@/components/coming-soon-wrapper';

const _geist = Geist({ subsets: ["latin"] });
const _geistMono = Geist_Mono({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: 'Splyt',
  description: 'Splyt makes splitting bills as easy as Venmo, but using USDC  with zero gas fees for users.'
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
      <html lang="en">
        <body className={`font-sans antialiased`}>
        <ComingSoonWrapper>
          <Providers>
            {children}
          </Providers>
        </ComingSoonWrapper>
        </body>
      </html>
  )
}
