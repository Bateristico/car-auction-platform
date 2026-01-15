"use client"

import { useState, useEffect } from "react"
import { useSession, signOut } from "next-auth/react"
import { useTranslations } from "next-intl"
import { Link } from "@/i18n/navigation"
import { Button } from "@/components/ui/button"
import { Car, User, LogOut, Menu, X } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet"
import { LanguageSwitcher } from "@/components/language-switcher"
import { cn } from "@/lib/utils"

export function Header() {
  const { data: session, status } = useSession()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isScrolled, setIsScrolled] = useState(false)
  const [mounted, setMounted] = useState(false)
  const t = useTranslations("nav")

  // Set mounted state after hydration to avoid Radix UI ID mismatch
  useEffect(() => {
    setMounted(true)
  }, [])

  // Track scroll position for header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 20)
    }

    window.addEventListener("scroll", handleScroll)
    return () => window.removeEventListener("scroll", handleScroll)
  }, [])

  const navLinks = [
    { href: "/auctions", label: t("auctions") },
    { href: "/about", label: t("about") },
    { href: "/rules", label: t("rules") },
    { href: "/contact", label: t("contact") },
  ]

  return (
    <header
      className={cn(
        "fixed top-0 z-50 w-full transition-all duration-300",
        isScrolled
          ? "bg-background/95 backdrop-blur-md border-b border-border/50 shadow-lg shadow-background/5"
          : "bg-transparent"
      )}
    >
      <div className="container flex h-16 items-center justify-between">
        {/* Logo */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2 group">
            <div className="p-2 bg-primary rounded-lg shadow-md shadow-primary/20 transition-transform group-hover:scale-105">
              <Car className="h-5 w-5 text-primary-foreground" />
            </div>
            <span className="font-display font-bold text-xl hidden sm:inline-block">
              Samochody<span className="text-primary">.be</span>
            </span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center gap-8">
            {navLinks.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className="relative text-sm font-medium text-muted-foreground hover:text-primary transition-colors group py-2"
              >
                {link.label}
                {/* Underline animation */}
                <span className="absolute bottom-0 left-0 w-0 h-0.5 bg-primary transition-all duration-300 group-hover:w-full" />
              </Link>
            ))}
          </nav>
        </div>

        {/* Right side actions */}
        <div className="flex items-center gap-3">
          {/* Only render after mount to avoid Radix UI hydration mismatch */}
          {mounted && <LanguageSwitcher />}

          {!mounted || status === "loading" ? (
            <div className="h-10 w-24 bg-muted/50 animate-shimmer rounded-lg" />
          ) : session ? (
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="glass" className="gap-2">
                  <div className="w-7 h-7 bg-primary/20 rounded-full flex items-center justify-center">
                    <User className="h-4 w-4 text-primary" />
                  </div>
                  <span className="hidden sm:inline-block font-medium">
                    {session.user.firstName}
                  </span>
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent
                align="end"
                className="w-56 bg-card/95 backdrop-blur-md border-border/50"
              >
                <div className="px-3 py-2">
                  <p className="text-sm font-semibold">
                    {session.user.firstName} {session.user.lastName}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {session.user.email}
                  </p>
                </div>
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem asChild>
                  <Link href="/dashboard" className="cursor-pointer">
                    {t("dashboard")}
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem asChild>
                  <Link href="/dashboard/bids" className="cursor-pointer">
                    {t("myBids")}
                  </Link>
                </DropdownMenuItem>
                {session.user.role === "ADMIN" && (
                  <>
                    <DropdownMenuSeparator className="bg-border/50" />
                    <DropdownMenuItem asChild>
                      <Link href="/admin" className="cursor-pointer">
                        {t("adminPanel")}
                      </Link>
                    </DropdownMenuItem>
                  </>
                )}
                <DropdownMenuSeparator className="bg-border/50" />
                <DropdownMenuItem
                  className="text-destructive focus:text-destructive cursor-pointer"
                  onClick={() => signOut({ callbackUrl: "/" })}
                >
                  <LogOut className="mr-2 h-4 w-4" />
                  {t("signOut")}
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          ) : (
            <div className="hidden sm:flex items-center gap-2">
              <Button variant="ghost" asChild>
                <Link href="/login">{t("signIn")}</Link>
              </Button>
              <Button variant="bid" asChild>
                <Link href="/register">{t("register")}</Link>
              </Button>
            </div>
          )}

          {/* Mobile menu trigger - only render after mount to avoid Radix hydration mismatch */}
          {mounted && (
            <Sheet open={mobileMenuOpen} onOpenChange={setMobileMenuOpen}>
              <SheetTrigger asChild>
                <Button
                  variant="ghost"
                  size="icon"
                  className="md:hidden"
                  data-testid="mobile-menu-trigger"
                >
                  <Menu className="h-5 w-5" />
                  <span className="sr-only">{t("toggleMenu")}</span>
                </Button>
              </SheetTrigger>
            <SheetContent
              side="right"
              className="w-full sm:w-[350px] bg-background/95 backdrop-blur-md border-border/50"
            >
              <SheetHeader className="border-b border-border/50 pb-4">
                <SheetTitle className="flex items-center gap-2">
                  <div className="p-2 bg-primary rounded-lg">
                    <Car className="h-4 w-4 text-primary-foreground" />
                  </div>
                  <span className="font-display">
                    Samochody<span className="text-primary">.be</span>
                  </span>
                </SheetTitle>
              </SheetHeader>

              {/* Mobile navigation */}
              <nav className="flex flex-col gap-1 mt-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setMobileMenuOpen(false)}
                    className="text-lg font-medium text-muted-foreground hover:text-primary hover:bg-muted/50 transition-colors py-3 px-4 rounded-lg"
                  >
                    {link.label}
                  </Link>
                ))}
              </nav>

              {/* Mobile auth buttons */}
              {!session && status !== "loading" && (
                <div className="flex flex-col gap-3 mt-8 pt-6 border-t border-border/50">
                  <Button variant="outline" asChild className="w-full h-12">
                    <Link
                      href="/login"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("signIn")}
                    </Link>
                  </Button>
                  <Button variant="bid" asChild className="w-full h-12">
                    <Link
                      href="/register"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      {t("register")}
                    </Link>
                  </Button>
                </div>
              )}

              {/* Mobile user info */}
              {session && (
                <div className="mt-8 pt-6 border-t border-border/50">
                  <div className="flex items-center gap-3 mb-6 p-4 bg-muted/30 rounded-lg">
                    <div className="w-12 h-12 bg-primary/20 rounded-full flex items-center justify-center">
                      <User className="h-6 w-6 text-primary" />
                    </div>
                    <div>
                      <p className="font-semibold">
                        {session.user.firstName} {session.user.lastName}
                      </p>
                      <p className="text-sm text-muted-foreground">
                        {session.user.email}
                      </p>
                    </div>
                  </div>
                  <div className="flex flex-col gap-1">
                    <Link
                      href="/dashboard"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-muted-foreground hover:text-primary hover:bg-muted/50 py-3 px-4 rounded-lg transition-colors"
                    >
                      {t("dashboard")}
                    </Link>
                    <Link
                      href="/dashboard/bids"
                      onClick={() => setMobileMenuOpen(false)}
                      className="text-muted-foreground hover:text-primary hover:bg-muted/50 py-3 px-4 rounded-lg transition-colors"
                    >
                      {t("myBids")}
                    </Link>
                    {session.user.role === "ADMIN" && (
                      <Link
                        href="/admin"
                        onClick={() => setMobileMenuOpen(false)}
                        className="text-muted-foreground hover:text-primary hover:bg-muted/50 py-3 px-4 rounded-lg transition-colors"
                      >
                        {t("adminPanel")}
                      </Link>
                    )}
                    <Button
                      variant="destructive"
                      className="mt-4 w-full h-12"
                      onClick={() => {
                        setMobileMenuOpen(false)
                        signOut({ callbackUrl: "/" })
                      }}
                    >
                      <LogOut className="mr-2 h-4 w-4" />
                      {t("signOut")}
                    </Button>
                  </div>
                </div>
              )}
            </SheetContent>
            </Sheet>
          )}
        </div>
      </div>
    </header>
  )
}
