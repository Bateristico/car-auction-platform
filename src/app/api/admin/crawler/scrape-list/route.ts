/**
 * Crawler API - Scrape List Endpoint
 *
 * Triggers a FREE list scrape from IVO to fetch available auctions.
 * This does NOT cost money - it only fetches the auction list.
 * Now fetches ALL tabs (day_ids) from the auction grid.
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { createIvoService } from "@/lib/crawler/ivo-service"
import { parseAuctionList } from "@/lib/crawler/parser"
import { crawlerLogger } from "@/lib/crawler/logger"
import { ParallelImageDownloader } from "@/lib/crawler/parallel-image-downloader"
import { CrawlerError, CrawlerErrorCode } from "@/lib/crawler/retry"

export async function POST(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    crawlerLogger.info(`Starting list scrape for all tabs...`)

    // Create IVO service and authenticate
    const ivoService = createIvoService()

    try {
      await ivoService.init()

      // Fetch auction lists from ALL tabs (FREE)
      const allListsHtml = await ivoService.fetchAllAuctionLists()

      // Combine all auctions from all tabs
      const allAuctions: ReturnType<typeof parseAuctionList>["auctions"] = []
      const seenIds = new Set<string>()

      for (const [dayId, html] of allListsHtml) {
        const parsed = parseAuctionList(html)
        crawlerLogger.info(`Tab day_id=${dayId}: parsed ${parsed.auctions.length} auctions`)

        // Add auctions we haven't seen yet (avoid duplicates across tabs)
        for (const auction of parsed.auctions) {
          if (auction.auctionId && !seenIds.has(auction.auctionId)) {
            seenIds.add(auction.auctionId)
            allAuctions.push(auction)
          }
        }
      }

      crawlerLogger.info(`Total unique auctions from all tabs: ${allAuctions.length}`)

      // Track stats
      let created = 0
      let updated = 0
      let skipped = 0

      // Upsert each auction into the database
      for (const auction of allAuctions) {
        if (!auction.auctionId || !auction.brand || !auction.model) {
          skipped++
          continue
        }

        try {
          const existing = await prisma.scrapedAuction.findUnique({
            where: { externalId: auction.auctionId },
          })

          // Build thumbnail URL if we have an auction ID
          let thumbnailUrl = auction.thumbnailUrl
          if (!thumbnailUrl || thumbnailUrl.startsWith("img/")) {
            thumbnailUrl = ivoService.getThumbnailUrl(auction.auctionId, 0, 200, 150)
          }

          if (existing) {
            // Update existing - but don't change selection status
            await prisma.scrapedAuction.update({
              where: { externalId: auction.auctionId },
              data: {
                mileage: auction.mileage ?? existing.mileage,
                thumbnailUrl: thumbnailUrl ?? existing.thumbnailUrl,
                status: auction.status ?? existing.status,
                rawListData: JSON.stringify(auction),
              },
            })
            updated++
          } else {
            // Create new
            await prisma.scrapedAuction.create({
              data: {
                externalId: auction.auctionId,
                source: "IVO",
                brand: auction.brand,
                model: auction.model,
                year: auction.year,
                mileage: auction.mileage,
                fuelType: auction.fuelType,
                power: auction.power,
                engineCc: auction.engineCc,
                co2: auction.co2,
                location: auction.location?.name,
                locationAddress: auction.location?.address,
                locationCity: auction.location?.postalCity,
                locationCountry: auction.location?.country,
                thumbnailUrl,
                status: auction.status,
                expirationDate: auction.expirationDate
                  ? parseExpirationDate(auction.expirationDate)
                  : null,
                rawListData: JSON.stringify(auction),
                selectionStatus: "PENDING",
              },
            })
            created++
          }
        } catch (err) {
          crawlerLogger.error(`Failed to upsert auction ${auction.auctionId}:`, err)
          skipped++
        }
      }

      crawlerLogger.info(`Scrape complete: ${created} created, ${updated} updated, ${skipped} skipped`)

      // Download images in parallel for all auctions
      let auctionsWithImages = 0
      let totalImagesDownloaded = 0
      const browser = ivoService.getBrowser()

      if (browser) {
        // Ensure auth state is saved for parallel workers
        await ivoService.ensureAuthStateSaved()

        const downloader = new ParallelImageDownloader(browser)

        // Prepare auction list for download (only valid auctions)
        const auctionsToDownload = allAuctions
          .filter(a => a.auctionId && a.brand && a.model)
          .map(a => ({
            auctionId: a.auctionId!,
            brand: a.brand,
            model: a.model,
          }))

        crawlerLogger.info(`Starting parallel image download for ${auctionsToDownload.length} auctions...`)

        const imageResults = await downloader.downloadAll(auctionsToDownload)

        // Update database with image paths
        for (const [auctionId, imagePaths] of imageResults) {
          totalImagesDownloaded += imagePaths.length

          if (imagePaths.length > 0) {
            try {
              await prisma.scrapedAuction.update({
                where: { externalId: auctionId },
                data: { images: JSON.stringify(imagePaths) },
              })
              auctionsWithImages++
            } catch (err) {
              crawlerLogger.error(`Failed to update images for ${auctionId}:`, err)
            }
          }
        }

        crawlerLogger.info(
          `Image download complete: ${totalImagesDownloaded} images for ${auctionsWithImages} auctions`
        )
      } else {
        crawlerLogger.warn("Browser not available for image download")
      }

      return NextResponse.json({
        success: true,
        stats: {
          total: allAuctions.length,
          tabs: allListsHtml.size,
          created,
          updated,
          skipped,
          auctionsWithImages,
          totalImagesDownloaded,
        },
      })
    } finally {
      await ivoService.close()
    }
  } catch (error) {
    crawlerLogger.error("List scrape failed:", error)

    // Handle CrawlerError with specific codes
    if (error instanceof CrawlerError) {
      const statusMap: Record<string, number> = {
        [CrawlerErrorCode.SESSION_EXPIRED]: 401,
        [CrawlerErrorCode.SERVER_ERROR]: 503,
        [CrawlerErrorCode.BROWSER_NOT_INSTALLED]: 503,
        [CrawlerErrorCode.MAX_RETRIES_EXCEEDED]: 503,
        [CrawlerErrorCode.NETWORK_ERROR]: 503,
        [CrawlerErrorCode.SCRAPE_FAILED]: 500,
      }

      return NextResponse.json(
        {
          error: error.message,
          code: error.code,
          retryable: error.retryable,
          retryAfterMs: error.retryAfterMs,
        },
        { status: statusMap[error.code] || 500 }
      )
    }

    // Handle generic errors
    const errorMessage = error instanceof Error ? error.message : "Unknown error"
    const isBrowserUnavailable = errorMessage.includes("Crawler feature unavailable") ||
                                  errorMessage.includes("Playwright browser is not installed")

    return NextResponse.json(
      {
        error: isBrowserUnavailable ? "Crawler unavailable" : "Failed to scrape auction list",
        message: errorMessage,
        code: isBrowserUnavailable ? CrawlerErrorCode.BROWSER_NOT_INSTALLED : CrawlerErrorCode.SCRAPE_FAILED,
        retryable: !isBrowserUnavailable,
      },
      { status: isBrowserUnavailable ? 503 : 500 }
    )
  }
}

/**
 * Parse expiration date from IVO format (DD-MM-YYYY or DD-MM-YYYY HH:mm)
 */
function parseExpirationDate(dateStr: string): Date | null {
  try {
    // Try DD-MM-YYYY format
    const match = dateStr.match(/(\d{2})-(\d{2})-(\d{4})(?:\s+(\d{2}):(\d{2}))?/)
    if (match) {
      const [, day, month, year, hours, minutes] = match
      const date = new Date(
        parseInt(year),
        parseInt(month) - 1,
        parseInt(day),
        hours ? parseInt(hours) : 23,
        minutes ? parseInt(minutes) : 59
      )
      return date
    }
    return null
  } catch {
    return null
  }
}
