@echo off
echo Checking for global 'serve' package...
where serve >nul 2>&1
if %errorlevel% neq 0 (
    echo 'serve' not found. Attempting to install globally...
    call npm install -g serve
) else (
    echo 'serve' is already installed.
)

echo.
echo Starting servers...
echo Frontend will be available at http://localhost:5859
echo Backend will be available at http://localhost:5858
echo.
echo Opening frontend in your default browser...

start "" http://localhost:5859

call npx concurrently "npm start --prefix ai-dev-suite-backend" "serve -s ai-dev-suite-frontend/dist -l 5859"