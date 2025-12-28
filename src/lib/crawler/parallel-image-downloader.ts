/**
 * Parallel Image Downloader Service
 *
 * Downloads ALL available images from IVO using multiple browser contexts in parallel.
 * Uses placeholder detection to stop when no more real images exist.
 *
 * Based on Playwright docs:
 * - browser.newContext() for isolated sessions
 * - context.addCookies() for authentication
 * - context.request.get() for binary data (avoids charset corruption)
 */

import { Browser, BrowserContext } from "playwright"
import fs from "fs"
import path from "path"
import { crawlerConfig } from "./config"
import { crawlerLogger } from "./logger"
import { isPlaceholderImage, isValidImage } from "./image-utils"

interface AuctionToDownload {
  auctionId: string
  brand?: string
  model?: string
}

interface CookieState {
  cookies: Array<{
    name: string
    value: string
    domain: string
    path: string
    expires?: number
    httpOnly?: boolean
    secure?: boolean
    sameSite?: "Strict" | "Lax" | "None"
  }>
  savedAt: string
}

interface SingleImageResult {
  buffer: Buffer | null
  isPlaceholder: boolean
  error?: string
}

export interface AuctionImageResult {
  auctionId: string
  localPaths: string[]
  totalImages: number
  placeholdersSkipped: number
}

export class ParallelImageDownloader {
  private browser: Browser
  private authStatePath: string
  private outputDir: string
  private concurrency: number

  constructor(browser: Browser) {
    this.browser = browser
    this.authStatePath = crawlerConfig.paths.ivoAuthState
    this.outputDir = path.join(process.cwd(), crawlerConfig.imageDownload.outputDir)
    this.concurrency = crawlerConfig.imageDownload.concurrency
  }

  /**
   * Download images for multiple auctions in parallel using worker pool
   *
   * Creates N browser contexts (workers) that process auctions from a shared queue.
   * Each context has its own request API and shares authentication via cookies.
   */
  async downloadAll(auctions: AuctionToDownload[]): Promise<Map<string, string[]>> {
    const results = new Map<string, string[]>()

    if (auctions.length === 0) {
      return results
    }

    crawlerLogger.info(
      `[ParallelDownloader] Starting download for ${auctions.length} auctions with ${this.concurrency} workers`
    )

    // Verify auth state exists
    if (!fs.existsSync(this.authStatePath)) {
      throw new Error("IVO auth state not found. Run authentication first.")
    }

    // Load cookie state once
    const cookieState = this.loadCookieState()
    if (!cookieState || cookieState.cookies.length === 0) {
      throw new Error("No valid cookies found in auth state")
    }

    // Create worker contexts
    const contexts: BrowserContext[] = []
    let totalImages = 0
    let totalPlaceholders = 0

    try {
      // Create pool of authenticated contexts
      for (let i = 0; i < this.concurrency; i++) {
        const ctx = await this.browser.newContext()
        await ctx.addCookies(cookieState.cookies)
        contexts.push(ctx)
        crawlerLogger.info(`[ParallelDownloader] Worker ${i + 1} initialized`)
      }

      // Create work queue (copy of auctions array)
      const queue = [...auctions]
      let completed = 0
      const total = auctions.length

      // Worker function - processes auctions from shared queue
      const worker = async (context: BrowserContext, workerId: number): Promise<void> => {
        while (queue.length > 0) {
          const auction = queue.shift()
          if (!auction) break

          try {
            const result = await this.downloadAuctionImages(context, auction.auctionId)
            results.set(auction.auctionId, result.localPaths)
            totalImages += result.totalImages
            totalPlaceholders += result.placeholdersSkipped

            completed++
            crawlerLogger.info(
              `[Worker ${workerId}] ${auction.auctionId}: ${result.totalImages} images (${completed}/${total})`
            )
          } catch (error) {
            crawlerLogger.error(`[Worker ${workerId}] Failed ${auction.auctionId}:`, error)
            results.set(auction.auctionId, [])
          }

          // Small delay between auctions to avoid rate limiting
          await this.delay(crawlerConfig.imageDownload.delayBetweenAuctions)
        }
      }

      // Start all workers in parallel using Promise.all
      await Promise.all(contexts.map((ctx, i) => worker(ctx, i + 1)))

      crawlerLogger.info(
        `[ParallelDownloader] Completed: ${results.size} auctions, ${totalImages} images downloaded, ${totalPlaceholders} placeholders skipped`
      )
    } finally {
      // Cleanup all contexts
      for (const ctx of contexts) {
        await ctx.close().catch(() => {})
      }
      crawlerLogger.info("[ParallelDownloader] All workers closed")
    }

    return results
  }

  /**
   * Load cookie state from JSON file
   */
  private loadCookieState(): CookieState | null {
    try {
      const data = fs.readFileSync(this.authStatePath, "utf-8")
      return JSON.parse(data) as CookieState
    } catch {
      return null
    }
  }

  /**
   * Download all images for a single auction
   *
   * Iterates through photo indices until consecutive placeholders detected.
   * This ensures we get ALL available images without a fixed limit.
   */
  private async downloadAuctionImages(
    context: BrowserContext,
    auctionId: string
  ): Promise<AuctionImageResult> {
    const localPaths: string[] = []
    let consecutivePlaceholders = 0
    let placeholdersSkipped = 0
    let photoIndex = 0

    const { absoluteMaxImages, consecutivePlaceholdersToStop } = crawlerConfig.imageDownload

    // Ensure output directory exists
    const auctionDir = path.join(this.outputDir, auctionId)
    fs.mkdirSync(auctionDir, { recursive: true })

    while (
      consecutivePlaceholders < consecutivePlaceholdersToStop &&
      photoIndex < absoluteMaxImages
    ) {
      const result = await this.downloadSingleImage(context, auctionId, photoIndex)

      if (result.error) {
        // Network error or auth issue - count as placeholder
        consecutivePlaceholders++
      } else if (result.isPlaceholder) {
        // Server returned placeholder - no image at this index
        placeholdersSkipped++
        consecutivePlaceholders++
      } else if (result.buffer) {
        // Valid image - save it and reset placeholder counter
        consecutivePlaceholders = 0

        const fileName = `${photoIndex}.jpg`
        const filePath = path.join(auctionDir, fileName)
        fs.writeFileSync(filePath, result.buffer)

        localPaths.push(`/auction-images/${auctionId}/${fileName}`)
      }

      photoIndex++

      // Delay between images within same auction
      if (consecutivePlaceholders < consecutivePlaceholdersToStop) {
        await this.delay(crawlerConfig.imageDownload.delayBetweenImages)
      }
    }

    return {
      auctionId,
      localPaths,
      totalImages: localPaths.length,
      placeholdersSkipped,
    }
  }

  /**
   * Download a single image with placeholder detection
   *
   * Uses context.request.get() for binary data (avoids charset corruption).
   * Detects placeholder images by size (~21,396 bytes).
   */
  private async downloadSingleImage(
    context: BrowserContext,
    auctionId: string,
    photoIndex: number
  ): Promise<SingleImageResult> {
    const imageUrl = `${crawlerConfig.ivo.baseUrl}/image?_auction_id=${auctionId}&_album_type=informex&_photo_index=${photoIndex}`

    try {
      const response = await context.request.get(imageUrl, {
        timeout: 10000,
      })

      if (!response.ok()) {
        return { buffer: null, isPlaceholder: false, error: `HTTP ${response.status()}` }
      }

      const contentType = response.headers()["content-type"] || ""

      // Verify we got an image, not HTML (auth redirect would return HTML)
      if (!contentType.startsWith("image/")) {
        return { buffer: null, isPlaceholder: false, error: "Not an image response" }
      }

      const buffer = await response.body()

      // Check for placeholder image
      if (isPlaceholderImage(buffer)) {
        return { buffer: null, isPlaceholder: true }
      }

      // Validate it's a real image (JPEG/PNG magic bytes)
      if (!isValidImage(buffer)) {
        return { buffer: null, isPlaceholder: false, error: "Invalid image format" }
      }

      return { buffer, isPlaceholder: false }
    } catch (error) {
      return {
        buffer: null,
        isPlaceholder: false,
        error: error instanceof Error ? error.message : "Unknown error",
      }
    }
  }

  /**
   * Simple delay helper
   */
  private delay(ms: number): Promise<void> {
    return new Promise((resolve) => setTimeout(resolve, ms))
  }
}
