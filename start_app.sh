#!/bin/bash

# Colors
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m'

echo -e "${BLUE}=== 🚀 Marketplace Launcher Debug Mode ===${NC}"

# Cleanup
echo -e "${YELLOW}🧹 Cleaning ports 3000 & 5173...${NC}"
lsof -ti:3000,5173 | xargs kill -9 2>/dev/null || true
sleep 1

# Function to check port using curl (more reliable for web servers)
wait_for_port() {
    local port=$1
    local name=$2
    local timeout=60
    local count=0

    echo -n "Waiting for $name (Port $port)..."
    while ! curl -s --head http://localhost:$port > /dev/null; do
        sleep 1
        count=$((count+1))
        echo -n "."
        if [ $count -ge $timeout ]; then
            echo -e "\n${RED}❌ Timeout waiting for $name!${NC}"
            return 1
        fi
    done
    echo -e " ${GREEN}OK!${NC}"
    return 0
}

# 1. Start Backend
echo -e "\n${BLUE}📦 Starting Backend...${NC}"
cd server
# Install if needed
if [ ! -d "node_modules" ]; then
    echo "Installing backend dependencies..."
    npm install > /dev/null 2>&1
fi

# Start and log to file
npm start > ../backend.log 2>&1 &
BACKEND_PID=$!
cd ..

# Check Backend Health
if ! wait_for_port 3000 "Backend"; then
    echo -e "${RED}--- BACKEND LOGS (Last 20 lines) ---${NC}"
    tail -n 20 backend.log
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

# 2. Start Frontend
echo -e "\n${BLUE}🎨 Starting Frontend...${NC}"

# Check if node_modules or vite binary is missing
if [ ! -d "node_modules" ] || [ ! -f "node_modules/.bin/vite" ]; then
    echo -e "${YELLOW}📦 Installing frontend dependencies (this may take a minute)...${NC}"
    npm install
fi

# Start and log to file (Force IPv4 host binding to avoid resolution issues)
npm run dev -- --host 127.0.0.1 > frontend.log 2>&1 &
FRONTEND_PID=$!

# Check Frontend Health
if ! wait_for_port 5173 "Frontend"; then
    echo -e "${RED}--- FRONTEND LOGS (Last 20 lines) ---${NC}"
    tail -n 20 frontend.log
    kill $BACKEND_PID $FRONTEND_PID 2>/dev/null
    exit 1
fi

# 3. Success & Open
echo -e "\n${GREEN}✅ All systems operational!${NC}"
echo -e "${BLUE}📝 Logs are being written to 'backend.log' and 'frontend.log'${NC}"
echo -e "${BLUE}🌍 Opening browser...${NC}"

if [[ "$OSTYPE" == "darwin"* ]]; then
    open "http://localhost:5173"
elif [[ "$OSTYPE" == "linux-gnu"* ]]; then
    xdg-open "http://localhost:5173"
fi

# 4. Tail logs (Keep script running and show live output)
echo -e "${YELLOW}Showing live logs (Press CTRL+C to stop)...${NC}\n"
trap "kill $BACKEND_PID $FRONTEND_PID; exit" INT

tail -f backend.log frontend.log
