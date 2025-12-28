/**
 * Image Downloader Service
 *
 * Downloads images from IVO and saves them locally to the filesystem.
 * Images are stored in /public/auction-images/{auctionId}/
 */

import fs from "fs"
import path from "path"
import { crawlerConfig } from "./config"
import { crawlerLogger } from "./logger"

interface SavedCookie {
  name: string
  value: string
  domain: string
  path: string
}

interface CookieState {
  cookies: SavedCookie[]
  savedAt: string
}

// Base path for storing auction images
const IMAGES_BASE_PATH = path.join(process.cwd(), "public", "auction-images")

/**
 * Load IVO cookies for authenticated image fetching
 */
function loadIvoCookies(): string {
  try {
    const statePath = crawlerConfig.paths.ivoAuthState

    if (!fs.existsSync(statePath)) {
      crawlerLogger.warn("[ImageDownloader] Cookie file does not exist")
      return ""
    }

    const stateData = fs.readFileSync(statePath, "utf-8")
    const state: CookieState = JSON.parse(stateData)

    // Check if cookies are fresh (less than 1 hour old)
    const savedAt = new Date(state.savedAt)
    const age = Date.now() - savedAt.getTime()

    if (age > 60 * 60 * 1000) {
      crawlerLogger.warn("[ImageDownloader] IVO cookies expired (older than 1 hour)")
      return ""
    }

    // Format cookies for fetch header
    const ivoCookies = state.cookies.filter(c =>
      c.domain.includes("informex-vehicle-online.be") ||
      c.domain.includes("informex.be")
    )

    return ivoCookies.map(c => `${c.name}=${c.value}`).join("; ")
  } catch (err) {
    crawlerLogger.error("[ImageDownloader] Error loading cookies:", err)
    return ""
  }
}

/**
 * Ensure the auction images directory exists
 */
function ensureAuctionDir(auctionId: string): string {
  const auctionDir = path.join(IMAGES_BASE_PATH, auctionId)

  if (!fs.existsSync(auctionDir)) {
    fs.mkdirSync(auctionDir, { recursive: true })
    crawlerLogger.info(`[ImageDownloader] Created directory: ${auctionDir}`)
  }

  return auctionDir
}

/**
 * Download a single image from IVO
 */
async function downloadImage(
  auctionId: string,
  photoIndex: number,
  width: number = 800,
  height: number = 600
): Promise<string | null> {
  const cookieString = loadIvoCookies()

  if (!cookieString) {
    crawlerLogger.error("[ImageDownloader] No valid cookies available")
    return null
  }

  // Build IVO image URL
  const ivoImageUrl = `${crawlerConfig.ivo.baseUrl}/image?_auction_id=${auctionId}&_album_type=informex&_photo_index=${photoIndex}&_width=${width}&_height=${height}`

  const headers: Record<string, string> = {
    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
    "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
    "Referer": crawlerConfig.ivo.baseUrl,
    "Cookie": cookieString,
  }

  try {
    crawlerLogger.info(`[ImageDownloader] Fetching: ${ivoImageUrl}`)

    const response = await fetch(ivoImageUrl, { headers })

    if (!response.ok) {
      crawlerLogger.error(`[ImageDownloader] Failed to fetch image: ${response.status}`)
      return null
    }

    const contentType = response.headers.get("content-type") || "image/jpeg"

    // Check if we got HTML instead of an image (auth issue)
    if (contentType.includes("text/html")) {
      crawlerLogger.error("[ImageDownloader] Got HTML instead of image - auth issue")
      return null
    }

    const imageBuffer = await response.arrayBuffer()

    // Check minimum size
    if (imageBuffer.byteLength < 100) {
      crawlerLogger.warn(`[ImageDownloader] Image too small (${imageBuffer.byteLength} bytes)`)
      return null
    }

    // Determine file extension from content type
    let extension = "jpg"
    if (contentType.includes("png")) extension = "png"
    else if (contentType.includes("webp")) extension = "webp"
    else if (contentType.includes("gif")) extension = "gif"

    // Save to filesystem
    const auctionDir = ensureAuctionDir(auctionId)
    const filename = `${photoIndex}.${extension}`
    const filePath = path.join(auctionDir, filename)

    fs.writeFileSync(filePath, Buffer.from(imageBuffer))

    crawlerLogger.info(`[ImageDownloader] Saved: ${filePath} (${imageBuffer.byteLength} bytes)`)

    // Return the public URL path
    return `/auction-images/${auctionId}/${filename}`
  } catch (error) {
    crawlerLogger.error(`[ImageDownloader] Error downloading image:`, error)
    return null
  }
}

/**
 * Download all images for an auction
 *
 * @param auctionId - The IVO auction ID (e.g., "BE250937508")
 * @param maxImages - Maximum number of images to download (default: 20)
 * @returns Array of local image paths
 */
export async function downloadAuctionImages(
  auctionId: string,
  maxImages: number = 20
): Promise<string[]> {
  crawlerLogger.info(`[ImageDownloader] Starting download for auction ${auctionId}`)

  const localPaths: string[] = []
  let consecutiveFailures = 0
  const maxConsecutiveFailures = 3 // Stop after 3 consecutive 404s (no more images)

  for (let i = 0; i < maxImages; i++) {
    const localPath = await downloadImage(auctionId, i)

    if (localPath) {
      localPaths.push(localPath)
      consecutiveFailures = 0

      // Small delay between downloads
      await new Promise(resolve => setTimeout(resolve, 200))
    } else {
      consecutiveFailures++

      if (consecutiveFailures >= maxConsecutiveFailures) {
        crawlerLogger.info(`[ImageDownloader] No more images for ${auctionId} (stopped at index ${i})`)
        break
      }
    }
  }

  crawlerLogger.info(`[ImageDownloader] Downloaded ${localPaths.length} images for ${auctionId}`)

  return localPaths
}

/**
 * Check if images already exist locally for an auction
 */
export function hasLocalImages(auctionId: string): boolean {
  const auctionDir = path.join(IMAGES_BASE_PATH, auctionId)

  if (!fs.existsSync(auctionDir)) {
    return false
  }

  const files = fs.readdirSync(auctionDir)
  return files.some(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
}

/**
 * Get existing local image paths for an auction
 */
export function getLocalImagePaths(auctionId: string): string[] {
  const auctionDir = path.join(IMAGES_BASE_PATH, auctionId)

  if (!fs.existsSync(auctionDir)) {
    return []
  }

  const files = fs.readdirSync(auctionDir)
    .filter(f => /\.(jpg|jpeg|png|webp|gif)$/i.test(f))
    .sort((a, b) => {
      // Sort numerically by filename (0.jpg, 1.jpg, 2.jpg, ...)
      const numA = parseInt(a.split('.')[0], 10)
      const numB = parseInt(b.split('.')[0], 10)
      return numA - numB
    })

  return files.map(f => `/auction-images/${auctionId}/${f}`)
}

/**
 * Delete local images for an auction
 */
export function deleteLocalImages(auctionId: string): void {
  const auctionDir = path.join(IMAGES_BASE_PATH, auctionId)

  if (fs.existsSync(auctionDir)) {
    fs.rmSync(auctionDir, { recursive: true, force: true })
    crawlerLogger.info(`[ImageDownloader] Deleted images for ${auctionId}`)
  }
}
