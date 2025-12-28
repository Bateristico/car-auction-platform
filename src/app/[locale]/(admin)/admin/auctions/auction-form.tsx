"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Loader2 } from "lucide-react"
import { ImageReorder } from "@/components/auctions/image-reorder"

interface AuctionFormProps {
  auction?: {
    id: string
    title: string
    description: string | null
    vin: string
    make: string
    model: string
    year: number
    mileage: number
    color: string | null
    engineSize: number | null
    enginePower: number | null
    fuelType: string
    transmission: string
    bodyType: string
    condition: string
    doors: number | null
    location: string | null
    startingPrice: number
    suggestedValue: number | null
    reservePrice: number | null
    repairCost: number | null
    damageDescription: string | null
    vehicleType: string
    sourceType: string
    status: string
    endDate: string
    images: string | null
  }
}

export function AuctionForm({ auction }: AuctionFormProps) {
  const router = useRouter()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const isEditing = !!auction

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    setLoading(true)
    setError("")

    const formData = new FormData(e.currentTarget)
    const data = {
      title: formData.get("title") as string,
      description: formData.get("description") as string,
      vin: formData.get("vin") as string,
      make: formData.get("make") as string,
      model: formData.get("model") as string,
      year: parseInt(formData.get("year") as string),
      mileage: parseInt(formData.get("mileage") as string),
      color: formData.get("color") as string,
      engineSize: formData.get("engineSize") ? parseInt(formData.get("engineSize") as string) : null,
      enginePower: formData.get("enginePower") ? parseInt(formData.get("enginePower") as string) : null,
      fuelType: formData.get("fuelType") as string,
      transmission: formData.get("transmission") as string,
      bodyType: formData.get("bodyType") as string,
      condition: formData.get("condition") as string,
      doors: formData.get("doors") ? parseInt(formData.get("doors") as string) : null,
      location: formData.get("location") as string,
      startingPrice: parseFloat(formData.get("startingPrice") as string),
      suggestedValue: formData.get("suggestedValue") ? parseFloat(formData.get("suggestedValue") as string) : null,
      reservePrice: formData.get("reservePrice") ? parseFloat(formData.get("reservePrice") as string) : null,
      repairCost: formData.get("repairCost") ? parseFloat(formData.get("repairCost") as string) : null,
      damageDescription: formData.get("damageDescription") as string,
      vehicleType: formData.get("vehicleType") as string,
      sourceType: formData.get("sourceType") as string,
      status: formData.get("status") as string,
      durationDays: parseInt(formData.get("durationDays") as string) || 7,
    }

    try {
      const url = isEditing
        ? `/api/admin/auctions/${auction.id}`
        : "/api/admin/auctions"
      const method = isEditing ? "PUT" : "POST"

      const response = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      })

      if (!response.ok) {
        const result = await response.json()
        throw new Error(result.error || "Failed to save auction")
      }

      router.push("/admin/auctions")
      router.refresh()
    } catch (err) {
      setError(err instanceof Error ? err.message : "An error occurred")
    } finally {
      setLoading(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-6">
      {error && (
        <div className="bg-destructive/10 text-destructive px-4 py-3 rounded-lg">
          {error}
        </div>
      )}

      {/* Basic Information */}
      <Card>
        <CardHeader>
          <CardTitle>Basic Information</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div className="md:col-span-2">
            <Label htmlFor="title">Title *</Label>
            <Input
              id="title"
              name="title"
              defaultValue={auction?.title}
              required
              placeholder="e.g., BMW 320d xDrive Touring"
            />
          </div>
          <div className="md:col-span-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              name="description"
              defaultValue={auction?.description || ""}
              rows={4}
              placeholder="Detailed description of the vehicle..."
            />
          </div>
          <div>
            <Label htmlFor="vin">VIN (Chassis Number) *</Label>
            <Input
              id="vin"
              name="vin"
              defaultValue={auction?.vin}
              required
              placeholder="e.g., WBAXXXXXXX"
            />
          </div>
          <div>
            <Label htmlFor="vehicleType">Vehicle Type *</Label>
            <Select name="vehicleType" defaultValue={auction?.vehicleType || "CAR"}>
              <SelectTrigger>
                <SelectValue placeholder="Select type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="CAR">Car</SelectItem>
                <SelectItem value="MOTORCYCLE">Motorcycle</SelectItem>
                <SelectItem value="TRUCK">Truck</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Vehicle Details */}
      <Card>
        <CardHeader>
          <CardTitle>Vehicle Details</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-3">
          <div>
            <Label htmlFor="make">Make *</Label>
            <Input
              id="make"
              name="make"
              defaultValue={auction?.make}
              required
              placeholder="e.g., BMW"
            />
          </div>
          <div>
            <Label htmlFor="model">Model *</Label>
            <Input
              id="model"
              name="model"
              defaultValue={auction?.model}
              required
              placeholder="e.g., 320d"
            />
          </div>
          <div>
            <Label htmlFor="year">Year *</Label>
            <Input
              id="year"
              name="year"
              type="number"
              defaultValue={auction?.year || new Date().getFullYear()}
              required
              min={1900}
              max={new Date().getFullYear() + 1}
            />
          </div>
          <div>
            <Label htmlFor="mileage">Mileage (km) *</Label>
            <Input
              id="mileage"
              name="mileage"
              type="number"
              defaultValue={auction?.mileage}
              required
              min={0}
            />
          </div>
          <div>
            <Label htmlFor="color">Color</Label>
            <Input
              id="color"
              name="color"
              defaultValue={auction?.color || ""}
              placeholder="e.g., Black Metallic"
            />
          </div>
          <div>
            <Label htmlFor="bodyType">Body Type *</Label>
            <Input
              id="bodyType"
              name="bodyType"
              defaultValue={auction?.bodyType}
              required
              placeholder="e.g., Sedan, SUV, Hatchback"
            />
          </div>
          <div>
            <Label htmlFor="fuelType">Fuel Type *</Label>
            <Select name="fuelType" defaultValue={auction?.fuelType || "PETROL"}>
              <SelectTrigger>
                <SelectValue placeholder="Select fuel type" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="PETROL">Petrol</SelectItem>
                <SelectItem value="DIESEL">Diesel</SelectItem>
                <SelectItem value="ELECTRIC">Electric</SelectItem>
                <SelectItem value="HYBRID">Hybrid</SelectItem>
                <SelectItem value="LPG">LPG</SelectItem>
                <SelectItem value="CNG">CNG</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="transmission">Transmission *</Label>
            <Select name="transmission" defaultValue={auction?.transmission || "MANUAL"}>
              <SelectTrigger>
                <SelectValue placeholder="Select transmission" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="MANUAL">Manual</SelectItem>
                <SelectItem value="AUTOMATIC">Automatic</SelectItem>
                <SelectItem value="SEMI_AUTO">Semi-Automatic</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="condition">Condition *</Label>
            <Select name="condition" defaultValue={auction?.condition || "GOOD"}>
              <SelectTrigger>
                <SelectValue placeholder="Select condition" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="EXCELLENT">Excellent</SelectItem>
                <SelectItem value="GOOD">Good</SelectItem>
                <SelectItem value="FAIR">Fair</SelectItem>
                <SelectItem value="POOR">Poor</SelectItem>
                <SelectItem value="DAMAGED">Damaged</SelectItem>
                <SelectItem value="SALVAGE">Salvage</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="engineSize">Engine Size (cc)</Label>
            <Input
              id="engineSize"
              name="engineSize"
              type="number"
              defaultValue={auction?.engineSize || ""}
              min={0}
            />
          </div>
          <div>
            <Label htmlFor="enginePower">Engine Power (HP)</Label>
            <Input
              id="enginePower"
              name="enginePower"
              type="number"
              defaultValue={auction?.enginePower || ""}
              min={0}
            />
          </div>
          <div>
            <Label htmlFor="doors">Doors</Label>
            <Input
              id="doors"
              name="doors"
              type="number"
              defaultValue={auction?.doors || ""}
              min={1}
              max={6}
            />
          </div>
          <div>
            <Label htmlFor="location">Location</Label>
            <Input
              id="location"
              name="location"
              defaultValue={auction?.location || ""}
              placeholder="e.g., Warsaw"
            />
          </div>
        </CardContent>
      </Card>

      {/* Pricing */}
      <Card>
        <CardHeader>
          <CardTitle>Pricing</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="startingPrice">Starting Price (PLN) *</Label>
            <Input
              id="startingPrice"
              name="startingPrice"
              type="number"
              defaultValue={auction?.startingPrice}
              required
              min={0}
              step={100}
            />
          </div>
          <div>
            <Label htmlFor="suggestedValue">Estimated Value (PLN)</Label>
            <Input
              id="suggestedValue"
              name="suggestedValue"
              type="number"
              defaultValue={auction?.suggestedValue || ""}
              min={0}
              step={100}
            />
          </div>
          <div>
            <Label htmlFor="reservePrice">Reserve Price (PLN)</Label>
            <Input
              id="reservePrice"
              name="reservePrice"
              type="number"
              defaultValue={auction?.reservePrice || ""}
              min={0}
              step={100}
            />
          </div>
          <div>
            <Label htmlFor="repairCost">Estimated Repair Cost (PLN)</Label>
            <Input
              id="repairCost"
              name="repairCost"
              type="number"
              defaultValue={auction?.repairCost || ""}
              min={0}
              step={100}
            />
          </div>
        </CardContent>
      </Card>

      {/* Damage Information */}
      <Card>
        <CardHeader>
          <CardTitle>Damage Information</CardTitle>
        </CardHeader>
        <CardContent>
          <div>
            <Label htmlFor="damageDescription">Damage Description</Label>
            <Textarea
              id="damageDescription"
              name="damageDescription"
              defaultValue={auction?.damageDescription || ""}
              rows={4}
              placeholder="Describe any damage to the vehicle..."
            />
          </div>
        </CardContent>
      </Card>

      {/* Photo Management - Only shown when editing */}
      {isEditing && auction && (
        <ImageReorder imagesJson={auction.images} auctionId={auction.id} />
      )}

      {/* Auction Settings */}
      <Card>
        <CardHeader>
          <CardTitle>Auction Settings</CardTitle>
        </CardHeader>
        <CardContent className="grid gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="sourceType">Source Type *</Label>
            <Select name="sourceType" defaultValue={auction?.sourceType || "DEALER"}>
              <SelectTrigger>
                <SelectValue placeholder="Select source" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="INSURANCE">Insurance</SelectItem>
                <SelectItem value="DEALER">Dealer</SelectItem>
                <SelectItem value="FLEET">Fleet</SelectItem>
                <SelectItem value="PRIVATE">Private</SelectItem>
                <SelectItem value="LEASING">Leasing</SelectItem>
                <SelectItem value="OTHER">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label htmlFor="status">Status *</Label>
            <Select name="status" defaultValue={auction?.status || "DRAFT"}>
              <SelectTrigger>
                <SelectValue placeholder="Select status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="DRAFT">Draft</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="ENDED">Ended</SelectItem>
                <SelectItem value="SOLD">Sold</SelectItem>
                <SelectItem value="CANCELLED">Cancelled</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {!isEditing && (
            <div>
              <Label htmlFor="durationDays">Duration (days)</Label>
              <Input
                id="durationDays"
                name="durationDays"
                type="number"
                defaultValue={7}
                min={1}
                max={30}
              />
            </div>
          )}
        </CardContent>
      </Card>

      {/* Actions */}
      <div className="flex gap-4">
        <Button type="submit" disabled={loading}>
          {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
          {isEditing ? "Update Auction" : "Create Auction"}
        </Button>
        <Button
          type="button"
          variant="outline"
          onClick={() => router.push("/admin/auctions")}
        >
          Cancel
        </Button>
      </div>
    </form>
  )
}
