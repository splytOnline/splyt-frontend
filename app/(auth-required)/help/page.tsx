"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { HelpCircle, MessageSquare, Plus, Search, Clock, CheckCircle2, XCircle, AlertCircle, Upload, X, Lightbulb, Shield, Wallet, ArrowRight, TrendingUp, Zap, BookOpen, Sparkles, ChevronDown, Filter, Calendar, Tag, FileText, Image as ImageIcon, CheckCircle } from "lucide-react"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Pagination, PaginationContent, PaginationItem, PaginationLink, PaginationNext, PaginationPrevious, PaginationEllipsis } from "@/components/ui/pagination"
import { Spinner } from "@/components/ui/spinner"

// Mock FAQ data
const faqData = {
  "Getting Started": {
    "Account Setup": [
      {
        question: "How do I create an account?",
        answer: "To create an account, click on the 'Sign Up' button on the login page. You can sign up using your Google or GitHub account, or create an account with your email address. Follow the on-screen instructions to complete the registration process."
      },
      {
        question: "How do I verify my email?",
        answer: "After signing up, you'll receive a verification email. Click on the verification link in the email to verify your account. If you didn't receive the email, check your spam folder or request a new verification email from your profile settings."
      },
      {
        question: "What is two-factor authentication (2FA)?",
        answer: "Two-factor authentication adds an extra layer of security to your account. When enabled, you'll need to enter a code from your authenticator app in addition to your password when logging in. You can enable 2FA from your profile settings under the Security section."
      }
    ],
    "First Steps": [
      {
        question: "How do I deposit tokens?",
        answer: "To deposit tokens, navigate to the 'Deposits' page from the sidebar. Select the token you want to deposit, enter the amount, and follow the instructions to generate a deposit address. Send your tokens to the provided address."
      },
      {
        question: "How long do deposits take?",
        answer: "Deposit times vary by network. Most deposits are confirmed within 10-30 minutes, but some networks may take longer during high traffic periods. You can track your deposit status in the Deposits page."
      },
      {
        question: "What networks are supported?",
        answer: "We currently support the Aptos network. USDT, USDC, Bitcoin, and APT tokens are available on Aptos. More networks will be added in the future."
      }
    ]
  },
  "Transactions": {
    "Sending Tokens": [
      {
        question: "How do I send tokens to another user?",
        answer: "Go to the 'Send' section and click 'Send Tokens'. Enter the recipient's email address, select the token and amount you want to send, then confirm the transaction. You may need to verify your email or enter a 2FA code to complete the transaction."
      },
      {
        question: "What are the transaction fees?",
        answer: "Transaction fees vary by network and are determined by the blockchain network itself, not by our platform. Fees are typically displayed before you confirm a transaction. Aptos network fees are generally low and consistent."
      },
      {
        question: "Can I cancel a pending transaction?",
        answer: "Once a transaction is initiated, it cannot be cancelled as it's processed on the blockchain. However, if a transaction is still pending (not yet confirmed), you may be able to cancel it from the Transactions page if the option is available."
      }
    ],
    "Transaction History": [
      {
        question: "How do I view my transaction history?",
        answer: "You can view all your transactions on the main dashboard or by navigating to the Transactions page. The history shows all deposits, remittances, and transfers with their status, timestamps, and transaction IDs."
      },
      {
        question: "How do I find a specific transaction?",
        answer: "Use the search and filter options on the Transactions page. You can filter by transaction type, status, date range, or search by transaction ID or recipient address."
      }
    ]
  },
  "Remittances": {
    "Remittance Process": [
      {
        question: "How do I send a remittance?",
        answer: "Navigate to the 'Remittances' page and click 'Request Remittance'. Select the token, enter the amount and recipient address, then confirm. You'll need to verify your email and may need to enter a 2FA code to complete the remittance."
      },
      {
        question: "What is the minimum remittance amount?",
        answer: "Minimum remittance amounts vary by token and network. The minimum amount is displayed when you initiate a remittance. This minimum is set to cover network transaction fees."
      },
      {
        question: "How long do remittances take?",
        answer: "Remittances are typically processed within 24-48 hours after verification. Processing times may be longer during high traffic periods or for security reviews. You'll receive an email notification when your remittance is processed."
      }
    ],
    "Remittance Limits": [
      {
        question: "Are there remittance limits?",
        answer: "Yes, remittance limits are set based on your account verification level. Basic accounts have lower limits, while verified accounts have higher limits. You can check your limits in the Remittances page."
      },
      {
        question: "How do I increase my remittance limit?",
        answer: "Complete your profile verification by providing additional identification documents. Go to your Profile page and follow the verification process to increase your limits."
      }
    ]
  },
  "Security": {
    "Account Security": [
      {
        question: "How do I change my password?",
        answer: "If you signed up with email, you can change your password from the Profile page under Security settings. If you signed up with Google or GitHub, your password is managed by those services."
      },
      {
        question: "What should I do if I suspect unauthorized access?",
        answer: "Immediately change your password, enable 2FA if not already enabled, and contact our support team. We can help secure your account and investigate any suspicious activity."
      },
      {
        question: "How do I enable two-factor authentication?",
        answer: "Go to your Profile page, navigate to the Security section, and click 'Enable 2FA'. Follow the instructions to set up an authenticator app and verify the setup with a code."
      }
    ]
  },
  "Troubleshooting": {
    "Common Issues": [
      {
        question: "My deposit hasn't appeared in my account",
        answer: "First, verify that the transaction was confirmed on the blockchain using the transaction ID. If confirmed, check that you sent to the correct address. Deposits can take 10-30 minutes to appear. If it's been longer, contact support with your transaction ID."
      },
      {
        question: "I can't log in to my account",
        answer: "Check that you're using the correct email and password. If you have 2FA enabled, make sure you're entering the correct code. If you've forgotten your password, use the 'Forgot Password' link. If issues persist, contact support."
      },
      {
        question: "My transaction is stuck pending",
        answer: "Pending transactions usually resolve within a few hours. If your transaction has been pending for more than 24 hours, check the network status and contact support with your transaction ID for assistance."
      }
    ]
  }
}

// Ticket type based on API response
interface Ticket {
  ticketId: string
  userId: string
  ticketTitle: string
  ticketDescription: string
  ticketStatus: string
  ticketPriority: string
  ticketCategory: string
  ticketComments: number
  createdAt: string
  updatedAt: string
}

interface TicketsApiResponse {
  success: boolean
  status: number
  message: string
  data: Ticket[]
  pagination: {
    currentPage: number
    pageSize: number
    totalCount: number
    totalPages: number
    hasNextPage: boolean
    hasPrevPage: boolean
  }
}

const ITEMS_PER_PAGE = 10

const ticketCategories = [
  "Account Issues",
  "Deposits",
  "Withdrawals",
  "Transactions",
  "Security",
  "Billing",
  "Other"
]

const ticketPriorities = [
  { value: "low", label: "Low" },
  { value: "medium", label: "Medium" },
  { value: "high", label: "High" },
  { value: "urgent", label: "Urgent" }
]

const getStatusBadge = (status: string) => {
  // Normalize status (API uses "in-progress", component uses "in_progress")
  const normalizedStatus = status.replace("-", "_")
  const statusConfig = {
    open: { variant: "default" as const, icon: AlertCircle, label: "Open" },
    "in-progress": { variant: "secondary" as const, icon: Clock, label: "In Progress" },
    in_progress: { variant: "secondary" as const, icon: Clock, label: "In Progress" },
    resolved: { variant: "default" as const, icon: CheckCircle2, label: "Resolved" },
    closed: { variant: "outline" as const, icon: XCircle, label: "Closed" }
  }
  
  const config = statusConfig[status as keyof typeof statusConfig] || statusConfig[normalizedStatus as keyof typeof statusConfig] || statusConfig.open
  const Icon = config.icon
  
  return (
    <Badge variant={config.variant} className="gap-1">
      <Icon className="w-3 h-3" />
      {config.label}
    </Badge>
  )
}

const formatDate = (dateString: string) => {
  const date = new Date(dateString)
  return date.toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  })
}

const HelpPageContent = () => {
  const searchParams = useSearchParams()
  const router = useRouter()
  const tabParam = searchParams.get("tab")
  
  // Determine initial tab from URL or default to "faq"
  const getInitialTab = () => {
    if (tabParam === "tickets") return "tickets"
    if (tabParam === "faq") return "faq"
    return "faq" // default
  }
  
  const [activeTab, setActiveTab] = useState(getInitialTab())
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [searchQuery, setSearchQuery] = useState("")
  const [faqSearchQuery, setFaqSearchQuery] = useState("")
  const [expandedItems, setExpandedItems] = useState<Set<string>>(new Set())
  const [isCreateTicketOpen, setIsCreateTicketOpen] = useState(false)
  const [statusFilter, setStatusFilter] = useState<string>("all")
  const [currentPage, setCurrentPage] = useState(1)
  const [isLoading, setIsLoading] = useState(false)
  const [pagination, setPagination] = useState<TicketsApiResponse["pagination"] | null>(null)
  const [newTicket, setNewTicket] = useState({
    subject: "",
    category: "",
    priority: "medium",
    description: ""
  })
  const [screenshot, setScreenshot] = useState<File | null>(null)
  const [screenshotPreview, setScreenshotPreview] = useState<string | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccessModalOpen, setIsSuccessModalOpen] = useState(false)
  const [createdTicketId, setCreatedTicketId] = useState<string | null>(null)

  // Update active tab when URL query parameter changes
  useEffect(() => {
    if (tabParam === "tickets") {
      setActiveTab("tickets")
    } else if (tabParam === "faq") {
      setActiveTab("faq")
    } else {
      setActiveTab("faq") // default
    }
  }, [tabParam])

  // Use dummy tickets data
  useEffect(() => {
    if (activeTab !== "tickets") return

    setIsLoading(true)
    // Bypass API - use dummy data
    setTimeout(() => {
      setTickets([])
      setPagination({
        currentPage: 1,
        pageSize: ITEMS_PER_PAGE,
        totalCount: 0,
        totalPages: 1,
        hasNextPage: false,
        hasPrevPage: false,
      })
      setIsLoading(false)
    }, 500)
  }, [currentPage, activeTab])

  // Handle tab change and update URL
  const handleTabChange = (value: string) => {
    setActiveTab(value)
    const params = new URLSearchParams(searchParams.toString())
    if (value === "faq") {
      params.set("tab", "faq")
    } else if (value === "tickets") {
      params.set("tab", "tickets")
    }
    router.push(`/help?${params.toString()}`, { scroll: false })
  }

  const handleCreateTicket = async () => {
    if (!newTicket.subject || !newTicket.category || !newTicket.description) {
      return
    }

    setIsSubmitting(true)
    // Bypass API - show success directly
    setTimeout(() => {
      setCreatedTicketId("TKT-" + Date.now())
      setIsCreateTicketOpen(false)
      setNewTicket({ subject: "", category: "", priority: "medium", description: "" })
      setScreenshot(null)
      setScreenshotPreview(null)
        setIsSuccessModalOpen(true)
        
        // Refresh tickets list
        setCurrentPage(1)
    }, 1000)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Validate file type (images only)
      if (file.type.startsWith("image/")) {
        // Validate file size (max 5MB)
        if (file.size <= 5 * 1024 * 1024) {
          setScreenshot(file)
          // Create preview URL
          const reader = new FileReader()
          reader.onloadend = () => {
            setScreenshotPreview(reader.result as string)
          }
          reader.readAsDataURL(file)
        } else {
          alert("File size must be less than 5MB")
        }
      } else {
        alert("Please upload an image file")
      }
    }
  }

  const handleRemoveScreenshot = () => {
    setScreenshot(null)
    setScreenshotPreview(null)
  }

  const filteredTickets = tickets.filter(ticket => {
    const matchesSearch =
      ticket.ticketTitle.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticketDescription.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ticket.ticketId.toLowerCase().includes(searchQuery.toLowerCase())
    
    // Normalize status for comparison (API uses "in-progress", filter might use "in_progress")
    const normalizedTicketStatus = ticket.ticketStatus.replace("-", "_")
    const normalizedFilterStatus = statusFilter.replace("-", "_")
    const matchesStatus = statusFilter === "all" || 
      ticket.ticketStatus === statusFilter || 
      normalizedTicketStatus === normalizedFilterStatus
    
    return matchesSearch && matchesStatus
  })

  const handlePageChange = (newPage: number) => {
    setCurrentPage(newPage)
    window.scrollTo({ top: 0, behavior: "smooth" })
  }

  const handleStatusFilterChange = (value: string) => {
    setStatusFilter(value)
    setCurrentPage(1) // Reset to first page when filter changes
  }

  const getPriorityColor = (priority: string) => {
    const colors = {
      low: "text-blue-600 bg-blue-50 dark:bg-blue-950/20 dark:text-blue-400",
      medium: "text-yellow-600 bg-yellow-50 dark:bg-yellow-950/20 dark:text-yellow-400",
      high: "text-orange-600 bg-orange-50 dark:bg-orange-950/20 dark:text-orange-400",
      urgent: "text-red-600 bg-red-50 dark:bg-red-950/20 dark:text-red-400"
    }
    return colors[priority as keyof typeof colors] || colors.medium
  }

  const getPriorityIcon = (priority: string) => {
    if (priority === "urgent") return AlertCircle
    if (priority === "high") return TrendingUp
    return Tag
  }


  // Filter FAQs based on search query
  const getFilteredFAQs = (): typeof faqData => {
    if (!faqSearchQuery) return faqData
    
    const query = faqSearchQuery.toLowerCase()
    const filtered: Partial<typeof faqData> = {}
    
    Object.entries(faqData).forEach(([category, subcategories]) => {
      const filteredSubcategories: Record<string, Array<{ question: string; answer: string }>> = {}
      
      Object.entries(subcategories).forEach(([subcategory, items]) => {
        const filteredItems = items.filter(
          item =>
            item.question.toLowerCase().includes(query) ||
            item.answer.toLowerCase().includes(query) ||
            category.toLowerCase().includes(query) ||
            subcategory.toLowerCase().includes(query)
        )
        
        if (filteredItems.length > 0) {
          filteredSubcategories[subcategory] = filteredItems
        }
      })
      
      if (Object.keys(filteredSubcategories).length > 0) {
        filtered[category as keyof typeof faqData] = filteredSubcategories as any
      }
    })
    
    return filtered as typeof faqData
  }

  const filteredFAQs = getFilteredFAQs()

  const getCategoryIcon = (category: string) => {
    const iconMap: Record<string, React.ComponentType<{ className?: string }>> = {
      "Getting Started": Sparkles,
      "Transactions": TrendingUp,
      "Remittances": Wallet,
      "Security": Shield,
      "Troubleshooting": Zap
    }
    return iconMap[category] || HelpCircle
  }

  const toggleExpanded = (value: string) => {
    const newExpanded = new Set(expandedItems)
    if (newExpanded.has(value)) {
      newExpanded.delete(value)
    } else {
      newExpanded.add(value)
    }
    setExpandedItems(newExpanded)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground mt-2">
          Find answers to common questions or get help from our support team
        </p>
      </div>

      {/* What Papillae Enables Section */}
      <div className="bg-gradient-to-br from-primary/10 to-primary/5 rounded-lg border border-primary/20 p-6 space-y-4">
        <div className="flex items-center gap-2 mb-4">
          <Sparkles className="w-6 h-6 text-primary" />
          <h2 className="text-2xl font-bold text-foreground">What Papillae Enables</h2>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Shield className="w-5 h-5 text-primary" />
              Private stablecoin payments
            </h3>
            <p className="text-sm text-muted-foreground">
              Send and receive stablecoins with encrypted amounts, sender identities, and recipient details.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <TrendingUp className="w-5 h-5 text-primary" />
              Confidential remittance
            </h3>
            <p className="text-sm text-muted-foreground">
              Enable cross-border transfers for individuals, families, and businesses without exposing financial activity.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <Wallet className="w-5 h-5 text-primary" />
              Privacy-preserving payroll
            </h3>
            <p className="text-sm text-muted-foreground">
              Pay employees and contractors without revealing salaries or payment history on public ledgers.
            </p>
          </div>
          <div className="space-y-2">
            <h3 className="font-semibold text-foreground flex items-center gap-2">
              <CheckCircle className="w-5 h-5 text-primary" />
              Verifiable transactions
            </h3>
            <p className="text-sm text-muted-foreground">
              Ensure every transaction is cryptographically proven valid using zero-knowledge proofs.
            </p>
          </div>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={handleTabChange} className="w-full">
        <TabsList>
          <TabsTrigger value="faq" className="gap-2">
            <HelpCircle className="w-4 h-4" />
            FAQ
          </TabsTrigger>
          <TabsTrigger value="tickets" className="gap-2">
            <MessageSquare className="w-4 h-4" />
            My Tickets
          </TabsTrigger>
        </TabsList>

        <TabsContent value="faq" className="space-y-6 mt-6">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search for solutions to your problem..."
              value={faqSearchQuery}
              onChange={(e) => setFaqSearchQuery(e.target.value)}
              className="pl-12 h-12 text-base"
            />
          </div>

          {/* Quick Help Cards */}
          {!faqSearchQuery && (
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {Object.entries(faqData).slice(0, 3).map(([category, subcategories]) => {
                const Icon = getCategoryIcon(category)
                const totalQuestions = Object.values(subcategories).flat().length
                const categoryId = `category-${category.replace(/\s+/g, "-").toLowerCase()}`
                return (
                  <div 
                    key={category} 
                    className="bg-card rounded-lg border border-border hover:border-primary/50 transition-all cursor-pointer group p-6"
                    onClick={() => {
                      const element = document.getElementById(categoryId)
                      if (element) {
                        element.scrollIntoView({ behavior: "smooth", block: "start" })
                        // Expand the first item in the category
                        const firstSubcategory = Object.keys(subcategories)[0]
                        if (firstSubcategory) {
                          const firstItemId = `${category}-${firstSubcategory}-0`
                          if (!expandedItems.has(firstItemId)) {
                            toggleExpanded(firstItemId)
                          }
                        }
                      }
                    }}
                  >
                    <div className="flex items-start gap-4">
                      <div className="p-3 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors">
                        <Icon className="w-6 h-6 text-primary" />
                      </div>
                      <div className="flex-1">
                        <h3 className="font-semibold text-lg mb-1">{category}</h3>
                        <p className="text-sm text-muted-foreground">
                          {totalQuestions} solutions available
                        </p>
                      </div>
                      <ArrowRight className="w-5 h-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0 mt-1" />
                    </div>
                  </div>
                )
              })}
            </div>
          )}

          {/* FAQ Content */}
          <div className="space-y-6">
            {Object.keys(filteredFAQs).length === 0 ? (
              <div className="bg-card rounded-lg border border-border">
                <div className="py-12 text-center px-6">
                  <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">
                    No solutions found matching your search. Try different keywords or{" "}
                    <button
                      onClick={() => setFaqSearchQuery("")}
                      className="text-primary hover:underline"
                    >
                      clear your search
                    </button>
                  </p>
                </div>
              </div>
            ) : (
              Object.entries(filteredFAQs).map(([category, subcategories]) => {
                const Icon = getCategoryIcon(category)
                const categoryId = `category-${category.replace(/\s+/g, "-").toLowerCase()}`
                return (
                  <div key={category} id={categoryId} className="bg-card rounded-lg border border-border overflow-hidden">
                    <div className="bg-gradient-to-r from-primary/5 to-primary/10 border-b border-border px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                          <Icon className="w-5 h-5 text-primary" />
                        </div>
                        <h2 className="text-xl font-semibold">{category}</h2>
                      </div>
                    </div>
                    <div className="p-6">
                      {Object.entries(subcategories).map(([subcategory, items], subIndex) => (
                        <div key={subcategory} className={subIndex > 0 ? "mt-8 pt-8 border-t" : ""}>
                          <div className="flex items-center gap-2 mb-4">
                            <Lightbulb className="w-4 h-4 text-primary" />
                            <h3 className="text-base font-semibold text-foreground">
                              {subcategory}
                            </h3>
                          </div>
                          <div className="space-y-3">
                            {items.map((item, index) => {
                              const itemId = `${category}-${subcategory}-${index}`
                              const isExpanded = expandedItems.has(itemId)
                              return (
                                <div
                                  key={index}
                                  className="group border rounded-lg hover:border-primary/50 transition-all overflow-hidden"
                                >
                                  <button
                                    onClick={() => toggleExpanded(itemId)}
                                    className="w-full p-4 text-left flex items-start justify-between gap-4 hover:bg-muted/50 transition-colors"
                                  >
                                    <div className="flex-1 flex items-start gap-3">
                                      <div className="p-1.5 rounded-md bg-primary/10 group-hover:bg-primary/20 transition-colors mt-0.5 shrink-0">
                                        <HelpCircle className="w-4 h-4 text-primary" />
                                      </div>
                                      <span className="font-medium text-foreground leading-relaxed">
                                        {item.question}
                                      </span>
                                    </div>
                                    <ChevronDown
                                      className={`w-5 h-5 text-muted-foreground shrink-0 transition-transform ${
                                        isExpanded ? "rotate-180" : ""
                                      }`}
                                    />
                                  </button>
                                  {isExpanded && (
                                    <div className="px-4 pb-4 pl-12 border-t bg-muted/30">
                                      <div className="pt-4 text-muted-foreground leading-relaxed">
                                        <div className="flex items-start gap-2 mb-2">
                                          <BookOpen className="w-4 h-4 text-primary shrink-0 mt-0.5" />
                                          <span className="text-sm font-medium text-foreground">Solution:</span>
                                        </div>
                                        <p className="pl-6">{item.answer}</p>
                                      </div>
                                    </div>
                                  )}
                                </div>
                              )
                            })}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )
              })
            )}
          </div>
        </TabsContent>

        <TabsContent value="tickets" className="space-y-6 mt-6">
          {/* Search and Actions */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search tickets by subject, ID, or description..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-9"
              />
            </div>
            <div className="flex items-center gap-2">
              <div className="relative">
                <Filter className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground pointer-events-none" />
                <Select value={statusFilter} onValueChange={handleStatusFilterChange}>
                  <SelectTrigger className="w-[140px] pl-9">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">All Status</SelectItem>
                    <SelectItem value="open">Open</SelectItem>
                    <SelectItem value="in-progress">In Progress</SelectItem>
                    <SelectItem value="resolved">Resolved</SelectItem>
                    <SelectItem value="closed">Closed</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Dialog 
                open={isCreateTicketOpen} 
                onOpenChange={(open) => {
                  setIsCreateTicketOpen(open)
                  if (!open && !isSubmitting) {
                    setNewTicket({ subject: "", category: "", priority: "medium", description: "" })
                    setScreenshot(null)
                    setScreenshotPreview(null)
                  }
                }}
              >
                <DialogTrigger asChild>
                  <Button className="gap-2">
                    <Plus className="w-4 h-4" />
                    New Ticket
                  </Button>
                </DialogTrigger>
              <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                  <div className="flex items-center gap-3 mb-2">
                    <div className="p-2 rounded-lg bg-primary/10">
                      <MessageSquare className="w-5 h-5 text-primary" />
                    </div>
                    <div>
                      <DialogTitle className="text-2xl">Create New Support Ticket</DialogTitle>
                      <DialogDescription className="mt-1">
                        Describe your issue and we'll get back to you as soon as possible.
                      </DialogDescription>
                    </div>
                  </div>
                </DialogHeader>
                <div className="space-y-6 py-4">
                  <div className="space-y-2">
                    <Label htmlFor="subject" className="text-base font-medium">Subject</Label>
                    <Input
                      id="subject"
                      placeholder="Brief description of your issue"
                      value={newTicket.subject}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, subject: e.target.value })
                      }
                      className="h-11"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="category" className="text-base font-medium">Category</Label>
                      <Select
                        value={newTicket.category}
                        onValueChange={(value) =>
                          setNewTicket({ ...newTicket, category: value })
                        }
                        disabled={isSubmitting}
                      >
                        <SelectTrigger id="category" className="h-11">
                          <SelectValue placeholder="Select category" />
                        </SelectTrigger>
                        <SelectContent>
                          {ticketCategories.map((cat) => (
                            <SelectItem key={cat} value={cat}>
                              {cat}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority" className="text-base font-medium">Priority</Label>
                      <Select
                        value={newTicket.priority}
                        onValueChange={(value) =>
                          setNewTicket({ ...newTicket, priority: value })
                        }
                        disabled={isSubmitting}
                      >
                        <SelectTrigger id="priority" className="h-11">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          {ticketPriorities.map((priority) => (
                            <SelectItem key={priority.value} value={priority.value}>
                              {priority.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="description" className="text-base font-medium">Description</Label>
                    <Textarea
                      id="description"
                      placeholder="Provide detailed information about your issue..."
                      rows={6}
                      value={newTicket.description}
                      onChange={(e) =>
                        setNewTicket({ ...newTicket, description: e.target.value })
                      }
                      className="resize-none"
                      disabled={isSubmitting}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="screenshot" className="text-base font-medium">
                      Screenshot <span className="text-muted-foreground text-xs font-normal">(Optional)</span>
                    </Label>
                    {!screenshot ? (
                      <div className="relative border-2 border-dashed border-border rounded-lg p-8 hover:border-primary/50 transition-all hover:bg-primary/5 group">
                        <div className="flex flex-col items-center justify-center gap-4">
                          <div className="p-4 rounded-full bg-primary/10 group-hover:bg-primary/20 transition-colors">
                            <ImageIcon className="w-8 h-8 text-primary" />
                          </div>
                          <div className="text-center">
                            <p className="text-sm font-semibold mb-1 text-foreground">Click to upload or drag and drop</p>
                            <p className="text-xs text-muted-foreground">JPG, PNG, GIF (Max 5MB)</p>
                          </div>
                          <Input
                            id="screenshot"
                            type="file"
                            accept="image/*"
                            onChange={handleFileChange}
                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            disabled={isSubmitting}
                          />
                        </div>
                      </div>
                    ) : (
                      <div className="space-y-3">
                        <div className="relative group">
                          <div className="relative rounded-lg overflow-hidden border-2 border-border">
                            <img
                              src={screenshotPreview || ""}
                              alt="Preview"
                              className="w-full h-64 object-contain bg-muted"
                            />
                            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-colors flex items-center justify-center">
                              <Button
                                type="button"
                                variant="destructive"
                                size="icon"
                                className="opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={handleRemoveScreenshot}
                                disabled={isSubmitting}
                              >
                                <X className="w-4 h-4" />
                              </Button>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center gap-2 p-3 border rounded-md bg-muted/50">
                          <Upload className="w-4 h-4 text-muted-foreground shrink-0" />
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium truncate">{screenshot.name}</p>
                            <p className="text-xs text-muted-foreground">
                              {(screenshot.size / 1024).toFixed(2)} KB
                            </p>
                          </div>
                          <Button
                            type="button"
                            variant="ghost"
                            size="icon"
                            className="h-8 w-8 shrink-0"
                            onClick={handleRemoveScreenshot}
                            disabled={isSubmitting}
                          >
                            <X className="w-4 h-4" />
                          </Button>
                        </div>
                      </div>
                    )}
                    <p className="text-xs text-muted-foreground">
                      Supported formats: JPG, PNG, GIF. Max size: 5MB
                    </p>
                  </div>
                </div>
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsCreateTicketOpen(false)
                      setScreenshot(null)
                      setScreenshotPreview(null)
                    }}
                    disabled={isSubmitting}
                  >
                    Cancel
                  </Button>
                  <Button
                    onClick={handleCreateTicket}
                    disabled={
                      !newTicket.subject ||
                      !newTicket.category ||
                      !newTicket.description ||
                      isSubmitting
                    }
                    className="gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <Spinner className="w-4 h-4" />
                        Creating...
                      </>
                    ) : (
                      <>
                        <Plus className="w-4 h-4" />
                        Create Ticket
                      </>
                    )}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>

            {/* Success Modal */}
            <Dialog 
              open={isSuccessModalOpen} 
              onOpenChange={(open) => {
                if (!open) {
                  setIsSuccessModalOpen(false)
                  setCreatedTicketId(null)
                }
              }}
            >
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <div className="flex flex-col items-center text-center space-y-6 py-2">
                    <div className="relative">
                      <div className="w-24 h-24 rounded-full bg-gradient-to-br from-green-100 to-green-200 dark:from-green-900/30 dark:to-green-800/30 flex items-center justify-center shadow-lg">
                        <CheckCircle className="w-14 h-14 text-green-600 dark:text-green-400" />
                      </div>
                      <div className="absolute -top-1 -right-1 w-8 h-8 rounded-full bg-green-500 flex items-center justify-center">
                        <CheckCircle className="w-5 h-5 text-white" />
                      </div>
                    </div>
                    <div className="space-y-2">
                      <DialogTitle className="text-2xl font-bold">Ticket Created Successfully!</DialogTitle>
                      <DialogDescription className="text-base">
                        Your support ticket has been created and our team will get back to you soon.
                      </DialogDescription>
                    </div>
                    {createdTicketId && (
                      <div className="w-full p-5 rounded-xl bg-gradient-to-r from-primary/10 via-primary/5 to-primary/10 border-2 border-primary/20">
                        <div className="flex items-center gap-3 justify-center">
                          <div className="p-2 rounded-lg bg-primary/20">
                            <Tag className="w-5 h-5 text-primary" />
                          </div>
                          <div className="flex flex-col">
                            <span className="text-xs font-medium text-muted-foreground uppercase tracking-wide">Ticket ID</span>
                            <span className="text-xl font-bold text-primary">{createdTicketId}</span>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                </DialogHeader>
                <DialogFooter className="gap-2">
                  <Button
                    variant="outline"
                    onClick={() => {
                      setIsSuccessModalOpen(false)
                      setCreatedTicketId(null)
                    }}
                    className="flex-1"
                  >
                    Close
                  </Button>
                  <Button
                    onClick={() => {
                      if (createdTicketId) {
                        setIsSuccessModalOpen(false)
                        const ticketId = createdTicketId
                        setCreatedTicketId(null)
                        router.push(`/help/ticket/${ticketId}`)
                      }
                    }}
                    className="flex-1 gap-2"
                  >
                    <FileText className="w-4 h-4" />
                    View Ticket
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
            </div>
          </div>

          {/* Tickets List */}
          <div className="space-y-4">
            {isLoading ? (
              <div className="bg-card rounded-lg border border-border">
                <div className="py-16 text-center px-6">
                  <Spinner className="w-8 h-8 mx-auto mb-4" />
                  <p className="text-muted-foreground">Loading tickets...</p>
                </div>
              </div>
            ) : filteredTickets.length === 0 ? (
              <div className="bg-card rounded-lg border border-border">
                <div className="py-16 text-center px-6">
                  <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                    <MessageSquare className="w-8 h-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No tickets found</h3>
                  <p className="text-muted-foreground mb-6">
                    {searchQuery || statusFilter !== "all"
                      ? "Try adjusting your search or filter criteria."
                      : "You don't have any support tickets yet. Create one to get started!"}
                  </p>
                  {!searchQuery && statusFilter === "all" && (
                    <Button onClick={() => setIsCreateTicketOpen(true)} className="gap-2">
                      <Plus className="w-4 h-4" />
                      Create Your First Ticket
                    </Button>
                  )}
                </div>
              </div>
            ) : (
              <>
                {filteredTickets.map((ticket) => {
                  const PriorityIcon = getPriorityIcon(ticket.ticketPriority)
                  return (
                    <div
                      key={ticket.ticketId}
                      className="bg-card rounded-lg border border-border hover:border-primary/30 transition-all overflow-hidden group cursor-pointer"
                      onClick={() => router.push(`/help/ticket/${ticket.ticketId}`)}
                    >
                      <div className="px-6 py-5">
                        <div className="flex items-start gap-4">
                          <div className="flex-1 space-y-3">
                            <div className="flex items-start gap-3">
                              <div className="p-2 rounded-lg bg-primary/10 group-hover:bg-primary/20 transition-colors shrink-0 mt-0.5">
                                <FileText className="w-5 h-5 text-primary" />
                              </div>
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-3 flex-wrap mb-2">
                                  <h3 className="text-lg font-semibold text-foreground">{ticket.ticketTitle}</h3>
                                  {getStatusBadge(ticket.ticketStatus)}
                                </div>
                                <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap">
                                  <div className="flex items-center gap-1.5">
                                    <Tag className="w-3.5 h-3.5" />
                                    <span className="font-medium">{ticket.ticketId}</span>
                                  </div>
                                  <span>•</span>
                                  <div className="flex items-center gap-1.5">
                                    <span className="font-medium">{ticket.ticketCategory}</span>
                                  </div>
                                  <span>•</span>
                                  <div className={`flex items-center gap-1.5 px-2 py-0.5 rounded-md text-xs font-medium ${getPriorityColor(ticket.ticketPriority)}`}>
                                    <PriorityIcon className="w-3 h-3" />
                                    <span className="capitalize">{ticket.ticketPriority}</span>
                                  </div>
                                  {ticket.ticketComments > 0 && (
                                    <>
                                      <span>•</span>
                                      <div className="flex items-center gap-1.5">
                                        <MessageSquare className="w-3.5 h-3.5" />
                                        <span>{ticket.ticketComments} {ticket.ticketComments === 1 ? "comment" : "comments"}</span>
                                      </div>
                                    </>
                                  )}
                                </div>
                              </div>
                            </div>
                            
                            <div className="ml-11 space-y-4 pt-2 border-t border-border">
                              <div>
                                <div className="flex items-center gap-2 mb-2">
                                  <BookOpen className="w-4 h-4 text-primary" />
                                  <span className="text-sm font-medium text-foreground">Description</span>
                                </div>
                                <p className="text-muted-foreground leading-relaxed line-clamp-2">{ticket.ticketDescription}</p>
                              </div>
                            </div>
                            
                            <div className="flex items-center gap-4 text-xs text-muted-foreground ml-11">
                              <div className="flex items-center gap-1.5">
                                <Calendar className="w-3.5 h-3.5" />
                                <span>Created: {formatDate(ticket.createdAt)}</span>
                              </div>
                              <span>•</span>
                              <div className="flex items-center gap-1.5">
                                <Clock className="w-3.5 h-3.5" />
                                <span>Updated: {formatDate(ticket.updatedAt)}</span>
                              </div>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  )
                })}

                {/* Pagination */}
                {pagination && pagination.totalPages > 1 && (
                  <div className="border-t border-border pt-6">
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
                            className={!pagination.hasPrevPage ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>

                        {Array.from({ length: pagination.totalPages }, (_, i) => i + 1).map((page) => {
                          if (
                            page === 1 ||
                            page === pagination.totalPages ||
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
                              if (pagination.hasNextPage) {
                                handlePageChange(currentPage + 1)
                              }
                            }}
                            className={!pagination.hasNextPage ? "pointer-events-none opacity-50" : ""}
                          />
                        </PaginationItem>
                      </PaginationContent>
                    </Pagination>
                  </div>
                )}
              </>
            )}
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}

const HelpPage = () => {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <Spinner className="w-8 h-8" />
      </div>
    }>
      <HelpPageContent />
    </Suspense>
  )
}

export default HelpPage
