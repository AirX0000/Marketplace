#!/bin/bash
# DO App Platform provides a PgBouncer (pooled) connection URL on port 25060.
# Prisma migrations/db push require a DIRECT connection (port 25060 -> 25061 in DO).

echo "Parsing DATABASE_URL for Prisma Schema Push..."

# Check if we are running on DO (port 25060 usually indicates their PgBouncer)
if [[ "$DATABASE_URL" == *":25060"* ]]; then
  echo "Detected DigitalOcean pooled connection."
  
  # Ensure DATABASE_URL has pgbouncer=true for regular queries
  if [[ "$DATABASE_URL" != *"pgbouncer=true"* ]]; then
    if [[ "$DATABASE_URL" == *"?"* ]]; then
      export DATABASE_URL="${DATABASE_URL}&pgbouncer=true"
    else
      export DATABASE_URL="${DATABASE_URL}?pgbouncer=true"
    fi
  fi

  # Extract the base URL without query parameters to build DIRECT_URL safely
  BASE_URL="${DATABASE_URL%%\?*}"
  
  # Convert port for direct connection
  export DIRECT_URL="${BASE_URL/:25060/:25061}"
else
  # Local or non-pooled DO connection
  export DIRECT_URL="${DATABASE_URL}"
fi

echo "DATABASE_URL configured for pooling."
echo "DIRECT_URL configured for migrations: ${DIRECT_URL//:*@/:***@}" # Mask password in logs

echo "Running prisma db push..."
# Prisma 5+ will automatically pick up DIRECT_URL from environment
npx prisma db push --accept-data-loss

echo "Migration script completed."
