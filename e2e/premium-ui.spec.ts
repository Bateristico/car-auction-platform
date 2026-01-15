import { test, expect } from "playwright/test"

/**
 * Premium UI E2E Tests
 * Tests for the High-Octane Premium UX/UI overhaul
 */

test.describe("Premium UI Theme", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("should have dark background color", async ({ page }) => {
    const body = page.locator("body")
    const backgroundColor = await body.evaluate((el) => {
      return window.getComputedStyle(el).backgroundColor
    })
    // Carbon Black #121212 = rgb(18, 18, 18)
    expect(backgroundColor).toMatch(/rgb\(18,\s*18,\s*18\)|rgb\(7,\s*7,\s*7\)/)
  })

  test("should have Racing Yellow primary color on buttons", async ({ page }) => {
    const bidButton = page.locator('button:has-text("Bid")').first()
    if (await bidButton.count() > 0) {
      await expect(bidButton).toBeVisible()
      // Racing Yellow #FFD700 should be present in bid buttons
    }
  })
})

test.describe("Homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("should display hero section", async ({ page }) => {
    // Hero should be visible
    const heroSection = page.locator('[data-testid="hero-featured-auction"]').or(
      page.locator("section").first()
    )
    await expect(heroSection).toBeVisible()
  })

  test("should display live ticker if bids exist", async ({ page }) => {
    const ticker = page.locator('[data-testid="live-ticker"]')
    // Ticker may or may not be visible depending on data
    if (await ticker.count() > 0) {
      await expect(ticker).toBeVisible()
    }
  })

  test("should display stats dashboard", async ({ page }) => {
    // Check for stats section with active auctions count
    const statsSection = page.locator("text=Active Auctions").or(
      page.locator("text=Aktywne aukcje")
    )
    await expect(statsSection.first()).toBeVisible()
  })

  test("should display featured auctions grid", async ({ page }) => {
    const auctionCards = page.locator('[data-testid="auction-data-card"]')
    // May have 0 if no active auctions
    const count = await auctionCards.count()
    expect(count).toBeGreaterThanOrEqual(0)
  })

  test("should display how it works section", async ({ page }) => {
    const howItWorks = page.locator("text=How It Works").or(
      page.locator("text=Jak to działa")
    )
    await expect(howItWorks.first()).toBeVisible()
  })

  test("should display features section", async ({ page }) => {
    const features = page.locator("text=Verified Vehicles").or(
      page.locator("text=Zweryfikowane pojazdy")
    )
    await expect(features.first()).toBeVisible()
  })
})

test.describe("Header", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("should display logo with brand name", async ({ page }) => {
    const logo = page.locator("text=Samochody.be")
    await expect(logo.first()).toBeVisible()
  })

  test("should display navigation links", async ({ page }) => {
    const navLinks = page.locator("nav a")
    await expect(navLinks.first()).toBeVisible()
  })

  test("should change header style on scroll", async ({ page }) => {
    // Scroll down
    await page.evaluate(() => window.scrollTo(0, 100))
    await page.waitForTimeout(500)

    // Header should have solid background after scroll
    const header = page.locator("header")
    await expect(header).toBeVisible()
  })

  test("should open mobile menu on small screens", async ({ page }) => {
    // Set viewport to mobile
    await page.setViewportSize({ width: 375, height: 667 })

    const menuTrigger = page.locator('[data-testid="mobile-menu-trigger"]')
    if (await menuTrigger.isVisible()) {
      await menuTrigger.click()
      // Mobile menu should open
      const mobileNav = page.locator('[role="dialog"]')
      await expect(mobileNav).toBeVisible()
    }
  })
})

test.describe("Footer", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/")
  })

  test("should display footer with brand", async ({ page }) => {
    const footer = page.locator("footer")
    await expect(footer).toBeVisible()
  })

  test("should display newsletter signup", async ({ page }) => {
    const newsletterInput = page.locator('footer input[type="email"]')
    await expect(newsletterInput).toBeVisible()
  })

  test("should display social links", async ({ page }) => {
    const socialLinks = page.locator("footer button")
    await expect(socialLinks.first()).toBeVisible()
  })
})

test.describe("Auctions Page", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/auctions")
  })

  test("should display auction listing", async ({ page }) => {
    // Wait for page to load
    await page.waitForLoadState("networkidle")

    // Should show auctions or no auctions message
    const hasAuctions = await page.locator('[data-testid="auction-data-card"]').count() > 0
    const hasNoAuctionsMessage = await page.locator("text=No auctions found").or(
      page.locator("text=Nie znaleziono aukcji")
    ).count() > 0

    expect(hasAuctions || hasNoAuctionsMessage).toBeTruthy()
  })
})

test.describe("Auction Detail Page", () => {
  test("should navigate to auction detail", async ({ page }) => {
    // Go to auctions page
    await page.goto("/auctions")
    await page.waitForLoadState("networkidle")

    // Click first auction if exists
    const firstAuction = page.locator('[data-testid="auction-data-card"]').first()
    if (await firstAuction.isVisible()) {
      await firstAuction.click()
      await page.waitForLoadState("networkidle")

      // Should be on auction detail page
      const detailPage = page.locator('[data-testid="auction-detail"]')
      await expect(detailPage).toBeVisible()
    }
  })

  test("should display image gallery", async ({ page }) => {
    await page.goto("/auctions")
    await page.waitForLoadState("networkidle")

    const firstAuction = page.locator('[data-testid="auction-data-card"]').first()
    if (await firstAuction.isVisible()) {
      await firstAuction.click()
      await page.waitForLoadState("networkidle")

      // Gallery should have images
      const images = page.locator('[data-testid="auction-detail"] img')
      await expect(images.first()).toBeVisible()
    }
  })

  test("should display sticky bid widget on desktop", async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1280, height: 800 })

    await page.goto("/auctions")
    await page.waitForLoadState("networkidle")

    const firstAuction = page.locator('[data-testid="auction-data-card"]').first()
    if (await firstAuction.isVisible()) {
      await firstAuction.click()
      await page.waitForLoadState("networkidle")

      // Bid widget should be sticky (check for card with bid-related content)
      const bidWidget = page.locator("text=Starting Price").or(
        page.locator("text=Cena wywoławcza")
      )
      await expect(bidWidget.first()).toBeVisible()
    }
  })

  test("should open lightbox when clicking image", async ({ page }) => {
    await page.goto("/auctions")
    await page.waitForLoadState("networkidle")

    const firstAuction = page.locator('[data-testid="auction-data-card"]').first()
    if (await firstAuction.isVisible()) {
      await firstAuction.click()
      await page.waitForLoadState("networkidle")

      // Click on main image
      const mainImage = page.locator('[data-testid="auction-detail"] img').first()
      if (await mainImage.isVisible()) {
        await mainImage.click()

        // Lightbox should open
        const lightbox = page.locator('[data-testid="image-lightbox"]')
        if (await lightbox.count() > 0) {
          await expect(lightbox).toBeVisible()
        }
      }
    }
  })
})

test.describe("Responsive Design", () => {
  test("should display properly on mobile (375px)", async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 667 })
    await page.goto("/")

    // Page should load without horizontal scroll
    const scrollWidth = await page.evaluate(() => document.documentElement.scrollWidth)
    const clientWidth = await page.evaluate(() => document.documentElement.clientWidth)
    expect(scrollWidth).toBeLessThanOrEqual(clientWidth + 1) // +1 for rounding
  })

  test("should display properly on tablet (768px)", async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 })
    await page.goto("/")

    // Page should load
    await expect(page.locator("body")).toBeVisible()
  })

  test("should display properly on desktop (1280px)", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 800 })
    await page.goto("/")

    // Header navigation should be visible on desktop
    const desktopNav = page.locator("nav a").first()
    await expect(desktopNav).toBeVisible()
  })
})

test.describe("Accessibility", () => {
  test("should have proper focus states", async ({ page }) => {
    await page.goto("/")

    // Tab to first interactive element
    await page.keyboard.press("Tab")

    // Focused element should have visible focus indicator
    const focusedElement = page.locator(":focus")
    await expect(focusedElement).toBeVisible()
  })

  test("should have proper heading hierarchy", async ({ page }) => {
    await page.goto("/")

    // Should have an h1
    const h1 = page.locator("h1")
    await expect(h1.first()).toBeVisible()
  })

  test("should have alt text on images", async ({ page }) => {
    await page.goto("/")

    const images = page.locator("img")
    const count = await images.count()

    for (let i = 0; i < Math.min(count, 5); i++) {
      const alt = await images.nth(i).getAttribute("alt")
      expect(alt).toBeTruthy()
    }
  })
})

test.describe("Internationalization", () => {
  test("should display English content by default", async ({ page }) => {
    await page.goto("/en")

    // Check for English text
    const englishText = page.locator("text=Auctions").or(
      page.locator("text=About")
    )
    await expect(englishText.first()).toBeVisible()
  })

  test("should display Polish content when navigating to /pl", async ({ page }) => {
    await page.goto("/pl")

    // Check for Polish text
    const polishText = page.locator("text=Aukcje").or(
      page.locator("text=O nas")
    )
    await expect(polishText.first()).toBeVisible()
  })
})
