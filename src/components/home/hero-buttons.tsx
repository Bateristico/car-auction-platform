"use client"

import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"

export function HeroButtons() {
  const { data: session, status } = useSession()
  const t = useTranslations("home")

  return (
    <div className="flex flex-col sm:flex-row gap-4">
      <Button size="lg" asChild>
        <Link href="/auctions">{t("browseAuctions")}</Link>
      </Button>
      {status !== "loading" && !session && (
        <Button size="lg" variant="outline" asChild>
          <Link href="/register">{t("createAccount")}</Link>
        </Button>
      )}
    </div>
  )
}
