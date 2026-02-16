"use client"

import { useState, useMemo, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Search, ArrowUpDown, Plus, Check, Wallet, Users, User } from "lucide-react"
import Image from "next/image"
import { Spinner } from "@/components/ui/spinner"
import { toast } from "sonner"
import { useTokensAndBalances } from "@/contexts/tokens-balances-context"
import { useAccount } from "wagmi"
import { ConnectWalletPrompt } from "@/components/connect-wallet-prompt"
import { usePageTitle } from "@/hooks/use-page-title"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarImage, AvatarFallback } from "@/components/ui/avatar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

type SplitStatus = "pending" | "settled" | "cancelled"
type StatusFilter = "all" | "pending" | "settled" | "cancelled"
type SortField = "date" | "totalAmount" | "yourShare" | "status"
type SortDirection = "asc" | "desc"

interface Participant {
  userId: string
  walletAddress: string
  displayName?: string
  avatar?: string
  hasSettled: boolean
  share: number
}

interface Split {
  splitId: string
  title?: string
  description?: string
  tokenIcon: string
  tokenDenom: string
  tokenNetworkIcon: string
  tokenNetwork: string
  totalAmount: number
  yourShare: number
  status: SplitStatus
  participants: Participant[]
  creator: {
    userId: string
    walletAddress: string
    displayName?: string
    avatar?: string
  }
  currentUserHasSettled: boolean
  date: string
  timestamp: number
  createdAt: string
}

interface ApiResponse {
  success: boolean
  status: number
  message: string
  data: Split[]
  pagination: {
    currentPage: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

// Helper function to mask address
const maskAddress = (address: string) => {
  if (address.length <= 10) return address
  return `${address.slice(0, 6)}...${address.slice(-4)}`
}

// Helper function to format date
const formatRelativeDate = (dateString: string): { date: string; timestamp: number } => {
  const date = new Date(dateString)
  const now = new Date()
  const diffInMs = now.getTime() - date.getTime()
  const diffInSeconds = Math.floor(diffInMs / 1000)
  const diffInMinutes = Math.floor(diffInSeconds / 60)
  const diffInHours = Math.floor(diffInMinutes / 60)
  const diffInDays = Math.floor(diffInHours / 24)
  const diffInWeeks = Math.floor(diffInDays / 7)

  let dateStr = ""
  if (diffInSeconds < 60) {
    dateStr = "just now"
  } else if (diffInMinutes < 60) {
    dateStr = `${diffInMinutes} minute${diffInMinutes !== 1 ? "s" : ""} ago`
  } else if (diffInHours < 24) {
    dateStr = `${diffInHours} hour${diffInHours !== 1 ? "s" : ""} ago`
  } else if (diffInDays < 7) {
    dateStr = `${diffInDays} day${diffInDays !== 1 ? "s" : ""} ago`
  } else if (diffInWeeks < 4) {
    dateStr = `${diffInWeeks} week${diffInWeeks !== 1 ? "s" : ""} ago`
  } else {
    dateStr = date.toLocaleDateString()
  }

  return { date: dateStr, timestamp: date.getTime() }
}

// Helper function to get status color
const getStatusColor = (status: SplitStatus) => {
  switch (status) {
    case "settled":
      return "text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-900/20"
    case "pending":
      return "text-orange-600 dark:text-orange-400 bg-orange-50 dark:bg-orange-900/20"
    case "cancelled":
      return "text-gray-600 dark:text-gray-400 bg-gray-50 dark:bg-gray-900/20"
    default:
      return "text-muted-foreground bg-muted"
  }
}

// Helper function to format status display text
const formatStatusText = (status: SplitStatus) => {
  return status.charAt(0).toUpperCase() + status.slice(1)
}

// Helper function to get initials from name or address
const getInitials = (name?: string, address?: string) => {
  if (name) {
    const parts = name.trim().split(" ")
    if (parts.length >= 2) {
      return `${parts[0][0]}${parts[parts.length - 1][0]}`.toUpperCase()
    }
    return name.substring(0, 2).toUpperCase()
  }
  if (address) {
    return address.substring(2, 4).toUpperCase()
  }
  return "??"
}

const ITEMS_PER_PAGE = 10
const CURRENT_USER_ID = "user-1" // This should come from auth context

export default function MySplitsPage() {
  const router = useRouter()
  usePageTitle("My Splits")
  const { tokensAndBalances, userData } = useTokensAndBalances()
  const { isConnected } = useAccount()
  const [searchQuery, setSearchQuery] = useState("")
  const [statusFilter, setStatusFilter] = useState<StatusFilter>("all")
  const [tokenFilter, setTokenFilter] = useState<string>("all")
  const [sortField, setSortField] = useState<SortField>("date")
  const [sortDirection, setSortDirection] = useState<SortDirection>("desc")
  const [currentPage, setCurrentPage] = useState(1)
  const [splits, setSplits] = useState<Split[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [pagination, setPagination] = useState<ApiResponse["pagination"] | null>(null)
  const [settlingSplitId, setSettlingSplitId] = useState<string | null>(null)

  // Dummy splits data
  const dummySplits: Split[] = [
    {
      splitId: "SPLIT-001",
      title: "Dinner at Restaurant",
      tokenDenom: "USDT",
      tokenIcon: "/icons/usdt.svg",
      tokenNetwork: "Arbitrum",
      tokenNetworkIcon: "/icons/arbitrum-arb-logo.svg",
      totalAmount: 150.00,
      yourShare: 50.00,
      status: "pending",
      currentUserHasSettled: false,
      participants: [
        {
          userId: "user-1",
          walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
          displayName: "You",
          avatar: userData?.avatar,
          hasSettled: false,
          share: 50.00,
        },
        {
          userId: "user-2",
          walletAddress: "0x8ba1f109551bD432803012645Hac136c22C",
          displayName: "Alice",
          avatar: "/placeholder-user.jpg",
          hasSettled: true,
          share: 50.00,
        },
        {
          userId: "user-3",
          walletAddress: "0x9cd2e35Cc6634C0532925a3b844Bc9e7595f0bEb",
          displayName: "Bob",
          hasSettled: false,
          share: 50.00,
        },
      ],
      creator: {
        userId: "user-2",
        walletAddress: "0x8ba1f109551bD432803012645Hac136c22C",
        displayName: "Alice",
        avatar: "/placeholder-user.jpg",
      },
      date: "2 hours ago",
      timestamp: Date.now() - 2 * 60 * 60 * 1000,
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
    },
    {
      splitId: "SPLIT-002",
      title: "Weekend Trip Expenses",
      tokenDenom: "USDC",
      tokenIcon: "/icons/usdc.svg",
      tokenNetwork: "Arbitrum",
      tokenNetworkIcon: "/icons/arbitrum-arb-logo.svg",
      totalAmount: 500.00,
      yourShare: 125.00,
      status: "settled",
      currentUserHasSettled: true,
      participants: [
        {
          userId: "user-1",
          walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
          displayName: "You",
          avatar: userData?.avatar,
          hasSettled: true,
          share: 125.00,
        },
        {
          userId: "user-2",
          walletAddress: "0x8ba1f109551bD432803012645Hac136c22C",
          displayName: "Alice",
          avatar: "/placeholder-user.jpg",
          hasSettled: true,
          share: 125.00,
        },
        {
          userId: "user-4",
          walletAddress: "0x1ba1f109551bD432803012645Hac136c22C",
          displayName: "Charlie",
          hasSettled: true,
          share: 125.00,
        },
        {
          userId: "user-5",
          walletAddress: "0x2ba1f109551bD432803012645Hac136c22C",
          displayName: "Diana",
          hasSettled: true,
          share: 125.00,
        },
      ],
      creator: {
        userId: "user-1",
        walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        displayName: "You",
        avatar: userData?.avatar,
      },
      date: "1 day ago",
      timestamp: Date.now() - 24 * 60 * 60 * 1000,
      createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      splitId: "SPLIT-003",
      title: "Grocery Shopping",
      tokenDenom: "USDC",
      tokenIcon: "/icons/usdc.svg",
      tokenNetwork: "Arbitrum",
      tokenNetworkIcon: "/icons/arbitrum-arb-logo.svg",
      totalAmount: 75.50,
      yourShare: 37.75,
      status: "pending",
      currentUserHasSettled: false,
      participants: [
        {
          userId: "user-1",
          walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
          displayName: "You",
          avatar: userData?.avatar,
          hasSettled: false,
          share: 37.75,
        },
        {
          userId: "user-6",
          walletAddress: "0x3ba1f109551bD432803012645Hac136c22C",
          displayName: "Eve",
          hasSettled: false,
          share: 37.75,
        },
      ],
      creator: {
        userId: "user-6",
        walletAddress: "0x3ba1f109551bD432803012645Hac136c22C",
        displayName: "Eve",
      },
      date: "3 days ago",
      timestamp: Date.now() - 3 * 24 * 60 * 60 * 1000,
      createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
    },
    {
      splitId: "SPLIT-004",
      title: "Concert Tickets",
      tokenDenom: "USDT",
      tokenIcon: "/icons/usdt.svg",
      tokenNetwork: "Arbitrum",
      tokenNetworkIcon: "/icons/arbitrum-arb-logo.svg",
      totalAmount: 200.00,
      yourShare: 66.67,
      status: "pending",
      currentUserHasSettled: false,
      participants: [
        {
          userId: "user-1",
          walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
          displayName: "You",
          avatar: userData?.avatar,
          hasSettled: false,
          share: 66.67,
        },
        {
          userId: "user-2",
          walletAddress: "0x8ba1f109551bD432803012645Hac136c22C",
          displayName: "Alice",
          avatar: "/placeholder-user.jpg",
          hasSettled: false,
          share: 66.67,
        },
        {
          userId: "user-3",
          walletAddress: "0x9cd2e35Cc6634C0532925a3b844Bc9e7595f0bEb",
          displayName: "Bob",
          hasSettled: false,
          share: 66.67,
        },
      ],
      creator: {
        userId: "user-1",
        walletAddress: "0x742d35Cc6634C0532925a3b844Bc9e7595f0bEb",
        displayName: "You",
        avatar: userData?.avatar,
      },
      date: "5 days ago",
      timestamp: Date.now() - 5 * 24 * 60 * 60 * 1000,
      createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
    },
  ]

  // Load splits data
  useEffect(() => {
    setIsLoading(true)
    setTimeout(() => {
      setSplits(dummySplits)
      setPagination({
        currentPage: 1,
        pageSize: ITEMS_PER_PAGE,
        totalCount: dummySplits.length,
        totalPages: Math.ceil(dummySplits.length / ITEMS_PER_PAGE),
        hasNextPage: false,
        hasPrevPage: false,
      })
      setIsLoading(false)
    }, 500)
  }, [currentPage])

  // Get unique tokens for filter
  const uniqueTokens = useMemo(() => {
    const tokens = new Set(splits.map((s) => s.tokenDenom))
    return Array.from(tokens)
  }, [splits])

  // Filter and sort splits
  const filteredAndSortedSplits = useMemo(() => {
    let filtered = splits.filter((split) => {
      // Search filter
      const matchesSearch =
        searchQuery === "" ||
        split.splitId.toLowerCase().includes(searchQuery.toLowerCase()) ||
        split.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        split.tokenDenom.toLowerCase().includes(searchQuery.toLowerCase()) ||
        split.tokenNetwork.toLowerCase().includes(searchQuery.toLowerCase()) ||
        split.creator.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        split.creator.walletAddress.toLowerCase().includes(searchQuery.toLowerCase()) ||
        split.participants.some(
          (p) =>
            p.displayName?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.walletAddress.toLowerCase().includes(searchQuery.toLowerCase())
        )

      // Status filter
      const matchesStatus = statusFilter === "all" || split.status === statusFilter

      // Token filter
      const matchesToken = tokenFilter === "all" || split.tokenDenom === tokenFilter

      return matchesSearch && matchesStatus && matchesToken
    })

    // Sort splits
    filtered.sort((a, b) => {
      let comparison = 0

      switch (sortField) {
        case "date":
          comparison = a.timestamp - b.timestamp
          break
        case "totalAmount":
          comparison = a.totalAmount - b.totalAmount
          break
        case "yourShare":
          comparison = a.yourShare - b.yourShare
          break
        case "status":
          comparison = a.status.localeCompare(b.status)
          break
      }

      return sortDirection === "asc" ? comparison : -comparison
    })

    return filtered
  }, [splits, searchQuery, statusFilter, tokenFilter, sortField, sortDirection])

  // Pagination
  const totalPages = pagination?.totalPages || 1
  const startIndex = (currentPage - 1) * ITEMS_PER_PAGE
  const paginatedSplits = filteredAndSortedSplits.slice(startIndex, startIndex + ITEMS_PER_PAGE)

  const handleSort = (field: SortField) => {
    if (sortField === field) {
      setSortDirection(sortDirection === "asc" ? "desc" : "asc")
    } else {
      setSortField(field)
      setSortDirection("asc")
    }
  }

  const handleSettle = async (splitId: string) => {
    setSettlingSplitId(splitId)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000))
      
      // Update the split in state
      setSplits((prevSplits) =>
        prevSplits.map((split) => {
          if (split.splitId === splitId) {
            const updatedParticipants = split.participants.map((p) =>
              p.userId === CURRENT_USER_ID ? { ...p, hasSettled: true } : p
            )
            const allSettled = updatedParticipants.every((p) => p.hasSettled)
            return {
              ...split,
              participants: updatedParticipants,
              currentUserHasSettled: true,
              status: allSettled ? "settled" : split.status,
            }
          }
          return split
        })
      )
      
      toast.success("Your share has been settled successfully!")
    } catch (error) {
      toast.error("Failed to settle. Please try again.")
    } finally {
      setSettlingSplitId(null)
    }
  }

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  // Participant Avatars Component
  const ParticipantAvatars = ({ participants, maxVisible = 3 }: { participants: Participant[]; maxVisible?: number }) => {
    const visibleParticipants = participants.slice(0, maxVisible)
    const remainingCount = participants.length - maxVisible

    return (
      <div className="flex items-center -space-x-2">
        {visibleParticipants.map((participant, index) => (
          <Popover key={participant.userId}>
            <PopoverTrigger asChild>
              <button className="relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full transition-all hover:z-10 hover:scale-110">
                <Avatar className="w-8 h-8 border-2 border-background">
                  {participant.avatar ? (
                    <AvatarImage src={participant.avatar} alt={participant.displayName || maskAddress(participant.walletAddress)} />
                  ) : null}
                  <AvatarFallback className="text-xs bg-primary/10 text-primary">
                    {getInitials(participant.displayName, participant.walletAddress)}
                  </AvatarFallback>
                </Avatar>
                {participant.hasSettled && (
                  <div className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-background flex items-center justify-center">
                    <Check className="w-1.5 h-1.5 text-white" />
                  </div>
                )}
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <Avatar className="w-10 h-10">
                    {participant.avatar ? (
                      <AvatarImage src={participant.avatar} alt={participant.displayName || maskAddress(participant.walletAddress)} />
                    ) : null}
                    <AvatarFallback className="text-sm bg-primary/10 text-primary">
                      {getInitials(participant.displayName, participant.walletAddress)}
                    </AvatarFallback>
                  </Avatar>
                  <div className="flex-1 min-w-0">
                    <div className="font-medium text-sm truncate">
                      {participant.displayName || "Unknown"}
                    </div>
                    <div className="text-xs text-muted-foreground font-mono truncate">
                      {maskAddress(participant.walletAddress)}
                    </div>
                  </div>
                  {participant.hasSettled && (
                    <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                      <Check className="w-3 h-3" />
                      <span>Paid</span>
                    </div>
                  )}
                </div>
                <div className="pt-2 border-t border-border">
                  <div className="text-xs text-muted-foreground">Share</div>
                  <div className="text-sm font-semibold font-mono">
                    {participant.share.toLocaleString(undefined, {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 8,
                    })}
                  </div>
                </div>
              </div>
            </PopoverContent>
          </Popover>
        ))}
        {remainingCount > 0 && (
          <Popover>
            <PopoverTrigger asChild>
              <button className="relative focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full transition-all hover:z-10 hover:scale-110">
                <Avatar className="w-8 h-8 border-2 border-background bg-muted">
                  <AvatarFallback className="text-xs font-medium">
                    +{remainingCount}
                  </AvatarFallback>
                </Avatar>
              </button>
            </PopoverTrigger>
            <PopoverContent className="w-64 p-3 max-h-80 overflow-y-auto">
              <div className="space-y-2">
                <div className="text-xs font-medium text-muted-foreground mb-2">More Participants</div>
                {participants.slice(maxVisible).map((participant) => (
                  <div key={participant.userId} className="flex items-center gap-3 py-2 border-b border-border last:border-0">
                    <Avatar className="w-8 h-8">
                      {participant.avatar ? (
                        <AvatarImage src={participant.avatar} alt={participant.displayName || maskAddress(participant.walletAddress)} />
                      ) : null}
                      <AvatarFallback className="text-xs bg-primary/10 text-primary">
                        {getInitials(participant.displayName, participant.walletAddress)}
                      </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm truncate">
                        {participant.displayName || "Unknown"}
                      </div>
                      <div className="text-xs text-muted-foreground font-mono truncate">
                        {maskAddress(participant.walletAddress)}
                      </div>
                    </div>
                    {participant.hasSettled && (
                      <div className="flex items-center gap-1 text-xs text-emerald-600 dark:text-emerald-400">
                        <Check className="w-3 h-3" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </PopoverContent>
          </Popover>
        )}
      </div>
    )
  }

  // Connect Wallet Component
  if (!isConnected) {
    return <ConnectWalletPrompt />
  }

  return (
    <div className="space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-semibold text-foreground">My Splits</h1>
          <p className="text-sm text-muted-foreground mt-1">
            View, manage, and settle your shared expenses
          </p>
        </div>
        <Button onClick={() => router.push("/create-split")} className="flex items-center gap-2">
          <Plus className="w-4 h-4" />
          Create Split
        </Button>
      </div>

      {/* Filters and Search */}
      <div className="bg-card rounded-lg border border-border p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-4">
          {/* Search */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <Input
              placeholder="Search by split ID, title, token, creator, or participant..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9"
            />
          </div>

          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(value) => setStatusFilter(value as StatusFilter)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="settled">Settled</SelectItem>
              <SelectItem value="cancelled">Cancelled</SelectItem>
            </SelectContent>
          </Select>

          {/* Token Filter */}
          <Select
            value={tokenFilter}
            onValueChange={(value) => setTokenFilter(value)}
          >
            <SelectTrigger className="w-full sm:w-[180px]">
              <SelectValue placeholder="Filter by token" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Tokens</SelectItem>
              {uniqueTokens.map((token) => (
                <SelectItem key={token} value={token}>
                  {token}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Results count */}
        <div className="text-sm text-muted-foreground">
          {isLoading ? (
            "Loading splits..."
          ) : (
            <>
              Showing {filteredAndSortedSplits.length} split
              {filteredAndSortedSplits.length !== 1 ? "s" : ""}
              {pagination && ` (${pagination.totalCount} total)`}
            </>
          )}
        </div>
      </div>

      {/* Splits Table */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        {isLoading ? (
          <div className="flex items-center justify-center py-12">
            <Spinner className="w-6 h-6" />
          </div>
        ) : (
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 -ml-2"
                    onClick={() => handleSort("totalAmount")}
                  >
                    Total Amount
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 -ml-2"
                    onClick={() => handleSort("yourShare")}
                  >
                    Your Share
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 -ml-2"
                    onClick={() => handleSort("status")}
                  >
                    Status
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead>Participants</TableHead>
                <TableHead>Creator</TableHead>
                <TableHead>
                  <Button
                    variant="ghost"
                    size="sm"
                    className="h-8 px-2 -ml-2"
                    onClick={() => handleSort("date")}
                  >
                    Date
                    <ArrowUpDown className="ml-2 h-3 w-3" />
                  </Button>
                </TableHead>
                <TableHead className="w-32">Action</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {paginatedSplits.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                    No splits found
                  </TableCell>
                </TableRow>
              ) : (
                paginatedSplits.map((split) => (
                  <TableRow key={split.splitId}>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <div className="relative">
                          <Image
                            src={split.tokenIcon}
                            alt={split.tokenDenom}
                            width={20}
                            height={20}
                            className="w-5 h-5"
                          />
                          {split.tokenNetworkIcon && (
                            <Image
                              src={split.tokenNetworkIcon}
                              alt={split.tokenNetwork}
                              width={10}
                              height={10}
                              className="absolute -top-1 -right-1 w-2.5 h-2.5 rounded-full border border-white"
                            />
                          )}
                        </div>
                        <div className="flex flex-col">
                          <span className="font-semibold font-mono text-foreground">
                            {split.totalAmount.toLocaleString(undefined, {
                              minimumFractionDigits: 2,
                              maximumFractionDigits: 8,
                            })}{" "}
                            {split.tokenDenom}
                          </span>
                          {split.title && (
                            <span className="text-xs text-muted-foreground truncate max-w-[200px]">
                              {split.title}
                            </span>
                          )}
                        </div>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-1">
                        <span className="font-semibold font-mono text-foreground">
                          {split.yourShare.toLocaleString(undefined, {
                            minimumFractionDigits: 2,
                            maximumFractionDigits: 8,
                          })}{" "}
                          {split.tokenDenom}
                        </span>
                        <span className="text-xs text-muted-foreground">
                          {((split.yourShare / split.totalAmount) * 100).toFixed(1)}% of total
                        </span>
                      </div>
                    </TableCell>
                    <TableCell>
                      <span
                        className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(
                          split.status
                        )}`}
                      >
                        {formatStatusText(split.status)}
                      </span>
                    </TableCell>
                    <TableCell>
                      <ParticipantAvatars participants={split.participants} />
                    </TableCell>
                    <TableCell>
                      <Popover>
                        <PopoverTrigger asChild>
                          <button className="flex items-center gap-2 hover:opacity-80 transition-opacity focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-md p-1 -ml-1">
                            <Avatar className="w-6 h-6">
                              {split.creator.avatar ? (
                                <AvatarImage src={split.creator.avatar} alt={split.creator.displayName || maskAddress(split.creator.walletAddress)} />
                              ) : null}
                              <AvatarFallback className="text-xs bg-primary/10 text-primary">
                                {getInitials(split.creator.displayName, split.creator.walletAddress)}
                              </AvatarFallback>
                            </Avatar>
                            <span className="text-sm font-medium truncate max-w-[120px]">
                              {split.creator.displayName || maskAddress(split.creator.walletAddress)}
                            </span>
                          </button>
                        </PopoverTrigger>
                        <PopoverContent className="w-64 p-3">
                          <div className="space-y-2">
                            <div className="flex items-center gap-3">
                              <Avatar className="w-10 h-10">
                                {split.creator.avatar ? (
                                  <AvatarImage src={split.creator.avatar} alt={split.creator.displayName || maskAddress(split.creator.walletAddress)} />
                                ) : null}
                                <AvatarFallback className="text-sm bg-primary/10 text-primary">
                                  {getInitials(split.creator.displayName, split.creator.walletAddress)}
                                </AvatarFallback>
                              </Avatar>
                              <div className="flex-1 min-w-0">
                                <div className="font-medium text-sm truncate">
                                  {split.creator.displayName || "Unknown"}
                                </div>
                                <div className="text-xs text-muted-foreground font-mono truncate">
                                  {maskAddress(split.creator.walletAddress)}
                                </div>
                              </div>
                            </div>
                            <div className="pt-2 border-t border-border">
                              <div className="text-xs text-muted-foreground">Creator</div>
                            </div>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </TableCell>
                    <TableCell>
                      <span className="text-sm text-muted-foreground">{split.date}</span>
                    </TableCell>
                    <TableCell>
                      {split.currentUserHasSettled ? (
                        <div className="flex items-center gap-1.5 text-xs text-emerald-600 dark:text-emerald-400">
                          <Check className="w-3.5 h-3.5" />
                          <span className="font-medium">Paid</span>
                        </div>
                      ) : split.status === "pending" ? (
                        <Button
                          size="sm"
                          onClick={() => handleSettle(split.splitId)}
                          disabled={settlingSplitId === split.splitId}
                          className="h-8 text-xs"
                        >
                          {settlingSplitId === split.splitId ? (
                            <>
                              <Spinner className="w-3 h-3 mr-1.5" />
                              Settling...
                            </>
                          ) : (
                            "Settle"
                          )}
                        </Button>
                      ) : (
                        <span className="text-xs text-muted-foreground">-</span>
                      )}
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <div className="border-t border-border p-4">
            <Pagination>
              <PaginationContent>
                <PaginationItem>
                  <PaginationPrevious
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage > 1) {
                        handlePageChange(currentPage - 1)
                      }
                    }}
                    className={currentPage === 1 ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>

                {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => {
                  if (
                    page === 1 ||
                    page === totalPages ||
                    (page >= currentPage - 1 && page <= currentPage + 1)
                  ) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationLink
                          href="#"
                          onClick={(e) => {
                            e.preventDefault()
                            handlePageChange(page)
                          }}
                          isActive={currentPage === page}
                        >
                          {page}
                        </PaginationLink>
                      </PaginationItem>
                    )
                  } else if (page === currentPage - 2 || page === currentPage + 2) {
                    return (
                      <PaginationItem key={page}>
                        <PaginationEllipsis />
                      </PaginationItem>
                    )
                  }
                  return null
                })}

                <PaginationItem>
                  <PaginationNext
                    href="#"
                    onClick={(e) => {
                      e.preventDefault()
                      if (currentPage < totalPages) {
                        handlePageChange(currentPage + 1)
                      }
                    }}
                    className={currentPage === totalPages ? "pointer-events-none opacity-50" : ""}
                  />
                </PaginationItem>
              </PaginationContent>
            </Pagination>
          </div>
        )}
      </div>
    </div>
  )
}
