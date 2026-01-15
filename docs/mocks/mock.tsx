/**
 * Design System Mock Examples
 * Samochody.be - High-Octane Premium Theme
 *
 * This file serves as a visual reference and documentation for the design system.
 * It contains examples of all colors, typography, components, and animations.
 */

// =============================================================================
// COLOR PALETTE
// =============================================================================

export const colorPalette = {
  // Core Colors
  background: {
    name: "Carbon Black",
    value: "hsl(0 0% 7%)",
    hex: "#121212",
    usage: "Primary background color for dark theme",
  },
  foreground: {
    name: "Light Text",
    value: "hsl(0 0% 95%)",
    hex: "#F2F2F2",
    usage: "Primary text color",
  },
  primary: {
    name: "Racing Yellow",
    value: "hsl(51 100% 50%)",
    hex: "#FFD700",
    usage: "Primary accent, bid buttons, live badges, CTAs",
  },
  trust: {
    name: "Electric Blue",
    value: "hsl(211 100% 50%)",
    hex: "#007BFF",
    usage: "Verified badges, trust indicators, secondary accent",
  },

  // Surface Colors
  card: {
    name: "Card Surface",
    value: "hsl(0 0% 10%)",
    hex: "#1A1A1A",
    usage: "Card backgrounds, elevated surfaces",
  },
  muted: {
    name: "Muted Surface",
    value: "hsl(0 0% 15%)",
    hex: "#262626",
    usage: "Muted backgrounds, disabled states",
  },
  border: {
    name: "Border",
    value: "hsl(0 0% 20%)",
    hex: "#333333",
    usage: "Borders, dividers",
  },

  // Semantic Colors
  destructive: {
    name: "Destructive Red",
    value: "hsl(0 84% 60%)",
    hex: "#EF4444",
    usage: "Errors, destructive actions, warnings",
  },
  success: {
    name: "Success Green",
    value: "hsl(142 76% 36%)",
    hex: "#22C55E",
    usage: "Success states, confirmations",
  },
  warning: {
    name: "Warning Amber",
    value: "hsl(38 92% 50%)",
    hex: "#F59E0B",
    usage: "Warning states, urgent notices",
  },

  // Urgency States (Countdown Timer)
  urgency: {
    normal: {
      name: "Normal",
      value: "hsl(0 0% 95%)",
      hex: "#F2F2F2",
      usage: "Countdown with > 1 hour remaining",
    },
    urgent: {
      name: "Urgent",
      value: "hsl(38 92% 50%)",
      hex: "#F59E0B",
      usage: "Countdown with < 1 hour remaining",
    },
    critical: {
      name: "Critical",
      value: "hsl(0 84% 60%)",
      hex: "#EF4444",
      usage: "Countdown with < 2 minutes remaining (snipe warning)",
    },
  },
}

// =============================================================================
// TYPOGRAPHY
// =============================================================================

export const typography = {
  fonts: {
    display: {
      name: "Montserrat",
      variable: "--font-display",
      weights: [500, 600, 700, 800],
      usage: "Headlines, titles, brand elements",
      example: "font-display font-bold text-4xl",
    },
    body: {
      name: "Inter",
      variable: "--font-sans",
      weights: [400, 500, 600, 700],
      usage: "Body text, descriptions, UI elements",
      example: "font-sans text-base",
    },
    mono: {
      name: "JetBrains Mono",
      variable: "--font-mono",
      weights: [400, 500, 600, 700],
      usage: "Countdown timers, prices, VINs, technical data",
      example: "font-mono text-2xl tabular-nums",
    },
  },

  scale: {
    xs: "0.75rem", // 12px
    sm: "0.875rem", // 14px
    base: "1rem", // 16px
    lg: "1.125rem", // 18px
    xl: "1.25rem", // 20px
    "2xl": "1.5rem", // 24px
    "3xl": "1.875rem", // 30px
    "4xl": "2.25rem", // 36px
    "5xl": "3rem", // 48px
    "6xl": "3.75rem", // 60px
  },
}

// =============================================================================
// BUTTON VARIANTS
// =============================================================================

export const buttonVariants = {
  default: {
    description: "Standard button for general actions",
    className: "bg-primary text-primary-foreground hover:bg-primary/90",
    example: "<Button>Default Button</Button>",
  },
  bid: {
    description: "Primary CTA for bidding actions - Racing Yellow with shadow",
    className:
      "bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:bg-primary/90 hover:shadow-xl active:scale-[0.98] font-bold",
    example: '<Button variant="bid">Place Bid</Button>',
  },
  trust: {
    description: "Trust/verification actions - Electric Blue",
    className:
      "bg-[hsl(211_100%_50%)] text-white shadow-md hover:bg-[hsl(211_100%_45%)]",
    example: '<Button variant="trust">Verify Now</Button>',
  },
  glass: {
    description: "Glass morphism button for overlays",
    className:
      "bg-background/50 backdrop-blur-md border border-border/50 hover:bg-background/70 hover:border-primary/30",
    example: '<Button variant="glass">Glass Button</Button>',
  },
  outline: {
    description: "Outlined button for secondary actions",
    className:
      "border border-input bg-background hover:bg-accent hover:text-accent-foreground",
    example: '<Button variant="outline">Outline</Button>',
  },
  ghost: {
    description: "Minimal button for tertiary actions",
    className: "hover:bg-accent hover:text-accent-foreground",
    example: '<Button variant="ghost">Ghost</Button>',
  },
  destructive: {
    description: "Destructive/danger actions",
    className:
      "bg-destructive text-destructive-foreground hover:bg-destructive/90",
    example: '<Button variant="destructive">Delete</Button>',
  },
}

// =============================================================================
// BADGE VARIANTS
// =============================================================================

export const badgeVariants = {
  default: {
    description: "Standard badge",
    className: "border-transparent bg-primary text-primary-foreground",
    example: "<Badge>Default</Badge>",
  },
  live: {
    description: "Live auction indicator with pulse animation",
    className:
      "border-transparent bg-primary text-primary-foreground shadow-md animate-live-pulse font-bold uppercase tracking-wider",
    example: '<Badge variant="live">LIVE</Badge>',
  },
  trust: {
    description: "Verified/trust badge - Electric Blue",
    className:
      "border-transparent bg-[hsl(211_100%_50%)] text-white shadow hover:bg-[hsl(211_100%_45%)]",
    example: '<Badge variant="trust">Verified</Badge>',
  },
  muted: {
    description: "Muted badge for secondary information",
    className: "border-border/50 bg-muted/50 text-muted-foreground",
    example: '<Badge variant="muted">Info</Badge>',
  },
  secondary: {
    description: "Secondary badge",
    className: "border-transparent bg-secondary text-secondary-foreground",
    example: '<Badge variant="secondary">Secondary</Badge>',
  },
  destructive: {
    description: "Warning/error badge",
    className: "border-transparent bg-destructive text-destructive-foreground",
    example: '<Badge variant="destructive">Error</Badge>',
  },
  outline: {
    description: "Outlined badge",
    className: "text-foreground",
    example: '<Badge variant="outline">Outline</Badge>',
  },
}

// =============================================================================
// ANIMATIONS
// =============================================================================

export const animations = {
  bidPulse: {
    name: "animate-bid-pulse",
    description: "Scale pulse for bid updates and price changes",
    keyframes: `
      @keyframes bid-pulse {
        0%, 100% { transform: scale(1); }
        50% { transform: scale(1.05); }
      }
    `,
    usage: "Apply to price when a new bid is placed",
    duration: "300ms",
  },
  livePulse: {
    name: "animate-live-pulse",
    description: "Glowing pulse for live auction badges",
    keyframes: `
      @keyframes live-pulse {
        0%, 100% {
          box-shadow: 0 0 0 0 rgba(255, 215, 0, 0.4);
        }
        50% {
          box-shadow: 0 0 0 8px rgba(255, 215, 0, 0);
        }
      }
    `,
    usage: "Apply to live badges and indicators",
    duration: "2s infinite",
  },
  tickerScroll: {
    name: "ticker-scroll",
    description: "Continuous horizontal scroll for live ticker",
    keyframes: `
      @keyframes ticker-scroll {
        0% { transform: translateX(0); }
        100% { transform: translateX(-50%); }
      }
    `,
    usage: "Apply to ticker content container",
    duration: "30s linear infinite",
  },
  shimmer: {
    name: "animate-shimmer",
    description: "Loading shimmer effect",
    keyframes: `
      @keyframes shimmer {
        0% { background-position: -200% 0; }
        100% { background-position: 200% 0; }
      }
    `,
    usage: "Apply to skeleton loaders",
  },
}

// =============================================================================
// GLASS MORPHISM
// =============================================================================

export const glassMorphism = {
  dark: {
    name: "glass-dark",
    description: "Dark glass effect for overlays and widgets",
    className: "bg-background/80 backdrop-blur-xl border border-border/30",
    usage: "Sticky widgets, dropdowns, modals",
  },
  light: {
    name: "glass-light",
    description: "Light glass effect",
    className: "bg-white/10 backdrop-blur-md border border-white/20",
    usage: "Overlays on images",
  },
}

// =============================================================================
// COMPONENT LAYOUT EXAMPLES
// =============================================================================

/**
 * AUCTION DATA CARD LAYOUT
 *
 * +------------------------------------+
 * | [LIVE]                    [Heart]  |
 * |                                    |
 * |         (16:10 Image)              |
 * |                                    |
 * |  ----------- 02:34:15 ------------ |
 * +------------------------------------+
 * | 2024 BMW M3 Competition            |
 * | 2023 - 12,500 km - Petrol          |
 * +------------------------------------+
 * | 45,000 PLN              [Bid Now]  |
 * +------------------------------------+
 */
export const AuctionCardLayout = {
  description: "Enhanced auction card with live state, countdown, and specs",
  structure: `
<div class="card overflow-hidden">
  <!-- Image Section -->
  <div class="relative aspect-[16/10]">
    <Image />
    <Badge variant="live">LIVE</Badge>
    <Button variant="ghost" class="watchlist">Heart Icon</Button>
    <div class="countdown-overlay">02:34:15</div>
  </div>

  <!-- Content Section -->
  <div class="p-4 space-y-3">
    <h3 class="font-display font-semibold">2024 BMW M3 Competition</h3>
    <div class="specs flex gap-2 text-muted-foreground">
      <span>2023</span>
      <span>-</span>
      <span>12,500 km</span>
      <span>-</span>
      <span>Petrol</span>
    </div>
  </div>

  <!-- Footer Section -->
  <div class="p-4 pt-0 flex justify-between items-center">
    <span class="font-mono text-xl font-bold text-primary">45,000 PLN</span>
    <Button variant="bid" size="sm">Bid Now</Button>
  </div>
</div>
  `,
}

/**
 * STICKY BID WIDGET LAYOUT
 *
 * +----------------------------------+
 * |        CURRENT BID               |
 * |      45,000 PLN                  |
 * |      Up Arrow 23 bids            |
 * |----------------------------------|
 * |  [+500] [+1,000] [+5,000]        |
 * |----------------------------------|
 * |  Custom:  [___________] PLN      |
 * |----------------------------------|
 * |  [        PLACE BID         ]    |
 * |----------------------------------|
 * |         02:34:15                 |
 * |    Warning: Snipe protection     |
 * +----------------------------------+
 */
export const StickyBidWidgetLayout = {
  description: "Glass morphism sticky bidding panel for auction detail page",
  structure: `
<div class="glass-dark sticky top-20 rounded-2xl p-6 space-y-6">
  <!-- Current Bid -->
  <div class="text-center">
    <p class="text-muted-foreground text-sm uppercase">Current Bid</p>
    <p class="font-mono text-4xl font-bold text-primary">45,000 PLN</p>
    <p class="text-muted-foreground text-sm">23 bids</p>
  </div>

  <Separator />

  <!-- Quick Bid Buttons -->
  <div class="grid grid-cols-3 gap-2">
    <Button variant="outline">+500</Button>
    <Button variant="outline">+1,000</Button>
    <Button variant="outline">+5,000</Button>
  </div>

  <!-- Custom Amount -->
  <div class="flex gap-2">
    <Input type="number" placeholder="Custom amount" />
    <span class="text-muted-foreground">PLN</span>
  </div>

  <!-- Place Bid Button -->
  <Button variant="bid" size="xl" class="w-full">Place Bid</Button>

  <Separator />

  <!-- Countdown -->
  <div class="text-center">
    <CountdownTimer endDate={endDate} />
    <p class="text-destructive text-sm mt-2">
      Warning: Snipe protection - bids in final 2 min extend timer
    </p>
  </div>
</div>
  `,
}

/**
 * HERO FEATURED AUCTION LAYOUT
 *
 * +------------------------------------------------------------+
 * |                                                            |
 * |  [LIVE] [Featured Auction]                                 |
 * |                                                            |
 * |  2024 BMW                                                  |
 * |  M3 Competition                                            |
 * |                                                            |
 * |  CURRENT BID              ENDS IN                          |
 * |  45,000 PLN               02:34:15                         |
 * |                                                            |
 * |  [Place Bid]  [View Gallery]                               |
 * |                                                            |
 * |------------------------------------------------------------|
 * +------------------------------------------------------------+
 */
export const HeroSectionLayout = {
  description: "Cinematic full-bleed hero section with featured auction",
  structure: `
<section class="relative min-h-[80vh] flex items-center">
  <!-- Background -->
  <div class="absolute inset-0">
    <Image fill class="object-cover" />
    <div class="absolute inset-0 bg-gradient-to-r from-background via-background/90 to-background/40" />
    <div class="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent" />
  </div>

  <!-- Content -->
  <div class="container relative z-10">
    <div class="max-w-2xl space-y-6">
      <!-- Badges -->
      <div class="flex gap-3">
        <LiveBadge />
        <Badge variant="muted">Featured Auction</Badge>
      </div>

      <!-- Title -->
      <div>
        <p class="text-lg text-muted-foreground">2024 BMW</p>
        <h1 class="font-display text-5xl font-bold">M3 Competition</h1>
      </div>

      <!-- Price & Countdown -->
      <div class="flex gap-8">
        <div>
          <p class="text-sm text-muted-foreground uppercase">Current Bid</p>
          <p class="font-display text-5xl font-bold text-primary">45,000 PLN</p>
        </div>
        <div>
          <p class="text-sm text-muted-foreground uppercase">Ends In</p>
          <CountdownTimer class="text-4xl font-bold" />
        </div>
      </div>

      <!-- CTAs -->
      <div class="flex gap-4">
        <Button variant="bid" size="xl">Place Bid</Button>
        <Button variant="glass" size="xl">View Gallery</Button>
      </div>
    </div>
  </div>

  <!-- Decorative Border -->
  <div class="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-primary/50 to-transparent" />
</section>
  `,
}

// =============================================================================
// RESPONSIVE BREAKPOINTS
// =============================================================================

export const breakpoints = {
  sm: "640px", // Mobile landscape
  md: "768px", // Tablet
  lg: "1024px", // Desktop
  xl: "1280px", // Large desktop
  "2xl": "1536px", // Extra large
}

// =============================================================================
// SPACING & SIZING TOKENS
// =============================================================================

export const spacing = {
  container: {
    default: "max-w-7xl mx-auto px-4 sm:px-6 lg:px-8",
    narrow: "max-w-4xl mx-auto px-4 sm:px-6 lg:px-8",
    wide: "max-w-screen-2xl mx-auto px-4 sm:px-6 lg:px-8",
  },
  section: {
    default: "py-16 md:py-24",
    compact: "py-8 md:py-12",
  },
  card: {
    padding: "p-4 md:p-6",
    gap: "gap-4 md:gap-6",
  },
}

// =============================================================================
// Z-INDEX SCALE
// =============================================================================

export const zIndex = {
  dropdown: 50,
  sticky: 40,
  fixed: 50,
  modal: 50,
  tooltip: 60,
}

// =============================================================================
// BORDER RADIUS TOKENS
// =============================================================================

export const borderRadius = {
  sm: "0.125rem", // 2px
  DEFAULT: "0.25rem", // 4px
  md: "0.375rem", // 6px
  lg: "0.5rem", // 8px
  xl: "0.75rem", // 12px
  "2xl": "1rem", // 16px
  "3xl": "1.5rem", // 24px
  full: "9999px",
}

// =============================================================================
// SHADOW TOKENS
// =============================================================================

export const shadows = {
  sm: "0 1px 2px 0 rgb(0 0 0 / 0.05)",
  DEFAULT: "0 1px 3px 0 rgb(0 0 0 / 0.1), 0 1px 2px -1px rgb(0 0 0 / 0.1)",
  md: "0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)",
  lg: "0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)",
  xl: "0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)",
  primary: "0 4px 14px 0 rgba(255, 215, 0, 0.3)", // Racing Yellow glow
  trust: "0 4px 14px 0 rgba(0, 123, 255, 0.3)", // Electric Blue glow
}

// =============================================================================
// USAGE EXAMPLES
// =============================================================================

export const usageExamples = {
  // Headline with display font
  headline: 'font-display font-bold text-4xl md:text-5xl lg:text-6xl',

  // Monospace price display
  price: 'font-mono text-2xl md:text-4xl font-bold text-primary tabular-nums',

  // Countdown timer
  countdown: 'font-mono text-xl md:text-2xl tabular-nums tracking-tight',

  // Card with glass effect
  glassCard: 'glass-dark rounded-2xl p-6 shadow-lg',

  // Primary CTA button
  ctaButton: 'bg-primary text-primary-foreground shadow-lg shadow-primary/30 hover:shadow-xl active:scale-[0.98]',

  // Live badge with animation
  liveBadge: 'bg-primary text-primary-foreground animate-live-pulse font-bold uppercase tracking-wider',
}
