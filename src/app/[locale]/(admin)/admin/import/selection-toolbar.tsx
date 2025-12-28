"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Play, Loader2 } from "lucide-react"
import { AuthorizationDialog } from "./authorization-dialog"

interface SelectionToolbarProps {
  selectedCount: number
}

const COST_PER_DETAIL = 0.23

export function SelectionToolbar({ selectedCount }: SelectionToolbarProps) {
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)
  const [loading, setLoading] = useState(false)

  const estimatedCost = selectedCount * COST_PER_DETAIL

  async function handleStartJob() {
    setLoading(true)
    try {
      const response = await fetch("/api/admin/import/jobs", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
      })

      if (response.ok) {
        router.refresh()
        setDialogOpen(false)
      } else {
        const data = await response.json()
        console.error("Error starting job:", data.error)
      }
    } catch (error) {
      console.error("Error starting job:", error)
    }
    setLoading(false)
  }

  if (selectedCount === 0) {
    return (
      <Card>
        <CardContent className="py-4">
          <p className="text-sm text-muted-foreground text-center">
            Select vehicles from the table below to start a detail fetch job
          </p>
        </CardContent>
      </Card>
    )
  }

  return (
    <>
      <Card>
        <CardContent className="py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div>
                <p className="text-sm text-muted-foreground">
                  Vehicles selected for detail fetch
                </p>
                <p className="text-2xl font-bold">{selectedCount}</p>
              </div>
              <div>
                <p className="text-sm text-muted-foreground">Estimated cost</p>
                <p className="text-2xl font-bold text-primary">
                  {estimatedCost.toFixed(2)} EUR
                </p>
              </div>
            </div>
            <Button
              onClick={() => setDialogOpen(true)}
              disabled={loading}
              size="lg"
            >
              {loading ? (
                <Loader2 className="mr-2 h-5 w-5 animate-spin" />
              ) : (
                <Play className="mr-2 h-5 w-5" />
              )}
              Start Fetch Job
            </Button>
          </div>
        </CardContent>
      </Card>

      <AuthorizationDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        selectedCount={selectedCount}
        onConfirm={handleStartJob}
      />
    </>
  )
}
