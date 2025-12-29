import { NextRequest, NextResponse } from "next/server"

/**
 * Health Check Endpoint
 * Used by Docker and DigitalOcean for container health monitoring
 */
export async function GET(request: NextRequest) {
  // Extract relevant headers for debugging
  const headers: Record<string, string> = {}
  const relevantHeaders = [
    "host",
    "x-forwarded-host",
    "x-forwarded-for",
    "x-forwarded-proto",
    "x-real-ip",
    "origin",
    "referer",
  ]

  for (const name of relevantHeaders) {
    const value = request.headers.get(name)
    if (value) {
      headers[name] = value
    }
  }

  return NextResponse.json(
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
      headers,
      env: {
        AUTH_URL: process.env.AUTH_URL || "(not set)",
        NEXTAUTH_URL: process.env.NEXTAUTH_URL || "(not set)",
        AUTH_TRUST_HOST: process.env.AUTH_TRUST_HOST || "(not set)",
      }
    },
    { status: 200 }
  )
}
