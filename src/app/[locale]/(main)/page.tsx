import { getTranslations, setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { prisma } from "@/lib/prisma"

// Force dynamic rendering to always fetch fresh data
export const dynamic = "force-dynamic"
import { Button } from "@/components/ui/button"
import { AuctionCard } from "@/components/auctions/auction-card"
import { HeroButtons } from "@/components/home/hero-buttons"
import { CTASection } from "@/components/home/cta-section"
import { Car, Shield, Clock, Users } from "lucide-react"

async function getFeaturedAuctions() {
  return prisma.auction.findMany({
    where: { status: "ACTIVE" },
    orderBy: { endDate: "asc" },
    take: 6,
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

  const [featuredAuctions, stats] = await Promise.all([
    getFeaturedAuctions(),
    getStats(),
  ])

  return (
    <div>
      {/* Hero Section */}
      <section className="relative bg-gradient-to-br from-primary/10 via-background to-background py-20 lg:py-32">
        <div className="container">
          <div className="max-w-3xl">
            <h1 className="text-4xl lg:text-6xl font-bold tracking-tight mb-6">
              {t("heroTitle").split("Auction")[0]}
              <span className="text-primary">Auction</span>
            </h1>
            <p className="text-xl text-muted-foreground mb-8">
              {t("heroSubtitle")}
            </p>
            <HeroButtons />
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-12 border-b">
        <div className="container">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{stats.activeAuctions}+</p>
              <p className="text-muted-foreground">{t("activeAuctions")}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{stats.totalUsers}+</p>
              <p className="text-muted-foreground">{t("registeredUsers")}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">{stats.totalBids}+</p>
              <p className="text-muted-foreground">{t("totalBids")}</p>
            </div>
            <div className="text-center">
              <p className="text-4xl font-bold text-primary">24/7</p>
              <p className="text-muted-foreground">{t("onlineBidding")}</p>
            </div>
          </div>
        </div>
      </section>

      {/* Featured Auctions */}
      <section className="py-16">
        <div className="container">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">{t("featuredAuctions")}</h2>
              <p className="text-muted-foreground mt-1">
                {t("endingSoon")}
              </p>
            </div>
            <Button variant="outline" asChild>
              <Link href="/auctions">{tCommon("viewAll")}</Link>
            </Button>
          </div>

          {featuredAuctions.length > 0 ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredAuctions.map((auction) => (
                <AuctionCard key={auction.id} auction={auction} />
              ))}
            </div>
          ) : (
            <div className="text-center py-12 bg-muted/50 rounded-lg">
              <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-semibold mb-2">{t("noActiveAuctions")}</h3>
              <p className="text-muted-foreground">
                {t("checkBackSoon")}
              </p>
            </div>
          )}
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-muted/30">
        <div className="container">
          <h2 className="text-3xl font-bold text-center mb-12">
            {t("whyChoose")}
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Shield className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("verifiedVehicles")}</h3>
              <p className="text-muted-foreground">
                {t("verifiedVehiclesDesc")}
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Clock className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("realTimeBidding")}</h3>
              <p className="text-muted-foreground">
                {t("realTimeBiddingDesc")}
              </p>
            </div>
            <div className="text-center p-6">
              <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                <Users className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">{t("trustedCommunity")}</h3>
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
