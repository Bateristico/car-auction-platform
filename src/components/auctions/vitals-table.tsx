"use client"

import * as React from "react"
import { useState } from "react"
import { Copy, Check, MapPin, Calendar, Gauge, Fuel, Zap, Car, Palette, FileCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { cn } from "@/lib/utils"

interface VitalItemProps {
  label: string
  value: string | number | null | undefined
  icon?: React.ReactNode
  copyable?: boolean
  badge?: boolean
  badgeVariant?: "default" | "success" | "warning" | "destructive"
}

function VitalItem({ label, value, icon, copyable, badge, badgeVariant = "default" }: VitalItemProps) {
  const [copied, setCopied] = useState(false)

  if (!value) return null

  const handleCopy = async () => {
    await navigator.clipboard.writeText(String(value))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const displayValue = String(value)

  return (
    <div className="flex flex-col gap-1 p-3 rounded-lg bg-muted/30 border border-border/30">
      <span className="text-xs text-muted-foreground uppercase tracking-wide flex items-center gap-1.5">
        {icon}
        {label}
      </span>
      <div className="flex items-center gap-2">
        {badge ? (
          <Badge variant={badgeVariant} className="text-sm">
            {displayValue}
          </Badge>
        ) : (
          <span className="font-medium text-foreground">
            {displayValue}
          </span>
        )}
        {copyable && (
          <Button
            variant="ghost"
            size="icon"
            className="h-6 w-6 hover:bg-muted"
            onClick={handleCopy}
            data-testid="copy-vin-button"
          >
            {copied ? (
              <Check className="h-3 w-3 text-success" />
            ) : (
              <Copy className="h-3 w-3" />
            )}
          </Button>
        )}
      </div>
      {copyable && copied && (
        <span className="text-xs text-success">Copied!</span>
      )}
    </div>
  )
}

interface VitalsTableProps {
  vin?: string | null
  year?: number | null
  mileage?: number | null
  fuelType?: string | null
  power?: number | null
  engineSize?: number | null
  transmission?: string | null
  bodyType?: string | null
  color?: string | null
  condition?: string | null
  location?: string | null
  className?: string
}

const conditionVariant = (condition: string): "success" | "warning" | "destructive" | "default" => {
  const lower = condition.toLowerCase()
  if (lower.includes("excellent") || lower.includes("good")) return "success"
  if (lower.includes("fair") || lower.includes("average")) return "warning"
  if (lower.includes("poor") || lower.includes("damaged") || lower.includes("salvage")) return "destructive"
  return "default"
}

export function VitalsTable({
  vin,
  year,
  mileage,
  fuelType,
  power,
  engineSize,
  transmission,
  bodyType,
  color,
  condition,
  location,
  className,
}: VitalsTableProps) {
  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3", className)}>
      <VitalItem
        label="VIN"
        value={vin}
        icon={<FileCheck className="h-3 w-3" />}
        copyable
      />
      <VitalItem
        label="Year"
        value={year}
        icon={<Calendar className="h-3 w-3" />}
      />
      <VitalItem
        label="Mileage"
        value={mileage ? `${mileage.toLocaleString()} km` : null}
        icon={<Gauge className="h-3 w-3" />}
      />
      <VitalItem
        label="Fuel Type"
        value={fuelType}
        icon={<Fuel className="h-3 w-3" />}
      />
      <VitalItem
        label="Power"
        value={power ? `${power} HP` : null}
        icon={<Zap className="h-3 w-3" />}
      />
      <VitalItem
        label="Engine"
        value={engineSize ? `${engineSize} cc` : null}
      />
      <VitalItem
        label="Transmission"
        value={transmission}
      />
      <VitalItem
        label="Body Type"
        value={bodyType}
        icon={<Car className="h-3 w-3" />}
      />
      <VitalItem
        label="Color"
        value={color}
        icon={<Palette className="h-3 w-3" />}
      />
      <VitalItem
        label="Condition"
        value={condition}
        badge
        badgeVariant={condition ? conditionVariant(condition) : "default"}
      />
      <VitalItem
        label="Location"
        value={location}
        icon={<MapPin className="h-3 w-3" />}
      />
    </div>
  )
}
