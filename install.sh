#!/bin/bash
echo "--- Installing backend dependencies ---"
(cd ai-dev-suite-backend && npm install)

echo ""
echo "--- Installing frontend dependencies ---"
(cd ai-dev-suite-frontend && npm install)

echo ""
echo "--- Building frontend application ---"
(cd ai-dev-suite-frontend && npm run build)

echo ""
echo "Installation complete."