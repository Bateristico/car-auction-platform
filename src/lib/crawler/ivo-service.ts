/**
 * IVO (Informex Vehicle Online) Service
 *
 * Handles OAuth authentication to IVO platform and API calls.
 * IVO is accessed via OAuth from accounts.informex.be.
 *
 * IMPORTANT: The /auction endpoint COSTS MONEY - use with caution!
 */

import { chromium, Browser, BrowserContext, Page } from "playwright"
import { crawlerConfig, validateCrawlerConfig } from "./config"
import { crawlerLogger } from "./logger"
import {
  withRetry,
  checkResponseStatus,
  CrawlerError,
  CrawlerErrorCode,
  isLoginRedirect,
} from "./retry"
import fs from "fs"
import path from "path"

export interface ListAuctionItem {
  auctionId: string
  thumbnailUrl?: string
  brand?: string
  model?: string
  type?: string
  year?: number
  mileage?: number
  fuelType?: string
  power?: number
  engineCc?: number
  co2?: number
  status?: string
  location?: {
    name?: string
    address?: string
    postalCity?: string
    country?: string
  }
  expirationDate?: string
  rawData?: Record<string, unknown>
}

export class IvoService {
  private browser: Browser | null = null
  private context: BrowserContext | null = null
  private page: Page | null = null
  private ivoPage: Page | null = null

  /**
   * Initialize browser and authenticate to IVO
   */
  async init(): Promise<void> {
    const validation = validateCrawlerConfig()
    if (!validation.valid) {
      throw new Error(validation.error)
    }

    crawlerLogger.info("Initializing IVO service...")

    try {
      this.browser = await chromium.launch({
        headless: crawlerConfig.browser.headless,
        slowMo: crawlerConfig.browser.slowMo,
      })
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : String(error)

      // Check if this is a browser not installed error
      if (errorMessage.includes("Executable doesn't exist") ||
          errorMessage.includes("browserType.launch") ||
          errorMessage.includes("chrome-headless-shell")) {
        throw new Error(
          "Crawler feature unavailable: Playwright browser is not installed in this environment. " +
          "This feature requires a local development setup with Playwright browsers installed. " +
          "Run 'npx playwright install chromium' locally to enable crawling."
        )
      }

      throw error
    }

    // Try to load saved IVO auth state first
    const ivoAuthPath = crawlerConfig.paths.ivoAuthState
    const hasIvoAuth = fs.existsSync(ivoAuthPath)

    if (hasIvoAuth) {
      crawlerLogger.info("Loading saved IVO authentication state...")

      // Load cookies from our custom format
      try {
        const stateData = fs.readFileSync(ivoAuthPath, "utf-8")
        const state = JSON.parse(stateData)

        if (state.cookies && Array.isArray(state.cookies)) {
          this.context = await this.browser.newContext()
          await this.context.addCookies(state.cookies)
          this.ivoPage = await this.context.newPage()

          // Verify session is still valid
          const isValid = await this.verifyIvoSession()
          if (isValid) {
            crawlerLogger.info("IVO session restored successfully")
            // Always save fresh cookies after successful verification
            await this.saveIvoAuthState()
            return
          }
          crawlerLogger.warn("Saved IVO session expired, re-authenticating...")
          await this.context.close()
        }
      } catch (err) {
        crawlerLogger.warn("Failed to load saved auth state:", err)
      }
    }

    // Need to authenticate from scratch
    await this.authenticateToIvo()
  }

  /**
   * Full authentication flow: Informex login -> OAuth to IVO
   */
  private async authenticateToIvo(): Promise<void> {
    // Try to load Informex auth state
    const authStatePath = crawlerConfig.paths.authState
    const hasAuthState = fs.existsSync(authStatePath)

    if (hasAuthState) {
      crawlerLogger.info("Loading saved Informex authentication state...")
      this.context = await this.browser!.newContext({
        storageState: authStatePath,
      })
    } else {
      this.context = await this.browser!.newContext()
    }

    this.page = await this.context.newPage()

    // Login to Informex first
    const loggedIn = await this.loginToInformex()
    if (!loggedIn) {
      throw new Error("Failed to login to Informex")
    }

    // Navigate to IVO via OAuth
    await this.navigateToIvo()
  }

  /**
   * Login to Informex (accounts.informex.be)
   */
  private async loginToInformex(): Promise<boolean> {
    crawlerLogger.info("Navigating to Informex login page...")

    try {
      await this.page!.goto(crawlerConfig.informex.baseUrl)
      await this.page!.waitForLoadState("networkidle")
      await this.page!.waitForTimeout(2000)

      // Check if already logged in
      const currentUrl = this.page!.url()
      if (!currentUrl.includes("/login")) {
        crawlerLogger.info("Already logged in to Informex")
        return true
      }

      crawlerLogger.info("Performing Informex login...")

      // Fill email
      const emailField = await this.page!.$('input[name="email"]')
      if (emailField) {
        await emailField.fill(crawlerConfig.informex.email)
      } else {
        throw new Error("Email field not found")
      }

      // Fill password
      const passwordField = await this.page!.$('input[name="password"]')
      if (passwordField) {
        await passwordField.fill(crawlerConfig.informex.password)
      } else {
        throw new Error("Password field not found")
      }

      // Submit by pressing Enter
      await this.page!.keyboard.press("Enter")

      // Wait for navigation
      await this.page!.waitForLoadState("networkidle")
      await this.page!.waitForTimeout(3000)

      // Verify login
      const newUrl = this.page!.url()
      if (!newUrl.includes("/login")) {
        crawlerLogger.info("Informex login successful")

        // Save auth state
        await this.ensureDirectory(path.dirname(crawlerConfig.paths.authState))
        await this.context!.storageState({ path: crawlerConfig.paths.authState })

        return true
      }

      crawlerLogger.error("Informex login failed")
      return false
    } catch (error) {
      crawlerLogger.error("Login error:", error)
      return false
    }
  }

  /**
   * Navigate from Informex to IVO via OAuth flow
   */
  private async navigateToIvo(): Promise<void> {
    crawlerLogger.info("Navigating to IVO platform via OAuth...")

    this.ivoPage = this.page

    // Navigate directly to IVO login - this triggers OAuth with existing Informex session
    const ivoLoginUrl = `${crawlerConfig.ivo.baseUrl}/login?final_uri=/`
    crawlerLogger.info(`Initiating OAuth flow: ${ivoLoginUrl}`)

    await this.ivoPage!.goto(ivoLoginUrl)
    await this.ivoPage!.waitForLoadState("networkidle")
    await this.ivoPage!.waitForTimeout(3000)

    // Check where we ended up
    const currentUrl = this.ivoPage!.url()
    crawlerLogger.info(`Current URL after OAuth: ${currentUrl}`)

    // If we're on IVO domain, OAuth succeeded
    if (currentUrl.includes("my.informex-vehicle-online.be")) {
      crawlerLogger.info("Successfully authenticated to IVO")
      await this.saveIvoAuthState()
      return
    }

    // If we're still on Informex, we might need to authorize
    if (currentUrl.includes("accounts.informex.be")) {
      crawlerLogger.info("OAuth authorization step required...")

      const authorizeSelectors = [
        'button[type="submit"]',
        'input[type="submit"]',
        'a[href*="authorize"]',
        'button:has-text("Authorize")',
        'button:has-text("Accept")',
        ".btn-primary",
      ]

      for (const selector of authorizeSelectors) {
        try {
          const btn = await this.ivoPage!.$(selector)
          if (btn) {
            crawlerLogger.info(`Found authorize button: ${selector}`)
            await btn.click()
            await this.ivoPage!.waitForLoadState("networkidle")
            await this.ivoPage!.waitForTimeout(2000)
            break
          }
        } catch {
          continue
        }
      }

      // Check again after authorization
      const newUrl = this.ivoPage!.url()
      if (newUrl.includes("my.informex-vehicle-online.be")) {
        crawlerLogger.info("Successfully authenticated to IVO after authorization")
        await this.saveIvoAuthState()
        return
      }
    }

    throw new Error("Failed to authenticate to IVO")
  }

  /**
   * Verify IVO session is still valid
   */
  private async verifyIvoSession(): Promise<boolean> {
    try {
      await this.ivoPage!.goto(crawlerConfig.ivo.baseUrl)
      await this.ivoPage!.waitForLoadState("networkidle")
      await this.ivoPage!.waitForTimeout(2000)

      const url = this.ivoPage!.url()
      if (url.includes("/login") || url.includes("accounts.informex.be")) {
        return false
      }

      return true
    } catch {
      return false
    }
  }

  /**
   * Check if the current session is valid (public method)
   */
  async isSessionValid(): Promise<boolean> {
    if (!this.ivoPage) {
      return false
    }
    return await this.verifyIvoSession()
  }

  /**
   * Refresh session by re-authenticating (without creating new browser)
   * Used when session expires mid-operation
   */
  async refreshSession(): Promise<void> {
    crawlerLogger.info("Refreshing IVO session...")

    if (!this.browser) {
      throw new CrawlerError(
        "Browser not initialized. Call init() first.",
        CrawlerErrorCode.SCRAPE_FAILED
      )
    }

    // Close existing context if any
    if (this.context) {
      try {
        await this.context.close()
      } catch {
        // Ignore close errors
      }
    }

    // Re-authenticate from scratch
    await this.authenticateToIvo()
    crawlerLogger.info("IVO session refreshed successfully")
  }

  /**
   * Check if a response indicates session expiration
   */
  private isSessionExpiredResponse(response: { ok: () => boolean; status: () => number; url: () => string } | null): boolean {
    if (!response) return false

    const url = response.url()
    const status = response.status()

    // Check for login redirect
    if (isLoginRedirect(url)) {
      return true
    }

    // Check for auth error status codes
    if (status === 401 || status === 403) {
      return true
    }

    return false
  }

  /**
   * Save IVO authentication state
   */
  private async saveIvoAuthState(): Promise<void> {
    if (!this.context || !this.ivoPage) return

    try {
      await this.ensureDirectory(path.dirname(crawlerConfig.paths.ivoAuthState))

      // Wait for page to be fully stable before getting cookies
      await this.ivoPage.waitForLoadState("domcontentloaded")
      await this.ivoPage.waitForTimeout(500)

      // Get cookies directly from context to avoid navigation issues
      const cookies = await this.context.cookies()
      const ivoCookies = cookies.filter(c =>
        c.domain.includes("informex-vehicle-online.be") ||
        c.domain.includes("informex.be")
      )

      // Save cookies in a format compatible with fetch
      const cookieState = {
        cookies: ivoCookies,
        savedAt: new Date().toISOString()
      }

      fs.writeFileSync(
        crawlerConfig.paths.ivoAuthState,
        JSON.stringify(cookieState, null, 2)
      )
      crawlerLogger.info(`IVO auth state saved (${ivoCookies.length} cookies)`)
    } catch (error) {
      crawlerLogger.warn(
        "Could not save IVO auth state:",
        error instanceof Error ? error.message : error
      )
    }
  }

  /**
   * Ensure directory exists
   */
  private async ensureDirectory(dir: string): Promise<void> {
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true })
    }
  }

  /**
   * Fetch auction list data (FREE endpoint)
   * Includes automatic retry with exponential backoff for 5XX errors
   * and automatic session refresh on expiration
   */
  async fetchAuctionList(dayId: number = 0): Promise<string> {
    if (!this.ivoPage) {
      throw new CrawlerError(
        "IVO not initialized. Call init() first.",
        CrawlerErrorCode.SCRAPE_FAILED
      )
    }

    const endpoint = crawlerConfig.ivo.endpoints.auctionsList.replace(
      "day_id=0",
      `day_id=${dayId}`
    )
    const url = `${crawlerConfig.ivo.baseUrl}${endpoint}`

    return await withRetry(
      async () => {
        crawlerLogger.info(`Fetching auction list (FREE): ${url}`)

        const response = await this.ivoPage!.goto(url)

        // Check for session expiration first
        if (this.isSessionExpiredResponse(response)) {
          throw new CrawlerError(
            "Session expired during auction list fetch",
            CrawlerErrorCode.SESSION_EXPIRED,
            { retryable: false }
          )
        }

        // Check response status (throws CrawlerError for 5XX)
        checkResponseStatus(response, "auction list fetch")

        const html = await this.ivoPage!.content()
        crawlerLogger.info(`Received ${html.length} bytes of auction list data`)

        return html
      },
      {
        maxRetries: 3,
        baseDelayMs: 1000,
        context: `fetchAuctionList(day_id=${dayId})`,
        onSessionExpired: async () => {
          await this.refreshSession()
        },
      }
    )
  }

  /**
   * Fetch available day IDs from the menu (FREE endpoint)
   * Returns array of day IDs that have auctions
   * Includes automatic retry with exponential backoff
   */
  async fetchAvailableDayIds(): Promise<number[]> {
    if (!this.ivoPage) {
      throw new CrawlerError(
        "IVO not initialized. Call init() first.",
        CrawlerErrorCode.SCRAPE_FAILED
      )
    }

    const url = `${crawlerConfig.ivo.baseUrl}${crawlerConfig.ivo.endpoints.auctionsMenu}`

    const html = await withRetry(
      async () => {
        crawlerLogger.info(`Fetching auction menu (FREE): ${url}`)

        const response = await this.ivoPage!.goto(url)

        // Check for session expiration first
        if (this.isSessionExpiredResponse(response)) {
          throw new CrawlerError(
            "Session expired during menu fetch",
            CrawlerErrorCode.SESSION_EXPIRED,
            { retryable: false }
          )
        }

        // Check response status (throws CrawlerError for 5XX)
        checkResponseStatus(response, "auction menu fetch")

        const content = await this.ivoPage!.content()
        crawlerLogger.info(`Received ${content.length} bytes of menu data`)
        return content
      },
      {
        maxRetries: 3,
        baseDelayMs: 1000,
        context: "fetchAvailableDayIds",
        onSessionExpired: async () => {
          await this.refreshSession()
        },
      }
    )

    // Parse the menu to extract day_ids
    // The menu contains tabs/links with day_id parameters
    const dayIds: number[] = []

    // Look for day_id parameters in the HTML
    const dayIdMatches = html.matchAll(/day_id[=:](\d+)/gi)
    for (const match of dayIdMatches) {
      const dayId = parseInt(match[1], 10)
      if (!isNaN(dayId) && !dayIds.includes(dayId)) {
        dayIds.push(dayId)
      }
    }

    // Also look for data attributes like data-day-id or data-dayid
    const dataAttrMatches = html.matchAll(/data-day[-_]?id[=:"']+(\d+)/gi)
    for (const match of dataAttrMatches) {
      const dayId = parseInt(match[1], 10)
      if (!isNaN(dayId) && !dayIds.includes(dayId)) {
        dayIds.push(dayId)
      }
    }

    // Sort day IDs
    dayIds.sort((a, b) => a - b)

    crawlerLogger.info(`Found ${dayIds.length} day tabs: ${dayIds.join(", ")}`)

    // If no day IDs found, default to 0-5 (6 days as per config)
    if (dayIds.length === 0) {
      crawlerLogger.warn("No day IDs found in menu, using default range 0-5")
      return [0, 1, 2, 3, 4, 5]
    }

    return dayIds
  }

  /**
   * Fetch all auction lists from all available tabs (FREE endpoint)
   * Returns a map of dayId -> html content
   */
  async fetchAllAuctionLists(): Promise<Map<number, string>> {
    const dayIds = await this.fetchAvailableDayIds()
    const results = new Map<number, string>()

    for (const dayId of dayIds) {
      try {
        const html = await this.fetchAuctionList(dayId)
        results.set(dayId, html)

        // Small delay between requests to be nice to the server
        await new Promise((resolve) => setTimeout(resolve, 500))
      } catch (err) {
        crawlerLogger.error(`Failed to fetch list for day_id=${dayId}:`, err)
      }
    }

    crawlerLogger.info(`Fetched auction lists for ${results.size} tabs`)
    return results
  }

  /**
   * Fetch auction menu/calendar (FREE endpoint)
   * Includes automatic retry with exponential backoff
   */
  async fetchAuctionMenu(): Promise<string> {
    if (!this.ivoPage) {
      throw new CrawlerError(
        "IVO not initialized. Call init() first.",
        CrawlerErrorCode.SCRAPE_FAILED
      )
    }

    const url = `${crawlerConfig.ivo.baseUrl}${crawlerConfig.ivo.endpoints.auctionsMenu}`

    return await withRetry(
      async () => {
        crawlerLogger.info(`Fetching auction menu (FREE): ${url}`)

        const response = await this.ivoPage!.goto(url)

        // Check for session expiration first
        if (this.isSessionExpiredResponse(response)) {
          throw new CrawlerError(
            "Session expired during menu fetch",
            CrawlerErrorCode.SESSION_EXPIRED,
            { retryable: false }
          )
        }

        // Check response status (throws CrawlerError for 5XX)
        checkResponseStatus(response, "auction menu fetch")

        return await this.ivoPage!.content()
      },
      {
        maxRetries: 3,
        baseDelayMs: 1000,
        context: "fetchAuctionMenu",
        onSessionExpired: async () => {
          await this.refreshSession()
        },
      }
    )
  }

  /**
   * Get thumbnail image URL (FREE)
   */
  getThumbnailUrl(
    auctionId: string,
    photoIndex: number = 0,
    width: number = 200,
    height: number = 150
  ): string {
    return `${crawlerConfig.ivo.baseUrl}${crawlerConfig.ivo.endpoints.image}?_auction_id=${auctionId}&_album_type=informex&_photo_index=${photoIndex}&_width=${width}&_height=${height}`
  }

  /**
   * Fetch auction detail (COSTS MONEY!)
   * Includes automatic retry with exponential backoff for 5XX errors
   * and automatic session refresh on expiration.
   *
   * IMPORTANT: This endpoint costs ~0.23 EUR per call. Retries are still
   * performed on server errors (5XX) since the charge may not have been applied.
   */
  async fetchAuctionDetail(auctionId: string, reason: string): Promise<string> {
    if (!this.ivoPage) {
      throw new CrawlerError(
        "IVO not initialized. Call init() first.",
        CrawlerErrorCode.SCRAPE_FAILED
      )
    }

    crawlerLogger.cost(
      `ACCESSING PAID ENDPOINT: /auction?auction_id=${auctionId} - Reason: ${reason}`
    )

    const url = `${crawlerConfig.ivo.baseUrl}${crawlerConfig.ivo.endpoints.auctionDetail}?auction_id=${auctionId}`

    return await withRetry(
      async () => {
        const response = await this.ivoPage!.goto(url)

        // Check for session expiration first
        if (this.isSessionExpiredResponse(response)) {
          throw new CrawlerError(
            `Session expired during auction detail fetch for ${auctionId}`,
            CrawlerErrorCode.SESSION_EXPIRED,
            { retryable: false }
          )
        }

        // Check response status (throws CrawlerError for 5XX)
        checkResponseStatus(response, `auction detail fetch (${auctionId})`)

        return await this.ivoPage!.content()
      },
      {
        maxRetries: 3,
        baseDelayMs: 2000, // Longer delay for paid endpoint
        context: `fetchAuctionDetail(${auctionId})`,
        onSessionExpired: async () => {
          await this.refreshSession()
        },
      }
    )
  }

  /**
   * Get the IVO page for direct manipulation
   */
  getPage(): Page | null {
    return this.ivoPage
  }

  /**
   * Get the browser instance for parallel operations
   * IMPORTANT: Call init() first and ensure authentication is complete
   *
   * Used by ParallelImageDownloader to create multiple contexts
   * that share the same browser instance but have isolated sessions.
   */
  getBrowser(): Browser | null {
    return this.browser
  }

  /**
   * Ensure auth state is saved before parallel operations
   * This must be called before creating parallel contexts
   * so they can load the same authentication cookies.
   */
  async ensureAuthStateSaved(): Promise<void> {
    await this.saveIvoAuthState()
  }

  /**
   * Close browser and cleanup
   */
  async close(): Promise<void> {
    if (this.browser) {
      await this.browser.close()
      this.browser = null
      this.context = null
      this.page = null
      this.ivoPage = null
      crawlerLogger.info("IVO service closed")
    }
  }
}

// Create service instance (not singleton - create per request for server-side)
export function createIvoService(): IvoService {
  return new IvoService()
}
