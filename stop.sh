#!/bin/bash

# Marketplace Application Stop Script (Local)

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

echo -e "${YELLOW}========================================${NC}"
echo -e "${YELLOW}  Stopping Marketplace Application${NC}"
echo -e "${YELLOW}========================================${NC}"
echo ""

# Stop Backend (Port 3000)
if lsof -Pi :3000 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}Stopping Backend (Port 3000)...${NC}"
    lsof -t -i:3000 | xargs kill -9
    echo -e "${GREEN}✓ Backend stopped${NC}"
else
    echo "Backend is not running"
fi

# Stop Frontend (Port 5173)
if lsof -Pi :5173 -sTCP:LISTEN -t >/dev/null ; then
    echo -e "${YELLOW}Stopping Frontend (Port 5173)...${NC}"
    lsof -t -i:5173 | xargs kill -9
    echo -e "${GREEN}✓ Frontend stopped${NC}"
else
    echo "Frontend is not running"
fi

echo ""
echo -e "${GREEN}All services stopped${NC}"
