"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { Home, CreditCard, Building2, PiggyBank, Users, Send, Plane, HelpCircle, ArrowBigDown, Banknote, Landmark, Wallet, Headset, Copy, DollarSign, MessageSquare, BookOpen, Sparkles, List, ListPlus, HomeIcon } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Card } from "@/components/ui/card"
import { useState } from "react"
import { useToast } from "@/hooks/use-toast"

export function DashboardSidebar() {
  const pathname = usePathname()
  const { toast } = useToast()
  const [copied, setCopied] = useState(false)

  const isActive = (href: string) => {
    if (href === "" || href === "#") {
      return pathname === "" || pathname === "/"
    }
    if (href === "/chat-ai") {
      return pathname === "/chat-ai"
    }
    return pathname === href || pathname?.startsWith(href + "/")
  }

  const inviteLink = typeof window !== 'undefined' ? window.location.origin : ''
  const inviteText = "Check out Token Platform!"

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(inviteLink)
      setCopied(true)
      toast({
        title: "Copied!",
        description: "Invite link copied to clipboard",
      })
      setTimeout(() => setCopied(false), 2000)
    } catch (error) {
      toast({
        title: "Error",
        description: "Failed to copy link",
        variant: "destructive",
      })
    }
  }

  const handleShare = (platform: string) => {
    const url = inviteLink
    const text = inviteText

    switch (platform) {
      case "x":
        window.open(`https://twitter.com/intent/tweet?text=${encodeURIComponent(text)}&url=${encodeURIComponent(url)}`, "_blank")
        break
      case "whatsapp":
        window.open(`https://wa.me/?text=${encodeURIComponent(text + " " + url)}`, "_blank")
        break
      case "telegram":
        window.open(`https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, "_blank")
        break
    }
  }

  return (
    <aside className="w-[230px] h-full bg-gradient-to-b from-white to-[oklch(0.95_0.05_264/0.3)] dark:from-card dark:to-[oklch(0.21_0_0/0.3)] flex flex-col overflow-hidden">
      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-4 py-2 pt-6">

      <Link
          href="/"
          className={`flex items-center justify-between px-3 py-2.5 rounded-lg mb-1 relative overflow-hidden group ${
            isActive("/") 
              ? "text-primary bg-primary/5" 
              : "text-muted-foreground hover:bg-gradient-to-r hover:from-primary/10 hover:via-primary/5 hover:to-transparent hover:text-foreground dark:hover:bg-gradient-to-r dark:hover:from-primary/10 dark:hover:via-primary/5 dark:hover:to-transparent dark:hover:text-foreground transition-all duration-300"
          }`}
        >
          <div className="flex items-center gap-4">
            <HomeIcon className="w-5 h-5" />
            <span className="text-base">Home</span>
          </div>
        
        </Link>

        <Link
          href="/create-split"
          className={`flex items-center justify-between px-3 py-2.5 rounded-lg mb-1 ${
            isActive("/create-split") 
              ? "text-primary" 
              : "text-muted-foreground hover:bg-neutral-100/50 hover:text-foreground dark:hover:bg-neutral-900/50 dark:hover:text-foreground"
          }`}
        >
     

          <div className="flex items-center gap-4 relative z-10">
            <div className="relative">
              <ListPlus className="w-5 h-5" />
              <div className="absolute -top-1 -right-1 w-2 h-2 bg-emerald-500 rounded-full animate-pulse"></div>
            </div>
            <span className="text-base font-medium">Create Split</span>
          </div>
       
        </Link>

        <Link 
          href="/my-splits" 
          className={`flex items-center gap-4 px-3 py-2.5 rounded-lg mb-1 ${
            isActive("/my-splits") 
              ? "text-primary" 
              : "text-muted-foreground hover:bg-neutral-100/50 hover:text-foreground dark:hover:bg-neutral-900/50 dark:hover:text-foreground"
          }`}
        >
          <List className="w-5 h-5" />
          <span className="">My Splits</span>
        </Link>



      </nav>

      {/* Invite Card */}
      <div className="flex-shrink-0 p-3 pb-3">
        <Card className="p-4 bg-card">
          <div className="flex gap-2 mb-3">
            <div className="w-8 h-8 rounded-full bg-muted"></div>
            <div className="w-8 h-8 rounded-full bg-muted -ml-3"></div>
            <div className="w-8 h-8 rounded-full bg-muted -ml-3"></div>
          </div>
          <h3 className="text-base font-semibold text-foreground mb-1">Tell Your Friends</h3>
          <p className="text-xs text-muted-foreground leading-relaxed mb-3">
            Tell your friends and family about us
          </p>
          <div className="flex items-center gap-2">
            <button
              onClick={() => handleShare("x")}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
              title="Share on X"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="currentColor">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </button>
            <button
              onClick={() => handleShare("whatsapp")}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
              title="Share on WhatsApp"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#25D366">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z" />
              </svg>
            </button>
            <button
              onClick={() => handleShare("telegram")}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
              title="Share on Telegram"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24" fill="#0088cc">
                <path d="M11.944 0A12 12 0 0 0 0 12a12 12 0 0 0 12 12 12 12 0 0 0 12-12A12 12 0 0 0 12 0a12 12 0 0 0-.056 0zm4.962 7.224c.1-.002.321.023.465.14a.506.506 0 0 1 .171.325c.016.093.036.306.02.472-.18 1.898-.962 6.502-1.36 8.627-.168.9-.499 1.201-.82 1.23-.696.065-1.225-.46-1.9-.902-1.056-.693-1.653-1.124-2.678-1.8-1.185-.78-.417-1.21.258-1.91.177-.184 3.247-2.977 3.307-3.23.007-.032.014-.15-.056-.212s-.174-.041-.249-.024c-.106.024-1.793 1.14-5.061 3.345-.48.33-.913.49-1.302.48-.428-.008-1.252-.241-1.865-.44-.752-.245-1.349-.374-1.297-.789.027-.216.325-.437.893-.663 3.498-1.524 5.83-2.529 6.998-3.014 3.332-1.386 4.025-1.627 4.476-1.686z" />
              </svg>
            </button>
            <button
              onClick={handleCopy}
              className="p-1.5 rounded-md hover:bg-muted transition-colors"
              title="Copy link"
            >
              {copied ? (
                <svg className="w-4 h-4 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <Copy className="w-4 h-4" />
              )}
            </button>
          </div>
        </Card>
      </div>

      {/* Help */}
      <div className="flex-shrink-0 p-3 pb-4">
        <Link
          href="/help"
          className={`flex items-center gap-4 px-3 py-2.5 rounded-lg ${
            isActive("/help") 
              ? "text-primary" 
              : "text-muted-foreground hover:bg-neutral-100/50 hover:text-foreground dark:hover:bg-neutral-900/50 dark:hover:text-foreground"
          }`}
        >
          <HelpCircle className="w-5 h-5" />
          <span className="text-base">Help</span>
        </Link>
      </div>
    </aside>
  )
}
