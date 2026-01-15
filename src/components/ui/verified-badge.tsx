"use client"

import * as React from "react"
import { ShieldCheck } from "lucide-react"
import { cn } from "@/lib/utils"

interface VerifiedBadgeProps {
  className?: string
  /** Show the shield icon */
  showIcon?: boolean
  /** Custom text (default: "Verified") */
  text?: string
  /** Size variant */
  size?: "sm" | "default" | "lg"
}

export function VerifiedBadge({
  className,
  showIcon = true,
  text = "Verified",
  size = "default",
}: VerifiedBadgeProps) {
  const sizeClasses = {
    sm: "text-[10px] px-1.5 py-0.5 gap-0.5",
    default: "text-xs px-2.5 py-1 gap-1",
    lg: "text-sm px-3 py-1.5 gap-1.5",
  }

  const iconSizes = {
    sm: "h-2.5 w-2.5",
    default: "h-3 w-3",
    lg: "h-4 w-4",
  }

  return (
    <div
      className={cn(
        "inline-flex items-center rounded-md",
        "bg-[hsl(211_100%_50%)] text-white",
        "font-semibold uppercase tracking-wide",
        "shadow-sm",
        sizeClasses[size],
        className
      )}
    >
      {showIcon && <ShieldCheck className={iconSizes[size]} />}
      <span>{text}</span>
    </div>
  )
}
