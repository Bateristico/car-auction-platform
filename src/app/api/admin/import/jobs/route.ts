import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

const COST_PER_DETAIL = 0.23 // EUR

// GET - List all scrape jobs
export async function GET(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const jobs = await prisma.scrapeJob.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        _count: { select: { auctions: true } },
      },
      take: 50,
    })

    return NextResponse.json({ jobs })
  } catch (error) {
    console.error("Error fetching scrape jobs:", error)
    return NextResponse.json(
      { error: "Failed to fetch scrape jobs" },
      { status: 500 }
    )
  }
}

// POST - Create and trigger a new scrape job
export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    // Get all selected auctions
    const selectedAuctions = await prisma.scrapedAuction.findMany({
      where: { selectionStatus: "SELECTED" },
      select: { id: true, externalId: true },
    })

    if (selectedAuctions.length === 0) {
      return NextResponse.json(
        { error: "No auctions selected" },
        { status: 400 }
      )
    }

    const estimatedCost = selectedAuctions.length * COST_PER_DETAIL

    // Create job
    const job = await prisma.scrapeJob.create({
      data: {
        auctionCount: selectedAuctions.length,
        estimatedCost,
        createdBy: session.user.id,
        auctions: {
          connect: selectedAuctions.map((a) => ({ id: a.id })),
        },
      },
    })

    // Update auction statuses to FETCHING
    await prisma.scrapedAuction.updateMany({
      where: { id: { in: selectedAuctions.map((a) => a.id) } },
      data: { selectionStatus: "FETCHING" },
    })

    // Trigger crawler via webhook (async, don't wait for response)
    triggerCrawlerJob(job.id, selectedAuctions.map((a) => a.externalId))

    return NextResponse.json({ job })
  } catch (error) {
    console.error("Error creating scrape job:", error)
    return NextResponse.json(
      { error: "Failed to create scrape job" },
      { status: 500 }
    )
  }
}

async function triggerCrawlerJob(jobId: string, externalIds: string[]) {
  const crawlerWebhookUrl = process.env.CRAWLER_WEBHOOK_URL
  const crawlerApiKey = process.env.CRAWLER_API_KEY

  if (!crawlerWebhookUrl) {
    console.warn("CRAWLER_WEBHOOK_URL not configured, skipping webhook trigger")
    return
  }

  try {
    await fetch(crawlerWebhookUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "x-api-key": crawlerApiKey || "",
      },
      body: JSON.stringify({ jobId, auctionIds: externalIds }),
    })
  } catch (error) {
    console.error("Failed to trigger crawler:", error)
  }
}
