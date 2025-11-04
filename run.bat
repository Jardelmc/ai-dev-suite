@echo off

echo.
echo Starting server...
echo AI Dev Suite will be available at http://localhost:5858
echo.
echo Opening frontend in your default browser...

start "" http://localhost:5858

call npm start --prefix ai-dev-suite-backend