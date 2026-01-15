"use client"

import * as React from "react"
import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Zap } from "lucide-react"
import { cn } from "@/lib/utils"
import { formatTimeAgo } from "@/lib/date-utils"

// Re-export for backward compatibility
export { formatTimeAgo } from "@/lib/date-utils"

interface TickerItem {
  id: string
  title: string
  amount: number
  createdAt: string // ISO date string from server
}

interface LiveTickerProps {
  items: TickerItem[]
  className?: string
}

export function LiveTicker({ items, className }: LiveTickerProps) {
  const t = useTranslations("home")
  const [mounted, setMounted] = useState(false)

  // Only render time after mount to avoid hydration mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  if (items.length === 0) return null

  // Double the items for seamless loop
  const doubledItems = [...items, ...items]

  return (
    <div
      className={cn(
        "relative overflow-hidden bg-muted/30 border-y border-border/50",
        className
      )}
      data-testid="live-ticker"
    >
      {/* Label */}
      <div className="absolute left-0 top-0 bottom-0 z-10 flex items-center px-4 bg-gradient-to-r from-background via-background to-transparent">
        <div className="flex items-center gap-2 text-primary font-semibold text-sm">
          <Zap className="h-4 w-4 animate-pulse" />
          <span>{t("recentBids") || "Recent Bids"}</span>
        </div>
      </div>

      {/* Ticker content */}
      <div className="ticker-container py-3 pl-36">
        <div className="ticker-content">
          {doubledItems.map((item, index) => (
            <div
              key={`${item.id}-${index}`}
              className="inline-flex items-center gap-6 px-6"
            >
              <span className="text-foreground font-medium">{item.title}</span>
              <span className="text-primary font-bold font-mono">
                {item.amount.toLocaleString()} PLN
              </span>
              <span className="text-muted-foreground text-sm">
                {mounted ? formatTimeAgo(new Date(item.createdAt)) : "..."}
              </span>
              <span className="text-border">•</span>
            </div>
          ))}
        </div>
      </div>

      {/* Fade edges */}
      <div className="absolute right-0 top-0 bottom-0 w-24 bg-gradient-to-l from-background to-transparent pointer-events-none" />
    </div>
  )
}
