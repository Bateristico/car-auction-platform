/**
 * Import ScrapedAuction records to the public Auction grid
 *
 * Converts scraped auction data into official Auction records
 * that appear on the public grid.
 */

import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { crawlerLogger } from "@/lib/crawler/logger"
import fs from "fs"
import path from "path"

// Map scraped fuel type string to Prisma FuelType enum
function mapFuelType(fuelType: string | null): "PETROL" | "DIESEL" | "ELECTRIC" | "HYBRID" | "LPG" | "CNG" | "OTHER" {
  if (!fuelType) return "PETROL"

  const normalized = fuelType.toLowerCase()
  if (normalized.includes("diesel")) return "DIESEL"
  if (normalized.includes("electric") || normalized.includes("elektro")) return "ELECTRIC"
  if (normalized.includes("hybrid")) return "HYBRID"
  if (normalized.includes("lpg")) return "LPG"
  if (normalized.includes("cng") || normalized.includes("gas")) return "CNG"
  if (normalized.includes("petrol") || normalized.includes("benzin") || normalized.includes("essence")) return "PETROL"

  return "OTHER"
}

// Convert kW to HP
function kwToHp(kw: number | null): number | null {
  if (!kw) return null
  return Math.round(kw * 1.341)
}

// Generate a realistic mock VIN
function generateMockVin(brand: string, year: number | null): string {
  const wmis: Record<string, string> = {
    "BMW": "WBA", "MERCEDES": "WDB", "AUDI": "WAU", "VOLKSWAGEN": "WVW",
    "PORSCHE": "WP0", "FORD": "WF0", "OPEL": "W0L", "RENAULT": "VF1",
    "PEUGEOT": "VF3", "CITROEN": "VF7", "TOYOTA": "JTD", "HONDA": "JHM",
    "VOLVO": "YV1", "FIAT": "ZFA", "ALFA ROMEO": "ZAR", "SKODA": "TMB",
  }
  const wmi = wmis[brand.toUpperCase()] || "WXX"
  const vds = "MOCK00"
  const modelYear = year ? String(year).slice(-1) : "0"
  const serial = Math.random().toString(36).substring(2, 8).toUpperCase()
  return `${wmi}${vds}${modelYear}${serial}`
}

// Generate mock starting price based on vehicle data
function generateMockPrice(year: number | null, mileage: number | null, brand: string): number {
  const basePrice = 15000
  const yearFactor = year ? Math.max(0.5, 1 - (new Date().getFullYear() - year) * 0.08) : 0.7
  const mileageFactor = mileage ? Math.max(0.4, 1 - (mileage / 300000)) : 0.7

  const premiumBrands = ["BMW", "MERCEDES", "AUDI", "PORSCHE", "VOLVO", "LEXUS"]
  const brandFactor = premiumBrands.includes(brand.toUpperCase()) ? 1.4 : 1.0

  const price = basePrice * yearFactor * mileageFactor * brandFactor
  return Math.round(price / 100) * 100 // Round to nearest 100
}

/**
 * Migrate image folder from external ID to internal auction ID
 * This removes the informex auction ID from public image URLs
 */
function migrateImageFolder(externalId: string, internalId: string): string | null {
  const imagesBaseDir = path.join(process.cwd(), "public", "auction-images")
  const sourceDir = path.join(imagesBaseDir, externalId)
  const targetDir = path.join(imagesBaseDir, internalId)

  // Check if source directory exists
  if (!fs.existsSync(sourceDir)) {
    return null // No images to migrate
  }

  // If target already exists (shouldn't happen), skip migration
  if (fs.existsSync(targetDir)) {
    crawlerLogger.warn(`Target directory ${targetDir} already exists, skipping migration`)
    return null
  }

  try {
    // Rename the directory
    fs.renameSync(sourceDir, targetDir)
    crawlerLogger.info(`Migrated images from ${externalId} to ${internalId}`)
    return internalId
  } catch (err) {
    crawlerLogger.error(`Failed to migrate images from ${externalId} to ${internalId}:`, err)
    return null
  }
}

/**
 * Update image paths in the JSON string to use the new auction ID
 */
function updateImagePaths(imagesJson: string | null, oldId: string, newId: string): string | null {
  if (!imagesJson) return null

  try {
    const images = JSON.parse(imagesJson)
    if (!Array.isArray(images)) return imagesJson

    const updatedImages = images.map((url: string) => {
      if (typeof url === "string" && url.includes(`/auction-images/${oldId}/`)) {
        return url.replace(`/auction-images/${oldId}/`, `/auction-images/${newId}/`)
      }
      return url
    })

    return JSON.stringify(updatedImages)
  } catch {
    return imagesJson
  }
}

// Map body type from model name hints
function guessBodyType(model: string): string {
  const modelLower = model.toLowerCase()
  if (modelLower.includes("suv") || modelLower.includes("x3") || modelLower.includes("x5") || modelLower.includes("q5") || modelLower.includes("tiguan")) return "SUV"
  if (modelLower.includes("kombi") || modelLower.includes("touring") || modelLower.includes("avant") || modelLower.includes("wagon") || modelLower.includes("break")) return "Wagon"
  if (modelLower.includes("coupe") || modelLower.includes("coupé")) return "Coupe"
  if (modelLower.includes("cabrio") || modelLower.includes("convertible") || modelLower.includes("roadster")) return "Convertible"
  if (modelLower.includes("van") || modelLower.includes("transporter") || modelLower.includes("caddy")) return "Van"
  if (modelLower.includes("pickup") || modelLower.includes("truck")) return "Pickup"
  return "Sedan"
}

// Generate mock condition based on mileage
function guessCondition(mileage: number | null): "EXCELLENT" | "GOOD" | "FAIR" | "POOR" | "DAMAGED" {
  if (!mileage) return "GOOD"
  if (mileage < 50000) return "EXCELLENT"
  if (mileage < 100000) return "GOOD"
  if (mileage < 150000) return "FAIR"
  return "POOR"
}

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
    const { auctionIds, importAll = false } = body as {
      auctionIds?: string[]
      importAll?: boolean
    }

    crawlerLogger.info(`Starting import to grid...`)

    // Get scraped auctions to import
    let scrapedAuctions

    if (importAll) {
      // Import all that haven't been imported yet
      scrapedAuctions = await prisma.scrapedAuction.findMany({
        where: {
          selectionStatus: { not: "IMPORTED" },
          importedAuctionId: null,
        },
      })
    } else if (auctionIds && auctionIds.length > 0) {
      // Import specific auctions
      scrapedAuctions = await prisma.scrapedAuction.findMany({
        where: {
          id: { in: auctionIds },
          importedAuctionId: null,
        },
      })
    } else {
      return NextResponse.json(
        { error: "Provide auctionIds or set importAll: true" },
        { status: 400 }
      )
    }

    if (scrapedAuctions.length === 0) {
      return NextResponse.json({
        success: true,
        message: "No auctions to import",
        imported: 0,
      })
    }

    crawlerLogger.info(`Importing ${scrapedAuctions.length} auctions to grid...`)

    let imported = 0
    let skipped = 0
    const errors: string[] = []

    // Default auction end date (7 days from now)
    const defaultEndDate = new Date()
    defaultEndDate.setDate(defaultEndDate.getDate() + 7)

    for (const scraped of scrapedAuctions) {
      try {
        // Check if already imported (by reference number)
        const existing = await prisma.auction.findUnique({
          where: { referenceNumber: scraped.externalId },
        })

        if (existing) {
          // Update the scraped auction to link to existing
          await prisma.scrapedAuction.update({
            where: { id: scraped.id },
            data: {
              selectionStatus: "IMPORTED",
              importedAt: new Date(),
              importedAuctionId: existing.id,
            },
          })
          skipped++
          continue
        }

        // Generate mock data for fields we don't have from free scrape
        const mockVin = scraped.vin || generateMockVin(scraped.brand, scraped.year)
        const mockPrice = generateMockPrice(scraped.year, scraped.mileage, scraped.brand)
        const bodyType = guessBodyType(scraped.model)
        const condition = guessCondition(scraped.mileage)

        // Create the Auction record (initially without images to get the ID)
        const auction = await prisma.auction.create({
          data: {
            title: `${scraped.brand} ${scraped.model}${scraped.year ? ` (${scraped.year})` : ""}`,
            referenceNumber: `CA-${Date.now().toString(36).toUpperCase()}`, // Generate internal reference instead of using external ID
            vin: mockVin,
            make: scraped.brand,
            model: scraped.model,
            year: scraped.year || new Date().getFullYear(),
            mileage: scraped.mileage || 0,
            fuelType: mapFuelType(scraped.fuelType),
            engineSize: scraped.engineCc,
            enginePower: kwToHp(scraped.power),
            location: scraped.location || scraped.locationCity,
            country: scraped.locationCountry,
            bodyType,
            condition,
            startingPrice: mockPrice,
            currentPrice: mockPrice,
            suggestedValue: Math.round(mockPrice * 1.15), // Mock AI value slightly higher
            images: scraped.images, // Initially use original paths
            source: scraped.source,
            sourceType: "INSURANCE",
            startDate: new Date(),
            endDate: defaultEndDate,
            status: "ACTIVE", // Make it visible on grid immediately
          },
        })

        // Migrate image folder from external ID to internal auction ID (removes informex ID from URLs)
        const migrated = migrateImageFolder(scraped.externalId, auction.id)
        if (migrated) {
          // Update image paths in database to use the new internal ID
          const updatedImages = updateImagePaths(scraped.images, scraped.externalId, auction.id)
          if (updatedImages) {
            await prisma.auction.update({
              where: { id: auction.id },
              data: { images: updatedImages },
            })
          }
        }

        // Update scraped auction to mark as imported
        await prisma.scrapedAuction.update({
          where: { id: scraped.id },
          data: {
            selectionStatus: "IMPORTED",
            importedAt: new Date(),
            importedAuctionId: auction.id,
          },
        })

        imported++
        crawlerLogger.info(`Imported ${scraped.externalId} as ${auction.id}`)
      } catch (err) {
        const errorMsg = `Failed to import ${scraped.externalId}: ${err instanceof Error ? err.message : "Unknown error"}`
        crawlerLogger.error(errorMsg)
        errors.push(errorMsg)
      }
    }

    crawlerLogger.info(`Import complete: ${imported} imported, ${skipped} skipped`)

    return NextResponse.json({
      success: true,
      stats: {
        total: scrapedAuctions.length,
        imported,
        skipped,
        errors: errors.length,
      },
      errors: errors.length > 0 ? errors : undefined,
    })
  } catch (error) {
    crawlerLogger.error("Import to grid failed:", error)
    return NextResponse.json(
      {
        error: "Failed to import auctions",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    )
  }
}

/**
 * GET - Check import status
 */
export async function GET() {
  try {
    const session = await auth()

    if (!session?.user?.id || session.user.role !== "ADMIN") {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const [total, imported, pending] = await Promise.all([
      prisma.scrapedAuction.count(),
      prisma.scrapedAuction.count({ where: { selectionStatus: "IMPORTED" } }),
      prisma.scrapedAuction.count({ where: { selectionStatus: { not: "IMPORTED" }, importedAuctionId: null } }),
    ])

    const activeAuctions = await prisma.auction.count({ where: { status: "ACTIVE" } })

    return NextResponse.json({
      scraped: { total, imported, pending },
      grid: { activeAuctions },
    })
  } catch (error) {
    return NextResponse.json(
      { error: "Failed to get import status" },
      { status: 500 }
    )
  }
}
