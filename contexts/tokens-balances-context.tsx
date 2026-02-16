"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"

type TokenBalance = {
  tokenId: string
  tokenDenom: string
  tokenNetwork: string
  tokenIcon: string
  networkIcon: string
  depositProvider: string
  minDeposit: number
  maxDeposit: number
  balance: number
  tokenPrice: {
    inr: number
    usd: number
  }
  totalValue: {
    inr: number
    usd: number
  }
}

type UserData = {
  displayName: string
  email: string
  avatar?: string
}

interface TokensBalancesContextType {
  tokensAndBalances: TokenBalance[] | null
  userData: UserData | null
  isLoading: boolean
}

const TokensBalancesContext = createContext<TokensBalancesContextType | undefined>(undefined)

// Dummy data - USDT, USDC, Bitcoin, and APT on Aptos network
const dummyTokensAndBalances: TokenBalance[] = [
  {
    tokenId: "usdt-aptos",
    tokenDenom: "USDT",
    tokenNetwork: "Aptos",
    tokenIcon: "/icons/usdt.svg",
    networkIcon: "/icons/aptos.svg",
    depositProvider: "aptos",
    minDeposit: 10,
    maxDeposit: 100000,
    balance: 1250.50,
    tokenPrice: {
      inr: 83.25,
      usd: 1.00
    },
    totalValue: {
      inr: 104206.13,
      usd: 1250.50
    }
  },
  {
    tokenId: "usdc-aptos",
    tokenDenom: "USDC",
    tokenNetwork: "Aptos",
    tokenIcon: "/icons/usdc.svg",
    networkIcon: "/icons/aptos.svg",
    depositProvider: "aptos",
    minDeposit: 10,
    maxDeposit: 100000,
    balance: 850.25,
    tokenPrice: {
      inr: 83.25,
      usd: 1.00
    },
    totalValue: {
      inr: 70858.31,
      usd: 850.25
    }
  },
  {
    tokenId: "btc-aptos",
    tokenDenom: "Bitcoin",
    tokenNetwork: "Aptos",
    tokenIcon: "/icons/btc.svg",
    networkIcon: "/icons/aptos.svg",
    depositProvider: "aptos",
    minDeposit: 0.001,
    maxDeposit: 10,
    balance: 0.5,
    tokenPrice: {
      inr: 6900000.00,
      usd: 83000.00
    },
    totalValue: {
      inr: 3450000.00,
      usd: 41500.00
    }
  },
  {
    tokenId: "apt-aptos",
    tokenDenom: "APT",
    tokenNetwork: "Aptos",
    tokenIcon: "/icons/aptos.svg",
    networkIcon: "/icons/aptos.svg",
    depositProvider: "aptos",
    minDeposit: 1,
    maxDeposit: 50000,
    balance: 150.75,
    tokenPrice: {
      inr: 1200.00,
      usd: 14.50
    },
    totalValue: {
      inr: 180900.00,
      usd: 2185.88
    }
  }
]

const dummyUserData: UserData = {
  displayName: "John Doe",
  email: "john.doe@example.com",
  avatar: "/placeholder-user.jpg"
}

export function TokensBalancesProvider({ children }: { children: ReactNode }) {
  // Initialize with dummy data immediately - no loading state needed
  const [tokensAndBalances] = useState<TokenBalance[] | null>(dummyTokensAndBalances)
  const [userData] = useState<UserData | null>(dummyUserData)
  const [isLoading] = useState(false)

  // Keep useEffect for any future updates, but data is already available
  useEffect(() => {
    // Dummy data is already set in useState initialization
  }, [])

  return (
    <TokensBalancesContext.Provider value={{ tokensAndBalances, userData, isLoading }}>
      {children}
    </TokensBalancesContext.Provider>
  )
}

export function useTokensAndBalances() {
  const context = useContext(TokensBalancesContext)
  if (context === undefined) {
    throw new Error("useTokensAndBalances must be used within a TokensBalancesProvider")
  }
  return context
}

export function TokensBalancesLayout({ children }: { children: ReactNode }) {
  return <>{children}</>
}
