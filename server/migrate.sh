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

echo "Running prisma db push..."
npx prisma db push --accept-data-loss

echo "Migration script completed."
