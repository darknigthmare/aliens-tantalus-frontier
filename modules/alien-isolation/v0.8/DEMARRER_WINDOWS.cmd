@echo off
setlocal
cd /d "%~dp0"
where node >nul 2>nul
if errorlevel 1 (
 echo Node.js 20 ou plus recent est requis pour ce lanceur local.
 echo Le fichier JOUER_ISOLATION.html reste disponible sans installation.
 pause
 exit /b 1
)
node tools\serve.mjs --open
pause
