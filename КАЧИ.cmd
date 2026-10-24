@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Бейби Ленд · 24.10 · качването в Cloudflare с една команда (виж kachi.mjs и CLOUDFLARE_README_BG.md т. 2)
rem node: от PATH, а ако го няма там — този, който вече е на машината (кешът на Codex)
set "NODE=node"
where node >nul 2>nul
if errorlevel 1 set "NODE=%USERPROFILE%\.cache\codex-runtimes\codex-primary-runtime\dependencies\node\bin\node.exe"
if not "%NODE%"=="node" if not exist "%NODE%" (
  echo СПРЯНО · Node · няма Node.js — инсталирай Node.js LTS от https://nodejs.org и пусни КАЧИ.cmd пак
  goto kraj
)
"%NODE%" kachi.mjs
:kraj
echo.
pause
