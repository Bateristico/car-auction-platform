"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Car } from "lucide-react"

export function Footer() {
  const t = useTranslations("footer")
  const tNav = useTranslations("nav")
  const tAuctions = useTranslations("auctions")

  return (
    <footer className="border-t bg-muted/30">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <Link href="/" className="flex items-center gap-2 font-bold text-xl mb-4">
              <Car className="h-6 w-6" />
              <span>CarAuction</span>
            </Link>
            <p className="text-sm text-muted-foreground">
              {t("tagline")}
            </p>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-semibold mb-4">{t("quickLinks")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/auctions" className="text-muted-foreground hover:text-foreground">
                  {t("allAuctions")}
                </Link>
              </li>
              <li>
                <Link href="/auctions?type=car" className="text-muted-foreground hover:text-foreground">
                  {tAuctions("cars")}
                </Link>
              </li>
              <li>
                <Link href="/auctions?type=motorcycle" className="text-muted-foreground hover:text-foreground">
                  {tAuctions("motorcycles")}
                </Link>
              </li>
              <li>
                <Link href="/auctions?type=truck" className="text-muted-foreground hover:text-foreground">
                  {tAuctions("trucks")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-semibold mb-4">{t("account")}</h4>
            <ul className="space-y-2 text-sm">
              <li>
                <Link href="/login" className="text-muted-foreground hover:text-foreground">
                  {tNav("signIn")}
                </Link>
              </li>
              <li>
                <Link href="/register" className="text-muted-foreground hover:text-foreground">
                  {t("createAccount")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard" className="text-muted-foreground hover:text-foreground">
                  {t("myProfile")}
                </Link>
              </li>
              <li>
                <Link href="/dashboard/bids" className="text-muted-foreground hover:text-foreground">
                  {tNav("myBids")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold mb-4">{t("contact")}</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li>Email: info@carauction.pl</li>
              <li>Phone: +48 123 456 789</li>
              <li>Warsaw, Poland</li>
            </ul>
          </div>
        </div>

        <div className="border-t mt-8 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex gap-6 text-sm">
            <Link href="/privacy" className="text-muted-foreground hover:text-foreground">
              {t("privacyPolicy")}
            </Link>
            <Link href="/terms" className="text-muted-foreground hover:text-foreground">
              {t("termsOfService")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
