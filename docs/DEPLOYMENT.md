# NovaDrive Motors - Deployment Guide

This guide covers deploying NovaDrive Motors to DigitalOcean App Platform using Docker.

---

## Table of Contents

1. [Prerequisites](#prerequisites)
2. [Local Docker Development](#local-docker-development)
3. [DigitalOcean Deployment](#digitalocean-deployment)
4. [Environment Variables](#environment-variables)
5. [Cost Estimation](#cost-estimation)
6. [Troubleshooting](#troubleshooting)

---

## Prerequisites

- Docker Desktop installed
- DigitalOcean account
- GitHub account with repository access
- Domain name (optional, DigitalOcean provides free subdomain)

---

## Local Docker Development

### Build and Run

```bash
# Build the Docker image
docker build -t novadrive-motors .

# Run with docker-compose
docker-compose up -d

# View logs
docker-compose logs -f

# Stop
docker-compose down
```

### Development Mode

```bash
# Run in development mode with hot reload
docker-compose --profile dev up
```

### Testing the Build

```bash
# Test the health endpoint
curl http://localhost:3000/api/health
```

---

## DigitalOcean Deployment

### Step 1: Push to GitHub

```bash
# Initialize git (if not already)
git init

# Add remote
git remote add origin https://github.com/Bateristico/car-auction-platform.git

# Create main branch
git branch -M main

# Add all files
git add .

# Commit
git commit -m "Initial commit: NovaDrive Motors auction platform"

# Push
git push -u origin main
```

### Step 2: Create App on DigitalOcean

1. Go to [DigitalOcean App Platform](https://cloud.digitalocean.com/apps)
2. Click **Create App**
3. Select **GitHub** as source
4. Authorize DigitalOcean to access your repository
5. Select `Bateristico/car-auction-platform`
6. Select `main` branch
7. DigitalOcean will auto-detect the Dockerfile

### Step 3: Configure Environment Variables

In the DigitalOcean dashboard, add these secrets:

| Variable | Description |
|----------|-------------|
| `NEXTAUTH_SECRET` | Generate with `openssl rand -base64 32` |
| `GOOGLE_CLIENT_ID` | From Google Cloud Console |
| `GOOGLE_CLIENT_SECRET` | From Google Cloud Console |
| `RESEND_API_KEY` | From Resend dashboard |
| `NOTIFICATION_EMAIL` | Email for notifications |
| `INFORMEX_EMAIL` | (Optional) Crawler email |
| `INFORMEX_PASSWORD` | (Optional) Crawler password |
| `IVO_CLIENT_ID` | (Optional) IVO platform client ID |

### Step 4: Deploy

1. Review the configuration
2. Select instance size (recommended: `apps-s-1vcpu-1gb-fixed` at $10/month)
3. Click **Create Resources**
4. Wait for deployment (5-10 minutes)

### Step 5: Custom Domain (Optional)

1. Go to **Settings** > **Domains**
2. Add your domain
3. Update DNS records as instructed
4. SSL certificate is automatic

---

## Environment Variables

### Required Variables

```env
DATABASE_URL="file:/app/data/prod.db"
NEXTAUTH_URL="https://your-app.ondigitalocean.app"
NEXTAUTH_SECRET="your-secret-key"
GOOGLE_CLIENT_ID="your-google-client-id"
GOOGLE_CLIENT_SECRET="your-google-client-secret"
RESEND_API_KEY="re_xxxxxxxxxxxx"
NOTIFICATION_EMAIL="notifications@yourdomain.com"
```

### Optional Variables (Crawler)

```env
INFORMEX_EMAIL="your-informex-email"
INFORMEX_PASSWORD="your-informex-password"
IVO_CLIENT_ID="your-ivo-client-id"
CRAWLER_HEADLESS="true"
```

### Generating NEXTAUTH_SECRET

```bash
# Using OpenSSL
openssl rand -base64 32

# Using Node.js
node -e "console.log(require('crypto').randomBytes(32).toString('base64'))"
```

---

## Cost Estimation

### DigitalOcean App Platform

| Component | Plan | Monthly Cost |
|-----------|------|--------------|
| Web Service | apps-s-1vcpu-1gb-fixed | $10.00 |
| **Total** | | **$10.00/month** |

### Optional Add-ons

| Add-on | Cost | Notes |
|--------|------|-------|
| Custom Domain | Free | SSL included |
| Managed PostgreSQL (Dev) | $15.00 | If scaling beyond SQLite |
| Managed PostgreSQL (Prod) | $60.00 | High availability |
| DigitalOcean Spaces | $5.00 | 250GB for images |

### Scaling Options

| Plan | CPU | RAM | Cost |
|------|-----|-----|------|
| apps-s-1vcpu-0.5gb | 1 shared | 512 MiB | $5.00 |
| apps-s-1vcpu-1gb-fixed | 1 shared | 1 GiB | $10.00 |
| apps-s-1vcpu-1gb | 1 shared | 1 GiB | $12.00 |
| apps-s-1vcpu-2gb | 1 shared | 2 GiB | $25.00 |
| apps-d-1vcpu-1gb | 1 dedicated | 1 GiB | $34.00 |

---

## Troubleshooting

### Build Fails

**Error: "Cannot find module"**
- Ensure all dependencies are in `package.json`
- Run `npm ci` locally to verify

**Error: "Prisma client not generated"**
- The Dockerfile runs `npx prisma generate` during build
- Check Prisma schema for errors

### Runtime Errors

**Error: "Database connection failed"**
- Verify `DATABASE_URL` is set correctly
- For SQLite, ensure the data directory exists

**Error: "NEXTAUTH_URL mismatch"**
- Set `NEXTAUTH_URL` to your app's URL
- Use `${APP_URL}` variable in DigitalOcean

### Health Check Fails

**Symptoms: App keeps restarting**
- Check `/api/health` endpoint is accessible
- Increase `initial_delay_seconds` in app.yaml
- Check application logs for startup errors

### View Logs

```bash
# DigitalOcean CLI
doctl apps logs <app-id> --type=run

# Docker locally
docker-compose logs -f
```

---

## Database Migration

### SQLite to PostgreSQL

For production scaling, migrate to PostgreSQL:

1. Add DigitalOcean Managed Database
2. Update `DATABASE_URL`:
   ```
   DATABASE_URL="postgresql://user:pass@host:25060/db?sslmode=require"
   ```
3. Update `prisma/schema.prisma`:
   ```prisma
   datasource db {
     provider = "postgresql"
     url      = env("DATABASE_URL")
   }
   ```
4. Run migrations: `npx prisma migrate deploy`

---

## Security Checklist

- [ ] All secrets stored in DigitalOcean (not in code)
- [ ] `.env` file is in `.gitignore`
- [ ] No hardcoded credentials in source
- [ ] HTTPS enabled (automatic on App Platform)
- [ ] Non-root user in Docker container
- [ ] Health checks configured

---

## Updating the App

### Automatic Deployments

With `deploy_on_push: true`, every push to `main` triggers a deployment.

### Manual Deployment

```bash
# Using DigitalOcean CLI
doctl apps create-deployment <app-id>
```

### Rolling Back

1. Go to **Activity** tab in DigitalOcean
2. Find previous successful deployment
3. Click **Rollback to this deployment**

---

*Last updated: December 2024*
