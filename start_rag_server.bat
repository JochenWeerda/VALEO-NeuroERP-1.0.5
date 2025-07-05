@echo off
echo Starte VALEO-NeuroERP RAG-Server...
cd /d "%~dp0"
python scripts/start_rag_server.py
pause 