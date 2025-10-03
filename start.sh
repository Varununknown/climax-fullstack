#!/bin/bash
# Debug: Show current directory
echo "Current directory: $(pwd)"
echo "Files in current directory:"
ls -la

# Find and navigate to project root
cd /opt/render/project
echo "Changed to: $(pwd)"
echo "Files here:"
ls -la

# Start the server
node backend/server.cjs