#!/bin/bash

# Marketplace Application Startup (Parallel Optimized v2)

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

# Cleanup function
cleanup() {
    echo ""
    echo -e "${YELLOW}Stopping all services...${NC}"
    kill $(jobs -p) 2>/dev/null
    echo -e "${GREEN}Services stopped.${NC}"
}
trap cleanup EXIT

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Marketplace Startup (Optimized v2)${NC}" # Tagged v2
echo -e "${GREEN}========================================${NC}"
echo ""

# Function to wait for a port
wait_for_port() {
    local port=$1
    local name=$2
    local retries=300
    local verify_url=$3

    echo -e "${YELLOW}Waiting for $name (Port $port)...${NC}"
    
    for ((i=1; i<=retries; i++)); do
        if lsof -Pi :$port -sTCP:LISTEN -t >/dev/null; then
            echo -e "${GREEN}✓ $name is ready on port $port${NC}"
            return 0
        fi
        sleep 1
    done
    
    echo -e "${RED}Error: $name failed to start on port $port${NC}"
    return 1
}

# START BACKEND (Background)
(
    echo -e "${YELLOW}[Backend] Setup started...${NC}"
    cd server || exit 1
    
    # 1. Install deps if missing
    if [ ! -d "node_modules" ]; then
        echo "[Backend] Installing dependencies..."
        npm install --silent
    fi
    
    # 2. Prisma
    echo "[Backend] Prisma gen & push..."
    npx prisma generate
    npx prisma db push --accept-data-loss
    
    # 3. Start Server
    echo "[Backend] Starting server..."
    # Kill existing 3000
    lsof -t -i:3000 | xargs kill -9 2>/dev/null || true
    
    node server.js
) &
BACKEND_PID=$!

# START FRONTEND (Background)
(
    echo -e "${YELLOW}[Frontend] Setup started...${NC}"
    
    # 1. Install deps if missing
    # 1. Install deps if missing or broken
    if [ ! -f "node_modules/vite/bin/vite.js" ]; then
        echo "[Frontend] Installing dependencies (vite missing)..."
        npm install --silent
    fi
    
    # 2. Start Vite
    echo "[Frontend] Starting Vite..."
    # Kill existing 5173
    lsof -t -i:5173 | xargs kill -9 2>/dev/null || true
    
    npm run dev -- --host
) &
FRONTEND_PID=$!

# WAIT FOR SERVICES
# We wait for ports to be active rather than just sleeping
wait_for_port 3000 "Backend"
wait_for_port 5173 "Frontend"

echo ""
echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  Applications are Ready! 🚀${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "  • Frontend:    http://localhost:5173"
echo "  • Backend:     http://localhost:3000"
echo ""

# Open Browser
open http://localhost:5173

# Keep script running
wait $BACKEND_PID $FRONTEND_PID
