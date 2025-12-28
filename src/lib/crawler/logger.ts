/**
 * Crawler Logger
 *
 * Simple logging utility for crawler operations.
 */

type LogLevel = "debug" | "info" | "warn" | "error" | "cost"

function formatTimestamp(): string {
  return new Date().toISOString()
}

function log(level: LogLevel, message: string, data?: unknown): void {
  const timestamp = formatTimestamp()
  const prefix = `[${timestamp}] [CRAWLER:${level.toUpperCase()}]`

  if (data !== undefined) {
    console.log(`${prefix} ${message}`, data)
  } else {
    console.log(`${prefix} ${message}`)
  }
}

export const crawlerLogger = {
  debug: (message: string, data?: unknown) => log("debug", message, data),
  info: (message: string, data?: unknown) => log("info", message, data),
  warn: (message: string, data?: unknown) => log("warn", message, data),
  error: (message: string, data?: unknown) => log("error", message, data),

  /**
   * Special log for cost-incurring operations
   */
  cost: (message: string, data?: unknown) => log("cost", message, data),

  /**
   * Log network request
   */
  network: (method: string, url: string, status?: number): void => {
    const statusStr = status ? ` -> ${status}` : ""
    console.log(`[CRAWLER:NET] ${method} ${url}${statusStr}`)
  },
}
