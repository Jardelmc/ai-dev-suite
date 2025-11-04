@echo off
echo Installing backend dependencies...
cd ai-dev-suite-backend
call npm install
cd ..

echo.
echo Installing frontend dependencies...
cd ai-dev-suite-frontend
call npm install
cd ..

echo.
echo Installing root dependencies (fs-extra)...
call npm install

echo.
echo Building frontend application...
call npm run build

echo.
echo Installation complete.
pause