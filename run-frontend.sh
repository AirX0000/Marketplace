#!/bin/bash

# Frontend Startup Script

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
CYAN='\033[0;36m'
NC='\033[0m'

echo -e "${CYAN}========================================${NC}"
echo -e "${CYAN}  🎨 Starting Frontend (Vite)${NC}"
echo -e "${CYAN}========================================${NC}"
echo ""

# Navigate to project root
cd "$(dirname "$0")" || exit 1

# Kill existing process on port 5173
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Port 5173 is busy, stopping existing process...${NC}"
    lsof -t -i:5173 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

echo ""
echo -e "${GREEN}✅ Starting Vite dev server...${NC}"
echo ""

# Start Vite
npm run dev -- --host
