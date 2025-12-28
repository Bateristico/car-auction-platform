import { getTranslations, setRequestLocale } from "next-intl/server"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Car, Users, Gavel, TrendingUp } from "lucide-react"

async function getStats() {
  const [
    totalAuctions,
    activeAuctions,
    totalUsers,
    totalBids,
    recentBids,
    topAuctions,
  ] = await Promise.all([
    prisma.auction.count(),
    prisma.auction.count({ where: { status: "ACTIVE" } }),
    prisma.user.count(),
    prisma.bid.count(),
    prisma.bid.findMany({
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        user: { select: { firstName: true, lastName: true } },
        auction: { select: { title: true, referenceNumber: true } },
      },
    }),
    prisma.auction.findMany({
      where: { status: "ACTIVE" },
      take: 5,
      orderBy: { bids: { _count: "desc" } },
      include: {
        _count: { select: { bids: true } },
      },
    }),
  ])

  return {
    totalAuctions,
    activeAuctions,
    totalUsers,
    totalBids,
    recentBids,
    topAuctions,
  }
}

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("admin")

  const stats = await getStats()

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{t("dashboard")}</h1>
        <p className="text-muted-foreground">
          {t("overview")}
        </p>
      </div>

      {/* Stats cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalAuctions")}</CardTitle>
            <Car className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalAuctions}</div>
            <p className="text-xs text-muted-foreground">
              {stats.activeAuctions} {t("active")}
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalUsers")}</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalUsers}</div>
            <p className="text-xs text-muted-foreground">{t("registeredUsers")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("totalBids")}</CardTitle>
            <Gavel className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalBids}</div>
            <p className="text-xs text-muted-foreground">{t("allTime")}</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">{t("activeRate")}</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {stats.totalAuctions > 0
                ? Math.round((stats.activeAuctions / stats.totalAuctions) * 100)
                : 0}
              %
            </div>
            <p className="text-xs text-muted-foreground">{t("ofAuctionsActive")}</p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {/* Recent bids */}
        <Card>
          <CardHeader>
            <CardTitle>{t("recentBids")}</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.recentBids.length > 0 ? (
              <div className="space-y-4">
                {stats.recentBids.map((bid) => (
                  <div
                    key={bid.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-sm">
                        {bid.user.firstName} {bid.user.lastName}
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {bid.auction.title}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm text-primary">
                        {bid.amount.toLocaleString()} PLN
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {new Date(bid.createdAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">{t("noBidsYet")}</p>
            )}
          </CardContent>
        </Card>

        {/* Top auctions */}
        <Card>
          <CardHeader>
            <CardTitle>{t("mostActiveAuctions")}</CardTitle>
          </CardHeader>
          <CardContent>
            {stats.topAuctions.length > 0 ? (
              <div className="space-y-4">
                {stats.topAuctions.map((auction) => (
                  <div
                    key={auction.id}
                    className="flex items-center justify-between border-b pb-3 last:border-0 last:pb-0"
                  >
                    <div>
                      <p className="font-medium text-sm">{auction.title}</p>
                      <p className="text-xs text-muted-foreground font-mono">
                        {auction.referenceNumber}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-bold text-sm">
                        {auction._count.bids} bids
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {auction.currentPrice.toLocaleString()} PLN
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-muted-foreground text-sm">{t("noActiveAuctions")}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
