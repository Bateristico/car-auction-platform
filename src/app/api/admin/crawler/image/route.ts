/**
 * Image Proxy API for IVO Thumbnails
 *
 * IVO images require authentication, so we need to proxy them server-side.
 * This endpoint fetches images from IVO using saved session cookies.
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { crawlerConfig } from "@/lib/crawler/config"
import fs from "fs"

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

/**
 * Load saved IVO cookies from the auth state file
 */
function loadIvoCookies(): string {
  try {
    const statePath = crawlerConfig.paths.ivoAuthState
    console.log(`[ImageProxy] Looking for cookies at: ${statePath}`)

    if (!fs.existsSync(statePath)) {
      console.log("[ImageProxy] Cookie file does not exist")
      return ""
    }

    const stateData = fs.readFileSync(statePath, "utf-8")
    const state: CookieState = JSON.parse(stateData)

    console.log(`[ImageProxy] Cookie file found, savedAt: ${state.savedAt}, cookies count: ${state.cookies?.length || 0}`)

    // Check if cookies are fresh (less than 1 hour old)
    const savedAt = new Date(state.savedAt)
    const age = Date.now() - savedAt.getTime()
    console.log(`[ImageProxy] Cookie age: ${Math.round(age / 1000 / 60)} minutes`)

    if (age > 60 * 60 * 1000) {
      console.log("[ImageProxy] IVO cookies expired (older than 1 hour)")
      return ""
    }

    // Format cookies for fetch header - include all Informex-related cookies
    // IVO images may require both the IVO session and the parent Informex session
    const ivoCookies = state.cookies.filter(c =>
      c.domain.includes("informex-vehicle-online.be") ||
      c.domain.includes("informex.be")
    )
    console.log(`[ImageProxy] All Informex cookies: ${ivoCookies.length}`)

    const cookieString = ivoCookies
      .map(c => `${c.name}=${c.value}`)
      .join("; ")

    console.log(`[ImageProxy] Cookie string length: ${cookieString.length}`)
    return cookieString
  } catch (err) {
    console.error("[ImageProxy] Error loading cookies:", err)
    return ""
  }
}

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
    const auctionId = searchParams.get("auctionId")
    const photoIndex = searchParams.get("photoIndex") || "0"
    const width = searchParams.get("width") || "200"
    const height = searchParams.get("height") || "150"

    if (!auctionId) {
      return NextResponse.json({ error: "Missing auctionId" }, { status: 400 })
    }

    // Build IVO image URL
    const ivoImageUrl = `${crawlerConfig.ivo.baseUrl}/image?_auction_id=${auctionId}&_album_type=informex&_photo_index=${photoIndex}&_width=${width}&_height=${height}`

    // Load saved IVO cookies
    const cookieString = loadIvoCookies()

    // Build headers with authentication cookies
    const headers: Record<string, string> = {
      "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36",
      "Accept": "image/webp,image/apng,image/*,*/*;q=0.8",
      "Referer": crawlerConfig.ivo.baseUrl,
    }

    if (cookieString) {
      headers["Cookie"] = cookieString
    }

    console.log(`[ImageProxy] Fetching: ${ivoImageUrl}`)
    console.log(`[ImageProxy] With cookies: ${cookieString ? "YES" : "NO"}`)

    // Fetch the image from IVO
    const response = await fetch(ivoImageUrl, { headers })

    console.log(`[ImageProxy] Response status: ${response.status}, content-type: ${response.headers.get("content-type")}`)

    if (!response.ok) {
      console.error(`[ImageProxy] Image fetch failed: ${response.status} for ${auctionId}`)
      return new NextResponse(null, { status: response.status })
    }

    const imageBuffer = await response.arrayBuffer()
    const contentType = response.headers.get("content-type") || "image/jpeg"

    console.log(`[ImageProxy] Received ${imageBuffer.byteLength} bytes, content-type: ${contentType}`)

    // Check if we got actual image data
    if (imageBuffer.byteLength < 100) {
      console.error(`[ImageProxy] Image too small (${imageBuffer.byteLength} bytes) for ${auctionId}`)
      return new NextResponse(null, { status: 404 })
    }

    // Check if we got HTML instead of an image (redirect to login)
    if (contentType.includes("text/html")) {
      console.error(`[ImageProxy] Got HTML instead of image for ${auctionId} - likely auth issue`)
      return new NextResponse(null, { status: 401 })
    }

    // Return the image with caching headers
    return new NextResponse(imageBuffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400", // Cache for 24 hours
      },
    })
  } catch (error) {
    console.error("Image proxy error:", error)
    return new NextResponse(null, { status: 500 })
  }
}
