import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { serializeImages } from "@/lib/image-utils"

// List of allowed image URL patterns for security
const ALLOWED_PATTERNS = [
  /^\/auction-images\//, // Local auction images
  /^https?:\/\/[^/]+\.cloudinary\.com\//, // Cloudinary CDN
  /^https?:\/\/images\.unsplash\.com\//, // Unsplash
  /^https?:\/\/[^/]+\.unsplash\.com\//, // Unsplash variants
  /^https?:\/\/auta\.ch\//, // auta.ch images
  /^https?:\/\/res\.cloudinary\.com\//, // Cloudinary res
]

function isAllowedImageUrl(url: string): boolean {
  // Basic URL validation
  if (!url || typeof url !== "string") return false

  // Check against allowed patterns
  return ALLOWED_PATTERNS.some((pattern) => pattern.test(url))
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "Unauthorized" },
        { status: 401 }
      )
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json(
        { error: "Forbidden" },
        { status: 403 }
      )
    }

    const { id } = await params
    const data = await request.json()

    // Validate images array
    if (!Array.isArray(data.images)) {
      return NextResponse.json(
        { error: "Invalid images data" },
        { status: 400 }
      )
    }

    // Get existing auction
    const existing = await prisma.auction.findUnique({
      where: { id },
      select: { images: true },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Auction not found" },
        { status: 404 }
      )
    }

    const newImages = data.images as string[]

    // Validate all URLs are allowed (prevents arbitrary URL injection)
    for (const url of newImages) {
      if (!isAllowedImageUrl(url)) {
        return NextResponse.json(
          { error: `Image URL not allowed: ${url.substring(0, 50)}...` },
          { status: 400 }
        )
      }
    }

    // Validate no duplicates
    const uniqueImages = [...new Set(newImages)]
    if (uniqueImages.length !== newImages.length) {
      return NextResponse.json(
        { error: "Duplicate image URLs detected" },
        { status: 400 }
      )
    }

    // Update auction with new images (reorder, add, or remove)
    const auction = await prisma.auction.update({
      where: { id },
      data: {
        images: serializeImages(newImages),
      },
      select: {
        id: true,
        images: true,
      },
    })

    return NextResponse.json({ success: true, auction })
  } catch (error) {
    console.error("Error updating auction images:", error)
    return NextResponse.json(
      { error: "Failed to update auction images" },
      { status: 500 }
    )
  }
}
