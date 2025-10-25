#!/bin/bash
# Direct backend start script for Render - Try multiple locations

echo "Starting backend server..."
echo "Current directory: $(pwd)"
echo ""

# Try root level first (might have latest code)
if [ -f "server.cjs" ] && [ -f "routes/googleAuth.cjs" ]; then
  echo "✅ Using root-level backend (latest code)"
  echo "Starting: node server.cjs"
  node server.cjs
  exit $?
fi

# Try /backend directory
if [ -d "backend" ] && [ -f "backend/server.cjs" ]; then
  echo "✅ Using backend/ directory"
  cd backend
  echo "Starting: node server.cjs from $(pwd)"
  node server.cjs
  exit $?
fi

# Try Render's default path
if [ -f "/opt/render/project/src/backend/server.cjs" ]; then
  echo "✅ Using /opt/render/project/src/backend"
  cd /opt/render/project/src/backend
  node server.cjs
  exit $?
fi

echo "❌ ERROR: Could not find server.cjs anywhere!"
echo "Locations tried:"
echo "  1. $(pwd)/server.cjs"
echo "  2. $(pwd)/backend/server.cjs"
echo "  3. /opt/render/project/src/backend/server.cjs"
exit 1
