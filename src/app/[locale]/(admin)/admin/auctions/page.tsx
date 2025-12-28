import Link from "next/link"
import { prisma } from "@/lib/prisma"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Plus, Eye, Pencil, Trash2 } from "lucide-react"

async function getAuctions() {
  return prisma.auction.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: { select: { bids: true } },
    },
  })
}

const statusColors: Record<string, string> = {
  DRAFT: "secondary",
  ACTIVE: "success",
  ENDED: "warning",
  SOLD: "default",
  CANCELLED: "destructive",
}

export default async function AdminAuctionsPage() {
  const auctions = await getAuctions()

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Auctions</h1>
          <p className="text-muted-foreground">Manage your vehicle auctions</p>
        </div>
        <Button asChild>
          <Link href="/admin/auctions/new">
            <Plus className="h-4 w-4 mr-2" />
            New Auction
          </Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>All Auctions</CardTitle>
        </CardHeader>
        <CardContent>
          {auctions.length > 0 ? (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b">
                    <th className="text-left py-3 px-4 font-medium">Vehicle</th>
                    <th className="text-left py-3 px-4 font-medium">Reference</th>
                    <th className="text-left py-3 px-4 font-medium">Status</th>
                    <th className="text-left py-3 px-4 font-medium">Price</th>
                    <th className="text-left py-3 px-4 font-medium">Bids</th>
                    <th className="text-left py-3 px-4 font-medium">End Date</th>
                    <th className="text-right py-3 px-4 font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {auctions.map((auction) => (
                    <tr key={auction.id} className="border-b last:border-0">
                      <td className="py-3 px-4">
                        <div>
                          <p className="font-medium">{auction.title}</p>
                          <p className="text-sm text-muted-foreground">
                            {auction.year} {auction.make} {auction.model}
                          </p>
                        </div>
                      </td>
                      <td className="py-3 px-4">
                        <code className="text-sm">{auction.referenceNumber}</code>
                      </td>
                      <td className="py-3 px-4">
                        <Badge
                          variant={
                            statusColors[auction.status] as
                              | "default"
                              | "secondary"
                              | "destructive"
                              | "outline"
                              | "success"
                              | "warning"
                          }
                        >
                          {auction.status}
                        </Badge>
                      </td>
                      <td className="py-3 px-4">
                        <p className="font-medium">
                          {auction.currentPrice.toLocaleString()} PLN
                        </p>
                      </td>
                      <td className="py-3 px-4">{auction._count.bids}</td>
                      <td className="py-3 px-4">
                        <p className="text-sm">
                          {new Date(auction.endDate).toLocaleDateString()}
                        </p>
                      </td>
                      <td className="py-3 px-4">
                        <div className="flex items-center justify-end gap-2">
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/auctions/${auction.id}`}>
                              <Eye className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button variant="ghost" size="icon" asChild>
                            <Link href={`/admin/auctions/${auction.id}/edit`}>
                              <Pencil className="h-4 w-4" />
                            </Link>
                          </Button>
                          <Button
                            variant="ghost"
                            size="icon"
                            className="text-destructive hover:text-destructive"
                          >
                            <Trash2 className="h-4 w-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          ) : (
            <div className="text-center py-8">
              <p className="text-muted-foreground mb-4">No auctions yet</p>
              <Button asChild>
                <Link href="/admin/auctions/new">
                  <Plus className="h-4 w-4 mr-2" />
                  Create First Auction
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
