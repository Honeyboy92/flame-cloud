@echo off
echo ============================================
echo FLAME CLOUD - GITHUB PUSH SCRIPT
echo ============================================
echo.

REM Check if Git is installed
where git >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Git is not installed!
    echo.
    echo Please install Git first:
    echo 1. Go to: https://git-scm.com/download/win
    echo 2. Download and install Git
    echo 3. Restart this script
    echo.
    pause
    exit /b 1
)

echo Git found! Proceeding with push...
echo.

REM Initialize Git
echo [1/8] Initializing Git repository...
git init
if %ERRORLEVEL% NEQ 0 (
    echo Git already initialized or error occurred
)
echo.

REM Rename gitignore
echo [2/8] Renaming gitignore to .gitignore...
if exist gitignore (
    ren gitignore .gitignore
    echo .gitignore created successfully
) else (
    echo .gitignore already exists or gitignore not found
)
echo.

REM Add all files
echo [3/8] Adding all files to Git...
git add .
echo.

REM Commit
echo [4/8] Committing files...
git commit -m "Flame Cloud - Complete deployment ready with fixed SQL"
echo.

REM Ask for GitHub username
echo [5/8] GitHub Setup
set /p GITHUB_USERNAME="Enter your GitHub username: "
echo.

REM Add remote
echo [6/8] Adding GitHub remote...
git remote remove origin 2>nul
git remote add origin https://github.com/%GITHUB_USERNAME%/flame-cloud.git
echo Remote added: https://github.com/%GITHUB_USERNAME%/flame-cloud.git
echo.

REM Rename branch
echo [7/8] Renaming branch to main...
git branch -M main
echo.

REM Push to GitHub
echo [8/8] Pushing to GitHub...
echo.
echo NOTE: You will need to enter your GitHub credentials:
echo - Username: Your GitHub username
echo - Password: Use Personal Access Token (NOT your password!)
echo.
echo To create a token:
echo 1. Go to: https://github.com/settings/tokens
echo 2. Generate new token (classic)
echo 3. Select 'repo' scope
echo 4. Copy the token and use it as password
echo.
pause
echo.
git push -u origin main
echo.

if %ERRORLEVEL% EQU 0 (
    echo ============================================
    echo SUCCESS! Code pushed to GitHub!
    echo ============================================
    echo.
    echo Your repository: https://github.com/%GITHUB_USERNAME%/flame-cloud
    echo.
    echo Next steps:
    echo 1. Verify files on GitHub
    echo 2. Setup Supabase (run COMPLETE-BACKEND-SETUP.sql)
    echo 3. Deploy to Vercel
    echo.
    echo Read: DEPLOYMENT-GUIDE.md for next steps
) else (
    echo ============================================
    echo ERROR: Push failed!
    echo ============================================
    echo.
    echo Common issues:
    echo 1. Repository doesn't exist on GitHub - Create it first!
    echo 2. Wrong credentials - Use Personal Access Token
    echo 3. Permission denied - Check repository access
    echo.
    echo Read: PUSH-TO-GITHUB.md for help
)

echo.
pause
