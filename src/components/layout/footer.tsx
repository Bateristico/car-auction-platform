"use client"

import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Car, Mail, Phone, MapPin, Github, Twitter, Linkedin } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"

export function Footer() {
  const t = useTranslations("footer")
  const tNav = useTranslations("nav")
  const tAuctions = useTranslations("auctions")

  return (
    <footer className="relative border-t border-border/50 bg-gradient-to-b from-background to-muted/20">
      {/* Decorative top border */}
      <div className="absolute top-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/30 to-transparent" />

      <div className="container py-16">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-12">
          {/* Brand */}
          <div className="lg:col-span-2">
            <Link href="/" className="flex items-center gap-2 mb-4 group">
              <div className="p-2 bg-primary rounded-lg shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
                <Car className="h-5 w-5 text-primary-foreground" />
              </div>
              <span className="font-display font-bold text-xl">
                Samochody<span className="text-primary">.be</span>
              </span>
            </Link>
            <p className="text-muted-foreground mb-6 max-w-xs">
              {t("tagline")}
            </p>

            {/* Newsletter signup */}
            <div className="space-y-3">
              <h4 className="font-semibold text-sm">
                {t("newsletter") || "Stay Updated"}
              </h4>
              <div className="flex gap-2">
                <Input
                  type="email"
                  placeholder={t("emailPlaceholder") || "Enter your email"}
                  className="bg-muted/30 border-border/50"
                />
                <Button variant="bid" size="sm">
                  {t("subscribe") || "Subscribe"}
                </Button>
              </div>
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="font-display font-semibold mb-4 text-foreground">
              {t("quickLinks")}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/auctions"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("allAuctions")}
                </Link>
              </li>
              <li>
                <Link
                  href="/auctions?type=car"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {tAuctions("cars")}
                </Link>
              </li>
              <li>
                <Link
                  href="/auctions?type=motorcycle"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {tAuctions("motorcycles")}
                </Link>
              </li>
              <li>
                <Link
                  href="/auctions?type=truck"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {tAuctions("trucks")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Account */}
          <div>
            <h4 className="font-display font-semibold mb-4 text-foreground">
              {t("account")}
            </h4>
            <ul className="space-y-3 text-sm">
              <li>
                <Link
                  href="/login"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {tNav("signIn")}
                </Link>
              </li>
              <li>
                <Link
                  href="/register"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("createAccount")}
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {t("myProfile")}
                </Link>
              </li>
              <li>
                <Link
                  href="/dashboard/bids"
                  className="text-muted-foreground hover:text-primary transition-colors"
                >
                  {tNav("myBids")}
                </Link>
              </li>
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-display font-semibold mb-4 text-foreground">
              {t("contact")}
            </h4>
            <ul className="space-y-3 text-sm">
              <li className="flex items-center gap-2 text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <a
                  href="mailto:info@samochody.be"
                  className="hover:text-primary transition-colors"
                >
                  info@samochody.be
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <Phone className="h-4 w-4 text-primary" />
                <a
                  href="tel:+48123456789"
                  className="hover:text-primary transition-colors"
                >
                  +48 123 456 789
                </a>
              </li>
              <li className="flex items-center gap-2 text-muted-foreground">
                <MapPin className="h-4 w-4 text-primary" />
                <span>Warsaw, Poland</span>
              </li>
            </ul>

            {/* Social links */}
            <div className="flex gap-2 mt-6">
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:text-primary">
                <Twitter className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:text-primary">
                <Linkedin className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="icon" className="h-9 w-9 hover:text-primary">
                <Github className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-border/50 mt-12 pt-8 flex flex-col md:flex-row justify-between items-center gap-4">
          <p className="text-sm text-muted-foreground">
            {t("copyright", { year: new Date().getFullYear() })}
          </p>
          <div className="flex gap-6 text-sm">
            <Link
              href="/privacy"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {t("privacyPolicy")}
            </Link>
            <Link
              href="/terms"
              className="text-muted-foreground hover:text-primary transition-colors"
            >
              {t("termsOfService")}
            </Link>
          </div>
        </div>
      </div>
    </footer>
  )
}
