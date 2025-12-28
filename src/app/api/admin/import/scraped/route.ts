import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - List scraped auctions with filtering and pagination
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { searchParams } = new URL(request.url)
    const status = searchParams.get("status")
    const brand = searchParams.get("brand")
    const yearFrom = searchParams.get("yearFrom")
    const yearTo = searchParams.get("yearTo")
    const page = parseInt(searchParams.get("page") || "1")
    const limit = parseInt(searchParams.get("limit") || "50")

    const where: Record<string, unknown> = {}

    if (status) where.selectionStatus = status
    if (brand) where.brand = { contains: brand }
    if (yearFrom || yearTo) {
      where.year = {}
      if (yearFrom) (where.year as Record<string, number>).gte = parseInt(yearFrom)
      if (yearTo) (where.year as Record<string, number>).lte = parseInt(yearTo)
    }

    const [auctions, total] = await Promise.all([
      prisma.scrapedAuction.findMany({
        where,
        orderBy: { firstSeenAt: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.scrapedAuction.count({ where }),
    ])

    // Get unique brands for filter
    const brands = await prisma.scrapedAuction.findMany({
      select: { brand: true },
      distinct: ["brand"],
      orderBy: { brand: "asc" },
    })

    return NextResponse.json({
      auctions,
      pagination: {
        page,
        limit,
        total,
        totalPages: Math.ceil(total / limit),
      },
      filters: {
        brands: brands.map((b) => b.brand),
      },
    })
  } catch (error) {
    console.error("Error fetching scraped auctions:", error)
    return NextResponse.json(
      { error: "Failed to fetch scraped auctions" },
      { status: 500 }
    )
  }
}

// POST - Receive scraped data from crawler (webhook endpoint)
export async function POST(request: NextRequest) {
  try {
    // API key authentication for crawler
    const apiKey = request.headers.get("x-api-key")
    if (apiKey !== process.env.CRAWLER_API_KEY) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    const data = await request.json()

    if (!data.auctions || !Array.isArray(data.auctions)) {
      return NextResponse.json(
        { error: "Invalid data format: auctions array required" },
        { status: 400 }
      )
    }

    // Upsert scraped auctions
    const results = await Promise.all(
      data.auctions.map((auction: {
        auctionId: string
        brand: string
        model: string
        year?: number
        mileage?: number
        fuelType?: string
        power?: number
        thumbnailUrl?: string
        status?: string
        rawData?: {
          engineCc?: number
          co2?: number
          location?: {
            name?: string
            postalCity?: string
            country?: string
          }
        }
      }) =>
        prisma.scrapedAuction.upsert({
          where: { externalId: auction.auctionId },
          create: {
            externalId: auction.auctionId,
            brand: auction.brand,
            model: auction.model,
            year: auction.year,
            mileage: auction.mileage,
            fuelType: auction.fuelType,
            power: auction.power,
            engineCc: auction.rawData?.engineCc,
            co2: auction.rawData?.co2,
            location: auction.rawData?.location?.name,
            locationCity: auction.rawData?.location?.postalCity,
            locationCountry: auction.rawData?.location?.country,
            thumbnailUrl: auction.thumbnailUrl,
            status: auction.status,
            rawListData: JSON.stringify(auction),
          },
          update: {
            mileage: auction.mileage,
            thumbnailUrl: auction.thumbnailUrl,
            status: auction.status,
            rawListData: JSON.stringify(auction),
          },
        })
      )
    )

    return NextResponse.json({
      received: data.auctions.length,
      processed: results.length,
    })
  } catch (error) {
    console.error("Error processing scraped auctions:", error)
    return NextResponse.json(
      { error: "Failed to process scraped auctions" },
      { status: 500 }
    )
  }
}
