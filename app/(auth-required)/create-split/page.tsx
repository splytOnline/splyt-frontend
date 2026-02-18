"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  FileText,
  Coins,
  Users,
  DollarSign,
  Plus,
  X,
  ArrowLeft,
  Info,
  Wallet,
  User,
  Equal,
  Calculator,
  CheckCircle2,
  ExternalLink,
  Copy,
} from "lucide-react"
import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Field, FieldContent, FieldDescription, FieldLabel, FieldGroup } from "@/components/ui/field"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { Spinner } from "@/components/ui/spinner"
import { useTokensAndBalances } from "@/contexts/tokens-balances-context"
import { useEffect } from "react"
import { useAccount } from "wagmi"
import { ConnectWalletPrompt } from "@/components/connect-wallet-prompt"
import { usePageTitle } from "@/hooks/use-page-title"
import { generateNameFromAddress } from "@/lib/names"
type SplitType = "equal" | "custom"

interface Participant {
  id: string
  name: string
  walletAddress: string
  amount?: number
  isCurrentUser?: boolean
}

export default function CreateSplitPage() {
  const router = useRouter()
  usePageTitle("Create Split")
  const { userData } = useTokensAndBalances()
  const { isConnected, address } = useAccount()
  const [title, setTitle] = useState("")
  const [token, setToken] = useState<"USDC" | "USDT" | "ARB" | "ETH" | "BTC">("USDC")
  const [splitType, setSplitType] = useState<SplitType>("equal")
  const [totalAmount, setTotalAmount] = useState("")

  // Token configuration
  const tokenConfig = {
    USDC: { icon: "/icons/usdc.svg", available: true, label: "USDC" },
    USDT: { icon: "/icons/usdt.svg", available: false, label: "USDT" },
    ARB: { icon: "/icons/arbitrum-arb-logo.svg", available: false, label: "ARB" },
    ETH: { icon: "/icons/eth.svg", available: false, label: "ETH" },
    BTC: { icon: "/icons/btc.svg", available: false, label: "BTC" },
  }
  
  const [participants, setParticipants] = useState<Participant[]>([
    { 
      id: "1", 
      name: userData?.displayName || "You", 
      walletAddress: "",
      isCurrentUser: true
    },
    {
      id: "2",
      name: "",
      walletAddress: "",
    },
  ])
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showSuccessDialog, setShowSuccessDialog] = useState(false)
  const [successData, setSuccessData] = useState<{
    splitId: number
    contractAddress: string
    txHash: string
  } | null>(null)
  const [currentQuote, setCurrentQuote] = useState(0)

  // Cool quotes for split creation
  const loadingQuotes = [
    "Creating your split on the blockchain...",
    "Setting up fair distribution...",
    "Securing your split with smart contracts...",
    "Almost there, just a moment...",
    "Building your split, one block at a time...",
    "Deploying your split contract...",
    "Making bill splitting effortless...",
  ]

  // Rotate quotes during submission
  useEffect(() => {
    if (!isSubmitting) return

    const interval = setInterval(() => {
      setCurrentQuote((prev) => (prev + 1) % loadingQuotes.length)
    }, 2000)

    return () => clearInterval(interval)
  }, [isSubmitting, loadingQuotes.length])

  // Update first participant when userData changes
  useEffect(() => {
    if (userData?.displayName) {
      setParticipants((prev) => {
        const updated = [...prev]
        if (updated[0]) {
          updated[0] = {
            ...updated[0],
            name: userData.displayName || "You",
            isCurrentUser: true,
          }
        }
        return updated
      })
    }
  }, [userData])

  // Update current user wallet address from connected wallet
  useEffect(() => {
    if (address) {
      setParticipants((prev) => {
        const updated = [...prev]
        if (updated[0]) {
          updated[0] = {
            ...updated[0],
            walletAddress: address,
          }
        }
        return updated
      })
    }
  }, [address])

  const addParticipant = () => {
    setParticipants([
      ...participants,
      { id: Date.now().toString(), name: "", walletAddress: "" },
    ])
  }

  const removeParticipant = (id: string) => {
    const participant = participants.find((p) => p.id === id)
    if (participant?.isCurrentUser) {
      toast.error("Cannot remove yourself from the split")
      return
    }
    if (participants.length > 2) {
      setParticipants(participants.filter((p) => p.id !== id))
    } else {
      toast.error("At least 2 participants are required (including you)")
    }
  }

  const updateParticipant = (id: string, field: "name" | "walletAddress" | "amount", value: string | number) => {
    setParticipants((prev) => {
      const updated = prev.map((p) => {
        if (p.id !== id) return p
        
        const updatedParticipant = { ...p, [field]: value }
        
        // Auto-generate name when wallet address is entered (only for non-current users)
        if (field === "walletAddress" && !p.isCurrentUser && typeof value === "string") {
          const address = value.trim()
          // Only auto-generate if address is valid (42 chars including 0x prefix)
          if (address && address.startsWith("0x") && address.length === 42) {
            try {
              const generatedName = generateNameFromAddress(address)
              updatedParticipant.name = generatedName
            } catch (error) {
              // Invalid address format, don't generate name
              console.error("Invalid address format:", error)
            }
          }
        }
        
        return updatedParticipant
      })
      return updated
    })
  }

  const calculateEqualShare = () => {
    const total = parseFloat(totalAmount)
    if (isNaN(total) || total <= 0) return 0
    return total / participants.length
  }

  const calculateCustomTotal = () => {
    return participants.reduce((sum, p) => sum + (p.amount || 0), 0)
  }

  const resetForm = () => {
    setTitle("")
    setTotalAmount("")
    setSplitType("equal")
    setToken("USDC")
    setParticipants([
      { 
        id: "1", 
        name: userData?.displayName || "You", 
        walletAddress: address || "",
        isCurrentUser: true
      },
      {
        id: "2",
        name: "",
        walletAddress: "",
      },
    ])
  }

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await navigator.clipboard.writeText(text)
      toast.success(`${label} copied to clipboard`)
    } catch (error) {
      toast.error("Failed to copy")
    }
  }

  const truncateAddress = (address: string, startChars: number = 6, endChars: number = 4) => {
    if (!address) return ""
    if (address.length <= startChars + endChars) return address
    return `${address.slice(0, startChars)}...${address.slice(-endChars)}`
  }

  const validateForm = () => {
    if (!title.trim()) {
      toast.error("Please enter a split title")
      return false
    }
    if (title.length > 25) {
      toast.error("Title must be 25 characters or less")
      return false
    }
    if (!totalAmount || parseFloat(totalAmount) <= 0) {
      toast.error("Please enter a valid total amount")
      return false
    }
    // Check if selected token is available
    if (!tokenConfig[token].available) {
      toast.error(`${tokenConfig[token].label} is not available yet. Please select USDC.`)
      return false
    }
    if (participants.length < 2) {
      toast.error("At least 2 participants are required (including you)")
      return false
    }
    if (participants.some((p) => !p.name.trim())) {
      toast.error("All participants must have a name")
      return false
    }
    if (participants.some((p) => !p.walletAddress.trim())) {
      toast.error("All participants must have a wallet address")
      return false
    }
    if (splitType === "custom") {
      const customTotal = calculateCustomTotal()
      const total = parseFloat(totalAmount)
      if (Math.abs(customTotal - total) > 0.01) {
        toast.error(`Custom amounts must equal total amount (${total.toFixed(2)} ${tokenConfig[token].label})`)
        return false
      }
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // Prepare API request body
      const apiBody = {
        description: title.trim(),
        totalAmount: parseFloat(totalAmount),
        participants: participants.map((p) => ({
          walletAddress: p.walletAddress.trim(),
          name: p.name.trim(),
          amountDue: splitType === "equal" ? calculateEqualShare() : (p.amount || 0),
        })),
      }

      // Call create split API
      const response = await fetch("/api/split/create", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(apiBody),
      })

      const data = await response.json()

      if (!response.ok || !data.success) {
        toast.error(data.message || "Failed to create split. Please try again.")
        return
      }

      // Store success data and show dialog
      if (data.data) {
        setSuccessData({
          splitId: data.data.splitId,
          contractAddress: data.data.contractAddress,
          txHash: data.data.txHash,
        })
        setShowSuccessDialog(true)
        resetForm()
      } else {
        toast.success(data.message || "Split created successfully!")
      }
    } catch (error: any) {
      console.error("Error creating split:", error)
      toast.error(error.message || "Failed to create split. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const customTotal = calculateCustomTotal()
  const total = parseFloat(totalAmount) || 0
  const difference = customTotal - total
  const showCustomWarning = splitType === "custom" && total > 0 && Math.abs(difference) > 0.01

  // Check wallet connection (after all hooks)
  if (!isConnected) {
    return <ConnectWalletPrompt />
  }

  return (
    <>
      {/* Loading Overlay */}
      {isSubmitting && (
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
                {loadingQuotes[currentQuote]}
              </p>
              <div className="flex items-center justify-center gap-2">
                <div className="h-1 w-1 rounded-full bg-primary animate-pulse"></div>
                <p className="text-sm text-muted-foreground">
                  Please wait while we create your split
                </p>
                <div className="h-1 w-1 rounded-full bg-primary animate-pulse"></div>
              </div>
            </div>
          </div>
        </div>
      )}

      <div className="space-y-6 max-w-4xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-4">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => router.back()}
          className="h-9 w-9"
        >
          <ArrowLeft className="h-4 w-4" />
        </Button>
        <div>
          <h1 className="text-2xl font-semibold text-foreground">Create New Split</h1>
          <p className="text-sm text-muted-foreground mt-1">
            Split expenses equally or customize individual amounts
          </p>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Form */}
        <div className="lg:col-span-2">
          <Card className="shadow-none">
            <CardHeader>
              <CardTitle>Create New Split</CardTitle>
              <CardDescription>
                Fill in the details to create a new expense split
              </CardDescription>
            </CardHeader>
            <CardContent>
              <FieldGroup className="space-y-0">
                {/* Split Title */}
                <Field>
                  <FieldLabel className="flex items-center gap-2">
                    <FileText className="h-4 w-4 text-primary" />
                    Split Title
                  </FieldLabel>
                  <FieldContent>
                    <Input
                      placeholder="e.g., Dinner at Restaurant"
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      maxLength={25}
                      className="font-medium"
                    />
                    <FieldDescription>
                      Give your split a descriptive name (max 25 characters) - {title.length}/25 characters
                    </FieldDescription>
                  </FieldContent>
                </Field>


                {/* Split Type */}
                <Field>
                  <FieldLabel className="flex items-center gap-2">
                    <Calculator className="h-4 w-4 text-primary" />
                    Split Type
                  </FieldLabel>
                  <FieldContent>
                    <RadioGroup
                      value={splitType}
                      onValueChange={(value: SplitType) => setSplitType(value)}
                      className="grid grid-cols-2 gap-4"
                    >
                      <div className="flex items-center space-x-2 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                        <RadioGroupItem value="equal" id="equal" />
                        <Label
                          htmlFor="equal"
                          className="flex-1 cursor-pointer flex items-center gap-2"
                        >
                          <Equal className="h-4 w-4 text-primary" />
                          <div className="flex-1">
                            <div className="font-medium">Equal Split</div>
                            <div className="text-xs text-muted-foreground">
                              Divide equally among all
                            </div>
                          </div>
                        </Label>
                      </div>
                      <div className="flex items-center space-x-2 rounded-lg border border-border p-4 hover:bg-accent/50 transition-colors cursor-pointer has-[[data-state=checked]]:border-primary has-[[data-state=checked]]:bg-primary/5">
                        <RadioGroupItem value="custom" id="custom" />
                        <Label
                          htmlFor="custom"
                          className="flex-1 cursor-pointer flex items-center gap-2"
                        >
                          <Calculator className="h-4 w-4 text-primary" />
                          <div className="flex-1">
                            <div className="font-medium">Custom Amount</div>
                            <div className="text-xs text-muted-foreground">
                              Set individual amounts
                            </div>
                          </div>
                        </Label>
                      </div>
                    </RadioGroup>
                    <FieldDescription>
                      Choose how to divide the total amount among participants
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <Separator />

                {/* Total Amount with Token Selection */}
                <Field>
                  <FieldLabel className="flex items-center gap-2">
                    <DollarSign className="h-4 w-4 text-primary" />
                    Total Amount
                  </FieldLabel>
                  <FieldContent>
                    <div className="flex gap-2">
                      <div className="relative flex-1">
                        <Input
                          type="number"
                          step="0.01"
                          min="0"
                          placeholder="0.00"
                          value={totalAmount}
                          onChange={(e) => setTotalAmount(e.target.value)}
                          className="font-mono text-lg"
                        />
                      </div>
                      <Select 
                        value={token} 
                        onValueChange={(value: "USDC" | "USDT" | "ARB" | "ETH" | "BTC") => {
                          if (tokenConfig[value as keyof typeof tokenConfig].available) {
                            setToken(value)
                          }
                        }}
                      >
                        <SelectTrigger className="w-[140px]">
                          <div className="flex items-center gap-2">
                            <Image
                              src={tokenConfig[token].icon}
                              alt={token}
                              width={16}
                              height={16}
                              className="w-4 h-4"
                            />
                            <span>{tokenConfig[token].label}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(tokenConfig) as Array<keyof typeof tokenConfig>).map((tokenKey) => {
                            const config = tokenConfig[tokenKey]
                            return (
                              <SelectItem
                                key={tokenKey}
                                value={tokenKey}
                                disabled={!config.available}
                                className={!config.available ? "opacity-60 cursor-not-allowed" : ""}
                              >
                                <div className="flex items-center justify-between gap-2 w-full">
                                  <div className="flex items-center gap-2">
                                    <Image
                                      src={config.icon}
                                      alt={config.label}
                                      width={20}
                                      height={20}
                                      className="w-5 h-5"
                                    />
                                    <span>{config.label}</span>
                                  </div>
                                  {!config.available && (
                                    <span className="text-xs text-muted-foreground ml-auto">Upcoming</span>
                                  )}
                                </div>
                              </SelectItem>
                            )
                          })}
                        </SelectContent>
                      </Select>
                    </div>
                    <FieldDescription>
                      {splitType === "equal" && totalAmount && !isNaN(parseFloat(totalAmount)) ? (
                        <>
                          Each participant will pay{" "}
                          <span className="font-semibold font-mono">
                            {calculateEqualShare().toFixed(2)} {tokenConfig[token].label}
                          </span>
                        </>
                      ) : (
                        `Enter the total amount and select token${!tokenConfig[token].available ? " (USDC available now, others coming soon)" : ""}`
                      )}
                    </FieldDescription>
                  </FieldContent>
                </Field>

                <Separator />

                {/* Participants */}
                <Field>
                  <div className="flex items-center justify-between mb-2">
                    <FieldLabel className="flex items-center gap-2">
                      <Users className="h-4 w-4 text-primary" />
                      Participants
                    </FieldLabel>
                    {participants.length >= 2 && (
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        onClick={addParticipant}
                        className="gap-2"
                      >
                        <Plus className="h-3.5 w-3.5" />
                        Add More
                      </Button>
                    )}
                  </div>
                  <FieldContent>
                    <FieldDescription className="mb-4">
                      At least 2 participants required (including you)
                    </FieldDescription>
                    <div className="space-y-4">
                      {participants.map((participant, index) => (
                        <div key={participant.id} className="space-y-3 p-4 rounded-lg border border-border bg-card">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2 text-sm font-medium">
                              <User className="h-3.5 w-3.5" />
                              {participant.isCurrentUser ? (
                                <span className="text-primary">You</span>
                              ) : (
                                <span className="text-muted-foreground">Participant {index}</span>
                              )}
                            </div>
                            {participants.length > 2 && !participant.isCurrentUser && (
                              <Button
                                type="button"
                                variant="ghost"
                                size="icon"
                                className="h-7 w-7 text-destructive hover:text-destructive"
                                onClick={() => removeParticipant(participant.id)}
                              >
                                <X className="h-3.5 w-3.5" />
                              </Button>
                            )}
                          </div>
                          <div className="grid gap-3 sm:grid-cols-2">
                            <div className="space-y-1.5">
                              <Label className="text-sm">Wallet Address</Label>
                              <div className="relative">
                                <Wallet className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                                <Input
                                  placeholder="0x..."
                                  value={participant.walletAddress}
                                  onChange={(e) =>
                                    updateParticipant(
                                      participant.id,
                                      "walletAddress",
                                      e.target.value
                                    )
                                  }
                                  disabled={participant.isCurrentUser}
                                  className={`pl-9 font-mono text-sm ${participant.isCurrentUser ? "bg-muted/50" : ""}`}
                                />
                              </div>
                            </div>
                            <div className="space-y-1.5">
                              <Label className="text-sm">Name</Label>
                              <Input
                                placeholder={participant.isCurrentUser ? "Your name" : "Participant name"}
                                value={participant.name}
                                onChange={(e) =>
                                  updateParticipant(participant.id, "name", e.target.value)
                                }
                                disabled={participant.isCurrentUser}
                                className={participant.isCurrentUser ? "bg-muted/50" : ""}
                              />
                            </div>
                          </div>
                          {splitType === "custom" && (
                            <div className="space-y-1.5">
                              <Label className="text-sm">Amount ({tokenConfig[token].label})</Label>
                              <Input
                                type="number"
                                step="0.01"
                                min="0"
                                placeholder="0.00"
                                value={participant.amount || ""}
                                onChange={(e) =>
                                  updateParticipant(
                                    participant.id,
                                    "amount",
                                    parseFloat(e.target.value) || 0
                                  )
                                }
                                className="font-mono"
                              />
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </FieldContent>
                </Field>
              </FieldGroup>
            </CardContent>
          </Card>
        </div>

        {/* Summary Sidebar */}
        <div className="lg:col-span-1">
          <Card className="sticky top-6 shadow-none">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Info className="h-4 w-4 text-primary" />
                Summary
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Title</div>
                <div className="font-medium">{title || "Untitled Split"}</div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Token</div>
                <div className="flex items-center gap-2">
                  <Image
                    src={tokenConfig[token].icon}
                    alt={tokenConfig[token].label}
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  <span className="font-medium">{tokenConfig[token].label}</span>
                  {!tokenConfig[token].available && (
                    <span className="text-xs text-muted-foreground bg-muted px-2 py-0.5 rounded">Upcoming</span>
                  )}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Split Type</div>
                <div className="font-medium capitalize">
                  {splitType === "equal" ? "Equal Split" : "Custom Amount"}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Total Amount</div>
                <div className="text-lg font-bold font-mono">
                  {totalAmount || "0.00"} {tokenConfig[token].label}
                </div>
              </div>
              <Separator />
              <div className="space-y-2">
                <div className="text-sm text-muted-foreground">Participants</div>
                <div className="font-medium">{participants.length} person{participants.length !== 1 ? "s" : ""}</div>
              </div>
              {splitType === "equal" && totalAmount && !isNaN(parseFloat(totalAmount)) && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Per Person</div>
                    <div className="text-lg font-semibold font-mono text-primary">
                      {calculateEqualShare().toFixed(2)} {tokenConfig[token].label}
                    </div>
                  </div>
                </>
              )}
              {splitType === "custom" && totalAmount && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <div className="text-sm text-muted-foreground">Custom Total</div>
                    <div
                      className={`text-lg font-semibold font-mono ${
                        showCustomWarning
                          ? "text-destructive"
                          : Math.abs(difference) < 0.01
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-foreground"
                      }`}
                    >
                      {customTotal.toFixed(2)} {tokenConfig[token].label}
                    </div>
                    {showCustomWarning && (
                      <div className="text-xs text-destructive">
                        {difference > 0
                          ? `Exceeds total by ${difference.toFixed(2)} ${tokenConfig[token].label}`
                          : `Short by ${Math.abs(difference).toFixed(2)} ${tokenConfig[token].label}`}
                      </div>
                    )}
                    {!showCustomWarning && Math.abs(difference) < 0.01 && total > 0 && (
                      <div className="text-xs text-emerald-600 dark:text-emerald-400">
                        ✓ Amounts match
                      </div>
                    )}
                  </div>
                </>
              )}
              <Separator />
              <Button
                onClick={handleSubmit}
                disabled={isSubmitting}
                className="w-full"
                size="lg"
              >
                {isSubmitting ? "Creating..." : "Create Split"}
              </Button>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Success Dialog */}
      <Dialog open={showSuccessDialog} onOpenChange={setShowSuccessDialog}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <div className="flex items-center gap-3">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 dark:bg-emerald-900/20">
                <CheckCircle2 className="h-6 w-6 text-emerald-600 dark:text-emerald-400" />
              </div>
              <div>
                <DialogTitle className="text-xl">Split Created Successfully!</DialogTitle>
                <DialogDescription className="mt-1">
                  Your split has been created on the blockchain
                </DialogDescription>
              </div>
            </div>
          </DialogHeader>
          
          {successData && (
            <div className="space-y-4 py-4">
              {/* Split ID */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Split ID</Label>
                <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
                  <span className="font-mono text-sm font-semibold flex-1">{successData.splitId}</span>
                  <Button
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8"
                    onClick={() => copyToClipboard(successData.splitId.toString(), "Split ID")}
                  >
                    <Copy className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {/* Contract Address */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Contract Address</Label>
                <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
                  <span className="font-mono text-xs flex-1 min-w-0 break-all" title={successData.contractAddress}>
                    {truncateAddress(successData.contractAddress)}
                  </span>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => copyToClipboard(successData.contractAddress, "Contract address")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => window.open(`https://sepolia.arbiscan.io/address/${successData.contractAddress}`, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>

              {/* Transaction Hash */}
              <div className="space-y-2">
                <Label className="text-sm font-medium text-muted-foreground">Transaction Hash</Label>
                <div className="flex items-center gap-2 rounded-lg border bg-muted/50 p-3">
                  <span className="font-mono text-xs flex-1 min-w-0 break-all" title={successData.txHash}>
                    {truncateAddress(successData.txHash)}
                  </span>
                  <div className="flex gap-1 shrink-0">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => copyToClipboard(successData.txHash, "Transaction hash")}
                    >
                      <Copy className="h-4 w-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      className="h-8 w-8 shrink-0"
                      onClick={() => window.open(`https://sepolia.arbiscan.io/tx/${successData.txHash}`, "_blank")}
                    >
                      <ExternalLink className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-3 pt-4">
            <Button
              variant="outline"
              className="flex-1"
              onClick={() => setShowSuccessDialog(false)}
            >
              Close
            </Button>
            <Button
              className="flex-1"
              onClick={() => {
                setShowSuccessDialog(false)
                router.push("/my-splits")
              }}
            >
              View My Splits
            </Button>
          </div>
        </DialogContent>
      </Dialog>
    </div>
    </>
  )
}
