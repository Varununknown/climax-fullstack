#!/bin/bash
# Render build script with AGGRESSIVE submodule handling

set -e  # Exit on error
set -x  # Debug output

echo "========================================="
echo "🔨 Starting Render build process..."
echo "========================================="

echo ""
echo "� SUBMODULE NUCLEAR OPTION:"
git config --file .gitmodules --name-only --get-regexp path | while read path_key; do
  config_key="${path_key%%.path}"
  module_path=$(git config --file .gitmodules --get "${config_key}.path")
  module_url=$(git config --file .gitmodules --get "${config_key}.url")
  echo "  Reinitializing: $module_path from $module_url"
  rm -rf "$module_path"
  git submodule add --force "$module_url" "$module_path" || true
done

echo ""
echo "�📍 Current directory: $(pwd)"
echo "📍 Files in current directory:"
ls -la | head -20

echo ""
echo "🧹 CACHE BUSTER: Clearing npm cache..."
npm cache clean --force || true
rm -rf node_modules backend/node_modules .npm || true

echo ""
echo "🔧 Step 1: Initialize and update git submodules (AGGRESSIVE)..."
git submodule foreach --recursive "git fetch --all && git reset --hard origin/master" 2>&1 || echo "⚠️  Submodule fetch had issues"
git submodule update --init --recursive --force 2>&1 || echo "⚠️  Submodule update had issues, continuing..."

echo ""
echo "📍 After submodule update - Backend files:"
ls -la backend/ 2>&1 | head -10 || echo "❌ Backend directory not found"

echo ""
echo "📦 Step 2: Installing root dependencies (FRESH)..."
npm cache clean --force
npm install 2>&1 || echo "⚠️  Root npm install had issues"

echo ""
echo "📦 Step 3: Installing backend dependencies (FRESH)..."
cd backend
npm cache clean --force
npm install --production 2>&1 || echo "⚠️  Backend npm install had issues"

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
