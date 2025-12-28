/**
 * Image Utilities
 *
 * Handles placeholder detection and image validation for IVO images.
 * The IVO server returns a consistent placeholder image (~21,396 bytes)
 * when no image exists for a given photo index.
 */

// Known placeholder characteristics (determined empirically)
// The placeholder image is consistently around 21,396 bytes
const PLACEHOLDER_SIZE_MIN = 20000
const PLACEHOLDER_SIZE_MAX = 23000

/**
 * Check if a buffer contains a placeholder image
 *
 * The IVO server returns a placeholder image when the requested
 * photo index doesn't exist. This placeholder has a consistent size
 * of approximately 21,396 bytes.
 */
export function isPlaceholderImage(buffer: Buffer): boolean {
  const size = buffer.byteLength
  return size >= PLACEHOLDER_SIZE_MIN && size <= PLACEHOLDER_SIZE_MAX
}

/**
 * Validate that a buffer contains a valid image
 *
 * Checks for JPEG or PNG magic bytes at the start of the buffer.
 * This helps detect when the server returns HTML (e.g., auth redirect)
 * instead of an actual image.
 */
export function isValidImage(buffer: Buffer): boolean {
  if (!buffer || buffer.byteLength < 10) {
    return false
  }

  // Check JPEG magic bytes: FF D8 FF
  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return true
  }

  // Check PNG magic bytes: 89 50 4E 47 0D 0A 1A 0A
  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return true
  }

  return false
}

/**
 * Get image format from buffer
 */
export function getImageFormat(buffer: Buffer): "jpeg" | "png" | "unknown" {
  if (!buffer || buffer.byteLength < 10) {
    return "unknown"
  }

  if (buffer[0] === 0xff && buffer[1] === 0xd8 && buffer[2] === 0xff) {
    return "jpeg"
  }

  if (
    buffer[0] === 0x89 &&
    buffer[1] === 0x50 &&
    buffer[2] === 0x4e &&
    buffer[3] === 0x47
  ) {
    return "png"
  }

  return "unknown"
}
