import { NextRequest, NextResponse } from "next/server"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { sendBidNotification } from "@/lib/email"

export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const session = await auth()

    if (!session?.user?.id) {
      return NextResponse.json(
        { error: "You must be logged in to place a bid" },
        { status: 401 }
      )
    }

    const { id } = await params
    const { amount } = await request.json()

    if (!amount || typeof amount !== "number" || amount <= 0) {
      return NextResponse.json(
        { error: "Invalid bid amount" },
        { status: 400 }
      )
    }

    // Get the auction
    const auction = await prisma.auction.findUnique({
      where: { id },
    })

    if (!auction) {
      return NextResponse.json(
        { error: "Auction not found" },
        { status: 404 }
      )
    }

    // Check if auction is active
    if (auction.status !== "ACTIVE") {
      return NextResponse.json(
        { error: "This auction is not active" },
        { status: 400 }
      )
    }

    // Check if auction has ended
    if (new Date() > auction.endDate) {
      return NextResponse.json(
        { error: "This auction has ended" },
        { status: 400 }
      )
    }

    // Get user's existing bid (sealed bid format)
    const existingBid = await prisma.bid.findFirst({
      where: {
        auctionId: id,
        userId: session.user.id,
      },
      orderBy: { amount: "desc" },
    })

    // Check minimum bid: starting price if no bid, or previous bid + 100 if updating
    const minBid = existingBid ? existingBid.amount + 100 : auction.startingPrice
    if (amount < minBid) {
      const errorMsg = existingBid
        ? `Your new bid must be higher than your current bid of ${existingBid.amount} PLN`
        : `Minimum bid is ${minBid} PLN`
      return NextResponse.json(
        { error: errorMsg },
        { status: 400 }
      )
    }

    // Create the bid and update auction price in a transaction
    const [bid] = await prisma.$transaction([
      prisma.bid.create({
        data: {
          amount,
          auctionId: id,
          userId: session.user.id,
        },
        include: {
          user: {
            select: {
              firstName: true,
              lastName: true,
              email: true,
            },
          },
          auction: {
            select: {
              title: true,
              referenceNumber: true,
            },
          },
        },
      }),
      prisma.auction.update({
        where: { id },
        data: { currentPrice: amount },
      }),
    ])

    // Send email notification (non-blocking)
    sendBidNotification({
      bidAmount: amount,
      auctionTitle: bid.auction.title,
      auctionReference: bid.auction.referenceNumber,
      bidderName: `${bid.user.firstName} ${bid.user.lastName}`,
      bidderEmail: bid.user.email,
      auctionId: id,
    }).catch(console.error)

    return NextResponse.json({
      success: true,
      bid: {
        id: bid.id,
        amount: bid.amount,
        createdAt: bid.createdAt,
      },
    })
  } catch (error) {
    console.error("Error placing bid:", error)
    return NextResponse.json(
      { error: "An error occurred while placing the bid" },
      { status: 500 }
    )
  }
}
