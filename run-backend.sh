#!/bin/bash

# Backend Startup Script

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

echo -e "${BLUE}========================================${NC}"
echo -e "${BLUE}  🚀 Starting Backend Server${NC}"
echo -e "${BLUE}========================================${NC}"
echo ""

# Navigate to server directory
cd "$(dirname "$0")/server" || exit 1

# Kill existing process on port 3000
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}⚠️  Port 3000 is busy, stopping existing process...${NC}"
    lsof -t -i:3000 | xargs kill -9 2>/dev/null
    sleep 1
fi

# Install dependencies if needed
if [ ! -d "node_modules" ]; then
    echo -e "${YELLOW}📦 Installing dependencies...${NC}"
    npm install
fi

# Prisma setup
echo -e "${YELLOW}🔧 Setting up Prisma...${NC}"
npx prisma generate
npx prisma db push --skip-generate --accept-data-loss

echo ""
echo -e "${GREEN}✅ Starting Node.js server...${NC}"
echo ""

# Start server
node server.js
