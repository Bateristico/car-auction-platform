import { getTranslations, setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering to always fetch fresh data
export const dynamic = "force-dynamic"
import { Button } from "@/components/ui/button"
import { AuctionDataCard } from "@/components/auctions/auction-data-card"
import { HeroFeaturedAuction } from "@/components/home/hero-featured-auction"
import { LiveTicker } from "@/components/home/live-ticker"
import { CTASection } from "@/components/home/cta-section"
import { Car, Shield, Clock, Users, Zap, TrendingUp, Award } from "lucide-react"

async function getFeaturedAuction() {
  // Get the most valuable active auction ending soon for the hero
  return prisma.auction.findFirst({
    where: { status: "ACTIVE" },
    orderBy: [
      { suggestedValue: "desc" },
      { endDate: "asc" },
    ],
    select: {
      id: true,
      title: true,
      make: true,
      model: true,
      year: true,
      images: true,
      endDate: true,
      suggestedValue: true,
    },
  })
}

async function getFeaturedAuctions() {
  return prisma.auction.findMany({
    where: { status: "ACTIVE" },
    orderBy: { endDate: "asc" },
    take: 8,
    select: {
      id: true,
      title: true,
      make: true,
      model: true,
      year: true,
      mileage: true,
      referenceNumber: true,
      images: true,
      source: true,
      endDate: true,
      status: true,
      suggestedValue: true,
      vehicleType: true,
    },
  })
}

async function getRecentBids() {
  // Get recent bids for the live ticker
  const bids = await prisma.bid.findMany({
    orderBy: { createdAt: "desc" },
    take: 10,
    include: {
      auction: {
        select: {
          title: true,
        },
      },
    },
  })

  return bids.map((bid) => ({
    id: bid.id,
    title: bid.auction.title,
    amount: bid.amount,
    createdAt: bid.createdAt.toISOString(),
  }))
}

async function getStats() {
  const [activeAuctions, totalUsers, totalBids] = await Promise.all([
    prisma.auction.count({ where: { status: "ACTIVE" } }),
    prisma.user.count(),
    prisma.bid.count(),
  ])

  return { activeAuctions, totalUsers, totalBids }
}

type Props = {
  params: Promise<{ locale: string }>
}

export default async function HomePage({ params }: Props) {
  const { locale } = await params
  setRequestLocale(locale)

  const t = await getTranslations("home")
  const tCommon = await getTranslations("common")

  const [heroAuction, featuredAuctions, recentBids, stats] = await Promise.all([
    getFeaturedAuction(),
    getFeaturedAuctions(),
    getRecentBids(),
    getStats(),
  ])

  // Filter out the hero auction from featured list
  const gridAuctions = heroAuction
    ? featuredAuctions.filter((a) => a.id !== heroAuction.id)
    : featuredAuctions

  return (
    <div className="min-h-screen">
      {/* Hero Featured Auction */}
      {heroAuction ? (
        <HeroFeaturedAuction auction={heroAuction} />
      ) : (
        <section className="relative min-h-[60vh] flex items-center bg-gradient-to-br from-primary/10 via-background to-background">
          <div className="container py-20">
            <div className="max-w-3xl">
              <h1 className="font-display text-4xl lg:text-6xl font-bold tracking-tight mb-6">
                {t("heroTitle").split("Auction")[0]}
                <span className="text-primary">Auction</span>
              </h1>
              <p className="text-xl text-muted-foreground mb-8">
                {t("heroSubtitle")}
              </p>
              <Button variant="bid" size="xl" asChild>
                <Link href="/auctions">{t("browseAuctions") || "Browse Auctions"}</Link>
              </Button>
            </div>
          </div>
        </section>
      )}

      {/* Live Ticker - Recent Bids */}
      <LiveTicker items={recentBids} />

      {/* Stats Dashboard */}
      <section className="py-12 bg-muted/20 border-b border-border/50">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            <div className="text-center p-6 rounded-xl bg-card/50 border border-border/30">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Car className="h-6 w-6 text-primary" />
              </div>
              <p className="font-mono text-3xl font-bold text-primary">
                {stats.activeAuctions}+
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("activeAuctions")}
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-card/50 border border-border/30">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Users className="h-6 w-6 text-primary" />
              </div>
              <p className="font-mono text-3xl font-bold text-primary">
                {stats.totalUsers}+
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("registeredUsers")}
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-card/50 border border-border/30">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <TrendingUp className="h-6 w-6 text-primary" />
              </div>
              <p className="font-mono text-3xl font-bold text-primary">
                {stats.totalBids}+
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("totalBids")}
              </p>
            </div>
            <div className="text-center p-6 rounded-xl bg-card/50 border border-border/30">
              <div className="w-12 h-12 bg-primary/20 rounded-lg flex items-center justify-center mx-auto mb-3">
                <Zap className="h-6 w-6 text-primary" />
              </div>
              <p className="font-mono text-3xl font-bold text-primary">24/7</p>
              <p className="text-sm text-muted-foreground mt-1">
                {t("onlineBidding")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Auctions Grid */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="font-display text-3xl font-bold">
                {t("featuredAuctions")}
              </h2>
              <p className="text-muted-foreground mt-1">{t("endingSoon")}</p>
            </div>
            <Button variant="glass" asChild>
              <Link href="/auctions">{tCommon("viewAll")}</Link>
            </Button>
          </div>

          {gridAuctions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {gridAuctions.slice(0, 8).map((auction) => (
                <AuctionDataCard key={auction.id} auction={auction} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16 bg-muted/30 rounded-2xl border border-border/50">
              <Car className="h-16 w-16 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold mb-2">
                {t("noActiveAuctions")}
              </h3>
              <p className="text-muted-foreground mb-6">{t("checkBackSoon")}</p>
              <Button variant="outline" asChild>
                <Link href="/auctions">{tCommon("viewAll")}</Link>
              </Button>
            </div>
          )}
        </div>
      </section>

      {/* How It Works */}
      <section className="py-16 bg-muted/20 border-y border-border/50">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-2">
              {t("howItWorks") || "How It Works"}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("howItWorksDesc") ||
                "Start bidding on premium vehicles in three simple steps"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {/* Step 1 */}
            <div className="relative text-center p-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                <span className="font-mono text-2xl font-bold text-primary-foreground">
                  1
                </span>
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                {t("step1Title") || "Browse Auctions"}
              </h3>
              <p className="text-muted-foreground">
                {t("step1Desc") ||
                  "Explore our curated selection of premium vehicles from trusted sources"}
              </p>
              {/* Connector line (hidden on mobile) */}
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/50 to-transparent" />
            </div>

            {/* Step 2 */}
            <div className="relative text-center p-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                <span className="font-mono text-2xl font-bold text-primary-foreground">
                  2
                </span>
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                {t("step2Title") || "Place Your Bid"}
              </h3>
              <p className="text-muted-foreground">
                {t("step2Desc") ||
                  "Set your maximum bid and let our system bid for you automatically"}
              </p>
              <div className="hidden md:block absolute top-8 left-[60%] w-[80%] h-px bg-gradient-to-r from-primary/50 to-transparent" />
            </div>

            {/* Step 3 */}
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary rounded-full flex items-center justify-center mx-auto mb-4 shadow-lg shadow-primary/30">
                <span className="font-mono text-2xl font-bold text-primary-foreground">
                  3
                </span>
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                {t("step3Title") || "Win & Collect"}
              </h3>
              <p className="text-muted-foreground">
                {t("step3Desc") ||
                  "Win the auction and arrange pickup or delivery of your new vehicle"}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16">
        <div className="container">
          <div className="text-center mb-12">
            <h2 className="font-display text-3xl font-bold mb-2">
              {t("whyChoose")}
            </h2>
            <p className="text-muted-foreground max-w-2xl mx-auto">
              {t("whyChooseDesc") ||
                "The trusted platform for vehicle auctions"}
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            <div className="group text-center p-8 rounded-2xl bg-card/50 border border-border/30 hover:border-primary/30 transition-all">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                {t("verifiedVehicles")}
              </h3>
              <p className="text-muted-foreground">
                {t("verifiedVehiclesDesc")}
              </p>
            </div>

            <div className="group text-center p-8 rounded-2xl bg-card/50 border border-border/30 hover:border-primary/30 transition-all">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                {t("realTimeBidding")}
              </h3>
              <p className="text-muted-foreground">
                {t("realTimeBiddingDesc")}
              </p>
            </div>

            <div className="group text-center p-8 rounded-2xl bg-card/50 border border-border/30 hover:border-primary/30 transition-all">
              <div className="w-16 h-16 bg-primary/10 rounded-2xl flex items-center justify-center mx-auto mb-4 group-hover:bg-primary/20 transition-colors">
                <Award className="h-8 w-8 text-primary" />
              </div>
              <h3 className="font-display text-xl font-semibold mb-2">
                {t("trustedCommunity")}
              </h3>
              <p className="text-muted-foreground">
                {t("trustedCommunityDesc")}
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <CTASection />
    </div>
  )
}
