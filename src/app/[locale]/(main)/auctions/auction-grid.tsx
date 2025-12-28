"use client"

import { useSearchParams } from "next/navigation"
import { useRouter, usePathname } from "@/i18n/navigation"
import { useTranslations } from "next-intl"
import { AuctionCard } from "@/components/auctions/auction-card"
import { Button } from "@/components/ui/button"
import { ChevronLeft, ChevronRight, Car } from "lucide-react"

interface AuctionGridProps {
  auctions: Array<{
    id: string
    title: string
    make: string
    model: string
    year: number
    mileage: number
    referenceNumber: string
    images: string | null
    source: string | null
    endDate: Date
    status: string
    suggestedValue: number | null
    vehicleType: string
  }>
  total: number
  currentPage: number
  totalPages: number
}

export function AuctionGrid({
  auctions,
  total,
  currentPage,
  totalPages,
}: AuctionGridProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations("auctions")

  const handlePageChange = (page: number) => {
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", page.toString())
    router.push(`${pathname}?${params.toString()}`)
  }

  if (auctions.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-16 text-center">
        <div className="p-4 bg-muted rounded-full mb-4">
          <Car className="h-8 w-8 text-muted-foreground" />
        </div>
        <h3 className="text-lg font-semibold mb-2">{t("noAuctions")}</h3>
        <p className="text-muted-foreground mb-4">
          {t("tryAdjusting")}
        </p>
        <Button
          variant="outline"
          onClick={() => router.push("/auctions")}
        >
          {t("clearFilters")}
        </Button>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Results count */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {t("showing", { count: auctions.length, total: total })}
        </p>
      </div>

      {/* Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
        {auctions.map((auction) => (
          <AuctionCard key={auction.id} auction={auction} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 pt-6">
          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage <= 1}
          >
            <ChevronLeft className="h-4 w-4" />
          </Button>

          <div className="flex items-center gap-1">
            {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
              let pageNumber: number

              if (totalPages <= 5) {
                pageNumber = i + 1
              } else if (currentPage <= 3) {
                pageNumber = i + 1
              } else if (currentPage >= totalPages - 2) {
                pageNumber = totalPages - 4 + i
              } else {
                pageNumber = currentPage - 2 + i
              }

              return (
                <Button
                  key={pageNumber}
                  variant={currentPage === pageNumber ? "default" : "outline"}
                  size="icon"
                  onClick={() => handlePageChange(pageNumber)}
                >
                  {pageNumber}
                </Button>
              )
            })}
          </div>

          <Button
            variant="outline"
            size="icon"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage >= totalPages}
          >
            <ChevronRight className="h-4 w-4" />
          </Button>
        </div>
      )}
    </div>
  )
}
