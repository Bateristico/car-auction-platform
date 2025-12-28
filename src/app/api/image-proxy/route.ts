import { NextRequest, NextResponse } from "next/server"

export async function GET(request: NextRequest) {
  const url = request.nextUrl.searchParams.get("url")

  if (!url) {
    return new NextResponse("Missing url parameter", { status: 400 })
  }

  // Only allow proxying from auta.ch
  if (!url.startsWith("https://auta.ch/")) {
    return new NextResponse("Invalid image URL", { status: 400 })
  }

  try {
    const response = await fetch(url, {
      headers: {
        "User-Agent":
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
        Accept: "image/webp,image/apng,image/*,*/*;q=0.8",
        "Accept-Language": "en-US,en;q=0.9",
        Referer: "https://auta.ch/",
      },
    })

    if (!response.ok) {
      return new NextResponse("Failed to fetch image", { status: response.status })
    }

    const contentType = response.headers.get("content-type") || "image/jpeg"
    const buffer = await response.arrayBuffer()

    return new NextResponse(buffer, {
      headers: {
        "Content-Type": contentType,
        "Cache-Control": "public, max-age=86400, immutable",
      },
    })
  } catch (error) {
    console.error("Image proxy error:", error)
    return new NextResponse("Failed to proxy image", { status: 500 })
  }
}
