"use client"

import { usePageTitle } from "@/hooks/use-page-title"

/**
 * Component that automatically updates the page title based on the current route
 * This should be placed in the layout or at the top level of your app
 */
export function PageTitle() {
  usePageTitle()
  return null // This component doesn't render anything
}
