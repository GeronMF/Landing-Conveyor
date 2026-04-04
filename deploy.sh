#!/bin/bash
# Deploy script for topcina.store
# Run from: ~/app
set -e

APP_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$APP_DIR"

source ~/.nvm/nvm.sh

echo "[1] Git pull..."
git pull origin master

echo "[2] Restore public/ from git (favicon, logos)..."
git checkout HEAD -- public/favicon.png public/logo.png public/logo-1.png \
  public/refund_2week-ua.jpg public/refund_defact.jpg 2>/dev/null || true

echo "[3] npm ci..."
npm ci --prefer-offline 2>/dev/null || npm ci

echo "[4] Build (postbuild copies public/ → standalone/public/)..."
npm run build

echo "[5] Restart PM2..."
pm2 restart landing-conveyor --update-env

echo "[6] Checking favicon..."
sleep 2
STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://localhost:3100/favicon.png)
if [ "$STATUS" = "200" ]; then
  echo "✓ favicon.png → $STATUS"
else
  echo "✗ favicon.png → $STATUS (PROBLEM!)"
  exit 1
fi

echo ""
echo "Deploy done!"
