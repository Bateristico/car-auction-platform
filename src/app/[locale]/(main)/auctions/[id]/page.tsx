import { notFound } from "next/navigation"
import { Metadata } from "next"
import { prisma } from "@/lib/prisma"
import { auth } from "@/lib/auth"
import { AuctionDetail } from "./auction-detail"

interface Props {
  params: Promise<{ id: string }>
}

async function getAuction(id: string) {
  const auction = await prisma.auction.findUnique({
    where: { id },
    // No bids included - sealed bid auction
  })

  return auction
}

async function getUserBid(auctionId: string, userId: string) {
  const bid = await prisma.bid.findFirst({
    where: {
      auctionId,
      userId,
    },
    orderBy: { amount: "desc" },
    select: {
      id: true,
      amount: true,
      createdAt: true,
    },
  })

  return bid
}

// Prevent VIN from being indexed by search engines
export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params
  const auction = await getAuction(id)

  if (!auction) {
    return {
      title: "Auction Not Found",
    }
  }

  return {
    title: `${auction.title} | Samochody.be`,
    description: `${auction.year} ${auction.make} ${auction.model} - ${auction.mileage.toLocaleString()} km. Bid now on Samochody.be.`,
    // Prevent search engines from indexing pages with VIN
    robots: {
      index: false,
      follow: true,
    },
  }
}

export default async function AuctionPage({ params }: Props) {
  const { id } = await params
  const [auction, session] = await Promise.all([
    getAuction(id),
    auth(),
  ])

  if (!auction) {
    notFound()
  }

  // Get user's bid if logged in
  let userBid = null
  if (session?.user?.id) {
    userBid = await getUserBid(id, session.user.id)
  }

  // Serialize dates for client component
  const serializedAuction = {
    ...auction,
    startDate: auction.startDate.toISOString(),
    endDate: auction.endDate.toISOString(),
    createdAt: auction.createdAt.toISOString(),
    updatedAt: auction.updatedAt.toISOString(),
  }

  const serializedUserBid = userBid
    ? {
        ...userBid,
        createdAt: userBid.createdAt.toISOString(),
      }
    : null

  return <AuctionDetail auction={serializedAuction} userBid={serializedUserBid} />
}
