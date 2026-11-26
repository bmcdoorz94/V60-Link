@echo off
title Claude live (V60)
cd /d "%~dp0"
if not exist "node_modules\@modelcontextprotocol\sdk" (
  echo Installing Claude live's parts. One time only...
  call npm install --no-audit --no-fund
)
node pair.js
echo   Starting Claude. If it warns about development channels, choose
echo   "I am using this for local development". Keep this window open.
echo.
set "CLAUDE_EXE=claude"
where claude >nul 2>nul || if exist "%USERPROFILE%\.local\bin\claude.exe" set "CLAUDE_EXE=%USERPROFILE%\.local\bin\claude.exe"
"%CLAUDE_EXE%" --dangerously-load-development-channels server:v60
pause
