import { redirect } from "next/navigation"
import Link from "next/link"
import { auth } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Separator } from "@/components/ui/separator"
import { Car, Calendar, Clock, ChevronLeft, Gavel, ExternalLink } from "lucide-react"
import { format, formatDistanceToNow } from "date-fns"

async function getUserBids(userId: string) {
  // Get all unique auctions the user has bid on, with their highest bid
  const bids = await prisma.bid.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
    include: {
      auction: {
        select: {
          id: true,
          title: true,
          referenceNumber: true,
          make: true,
          model: true,
          year: true,
          mileage: true,
          status: true,
          startDate: true,
          endDate: true,
          startingPrice: true,
          images: true,
        },
      },
    },
  })

  // Group bids by auction and get highest bid per auction
  const auctionBidsMap = new Map<string, typeof bids>()

  for (const bid of bids) {
    const existing = auctionBidsMap.get(bid.auctionId)
    if (!existing) {
      auctionBidsMap.set(bid.auctionId, [bid])
    } else {
      existing.push(bid)
    }
  }

  // Convert to array with auction info and all user's bids for that auction
  const auctionsWithBids = Array.from(auctionBidsMap.entries()).map(([auctionId, bids]) => {
    const sortedBids = bids.sort((a, b) => b.amount - a.amount)
    const highestBid = sortedBids[0]

    return {
      auction: highestBid.auction,
      highestBid: highestBid.amount,
      bidCount: bids.length,
      lastBidAt: bids.sort((a, b) =>
        new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
      )[0].createdAt,
      allBids: sortedBids.map(b => ({
        id: b.id,
        amount: b.amount,
        createdAt: b.createdAt,
      })),
    }
  })

  // Sort by most recent bid
  return auctionsWithBids.sort((a, b) =>
    new Date(b.lastBidAt).getTime() - new Date(a.lastBidAt).getTime()
  )
}

export default async function MyBidsPage() {
  const session = await auth()

  if (!session?.user?.id) {
    redirect("/login")
  }

  const auctionsWithBids = await getUserBids(session.user.id)

  // Separate into active and ended
  const activeAuctions = auctionsWithBids.filter(
    a => a.auction.status === "ACTIVE" && new Date(a.auction.endDate) > new Date()
  )
  const endedAuctions = auctionsWithBids.filter(
    a => a.auction.status !== "ACTIVE" || new Date(a.auction.endDate) <= new Date()
  )

  return (
    <div className="container py-8">
      <div className="mb-8">
        <Button variant="ghost" className="mb-4" asChild>
          <Link href="/dashboard">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Dashboard
          </Link>
        </Button>
        <h1 className="text-3xl font-bold">My Bids</h1>
        <p className="text-muted-foreground mt-2">
          View all your bids across different auctions.
        </p>
      </div>

      {auctionsWithBids.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <Gavel className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-xl font-semibold mb-2">No Bids Yet</h2>
              <p className="text-muted-foreground mb-6">
                You haven&apos;t placed any bids yet. Start exploring our auctions!
              </p>
              <Button asChild>
                <Link href="/auctions">Browse Auctions</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-8">
          {/* Active Auctions */}
          {activeAuctions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Clock className="h-5 w-5 text-primary" />
                Active Auctions ({activeAuctions.length})
              </h2>
              <div className="space-y-4">
                {activeAuctions.map((item) => (
                  <AuctionBidCard key={item.auction.id} item={item} isActive />
                ))}
              </div>
            </div>
          )}

          {/* Ended Auctions */}
          {endedAuctions.length > 0 && (
            <div>
              <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                <Calendar className="h-5 w-5 text-muted-foreground" />
                Ended Auctions ({endedAuctions.length})
              </h2>
              <div className="space-y-4">
                {endedAuctions.map((item) => (
                  <AuctionBidCard key={item.auction.id} item={item} isActive={false} />
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}

interface AuctionBidCardProps {
  item: {
    auction: {
      id: string
      title: string
      referenceNumber: string
      make: string
      model: string
      year: number
      mileage: number
      status: string
      startDate: Date
      endDate: Date
      startingPrice: number
      images: string | null
    }
    highestBid: number
    bidCount: number
    lastBidAt: Date
    allBids: Array<{
      id: string
      amount: number
      createdAt: Date
    }>
  }
  isActive: boolean
}

function AuctionBidCard({ item, isActive }: AuctionBidCardProps) {
  const { auction, highestBid, bidCount, allBids } = item
  const timeRemaining = isActive
    ? formatDistanceToNow(new Date(auction.endDate), { addSuffix: false })
    : null

  return (
    <Card>
      <CardHeader className="pb-4">
        <div className="flex items-start justify-between gap-4">
          <div className="flex items-start gap-4">
            <div className="w-24 h-18 bg-muted rounded flex items-center justify-center flex-shrink-0">
              <Car className="h-8 w-8 text-muted-foreground" />
            </div>
            <div>
              <CardTitle className="text-lg">{auction.title}</CardTitle>
              <CardDescription>
                {auction.year} {auction.make} {auction.model} | {auction.mileage.toLocaleString()} km
              </CardDescription>
              <p className="text-xs text-muted-foreground mt-1 font-mono">
                Ref: {auction.referenceNumber}
              </p>
            </div>
          </div>
          <div className="text-right flex-shrink-0">
            <Badge variant={isActive ? "default" : "secondary"}>
              {isActive ? "Active" : "Ended"}
            </Badge>
            {isActive && timeRemaining && (
              <p className="text-xs text-muted-foreground mt-1">
                {timeRemaining} left
              </p>
            )}
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-muted-foreground">Your Highest Bid</p>
            <p className="text-2xl font-bold text-primary">
              {highestBid.toLocaleString()} PLN
            </p>
          </div>
          <div className="text-right">
            <p className="text-sm text-muted-foreground">Starting Price</p>
            <p className="text-lg font-medium">
              {auction.startingPrice.toLocaleString()} PLN
            </p>
          </div>
        </div>

        {/* Bid History */}
        {bidCount > 1 && (
          <>
            <Separator className="my-4" />
            <div>
              <p className="text-sm font-medium mb-2">
                Your Bid History ({bidCount} {bidCount === 1 ? "bid" : "bids"})
              </p>
              <div className="space-y-2 max-h-40 overflow-y-auto">
                {allBids.map((bid, index) => (
                  <div
                    key={bid.id}
                    className="flex items-center justify-between text-sm py-1"
                  >
                    <span className="text-muted-foreground">
                      {format(new Date(bid.createdAt), "MMM d, yyyy HH:mm")}
                    </span>
                    <span className={index === 0 ? "font-medium text-primary" : ""}>
                      {bid.amount.toLocaleString()} PLN
                      {index === 0 && (
                        <Badge variant="outline" className="ml-2 text-xs">
                          Current
                        </Badge>
                      )}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </>
        )}

        <Separator className="my-4" />

        <div className="flex items-center justify-between">
          <p className="text-xs text-muted-foreground">
            {isActive ? (
              <>Ends {format(new Date(auction.endDate), "MMM d, yyyy 'at' HH:mm")}</>
            ) : (
              <>Ended {format(new Date(auction.endDate), "MMM d, yyyy 'at' HH:mm")}</>
            )}
          </p>
          <Button variant="outline" size="sm" asChild>
            <Link href={`/auctions/${auction.id}`}>
              View Auction
              <ExternalLink className="ml-2 h-3 w-3" />
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}
