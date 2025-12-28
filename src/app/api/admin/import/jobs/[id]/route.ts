import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// GET - Get single job status with progress
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { id } = await params

    const job = await prisma.scrapeJob.findUnique({
      where: { id },
      include: {
        auctions: {
          select: {
            id: true,
            externalId: true,
            brand: true,
            model: true,
            selectionStatus: true,
            detailFetchedAt: true,
          },
        },
      },
    })

    if (!job) {
      return NextResponse.json({ error: "Job not found" }, { status: 404 })
    }

    // Calculate progress
    const fetchedCount = job.auctions.filter(
      (a) => a.selectionStatus === "FETCHED" || a.selectionStatus === "IMPORTED"
    ).length
    const errorCount = job.auctions.filter(
      (a) => a.selectionStatus === "ERROR"
    ).length
    const progress = Math.round(
      ((fetchedCount + errorCount) / job.auctions.length) * 100
    )

    return NextResponse.json({
      job: {
        ...job,
        progress,
        fetchedCount,
        errorCount,
      },
    })
  } catch (error) {
    console.error("Error fetching scrape job:", error)
    return NextResponse.json(
      { error: "Failed to fetch scrape job" },
      { status: 500 }
    )
  }
}

// PATCH - Update job status (for webhook callbacks from crawler)
export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    // API key authentication for crawler
    const apiKey = request.headers.get("x-api-key")
    if (apiKey !== process.env.CRAWLER_API_KEY) {
      return NextResponse.json({ error: "Invalid API key" }, { status: 401 })
    }

    const { id } = await params
    const data = await request.json()

    // Update job
    const updateData: Record<string, unknown> = {}

    if (data.status) updateData.status = data.status
    if (data.progress !== undefined) updateData.progress = data.progress
    if (data.error) updateData.error = data.error
    if (data.actualCost !== undefined) updateData.actualCost = data.actualCost

    if (data.status === "RUNNING" && !data.startedAt) {
      updateData.startedAt = new Date()
    }
    if (data.status === "COMPLETED" || data.status === "FAILED") {
      updateData.completedAt = new Date()
    }

    const job = await prisma.scrapeJob.update({
      where: { id },
      data: updateData,
    })

    // If auction details are provided, update them
    if (data.auctionUpdates && Array.isArray(data.auctionUpdates)) {
      for (const update of data.auctionUpdates) {
        await prisma.scrapedAuction.update({
          where: { externalId: update.externalId },
          data: {
            selectionStatus: update.status,
            vin: update.vin,
            images: update.images ? JSON.stringify(update.images) : undefined,
            detailData: update.detailData
              ? JSON.stringify(update.detailData)
              : undefined,
            rawDetailData: update.rawData
              ? JSON.stringify(update.rawData)
              : undefined,
            detailFetchedAt: update.status === "FETCHED" ? new Date() : undefined,
            detailCost: update.cost,
          },
        })
      }
    }

    return NextResponse.json({ job })
  } catch (error) {
    console.error("Error updating scrape job:", error)
    return NextResponse.json(
      { error: "Failed to update scrape job" },
      { status: 500 }
    )
  }
}
