@echo off
echo Starting Backend Server...
start "Backend (Server)" /D "backend" npm start

echo Starting Frontend (Client)...
start "Frontend (Client)" /D "frontend" npm run dev

echo Both servers are starting in separate windows.
echo You can close this window now.
pause
