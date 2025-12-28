/**
 * HTML Parser Service
 *
 * Parses HTML responses from IVO endpoints to extract auction data.
 */

import * as cheerio from "cheerio"
import type { AnyNode } from "domhandler"
import { crawlerLogger } from "./logger"
import { crawlerConfig } from "./config"
import type { ListAuctionItem } from "./ivo-service"

type CheerioRoot = ReturnType<typeof cheerio.load>
type CheerioElement = AnyNode
type CheerioSelection = ReturnType<CheerioRoot>

export interface ParsedListData {
  auctions: ListAuctionItem[]
  totalCount?: number
}

export function parseAuctionList(html: string): ParsedListData {
  // First, check if the HTML is wrapped in a <pre> tag with encoded content
  let processedHtml = html
  const $initial = cheerio.load(html)
  const preContent = $initial("pre").text()

  if (preContent && preContent.includes("<table")) {
    crawlerLogger.info("Detected encoded HTML in <pre> tag, extracting...")
    processedHtml = preContent
  }

  const $ = cheerio.load(processedHtml)
  const auctions: ListAuctionItem[] = []

  // IVO uses tr.auction with data-auctionId attribute
  const auctionRows = $("tr.auction")

  if (auctionRows.length > 0) {
    crawlerLogger.info(`Found ${auctionRows.length} auction rows`)

    auctionRows.each((_: number, element: CheerioElement) => {
      const auction = parseIvoAuctionRow($, $(element))
      if (auction && auction.auctionId) {
        auctions.push(auction)
      }
    })
  } else {
    // Fallback: try other selectors
    const itemSelectors = [
      "[data-auctionId]",
      "[data-auction-id]",
      ".auction-item",
      ".vehicle-item",
      "tbody tr",
    ]

    for (const selector of itemSelectors) {
      const items = $(selector)
      if (items.length > 0) {
        crawlerLogger.info(`Found ${items.length} items using selector: ${selector}`)

        items.each((_: number, element: CheerioElement) => {
          const auction = parseAuctionItem($, $(element))
          if (auction && auction.auctionId) {
            auctions.push(auction)
          }
        })

        break
      }
    }
  }

  crawlerLogger.info(`Parsed ${auctions.length} auctions from list`)

  return {
    auctions,
    totalCount: auctions.length,
  }
}

/**
 * Parse a single IVO auction row
 */
function parseIvoAuctionRow(
  $: CheerioRoot,
  row: CheerioSelection
): ListAuctionItem | null {
  const auctionId = row.attr("data-auctionid") || row.attr("data-auctionId") || ""

  if (!auctionId) {
    return null
  }

  const auction: ListAuctionItem = {
    auctionId,
    rawData: {},
  }

  // Get all table cells
  const cells = row.find("td")

  // Parse vehicle cell
  const vehicleCell = cells
    .filter((_: number, el: CheerioElement) => {
      return $(el).find("p").length > 0 && !$(el).hasClass("bigScreenOnly")
    })
    .first()

  if (vehicleCell.length) {
    // Get thumbnail image
    const img = vehicleCell.find("img")
    if (img.length) {
      let imgSrc = img.attr("src") || ""
      crawlerLogger.info(`[DEBUG] Auction ${auctionId} - Raw img src: "${imgSrc}"`)

      if (imgSrc && !imgSrc.startsWith("http") && !imgSrc.startsWith("img/")) {
        imgSrc = `${crawlerConfig.ivo.baseUrl}/${imgSrc}`
      } else if (imgSrc.startsWith("image?")) {
        imgSrc = `${crawlerConfig.ivo.baseUrl}/${imgSrc}`
      }
      auction.thumbnailUrl = imgSrc
      crawlerLogger.info(`[DEBUG] Auction ${auctionId} - Final thumbnailUrl: "${imgSrc}"`)
    } else {
      crawlerLogger.warn(`[DEBUG] Auction ${auctionId} - No img tag found in vehicle cell`)
    }

    // Parse the paragraph: BRAND<br>MODEL<br>MILEAGE KM<br>STATUS
    const paragraph = vehicleCell.find("p")
    if (paragraph.length) {
      const lines =
        paragraph
          .html()
          ?.split(/<br\s*\/?>/gi)
          .map((line) => cheerio.load(`<span>${line}</span>`)("span").text().trim())
          .filter((line) => line.length > 0) || []

      if (lines.length >= 1) {
        auction.brand = lines[0]
      }
      if (lines.length >= 2) {
        auction.model = lines[1]
      }
      if (lines.length >= 3) {
        const mileageMatch = lines[2].match(/([\d.,]+)\s*km/i)
        if (mileageMatch) {
          auction.mileage = parseInt(mileageMatch[1].replace(/[.,]/g, ""), 10)
        }
      }
      if (lines.length >= 4) {
        auction.status = lines[3]
      }

      auction.rawData!.vehicleLines = lines
    }
  }

  // Parse first registration date cell
  const dateCell = cells.filter(".dateCell").first()
  if (dateCell.length) {
    const dateText = dateCell.text().trim()
    const dateMatch = dateText.match(/(\d{2})-(\d{2})-(\d{4})/)
    if (dateMatch) {
      auction.year = parseInt(dateMatch[3], 10)
      auction.rawData!.firstRegistration = dateText
    }
  }

  // Parse DIV cell (technical specs)
  const divCell = cells.filter(".bigScreenOnly").not(".dateCell").first()
  if (divCell.length) {
    const divText = divCell.find("p").html() || ""
    const divLines = divText
      .split(/<br\s*\/?>/gi)
      .map((line) => cheerio.load(`<span>${line}</span>`)("span").text().trim())
      .filter((line) => line.length > 0)

    if (divLines.length >= 1) {
      auction.fuelType = divLines[0]
    }
    if (divLines.length >= 2) {
      const ccMatch = divLines[1].match(/(\d+)\s*cc/i)
      if (ccMatch) {
        auction.engineCc = parseInt(ccMatch[1], 10)
      }
    }
    if (divLines.length >= 3) {
      const kwMatch = divLines[2].match(/(\d+)\s*kw/i)
      if (kwMatch) {
        auction.power = parseInt(kwMatch[1], 10)
      }
    }
    if (divLines.length >= 4) {
      const co2Match = divLines[3].match(/(\d+)\s*gr/i)
      if (co2Match) {
        auction.co2 = parseInt(co2Match[1], 10)
      }
    }

    auction.rawData!.divLines = divLines
  }

  // Parse location cell
  const locationCell = cells.filter(".bigScreenOnly").not(".dateCell").eq(1)
  if (locationCell.length) {
    const locationHtml = locationCell.find("p").html() || ""
    const locationLines = locationHtml
      .split(/<br\s*\/?>/gi)
      .map((line) => cheerio.load(`<span>${line}</span>`)("span").text().trim())
      .filter((line) => line.length > 0)

    if (locationLines.length > 0) {
      auction.location = {
        name: locationLines[0],
        address: locationLines[1] || "",
        postalCity: locationLines[2] || "",
        country: locationLines[3] || "",
      }
    }
  }

  // Parse expiration date cell
  const expirationCell = cells.filter(".bigScreenOnly.dateCell").last()
  if (expirationCell.length) {
    auction.expirationDate = expirationCell.text().trim()
  }

  return auction
}

/**
 * Parse a single auction item (fallback)
 */
function parseAuctionItem(
  $: CheerioRoot,
  element: CheerioSelection
): ListAuctionItem | null {
  const auction: ListAuctionItem = {
    auctionId: "",
    rawData: {},
  }

  // Try to extract auction ID
  const idSelectors = [
    "data-auction-id",
    "data-id",
    "data-vehicle-id",
    "id",
    "data-ref",
  ]

  for (const attr of idSelectors) {
    const id = element.attr(attr)
    if (id) {
      auction.auctionId = id
      break
    }
  }

  // If no ID from attribute, try to find in links
  if (!auction.auctionId) {
    const link = element.find('a[href*="auction_id"]').attr("href")
    if (link) {
      const match = link.match(/auction_id=([A-Z0-9]+)/i)
      if (match) {
        auction.auctionId = match[1]
      }
    }
  }

  // If still no ID, look for pattern like BE250937699
  if (!auction.auctionId) {
    const text = element.text()
    const match = text.match(/BE\d{9,}/)
    if (match) {
      auction.auctionId = match[0]
    }
  }

  // Extract thumbnail URL
  const img = element.find("img").first()
  if (img.length) {
    auction.thumbnailUrl = img.attr("src") || img.attr("data-src")
  }

  return auction.auctionId ? auction : null
}

/**
 * Parse auction detail HTML (from paid endpoint)
 */
export function parseAuctionDetail(html: string): Record<string, unknown> {
  const $ = cheerio.load(html)
  const detail: Record<string, unknown> = {}

  // Look for VIN
  const vinPatterns = [
    /VIN[:\s]*([A-HJ-NPR-Z0-9]{17})/i,
    /Chassis[:\s]*([A-HJ-NPR-Z0-9]{17})/i,
  ]

  const pageText = $("body").text()
  for (const pattern of vinPatterns) {
    const match = pageText.match(pattern)
    if (match) {
      detail.vin = match[1]
      break
    }
  }

  // Extract all labeled fields
  $("dt, .label, .field-label, th").each((_: number, el: CheerioElement) => {
    const label = $(el)
      .text()
      .trim()
      .toLowerCase()
      .replace(/[:\s]+$/, "")
    const value = $(el).next().text().trim()
    if (label && value) {
      detail[label] = value
    }
  })

  // Extract all images
  const images: string[] = []
  $("img").each((_: number, img: CheerioElement) => {
    const src = $(img).attr("src") || $(img).attr("data-src")
    if (src && !src.includes("logo") && !src.includes("icon")) {
      images.push(
        src.startsWith("http") ? src : `${crawlerConfig.ivo.baseUrl}${src}`
      )
    }
  })
  detail.images = images

  return detail
}
