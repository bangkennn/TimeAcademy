#!/bin/bash

echo "========================================"
echo "  Time Academy - Starting Server"
echo "========================================"
echo ""

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo ""
fi

echo "Starting server..."
echo ""
echo "Server will run at: http://localhost:3000"
echo "Admin panel: http://localhost:3000/admin.html"
echo ""
echo "Press Ctrl+C to stop the server"
echo ""

node server.js

