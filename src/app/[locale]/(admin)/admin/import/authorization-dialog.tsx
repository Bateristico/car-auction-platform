"use client"

import { useState } from "react"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { AlertTriangle, Loader2 } from "lucide-react"

interface AuthorizationDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  selectedCount: number
  onConfirm: () => Promise<void>
}

const COST_PER_DETAIL = 0.23

export function AuthorizationDialog({
  open,
  onOpenChange,
  selectedCount,
  onConfirm,
}: AuthorizationDialogProps) {
  const [loading, setLoading] = useState(false)
  const totalCost = selectedCount * COST_PER_DETAIL

  async function handleConfirm() {
    setLoading(true)
    try {
      await onConfirm()
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-yellow-500" />
            Confirm Detail Fetch
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
              <span className="text-primary">{totalCost.toFixed(2)} EUR</span>
            </div>
          </div>

          <p className="text-sm text-muted-foreground">
            By clicking &quot;Authorize&quot;, you confirm that you want to fetch
            detailed information for the selected vehicles. This will incur
            charges on your IVO account.
          </p>
        </div>

        <DialogFooter>
          <Button
            variant="outline"
            onClick={() => onOpenChange(false)}
            disabled={loading}
          >
            Cancel
          </Button>
          <Button onClick={handleConfirm} disabled={loading}>
            {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            Authorize ({totalCost.toFixed(2)} EUR)
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}
