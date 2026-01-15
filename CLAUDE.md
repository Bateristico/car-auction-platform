# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Samochody.be - A vehicle auction platform for insurance and fleet vehicles built with Next.js 16, React 19, Prisma, and SQLite. Features sealed-bid auctions, admin panel, web crawler for IVO platform integration, and bilingual support (Polish/English).

## Development Commands

```bash
# Install dependencies
npm install

# Development server (hot reload)
npm run dev

# Production build and start
npm run build
npm start

# Linting
npm run lint

# Database operations
npm run db:generate   # Generate Prisma client
npm run db:push       # Push schema to database
npm run db:seed       # Seed with test data
npm run db:studio     # Open Prisma Studio GUI
npm run db:reset      # Reset and reseed database

# Docker
docker build -t cars-auction .
docker-compose up -d
```

## Test Accounts (from seed)

- Admin: `admin@samochody.be` / `admin123`
- User: `jan.kowalski@example.pl` / `user123`

## Architecture

### Tech Stack
- **Framework:** Next.js 16 (App Router) with React 19
- **Database:** SQLite via Prisma with better-sqlite3 adapter
- **Auth:** NextAuth v5 (JWT strategy) with Google OAuth and credentials
- **Styling:** Tailwind CSS 4 with shadcn/ui components
- **i18n:** next-intl (Polish default, English)
- **Crawler:** Playwright for IVO platform scraping
- **Email:** Resend for bid notifications

### Directory Structure

```
src/
├── app/
│   ├── api/              # API routes
│   │   ├── admin/        # Protected admin endpoints (auctions, crawler, import)
│   │   ├── auctions/     # Public auction endpoints
│   │   └── auth/         # NextAuth handlers
│   └── [locale]/         # i18n routing (pl, en)
│       ├── (admin)/      # Admin layout group
│       ├── (auth)/       # Auth layout group (login, register)
│       └── (main)/       # Public layout group
├── components/
│   ├── ui/               # shadcn/ui components
│   └── auctions/         # Auction-specific components
├── lib/
│   ├── auth.ts           # NextAuth configuration
│   ├── prisma.ts         # Prisma client singleton
│   ├── email.ts          # Resend email service
│   ├── cron.ts           # Background jobs (auction expiration)
│   └── crawler/          # IVO scraping utilities
├── i18n/                 # Internationalization setup
└── messages/             # Translation files (en.json, pl.json)
prisma/
├── schema.prisma         # Database schema
└── seed.ts               # Seed script
```

### Key Patterns

**API Routes:** Located in `src/app/api/`. Admin routes check `session.user.role === "ADMIN"`. Use `auth()` from `@/lib/auth` for session.

**Authentication:** NextAuth v5 with JWT strategy. Credentials provider validates PESEL (Polish ID). Google OAuth supported. Session augmented with `id`, `role`, `firstName`, `lastName`.

**Database:** Prisma with SQLite. Key models: `User`, `Auction`, `Bid`, `ScrapedAuction`, `ScrapeJob`. Use `prisma` singleton from `@/lib/prisma`.

**Sealed Bid System:** Users place bids without seeing others' amounts. Minimum increment: 100 PLN. Status flow: DRAFT → ACTIVE → SOLD/ENDED.

**Background Jobs:** Cron jobs in `src/lib/cron.ts` run via `src/instrumentation.ts`. Auction expiration checked every minute.

**i18n:** Locale in URL path (`/pl/...`, `/en/...`). Translations in `src/messages/`. Use `next-intl` hooks and components.

### Web Crawler (IVO Integration)

Located in `src/lib/crawler/`. Requires Informex credentials. Features:
- OAuth authentication with session persistence (`.crawler/ivo-state.json`)
- List scraping (free): basic vehicle data
- Detail scraping (paid API call): VIN, full images, documents
- Parallel image downloading with configurable concurrency

## Environment Variables

Required:
- `DATABASE_URL` - SQLite path (`file:./dev.db`) or PostgreSQL connection string
- `NEXTAUTH_URL` - App URL (e.g., `http://localhost:3000`)
- `NEXTAUTH_SECRET` - Generate with `openssl rand -base64 32`

Optional:
- `GOOGLE_CLIENT_ID`, `GOOGLE_CLIENT_SECRET` - Google OAuth
- `RESEND_API_KEY`, `NOTIFICATION_EMAIL` - Email notifications
- `INFORMEX_EMAIL`, `INFORMEX_PASSWORD`, `IVO_CLIENT_ID` - IVO crawler
- `CRAWLER_HEADLESS`, `CRAWLER_SLOW_MO`, `CRAWLER_IMAGE_CONCURRENCY` - Crawler settings

## Database Schema (Key Models)

- **User:** Authentication, profile (PESEL validation), role (USER/ADMIN)
- **Auction:** Vehicle details, pricing, images (JSON), status, timestamps
- **Bid:** User bid amounts (sealed), linked to auction
- **ScrapedAuction:** IVO data, selection status, import workflow
- **ScrapeJob:** Batch import job tracking

## Path Aliases

`@/*` maps to `./src/*` (configured in tsconfig.json)

## Deployment

Docker-ready with multi-stage build. Health check at `/api/health`. See `docs/DEPLOYMENT.md` for DigitalOcean App Platform guide.
