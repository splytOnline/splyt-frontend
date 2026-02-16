"use client"

import { useState, useEffect } from "react"
import { ChevronDown, Sun, Moon, Wallet, Copy, Check } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import Link from "next/link"
import { useTokensAndBalances } from "@/contexts/tokens-balances-context"
import Image from "next/image"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount, useDisconnect } from "wagmi"
import { generateNameFromAddress } from "@/lib/random-name"
import { toast } from "sonner"

export function DashboardTopbar() {
  const { theme, setTheme } = useTheme()
  const { tokensAndBalances } = useTokensAndBalances()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const [randomName, setRandomName] = useState<string>("")
  const [copied, setCopied] = useState(false)

  useEffect(() => {
    if (isConnected && address) {
      setRandomName(generateNameFromAddress(address))
    }
  }, [isConnected, address])

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      toast.success("Address copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDisconnect = () => {
    disconnect()
    setRandomName("")
    toast.success("Wallet disconnected")
  }

  const maskAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <header className="bg-card border-b border-border">
    

      {/* Main Header */}
      <div className="h-16 flex items-center justify-between px-6">
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2">
        <Image
            src="/split_logo_text.svg"
            alt="Papillae"
            width={120}
            height={60}
            className="w-14 h-12 dark:invert dark:brightness-0"
          />


        </Link>


      <div className="flex items-center gap-4">
        {/* Theme Switch */}
        <Button
          variant="ghost"
          size="icon"
          className="h-10 w-10"
          onClick={() => setTheme(theme === "dark" ? "light" : "dark")}
        >
          <Sun className="h-5 w-5 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
          <Moon className="absolute h-5 w-5 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100" />
          <span className="sr-only">Toggle theme</span>
        </Button>

        {/* Wallet Connect */}
        <ConnectButton.Custom>
          {({
            account,
            chain,
            openAccountModal,
            openChainModal,
            openConnectModal,
            authenticationStatus,
            mounted,
          }) => {
            const ready = mounted && authenticationStatus !== 'loading'
            const connected =
              ready &&
              account &&
              chain &&
              (!authenticationStatus ||
                authenticationStatus === 'authenticated')

            return (
              <div
                {...(!ready && {
                  'aria-hidden': true,
                  'style': {
                    opacity: 0,
                    pointerEvents: 'none',
                    userSelect: 'none',
                  },
                })}
              >
                {(() => {
                  if (!connected) {
                    return (
                      <Button
                        onClick={openConnectModal}
                        className="flex items-center gap-2"
                      >
                        <Wallet className="w-4 h-4" />
                        Connect Wallet
                      </Button>
                    )
                  }

                  return (
                    <Popover>
                      <PopoverTrigger asChild>
                        <Button variant="ghost" className="flex items-center gap-2 h-10 px-2 hover:bg-neutral-100/50">
                          <Avatar className="w-8 h-8">
                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                              {randomName ? randomName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "??"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-foreground">{randomName || maskAddress(account.address)}</span>
                          <ChevronDown className="w-4 h-4 text-muted-foreground" />
                        </Button>
                      </PopoverTrigger>
                      <PopoverContent className="w-72 p-3" align="end">
                        <div className="flex flex-col gap-3">
                          <div className="space-y-2">
                            <div className="text-xs text-muted-foreground">Connected Wallet</div>
                            <div className="flex items-center gap-2 p-2 rounded-lg bg-muted/50 border border-border">
                              <Wallet className="w-4 h-4 text-muted-foreground" />
                              <span className="font-mono text-sm flex-1 truncate">{address}</span>
                              <Button
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7"
                                onClick={handleCopyAddress}
                              >
                                {copied ? (
                                  <Check className="w-3.5 h-3.5 text-emerald-600" />
                                ) : (
                                  <Copy className="w-3.5 h-3.5" />
                                )}
                              </Button>
                            </div>
                            <div className="text-xs text-muted-foreground">
                              Display Name: <span className="font-medium text-foreground">{randomName}</span>
                            </div>
                          </div>
                          <Button
                            variant="ghost"
                            className="w-full justify-start gap-2 h-9 px-3 text-red-600 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-950/20"
                            onClick={handleDisconnect}
                          >
                            <Wallet className="w-4 h-4" />
                            <span>Disconnect</span>
                          </Button>
                        </div>
                      </PopoverContent>
                    </Popover>
                  )
                })()}
              </div>
            )
          }}
        </ConnectButton.Custom>
      </div>
    </div>

    </header>
  )
}
