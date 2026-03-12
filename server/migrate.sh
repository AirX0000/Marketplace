#!/bin/bash

# Ensure DATABASE_URL has pgbouncer=true for regular queries
if [[ "$DATABASE_URL" == *":25060"* ]]; then
  echo "Detected DigitalOcean pooled connection."
  if [[ "$DATABASE_URL" != *"pgbouncer=true"* ]]; then
    if [[ "$DATABASE_URL" == *"?"* ]]; then
      export DATABASE_URL="${DATABASE_URL}&pgbouncer=true"
    else
      export DATABASE_URL="${DATABASE_URL}?pgbouncer=true"
    fi
  fi
fi

# NOTE: DIRECT_URL extraction and SSL parameter preservation is now safely 
# handled by the hijack-prisma.js wrapper script built into the node_modules.

echo "Waiting 5 seconds to ensure Node.js server starts and passes Health Checks..."
sleep 5

echo "Starting Prisma schema migration (with robust retries for DO rolling deployments)..."

MAX_RETRIES=12
for ((i=1; i<=MAX_RETRIES; i++)); do
  echo "Attempt $i of $MAX_RETRIES: Running npx prisma db push..."
  
  # Run the command
  npx prisma db push --accept-data-loss
  EXIT_CODE=$?
  
  if [ $EXIT_CODE -eq 0 ]; then
    echo "✅ Migration completed successfully!"
    exit 0
  fi
  
  echo "❌ Migration failed (Exit Code: $EXIT_CODE). The old App Platform container might be hoarding Native Connections (Port 25060)."
  if [ $i -lt $MAX_RETRIES ]; then
    echo "Retrying in 10 seconds to allow the rolling deployment switch to terminate the old container..."
    sleep 10
  fi
done

echo "⚠️ Warning: All $MAX_RETRIES migration attempts failed. Please check DigitalOcean database connection limits."
exit 1
