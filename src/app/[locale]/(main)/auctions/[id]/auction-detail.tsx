"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Calendar,
  Gauge,
  Clock,
  Hash,
  Fuel,
  Settings2,
  Car,
  MapPin,
  Info,
  AlertTriangle,
  ChevronLeft,
  ChevronRight,
  Gavel,
} from "lucide-react"
import { differenceInSeconds } from "date-fns"
import { getAllImages, IMAGE_CROP_CONFIG, type ImageInfo } from "@/lib/image-utils"

interface UserBid {
  id: string
  amount: number
  createdAt: string
}

interface AuctionDetailProps {
  userBid: UserBid | null
  auction: {
    id: string
    title: string
    vin: string
    referenceNumber: string
    make: string
    model: string
    year: number
    mileage: number
    fuelType: string
    transmission: string
    engineSize: number | null
    enginePower: number | null
    bodyType: string
    color: string | null
    condition: string
    description: string | null
    damageDescription: string | null
    location: string | null
    images: string | null
    source: string | null
    startingPrice: number
    currentPrice: number
    suggestedValue: number | null
    reservePrice: number | null
    startDate: string
    endDate: string
    status: string
    vehicleType: string
    createdAt: string
    updatedAt: string
  }
}

function formatCountdown(endDate: Date): { text: string; isUrgent: boolean } {
  const now = new Date()
  const diffSeconds = differenceInSeconds(endDate, now)

  if (diffSeconds <= 0) return { text: "Auction Ended", isUrgent: false }

  const days = Math.floor(diffSeconds / 86400)
  const hours = Math.floor((diffSeconds % 86400) / 3600)
  const minutes = Math.floor((diffSeconds % 3600) / 60)
  const seconds = diffSeconds % 60

  const isUrgent = diffSeconds < 3600 // Less than 1 hour

  if (days > 0) {
    return { text: `${days}d ${hours}h ${minutes}m ${seconds}s`, isUrgent }
  }
  if (hours > 0) {
    return { text: `${hours}h ${minutes}m ${seconds}s`, isUrgent }
  }
  return { text: `${minutes}m ${seconds}s`, isUrgent }
}

export function AuctionDetail({ auction, userBid }: AuctionDetailProps) {
  const { data: session } = useSession()
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [countdown, setCountdown] = useState({ text: "", isUrgent: false })
  const [bidAmount, setBidAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showVin, setShowVin] = useState(false)

  const endDate = new Date(auction.endDate)
  const isEnded = new Date() > endDate
  const images = getAllImages(auction.images)
  // For sealed bid: minimum is starting price, or user's previous bid + 100 if they already bid
  const minBid = userBid ? userBid.amount + 100 : auction.startingPrice

  // Client-side only VIN reveal to prevent search engine indexing
  useEffect(() => {
    setShowVin(true)
  }, [])

  // Countdown timer
  useEffect(() => {
    const targetDate = new Date(auction.endDate)
    const updateCountdown = () => {
      setCountdown(formatCountdown(targetDate))
    }

    updateCountdown()
    const interval = setInterval(updateCountdown, 1000)

    return () => clearInterval(interval)
  }, [auction.endDate])

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const handleBid = async () => {
    if (!session) {
      router.push("/login")
      return
    }

    const amount = parseFloat(bidAmount)
    if (isNaN(amount) || amount < minBid) {
      alert(`Minimum bid is ${minBid.toLocaleString()} PLN`)
      return
    }

    setIsSubmitting(true)
    try {
      const response = await fetch(`/api/auctions/${auction.id}/bid`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount }),
      })

      if (response.ok) {
        router.refresh()
        setBidAmount("")
      } else {
        const data = await response.json()
        alert(data.error || "Failed to place bid")
      }
    } catch (error) {
      alert("An error occurred. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  const fuelTypeLabel: Record<string, string> = {
    PETROL: "Petrol",
    DIESEL: "Diesel",
    ELECTRIC: "Electric",
    HYBRID: "Hybrid",
    LPG: "LPG",
    OTHER: "Other",
  }

  const transmissionLabel: Record<string, string> = {
    MANUAL: "Manual",
    AUTOMATIC: "Automatic",
    SEMI_AUTO: "Semi-Automatic",
  }

  const conditionLabel: Record<string, string> = {
    EXCELLENT: "Excellent",
    GOOD: "Good",
    FAIR: "Fair",
    POOR: "Poor",
    DAMAGED: "Damaged",
    SALVAGE: "Salvage",
  }

  return (
    <div className="container py-8">
      {/* Back button */}
      <Button
        variant="ghost"
        className="mb-4"
        onClick={() => router.push("/auctions")}
      >
        <ChevronLeft className="h-4 w-4 mr-2" />
        Back to Auctions
      </Button>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Left column - Images and details */}
        <div className="lg:col-span-2 space-y-6">
          {/* Image gallery */}
          <Card className="overflow-hidden">
            <div className="relative aspect-[16/10] bg-muted overflow-hidden">
              {images.length > 0 ? (
                <>
                  <Image
                    src={images[currentImageIndex].url}
                    alt={`${auction.title} - Image ${currentImageIndex + 1}`}
                    fill
                    className="object-cover"
                    style={{
                      objectPosition: IMAGE_CROP_CONFIG.objectPosition,
                      transform: `scale(1.${IMAGE_CROP_CONFIG.cropBottomPercent.toString().padStart(2, '0')})`,
                      transformOrigin: 'top center'
                    }}
                    priority
                    unoptimized={images[currentImageIndex].unoptimized}
                  />
                  {images.length > 1 && (
                    <>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute left-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                        onClick={handlePrevImage}
                      >
                        <ChevronLeft className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="secondary"
                        size="icon"
                        className="absolute right-4 top-1/2 -translate-y-1/2 bg-background/80 backdrop-blur-sm"
                        onClick={handleNextImage}
                      >
                        <ChevronRight className="h-4 w-4" />
                      </Button>
                      <div className="absolute bottom-4 left-1/2 -translate-x-1/2 bg-background/80 backdrop-blur-sm px-3 py-1 rounded-full text-sm">
                        {currentImageIndex + 1} / {images.length}
                      </div>
                    </>
                  )}
                </>
              ) : (
                <div className="absolute inset-0 flex items-center justify-center">
                  <Car className="h-16 w-16 text-muted-foreground" />
                </div>
              )}
              {isEnded && (
                <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                  <Badge variant="destructive" className="text-xl px-6 py-3">
                    Auction Ended
                  </Badge>
                </div>
              )}
            </div>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="p-4 border-t">
                <div className="flex gap-2 overflow-x-auto pb-2">
                  {images.map((img: ImageInfo, idx: number) => (
                    <button
                      key={idx}
                      onClick={() => setCurrentImageIndex(idx)}
                      className={`relative w-20 h-16 flex-shrink-0 rounded overflow-hidden border-2 transition-colors ${
                        idx === currentImageIndex
                          ? "border-primary"
                          : "border-transparent hover:border-muted-foreground/50"
                      }`}
                    >
                      <Image
                        src={img.url}
                        alt={`Thumbnail ${idx + 1}`}
                        fill
                        className="object-cover"
                        style={{
                          objectPosition: IMAGE_CROP_CONFIG.objectPosition,
                          transform: `scale(1.${IMAGE_CROP_CONFIG.cropBottomPercent.toString().padStart(2, '0')})`,
                          transformOrigin: 'top center'
                        }}
                        unoptimized={img.unoptimized}
                      />
                    </button>
                  ))}
                </div>
              </div>
            )}
          </Card>

          {/* Vehicle details tabs */}
          <Tabs defaultValue="specs" className="w-full">
            <TabsList className="w-full justify-start">
              <TabsTrigger value="specs">Specifications</TabsTrigger>
              <TabsTrigger value="description">Description</TabsTrigger>
              <TabsTrigger value="damage">Damage Report</TabsTrigger>
            </TabsList>

            <TabsContent value="specs">
              <Card>
                <CardContent className="pt-6">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    <div className="flex items-start gap-3">
                      <Calendar className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Year</p>
                        <p className="font-medium">{auction.year}</p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Gauge className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Mileage</p>
                        <p className="font-medium">
                          {auction.mileage.toLocaleString()} km
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Fuel className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Fuel Type</p>
                        <p className="font-medium">
                          {fuelTypeLabel[auction.fuelType] || auction.fuelType}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <Settings2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Transmission</p>
                        <p className="font-medium">
                          {transmissionLabel[auction.transmission] ||
                            auction.transmission}
                        </p>
                      </div>
                    </div>

                    {auction.engineSize && (
                      <div className="flex items-start gap-3">
                        <Settings2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Engine Size</p>
                          <p className="font-medium">{auction.engineSize} cc</p>
                        </div>
                      </div>
                    )}

                    {auction.enginePower && (
                      <div className="flex items-start gap-3">
                        <Settings2 className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Power</p>
                          <p className="font-medium">{auction.enginePower} HP</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <Car className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Body Type</p>
                        <p className="font-medium">{auction.bodyType}</p>
                      </div>
                    </div>

                    {auction.color && (
                      <div className="flex items-start gap-3">
                        <div className="h-5 w-5 rounded-full border mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Color</p>
                          <p className="font-medium">{auction.color}</p>
                        </div>
                      </div>
                    )}

                    <div className="flex items-start gap-3">
                      <Info className="h-5 w-5 text-muted-foreground mt-0.5" />
                      <div>
                        <p className="text-sm text-muted-foreground">Condition</p>
                        <Badge
                          variant={
                            auction.condition === "EXCELLENT" ||
                            auction.condition === "GOOD"
                              ? "success"
                              : auction.condition === "DAMAGED" ||
                                auction.condition === "SALVAGE"
                              ? "destructive"
                              : "secondary"
                          }
                        >
                          {conditionLabel[auction.condition] || auction.condition}
                        </Badge>
                      </div>
                    </div>

                    {auction.location && (
                      <div className="flex items-start gap-3">
                        <MapPin className="h-5 w-5 text-muted-foreground mt-0.5" />
                        <div>
                          <p className="text-sm text-muted-foreground">Location</p>
                          <p className="font-medium">{auction.location}</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <Separator className="my-6" />

                  {/* VIN - Client-side only rendering */}
                  <div className="flex items-start gap-3">
                    <Hash className="h-5 w-5 text-muted-foreground mt-0.5" />
                    <div>
                      <p className="text-sm text-muted-foreground">
                        VIN (Chassis Number)
                      </p>
                      {showVin ? (
                        <p className="font-mono font-medium">{auction.vin}</p>
                      ) : (
                        <p className="font-mono font-medium text-muted-foreground">
                          Loading...
                        </p>
                      )}
                    </div>
                  </div>
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="description">
              <Card>
                <CardContent className="pt-6">
                  {auction.description ? (
                    <p className="whitespace-pre-wrap">{auction.description}</p>
                  ) : (
                    <p className="text-muted-foreground">
                      No description available for this vehicle.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>

            <TabsContent value="damage">
              <Card>
                <CardContent className="pt-6">
                  {auction.damageDescription ? (
                    <div className="space-y-4">
                      <div className="flex items-center gap-2 text-amber-600">
                        <AlertTriangle className="h-5 w-5" />
                        <span className="font-medium">Damage Report</span>
                      </div>
                      <p className="whitespace-pre-wrap">
                        {auction.damageDescription}
                      </p>
                    </div>
                  ) : (
                    <p className="text-muted-foreground">
                      No damage reported for this vehicle.
                    </p>
                  )}
                </CardContent>
              </Card>
            </TabsContent>
          </Tabs>
        </div>

        {/* Right column - Bidding */}
        <div className="space-y-6">
          {/* Title and price */}
          <Card>
            <CardHeader>
              <div className="flex items-start justify-between gap-4">
                <div>
                  <CardTitle className="text-2xl">{auction.title}</CardTitle>
                  <p className="text-muted-foreground mt-1">
                    {auction.make} {auction.model}
                  </p>
                </div>
                {auction.source && (
                  <Badge variant="secondary">{auction.source}</Badge>
                )}
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Hash className="h-4 w-4" />
                <span className="font-mono">{auction.referenceNumber}</span>
              </div>

              <Separator />

              {/* Show user's own bid or starting price - sealed bid format */}
              {session && userBid ? (
                <div>
                  <p className="text-sm text-muted-foreground">Your Current Bid</p>
                  <p className="text-3xl font-bold text-primary">
                    {userBid.amount.toLocaleString()} PLN
                  </p>
                </div>
              ) : (
                <div>
                  <p className="text-sm text-muted-foreground">Starting Price</p>
                  <p className="text-3xl font-bold text-primary">
                    {auction.startingPrice.toLocaleString()} PLN
                  </p>
                </div>
              )}

              {auction.suggestedValue && (
                <div>
                  <p className="text-sm text-muted-foreground">Estimated Value</p>
                  <p className="text-lg font-medium">
                    {auction.suggestedValue.toLocaleString()} PLN
                  </p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Countdown */}
          <Card>
            <CardContent className="pt-6">
              <div className="flex items-center gap-3">
                <Clock
                  className={`h-6 w-6 ${
                    isEnded
                      ? "text-destructive"
                      : countdown.isUrgent
                      ? "text-amber-500"
                      : "text-primary"
                  }`}
                />
                <div>
                  <p className="text-sm text-muted-foreground">
                    {isEnded ? "Auction Ended" : "Time Remaining"}
                  </p>
                  <p
                    className={`text-xl font-bold ${
                      isEnded
                        ? "text-destructive"
                        : countdown.isUrgent
                        ? "text-amber-500"
                        : "text-foreground"
                    }`}
                  >
                    {countdown.text}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Bid form - only show when logged in */}
          {!isEnded && session ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  {userBid ? "Update Your Bid" : "Place a Bid"}
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <div>
                  <p className="text-sm text-muted-foreground mb-2">
                    {userBid
                      ? `To update your bid, enter an amount higher than ${userBid.amount.toLocaleString()} PLN`
                      : `Minimum bid: ${auction.startingPrice.toLocaleString()} PLN`
                    }
                  </p>
                  <div className="flex gap-2">
                    <Input
                      type="number"
                      placeholder={`${minBid}`}
                      value={bidAmount}
                      onChange={(e) => setBidAmount(e.target.value)}
                      min={minBid}
                      step={100}
                    />
                    <Button
                      onClick={handleBid}
                      disabled={isSubmitting}
                      className="whitespace-nowrap"
                    >
                      {isSubmitting ? "Placing..." : userBid ? "Update Bid" : "Place Bid"}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ) : !isEnded ? (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Gavel className="h-5 w-5" />
                  Place a Bid
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm text-muted-foreground">
                  Please{" "}
                  <Button
                    variant="link"
                    className="p-0 h-auto"
                    onClick={() => router.push("/login")}
                  >
                    sign in
                  </Button>{" "}
                  to place a bid on this auction.
                </p>
              </CardContent>
            </Card>
          ) : null}

          {/* Sealed bid auction - no bid history shown to users */}
        </div>
      </div>
    </div>
  )
}
