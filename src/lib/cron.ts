import cron from "node-cron"
import { prisma } from "./prisma"

// Check and update expired auctions every minute
export function startAuctionExpirationJob() {
  console.log("Starting auction expiration cron job...")

  cron.schedule("* * * * *", async () => {
    try {
      const now = new Date()

      // Find all active auctions that have ended
      const expiredAuctions = await prisma.auction.findMany({
        where: {
          status: "ACTIVE",
          endDate: {
            lte: now,
          },
        },
        include: {
          bids: {
            orderBy: { amount: "desc" },
            take: 1,
            include: {
              user: {
                select: {
                  email: true,
                  firstName: true,
                  lastName: true,
                },
              },
            },
          },
        },
      })

      if (expiredAuctions.length > 0) {
        console.log(`Found ${expiredAuctions.length} expired auctions`)

        for (const auction of expiredAuctions) {
          const hasBids = auction.bids.length > 0
          const newStatus = hasBids ? "SOLD" : "ENDED"

          await prisma.auction.update({
            where: { id: auction.id },
            data: { status: newStatus },
          })

          console.log(
            `Auction ${auction.referenceNumber} marked as ${newStatus}`
          )

          // TODO: Send notification emails to winner and seller
          if (hasBids) {
            const winner = auction.bids[0].user
            console.log(
              `Winner: ${winner.firstName} ${winner.lastName} (${winner.email})`
            )
          }
        }
      }
    } catch (error) {
      console.error("Error in auction expiration job:", error)
    }
  })
}

// Cleanup old sessions every hour
export function startSessionCleanupJob() {
  console.log("Starting session cleanup cron job...")

  cron.schedule("0 * * * *", async () => {
    try {
      const thirtyDaysAgo = new Date(
        Date.now() - 30 * 24 * 60 * 60 * 1000
      )

      const result = await prisma.session.deleteMany({
        where: {
          expires: {
            lt: thirtyDaysAgo,
          },
        },
      })

      if (result.count > 0) {
        console.log(`Cleaned up ${result.count} expired sessions`)
      }
    } catch (error) {
      console.error("Error in session cleanup job:", error)
    }
  })
}

// Start all cron jobs
export function initializeCronJobs() {
  startAuctionExpirationJob()
  startSessionCleanupJob()
  console.log("All cron jobs initialized")
}
