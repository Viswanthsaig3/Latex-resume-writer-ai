@echo off
echo Starting LaTeX Resume Editor Backend Server...
cd /d %~dp0
npm install
node server.js
pause
