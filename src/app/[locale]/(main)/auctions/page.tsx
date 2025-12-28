import { Suspense } from "react"
import { getTranslations, setRequestLocale } from "next-intl/server"
import { prisma } from "@/lib/prisma"
import { AuctionFilters } from "./auction-filters"
import { AuctionGrid } from "./auction-grid"
import { Loader2 } from "lucide-react"

export async function generateMetadata({ params }: { params: Promise<{ locale: string }> }) {
  const { locale } = await params
  const t = await getTranslations({ locale, namespace: "auctions" })

  return {
    title: t("metaTitle"),
    description: t("metaDescription"),
    robots: {
      index: true,
      follow: true,
    },
  }
}

interface SearchParams {
  search?: string
  type?: string
  minYear?: string
  maxYear?: string
  minMileage?: string
  maxMileage?: string
  sort?: string
  page?: string
}

async function getAuctions(searchParams: SearchParams) {
  const {
    search,
    type,
    minYear,
    maxYear,
    minMileage,
    maxMileage,
    sort = "endDate",
    page = "1",
  } = searchParams

  const pageSize = 12
  const pageNumber = parseInt(page) || 1
  const skip = (pageNumber - 1) * pageSize

  const where: any = {
    status: "ACTIVE",
  }

  if (search) {
    where.OR = [
      { title: { contains: search } },
      { make: { contains: search } },
      { model: { contains: search } },
    ]
  }

  if (type && type !== "all") {
    where.vehicleType = type.toUpperCase()
  }

  if (minYear) {
    where.year = { ...where.year, gte: parseInt(minYear) }
  }

  if (maxYear) {
    where.year = { ...where.year, lte: parseInt(maxYear) }
  }

  if (minMileage) {
    where.mileage = { ...where.mileage, gte: parseInt(minMileage) }
  }

  if (maxMileage) {
    where.mileage = { ...where.mileage, lte: parseInt(maxMileage) }
  }

  let orderBy: any = { endDate: "asc" }

  switch (sort) {
    case "newest":
      orderBy = { createdAt: "desc" }
      break
    case "popular":
      orderBy = { bids: { _count: "desc" } }
      break
    case "endDate":
    default:
      orderBy = { endDate: "asc" }
      break
  }

  const [auctions, total] = await Promise.all([
    prisma.auction.findMany({
      where,
      orderBy,
      skip,
      take: pageSize,
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
    }),
    prisma.auction.count({ where }),
  ])

  return {
    auctions,
    total,
    pageSize,
    currentPage: pageNumber,
    totalPages: Math.ceil(total / pageSize),
  }
}

export default async function AuctionsPage({
  searchParams,
  params,
}: {
  searchParams: Promise<SearchParams>
  params: Promise<{ locale: string }>
}) {
  const { locale } = await params
  setRequestLocale(locale)
  const t = await getTranslations("auctions")

  const searchParamsData = await searchParams
  const data = await getAuctions(searchParamsData)

  return (
    <div className="container py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2">{t("title")}</h1>
        <p className="text-muted-foreground">
          {t("subtitle")}
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        <aside className="lg:col-span-1">
          <AuctionFilters />
        </aside>

        <div className="lg:col-span-3">
          <Suspense
            fallback={
              <div className="flex items-center justify-center h-64">
                <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
              </div>
            }
          >
            <AuctionGrid
              auctions={data.auctions}
              total={data.total}
              currentPage={data.currentPage}
              totalPages={data.totalPages}
            />
          </Suspense>
        </div>
      </div>
    </div>
  )
}
