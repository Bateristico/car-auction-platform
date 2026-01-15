#!/bin/sh
set -e

echo "🚀 Starting Samochody.be..."
echo "📁 Working directory: $(pwd)"
echo "📁 Data directory contents:"
ls -la /app/data/ 2>/dev/null || echo "  (empty or doesn't exist)"

# Always initialize database on startup (ensures tables exist)
echo "📦 Initializing database schema..."
npx prisma db push --accept-data-loss 2>&1 || {
  echo "❌ Failed to push database schema"
  exit 1
}
echo "✅ Database schema ready"

# Check if data needs to be imported (check if users exist)
USER_COUNT=$(node -e "
const Database = require('better-sqlite3');
try {
  const db = new Database('/app/data/prod.db');
  const result = db.prepare('SELECT COUNT(*) as count FROM User').get();
  console.log(result.count);
  db.close();
} catch (e) {
  console.log('0');
}
" 2>/dev/null || echo "0")

echo "📊 Current user count: $USER_COUNT"

if [ "$USER_COUNT" = "0" ]; then
  echo "🌱 Importing data..."
  node prisma/import-data.js 2>&1 || {
    echo "❌ Failed to import data"
    exit 1
  }
  echo "✅ Data imported (users + 153 auctions)"
else
  echo "✅ Data already exists ($USER_COUNT users)"
fi

# Start the application
echo "🌐 Starting Next.js server..."
exec node server.js
