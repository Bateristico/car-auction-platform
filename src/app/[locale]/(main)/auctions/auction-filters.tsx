"use client"

import { useSearchParams } from "next/navigation"
import { useRouter, usePathname } from "@/i18n/navigation"
import { useState, useCallback } from "react"
import { useTranslations } from "next-intl"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Search, Car, Bike, Truck, RotateCcw } from "lucide-react"

export function AuctionFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()
  const t = useTranslations("auctions")
  const tCommon = useTranslations("common")

  const vehicleTypes = [
    { value: "all", label: t("all"), icon: null },
    { value: "car", label: t("cars"), icon: Car },
    { value: "motorcycle", label: t("motorcycles"), icon: Bike },
    { value: "truck", label: t("trucks"), icon: Truck },
  ]

  const sortOptions = [
    { value: "endDate", label: t("endingSoon") },
    { value: "newest", label: t("newest") },
    { value: "popular", label: t("mostPopular") },
  ]

  const [search, setSearch] = useState(searchParams.get("search") || "")
  const [minYear, setMinYear] = useState(searchParams.get("minYear") || "")
  const [maxYear, setMaxYear] = useState(searchParams.get("maxYear") || "")
  const [minMileage, setMinMileage] = useState(searchParams.get("minMileage") || "")
  const [maxMileage, setMaxMileage] = useState(searchParams.get("maxMileage") || "")

  const currentType = searchParams.get("type") || "all"
  const currentSort = searchParams.get("sort") || "endDate"

  const createQueryString = useCallback(
    (params: Record<string, string | null>) => {
      const current = new URLSearchParams(searchParams.toString())

      Object.entries(params).forEach(([key, value]) => {
        if (value === null || value === "") {
          current.delete(key)
        } else {
          current.set(key, value)
        }
      })

      // Reset to page 1 when filters change
      current.delete("page")

      return current.toString()
    },
    [searchParams]
  )

  const handleSearch = () => {
    const query = createQueryString({
      search: search || null,
      minYear: minYear || null,
      maxYear: maxYear || null,
      minMileage: minMileage || null,
      maxMileage: maxMileage || null,
    })
    router.push(`${pathname}?${query}`)
  }

  const handleTypeChange = (type: string) => {
    const query = createQueryString({ type: type === "all" ? null : type })
    router.push(`${pathname}?${query}`)
  }

  const handleSortChange = (sort: string) => {
    const query = createQueryString({ sort })
    router.push(`${pathname}?${query}`)
  }

  const handleReset = () => {
    setSearch("")
    setMinYear("")
    setMaxYear("")
    setMinMileage("")
    setMaxMileage("")
    router.push(pathname)
  }

  return (
    <div className="space-y-6">
      {/* Search */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{tCommon("search")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder={t("searchPlaceholder")}
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-10"
              onKeyDown={(e) => e.key === "Enter" && handleSearch()}
            />
          </div>
          <Button onClick={handleSearch} className="w-full">
            {tCommon("search")}
          </Button>
        </CardContent>
      </Card>

      {/* Vehicle Type */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("vehicleType")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-2">
            {vehicleTypes.map((type) => (
              <Button
                key={type.value}
                variant={currentType === type.value ? "default" : "outline"}
                size="sm"
                className="justify-start"
                onClick={() => handleTypeChange(type.value)}
              >
                {type.icon && <type.icon className="h-4 w-4 mr-2" />}
                {type.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Filters */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("filters")}</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label>{t("year")}</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder={t("from")}
                value={minYear}
                onChange={(e) => setMinYear(e.target.value)}
                min="1900"
                max="2025"
              />
              <Input
                type="number"
                placeholder={t("to")}
                value={maxYear}
                onChange={(e) => setMaxYear(e.target.value)}
                min="1900"
                max="2025"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label>{t("mileage")}</Label>
            <div className="grid grid-cols-2 gap-2">
              <Input
                type="number"
                placeholder={t("from")}
                value={minMileage}
                onChange={(e) => setMinMileage(e.target.value)}
                min="0"
              />
              <Input
                type="number"
                placeholder={t("to")}
                value={maxMileage}
                onChange={(e) => setMaxMileage(e.target.value)}
                min="0"
              />
            </div>
          </div>

          <Button onClick={handleSearch} className="w-full">
            {t("applyFilters")}
          </Button>
        </CardContent>
      </Card>

      {/* Sort */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-lg">{t("sortBy")}</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-2">
            {sortOptions.map((option) => (
              <Button
                key={option.value}
                variant={currentSort === option.value ? "default" : "ghost"}
                size="sm"
                className="w-full justify-start"
                onClick={() => handleSortChange(option.value)}
              >
                {option.label}
              </Button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Reset */}
      <Button variant="outline" className="w-full" onClick={handleReset}>
        <RotateCcw className="h-4 w-4 mr-2" />
        {tCommon("reset")}
      </Button>
    </div>
  )
}
