/**
 * Image Download API - Download images for existing auctions
 *
 * This endpoint downloads images from IVO and saves them locally.
 * Use this to backfill images for auctions that were scraped before
 * the local image storage was implemented.
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { downloadAuctionImages, hasLocalImages, getLocalImagePaths } from "@/lib/crawler/image-downloader"
import { crawlerLogger } from "@/lib/crawler/logger"

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
    const { auctionIds, externalIds, force = false } = body

    // Determine which auctions to process
    let auctionsToProcess: Array<{ id: string; externalId: string }> = []

    if (externalIds && externalIds.length > 0) {
      // Download by external IDs (IVO auction IDs like "BE250937508")
      auctionsToProcess = externalIds.map((externalId: string) => ({
        id: externalId,
        externalId,
      }))
    } else if (auctionIds && auctionIds.length > 0) {
      // Download by internal database IDs
      const auctions = await prisma.scrapedAuction.findMany({
        where: { id: { in: auctionIds } },
        select: { id: true, externalId: true },
      })
      auctionsToProcess = auctions
    } else {
      // Download for all FETCHED auctions that don't have local images yet
      const auctions = await prisma.scrapedAuction.findMany({
        where: { selectionStatus: "FETCHED" },
        select: { id: true, externalId: true },
      })

      if (!force) {
        // Filter out auctions that already have local images
        auctionsToProcess = auctions.filter(a => !hasLocalImages(a.externalId))
      } else {
        auctionsToProcess = auctions
      }
    }

    if (auctionsToProcess.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No auctions to process",
        processed: 0,
      })
    }

    crawlerLogger.info(`[DownloadImages] Starting download for ${auctionsToProcess.length} auctions`)

    const results: Array<{
      externalId: string
      success: boolean
      imageCount: number
      error?: string
    }> = []

    for (const auction of auctionsToProcess) {
      try {
        // Skip if already has local images and not forcing
        if (!force && hasLocalImages(auction.externalId)) {
          const existingPaths = getLocalImagePaths(auction.externalId)
          results.push({
            externalId: auction.externalId,
            success: true,
            imageCount: existingPaths.length,
          })
          continue
        }

        const localPaths = await downloadAuctionImages(auction.externalId)

        // Update database if this is a ScrapedAuction
        if (auction.id !== auction.externalId) {
          await prisma.scrapedAuction.update({
            where: { id: auction.id },
            data: {
              images: localPaths.length > 0 ? JSON.stringify(localPaths) : undefined,
            },
          })
        }

        results.push({
          externalId: auction.externalId,
          success: true,
          imageCount: localPaths.length,
        })
      } catch (error) {
        crawlerLogger.error(`[DownloadImages] Failed for ${auction.externalId}:`, error)
        results.push({
          externalId: auction.externalId,
          success: false,
          imageCount: 0,
          error: error instanceof Error ? error.message : "Unknown error",
        })
      }

      // Small delay between auctions
      await new Promise(resolve => setTimeout(resolve, 500))
    }

    const successCount = results.filter(r => r.success).length
    const totalImages = results.reduce((sum, r) => sum + r.imageCount, 0)

    crawlerLogger.info(`[DownloadImages] Completed: ${successCount}/${results.length} successful, ${totalImages} total images`)

    return NextResponse.json({
      success: true,
      processed: results.length,
      successful: successCount,
      totalImages,
      results,
    })
  } catch (error) {
    crawlerLogger.error("[DownloadImages] Request failed:", error)
    return NextResponse.json(
      {
        error: "Failed to download images",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

// GET - Check image download status for auctions
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
    const externalId = searchParams.get("externalId")

    if (externalId) {
      // Check specific auction
      const hasImages = hasLocalImages(externalId)
      const imagePaths = hasImages ? getLocalImagePaths(externalId) : []

      return NextResponse.json({
        externalId,
        hasLocalImages: hasImages,
        imageCount: imagePaths.length,
        images: imagePaths,
      })
    }

    // Get overview of all FETCHED auctions
    const fetchedAuctions = await prisma.scrapedAuction.findMany({
      where: { selectionStatus: "FETCHED" },
      select: { id: true, externalId: true },
    })

    let withLocalImages = 0
    let withoutLocalImages = 0

    for (const auction of fetchedAuctions) {
      if (hasLocalImages(auction.externalId)) {
        withLocalImages++
      } else {
        withoutLocalImages++
      }
    }

    return NextResponse.json({
      total: fetchedAuctions.length,
      withLocalImages,
      withoutLocalImages,
    })
  } catch (error) {
    crawlerLogger.error("[DownloadImages] Status check failed:", error)
    return NextResponse.json(
      { error: "Failed to check image status" },
      { status: 500 }
    )
  }
}
