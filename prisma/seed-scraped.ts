import "dotenv/config"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "@prisma/client"

const connectionString = process.env.DATABASE_URL ?? "file:./dev.db"
const adapter = new PrismaBetterSqlite3({ url: connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Seeding scraped auctions...")

  const testAuctions = [
    {
      externalId: "BE250937664",
      brand: "BMW",
      model: "320d Touring",
      year: 2021,
      mileage: 45000,
      fuelType: "Diesel",
      power: 140,
      engineCc: 1995,
      co2: 119,
      location: "Brussels",
      locationCity: "Brussels",
      locationCountry: "Belgium",
      thumbnailUrl: "https://images.unsplash.com/photo-1555215695-3004980ad54e?w=200",
      status: "Available",
      selectionStatus: "PENDING" as const,
    },
    {
      externalId: "BE250937665",
      brand: "Audi",
      model: "A4 Avant 2.0 TDI",
      year: 2020,
      mileage: 62000,
      fuelType: "Diesel",
      power: 110,
      engineCc: 1968,
      co2: 128,
      location: "Antwerp",
      locationCity: "Antwerp",
      locationCountry: "Belgium",
      thumbnailUrl: "https://images.unsplash.com/photo-1606664515524-ed2f786a0bd6?w=200",
      status: "Available",
      selectionStatus: "PENDING" as const,
    },
    {
      externalId: "BE250937666",
      brand: "Mercedes-Benz",
      model: "C 200 d",
      year: 2022,
      mileage: 28000,
      fuelType: "Diesel",
      power: 120,
      engineCc: 1950,
      co2: 115,
      location: "Ghent",
      locationCity: "Ghent",
      locationCountry: "Belgium",
      thumbnailUrl: "https://images.unsplash.com/photo-1618843479313-40f8afb4b4d8?w=200",
      status: "Available",
      selectionStatus: "PENDING" as const,
    },
    {
      externalId: "BE250937667",
      brand: "Volkswagen",
      model: "Golf VIII 1.5 TSI",
      year: 2021,
      mileage: 35000,
      fuelType: "Petrol",
      power: 110,
      engineCc: 1498,
      co2: 122,
      location: "Liege",
      locationCity: "Liege",
      locationCountry: "Belgium",
      thumbnailUrl: "https://images.unsplash.com/photo-1631295868223-63265b40d9e4?w=200",
      status: "Available",
      selectionStatus: "PENDING" as const,
    },
    {
      externalId: "BE250937668",
      brand: "Toyota",
      model: "Corolla Hybrid",
      year: 2023,
      mileage: 12000,
      fuelType: "Hybrid",
      power: 103,
      engineCc: 1798,
      co2: 98,
      location: "Bruges",
      locationCity: "Bruges",
      locationCountry: "Belgium",
      thumbnailUrl: "https://images.unsplash.com/photo-1621007947382-bb3c3994e3fb?w=200",
      status: "Available",
      selectionStatus: "PENDING" as const,
    },
    {
      externalId: "BE250937669",
      brand: "BMW",
      model: "X3 xDrive20d",
      year: 2020,
      mileage: 78000,
      fuelType: "Diesel",
      power: 140,
      engineCc: 1995,
      co2: 145,
      location: "Brussels",
      locationCity: "Brussels",
      locationCountry: "Belgium",
      thumbnailUrl: "https://images.unsplash.com/photo-1580273916550-e323be2ae537?w=200",
      status: "Available",
      selectionStatus: "SELECTED" as const,
    },
    {
      externalId: "BE250937670",
      brand: "Audi",
      model: "Q5 40 TDI quattro",
      year: 2021,
      mileage: 42000,
      fuelType: "Diesel",
      power: 150,
      engineCc: 1968,
      co2: 155,
      location: "Antwerp",
      locationCity: "Antwerp",
      locationCountry: "Belgium",
      thumbnailUrl: "https://images.unsplash.com/photo-1614162692292-7ac56d7f373e?w=200",
      status: "Available",
      selectionStatus: "SELECTED" as const,
    },
  ]

  for (const auction of testAuctions) {
    await prisma.scrapedAuction.upsert({
      where: { externalId: auction.externalId },
      create: auction,
      update: auction,
    })
  }

  console.log(`Added ${testAuctions.length} test scraped auctions`)

  const counts = await prisma.scrapedAuction.groupBy({
    by: ["selectionStatus"],
    _count: true,
  })
  console.log("Status counts:", counts)
}

main()
  .catch((e) => {
    console.error("Error seeding scraped auctions:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
