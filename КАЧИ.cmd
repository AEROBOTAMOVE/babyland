@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Babyland 24.10: kachvaneto v Cloudflare s edna komanda (kachi.mjs, CLOUDFLARE_README_BG.md t. 2)
rem 1) ima li Node.js 22.13+ s npx (nyama -> pita i go slaga samo pri "D")  2) node kachi.mjs
"%SystemRoot%\System32\WindowsPowerShell\v1.0\powershell.exe" -NoProfile -ExecutionPolicy Bypass -File "%~dp0nujen_node.ps1"
if errorlevel 1 goto krai
node kachi.mjs
:krai
echo.
pause
