import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"

function generateReferenceNumber(): string {
  const prefix = "CA"
  const number = Math.floor(100000 + Math.random() * 900000)
  return `${prefix}-${number}`
}

export async function POST(request: NextRequest) {
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

    const data = await request.json()

    // Generate reference number
    let referenceNumber = generateReferenceNumber()

    // Make sure it's unique
    let existing = await prisma.auction.findUnique({
      where: { referenceNumber },
    })
    while (existing) {
      referenceNumber = generateReferenceNumber()
      existing = await prisma.auction.findUnique({
        where: { referenceNumber },
      })
    }

    // Calculate end date
    const durationDays = data.durationDays || 7
    const endDate = new Date()
    endDate.setDate(endDate.getDate() + durationDays)

    const auction = await prisma.auction.create({
      data: {
        title: data.title,
        description: data.description || null,
        vin: data.vin,
        referenceNumber,
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
        currentPrice: data.startingPrice,
        suggestedValue: data.suggestedValue || null,
        reservePrice: data.reservePrice || null,
        repairCost: data.repairCost || null,
        damageDescription: data.damageDescription || null,
        vehicleType: data.vehicleType,
        sourceType: data.sourceType,
        status: data.status,
        endDate,
      },
    })

    return NextResponse.json({ success: true, auction })
  } catch (error) {
    console.error("Error creating auction:", error)
    return NextResponse.json(
      { error: "Failed to create auction" },
      { status: 500 }
    )
  }
}
