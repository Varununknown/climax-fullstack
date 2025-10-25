#!/bin/bash
# Render build script with error handling

set -e  # Exit on error
set -x  # Debug output

echo "========================================="
echo "🔨 Starting Render build process..."
echo "========================================="

echo ""
echo "📍 Current directory: $(pwd)"
echo "📍 Files in current directory:"
ls -la | head -20

echo ""
echo "🧹 CACHE BUSTER: Clearing npm cache..."
npm cache clean --force || true
rm -rf node_modules backend/node_modules .npm || true

echo ""
echo "🔧 Step 1: Initialize git submodules..."
git submodule update --init --recursive --force 2>&1 || echo "⚠️  Submodule update had issues, continuing..."

echo ""
echo "📍 After submodule update:"
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
cd ..
echo "✅ Build process complete!"
echo "========================================="
