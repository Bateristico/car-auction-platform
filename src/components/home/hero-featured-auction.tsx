"use client"

import * as React from "react"
import { useState, useEffect, useMemo } from "react"
import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { LiveBadge } from "@/components/ui/live-badge"
import { CountdownTimer } from "@/components/ui/countdown-timer"
import { getFirstImage } from "@/lib/image-utils"
import { differenceInSeconds } from "date-fns"
import { ArrowRight, Eye } from "lucide-react"
import { cn } from "@/lib/utils"

interface HeroFeaturedAuctionProps {
  auction: {
    id: string
    title: string
    make: string
    model: string
    year: number
    images: string | null
    endDate: Date | string
    currentPrice?: number | null
    suggestedValue?: number | null
  }
  className?: string
}

export function HeroFeaturedAuction({
  auction,
  className,
}: HeroFeaturedAuctionProps) {
  const t = useTranslations("home")
  const tAuctions = useTranslations("auctions")

  const primaryImage = getFirstImage(auction.images)
  const endDate = useMemo(
    () => new Date(auction.endDate),
    [auction.endDate]
  )
  const currentBid = auction.currentPrice || auction.suggestedValue || 0

  // Initialize with default values to avoid hydration mismatch
  const [mounted, setMounted] = useState(false)
  const [isEnded, setIsEnded] = useState(false)
  const [isLive, setIsLive] = useState(false)

  // Calculate time-dependent values only after mount
  useEffect(() => {
    setMounted(true)
    const now = new Date()
    const ended = now > endDate
    const hoursLeft = differenceInSeconds(endDate, now) / 3600
    setIsEnded(ended)
    setIsLive(!ended && hoursLeft <= 24)
  }, [endDate])

  return (
    <section
      className={cn(
        "relative min-h-[80vh] flex items-center overflow-hidden",
        className
      )}
      data-testid="hero-featured-auction"
    >
      {/* Background Image */}
      <div className="absolute inset-0 z-0">
        <Image
          src={primaryImage.url}
          alt={auction.title}
          fill
          className="object-cover"
          sizes="100vw"
          priority
          unoptimized={primaryImage.unoptimized}
        />
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="container relative z-10 py-20">
        <div className="max-w-2xl space-y-6">
          {/* Badges */}
          <div className="flex items-center gap-3">
            {isLive && <LiveBadge />}
            <Badge variant="muted" className="bg-background/50 backdrop-blur-sm">
              {t("featuredAuction") || "Featured Auction"}
            </Badge>
          </div>

          {/* Title */}
          <div className="space-y-2">
            <p className="text-lg text-muted-foreground">
              {auction.year} {auction.make}
            </p>
            <h1 className="font-display text-4xl md:text-5xl lg:text-6xl font-bold tracking-tight">
              {auction.title}
            </h1>
          </div>

          {/* Price and Countdown */}
          <div className="flex flex-wrap items-end gap-8 pt-4">
            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                {auction.currentPrice
                  ? tAuctions("currentBid") || "Current Bid"
                  : tAuctions("startingPrice") || "Starting Price"}
              </p>
              <p className="text-4xl md:text-5xl font-display font-bold text-primary">
                {currentBid.toLocaleString()}{" "}
                <span className="text-2xl">PLN</span>
              </p>
            </div>

            <div>
              <p className="text-sm text-muted-foreground uppercase tracking-wide mb-1">
                {isEnded
                  ? tAuctions("ended") || "Ended"
                  : tAuctions("endsIn") || "Ends In"}
              </p>
              <CountdownTimer
                endDate={endDate}
                className="text-3xl md:text-4xl font-bold"
                compact={false}
                showSnipeWarning
              />
            </div>
          </div>

          {/* CTA Buttons */}
          <div className="flex flex-wrap gap-4 pt-4">
            <Button variant="bid" size="xl" asChild>
              <Link href={`/auctions/${auction.id}`}>
                {tAuctions("placeBid") || "Place Bid"}
                <ArrowRight className="h-5 w-5" />
              </Link>
            </Button>
            <Button variant="glass" size="xl" asChild>
              <Link href={`/auctions/${auction.id}`}>
                <Eye className="h-5 w-5" />
                {t("viewGallery") || "View Gallery"}
              </Link>
            </Button>
          </div>
        </div>
      </div>

      {/* Decorative elements */}
      <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
    </section>
  )
}
