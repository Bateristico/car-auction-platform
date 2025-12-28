import { NextResponse } from "next/server"

/**
 * Health Check Endpoint
 * Used by Docker and DigitalOcean for container health monitoring
 */
export async function GET() {
  return NextResponse.json(
    {
      status: "healthy",
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || "1.0.0",
    },
    { status: 200 }
  )
}
