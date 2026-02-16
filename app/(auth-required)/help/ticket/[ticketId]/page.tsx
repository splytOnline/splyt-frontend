"use client"

import React, { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { ArrowLeft, FileText, Tag, Calendar, Clock, MessageSquare, BookOpen, AlertCircle, CheckCircle2, XCircle, Clock as ClockIcon, TrendingUp, Send, User, Shield } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import { Spinner } from "@/components/ui/spinner"

interface TicketComment {
  by: string
  comment: string
  commentDate: string
  commentFile: string
}

interface TicketDetails {
  ticketId: string
  userId: string
  ticketTitle: string
  ticketDescription: string
  ticketStatus: string
  ticketPriority: string
  ticketCategory: string
  ticketComments: TicketComment[]
  createdAt: string
  updatedAt: string
}

interface TicketApiResponse {
  success: boolean
  status: number
  message: string
  data: TicketDetails
}

const getStatusBadge = (status: string) => {
  const normalizedStatus = status.replace("-", "_")
  const statusConfig = {
    open: { variant: "default" as const, icon: AlertCircle, label: "Open" },
    "in-progress": { variant: "secondary" as const, icon: ClockIcon, label: "In Progress" },
    in_progress: { variant: "secondary" as const, icon: ClockIcon, label: "In Progress" },
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

const linkifyText = (text: string) => {
  // Email regex pattern - more specific, requires @ and valid domain with TLD
  const emailRegex = /\b([a-zA-Z0-9](?:[a-zA-Z0-9._-]*[a-zA-Z0-9])?@[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,})\b/gi
  // URL regex pattern - requires valid TLD (2+ letters) and proper structure
  // Matches: http://domain.tld, https://domain.tld, www.domain.tld, domain.tld/path
  const urlRegex = /\b(https?:\/\/[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}(?::[0-9]+)?(?:\/[^\s<>"{}|\\^`\[\]]*)?|www\.[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}(?:\/[^\s<>"{}|\\^`\[\]]*)?|[a-zA-Z0-9](?:[a-zA-Z0-9.-]*[a-zA-Z0-9])?\.[a-zA-Z]{2,}(?:\/[^\s<>"{}|\\^`\[\]]*)?)\b/gi

  const parts: Array<{ text: string; type: 'text' | 'email' | 'url'; index: number }> = []
  
  // Find all emails first (they have priority over URLs)
  const emailMatches: Array<{ text: string; index: number }> = []
  let emailMatch: RegExpExecArray | null
  while ((emailMatch = emailRegex.exec(text)) !== null) {
    emailMatches.push({ text: emailMatch[0], index: emailMatch.index })
  }
  
  // Find all URLs, but exclude those that overlap with emails
  const urlMatches: Array<{ text: string; index: number }> = []
  urlRegex.lastIndex = 0
  let urlMatch: RegExpExecArray | null
  while ((urlMatch = urlRegex.exec(text)) !== null) {
    // Check if this URL overlaps with an email (email takes priority)
    const overlapsWithEmail = emailMatches.some(email => {
      const urlStart = urlMatch!.index
      const urlEnd = urlMatch!.index + urlMatch![0].length
      const emailStart = email.index
      const emailEnd = email.index + email.text.length
      // Check if URLs and emails overlap
      return (urlStart < emailEnd && urlEnd > emailStart)
    })
    
    // Also check if URL is actually part of an email (e.g., domain.tld in email@domain.tld)
    const isPartOfEmail = emailMatches.some(email => {
      const urlStart = urlMatch!.index
      const urlEnd = urlMatch!.index + urlMatch![0].length
      const emailStart = email.index
      const emailEnd = email.index + email.text.length
      return urlStart >= emailStart && urlEnd <= emailEnd
    })
    
    if (!overlapsWithEmail && !isPartOfEmail) {
      urlMatches.push({ text: urlMatch[0], index: urlMatch.index })
    }
  }
  
  // Combine and sort all matches
  const allMatches = [
    ...emailMatches.map(m => ({ ...m, type: 'email' as const })),
    ...urlMatches.map(m => ({ ...m, type: 'url' as const }))
  ].sort((a, b) => a.index - b.index)
  
  // Remove overlapping matches (keep the first one)
  const filteredMatches: Array<{ text: string; type: 'email' | 'url'; index: number }> = []
  allMatches.forEach(match => {
    const overlaps = filteredMatches.some(existing => {
      const matchStart = match.index
      const matchEnd = match.index + match.text.length
      const existingStart = existing.index
      const existingEnd = existing.index + existing.text.length
      return (matchStart < existingEnd && matchEnd > existingStart)
    })
    if (!overlaps) {
      filteredMatches.push(match)
    }
  })
  
  // Build parts array
  let lastIndex = 0
  filteredMatches.forEach(match => {
    if (match.index > lastIndex) {
      parts.push({ text: text.substring(lastIndex, match.index), type: 'text', index: lastIndex })
    }
    parts.push({ text: match.text, type: match.type, index: match.index })
    lastIndex = match.index + match.text.length
  })
  
  if (lastIndex < text.length) {
    parts.push({ text: text.substring(lastIndex), type: 'text', index: lastIndex })
  }
  
  return parts.length > 0 ? parts : [{ text, type: 'text' as const, index: 0 }]
}

const renderLinkifiedText = (text: string) => {
  const parts = linkifyText(text)
  
  return (
    <>
      {parts.map((part, index) => {
        if (part.type === 'email') {
          return (
            <a
              key={`${part.type}-${part.index}-${index}`}
              href={`mailto:${part.text}`}
              className="text-primary hover:underline break-all"
            >
              {part.text}
            </a>
          )
        } else if (part.type === 'url') {
          let href = part.text
          if (!href.startsWith('http://') && !href.startsWith('https://')) {
            href = `https://${href}`
          }
          return (
            <a
              key={`${part.type}-${part.index}-${index}`}
              href={href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-primary hover:underline break-all"
            >
              {part.text}
            </a>
          )
        } else {
          return <span key={`${part.type}-${part.index}-${index}`}>{part.text}</span>
        }
      })}
    </>
  )
}

export default function TicketDetailPage() {
  const params = useParams()
  const router = useRouter()
  const ticketId = params.ticketId as string

  const [ticket, setTicket] = useState<TicketDetails | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [newComment, setNewComment] = useState("")

  useEffect(() => {
    const fetchTicket = async () => {
      setIsLoading(true)
      try {
        const response = await fetch("/api/help/tickets/get", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ticketId }),
        })

        const data: TicketApiResponse = await response.json()

        if (response.ok && data.success) {
          setTicket(data.data)
        } else {
          console.error("Error fetching ticket:", data.message)
        }
      } catch (error) {
        console.error("Error fetching ticket:", error)
      } finally {
        setIsLoading(false)
      }
    }

    if (ticketId) {
      fetchTicket()
    }
  }, [ticketId])

  const handleSubmitComment = async () => {
    if (!newComment.trim()) return

    setIsSubmitting(true)
    try {
      // Call API to add comment
      const commentResponse = await fetch("/api/help/tickets/comment", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          ticketId,
          comment: newComment,
          commentFile: "",
        }),
      })

      if (commentResponse.ok) {
        // Refresh the ticket data to get updated comments
        const response = await fetch("/api/help/tickets/get", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({ ticketId }),
        })

        const data: TicketApiResponse = await response.json()

        if (response.ok && data.success) {
          setTicket(data.data)
          setNewComment("")
        }
      } else {
        const errorData = await commentResponse.json()
        console.error("Error submitting comment:", errorData)
        alert(errorData.message || "Failed to submit comment")
      }
    } catch (error) {
      console.error("Error submitting comment:", error)
      alert("Failed to submit comment. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-lg border border-border">
          <div className="py-16 text-center px-6">
            <Spinner className="w-8 h-8 mx-auto mb-4" />
            <p className="text-muted-foreground">Loading ticket details...</p>
          </div>
        </div>
      </div>
    )
  }

  if (!ticket) {
    return (
      <div className="space-y-6">
        <div className="bg-card rounded-lg border border-border">
          <div className="py-16 text-center px-6">
            <FileText className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">Ticket not found</h3>
            <p className="text-muted-foreground mb-6">
              The ticket you're looking for doesn't exist or you don't have access to it.
            </p>
            <Button onClick={() => router.back()} className="gap-2">
              <ArrowLeft className="w-4 h-4" />
              Go Back
            </Button>
          </div>
        </div>
      </div>
    )
  }

  const PriorityIcon = getPriorityIcon(ticket.ticketPriority)
  const isTicketClosed = ticket.ticketStatus === "resolved" || ticket.ticketStatus === "closed"

  return (
    <div className="space-y-6">
      {/* Back Button */}
      <Button
        variant="ghost"
        onClick={() => router.back()}
        className="gap-2"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Tickets
      </Button>

      {/* Ticket Header with Gradient */}
      <div className="bg-gradient-to-r from-primary/10 via-primary/5 to-transparent rounded-lg border-2 border-primary/20 overflow-hidden">
        <div className="px-6 py-6">
          <div className="flex items-start gap-4">
            <div className="p-3 rounded-xl bg-primary/20 border border-primary/30">
              <FileText className="w-6 h-6 text-primary" />
            </div>
            <div className="flex-1 space-y-4">
              <div className="flex items-start justify-between gap-4 flex-wrap">
                <div className="flex-1 min-w-0">
                  <h1 className="text-3xl font-bold text-foreground mb-3">{ticket.ticketTitle}</h1>
                  <div className="flex items-center gap-3 flex-wrap">
                    {getStatusBadge(ticket.ticketStatus)}
                    <div className={`flex items-center gap-1.5 px-3 py-1 rounded-lg text-sm font-medium ${getPriorityColor(ticket.ticketPriority)}`}>
                      <PriorityIcon className="w-4 h-4" />
                      <span className="capitalize">{ticket.ticketPriority} Priority</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-4 text-sm text-muted-foreground flex-wrap pt-2 border-t border-border/50">
                <div className="flex items-center gap-2">
                  <Tag className="w-4 h-4" />
                  <span className="font-semibold">{ticket.ticketId}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <span className="font-medium">{ticket.ticketCategory}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Calendar className="w-4 h-4" />
                  <span>Created {formatDate(ticket.createdAt)}</span>
                </div>
                <span>•</span>
                <div className="flex items-center gap-2">
                  <Clock className="w-4 h-4" />
                  <span>Updated {formatDate(ticket.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Ticket Description */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <BookOpen className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">Issue Description</h2>
          </div>
        </div>
        <div className="px-6 py-6">
          <p className="text-foreground leading-relaxed text-base whitespace-pre-wrap">
            {renderLinkifiedText(ticket.ticketDescription)}
          </p>
        </div>
      </div>

      {/* Comments Section */}
      <div className="bg-card rounded-lg border border-border overflow-hidden">
        <div className="bg-gradient-to-r from-primary/5 to-transparent border-b border-border px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="p-2 rounded-lg bg-primary/10">
              <MessageSquare className="w-5 h-5 text-primary" />
            </div>
            <h2 className="text-xl font-semibold">
              Conversation ({ticket.ticketComments.length})
            </h2>
          </div>
        </div>

        <div className="px-6 py-6">
          {/* Comments List */}
          <div className="space-y-4 mb-8">
            {ticket.ticketComments.length === 0 ? (
              <div className="text-center py-12 text-muted-foreground">
                <div className="w-16 h-16 mx-auto mb-4 rounded-full bg-muted flex items-center justify-center">
                  <MessageSquare className="w-8 h-8 opacity-50" />
                </div>
                <p className="text-base">No comments yet. Start the conversation!</p>
              </div>
            ) : (
              ticket.ticketComments.map((comment, index) => {
                const isAdmin = comment.by === "admin"
                return (
                  <div
                    key={index}
                    className={`flex gap-4 ${!isAdmin ? "flex-row-reverse" : ""}`}
                  >
                    <div className="flex-shrink-0">
                      <div className={`w-10 h-10 rounded-full flex items-center justify-center ${
                        isAdmin 
                          ? "bg-primary/20 border-2 border-primary/30" 
                          : "bg-muted border-2 border-border"
                      }`}>
                        {isAdmin ? (
                          <Shield className="w-5 h-5 text-primary" />
                        ) : (
                          <User className="w-5 h-5 text-muted-foreground" />
                        )}
                      </div>
                    </div>
                    <div className={`flex-1 min-w-0 ${!isAdmin ? "text-right" : ""}`}>
                      <div className={`inline-block max-w-[85%] ${
                        isAdmin 
                          ? "bg-primary/10 border border-primary/20 rounded-2xl rounded-tl-sm" 
                          : "bg-muted border border-border rounded-2xl rounded-tr-sm"
                      } p-4`}>
                        <div className={`flex items-center gap-2 mb-2 ${!isAdmin ? "justify-end" : ""}`}>
                          <span className={`text-sm font-semibold ${
                            isAdmin ? "text-primary" : "text-foreground"
                          }`}>
                            {isAdmin ? "Support Team" : "You"}
                          </span>
                          <span className="text-xs text-muted-foreground">
                            {formatDate(comment.commentDate)}
                          </span>
                        </div>
                        <p className={`leading-relaxed whitespace-pre-wrap ${
                          isAdmin ? "text-foreground" : "text-muted-foreground"
                        }`}>
                          {renderLinkifiedText(comment.comment)}
                        </p>
                        {comment.commentFile && (
                          <div className="mt-3 pt-3 border-t border-border/50">
                            <a
                              href={comment.commentFile}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="text-sm text-primary hover:underline flex items-center gap-2"
                            >
                              <FileText className="w-4 h-4" />
                              View attachment
                            </a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })
            )}
          </div>

          {/* Add Comment Form */}
          {isTicketClosed ? (
            <div className="border-t border-border pt-6">
              <div className="bg-muted/50 border border-border rounded-lg p-4 text-center">
                <p className="text-muted-foreground">
                  This ticket is {ticket.ticketStatus === "resolved" ? "resolved" : "closed"}. Comments cannot be added to {ticket.ticketStatus === "resolved" ? "resolved" : "closed"} tickets.
                </p>
              </div>
            </div>
          ) : (
            <div className="border-t border-border pt-6">
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="comment" className="text-base font-medium">
                    Add your response
                  </Label>
                  <Textarea
                    id="comment"
                    placeholder="Type your message here..."
                    rows={5}
                    value={newComment}
                    onChange={(e) => setNewComment(e.target.value)}
                    className="resize-none text-base"
                  />
                </div>
                <Button
                  onClick={handleSubmitComment}
                  disabled={!newComment.trim() || isSubmitting}
                  className="gap-2 w-full sm:w-auto"
                  size="lg"
                >
                  <Send className="w-4 h-4" />
                  {isSubmitting ? "Sending..." : "Send Message"}
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
