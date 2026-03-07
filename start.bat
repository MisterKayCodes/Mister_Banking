@echo off
echo Starting Mister Banking Systems...

:: Start Backend Window
start "Mister Banking Backend" cmd /k "cd /d c:\Kaycris\Mister_Banking && call venv\Scripts\activate && uvicorn app.main:app --host 0.0.0.0 --port 5000 --reload"

:: Start Frontend Window
start "Mister Banking Frontend" cmd /k "cd /d c:\Kaycris\Mister_Banking\sterling-archer-ui && npm start"

echo Servers launched in separate windows.
