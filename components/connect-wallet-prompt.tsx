"use client"

import { Wallet } from "lucide-react"
import { Button } from "@/components/ui/button"
import { ConnectButton } from "@rainbow-me/rainbowkit"
import Image from "next/image"

export function ConnectWalletPrompt() {
  return (
    <div className="flex items-center justify-center min-h-[60vh] px-4">
      <div className="w-full max-w-md space-y-8">
        {/* Icon */}
        <div className="flex justify-center">
          <div className="w-16 h-16 rounded-full bg-muted flex items-center justify-center border border-border">
            <Wallet className="w-8 h-8 text-foreground" />
          </div>
        </div>

        {/* Title and Description */}
        <div className="text-center space-y-3">
          <h2 className="text-2xl font-semibold text-foreground">
            Connect Your Wallet
          </h2>
          <p className="text-sm text-muted-foreground">
            Split bills seamlessly <span className="text-foreground">•</span> Settle instantly <span className="text-foreground">•</span> Zero gas fees
          </p>
        </div>

        {/* Connect Button */}
        <div>
          <ConnectButton.Custom>
            {({ openConnectModal }) => (
              <Button
                onClick={openConnectModal}
                size="lg"
                className="w-full h-11"
              >
                <Wallet className="w-4 h-4 mr-2" />
                Connect Wallet
              </Button>
            )}
          </ConnectButton.Custom>
        </div>

        {/* Network Badge */}
        <div className="flex items-center justify-center gap-1.5 text-xs text-muted-foreground">
          <Image
            src="/icons/arbitrum-arb-logo.svg"
            alt="Arbitrum"
            width={14}
            height={14}
            className="w-3.5 h-3.5"
          />
          <span>Powered by Arbitrum Sepolia</span>
        </div>
      </div>
    </div>
  )
}
