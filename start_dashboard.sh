#!/bin/bash
# Shell-Skript zum Starten des zentralen VALEO-NeuroERP Dashboards

echo
echo "==================================================="
echo "VALEO-NeuroERP Dashboard starten..."
echo "==================================================="
echo

# Pr�fe, ob Python installiert ist
if ! command -v python3 &> /dev/null; then
    echo "Python ist nicht installiert. Bitte installieren Sie Python 3.8 oder h�her."
    exit 1
fi

# Pr�fe, ob die erforderlichen Dateien existieren
if [ ! -f "scripts/streamlit_dashboard.py" ]; then
    echo "Fehler: scripts/streamlit_dashboard.py nicht gefunden."
    exit 1
fi

# Pr�fe, ob Streamlit installiert ist
if ! python3 -c "import streamlit" &> /dev/null; then
    echo "Streamlit ist nicht installiert. Installation wird gestartet..."
    python3 -m pip install streamlit
    if [ $? -ne 0 ]; then
        echo "Fehler bei der Installation von Streamlit."
        exit 1
    fi
fi

# Starte das Dashboard
echo "Starte VALEO-NeuroERP Dashboard..."
python3 -m streamlit run scripts/streamlit_dashboard.py &

echo "Dashboard gestartet. �ffne http://localhost:8501 in deinem Browser."
echo
