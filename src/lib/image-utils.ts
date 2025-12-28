/**
 * Image info with URL and whether it needs to bypass Next.js image optimization
 */
export interface ImageInfo {
  url: string
  unoptimized: boolean
}

/**
 * Process image URL for display
 * Handles different image sources appropriately
 */
export function getProxiedImageUrl(url: string | null | undefined): ImageInfo {
  if (!url) {
    return { url: "/placeholder-car.svg", unoptimized: false }
  }

  // Unsplash images - use directly with Next.js optimization
  if (url.includes("unsplash.com")) {
    return { url, unoptimized: false }
  }

  // Cloudinary images - use directly with Next.js optimization
  if (url.includes("cloudinary.com")) {
    return { url, unoptimized: false }
  }

  // Local images in public folder
  if (url.startsWith("/")) {
    return { url, unoptimized: false }
  }

  // auta.ch images require proxying (though they may return HTML due to protection)
  if (url.startsWith("https://auta.ch/")) {
    return {
      url: `/api/image-proxy?url=${encodeURIComponent(url)}`,
      unoptimized: true,
    }
  }

  // Other external URLs - return as-is
  return { url, unoptimized: false }
}

/**
 * Parse images from the JSON string stored in the database
 */
export function parseImages(imagesJson: string | null | undefined): string[] {
  if (!imagesJson) return []

  try {
    const images = JSON.parse(imagesJson)
    return Array.isArray(images) ? images : []
  } catch {
    return []
  }
}

/**
 * Get the first image info from the images JSON, proxied if necessary
 */
export function getFirstImage(imagesJson: string | null | undefined): ImageInfo {
  const images = parseImages(imagesJson)
  return getProxiedImageUrl(images[0])
}

/**
 * Get all images info from the images JSON, proxied if necessary
 */
export function getAllImages(imagesJson: string | null | undefined): ImageInfo[] {
  const images = parseImages(imagesJson)
  return images.map(getProxiedImageUrl)
}

/**
 * Serialize images array to JSON string for database storage
 */
export function serializeImages(images: string[]): string {
  return JSON.stringify(images)
}
