@echo off
chcp 65001 >nul
cd /d "%~dp0"
rem Бейби Ленд · 24.10 · качването в Cloudflare с една команда (виж kachi.mjs и CLOUDFLARE_README_BG.md т. 2)
rem Трябва Node.js 22.13+ с npx в PATH. Няма ли го — пита и го инсталира през winget (Windows иска твоето одобрение).
where node >nul 2>nul || goto nyama
where npx >nul 2>nul || goto nyama
set "NV_MAJ=0"
set "NV_MIN=0"
for /f "tokens=1,2 delims=v." %%a in ('node -v') do (
  set "NV_MAJ=%%a"
  set "NV_MIN=%%b"
)
if %NV_MAJ% LSS 22 goto nyama
if %NV_MAJ% EQU 22 if %NV_MIN% LSS 13 goto nyama
node kachi.mjs
goto kraj

:nyama
echo Трябва Node.js (веднъж, 1 минута).
set "OTG="
set /p "OTG=Да го инсталирам ли сега? [Д/н] "
if /i "%OTG%"=="н" goto otkaz
if /i "%OTG%"=="не" goto otkaz
if /i "%OTG%"=="n" goto otkaz
if /i "%OTG%"=="no" goto otkaz
where winget >nul 2>nul || goto bez_winget
winget install -e --id OpenJS.NodeJS.LTS --accept-source-agreements --accept-package-agreements
echo.
echo Затвори прозореца и пусни КАЧИ.cmd пак.
goto kraj

:bez_winget
echo Няма winget — отварям страницата на Node.js: инсталирай LTS и пусни КАЧИ.cmd пак.
start "" https://nodejs.org/bg/download
goto kraj

:otkaz
echo Нищо не е инсталирано. Без Node.js качването не може — пусни КАЧИ.cmd пак, когато решиш.

:kraj
echo.
pause
