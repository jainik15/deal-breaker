@echo off
ECHO --- STARTING DEAL-BREAKER AI PROJECT ---

:: Check and start FastAPI Backend
ECHO.
ECHO [1/2] Starting Python Backend (FastAPI)...
start cmd /k "cd backend && call venv\Scripts\activate && uvicorn app.main:app --reload"

:: Check and start React Frontend
ECHO.
ECHO [2/2] Starting React Frontend (Vite)...
start cmd /k "cd frontend && npm run dev"

ECHO.
ECHO ========================================================
ECHO Project Launch Complete.
ECHO You can now open http://localhost:5173 in your browser.
ECHO ========================================================