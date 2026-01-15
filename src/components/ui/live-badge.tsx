"use client"

import * as React from "react"
import { cn } from "@/lib/utils"

interface LiveBadgeProps {
  className?: string
  /** Show the pulsing dot */
  showDot?: boolean
  /** Custom text (default: "LIVE") */
  text?: string
}

export function LiveBadge({
  className,
  showDot = true,
  text = "LIVE",
}: LiveBadgeProps) {
  return (
    <div
      className={cn(
        "inline-flex items-center gap-1.5 rounded-md px-2.5 py-1",
        "bg-primary text-primary-foreground",
        "text-xs font-bold uppercase tracking-wider",
        "shadow-md animate-live-pulse",
        className
      )}
    >
      {showDot && (
        <span className="relative flex h-2 w-2">
          <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary-foreground opacity-75" />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-primary-foreground" />
        </span>
      )}
      <span>{text}</span>
    </div>
  )
}
