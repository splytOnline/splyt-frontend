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
import { toast } from "sonner"
import { Separator } from "@/components/ui/separator"
import { useTokensAndBalances } from "@/contexts/tokens-balances-context"
import { useEffect } from "react"
import { useAccount } from "wagmi"
import { ConnectWalletPrompt } from "@/components/connect-wallet-prompt"
import { usePageTitle } from "@/hooks/use-page-title"
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
  const [token, setToken] = useState<"USDC" | "USDT">("USDC")
  const [splitType, setSplitType] = useState<SplitType>("equal")
  const [totalAmount, setTotalAmount] = useState("")
  
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
    setParticipants(
      participants.map((p) =>
        p.id === id ? { ...p, [field]: value } : p
      )
    )
  }

  const calculateEqualShare = () => {
    const total = parseFloat(totalAmount)
    if (isNaN(total) || total <= 0) return 0
    return total / participants.length
  }

  const calculateCustomTotal = () => {
    return participants.reduce((sum, p) => sum + (p.amount || 0), 0)
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
        toast.error(`Custom amounts must equal total amount (${total.toFixed(2)} ${token})`)
        return false
      }
    }
    return true
  }

  const handleSubmit = async () => {
    if (!validateForm()) return

    setIsSubmitting(true)
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1500))

      const splitData = {
        title: title.trim(),
        token,
        splitType,
        totalAmount: parseFloat(totalAmount),
        participants: participants.map((p) => ({
          name: p.name.trim(),
          walletAddress: p.walletAddress.trim(),
          share: splitType === "equal" ? calculateEqualShare() : (p.amount || 0),
        })),
      }

      console.log("Creating split:", splitData)
      toast.success("Split created successfully!")
      
      // Redirect to my-splits page
      setTimeout(() => {
        router.push("/my-splits")
      }, 1000)
    } catch (error) {
      toast.error("Failed to create split. Please try again.")
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
                      <Select value={token} onValueChange={(value: "USDC" | "USDT") => setToken(value)}>
                        <SelectTrigger className="w-[140px]">
                          <div className="flex items-center gap-2">
                            <Image
                              src={`/icons/${token.toLowerCase()}.svg`}
                              alt={token}
                              width={16}
                              height={16}
                              className="w-4 h-4"
                            />
                            <span>{token}</span>
                          </div>
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="USDC">
                            <div className="flex items-center gap-2">
                              <Image
                                src="/icons/usdc.svg"
                                alt="USDC"
                                width={20}
                                height={20}
                                className="w-5 h-5"
                              />
                              <span>USDC</span>
                            </div>
                          </SelectItem>
                          <SelectItem value="USDT">
                            <div className="flex items-center gap-2">
                              <Image
                                src="/icons/usdt.svg"
                                alt="USDT"
                                width={20}
                                height={20}
                                className="w-5 h-5"
                              />
                              <span>USDT</span>
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    <FieldDescription>
                      {splitType === "equal" && totalAmount && !isNaN(parseFloat(totalAmount)) ? (
                        <>
                          Each participant will pay{" "}
                          <span className="font-semibold font-mono">
                            {calculateEqualShare().toFixed(2)} {token}
                          </span>
                        </>
                      ) : (
                        "Enter the total amount and select token (USDC or USDT on Arbitrum)"
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
                          </div>
                          {splitType === "custom" && (
                            <div className="space-y-1.5">
                              <Label className="text-sm">Amount ({token})</Label>
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
                    src={`/icons/${token.toLowerCase()}.svg`}
                    alt={token}
                    width={20}
                    height={20}
                    className="w-5 h-5"
                  />
                  <span className="font-medium">{token}</span>
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
                  {totalAmount || "0.00"} {token}
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
                      {calculateEqualShare().toFixed(2)} {token}
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
                      {customTotal.toFixed(2)} {token}
                    </div>
                    {showCustomWarning && (
                      <div className="text-xs text-destructive">
                        {difference > 0
                          ? `Exceeds total by ${difference.toFixed(2)} ${token}`
                          : `Short by ${Math.abs(difference).toFixed(2)} ${token}`}
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
    </div>
  )
}
