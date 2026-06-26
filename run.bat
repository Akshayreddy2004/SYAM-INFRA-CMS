@echo off
echo Starting SYAM INFRA CMS...

echo Starting Backend...
cd backend
start cmd /k "venv\Scripts\activate && uvicorn app.main:app --reload"
cd ..

echo Starting Frontend...
cd frontend
start cmd /k "npm run dev"
cd ..

echo Both servers are starting in separate windows.
