@echo off
cd /d "%~dp0"
echo ==============================================
echo   Pushing "For Vanilla" to GitHub
echo ==============================================
echo.

:: Initialize git if not already done
if not exist ".git" (
    echo [1/4] Initializing Git repository...
    git init
    git branch -M main
)

:: Check if remote origin already exists
git remote get-url origin >nul 2>&1
if %errorlevel% neq 0 (
    echo.
    echo Please paste your GitHub repository URL:
    echo (Example: https://github.com/your-username/for-vanilla.git)
    echo.
    set /p REPO_URL="Repository URL: "
    if not "%REPO_URL%"=="" (
        git remote add origin %REPO_URL%
    ) else (
        echo [ERROR] No URL entered. Aborted.
        pause
        exit /b 1
    )
)

echo.
echo [2/4] Adding all files...
git add .

echo.
echo [3/4] Creating commit...
git commit -m "For Vanilla 1-Month Experience"

echo.
echo [4/4] Pushing to GitHub main branch...
git push -u origin main

if %errorlevel% equ 0 (
    echo.
    echo ==============================================
    echo   SUCCESSFULLY PUSHED TO GITHUB!
    echo ==============================================
    echo.
    echo To turn on GitHub Pages:
    echo 1. Open your repository on github.com
    echo 2. Click "Settings" -^> "Pages"
    echo 3. Change "Source" to "GitHub Actions"
    echo 4. Your site will automatically build and go live in ~1 min!
    echo.
) else (
    echo.
    echo [NOTE] If this is your first push, make sure:
    echo 1. You created the repository on github.com
    echo 2. You are logged into git on your machine
)

echo.
pause
