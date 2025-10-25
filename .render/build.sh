#!/bin/bash#!/bin/bash

# Render build script - SIMPLIFIED: Direct clone if needed, no submodules# Render build script with AGGRESSIVE submodule handling



set -eset -e  # Exit on error

set -xset -x  # Debug output



echo "========================================="echo "========================================="

echo "Starting Render build..."echo "🔨 Starting Render build process..."

echo "========================================="echo "========================================="



echo ""echo ""

echo "Checking for backend code..."echo "� SUBMODULE NUCLEAR OPTION:"

if [ -d "backend" ]; thengit config --file .gitmodules --name-only --get-regexp path | while read path_key; do

  echo "Backend directory exists"  config_key="${path_key%%.path}"

  ls -la backend/ | head -3  module_path=$(git config --file .gitmodules --get "${config_key}.path")

else  module_url=$(git config --file .gitmodules --get "${config_key}.url")

  echo "Backend directory MISSING - cloning..."  echo "  Reinitializing: $module_path from $module_url"

  git clone https://github.com/Varununknown/climax-backend.git backend || echo "Clone failed"  rm -rf "$module_path"

fi  git submodule add --force "$module_url" "$module_path" || true

done

echo ""

echo "Clearing npm caches..."echo ""

npm cache clean --force || trueecho "�📍 Current directory: $(pwd)"

rm -rf node_modules backend/node_modulesecho "📍 Files in current directory:"

ls -la | head -20

echo ""

echo "Installing dependencies..."echo ""

npm installecho "🧹 CACHE BUSTER: Clearing npm cache..."

cd backendnpm cache clean --force || true

npm install --productionrm -rf node_modules backend/node_modules .npm || true



echo ""echo ""

echo "Verifying critical files..."echo "🔧 Step 1: Initialize and update git submodules (AGGRESSIVE)..."

[ -f "server.cjs" ] && echo "OK: server.cjs" || { echo "FAIL: server.cjs MISSING"; exit 1; }git submodule foreach --recursive "git fetch --all && git reset --hard origin/master" 2>&1 || echo "⚠️  Submodule fetch had issues"

[ -f "routes/googleAuth.cjs" ] && echo "OK: googleAuth.cjs" || { echo "FAIL: googleAuth.cjs MISSING"; exit 1; }git submodule update --init --recursive --force 2>&1 || echo "⚠️  Submodule update had issues, continuing..."

[ -f "package.json" ] && echo "OK: package.json" || { echo "FAIL: package.json MISSING"; exit 1; }

echo ""

echo ""echo "📍 After submodule update - Backend files:"

echo "Checking Google OAuth..."ls -la backend/ 2>&1 | head -10 || echo "❌ Backend directory not found"

grep -q "router.post.*google" routes/googleAuth.cjs && echo "OK: POST /google/callback" || { echo "FAIL: Missing"; exit 1; }

grep -q "app.use.*googleAuthRoutes" server.cjs && echo "OK: Route registered" || { echo "FAIL: Not registered"; exit 1; }echo ""

echo "📦 Step 2: Installing root dependencies (FRESH)..."

echo ""npm cache clean --force

echo "Checking CORS..."npm install 2>&1 || echo "⚠️  Root npm install had issues"

grep -q "Access-Control-Allow-Origin" server.cjs && echo "OK: CORS headers" || { echo "FAIL: CORS missing"; exit 1; }

echo ""

echo ""echo "📦 Step 3: Installing backend dependencies (FRESH)..."

cd ..cd backend

echo "Build complete!"npm cache clean --force

echo "========================================="npm install --production 2>&1 || echo "⚠️  Backend npm install had issues"


echo ""
echo "🔍 Verifying backend files..."
ls -la server.cjs 2>&1 || echo "❌ server.cjs NOT found"
test -f package.json && echo "✅ package.json found" || echo "❌ package.json NOT found"
echo ""
echo "🔐 Checking Google OAuth routes..."
grep -n "router.post.*google" routes/googleAuth.cjs 2>&1 && echo "✅ Google POST route found" || echo "❌ Google POST route NOT found!"
grep -n "app.use.*googleAuthRoutes" server.cjs 2>&1 && echo "✅ Google routes registered" || echo "❌ Google routes NOT registered!"
echo ""
echo "🔐 Checking CORS configuration..."
grep -n "Access-Control-Allow-Origin" server.cjs 2>&1 && echo "✅ CORS headers found" || echo "❌ CORS headers NOT found!"

echo ""
cd ..
echo "✅ Build process complete!"
echo "========================================="
