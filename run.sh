#!/bin/bash

echo ""
echo "Starting server..."
echo "AI Dev Suite will be available at http://localhost:5858"
echo ""
echo "Opening frontend in your default browser..."

URL="http://localhost:5858"
if command -v xdg-open &> /dev/null;
then
  xdg-open "$URL"
elif command -v open &> /dev/null; then
  open "$URL"
else
  echo "Could not open browser automatically. Please navigate to $URL"
fi

npm start --prefix ai-dev-suite-backend