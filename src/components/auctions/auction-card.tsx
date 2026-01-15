"use client"

import Image from "next/image"
import { Link } from "@/i18n/navigation"
import { useState, useEffect } from "react"
import { useTranslations } from "next-intl"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Calendar, Gauge, Clock, Hash } from "lucide-react"
import { differenceInSeconds } from "date-fns"
import { getFirstImage, IMAGE_CROP_CONFIG } from "@/lib/image-utils"

interface AuctionCardProps {
  auction: {
    id: string
    title: string
    make: string
    model: string
    year: number
    mileage: number
    referenceNumber: string
    images: string | null
    source: string | null
    endDate: Date | string
    status: string
    suggestedValue: number | null
    vehicleType: string
  }
}

function formatCountdown(endDate: Date, endedText: string): string {
  const now = new Date()
  const diffSeconds = differenceInSeconds(endDate, now)

  if (diffSeconds <= 0) return endedText

  const days = Math.floor(diffSeconds / 86400)
  const hours = Math.floor((diffSeconds % 86400) / 3600)
  const minutes = Math.floor((diffSeconds % 3600) / 60)
  const seconds = diffSeconds % 60

  if (days > 0) {
    return `${days}d ${hours}h ${minutes}m`
  }
  if (hours > 0) {
    return `${hours}h ${minutes}m ${seconds}s`
  }
  return `${minutes}m ${seconds}s`
}

export function AuctionCard({ auction }: AuctionCardProps) {
  const [countdown, setCountdown] = useState("")
  const t = useTranslations("auctions")

  useEffect(() => {
    const endDate = new Date(auction.endDate)
    const updateCountdown = () => {
      setCountdown(formatCountdown(endDate, t("ended")))
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [auction.endDate, t])

  const primaryImage = getFirstImage(auction.images)
  const endDate = new Date(auction.endDate)
  const isEnded = new Date() > endDate

  return (
    <Link href={`/auctions/${auction.id}`}>
      <Card className="overflow-hidden hover:shadow-lg transition-shadow cursor-pointer h-full">
        <div className="relative aspect-[4/3] bg-muted overflow-hidden">
          <Image
            src={primaryImage.url}
            alt={auction.title}
            fill
            className="object-cover"
            style={{
              objectPosition: IMAGE_CROP_CONFIG.objectPosition,
              transform: `scale(1.${IMAGE_CROP_CONFIG.cropBottomPercent.toString().padStart(2, '0')})`,
              transformOrigin: 'top center'
            }}
            sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
            unoptimized={primaryImage.unoptimized}
          />
          {auction.source && (
            <Badge
              variant="secondary"
              className="absolute top-2 left-2 bg-background/80 backdrop-blur-sm"
            >
              {auction.source}
            </Badge>
          )}
          {isEnded && (
            <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
              <Badge variant="destructive" className="text-lg px-4 py-2">
                {t("ended")}
              </Badge>
            </div>
          )}
        </div>
        <CardContent className="p-4">
          <div className="space-y-3">
            <div>
              <h3 className="font-semibold text-lg line-clamp-1">{auction.title}</h3>
              {auction.suggestedValue && (
                <p className="text-sm text-muted-foreground">
                  {t("estValue")}: <span className="font-medium text-foreground">{auction.suggestedValue.toLocaleString()} PLN</span>
                </p>
              )}
            </div>

            <div className="grid grid-cols-2 gap-2 text-sm text-muted-foreground">
              <div className="flex items-center gap-1.5">
                <Calendar className="h-4 w-4" />
                <span>{auction.year}</span>
              </div>
              <div className="flex items-center gap-1.5">
                <Gauge className="h-4 w-4" />
                <span>{auction.mileage.toLocaleString()} km</span>
              </div>
              <div className="flex items-center gap-1.5 col-span-2">
                <Hash className="h-4 w-4" />
                <span className="font-mono text-xs">{auction.referenceNumber}</span>
              </div>
            </div>

            <div className="flex items-center gap-2 pt-2 border-t">
              <Clock className={`h-4 w-4 ${isEnded ? "text-destructive" : "text-primary"}`} />
              <span className={`text-sm font-medium ${isEnded ? "text-destructive" : "text-primary"}`}>
                {isEnded ? t("auctionEnded") : `${t("endsIn")}: ${countdown}`}
              </span>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
