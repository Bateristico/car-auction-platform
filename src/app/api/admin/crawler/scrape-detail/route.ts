/**
 * Crawler API - Scrape Detail Endpoint
 *
 * Triggers PAID detail scrapes for selected auctions.
 * WARNING: This endpoint COSTS MONEY - each detail view costs ~0.23 EUR!
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createIvoService, IvoService } from "@/lib/crawler/ivo-service"
import { parseAuctionDetail } from "@/lib/crawler/parser"
import { crawlerLogger } from "@/lib/crawler/logger"
import { crawlerConfig } from "@/lib/crawler/config"
import { downloadAuctionImages } from "@/lib/crawler/image-downloader"
import { CrawlerError, CrawlerErrorCode } from "@/lib/crawler/retry"

const COST_PER_DETAIL = crawlerConfig.costs.detailViewCost

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const body = await request.json().catch(() => ({}))

    // Get selected auctions or specific IDs
    let auctionIds: string[] = body.auctionIds || []

    if (auctionIds.length === 0) {
      // Fetch all SELECTED auctions
      const selectedAuctions = await prisma.scrapedAuction.findMany({
        where: { selectionStatus: "SELECTED" },
        select: { id: true, externalId: true },
      })
      auctionIds = selectedAuctions.map((a) => a.id)
    }

    if (auctionIds.length === 0) {
      return NextResponse.json(
        { error: "No auctions selected for detail fetch" },
        { status: 400 }
      )
    }

    // Calculate estimated cost
    const estimatedCost = auctionIds.length * COST_PER_DETAIL

    crawlerLogger.cost(
      `Detail scrape requested for ${auctionIds.length} auctions. Estimated cost: ${estimatedCost.toFixed(2)} EUR`
    )

    // Get the auctions to scrape
    const auctionsToScrape = await prisma.scrapedAuction.findMany({
      where: { id: { in: auctionIds } },
      select: { id: true, externalId: true, brand: true, model: true },
    })

    if (auctionsToScrape.length === 0) {
      return NextResponse.json(
        { error: "No valid auctions found" },
        { status: 400 }
      )
    }

    // Create a scrape job to track progress
    const job = await prisma.scrapeJob.create({
      data: {
        auctionCount: auctionsToScrape.length,
        estimatedCost,
        createdBy: session.user.id,
        auctions: {
          connect: auctionsToScrape.map((a) => ({ id: a.id })),
        },
      },
    })

    // Update auctions to FETCHING status
    await prisma.scrapedAuction.updateMany({
      where: { id: { in: auctionIds } },
      data: { selectionStatus: "FETCHING" },
    })

    // Start the detail scraping in background (don't await)
    scrapeDetails(job.id, auctionsToScrape)

    return NextResponse.json({
      success: true,
      jobId: job.id,
      auctionCount: auctionsToScrape.length,
      estimatedCost,
      message: `Detail scrape started for ${auctionsToScrape.length} auctions`,
    })
  } catch (error) {
    crawlerLogger.error("Detail scrape request failed:", error)
    return NextResponse.json(
      {
        error: "Failed to start detail scrape",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * Background function to scrape auction details
 * This runs after the API response is sent.
 *
 * Features:
 * - Automatic session refresh on expiration (silent retry)
 * - Retry with exponential backoff for 5XX errors
 * - Tracks failures with error reasons
 * - Allows partial success (continues after individual failures)
 */
async function scrapeDetails(
  jobId: string,
  auctions: Array<{ id: string; externalId: string; brand: string; model: string }>
) {
  const ivoService = createIvoService()
  let successCount = 0
  let failedCount = 0
  let totalCost = 0
  const failureReasons: Array<{ auctionId: string; error: string }> = []

  try {
    await ivoService.init()

    for (const auction of auctions) {
      try {
        crawlerLogger.cost(
          `Fetching detail for ${auction.brand} ${auction.model} (${auction.externalId})`
        )

        // Fetch detail (COSTS MONEY!)
        // The IvoService now handles session refresh and retries internally
        const html = await ivoService.fetchAuctionDetail(
          auction.externalId,
          `Scrape job ${jobId}`
        )

        // Parse the detail HTML
        const detail = parseAuctionDetail(html)

        // Download images locally
        crawlerLogger.info(`Downloading images for ${auction.externalId}...`)
        const localImagePaths = await downloadAuctionImages(auction.externalId)
        crawlerLogger.info(`Downloaded ${localImagePaths.length} images for ${auction.externalId}`)

        // Update auction with detail data and local image paths
        await prisma.scrapedAuction.update({
          where: { id: auction.id },
          data: {
            vin: (detail.vin as string) || null,
            images: localImagePaths.length > 0
              ? JSON.stringify(localImagePaths)
              : (detail.images ? JSON.stringify(detail.images) : null),
            detailData: JSON.stringify(detail),
            selectionStatus: "FETCHED",
            detailFetchedAt: new Date(),
            detailCost: COST_PER_DETAIL,
          },
        })

        successCount++
        totalCost += COST_PER_DETAIL

        crawlerLogger.info(
          `Detail fetched for ${auction.externalId}. Running cost: ${totalCost.toFixed(2)} EUR`
        )

        // Update job progress
        await prisma.scrapeJob.update({
          where: { id: jobId },
          data: {
            progress: successCount,
            actualCost: totalCost,
          },
        })

        // Small delay between requests to be nice to the server
        await new Promise((resolve) => setTimeout(resolve, 1000))
      } catch (err) {
        const errorMessage = err instanceof Error ? err.message : "Unknown error"
        const errorCode = err instanceof CrawlerError ? err.code : "UNKNOWN"

        crawlerLogger.error(
          `Failed to fetch detail for ${auction.externalId} [${errorCode}]:`,
          errorMessage
        )

        // Track the failure reason
        failureReasons.push({
          auctionId: auction.externalId,
          error: `${errorCode}: ${errorMessage}`,
        })

        // Check if this is a fatal session error that we couldn't recover from
        if (err instanceof CrawlerError && err.code === CrawlerErrorCode.SESSION_EXPIRED) {
          crawlerLogger.warn(
            `Session expired and could not be refreshed. Stopping job ${jobId} to prevent further failures.`
          )

          // Mark remaining auctions as ERROR status
          const processedIds = auctions.slice(0, auctions.indexOf(auction) + 1).map(a => a.id)
          const remainingIds = auctions.filter(a => !processedIds.includes(a.id)).map(a => a.id)

          if (remainingIds.length > 0) {
            await prisma.scrapedAuction.updateMany({
              where: { id: { in: remainingIds } },
              data: { selectionStatus: "ERROR" },
            })
          }

          // Update current auction as error
          await prisma.scrapedAuction.update({
            where: { id: auction.id },
            data: { selectionStatus: "ERROR" },
          })

          failedCount += remainingIds.length + 1
          break // Stop processing more auctions
        }

        // Mark this auction as failed (can be retried)
        await prisma.scrapedAuction.update({
          where: { id: auction.id },
          data: { selectionStatus: "ERROR" },
        })

        failedCount++

        // Continue with next auction for non-fatal errors
      }
    }

    // Update job with final stats
    const jobStatus = failedCount === 0 ? "COMPLETED" : (successCount > 0 ? "COMPLETED" : "FAILED")
    await prisma.scrapeJob.update({
      where: { id: jobId },
      data: {
        status: jobStatus,
        completedAt: new Date(),
        progress: successCount,
        actualCost: totalCost,
        error: failureReasons.length > 0 ? JSON.stringify(failureReasons) : null,
      },
    })

    crawlerLogger.info(
      `Scrape job ${jobId} ${jobStatus.toLowerCase()}. Success: ${successCount}, Failed: ${failedCount}, Total cost: ${totalCost.toFixed(2)} EUR`
    )
  } catch (error) {
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    crawlerLogger.error(`Scrape job ${jobId} failed catastrophically:`, errorMessage)

    // Update job as failed
    await prisma.scrapeJob.update({
      where: { id: jobId },
      data: {
        status: "FAILED",
        completedAt: new Date(),
        progress: successCount,
        actualCost: totalCost,
        error: errorMessage,
      },
    })
  } finally {
    await ivoService.close()
  }
}

// GET - Get status of detail scraping
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
    const jobId = searchParams.get("jobId")

    if (jobId) {
      // Get specific job status
      const job = await prisma.scrapeJob.findUnique({
        where: { id: jobId },
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

      return NextResponse.json({ job })
    }

    // Get overview of selected auctions and cost estimate
    const selectedCount = await prisma.scrapedAuction.count({
      where: { selectionStatus: "SELECTED" },
    })

    const fetchingCount = await prisma.scrapedAuction.count({
      where: { selectionStatus: "FETCHING" },
    })

    const fetchedCount = await prisma.scrapedAuction.count({
      where: { selectionStatus: "FETCHED" },
    })

    return NextResponse.json({
      selected: selectedCount,
      fetching: fetchingCount,
      fetched: fetchedCount,
      estimatedCost: selectedCount * COST_PER_DETAIL,
      costPerDetail: COST_PER_DETAIL,
    })
  } catch (error) {
    crawlerLogger.error("Failed to get scrape status:", error)
    return NextResponse.json(
      { error: "Failed to get scrape status" },
      { status: 500 }
    )
  }
}
