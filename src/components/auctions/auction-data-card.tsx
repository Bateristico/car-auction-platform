"use client"

import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Heart, Fuel, Gauge } from "lucide-react"
import { differenceInSeconds } from "date-fns"
import { getFirstImage } from "@/lib/image-utils"
import { LiveBadge } from "@/components/ui/live-badge"
import { CountdownTimer } from "@/components/ui/countdown-timer"
import { cn } from "@/lib/utils"

interface AuctionDataCardProps {
  auction: {
    id: string
    title: string
    make: string
    model: string
    year: number
    mileage: number
    fuelType?: string | null
    referenceNumber: string
    images: string | null
    source: string | null
    endDate: Date | string
    status: string
    suggestedValue: number | null
    currentPrice?: number | null
    vehicleType: string
  }
  /** Show watchlist button */
  showWatchlist?: boolean
  /** Is this auction in user's watchlist */
  isWatchlisted?: boolean
  /** Callback when watchlist is toggled */
  onWatchlistToggle?: (id: string) => void
}

export function AuctionDataCard({
  auction,
  showWatchlist = true,
  isWatchlisted = false,
  onWatchlistToggle,
}: AuctionDataCardProps) {
  const t = useTranslations("auctions")
  const [watchlisted, setWatchlisted] = useState(isWatchlisted)

  const primaryImage = getFirstImage(auction.images)
  const endDate = new Date(auction.endDate)
  const isEnded = new Date() > endDate

  // Check if auction is "live" (ending within 24 hours)
  const hoursLeft = differenceInSeconds(endDate, new Date()) / 3600
  const isLive = !isEnded && hoursLeft <= 24

  const handleWatchlistClick = (e: React.MouseEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setWatchlisted(!watchlisted)
    onWatchlistToggle?.(auction.id)
  }

  const currentBid = auction.currentPrice || auction.suggestedValue || 0

  return (
    <Link href={`/auctions/${auction.id}`}>
      <Card
        className={cn(
          "group relative overflow-hidden h-full",
          "border-border/50 bg-card",
          "hover:border-primary/50 hover:shadow-lg hover:shadow-primary/5",
          "transition-all duration-300 cursor-pointer",
          "card-hover-lift"
        )}
        data-testid="auction-data-card"
      >
        {/* Image Container */}
        <div className="relative aspect-[16/10] overflow-hidden bg-muted">
          <Image
            src={primaryImage.url}
            alt={auction.title}
            fill
            className="object-cover transition-transform duration-500 group-hover:scale-105"
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 25vw"
            unoptimized={primaryImage.unoptimized}
          />

          {/* Top Row: Live Badge + Watchlist */}
          <div className="absolute top-3 left-3 right-3 flex justify-between items-start z-10">
            <div className="flex gap-2">
              {isLive && !isEnded && <LiveBadge />}
              {auction.source && (
                <Badge
                  variant="muted"
                  className="bg-background/80 backdrop-blur-sm"
                >
                  {auction.source}
                </Badge>
              )}
            </div>

            {showWatchlist && (
              <Button
                variant="glass"
                size="icon"
                className="h-8 w-8 rounded-full"
                onClick={handleWatchlistClick}
              >
                <Heart
                  className={cn(
                    "h-4 w-4 transition-colors",
                    watchlisted
                      ? "fill-primary text-primary"
                      : "text-foreground"
                  )}
                />
              </Button>
            )}
          </div>

          {/* Bottom: Countdown Overlay */}
          <div className="absolute bottom-0 inset-x-0 image-gradient-overlay p-3">
            <CountdownTimer
              endDate={endDate}
              className="text-white text-lg font-bold"
              showSnipeWarning={false}
            />
          </div>

          {/* Ended Overlay */}
          {isEnded && (
            <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
              <Badge variant="destructive" className="text-base px-4 py-2">
                {t("ended")}
              </Badge>
            </div>
          )}
        </div>

        {/* Content */}
        <CardContent className="p-4 space-y-3">
          {/* Title */}
          <h3 className="font-display font-semibold text-lg line-clamp-1 group-hover:text-primary transition-colors">
            {auction.title}
          </h3>

          {/* Specs Row */}
          <div className="flex items-center gap-3 text-sm text-muted-foreground">
            <span className="font-medium">{auction.year}</span>
            <span className="text-border">|</span>
            <span className="flex items-center gap-1">
              <Gauge className="h-3.5 w-3.5" />
              {auction.mileage.toLocaleString()} km
            </span>
            {auction.fuelType && (
              <>
                <span className="text-border">|</span>
                <span className="flex items-center gap-1">
                  <Fuel className="h-3.5 w-3.5" />
                  {auction.fuelType}
                </span>
              </>
            )}
          </div>

          {/* Price + Action Row */}
          <div className="flex items-end justify-between pt-3 border-t border-border/50">
            <div>
              <p className="text-xs text-muted-foreground uppercase tracking-wide">
                {auction.currentPrice ? t("currentBid") : t("startingPrice")}
              </p>
              <p className="text-xl font-bold text-primary font-display">
                {currentBid.toLocaleString()} PLN
              </p>
            </div>
            {!isEnded && (
              <Button
                variant="bid"
                size="sm"
                className="shadow-md"
                onClick={(e) => e.preventDefault()}
              >
                {t("bidNow") || "Bid Now"}
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
