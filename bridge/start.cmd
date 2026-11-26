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
claude --dangerously-load-development-channels server:v60
pause
