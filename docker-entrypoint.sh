#!/bin/sh
set -e

echo "🚀 Starting NovaDrive Motors..."

# Initialize database if it doesn't exist
if [ ! -f "/app/data/prod.db" ]; then
  echo "📦 Initializing database..."
  npx prisma db push --url="$DATABASE_URL" --accept-data-loss
  echo "✅ Database schema created"

  # Import all data from JSON files
  echo "🌱 Importing data..."
  node prisma/import-data.js
  echo "✅ Data imported (users + 153 auctions)"

  echo "✅ Database fully initialized"
else
  echo "✅ Database already exists"
fi

# Start the application
echo "🌐 Starting Next.js server..."
exec node server.js
