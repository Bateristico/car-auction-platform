/**
 * Retry utility for crawler operations with exponential backoff
 * Handles 5XX errors and session expiration automatically
 */

import { crawlerLogger } from "./logger"

// Error types for crawler operations
export const CrawlerErrorCode = {
  SESSION_EXPIRED: "SESSION_EXPIRED",
  SERVER_ERROR: "SERVER_ERROR",
  BROWSER_NOT_INSTALLED: "BROWSER_NOT_INSTALLED",
  SCRAPE_FAILED: "SCRAPE_FAILED",
  MAX_RETRIES_EXCEEDED: "MAX_RETRIES_EXCEEDED",
  NETWORK_ERROR: "NETWORK_ERROR",
} as const

export type CrawlerErrorCodeType = (typeof CrawlerErrorCode)[keyof typeof CrawlerErrorCode]

export class CrawlerError extends Error {
  code: CrawlerErrorCodeType
  retryable: boolean
  statusCode?: number
  retryAfterMs?: number

  constructor(
    message: string,
    code: CrawlerErrorCodeType,
    options?: {
      retryable?: boolean
      statusCode?: number
      retryAfterMs?: number
    }
  ) {
    super(message)
    this.name = "CrawlerError"
    this.code = code
    this.retryable = options?.retryable ?? false
    this.statusCode = options?.statusCode
    this.retryAfterMs = options?.retryAfterMs
  }
}

export interface RetryOptions {
  maxRetries?: number
  baseDelayMs?: number
  maxDelayMs?: number
  onSessionExpired?: () => Promise<void>
  context?: string // For logging
}

const DEFAULT_OPTIONS: Required<Omit<RetryOptions, "onSessionExpired" | "context">> = {
  maxRetries: 3,
  baseDelayMs: 1000,
  maxDelayMs: 10000,
}

/**
 * Check if an HTTP status code indicates a server error (5XX)
 */
export function isServerError(statusCode: number): boolean {
  return statusCode >= 500 && statusCode < 600
}

/**
 * Check if an HTTP status code indicates session expiration
 */
export function isSessionExpiredStatus(statusCode: number): boolean {
  return statusCode === 401 || statusCode === 403
}

/**
 * Check if a URL indicates a redirect to login page
 */
export function isLoginRedirect(url: string): boolean {
  const loginPatterns = [
    "/login",
    "/auth",
    "/signin",
    "/sign-in",
    "accounts.informex.be",
    "/oauth/authorize",
  ]
  const lowerUrl = url.toLowerCase()
  return loginPatterns.some((pattern) => lowerUrl.includes(pattern))
}

/**
 * Check if an error is retryable (network errors, timeouts, 5XX)
 */
export function isRetryableError(error: unknown): boolean {
  if (error instanceof CrawlerError) {
    return error.retryable
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    // Network-related errors
    if (
      message.includes("timeout") ||
      message.includes("econnreset") ||
      message.includes("econnrefused") ||
      message.includes("network") ||
      message.includes("socket") ||
      message.includes("fetch failed")
    ) {
      return true
    }
    // Server errors from status codes in message
    const statusMatch = message.match(/status[:\s]*(\d{3})/i)
    if (statusMatch) {
      const status = parseInt(statusMatch[1], 10)
      return isServerError(status)
    }
  }

  return false
}

/**
 * Check if an error indicates session expiration
 */
export function isSessionExpiredError(error: unknown): boolean {
  if (error instanceof CrawlerError) {
    return error.code === CrawlerErrorCode.SESSION_EXPIRED
  }

  if (error instanceof Error) {
    const message = error.message.toLowerCase()
    return (
      message.includes("session expired") ||
      message.includes("unauthorized") ||
      message.includes("not authenticated") ||
      message.includes("login required")
    )
  }

  return false
}

/**
 * Calculate delay with exponential backoff and jitter
 */
function calculateBackoff(attempt: number, baseDelayMs: number, maxDelayMs: number): number {
  // Exponential backoff: baseDelay * 2^attempt
  const exponentialDelay = baseDelayMs * Math.pow(2, attempt)
  // Add jitter (random 0-25% of delay)
  const jitter = exponentialDelay * Math.random() * 0.25
  // Cap at maxDelay
  return Math.min(exponentialDelay + jitter, maxDelayMs)
}

/**
 * Sleep for a specified duration
 */
function sleep(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Execute an operation with retry logic and exponential backoff
 * Automatically handles session expiration and 5XX errors
 */
export async function withRetry<T>(
  operation: () => Promise<T>,
  options: RetryOptions = {}
): Promise<T> {
  const { maxRetries, baseDelayMs, maxDelayMs } = { ...DEFAULT_OPTIONS, ...options }
  const { onSessionExpired, context } = options

  let lastError: Error | undefined
  let sessionRefreshed = false

  for (let attempt = 0; attempt <= maxRetries; attempt++) {
    try {
      return await operation()
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error))

      const isLastAttempt = attempt === maxRetries
      const logContext = context ? `[${context}]` : ""

      // Check for session expiration
      if (isSessionExpiredError(error) && onSessionExpired && !sessionRefreshed) {
        crawlerLogger.warn(`${logContext} Session expired, attempting to refresh...`)
        try {
          await onSessionExpired()
          sessionRefreshed = true
          crawlerLogger.info(`${logContext} Session refreshed successfully, retrying operation...`)
          // Don't count this as a retry attempt, just retry immediately
          attempt--
          continue
        } catch (refreshError) {
          crawlerLogger.error(`${logContext} Failed to refresh session: ${refreshError}`)
          throw new CrawlerError(
            "Failed to refresh expired session",
            CrawlerErrorCode.SESSION_EXPIRED,
            { retryable: false }
          )
        }
      }

      // Check if we should retry
      if (!isLastAttempt && isRetryableError(error)) {
        const delay = calculateBackoff(attempt, baseDelayMs, maxDelayMs)
        crawlerLogger.warn(
          `${logContext} Attempt ${attempt + 1}/${maxRetries + 1} failed: ${lastError.message}. Retrying in ${Math.round(delay)}ms...`
        )
        await sleep(delay)
        continue
      }

      // If not retryable or last attempt, throw
      if (isLastAttempt && isRetryableError(error)) {
        crawlerLogger.error(
          `${logContext} All ${maxRetries + 1} attempts failed. Last error: ${lastError.message}`
        )
        throw new CrawlerError(
          `Max retries exceeded: ${lastError.message}`,
          CrawlerErrorCode.MAX_RETRIES_EXCEEDED,
          { retryable: false }
        )
      }

      // Non-retryable error, throw immediately
      throw error
    }
  }

  // Should not reach here, but TypeScript needs this
  throw lastError || new Error("Unknown error in retry loop")
}

/**
 * Parse HTTP response and throw appropriate CrawlerError if not successful
 */
export function checkResponseStatus(
  response: { ok: () => boolean; status: () => number; url: () => string } | null,
  context?: string
): void {
  if (!response) {
    throw new CrawlerError("No response received", CrawlerErrorCode.NETWORK_ERROR, {
      retryable: true,
    })
  }

  const status = response.status()
  const url = response.url()

  // Check for login redirect
  if (isLoginRedirect(url)) {
    throw new CrawlerError(
      `Redirected to login page: ${url}`,
      CrawlerErrorCode.SESSION_EXPIRED,
      { retryable: false, statusCode: status }
    )
  }

  // Check for session expiration status codes
  if (isSessionExpiredStatus(status)) {
    throw new CrawlerError(
      `Session expired (HTTP ${status})`,
      CrawlerErrorCode.SESSION_EXPIRED,
      { retryable: false, statusCode: status }
    )
  }

  // Check for server errors
  if (isServerError(status)) {
    throw new CrawlerError(
      `Server error (HTTP ${status})${context ? ` during ${context}` : ""}`,
      CrawlerErrorCode.SERVER_ERROR,
      { retryable: true, statusCode: status, retryAfterMs: 1000 }
    )
  }

  // Check for other non-OK responses
  if (!response.ok()) {
    throw new CrawlerError(
      `Request failed (HTTP ${status})${context ? ` during ${context}` : ""}`,
      CrawlerErrorCode.SCRAPE_FAILED,
      { retryable: false, statusCode: status }
    )
  }
}
