"use client"

import { useEffect } from "react"
import { usePathname } from "next/navigation"

// Map of paths to their corresponding page titles
const pageTitleMap: Record<string, string> = {
  "/": "Dashboard | Splyt",
  "/my-splits": "My Splits | Splyt",
  "/create-split": "Create Split | Splyt",
  "/help": "Help & Support | Splyt",
}

/**
 * Get page title based on pathname, handling dynamic routes
 */
function getPageTitle(pathname: string): string {
  // Check exact matches first
  if (pageTitleMap[pathname]) {
    return pageTitleMap[pathname]
  }

  // Handle dynamic routes
  if (pathname.startsWith("/help/ticket/")) {
    return "Ticket Details | Splyt"
  }

  // Default fallback
  return "Splyt"
}

/**
 * Hook to set the page title dynamically based on the current route
 * @param customTitle - Optional custom title to override the default mapping
 */
export function usePageTitle(customTitle?: string) {
  const pathname = usePathname()

  useEffect(() => {
    const title = customTitle 
      ? `${customTitle} | Splyt`
      : getPageTitle(pathname)
    
    document.title = title
  }, [pathname, customTitle])
}
