import "dotenv/config"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "@prisma/client"
import * as fs from "fs"
import * as path from "path"

const connectionString = process.env.DATABASE_URL ?? "file:./dev.db"
const adapter = new PrismaBetterSqlite3({ url: connectionString })
const prisma = new PrismaClient({ adapter })

interface JsonData {
  User?: unknown[]
  Auction?: unknown[]
  ScrapedAuction?: unknown[]
  Bid?: unknown[]
}

async function loadJsonFile(filename: string): Promise<unknown[]> {
  // Use relative path from working directory (works with esbuild bundle)
  const filePath = path.join(process.cwd(), "prisma", "data", filename)
  if (fs.existsSync(filePath)) {
    const content = fs.readFileSync(filePath, "utf-8")
    return JSON.parse(content)
  }
  console.warn(`Warning: ${filePath} not found`)
  return []
}

async function main() {
  console.log("Starting data import...")
  console.log("Database:", connectionString)

  // Load data files
  const users = await loadJsonFile("User.json")
  const auctions = await loadJsonFile("Auction.json")
  const scrapedAuctions = await loadJsonFile("ScrapedAuction.json")

  // Import Users
  if (users.length > 0) {
    console.log(`Importing ${users.length} users...`)
    for (const user of users as any[]) {
      await prisma.user.upsert({
        where: { id: user.id },
        create: {
          id: user.id,
          email: user.email,
          emailVerified: user.emailVerified ? new Date(user.emailVerified) : null,
          passwordHash: user.passwordHash,
          firstName: user.firstName,
          lastName: user.lastName,
          pesel: user.pesel,
          phone: user.phone,
          address: user.address,
          city: user.city,
          postalCode: user.postalCode,
          country: user.country,
          role: user.role,
          image: user.image,
          createdAt: new Date(user.createdAt),
          updatedAt: new Date(user.updatedAt),
        },
        update: {},
      })
    }
    console.log(`  Imported ${users.length} users`)
  }

  // Import ScrapedAuctions
  if (scrapedAuctions.length > 0) {
    console.log(`Importing ${scrapedAuctions.length} scraped auctions...`)
    for (const auction of scrapedAuctions as any[]) {
      await prisma.scrapedAuction.upsert({
        where: { id: auction.id },
        create: {
          id: auction.id,
          externalId: auction.externalId,
          source: auction.source,
          brand: auction.brand,
          model: auction.model,
          year: auction.year,
          mileage: auction.mileage,
          fuelType: auction.fuelType,
          power: auction.power,
          engineCc: auction.engineCc,
          co2: auction.co2,
          location: auction.location,
          locationAddress: auction.locationAddress,
          locationCity: auction.locationCity,
          locationCountry: auction.locationCountry,
          thumbnailUrl: auction.thumbnailUrl,
          expirationDate: auction.expirationDate ? new Date(auction.expirationDate) : null,
          status: auction.status,
          vin: auction.vin,
          images: auction.images,
          detailData: auction.detailData,
          selectionStatus: auction.selectionStatus,
          selectedAt: auction.selectedAt ? new Date(auction.selectedAt) : null,
          selectedBy: auction.selectedBy,
          detailFetchedAt: auction.detailFetchedAt ? new Date(auction.detailFetchedAt) : null,
          detailCost: auction.detailCost,
          importedAt: auction.importedAt ? new Date(auction.importedAt) : null,
          importedAuctionId: auction.importedAuctionId,
          scrapeJobId: auction.scrapeJobId,
          rawListData: auction.rawListData,
          rawDetailData: auction.rawDetailData,
          firstSeenAt: auction.firstSeenAt ? new Date(auction.firstSeenAt) : undefined,
          lastUpdatedAt: auction.lastUpdatedAt ? new Date(auction.lastUpdatedAt) : undefined,
        },
        update: {},
      })
    }
    console.log(`  Imported ${scrapedAuctions.length} scraped auctions`)
  }

  // Import Auctions
  if (auctions.length > 0) {
    console.log(`Importing ${auctions.length} auctions...`)
    for (const auction of auctions as any[]) {
      await prisma.auction.upsert({
        where: { id: auction.id },
        create: {
          id: auction.id,
          title: auction.title,
          description: auction.description,
          vin: auction.vin,
          referenceNumber: auction.referenceNumber,
          make: auction.make,
          model: auction.model,
          variant: auction.variant,
          year: auction.year,
          mileage: auction.mileage,
          color: auction.color,
          colorType: auction.colorType,
          interiorColor: auction.interiorColor,
          engineSize: auction.engineSize,
          enginePower: auction.enginePower,
          fuelType: auction.fuelType,
          transmission: auction.transmission,
          driveType: auction.driveType,
          bodyType: auction.bodyType,
          condition: auction.condition,
          doors: auction.doors,
          seats: auction.seats,
          location: auction.location,
          country: auction.country,
          firstRegistrationDate: auction.firstRegistrationDate ? new Date(auction.firstRegistrationDate) : null,
          lastInspectionDate: auction.lastInspectionDate ? new Date(auction.lastInspectionDate) : null,
          typeApproval: auction.typeApproval,
          startingPrice: auction.startingPrice,
          suggestedValue: auction.suggestedValue,
          currentPrice: auction.currentPrice,
          reservePrice: auction.reservePrice,
          repairCost: auction.repairCost,
          originalPrice: auction.originalPrice,
          currentMarketValue: auction.currentMarketValue,
          equipment: auction.equipment,
          damageDescription: auction.damageDescription,
          damageLocations: auction.damageLocations,
          damageNumber: auction.damageNumber,
          airbags: auction.airbags,
          defects: auction.defects,
          serviceHistory: auction.serviceHistory,
          previousOwners: auction.previousOwners,
          accidentFree: auction.accidentFree,
          tireCondition: auction.tireCondition,
          images: auction.images,
          source: auction.source,
          sourceType: auction.sourceType,
          insuranceCompany: auction.insuranceCompany,
          startDate: new Date(auction.startDate),
          endDate: new Date(auction.endDate),
          status: auction.status,
          vehicleType: auction.vehicleType,
          createdAt: new Date(auction.createdAt),
          updatedAt: new Date(auction.updatedAt),
        },
        update: {},
      })
    }
    console.log(`  Imported ${auctions.length} auctions`)
  }

  console.log("\nData import complete!")
  console.log("\nTest accounts:")
  console.log("  Admin: admin@carauction.pl / admin123")
  console.log("  User:  jan.kowalski@example.pl / user123")
}

main()
  .catch((e) => {
    console.error("Error importing data:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
