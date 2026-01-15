"use client"

import * as React from "react"
import { useState } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { CountdownTimer } from "@/components/ui/countdown-timer"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import { QuickBidButtons } from "./quick-bid-buttons"
import { cn } from "@/lib/utils"
import { Loader2 } from "lucide-react"

interface StickyBidWidgetProps {
  auctionId: string
  title: string
  make: string
  model: string
  source?: string | null
  referenceNumber?: string
  startingPrice: number
  currentBid?: number | null
  userBid?: number | null
  endDate: Date | string
  isVerifiedSeller?: boolean
  isAuthenticated?: boolean
  onBid: (amount: number) => Promise<void>
  className?: string
}

export function StickyBidWidget({
  auctionId,
  title,
  make,
  model,
  source,
  referenceNumber,
  startingPrice,
  currentBid,
  userBid,
  endDate,
  isVerifiedSeller = false,
  isAuthenticated = false,
  onBid,
  className,
}: StickyBidWidgetProps) {
  const t = useTranslations("auctions")

  // Calculate minimum bid
  const minimumBid = userBid
    ? userBid + 100
    : currentBid
      ? currentBid + 100
      : startingPrice

  const [bidAmount, setBidAmount] = useState(minimumBid)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const parsedEndDate = typeof endDate === "string" ? new Date(endDate) : endDate
  const isEnded = new Date() > parsedEndDate

  const handleBidAmountChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = parseFloat(e.target.value) || 0
    setBidAmount(value)
    setError(null)
  }

  const handleIncrement = (amount: number) => {
    setBidAmount((prev) => prev + amount)
    setError(null)
  }

  const handleSubmit = async () => {
    if (bidAmount < minimumBid) {
      setError(`Minimum bid is ${minimumBid.toLocaleString()} PLN`)
      return
    }

    setIsSubmitting(true)
    setError(null)

    try {
      await onBid(bidAmount)
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed to place bid")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div
      className={cn("sticky top-20 space-y-4", className)}
      data-testid="sticky-bid-widget"
    >
      {/* Title Card */}
      <Card className="glass-dark border-border/50">
        <CardContent className="p-4 space-y-2">
          <div className="flex items-start justify-between gap-2">
            <div>
              <h2 className="font-display font-bold text-xl text-foreground">
                {title}
              </h2>
              <p className="text-sm text-muted-foreground">
                {make} {model}
              </p>
            </div>
            {isVerifiedSeller && <VerifiedBadge size="sm" />}
          </div>
          <div className="flex items-center gap-2 text-xs text-muted-foreground">
            {source && (
              <Badge variant="muted" className="text-[10px]">
                {source}
              </Badge>
            )}
            {referenceNumber && (
              <span className="font-mono">#{referenceNumber}</span>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Bidding Card */}
      <Card className="glass-dark border-border/50">
        <CardHeader className="pb-2">
          <CardTitle className="text-lg">
            {t("placeBid") || "Place Your Bid"}
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Current bid display */}
          <div className="text-center py-4 bg-muted/30 rounded-lg border border-border/30">
            <p className="text-xs text-muted-foreground uppercase tracking-wide">
              {userBid
                ? t("yourCurrentBid") || "Your Current Bid"
                : currentBid
                  ? t("currentBid") || "Current Bid"
                  : t("startingPrice") || "Starting Price"}
            </p>
            <p className="text-3xl font-display font-bold text-primary mt-1">
              {(userBid || currentBid || startingPrice).toLocaleString()} PLN
            </p>
            {userBid && (
              <p className="text-xs text-success mt-1">
                {t("youAreHighBidder") || "You are the high bidder"}
              </p>
            )}
          </div>

          {!isEnded && isAuthenticated && (
            <>
              {/* Quick increment buttons */}
              <QuickBidButtons
                increments={[500, 1000, 5000]}
                onIncrement={handleIncrement}
                disabled={isSubmitting}
              />

              {/* Custom bid input */}
              <div className="space-y-2">
                <label className="text-xs text-muted-foreground uppercase tracking-wide">
                  {t("customAmount") || "Custom Amount"}
                </label>
                <div className="flex gap-2">
                  <Input
                    type="number"
                    value={bidAmount}
                    onChange={handleBidAmountChange}
                    className="font-mono text-lg bg-muted/30 border-border/50"
                    min={minimumBid}
                    step={100}
                    disabled={isSubmitting}
                  />
                  <span className="flex items-center text-muted-foreground px-2">
                    PLN
                  </span>
                </div>
                <p className="text-xs text-muted-foreground">
                  {t("minimumBid") || "Minimum"}: {minimumBid.toLocaleString()}{" "}
                  PLN
                </p>
              </div>

              {/* Error message */}
              {error && (
                <p className="text-sm text-destructive text-center">{error}</p>
              )}

              {/* Place bid button */}
              <Button
                variant="bid"
                size="xl"
                className="w-full"
                onClick={handleSubmit}
                disabled={isSubmitting || bidAmount < minimumBid}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="h-5 w-5 animate-spin" />
                    {t("placingBid") || "Placing Bid..."}
                  </>
                ) : userBid ? (
                  t("updateBid") || "Update Bid"
                ) : (
                  t("placeBid") || "Place Bid"
                )}
              </Button>
            </>
          )}

          {!isEnded && !isAuthenticated && (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">
                {t("signInToBid") || "Sign in to place a bid"}
              </p>
              <Button variant="outline" className="w-full" asChild>
                <a href="/login">{t("signIn") || "Sign In"}</a>
              </Button>
            </div>
          )}

          {isEnded && (
            <div className="text-center py-4">
              <p className="text-lg font-semibold text-muted-foreground">
                {t("auctionEnded") || "Auction Ended"}
              </p>
            </div>
          )}

          {/* Countdown */}
          <div className="text-center pt-4 border-t border-border/30">
            <p className="text-xs text-muted-foreground uppercase tracking-wide mb-2">
              {isEnded
                ? t("endedOn") || "Ended"
                : t("timeRemaining") || "Time Remaining"}
            </p>
            <CountdownTimer
              endDate={endDate}
              className="text-2xl"
              showSnipeWarning
              compact={false}
            />
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
