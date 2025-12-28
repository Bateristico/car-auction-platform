import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

// PATCH - Bulk update selection status
export async function PATCH(request: NextRequest) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    if (session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Forbidden" }, { status: 403 })
    }

    const { ids, action } = await request.json()

    if (!ids || !Array.isArray(ids) || ids.length === 0) {
      return NextResponse.json(
        { error: "ids array is required" },
        { status: 400 }
      )
    }

    if (!action || !["select", "skip", "reset"].includes(action)) {
      return NextResponse.json(
        { error: "action must be 'select', 'skip', or 'reset'" },
        { status: 400 }
      )
    }

    const statusMap: Record<string, string> = {
      select: "SELECTED",
      skip: "SKIPPED",
      reset: "PENDING",
    }

    const result = await prisma.scrapedAuction.updateMany({
      where: { id: { in: ids } },
      data: {
        selectionStatus: statusMap[action] as "SELECTED" | "SKIPPED" | "PENDING",
        selectedAt: action === "select" ? new Date() : null,
        selectedBy: action === "select" ? session.user.id : null,
      },
    })

    return NextResponse.json({ updated: result.count })
  } catch (error) {
    console.error("Error updating scraped auctions:", error)
    return NextResponse.json(
      { error: "Failed to update scraped auctions" },
      { status: 500 }
    )
  }
}
