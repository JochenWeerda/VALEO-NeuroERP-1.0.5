@echo off
echo Starte vereinfachten Microservice Observer...
echo.

cd backend
python start_observer_simple.py %*

echo.
echo Observer beendet. 