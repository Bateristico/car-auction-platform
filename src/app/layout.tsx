import type { Metadata } from "next"
import "./globals.css"

export const metadata: Metadata = {
  title: "Samochody.be - Find Your Next Car",
  description: "Bid on quality used cars from Switzerland. Daily auctions with 100+ new offers.",
  robots: {
    index: true,
    follow: true,
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return children
}
