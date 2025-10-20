@echo off
echo Installing backend dependencies...
cd ai-dev-suite-backend
call npm install
cd ..

echo.
echo Installing frontend dependencies...
cd ai-dev-suite-frontend
call npm install

echo.
echo Building frontend application...
call npm run build
cd ..

echo.
echo Installation complete.
pause