"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Loader2, Car } from "lucide-react"

interface ScrapedAuction {
  id: string
  externalId: string
  brand: string
  model: string
  year: number | null
  mileage: number | null
  fuelType: string | null
  power: number | null
  location: string | null
  thumbnailUrl: string | null
  images: string | null // JSON array of local image paths (for FETCHED auctions)
  selectionStatus: string
  firstSeenAt: Date | string
}

interface ScrapedAuctionsTableProps {
  initialAuctions: ScrapedAuction[]
  brands: string[]
}

export function ScrapedAuctionsTable({
  initialAuctions,
  brands,
}: ScrapedAuctionsTableProps) {
  const router = useRouter()
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())
  const [auctions, setAuctions] = useState<ScrapedAuction[]>(initialAuctions)
  const [loading, setLoading] = useState(false)
  const [actionLoading, setActionLoading] = useState(false)
  const [filters, setFilters] = useState({
    status: "",
    brand: "",
  })
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())

  // Update auctions when initialAuctions changes (e.g., after page refresh)
  useEffect(() => {
    setAuctions(initialAuctions)
  }, [initialAuctions])

  // Fetch auctions with filters
  async function fetchAuctions() {
    setLoading(true)
    try {
      const params = new URLSearchParams()
      if (filters.status) params.set("status", filters.status)
      if (filters.brand) params.set("brand", filters.brand)

      const res = await fetch(`/api/admin/import/scraped?${params}`)
      const data = await res.json()
      setAuctions(data.auctions)
    } catch (error) {
      console.error("Error fetching auctions:", error)
    }
    setLoading(false)
  }

  // Toggle selection
  function toggleSelection(id: string) {
    const newSelected = new Set(selectedIds)
    if (newSelected.has(id)) {
      newSelected.delete(id)
    } else {
      newSelected.add(id)
    }
    setSelectedIds(newSelected)
  }

  // Select all visible
  function selectAll() {
    if (selectedIds.size === auctions.length) {
      setSelectedIds(new Set())
    } else {
      setSelectedIds(new Set(auctions.map((a) => a.id)))
    }
  }

  // Bulk action
  async function bulkAction(action: "select" | "skip" | "reset") {
    if (selectedIds.size === 0) return

    setActionLoading(true)
    try {
      await fetch("/api/admin/import/scraped/bulk", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ids: Array.from(selectedIds),
          action,
        }),
      })
      setSelectedIds(new Set())
      await fetchAuctions()
      router.refresh()
    } catch (error) {
      console.error("Error performing bulk action:", error)
    }
    setActionLoading(false)
  }

  // Refetch when filters change
  useEffect(() => {
    if (filters.status || filters.brand) {
      fetchAuctions()
    }
  }, [])

  const statusColors: Record<
    string,
    "default" | "secondary" | "destructive" | "outline" | "success" | "warning"
  > = {
    PENDING: "secondary",
    SELECTED: "default",
    FETCHING: "warning",
    FETCHED: "success",
    IMPORTED: "success",
    SKIPPED: "outline",
    ERROR: "destructive",
  }

  return (
    <Card>
      <CardContent className="pt-6">
        {/* Filters Row */}
        <div className="flex flex-wrap items-center gap-4 mb-4">
          <Select
            value={filters.status}
            onValueChange={(v) => setFilters({ ...filters, status: v })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All statuses" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All statuses</SelectItem>
              <SelectItem value="PENDING">Pending</SelectItem>
              <SelectItem value="SELECTED">Selected</SelectItem>
              <SelectItem value="FETCHING">Fetching</SelectItem>
              <SelectItem value="FETCHED">Fetched</SelectItem>
              <SelectItem value="IMPORTED">Imported</SelectItem>
              <SelectItem value="SKIPPED">Skipped</SelectItem>
              <SelectItem value="ERROR">Error</SelectItem>
            </SelectContent>
          </Select>

          <Select
            value={filters.brand}
            onValueChange={(v) => setFilters({ ...filters, brand: v })}
          >
            <SelectTrigger className="w-40">
              <SelectValue placeholder="All brands" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="ALL">All brands</SelectItem>
              {brands.map((brand) => (
                <SelectItem key={brand} value={brand}>
                  {brand}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Button variant="outline" onClick={fetchAuctions} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Apply Filters
          </Button>

          <div className="flex-1" />

          {selectedIds.size > 0 && (
            <div className="flex items-center gap-2">
              <span className="text-sm text-muted-foreground">
                {selectedIds.size} selected
              </span>
              <Button
                size="sm"
                onClick={() => bulkAction("select")}
                disabled={actionLoading}
              >
                {actionLoading && (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                )}
                Mark Selected
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => bulkAction("skip")}
                disabled={actionLoading}
              >
                Skip
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => bulkAction("reset")}
                disabled={actionLoading}
              >
                Reset
              </Button>
              <Button
                size="sm"
                variant="ghost"
                onClick={() => setSelectedIds(new Set())}
              >
                Clear
              </Button>
            </div>
          )}
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b">
                <th className="py-3 px-2 w-10">
                  <Checkbox
                    checked={
                      selectedIds.size === auctions.length && auctions.length > 0
                    }
                    onCheckedChange={selectAll}
                  />
                </th>
                <th className="py-3 px-4 text-left font-medium">Vehicle</th>
                <th className="py-3 px-4 text-left font-medium">Year</th>
                <th className="py-3 px-4 text-left font-medium">Mileage</th>
                <th className="py-3 px-4 text-left font-medium">Fuel</th>
                <th className="py-3 px-4 text-left font-medium">Power</th>
                <th className="py-3 px-4 text-left font-medium">Location</th>
                <th className="py-3 px-4 text-left font-medium">Status</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={8} className="py-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
                  </td>
                </tr>
              ) : auctions.length === 0 ? (
                <tr>
                  <td
                    colSpan={8}
                    className="py-8 text-center text-muted-foreground"
                  >
                    No scraped auctions found
                  </td>
                </tr>
              ) : (
                auctions.map((auction) => (
                  <tr
                    key={auction.id}
                    className="border-b hover:bg-muted/50 cursor-pointer"
                    onClick={() => toggleSelection(auction.id)}
                  >
                    <td className="py-3 px-2" onClick={(e) => e.stopPropagation()}>
                      <Checkbox
                        checked={selectedIds.has(auction.id)}
                        onCheckedChange={() => toggleSelection(auction.id)}
                      />
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-3">
                        {failedImages.has(auction.externalId) || !auction.images ? (
                          <div className="w-16 h-12 rounded bg-muted flex items-center justify-center">
                            <Car className="h-6 w-6 text-muted-foreground" />
                          </div>
                        ) : (
                          <img
                            src={
                              // Use local images (downloaded during list scraping)
                              (() => {
                                try {
                                  const imgs = JSON.parse(auction.images)
                                  return imgs[0] || ""
                                } catch {
                                  return ""
                                }
                              })()
                            }
                            alt={`${auction.brand} ${auction.model}`}
                            className="w-16 h-12 object-cover rounded bg-muted"
                            onError={() => {
                              setFailedImages(prev => new Set(prev).add(auction.externalId))
                            }}
                          />
                        )}
                        <div>
                          <p className="font-medium">{auction.brand}</p>
                          <p className="text-sm text-muted-foreground">
                            {auction.model}
                          </p>
                          <code className="text-xs text-muted-foreground">
                            {auction.externalId}
                          </code>
                        </div>
                      </div>
                    </td>
                    <td className="py-3 px-4">{auction.year || "-"}</td>
                    <td className="py-3 px-4">
                      {auction.mileage
                        ? `${auction.mileage.toLocaleString()} km`
                        : "-"}
                    </td>
                    <td className="py-3 px-4">{auction.fuelType || "-"}</td>
                    <td className="py-3 px-4">
                      {auction.power ? `${auction.power} kW` : "-"}
                    </td>
                    <td className="py-3 px-4">{auction.location || "-"}</td>
                    <td className="py-3 px-4">
                      <Badge variant={statusColors[auction.selectionStatus]}>
                        {auction.selectionStatus}
                      </Badge>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  )
}
