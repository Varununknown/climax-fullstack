#!/bin/bash
# Direct backend start script for Render

cd /opt/render/project/src/backend 2>/dev/null || cd ./backend || cd $(dirname $0)/backend

echo "📍 Starting from: $(pwd)"
echo "🔍 Files:"
ls -la

echo ""
echo "🚀 Starting Node.js backend..."
node server.cjs
