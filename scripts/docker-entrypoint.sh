#!/bin/sh
set -e

echo "🚀 Starting VIPChat Live CRM container startup..."

# Run database migrations if PostgreSQL is available
if [ -n "$DATABASE_URL" ]; then
  echo "📦 Running Prisma DB migrations..."
  npx prisma migrate deploy || npx prisma db push || echo "⚠️ Database push skipped, using fallback store."
fi

# Execute main server process
echo "🌟 Launching VIPChat Node.js server..."
exec node dist/server.js
