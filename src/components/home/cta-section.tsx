"use client"

import { useSession } from "next-auth/react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"

export function CTASection() {
  const { data: session, status } = useSession()
  const t = useTranslations("home")

  return (
    <section className="py-20">
      <div className="container">
        <div className="bg-primary text-primary-foreground rounded-2xl p-8 md:p-12 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            {t("readyToStart")}
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-2xl mx-auto">
            {t("readyToStartDesc")}
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {status !== "loading" && !session && (
              <Button size="lg" variant="secondary" asChild>
                <Link href="/register">{t("getStarted")}</Link>
              </Button>
            )}
            <Button
              size="lg"
              variant={session ? "secondary" : "outline"}
              className={session ? "" : "bg-transparent border-primary-foreground text-primary-foreground hover:bg-primary-foreground/10"}
              asChild
            >
              <Link href="/auctions">{t("browseAuctions")}</Link>
            </Button>
          </div>
        </div>
      </div>
    </section>
  )
}
