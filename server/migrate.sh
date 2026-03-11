#!/bin/bash
# DO App Platform provides a PgBouncer (pooled) connection URL on port 25060.
# Prisma migrations/db push require a DIRECT connection (port 25060 -> 25061 in DO).

echo "Parsing DATABASE_URL for Prisma Schema Push..."

# Check if we are running on DO (port 25060 usually indicates their PgBouncer)
if [[ "$DATABASE_URL" == *":25060"* ]]; then
  echo "Detected DigitalOcean pooled connection. Converting to direct connection for Prisma..."
  export DIRECT_URL="${DATABASE_URL/:25060/:25061}"
else
  # Local or already direct
  export DIRECT_URL="$DATABASE_URL"
fi

echo "Running prisma db push with direct connection..."
# Run Prisma using the DIRECT_URL environment variable 
DATABASE_URL=$DIRECT_URL npx prisma db push --accept-data-loss

echo "Migration script completed."
