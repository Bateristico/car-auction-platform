# ==============================================
# Samochody.be - Production Dockerfile
# ==============================================
# Multi-stage build for optimized production image

# Stage 1: Dependencies
FROM node:20-slim AS deps
RUN apt-get update && apt-get install -y python3 make g++ && rm -rf /var/lib/apt/lists/*
WORKDIR /app

# Copy package files
COPY package.json package-lock.json* ./

# Install dependencies (--legacy-peer-deps for nodemailer conflict)
RUN npm ci --legacy-peer-deps

# Stage 2: Builder
FROM node:20-slim AS builder
WORKDIR /app

# Install OpenSSL for Prisma
RUN apt-get update -y && apt-get install -y openssl && rm -rf /var/lib/apt/lists/*

# Copy dependencies from deps stage
COPY --from=deps /app/node_modules ./node_modules
COPY . .

# Set environment for build
ENV NEXT_TELEMETRY_DISABLED=1
ENV NODE_ENV=production

# Generate Prisma client
RUN npx prisma generate

# Install only Playwright Chromium Headless Shell (browser files only, no system deps)
# System dependencies are already installed in runner stage - no need to duplicate
# This saves ~329MB of build-time disk space
ENV PLAYWRIGHT_SKIP_BROWSER_DOWNLOAD=1
RUN npx playwright install chromium-headless-shell

# Create empty database for build (Next.js static generation needs it)
# Use --url flag to override any environment variable from build platform
RUN npx prisma db push --url="file:./prisma/build.db" --accept-data-loss

# Build the application with build database
ENV DATABASE_URL="file:./prisma/build.db"
RUN npm run build

# Bundle import script with all dependencies for runtime data loading
RUN npx esbuild prisma/import-data.ts --bundle --platform=node --outfile=prisma/import-data.js --external:better-sqlite3

# Remove build database (will use runtime database)
RUN rm -f ./prisma/build.db
ENV DATABASE_URL=""

# Stage 3: Production Runner
FROM node:20-slim AS runner
WORKDIR /app

# Set production environment
ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV AUTH_TRUST_HOST=true

# Create non-root user for security
RUN groupadd --system --gid 1001 nodejs && useradd --system --uid 1001 --gid nodejs nextjs

# Install Chromium runtime dependencies and wget for healthcheck
RUN apt-get update && apt-get install -y --no-install-recommends \
    libnss3 libnspr4 libatk1.0-0 libatk-bridge2.0-0 libcups2 libdrm2 \
    libxkbcommon0 libxcomposite1 libxdamage1 libxfixes3 libxrandr2 \
    libgbm1 libasound2 libpango-1.0-0 libcairo2 libx11-6 libx11-xcb1 \
    libxcb1 libxext6 libxcursor1 libxi6 libxtst6 libglib2.0-0 \
    wget ca-certificates \
    && rm -rf /var/lib/apt/lists/*

# Copy public assets
COPY --from=builder /app/public ./public

# Copy standalone build
COPY --from=builder --chown=nextjs:nodejs /app/.next/standalone ./
COPY --from=builder --chown=nextjs:nodejs /app/.next/static ./.next/static

# Copy Prisma schema, compiled seeds, and CLI for runtime database initialization
COPY --from=builder /app/prisma ./prisma
COPY --from=builder /app/node_modules/.prisma ./node_modules/.prisma
COPY --from=builder /app/node_modules/@prisma ./node_modules/@prisma
COPY --from=builder /app/node_modules/prisma ./node_modules/prisma

# Copy better-sqlite3 native module (required by seed scripts - other deps are bundled)
COPY --from=builder /app/node_modules/better-sqlite3 ./node_modules/better-sqlite3
COPY --from=builder /app/node_modules/bindings ./node_modules/bindings
COPY --from=builder /app/node_modules/file-uri-to-path ./node_modules/file-uri-to-path

# Install prisma CLI for runtime database initialization
RUN npm install prisma --no-save --legacy-peer-deps

# Copy entrypoint script
COPY --chown=nextjs:nodejs docker-entrypoint.sh ./
RUN chmod +x docker-entrypoint.sh

# Create data directory for SQLite
RUN mkdir -p /app/data && chown -R nextjs:nodejs /app/data

# Copy Playwright browser from builder and set ownership
RUN mkdir -p /home/nextjs/.cache
COPY --from=builder /root/.cache/ms-playwright /home/nextjs/.cache/ms-playwright
RUN chown -R nextjs:nodejs /home/nextjs

# Switch to non-root user
USER nextjs

# Expose port
EXPOSE 3000

# Set hostname and port
ENV PORT=3000
ENV HOSTNAME="0.0.0.0"

# Health check (with longer start period for db init)
HEALTHCHECK --interval=30s --timeout=10s --start-period=60s --retries=3 \
  CMD wget --no-verbose --tries=1 --spider http://localhost:3000/api/health || exit 1

# Start with entrypoint script
CMD ["./docker-entrypoint.sh"]
