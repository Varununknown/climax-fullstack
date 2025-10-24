#!/bin/bash
# Render build script to properly initialize submodules

echo "🔧 Initializing git submodules..."
git submodule update --init --recursive

echo "📦 Installing backend dependencies..."
cd backend
npm install

echo "✅ Build complete!"
