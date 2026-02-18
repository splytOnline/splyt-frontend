"use client"

import { useState, useEffect, useRef } from "react"
import { ChevronDown, Sun, Moon, Wallet, Copy, Check } from "lucide-react"
import { useTheme } from "next-themes"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Popover, PopoverTrigger, PopoverContent } from "@/components/ui/popover"
import { Spinner } from "@/components/ui/spinner"
import Link from "next/link"
import { useTokensAndBalances } from "@/contexts/tokens-balances-context"
import Image from "next/image"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import { useAccount, useDisconnect, useSignMessage, useChainId, useSwitchChain, useConfig } from "wagmi"
import { arbitrumSepolia } from "wagmi/chains"
import { toast } from "sonner"


export function DashboardTopbar() {
  const { theme, setTheme } = useTheme()
  const { tokensAndBalances } = useTokensAndBalances()
  const { address, isConnected } = useAccount()
  const { disconnect } = useDisconnect()
  const { signMessageAsync } = useSignMessage()
  const chainId = useChainId()
  const { switchChain } = useSwitchChain()
  const config = useConfig()
  const [displayName, setDisplayName] = useState<string>("")
  const [copied, setCopied] = useState(false)
  const [isAuthenticating, setIsAuthenticating] = useState(false)
  const hasAuthenticatedRef = useRef<string | null>(null)
  const hasCheckedChainRef = useRef(false)
  const [currentQuote, setCurrentQuote] = useState(0)

  // Cool quotes for authentication
  const quotes = [
    "Splitting bills just got easier...",
    "Your wallet, your way...",
    "Zero gas fees, maximum convenience...",
    "Welcome to the future of bill splitting...",
    "Connecting you to seamless payments...",
  ]

  // Rotate quotes during authentication
  useEffect(() => {
    if (!isAuthenticating) return

    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % quotes.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [isAuthenticating, quotes.length])

  // Handle chain switching to Arbitrum Sepolia
  useEffect(() => {
    const ensureCorrectChain = async () => {
      if (!isConnected || hasCheckedChainRef.current) {
        return
      }

      const targetChainId = arbitrumSepolia.id

      if (chainId !== targetChainId) {
        hasCheckedChainRef.current = true
        try {
          // Try to switch to Arbitrum Sepolia
          await switchChain({ chainId: targetChainId })
          toast.success("Switched to Arbitrum Sepolia")
        } catch (error: any) {
          // If switch fails, try to add the chain using connector
          if (error?.code === 4902 || error?.message?.includes("not added") || error?.message?.includes("Unrecognized chain")) {
            try {
              // Get the active connector from config
              const current = config.state.current
              if (current) {
                const connection = config.state.connections.get(current)
                if (connection) {
                  const connectors = config.connectors
                  const activeConnector = connectors.find(c => c.id === connection.connector.id)
                  
                  // Use connector's addChain method if available
                  if (activeConnector && typeof (activeConnector as any).addChain === 'function') {
                    await (activeConnector as any).addChain(arbitrumSepolia)
                    toast.success("Arbitrum Sepolia added to wallet")
                  } else {
                    // Most wallets will prompt automatically, but show fallback message
                    toast.error("Please add Arbitrum Sepolia network to your wallet")
                  }
                } else {
                  toast.error("Please add Arbitrum Sepolia network to your wallet")
                }
              } else {
                toast.error("Please add Arbitrum Sepolia network to your wallet")
              }
            } catch (addError) {
              console.error("Failed to add chain:", addError)
              toast.error("Please add Arbitrum Sepolia network to your wallet")
            }
          } else {
            console.error("Failed to switch chain:", error)
            toast.error("Please switch to Arbitrum Sepolia network")
          }
        }
      } else {
        hasCheckedChainRef.current = true
      }
    }

    ensureCorrectChain()
  }, [isConnected, chainId, switchChain, config])

  // Reset chain check when wallet disconnects
  useEffect(() => {
    if (!isConnected) {
      hasCheckedChainRef.current = false
    }
  }, [isConnected])

  // Handle wallet connection - request signature and authenticate
  useEffect(() => {
    const authenticateWallet = async () => {
      if (!isConnected || !address) {
        return
      }

      // Wait for correct chain before authenticating
      if (chainId !== arbitrumSepolia.id) {
        return
      }

      // If already authenticated for this address, skip
      if (hasAuthenticatedRef.current === address || isAuthenticating) {
        return
      }

      setIsAuthenticating(true)
      hasAuthenticatedRef.current = address

      try {
        // Request signature with dynamic timestamp
        const message = `Welcome to Splyt!

Sign this message to authenticate and access your account.

This signature proves you own this wallet and allows secure access to your Splyt account.

Platform: Splyt - Split Bills, Settle Instantly`

        const signature = await signMessageAsync({
          message: message,
        })

        // Call auth API
        const response = await fetch("/api/auth", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            walletAddress: address,
            signature: signature,
          }),
        })

        const data = await response.json()

        if (response.status !== 200) {
          // If API fails and wallet is connected, disconnect wallet
          disconnect()
          toast.error(data.message || "Authentication failed. Please try again.")
          hasAuthenticatedRef.current = null
          setDisplayName("")
          return
        }

        // Store display name from API response
        if (data.success && data.data?.displayName) {
          setDisplayName(data.data.displayName)
          toast.success("Wallet authenticated successfully!")
        }
      } catch (error: any) {
        console.error("Authentication error:", error)
        // If error occurs and wallet is connected, disconnect wallet
        disconnect()
        toast.error(error.message || "Failed to authenticate. Please try again.")
        hasAuthenticatedRef.current = null
        setDisplayName("")
      } finally {
        setIsAuthenticating(false)
      }
    }

    authenticateWallet()
  }, [isConnected, address, chainId, signMessageAsync, disconnect])

  // Handle wallet disconnection - call logout API
  useEffect(() => {
    const handleLogout = async () => {
      if (!isConnected && hasAuthenticatedRef.current) {
        try {
          await fetch("/api/auth/logout", {
            method: "GET",
          })
        } catch (error) {
          console.error("Logout error:", error)
        } finally {
          setDisplayName("")
          hasAuthenticatedRef.current = null
        }
      }
    }

    handleLogout()
  }, [isConnected])

  const handleCopyAddress = async () => {
    if (address) {
      await navigator.clipboard.writeText(address)
      setCopied(true)
      toast.success("Address copied to clipboard")
      setTimeout(() => setCopied(false), 2000)
    }
  }

  const handleDisconnect = async () => {
    try {
      // Call logout API before disconnecting
      await fetch("/api/auth/logout", {
        method: "GET",
      })
    } catch (error) {
      console.error("Logout error:", error)
    } finally {
      disconnect()
      setDisplayName("")
      hasAuthenticatedRef.current = null
      toast.success("Wallet disconnected")
    }
  }

  const maskAddress = (address: string) => {
    if (!address) return ""
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  return (
    <>
      {/* Authentication Overlay */}
      {isAuthenticating && (
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-background/80 backdrop-blur-md animate-in fade-in duration-300">
          <div className="flex flex-col items-center gap-8 px-6">
            {/* Spinner with animated rings */}
            <div className="relative">
              {/* Outer pulsing ring */}
              <div className="absolute inset-0 rounded-full bg-primary/10 animate-ping"></div>
              {/* Middle ring */}
              <div className="absolute inset-0 rounded-full bg-primary/20 animate-pulse"></div>
              {/* Inner spinner container */}
              <div className="relative rounded-full bg-card p-8 shadow-2xl border-2 border-primary/30 backdrop-blur-sm">
                <Spinner className="w-16 h-16 text-primary" />
              </div>
            </div>
            
            {/* Quote with fade animation */}
            <div className="text-center space-y-3 max-w-md">
              <p 
                key={currentQuote}
                className="text-xl font-semibold text-foreground transition-all duration-700 ease-in-out"
                style={{
                  opacity: 1,
                  transform: 'translateY(0)',
                }}
              >
                {quotes[currentQuote]}
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary animate-pulse"></div>
                <p className="text-sm text-muted-foreground">
                  Please sign the message in your wallet
                </p>
                <div className="h-1 w-1 rounded-full bg-primary animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      )}

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
                              {displayName ? displayName.split(" ").map((n: string) => n[0]).join("").toUpperCase().slice(0, 2) : "??"}
                            </AvatarFallback>
                          </Avatar>
                          <span className="text-sm font-medium text-foreground">
                            {isAuthenticating ? "Authenticating..." : (displayName || maskAddress(account.address))}
                          </span>
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
                            {displayName && (
                              <div className="text-xs text-muted-foreground">
                                Display Name: <span className="font-medium text-foreground">{displayName}</span>
                              </div>
                            )}
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
    </>
  )
}
