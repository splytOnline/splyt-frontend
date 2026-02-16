import { DashboardSidebar } from "@/components/dashboard-sidebar"
import { DashboardTopbar } from "@/components/dashboard-topbar"
import { TokensBalancesProvider, TokensBalancesLayout } from "@/contexts/tokens-balances-context"

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  // No authentication - everything is dummy

  return (
    <TokensBalancesProvider>
      <TokensBalancesLayout>
        <div className="flex h-screen bg-card flex-col">
          {/* Topbar */}
          <DashboardTopbar />

          {/* Main Content */}
          <div className="flex-1 flex flex-row overflow-hidden">
            {/* Sidebar */}
            <DashboardSidebar />
            {/* Content Area */}
            <main className="flex-1 overflow-y-auto p-8 pb-24 md:pb-8">
              <div className="max-w-3xl mx-auto space-y-6">{children}</div>
            </main>
          </div>
        </div>
      </TokensBalancesLayout>
    </TokensBalancesProvider>
  )
}
