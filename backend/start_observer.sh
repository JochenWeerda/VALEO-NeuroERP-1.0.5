#!/bin/bash

echo "Observer-Microservice wird gestartet..."
echo

# Prüfen, ob Python installiert ist
if ! command -v python3 &> /dev/null; then
    echo "Fehler: Python ist nicht installiert."
    echo "Bitte installieren Sie Python und versuchen Sie es erneut."
    exit 1
fi

# Prüfen, ob die Abhängigkeiten installiert sind
echo "Installiere/Aktualisiere Abhängigkeiten..."
python3 -m pip install -r observer_requirements.txt

# Starten des Observer-Services auf Port 8010
echo
echo "Observer-Service wird gestartet auf Port 8010"
echo "Dashboard wird verfügbar sein unter: http://localhost:8010"
echo
echo "Drücken Sie STRG+C, um den Service zu beenden."
echo

python3 start_observer_simple.py --port 8010 --report-interval 15

echo "Observer-Service wurde beendet." 