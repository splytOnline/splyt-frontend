"use client"

import React, { Suspense } from "react"
import { HelpCircle, Search } from "lucide-react"
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion"
import { Input } from "@/components/ui/input"
import { Spinner } from "@/components/ui/spinner"

// FAQ data about Splyt
const faqData = [
  {
    question: "What is Splyt?",
    answer: "Splyt is a bill-splitting app that lets groups split any expense using USDC on Arbitrum. Think Venmo meets Web3. Create a split, share a link via WhatsApp, and everyone pays their share. When everyone's paid, funds release automatically. No fees. No friction. No awkward reminders."
  },
  {
    question: "Are there any fees?",
    answer: "No, Splyt is completely free. We cover all gas costs, so you pay exactly what you owe, nothing more. Built on Arbitrum's L2, transactions cost pennies, and we sponsor all gas fees so users pay absolutely nothing. Ever."
  },
  {
    question: "How do I create a split?",
    answer: "Creating a split is instant and easy. Just create a split with the total amount, add participants, and share the link via WhatsApp or any messaging app. No accounts or KYC required—just connect your wallet. Everyone can pay their share directly from the link."
  },
  {
    question: "What network does Splyt use and why?",
    answer: "Splyt uses Arbitrum because it offers low fees ($0.10 per split vs $5+ on Ethereum mainnet), fast finality (2-second confirmations), native USDC support, and a mature stablecoin infrastructure. This combination of speed, cost, and liquidity makes it perfect for everyday bill splitting."
  },
  {
    question: "How do payments work?",
    answer: "When you create a split, smart contracts hold the funds. Each participant pays their share using USDC. Once everyone has paid, the funds are automatically released to the split creator. The process is trustless—no middleman, and the smart contract ensures fair settlement."
  },
  {
    question: "Is Splyt secure?",
    answer: "Yes, Splyt is non-custodial, meaning the backend never holds your private keys or funds. All settlements happen on-chain via smart contracts. The contracts are immutable and open source, so you can verify everything. Even if the backend gets hacked, your funds remain safe in the smart contracts."
  },
  {
    question: "Do I need an account?",
    answer: "No account needed! Splyt works with just your crypto wallet. No KYC, no sign-ups, no email verification. Just connect your wallet and start splitting bills. It's designed to be mobile-first and works in any browser—no app download required."
  },
  {
    question: "Does Splyt work internationally?",
    answer: "Yes! Splyt works globally. USDC is USDC everywhere—no currency conversion, no borders. Since it's built on blockchain, anyone with a wallet can participate regardless of their location. Perfect for splitting expenses with friends, family, or colleagues anywhere in the world."
  }
]

const HelpPageContent = () => {
  const [searchQuery, setSearchQuery] = React.useState("")

  // Filter FAQs based on search query
  const filteredFAQs = faqData.filter(
    faq =>
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  )

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Help & Support</h1>
        <p className="text-muted-foreground mt-2">
          Find answers to common questions about Splyt
        </p>
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
        <Input
          placeholder="Search for answers..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-12 text-base"
        />
      </div>

      {/* FAQ Accordion */}
      <div className="space-y-4">
        {filteredFAQs.length === 0 ? (
          <div className="bg-card rounded-lg border border-border">
            <div className="py-12 text-center px-6">
              <Search className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
              <p className="text-muted-foreground">
                No results found matching your search. Try different keywords or{" "}
                <button
                  onClick={() => setSearchQuery("")}
                  className="text-primary hover:underline"
                >
                  clear your search
                </button>
              </p>
            </div>
          </div>
        ) : (
          <div className="bg-card rounded-lg border border-border overflow-hidden">
            <Accordion type="single" collapsible className="w-full">
              {filteredFAQs.map((faq, index) => (
                <AccordionItem
                  key={index}
                  value={`item-${index}`}
                  className="border-b last:border-b-0"
                >
                  <AccordionTrigger className="px-6 py-4 hover:no-underline hover:bg-muted/50">
                    <div className="flex items-start gap-3 text-left">
                      <div className="p-1.5 rounded-md bg-primary/10 shrink-0 mt-0.5">
                        <HelpCircle className="w-4 h-4 text-primary" />
                      </div>
                      <span className="font-medium text-foreground leading-relaxed">
                        {faq.question}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-6 pb-4 pl-12">
                    <p className="text-muted-foreground leading-relaxed">
                      {faq.answer}
                    </p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        )}
      </div>
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
