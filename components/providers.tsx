"use client"

import { ThemeProvider } from "@/components/theme-provider"
import { Toaster } from "@/components/ui/sonner"
import { WalletProvider } from "@/components/wallet-provider"
import { PageTitle } from "@/components/page-title"

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <WalletProvider>
      <ThemeProvider attribute="class" defaultTheme="light" disableTransitionOnChange>
        <PageTitle />
        {children}
        <Toaster />
      </ThemeProvider>
    </WalletProvider>
  )
}
