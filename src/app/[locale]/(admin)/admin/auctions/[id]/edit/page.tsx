import Link from "next/link"
import { notFound } from "next/navigation"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { AuctionForm } from "../../auction-form"

interface EditAuctionPageProps {
  params: Promise<{ id: string }>
}

async function getAuction(id: string) {
  const auction = await prisma.auction.findUnique({
    where: { id },
  })

  if (!auction) {
    return null
  }

  return {
    ...auction,
    endDate: auction.endDate.toISOString(),
  }
}

export default async function EditAuctionPage({ params }: EditAuctionPageProps) {
  const { id } = await params
  const auction = await getAuction(id)

  if (!auction) {
    notFound()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/auctions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Edit Auction</h1>
          <p className="text-muted-foreground">
            {auction.title} ({auction.referenceNumber})
          </p>
        </div>
      </div>

      <AuctionForm auction={auction} />
    </div>
  )
}
