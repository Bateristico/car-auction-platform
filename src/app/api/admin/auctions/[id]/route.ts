import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

export async function PUT(
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

    // Check if auction exists
    const existing = await prisma.auction.findUnique({
      where: { id },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Auction not found" },
        { status: 404 }
      )
    }

    const auction = await prisma.auction.update({
      where: { id },
      data: {
        title: data.title,
        description: data.description || null,
        vin: data.vin,
        make: data.make,
        model: data.model,
        year: data.year,
        mileage: data.mileage,
        color: data.color || null,
        engineSize: data.engineSize || null,
        enginePower: data.enginePower || null,
        fuelType: data.fuelType,
        transmission: data.transmission,
        bodyType: data.bodyType,
        condition: data.condition,
        doors: data.doors || null,
        location: data.location || null,
        startingPrice: data.startingPrice,
        suggestedValue: data.suggestedValue || null,
        reservePrice: data.reservePrice || null,
        repairCost: data.repairCost || null,
        damageDescription: data.damageDescription || null,
        vehicleType: data.vehicleType,
        sourceType: data.sourceType,
        status: data.status,
      },
    })

    return NextResponse.json({ success: true, auction })
  } catch (error) {
    console.error("Error updating auction:", error)
    return NextResponse.json(
      { error: "Failed to update auction" },
      { status: 500 }
    )
  }
}

export async function DELETE(
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

    // Check if auction exists
    const existing = await prisma.auction.findUnique({
      where: { id },
      include: { _count: { select: { bids: true } } },
    })

    if (!existing) {
      return NextResponse.json(
        { error: "Auction not found" },
        { status: 404 }
      )
    }

    // Don't delete auctions with bids
    if (existing._count.bids > 0) {
      return NextResponse.json(
        { error: "Cannot delete auction with existing bids. Cancel it instead." },
        { status: 400 }
      )
    }

    await prisma.auction.delete({
      where: { id },
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error("Error deleting auction:", error)
    return NextResponse.json(
      { error: "Failed to delete auction" },
      { status: 500 }
    )
  }
}
