#!/bin/bash
# Render build script to properly initialize submodules and dependencies

set -e  # Exit on error

echo "🔧 Initializing git submodules..."
git submodule update --init --recursive

echo "📦 Installing root dependencies..."
npm install

echo "📦 Installing backend dependencies..."
cd backend
npm install --production

echo "📦 Backend directory contents:"
ls -la

echo "🔍 Checking server.cjs exists..."
test -f server.cjs && echo "✅ server.cjs found" || echo "❌ server.cjs NOT found!"

cd ..
echo "✅ Build complete!"
