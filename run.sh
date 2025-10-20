#!/bin/bash
echo "--- Checking for global 'serve' package ---"
if ! command -v serve &> /dev/null
then
    echo "'serve' could not be found. Attempting to install globally..."
    npm install -g serve
else
    echo "'serve' is already installed."
fi

echo ""
echo "--- Starting servers ---"
echo "Frontend will be available at http://localhost:5859"
echo "Backend will be available at http://localhost:5858"
echo ""
echo "Opening frontend in your default browser..."

URL="http://localhost:5859"
if command -v xdg-open &> /dev/null; then
  xdg-open "$URL"
elif command -v open &> /dev/null; then
  open "$URL"
else
  echo "Could not open browser automatically. Please navigate to $URL"
fi

npx concurrently "npm start --prefix ai-dev-suite-backend" "serve -s ai-dev-suite-frontend/dist -l 5859"