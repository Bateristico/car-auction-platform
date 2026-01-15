"use client"

import * as React from "react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface QuickBidButtonsProps {
  increments?: number[]
  onIncrement: (amount: number) => void
  currency?: string
  className?: string
  disabled?: boolean
}

export function QuickBidButtons({
  increments = [500, 1000, 5000],
  onIncrement,
  currency = "PLN",
  className,
  disabled = false,
}: QuickBidButtonsProps) {
  const formatIncrement = (amount: number) => {
    if (amount >= 1000) {
      return `+${(amount / 1000).toLocaleString()}K`
    }
    return `+${amount.toLocaleString()}`
  }

  return (
    <div className={cn("grid grid-cols-3 gap-2", className)}>
      {increments.map((amount) => (
        <Button
          key={amount}
          variant="outline"
          size="sm"
          className="font-mono text-sm hover:border-primary hover:bg-primary/10"
          onClick={() => onIncrement(amount)}
          disabled={disabled}
        >
          {formatIncrement(amount)} {currency}
        </Button>
      ))}
    </div>
  )
}
