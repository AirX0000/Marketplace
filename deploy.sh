#!/bin/bash
# =============================================
# autohouse.uz — Production Deploy Script
# Usage: ./deploy.sh  (run on the SERVER)
# =============================================

set -e

GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${GREEN}========================================${NC}"
echo -e "${GREEN}  🚀 Autohouse Deploy Script${NC}"
echo -e "${GREEN}========================================${NC}"

DEPLOY_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$DEPLOY_DIR"

# 1. Pull latest code
echo -e "\n${YELLOW}[1/5] Git pull...${NC}"
git pull origin main

# 2. Install frontend deps (if package.json changed)
echo -e "\n${YELLOW}[2/5] Installing frontend dependencies...${NC}"
npm install --prefer-offline --no-audit

# 3. Build frontend (generates new dist/ with fresh chunk hashes)
echo -e "\n${YELLOW}[3/5] Building frontend...${NC}"
npm run build
echo -e "${GREEN}✓ dist/ updated${NC}"

# 4. Install backend deps
echo -e "\n${YELLOW}[4/5] Installing backend dependencies...${NC}"
cd server
npm install --prefer-offline --no-audit
npx prisma generate
cd ..

# 5. Restart backend (PM2 or fallback to direct kill+start)
echo -e "\n${YELLOW}[5/5] Restarting backend...${NC}"
if command -v pm2 &>/dev/null; then
    pm2 restart autohouse-backend 2>/dev/null || pm2 start server/server.js --name autohouse-backend
    pm2 save
    echo -e "${GREEN}✓ PM2 restarted${NC}"
else
    # Fallback: kill old node process on port 3000 and restart
    lsof -t -i:3000 | xargs kill -9 2>/dev/null || true
    sleep 1
    nohup node server/server.js > backend.log 2>&1 &
    echo -e "${GREEN}✓ Server restarted (PID: $!)${NC}"
fi

echo -e "\n${GREEN}========================================${NC}"
echo -e "${GREEN}  ✅ Deploy complete! autohouse.uz${NC}"
echo -e "${GREEN}========================================${NC}"
echo ""
echo "  → New dist/ hash generated (stale JS chunks cleared)"
echo "  → PWA Service Worker will auto-update all clients"
echo ""
