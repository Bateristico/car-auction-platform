"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Download, AlertTriangle, Loader2, RefreshCw, CheckCircle2, XCircle, Upload } from "lucide-react"

interface CrawlerControlsProps {
  selectedCount: number
  fetchingCount: number
}

const COST_PER_DETAIL = 0.23

export function CrawlerControls({ selectedCount, fetchingCount }: CrawlerControlsProps) {
  const router = useRouter()
  const [listScrapeLoading, setListScrapeLoading] = useState(false)
  const [detailScrapeLoading, setDetailScrapeLoading] = useState(false)
  const [importLoading, setImportLoading] = useState(false)
  const [confirmDialogOpen, setConfirmDialogOpen] = useState(false)
  const [scrapeResult, setScrapeResult] = useState<{
    type: "success" | "error"
    message: string
    stats?: { created: number; updated: number; skipped: number; tabs?: number; imported?: number }
  } | null>(null)

  const estimatedCost = selectedCount * COST_PER_DETAIL

  async function handleListScrape() {
    setListScrapeLoading(true)
    setScrapeResult(null)

    try {
      const response = await fetch("/api/admin/crawler/scrape-list", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ dayId: 0 }),
      })

      const data = await response.json()

      if (response.ok) {
        setScrapeResult({
          type: "success",
          message: `List scrape completed successfully`,
          stats: data.stats,
        })
        router.refresh()
      } else {
        setScrapeResult({
          type: "error",
          message: data.error || "Failed to scrape list",
        })
      }
    } catch (error) {
      setScrapeResult({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to scrape list",
      })
    }

    setListScrapeLoading(false)
  }

  async function handleDetailScrape() {
    setDetailScrapeLoading(true)
    setScrapeResult(null)

    try {
      const response = await fetch("/api/admin/crawler/scrape-detail", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      const data = await response.json()

      if (response.ok) {
        setScrapeResult({
          type: "success",
          message: `Detail scrape started for ${data.auctionCount} auctions (Est: ${data.estimatedCost.toFixed(2)} EUR)`,
        })
        router.refresh()
        setConfirmDialogOpen(false)
      } else {
        setScrapeResult({
          type: "error",
          message: data.error || "Failed to start detail scrape",
        })
      }
    } catch (error) {
      setScrapeResult({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to start detail scrape",
      })
    }

    setDetailScrapeLoading(false)
  }

  async function handleImportToGrid() {
    setImportLoading(true)
    setScrapeResult(null)

    try {
      const response = await fetch("/api/admin/crawler/import-to-grid", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ importAll: true }),
      })

      const data = await response.json()

      if (response.ok) {
        setScrapeResult({
          type: "success",
          message: `Imported ${data.stats.imported} auctions to public grid`,
          stats: { created: data.stats.imported, updated: 0, skipped: data.stats.skipped },
        })
        router.refresh()
      } else {
        setScrapeResult({
          type: "error",
          message: data.error || "Failed to import to grid",
        })
      }
    } catch (error) {
      setScrapeResult({
        type: "error",
        message: error instanceof Error ? error.message : "Failed to import to grid",
      })
    }

    setImportLoading(false)
  }

  return (
    <>
      <Card>
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2">
            <Download className="h-5 w-5" />
            Crawler Controls
          </CardTitle>
          <CardDescription>
            Scrape auction data from IVO platform
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Result message */}
          {scrapeResult && (
            <div
              className={`flex items-start gap-3 p-4 rounded-lg border-2 ${
                scrapeResult.type === "success"
                  ? "bg-green-100 border-green-500 text-green-900"
                  : "bg-red-100 border-red-500 text-red-900"
              }`}
            >
              {scrapeResult.type === "success" ? (
                <CheckCircle2 className="h-6 w-6 flex-shrink-0 text-green-600" />
              ) : (
                <XCircle className="h-6 w-6 flex-shrink-0 text-red-600" />
              )}
              <div>
                <p className="font-semibold text-base">{scrapeResult.message}</p>
                {scrapeResult.stats && (
                  <p className="text-sm mt-1 font-medium">
                    {scrapeResult.stats.tabs && `Tabs: ${scrapeResult.stats.tabs} | `}
                    Created: {scrapeResult.stats.created} | Updated: {scrapeResult.stats.updated} | Skipped: {scrapeResult.stats.skipped}
                  </p>
                )}
              </div>
            </div>
          )}

          <div className="flex flex-wrap gap-4">
            {/* List Scrape - FREE */}
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">List Scrape</span>
                <Badge variant="secondary" className="text-xs">FREE</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Fetch available auctions from IVO list view
              </p>
              <Button
                onClick={handleListScrape}
                disabled={listScrapeLoading}
                variant="outline"
                className="w-full"
              >
                {listScrapeLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Scraping List...
                  </>
                ) : (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4" />
                    Scrape Auction List
                  </>
                )}
              </Button>
            </div>

            {/* Detail Scrape - PAID */}
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Detail Scrape</span>
                <Badge variant="destructive" className="text-xs">PAID</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                {selectedCount > 0 ? (
                  <>
                    {selectedCount} selected | Est: <strong>{estimatedCost.toFixed(2)} EUR</strong>
                  </>
                ) : fetchingCount > 0 ? (
                  <>
                    {fetchingCount} currently fetching...
                  </>
                ) : (
                  "Select auctions first"
                )}
              </p>
              <Button
                onClick={() => setConfirmDialogOpen(true)}
                disabled={detailScrapeLoading || selectedCount === 0 || fetchingCount > 0}
                className="w-full"
              >
                {detailScrapeLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Starting...
                  </>
                ) : (
                  <>
                    <Download className="mr-2 h-4 w-4" />
                    Fetch Details ({selectedCount})
                  </>
                )}
              </Button>
            </div>

            {/* Import to Grid */}
            <div className="flex-1 min-w-[200px]">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-sm font-medium">Publish to Grid</span>
                <Badge variant="outline" className="text-xs">FREE</Badge>
              </div>
              <p className="text-sm text-muted-foreground mb-3">
                Make scraped auctions visible on public grid
              </p>
              <Button
                onClick={handleImportToGrid}
                disabled={importLoading}
                variant="default"
                className="w-full"
              >
                {importLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Importing...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Publish All to Grid
                  </>
                )}
              </Button>
            </div>
          </div>

          {/* Warning */}
          <div className="flex items-start gap-3 p-4 bg-amber-100 border-2 border-amber-500 rounded-lg text-amber-900">
            <AlertTriangle className="h-6 w-6 flex-shrink-0 text-amber-600" />
            <div>
              <p className="font-semibold">Cost Warning</p>
              <p className="text-sm">Each detail view costs {COST_PER_DETAIL} EUR. Make sure you have selected only the vehicles you need.</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Confirmation Dialog */}
      <Dialog open={confirmDialogOpen} onOpenChange={setConfirmDialogOpen}>
        <DialogContent>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <AlertTriangle className="h-5 w-5 text-yellow-500" />
              Confirm Paid Operation
            </DialogTitle>
            <DialogDescription>
              This action will charge your IVO account.
            </DialogDescription>
          </DialogHeader>

          <div className="py-4 space-y-4">
            <div className="bg-muted rounded-lg p-4 space-y-2">
              <div className="flex justify-between">
                <span>Vehicles to fetch:</span>
                <span className="font-medium">{selectedCount}</span>
              </div>
              <div className="flex justify-between">
                <span>Cost per vehicle:</span>
                <span>{COST_PER_DETAIL.toFixed(2)} EUR</span>
              </div>
              <div className="border-t pt-2 flex justify-between text-lg font-bold">
                <span>Total Cost:</span>
                <span className="text-primary">{estimatedCost.toFixed(2)} EUR</span>
              </div>
            </div>

            <p className="text-sm text-muted-foreground">
              By clicking &quot;Confirm&quot;, you confirm that you want to fetch
              detailed information for the selected vehicles. This will incur
              charges on your IVO account. This action cannot be undone.
            </p>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setConfirmDialogOpen(false)}
              disabled={detailScrapeLoading}
            >
              Cancel
            </Button>
            <Button
              onClick={handleDetailScrape}
              disabled={detailScrapeLoading}
            >
              {detailScrapeLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Confirm ({estimatedCost.toFixed(2)} EUR)
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  )
}
