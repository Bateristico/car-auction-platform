"use client"

import { useState, useEffect } from "react"
import Image from "next/image"
import { useSession } from "next-auth/react"
import { useRouter } from "next/navigation"
import { useTranslations } from "next-intl"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Separator } from "@/components/ui/separator"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { LiveBadge } from "@/components/ui/live-badge"
import { VerifiedBadge } from "@/components/ui/verified-badge"
import { CountdownTimer } from "@/components/ui/countdown-timer"
import { ImageLightbox } from "@/components/auctions/image-lightbox"
import { QuickBidButtons } from "@/components/auctions/quick-bid-buttons"
import {
  ChevronLeft,
  ChevronRight,
  Maximize2,
  Gavel,
  AlertTriangle,
  Car,
  Calendar,
  Gauge,
  Fuel,
  Settings2,
  MapPin,
  Hash,
  Copy,
  Check,
  ArrowLeft,
  TrendingUp,
  ShieldCheck,
} from "lucide-react"
import { differenceInSeconds } from "date-fns"
import { getAllImages, IMAGE_CROP_CONFIG, type ImageInfo } from "@/lib/image-utils"
import { cn } from "@/lib/utils"

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

export function AuctionDetail({ auction, userBid }: AuctionDetailProps) {
  const t = useTranslations("auctions")
  const { data: session } = useSession()
  const router = useRouter()
  const [currentImageIndex, setCurrentImageIndex] = useState(0)
  const [lightboxOpen, setLightboxOpen] = useState(false)
  const [bidAmount, setBidAmount] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [showVin, setShowVin] = useState(false)
  const [vinCopied, setVinCopied] = useState(false)

  const endDate = new Date(auction.endDate)
  const isEnded = new Date() > endDate
  const images = getAllImages(auction.images)

  // Check if auction is "live" (ending within 24 hours)
  const hoursLeft = differenceInSeconds(endDate, new Date()) / 3600
  const isLive = !isEnded && hoursLeft <= 24

  // For sealed bid: minimum is starting price, or user's previous bid + 100 if they already bid
  const minBid = userBid ? userBid.amount + 100 : auction.startingPrice

  // Client-side only VIN reveal to prevent search engine indexing
  useEffect(() => {
    setShowVin(true)
  }, [])

  const handlePrevImage = () => {
    setCurrentImageIndex((prev) => (prev === 0 ? images.length - 1 : prev - 1))
  }

  const handleNextImage = () => {
    setCurrentImageIndex((prev) => (prev === images.length - 1 ? 0 : prev + 1))
  }

  const copyVin = async () => {
    await navigator.clipboard.writeText(auction.vin)
    setVinCopied(true)
    setTimeout(() => setVinCopied(false), 2000)
  }

  const handleQuickBid = (increment: number) => {
    const currentAmount = bidAmount ? parseFloat(bidAmount) : minBid
    setBidAmount(String(currentAmount + increment))
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

  const conditionVariant = (condition: string) => {
    if (condition === "EXCELLENT" || condition === "GOOD") return "trust"
    if (condition === "DAMAGED" || condition === "SALVAGE") return "destructive"
    return "secondary"
  }

  return (
    <div className="min-h-screen bg-background" data-testid="auction-detail">
      {/* Lightbox */}
      <ImageLightbox
        images={images}
        initialIndex={currentImageIndex}
        open={lightboxOpen}
        onOpenChange={setLightboxOpen}
      />

      {/* Top Navigation Bar */}
      <div className="border-b border-border/50 bg-card/50 backdrop-blur-sm sticky top-16 z-30">
        <div className="container py-4">
          <div className="flex items-center justify-between">
            <Button
              variant="ghost"
              className="gap-2"
              onClick={() => router.push("/auctions")}
            >
              <ArrowLeft className="h-4 w-4" />
              {t("backToAuctions") || "Back to Auctions"}
            </Button>

            <div className="flex items-center gap-3">
              {isLive && <LiveBadge />}
              {auction.source && (
                <Badge variant="muted">{auction.source}</Badge>
              )}
              <Badge variant="outline" className="font-mono">
                #{auction.referenceNumber}
              </Badge>
            </div>
          </div>
        </div>
      </div>

      <div className="container py-8">
        {/* Title Section */}
        <div className="mb-8">
          <p className="text-muted-foreground mb-2">
            {auction.year} {auction.make}
          </p>
          <h1 className="font-display text-3xl md:text-4xl font-bold mb-4">
            {auction.title}
          </h1>
          <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Calendar className="h-4 w-4" />
              {auction.year}
            </span>
            <span className="flex items-center gap-1.5">
              <Gauge className="h-4 w-4" />
              {auction.mileage.toLocaleString()} km
            </span>
            <span className="flex items-center gap-1.5">
              <Fuel className="h-4 w-4" />
              {fuelTypeLabel[auction.fuelType] || auction.fuelType}
            </span>
            <span className="flex items-center gap-1.5">
              <Settings2 className="h-4 w-4" />
              {transmissionLabel[auction.transmission] || auction.transmission}
            </span>
            {auction.location && (
              <span className="flex items-center gap-1.5">
                <MapPin className="h-4 w-4" />
                {auction.location}
              </span>
            )}
          </div>
        </div>

        {/* Main Content - 70/30 Split */}
        <div className="grid grid-cols-1 lg:grid-cols-[1fr_380px] gap-8">
          {/* Left Column - Gallery & Details (70%) */}
          <div className="space-y-8">
            {/* Image Gallery */}
            <Card className="overflow-hidden border-border/50">
              <div className="relative aspect-[16/10] bg-muted">
                {images.length > 0 ? (
                  <>
                    <Image
                      src={images[currentImageIndex].url}
                      alt={`${auction.title} - Image ${currentImageIndex + 1}`}
                      fill
                      className="object-cover cursor-pointer"
                      priority
                      unoptimized={images[currentImageIndex].unoptimized}
                      onClick={() => setLightboxOpen(true)}
                    />
                    {images.length > 1 && (
                      <>
                        <Button
                          variant="glass"
                          size="icon"
                          className="absolute left-4 top-1/2 -translate-y-1/2 h-10 w-10"
                          onClick={handlePrevImage}
                        >
                          <ChevronLeft className="h-5 w-5" />
                        </Button>
                        <Button
                          variant="glass"
                          size="icon"
                          className="absolute right-4 top-1/2 -translate-y-1/2 h-10 w-10"
                          onClick={handleNextImage}
                        >
                          <ChevronRight className="h-5 w-5" />
                        </Button>
                      </>
                    )}

                    {/* Expand button */}
                    <Button
                      variant="glass"
                      size="icon"
                      className="absolute top-4 right-4 h-10 w-10"
                      onClick={() => setLightboxOpen(true)}
                    >
                      <Maximize2 className="h-5 w-5" />
                    </Button>

                    {/* Image counter */}
                    <div className="absolute bottom-4 left-4 bg-black/60 backdrop-blur-sm px-3 py-1.5 rounded-full text-sm text-white font-mono">
                      {currentImageIndex + 1} / {images.length}
                    </div>
                  </>
                ) : (
                  <div className="absolute inset-0 flex items-center justify-center">
                    <Car className="h-20 w-20 text-muted-foreground/30" />
                  </div>
                )}

                {/* Ended Overlay */}
                {isEnded && (
                  <div className="absolute inset-0 bg-black/60 flex items-center justify-center backdrop-blur-sm">
                    <Badge
                      variant="destructive"
                      className="text-xl px-6 py-3 font-display"
                    >
                      {t("auctionEnded") || "Auction Ended"}
                    </Badge>
                  </div>
                )}
              </div>

              {/* Thumbnail Strip */}
              {images.length > 1 && (
                <div className="p-4 border-t border-border/50 bg-muted/30">
                  <div className="flex gap-2 overflow-x-auto pb-1">
                    {images.map((img: ImageInfo, idx: number) => (
                      <button
                        key={idx}
                        onClick={() => setCurrentImageIndex(idx)}
                        className={cn(
                          "relative w-20 h-14 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all",
                          idx === currentImageIndex
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-transparent opacity-60 hover:opacity-100"
                        )}
                      >
                        <Image
                          src={img.url}
                          alt={`Thumbnail ${idx + 1}`}
                          fill
                          className="object-cover"
                          unoptimized={img.unoptimized}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </Card>

            {/* Vitals Table */}
            <Card className="border-border/50">
              <CardHeader>
                <CardTitle className="font-display flex items-center gap-2">
                  <ShieldCheck className="h-5 w-5 text-primary" />
                  {t("vehicleVitals") || "Vehicle Vitals"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {t("year") || "Year"}
                    </p>
                    <p className="font-semibold">{auction.year}</p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {t("mileage") || "Mileage"}
                    </p>
                    <p className="font-semibold">
                      {auction.mileage.toLocaleString()} km
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {t("fuelType") || "Fuel Type"}
                    </p>
                    <p className="font-semibold">
                      {fuelTypeLabel[auction.fuelType] || auction.fuelType}
                    </p>
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {t("transmission") || "Transmission"}
                    </p>
                    <p className="font-semibold">
                      {transmissionLabel[auction.transmission] ||
                        auction.transmission}
                    </p>
                  </div>
                  {auction.engineSize && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {t("engineSize") || "Engine Size"}
                      </p>
                      <p className="font-semibold">{auction.engineSize} cc</p>
                    </div>
                  )}
                  {auction.enginePower && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {t("power") || "Power"}
                      </p>
                      <p className="font-semibold">{auction.enginePower} HP</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {t("bodyType") || "Body Type"}
                    </p>
                    <p className="font-semibold">{auction.bodyType}</p>
                  </div>
                  {auction.color && (
                    <div>
                      <p className="text-sm text-muted-foreground mb-1">
                        {t("color") || "Color"}
                      </p>
                      <p className="font-semibold">{auction.color}</p>
                    </div>
                  )}
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {t("condition") || "Condition"}
                    </p>
                    <Badge variant={conditionVariant(auction.condition)}>
                      {conditionLabel[auction.condition] || auction.condition}
                    </Badge>
                  </div>
                </div>

                <Separator className="my-6" />

                {/* VIN with copy */}
                <div className="flex items-center justify-between p-4 bg-muted/30 rounded-lg">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">
                      {t("vin") || "VIN (Chassis Number)"}
                    </p>
                    {showVin ? (
                      <p className="font-mono font-semibold text-lg">
                        {auction.vin}
                      </p>
                    ) : (
                      <p className="font-mono text-muted-foreground">
                        Loading...
                      </p>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={copyVin}
                    className="h-10 w-10"
                  >
                    {vinCopied ? (
                      <Check className="h-5 w-5 text-green-500" />
                    ) : (
                      <Copy className="h-5 w-5" />
                    )}
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Details Tabs */}
            <Tabs defaultValue="description" className="w-full">
              <TabsList className="w-full justify-start bg-muted/30 p-1">
                <TabsTrigger value="description" className="flex-1 max-w-[200px]">
                  {t("description") || "Description"}
                </TabsTrigger>
                <TabsTrigger value="damage" className="flex-1 max-w-[200px]">
                  {t("damageReport") || "Damage Report"}
                </TabsTrigger>
              </TabsList>

              <TabsContent value="description">
                <Card className="border-border/50">
                  <CardContent className="pt-6">
                    {auction.description ? (
                      <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                        {auction.description}
                      </p>
                    ) : (
                      <p className="text-muted-foreground italic">
                        {t("noDescription") ||
                          "No description available for this vehicle."}
                      </p>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>

              <TabsContent value="damage">
                <Card className="border-border/50">
                  <CardContent className="pt-6">
                    {auction.damageDescription ? (
                      <div className="space-y-4">
                        <div className="flex items-center gap-2 text-amber-500">
                          <AlertTriangle className="h-5 w-5" />
                          <span className="font-semibold">
                            {t("damageReported") || "Damage Reported"}
                          </span>
                        </div>
                        <p className="whitespace-pre-wrap text-muted-foreground leading-relaxed">
                          {auction.damageDescription}
                        </p>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2 text-green-500">
                        <ShieldCheck className="h-5 w-5" />
                        <span>
                          {t("noDamage") || "No damage reported for this vehicle."}
                        </span>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </div>

          {/* Right Column - Sticky Bid Widget (30%) */}
          <div className="lg:relative">
            <div className="lg:sticky lg:top-32 space-y-6">
              {/* Main Bid Card */}
              <Card className="glass-dark border-border/30 shadow-xl">
                <CardContent className="p-6 space-y-6">
                  {/* Price Display */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                      {session && userBid
                        ? t("yourCurrentBid") || "Your Current Bid"
                        : t("startingPrice") || "Starting Price"}
                    </p>
                    <p className="font-mono text-4xl font-bold text-primary">
                      {(session && userBid
                        ? userBid.amount
                        : auction.startingPrice
                      ).toLocaleString()}{" "}
                      <span className="text-2xl">PLN</span>
                    </p>
                    {auction.suggestedValue && (
                      <p className="text-sm text-muted-foreground mt-2 flex items-center justify-center gap-1">
                        <TrendingUp className="h-4 w-4" />
                        {t("estValue") || "Est. Value"}:{" "}
                        {auction.suggestedValue.toLocaleString()} PLN
                      </p>
                    )}
                  </div>

                  <Separator className="bg-border/30" />

                  {/* Countdown */}
                  <div className="text-center">
                    <p className="text-sm text-muted-foreground uppercase tracking-wide mb-2">
                      {isEnded
                        ? t("auctionEnded") || "Auction Ended"
                        : t("timeRemaining") || "Time Remaining"}
                    </p>
                    <CountdownTimer
                      endDate={endDate}
                      className="text-2xl font-bold"
                      showSnipeWarning
                    />
                  </div>

                  {/* Bid Form - Only for logged in users on active auctions */}
                  {!isEnded && session && (
                    <>
                      <Separator className="bg-border/30" />

                      {/* Quick Bid Buttons */}
                      <QuickBidButtons
                        onIncrement={handleQuickBid}
                        disabled={isSubmitting}
                      />

                      {/* Custom Amount Input */}
                      <div>
                        <p className="text-sm text-muted-foreground mb-2">
                          {t("customAmount") || "Custom Amount"}
                        </p>
                        <div className="flex gap-2">
                          <div className="relative flex-1">
                            <Input
                              type="number"
                              placeholder={`Min: ${minBid.toLocaleString()}`}
                              value={bidAmount}
                              onChange={(e) => setBidAmount(e.target.value)}
                              min={minBid}
                              step={100}
                              className="pr-12 bg-background/50 border-border/50"
                            />
                            <span className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground text-sm">
                              PLN
                            </span>
                          </div>
                        </div>
                      </div>

                      {/* Place Bid Button */}
                      <Button
                        variant="bid"
                        size="xl"
                        className="w-full"
                        onClick={handleBid}
                        disabled={isSubmitting || !bidAmount}
                      >
                        <Gavel className="h-5 w-5 mr-2" />
                        {isSubmitting
                          ? t("placing") || "Placing..."
                          : userBid
                          ? t("updateBid") || "Update Bid"
                          : t("placeBid") || "Place Bid"}
                      </Button>

                      {/* Minimum bid hint */}
                      <p className="text-xs text-center text-muted-foreground">
                        {userBid
                          ? `${t("minToUpdate") || "Minimum to update"}: ${minBid.toLocaleString()} PLN`
                          : `${t("minimumBid") || "Minimum bid"}: ${minBid.toLocaleString()} PLN`}
                      </p>
                    </>
                  )}

                  {/* Sign in prompt */}
                  {!isEnded && !session && (
                    <>
                      <Separator className="bg-border/30" />
                      <div className="text-center space-y-4">
                        <p className="text-sm text-muted-foreground">
                          {t("signInToBid") || "Sign in to place a bid"}
                        </p>
                        <Button
                          variant="bid"
                          size="lg"
                          className="w-full"
                          onClick={() => router.push("/login")}
                        >
                          {t("signIn") || "Sign In to Bid"}
                        </Button>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              {/* Trust Badges */}
              <div className="flex flex-wrap justify-center gap-2">
                <VerifiedBadge />
                <Badge
                  variant="muted"
                  className="flex items-center gap-1.5 px-3 py-1.5"
                >
                  <ShieldCheck className="h-3.5 w-3.5" />
                  {t("securePayment") || "Secure Payment"}
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
