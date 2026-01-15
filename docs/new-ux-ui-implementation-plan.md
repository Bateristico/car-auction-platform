# Plan: High-Octane Premium UX/UI Overhaul

## Overview
Transform Samochody.be from a "generic directory" to a sophisticated, data-driven enthusiast marketplace with dark mode, Racing Yellow accents, and an "Auction Command Center" experience.

---

## Phase 1: Visual System Foundation

### 1.1 Theme Variables (`src/app/globals.css`)
Update CSS variables for dark mode:
- **Background:** Carbon Black `hsl(0 0% 7%)` (#121212)
- **Primary:** Racing Yellow `hsl(51 100% 50%)` (#FFD700)
- **Trust:** Electric Blue `hsl(211 100% 50%)` (#007BFF)
- **Text:** Light `hsl(0 0% 95%)`
- **Cards:** Slightly lighter dark `hsl(0 0% 10%)`

Add new animations:
- `animate-bid-pulse` - Scale pulse for bid updates
- `animate-live-pulse` - Glowing pulse for live badges
- `glass-dark` utility - Frosted glass effect for widgets

### 1.2 Typography (`src/app/[locale]/layout.tsx`)
Add Google Fonts:
- **Montserrat** (Headlines) - weights 500-800
- **Inter** (Body) - existing
- **JetBrains Mono** (Timers/Numbers)

---

## Phase 2: Core Component Updates

### 2.1 Button Variants (`src/components/ui/button.tsx`)
Add new variants:
- `bid` - Racing Yellow with shadow, active scale effect
- `trust` - Electric Blue for verified badges
- `glass` - Transparent with backdrop blur

### 2.2 Badge Updates (`src/components/ui/badge.tsx`)
Add variants:
- `live` - Racing Yellow with pulse animation
- `trust` - Electric Blue

---

## Phase 3: New Components to Create

| Component | Path | Purpose |
|-----------|------|---------|
| `CountdownTimer` | `src/components/ui/countdown-timer.tsx` | Mono font timer with urgency states |
| `LiveBadge` | `src/components/ui/live-badge.tsx` | Pulsing live indicator |
| `VerifiedBadge` | `src/components/ui/verified-badge.tsx` | Trust badge |
| `AuctionDataCard` | `src/components/auctions/auction-data-card.tsx` | Enhanced card with live state |
| `VitalsTable` | `src/components/auctions/vitals-table.tsx` | Specs grid with VIN copy |
| `ImageLightbox` | `src/components/auctions/image-lightbox.tsx` | Fullscreen gallery |
| `StickyBidWidget` | `src/components/auctions/sticky-bid-widget.tsx` | Sticky bidding panel |
| `QuickBidButtons` | `src/components/auctions/quick-bid-buttons.tsx` | +500, +1K increment buttons |
| `HeroFeaturedAuction` | `src/components/home/hero-featured-auction.tsx` | Cinematic hero section |
| `LiveTicker` | `src/components/home/live-ticker.tsx` | Scrolling recent bids |

---

## Phase 4: Homepage Overhaul (`src/app/[locale]/(main)/page.tsx`)

**New Structure:**
1. **Cinematic Hero** - Full-width with featured auction, live bid, countdown
2. **Live Ticker** - Horizontal scrolling recent bids
3. **At-a-Glance Grid** - 4-col data cards with live badges
4. **Stats Dashboard** - Dark cards with animated counters
5. **How It Works** - 3-step visual process

---

## Phase 5: Auction Detail Page ("Command Center")

**File:** `src/app/[locale]/(main)/auctions/[id]/auction-detail.tsx`

**2-Column Layout:**
- **Left (70%):** Immersive gallery + lightbox, Vitals table, Specs tabs
- **Right (30%):** Sticky bidding widget that follows scroll

**Sticky Bid Widget Features:**
- Current bid display (large, yellow)
- Quick increment buttons (+500, +1K, +5K PLN)
- Custom amount input
- Place Bid button
- Countdown timer with urgency coloring
- Sniping protection warning

---

## Phase 6: Header/Footer Redesign

### Header (`src/components/layout/header.tsx`)
- Transparent on hero, solid with blur on scroll
- Logo with yellow accent
- Underline animation on nav links
- Mobile: Full-screen dark menu

### Footer (`src/components/layout/footer.tsx`)
- Dark background with subtle gradient
- 4-column layout
- Social links + newsletter

---

## Phase 7: Auction Card Redesign

**File:** `src/components/auctions/auction-card.tsx` → New `auction-data-card.tsx`

**Card Layout:**
```
┌────────────────────────────┐
│ [LIVE]           [♡ Watch] │
│                            │
│      (16:10 Image)         │
│                            │
│  ───────── 02:34:15 ────── │
├────────────────────────────┤
│ 2024 BMW M3 Competition    │
│ 2023 • 12,500 km • Petrol  │
├────────────────────────────┤
│ 45,000 PLN     [Bid Now]   │
└────────────────────────────┘
```

---

## Phase 8: UX Logic Improvements

### Sniping Protection
- Backend: Extend timer by 2 min if bid in final 2 min
- Frontend: Show warning, flash when extended

### Micro-Interactions
- Bid pulse animation on price update
- Card hover: lift + border highlight
- Button active: scale 0.98
- Link hover: underline slide animation

---

## Phase 9: Translation Updates

**Files:** `src/messages/en.json`, `src/messages/pl.json`

New keys: live, watchlist, quickBid, snipeProtection, copyVin, verifiedSeller, bidIncrements, howItWorks steps

---

## Phase 10: Playwright E2E Tests

**File:** `e2e/premium-ui.spec.ts`

Tests to write:
1. Dark background verification
2. Racing Yellow primary color
3. Hero section visibility
4. Auction cards with live badges
5. Sticky bid widget behavior
6. VIN copy functionality
7. Lightbox opening
8. Mobile responsive layout
9. Sniping protection warning
10. Focus states accessibility

---

## Phase 11: Mock Examples (`docs/mocks/mock.tsx`)

Create a reference mock file showing:
- Color palette examples with hex codes
- Typography samples (Montserrat, Inter, JetBrains Mono)
- Button variants (default, bid, trust, glass)
- Badge variants (live, trust, warning)
- Card layout mockup
- Sticky widget mockup
- Animation demos (bid-pulse, live-pulse)

This serves as a visual reference and documentation for the design system.

---

## Files to Modify (In Order)

1. `src/app/globals.css` - Theme variables + animations
2. `src/app/[locale]/layout.tsx` - Font imports
3. `src/components/ui/button.tsx` - New variants
4. `src/components/ui/badge.tsx` - Live/trust variants
5. Create new components (Phase 3 table)
6. `src/components/layout/header.tsx` - Redesign
7. `src/components/layout/footer.tsx` - Redesign
8. `src/app/[locale]/(main)/page.tsx` - Homepage
9. `src/components/auctions/auction-card.tsx` - Enhance or create new
10. `src/app/[locale]/(main)/auctions/[id]/auction-detail.tsx` - Command Center
11. `src/messages/en.json` + `src/messages/pl.json` - Translations
12. `e2e/premium-ui.spec.ts` - Tests
13. `docs/mocks/mock.tsx` - Component mock examples for reference

---

## Verification

1. **Visual:** Dark theme with yellow accents renders correctly
2. **Responsive:** Works on mobile (375px), tablet (768px), desktop (1280px+)
3. **Functionality:** Bidding still works, countdown timers accurate
4. **i18n:** Both Polish and English display correctly
5. **Playwright:** All E2E tests pass
6. **Performance:** No significant render time increase
