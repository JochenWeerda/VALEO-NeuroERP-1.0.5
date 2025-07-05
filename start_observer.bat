@echo off
echo Starte Microservice Observer und Performance Optimizer...
echo.

cd backend
python start_observer.py %*

echo.
echo Observer beendet. 