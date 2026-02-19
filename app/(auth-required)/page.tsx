"use client"

import { useTokensAndBalances } from "@/contexts/tokens-balances-context"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { 
  Wallet, 
  Users, 
  Share2, 
  DollarSign, 
  CheckCircle2, 
  Github, 
  AlertTriangle, 
  Code2,
  ArrowRight,
  Sparkles,
  Zap
} from "lucide-react"
import Link from "next/link"

const DashboardPage = () => {
  const { tokensAndBalances } = useTokensAndBalances()

  const steps = [
    {
      number: 1,
      icon: Wallet,
      title: "Connect Your Wallet",
      description: "Connect your crypto wallet to get started. No account or KYC required—just your wallet."
    },
    {
      number: 2,
      icon: DollarSign,
      title: "Create a Split",
      description: "Enter the total amount and add participants. You can split any expense with friends, family, or colleagues."
    },
    {
      number: 3,
      icon: Users,
      title: "Add Participants",
      description: "Add wallet addresses or share a link. Participants can pay directly from the shared link—no app download needed."
    },
    {
      number: 4,
      icon: Share2,
      title: "Share the Link",
      description: "Share the split link via WhatsApp, email, or any messaging app. Everyone gets their own payment link."
    },
    {
      number: 5,
      icon: CheckCircle2,
      title: "Automatic Settlement",
      description: "Once everyone pays their share, funds are automatically released to you. No manual collection needed!"
    }
  ]

  return (
    <div className="space-y-8">
      {/* Hero Section */}
      <div className="space-y-4">
        <div className="flex items-center gap-3 flex-wrap">
          <h1 className="text-4xl font-bold tracking-tight">Welcome to Splyt</h1>
          <Badge variant="outline" className="bg-amber-50 dark:bg-amber-950/20 border-amber-200 dark:border-amber-800 text-amber-700 dark:text-amber-400">
            <AlertTriangle className="w-3 h-3 mr-1" />
            Testnet
          </Badge>
          <Badge variant="outline" className="bg-blue-50 dark:bg-blue-950/20 border-blue-200 dark:border-blue-800 text-blue-700 dark:text-blue-400">
            <Code2 className="w-3 h-3 mr-1" />
            Under Development
          </Badge>
        </div>
        <p className="text-lg text-muted-foreground max-w-2xl">
          Split bills effortlessly using USDC on Arbitrum. Zero gas fees, instant settlements, and no accounts required. 
          Perfect for splitting expenses with anyone, anywhere in the world.
        </p>
      </div>

      {/* Status Alerts */}
      <div className="grid gap-4 md:grid-cols-2">
        <Alert className="border-amber-200 dark:border-amber-800 bg-amber-50/50 dark:bg-amber-950/10">
          <AlertTriangle className="h-4 w-4 text-amber-600 dark:text-amber-400" />
          <AlertTitle className="text-amber-900 dark:text-amber-100">Testnet Environment</AlertTitle>
          <AlertDescription className="text-amber-800 dark:text-amber-200">
            You're currently using Splyt on Arbitrum Sepolia testnet. This is a testing environment—use testnet tokens only.
          </AlertDescription>
        </Alert>

        <Alert className="border-blue-200 dark:border-blue-800 bg-blue-50/50 dark:bg-blue-950/10">
          <Code2 className="h-4 w-4 text-blue-600 dark:text-blue-400" />
          <AlertTitle className="text-blue-900 dark:text-blue-100">Under Active Development</AlertTitle>
          <AlertDescription className="text-blue-800 dark:text-blue-200">
            Splyt is being actively developed. Features may change, and we welcome your feedback and contributions!
          </AlertDescription>
        </Alert>
      </div>

      {/* How to Create a Split */}
      <div className="space-y-4">
        <div className="flex items-center gap-2">
          <Sparkles className="w-5 h-5 text-primary" />
          <h2 className="text-2xl font-semibold">How to Create a Split</h2>
        </div>
        <p className="text-muted-foreground">
          Follow these simple steps to split any expense with your friends, family, or colleagues.
        </p>
      </div>

      {/* Steps Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {steps.map((step) => {
          const Icon = step.icon
          return (
            <Card key={step.number} className="relative overflow-hidden group hover:shadow-md transition-shadow">
              <div className="absolute top-0 right-0 w-20 h-20 bg-primary/5 rounded-bl-full" />
              <CardHeader>
                <div className="flex items-start gap-4">
                  <div className="flex-shrink-0 w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <Icon className="w-6 h-6 text-primary" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <Badge variant="secondary" className="w-6 h-6 p-0 flex items-center justify-center text-xs">
                        {step.number}
                      </Badge>
                      <CardTitle className="text-lg">{step.title}</CardTitle>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-base leading-relaxed">
                  {step.description}
                </CardDescription>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Quick Start CTA */}
      <Card className="bg-gradient-to-br from-primary/5 to-primary/10 border-primary/20">
        <CardHeader>
          <div className="flex items-center gap-2">
            <Zap className="w-5 h-5 text-primary" />
            <CardTitle className="text-xl">Ready to Get Started?</CardTitle>
          </div>
          <CardDescription className="text-base">
            Create your first split and experience seamless bill splitting with zero gas fees.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Link href="/create-split">
            <Button size="lg" className="w-full sm:w-auto">
              Create a Split
              <ArrowRight className="w-4 h-4 ml-2" />
            </Button>
          </Link>
        </CardContent>
      </Card>

      {/* GitHub Contribution CTA */}
      <Card className="border-2 border-dashed hover:border-solid transition-all">
        <CardHeader>
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <Github className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1">
              <CardTitle className="text-xl">Join Our Open Source Community</CardTitle>
              <CardDescription className="text-base mt-1">
                Splyt is open source and we'd love your contributions!
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-muted-foreground leading-relaxed">
            We're building Splyt in the open and invite developers, designers, and enthusiasts to contribute. 
            Whether it's fixing bugs, adding features, improving documentation, or sharing ideas—every contribution matters!
          </p>
          <div className="flex flex-col sm:flex-row gap-3">
            <Button 
              variant="default" 
              size="lg" 
              asChild
              className="flex-1"
            >
              <a 
                href="https://github.com/splytOnline" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                <Github className="w-4 h-4 mr-2" />
                View on GitHub
              </a>
            </Button>
            <Button 
              variant="outline" 
              size="lg" 
              asChild
              className="flex-1"
            >
              <a 
                href="https://github.com/splytOnline" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center justify-center"
              >
                Contribute
                <ArrowRight className="w-4 h-4 ml-2" />
              </a>
            </Button>
          </div>
          <div className="pt-4 border-t">
            <p className="text-sm text-muted-foreground">
              <strong className="text-foreground">What you can contribute:</strong> Code improvements, bug fixes, 
              feature implementations, UI/UX enhancements, documentation, testing, and more!
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Key Features */}
      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Zap className="w-5 h-5 text-primary" />
              Zero Gas Fees
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              We cover all gas costs. You pay exactly what you owe, nothing more.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              No Accounts Needed
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Just connect your wallet. No KYC, no sign-ups, no email verification.
            </CardDescription>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="text-lg flex items-center gap-2">
              <CheckCircle2 className="w-5 h-5 text-primary" />
              Automatic Settlement
            </CardTitle>
          </CardHeader>
          <CardContent>
            <CardDescription>
              Funds release automatically once everyone pays. No manual collection needed.
            </CardDescription>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default DashboardPage