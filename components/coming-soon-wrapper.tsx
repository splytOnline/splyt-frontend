"use client"

import { ReactNode } from "react"
import { Zap, Sparkles } from "lucide-react"
import Image from "next/image"

interface ComingSoonWrapperProps {
  children: ReactNode
}

export function ComingSoonWrapper({ children }: ComingSoonWrapperProps) {
  // Check if dev mode is enabled via environment variable
  const isDevMode = process.env.NEXT_PUBLIC_DEV_MODE === "true" || process.env.DEV_MODE === "true"

  // If dev mode is enabled, show the actual content
  if (isDevMode) {
    return <>{children}</>
  }

  // Otherwise, show coming soon screen
  return (
    <div className="fixed inset-0 z-[9999] bg-gradient-to-br from-primary/10 via-background to-primary/5 flex items-center justify-center p-4">
      <div className="max-w-2xl w-full text-center space-y-8">
        {/* Logo/Icon */}
        <div className="flex justify-center">
          <div className="relative">
              <Image src={"/split_logo_text.svg"} alt="Splyt" width={80} height={80} className="w-36 h-24 text-primary" />
           
          </div>
        </div>

        {/* Main Content */}
        <div className="space-y-4">
          <h1 className="text-5xl md:text-6xl font-bold text-foreground">
            Coming Soon
          </h1>
          <p className="text-xl md:text-2xl text-muted-foreground">
            We're building something amazing
          </p>
        </div>

        {/* Description */}
        <div className="space-y-3 pt-4">
          <p className="text-lg text-muted-foreground max-w-md mx-auto">
            Splyt is launching soon. Split bills with friends using crypto. Zero fees. Zero friction.
          </p>
          <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
            <Sparkles className="w-4 h-4" />
            <span>Stay tuned for updates</span>
          </div>
        </div>

        {/* Decorative Elements */}
        <div className="absolute top-20 left-20 w-32 h-32 bg-primary/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-20 right-20 w-40 h-40 bg-primary/5 rounded-full blur-3xl"></div>
      </div>
    </div>
  )
}
