@echo off
echo Starte VALEO-NeuroERP Dashboard...
cd /d "%~dp0"
python -m streamlit run scripts/streamlit_dashboard.py
pause 