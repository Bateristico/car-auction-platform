import { redirect } from "next/navigation"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { Link } from "@/i18n/navigation"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Gavel, Clock, Trophy, ArrowRight, Car } from "lucide-react"
import { formatDistanceToNow } from "date-fns"

async function getUserStats(userId: string) {
  const [totalBids, activeBids, wonAuctions] = await Promise.all([
    // Total bids placed
    prisma.bid.count({
      where: { userId },
    }),
    // Active auctions user has bid on
    prisma.bid.findMany({
      where: {
        userId,
        auction: {
          status: "ACTIVE",
          endDate: { gt: new Date() },
        },
      },
      select: { auctionId: true },
      distinct: ["auctionId"],
    }),
    // Won auctions (ended auctions where user has highest bid)
    prisma.auction.count({
      where: {
        status: "ENDED",
        bids: {
          some: { userId },
        },
      },
    }),
  ])

  return {
    totalBids,
    activeBidsCount: activeBids.length,
    wonAuctionsCount: wonAuctions,
  }
}

async function getRecentBids(userId: string) {
  const bids = await prisma.bid.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    take: 5,
    include: {
      auction: {
        select: {
          id: true,
          title: true,
          make: true,
          model: true,
          year: true,
          status: true,
          endDate: true,
          startingPrice: true,
          images: true,
        },
      },
    },
  })

  return bids
}

export default async function DashboardPage({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("dashboard")

  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const [stats, recentBids] = await Promise.all([
    getUserStats(session.user.id),
    getRecentBids(session.user.id),
  ])

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold">{t("title")}</h1>
        <p className="text-muted-foreground mt-2">
          {t("welcomeBack", { name: session.user.firstName })} {t("overview")}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("totalBids")}
            </CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalBids}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("bidsPlaced")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("activeAuctions")}
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.activeBidsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("participating")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium text-muted-foreground">
              {t("auctionsWon")}
            </CardTitle>
            <Trophy className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.wonAuctionsCount}</div>
            <p className="text-xs text-muted-foreground mt-1">
              {t("successfulWins")}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Recent Bids */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <div>
            <CardTitle>{t("recentBids")}</CardTitle>
            <CardDescription>{t("latestActivity")}</CardDescription>
          </div>
          <Button variant="outline" size="sm" asChild>
            <Link href="/dashboard/bids">
              {t("viewAll")}
              <ArrowRight className="ml-2 h-4 w-4" />
            </Link>
          </Button>
        </CardHeader>
        <CardContent>
          {recentBids.length === 0 ? (
            <div className="text-center py-8">
              <Car className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <p className="text-muted-foreground mb-4">
                {t("noBids")}
              </p>
              <Button asChild>
                <Link href="/auctions">{t("browseAuctions")}</Link>
              </Button>
            </div>
          ) : (
            <div className="space-y-4">
              {recentBids.map((bid) => {
                const isActive = bid.auction.status === "ACTIVE" && new Date(bid.auction.endDate) > new Date()
                const isEnded = bid.auction.status === "ENDED" || new Date(bid.auction.endDate) <= new Date()

                return (
                  <Link
                    key={bid.id}
                    href={`/auctions/${bid.auction.id}`}
                    className="flex items-center justify-between p-4 rounded-lg border hover:bg-muted/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div className="w-16 h-12 bg-muted rounded flex items-center justify-center">
                        <Car className="h-6 w-6 text-muted-foreground" />
                      </div>
                      <div>
                        <p className="font-medium">{bid.auction.title}</p>
                        <p className="text-sm text-muted-foreground">
                          {bid.auction.year} {bid.auction.make} {bid.auction.model}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-primary">
                        {bid.amount.toLocaleString()} PLN
                      </p>
                      <div className="flex items-center gap-2 justify-end mt-1">
                        <Badge variant={isActive ? "default" : isEnded ? "secondary" : "outline"}>
                          {isActive ? t("active") : isEnded ? t("ended") : bid.auction.status}
                        </Badge>
                        <span className="text-xs text-muted-foreground">
                          {formatDistanceToNow(new Date(bid.createdAt), { addSuffix: true })}
                        </span>
                      </div>
                    </div>
                  </Link>
                )
              })}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
