import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"
import { AuctionForm } from "../auction-form"

export default function NewAuctionPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="ghost" size="icon" asChild>
          <Link href="/admin/auctions">
            <ArrowLeft className="h-4 w-4" />
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">New Auction</h1>
          <p className="text-muted-foreground">Create a new vehicle auction</p>
        </div>
      </div>

      <AuctionForm />
    </div>
  )
}
