import "dotenv/config"
import { PrismaBetterSqlite3 } from "@prisma/adapter-better-sqlite3"
import { PrismaClient } from "@prisma/client"
import { hash } from "bcryptjs"

const connectionString = process.env.DATABASE_URL ?? "file:./dev.db"
const adapter = new PrismaBetterSqlite3({ url: connectionString })
const prisma = new PrismaClient({ adapter })

async function main() {
  console.log("Starting database seed (users only)...")

  // Clear existing data
  await prisma.bid.deleteMany()
  await prisma.auction.deleteMany()
  await prisma.scrapedAuction.deleteMany()
  await prisma.scrapeJob.deleteMany()
  await prisma.session.deleteMany()
  await prisma.account.deleteMany()
  await prisma.user.deleteMany()

  console.log("Cleared existing data")

  // Create admin user
  const adminPassword = await hash("admin123", 12)
  const admin = await prisma.user.create({
    data: {
      email: "admin@samochody.be",
      passwordHash: adminPassword,
      firstName: "Admin",
      lastName: "User",
      role: "ADMIN",
      emailVerified: new Date(),
      phone: "+48 123 456 789",
      city: "Warsaw",
      country: "Poland",
    },
  })
  console.log("Created admin user:", admin.email)

  // Create test users
  const userPassword = await hash("user123", 12)
  const testUsers = await Promise.all([
    prisma.user.create({
      data: {
        email: "jan.kowalski@example.pl",
        passwordHash: userPassword,
        firstName: "Jan",
        lastName: "Kowalski",
        pesel: "85010112345",
        phone: "+48 501 234 567",
        address: "ul. Marszalkowska 10/5",
        city: "Warsaw",
        postalCode: "00-001",
        country: "Poland",
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: "anna.nowak@example.pl",
        passwordHash: userPassword,
        firstName: "Anna",
        lastName: "Nowak",
        pesel: "90050554321",
        phone: "+48 602 345 678",
        address: "ul. Dluga 25",
        city: "Krakow",
        postalCode: "31-001",
        country: "Poland",
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: "piotr.wisniewski@example.pl",
        passwordHash: userPassword,
        firstName: "Piotr",
        lastName: "Wisniewski",
        phone: "+48 703 456 789",
        city: "Gdansk",
        country: "Poland",
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: "maria.zielinska@example.pl",
        passwordHash: userPassword,
        firstName: "Maria",
        lastName: "Zielinska",
        phone: "+48 604 567 890",
        city: "Poznan",
        country: "Poland",
        emailVerified: new Date(),
      },
    }),
    prisma.user.create({
      data: {
        email: "tomasz.wojcik@example.pl",
        passwordHash: userPassword,
        firstName: "Tomasz",
        lastName: "Wojcik",
        phone: "+48 505 678 901",
        city: "Wroclaw",
        country: "Poland",
        emailVerified: new Date(),
      },
    }),
  ])
  console.log(`Created ${testUsers.length} test users`)

  console.log("\n Database seeded successfully (users only)!")
  console.log("\nTest accounts:")
  console.log("  Admin: admin@samochody.be / admin123")
  console.log("  User:  jan.kowalski@example.pl / user123")
  console.log("  User:  anna.nowak@example.pl / user123")
  console.log("  User:  piotr.wisniewski@example.pl / user123")
  console.log("  User:  maria.zielinska@example.pl / user123")
  console.log("  User:  tomasz.wojcik@example.pl / user123")
  console.log("\nTo populate auctions, use the Crawler Controls in Admin > Import")
}

main()
  .catch((e) => {
    console.error("Error seeding database:", e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })
