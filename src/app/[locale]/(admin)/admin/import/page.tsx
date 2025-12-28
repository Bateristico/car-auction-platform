import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrapedAuctionsTable } from "./scraped-table"
import { SelectionToolbar } from "./selection-toolbar"
import { CrawlerControls } from "./crawler-controls"

async function getStats() {
  const [total, pending, selected, fetching, fetched, imported] = await Promise.all([
    prisma.scrapedAuction.count(),
    prisma.scrapedAuction.count({ where: { selectionStatus: "PENDING" } }),
    prisma.scrapedAuction.count({ where: { selectionStatus: "SELECTED" } }),
    prisma.scrapedAuction.count({ where: { selectionStatus: "FETCHING" } }),
    prisma.scrapedAuction.count({ where: { selectionStatus: "FETCHED" } }),
    prisma.scrapedAuction.count({ where: { selectionStatus: "IMPORTED" } }),
  ])
  return { total, pending, selected, fetching, fetched, imported }
}

async function getBrands() {
  const brands = await prisma.scrapedAuction.findMany({
    select: { brand: true },
    distinct: ["brand"],
    orderBy: { brand: "asc" },
  })
  return brands.map((b) => b.brand)
}

async function getInitialAuctions() {
  const auctions = await prisma.scrapedAuction.findMany({
    orderBy: { firstSeenAt: "desc" },
    take: 50,
  })
  return auctions
}

export default async function ImportPage() {
  const [stats, brands, initialAuctions] = await Promise.all([
    getStats(),
    getBrands(),
    getInitialAuctions(),
  ])

  const COST_PER_DETAIL = 0.23

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Import Vehicles</h1>
        <p className="text-muted-foreground">
          Review and select scraped vehicles for detail fetching
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-6">
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Total Scraped</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {stats.pending}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Selected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {stats.selected}
            </div>
            <p className="text-xs text-muted-foreground">
              Est. cost: {(stats.selected * COST_PER_DETAIL).toFixed(2)} EUR
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Fetching</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-orange-600">
              {stats.fetching}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">With Details</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {stats.fetched}
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium">Imported</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {stats.imported}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Crawler Controls */}
      <CrawlerControls selectedCount={stats.selected} fetchingCount={stats.fetching} />

      {/* Selection Toolbar */}
      <SelectionToolbar selectedCount={stats.selected} />

      {/* Table */}
      <ScrapedAuctionsTable
        initialAuctions={initialAuctions}
        brands={brands}
      />
    </div>
  )
}
