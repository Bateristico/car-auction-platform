import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { parseImages, serializeImages } from "@/lib/image-utils"

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

    // Parse existing images
    const existingImages = parseImages(existing.images)

    // Validate that all provided URLs exist in current images (prevent injection)
    const existingSet = new Set(existingImages)
    const newImages = data.images as string[]

    for (const url of newImages) {
      if (!existingSet.has(url)) {
        return NextResponse.json(
          { error: "Invalid image URL - not in existing images" },
          { status: 400 }
        )
      }
    }

    // Validate that all existing images are present (no removals)
    if (newImages.length !== existingImages.length) {
      return NextResponse.json(
        { error: "Image count mismatch - reorder only, no additions or deletions" },
        { status: 400 }
      )
    }

    // Update auction with new image order
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
