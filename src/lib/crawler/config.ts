/**
 * Crawler Configuration
 *
 * Configuration for the IVO/Informex crawler integration.
 */

import path from "path"

export const crawlerConfig = {
  // Informex credentials (from environment)
  informex: {
    email: process.env.INFORMEX_EMAIL || "",
    password: process.env.INFORMEX_PASSWORD || "",
    baseUrl: "https://accounts.informex.be",
  },

  // IVO (Informex Vehicle Online) platform
  ivo: {
    baseUrl: "https://my.informex-vehicle-online.be",
    clientId: process.env.IVO_CLIENT_ID || "",
    endpoints: {
      auctionsList:
        "/get?component=dashboard.auctions.Lists&day_id=0&dashboard_alive_display=days_after_creation&displayType=list&multiple_days=N",
      auctionsMenu:
        "/get?component=dashboard.auctions.Menu&number_of_days=6&auctions_menu_type=days_after_creation",
      auctionDetail: "/auction", // + ?auction_id={ID} - COSTS MONEY!
      image: "/image", // + ?_auction_id={ID}&_album_type=informex&_photo_index={N}&_width={W}&_height={H}
    },
  },

  // Browser settings
  browser: {
    headless: process.env.CRAWLER_HEADLESS !== "false",
    slowMo: parseInt(process.env.CRAWLER_SLOW_MO || "0", 10),
  },

  // Paths (relative to project root)
  paths: {
    authState: path.join(process.cwd(), ".crawler", "auth-state.json"),
    ivoAuthState: path.join(process.cwd(), ".crawler", "ivo-state.json"),
    data: path.join(process.cwd(), ".crawler", "data"),
  },

  // Cost settings
  costs: {
    detailViewCost: 0.23, // EUR per detail view
    currency: "EUR",
    maxDailySpend: 50.0, // Default daily limit
  },

  // Image download settings for parallel downloading
  imageDownload: {
    concurrency: parseInt(process.env.CRAWLER_IMAGE_CONCURRENCY || "4", 10),
    absoluteMaxImages: 50,                // Safety limit per auction
    consecutivePlaceholdersToStop: 3,     // Stop after N consecutive placeholders
    delayBetweenImages: 100,              // ms between images within same auction
    delayBetweenAuctions: 50,             // ms between auctions per worker
    outputDir: "public/auction-images",
  },
}

export function validateCrawlerConfig(): { valid: boolean; error?: string } {
  if (!crawlerConfig.informex.email) {
    return { valid: false, error: "INFORMEX_EMAIL environment variable is required" }
  }
  if (!crawlerConfig.informex.password) {
    return { valid: false, error: "INFORMEX_PASSWORD environment variable is required" }
  }
  return { valid: true }
}
