#!/bin/bash
# Startskript für Python 3.11 (Linux/macOS)

# Fehlermeldungen anzeigen
set -e

echo -e "\033[36mAktiviere Python 3.11 Umgebung...\033[0m"
if [ -f ".venv311/bin/activate" ]; then
    source .venv311/bin/activate
else
    echo -e "\033[31mFehler: Virtuelle Umgebung nicht gefunden!\033[0m"
    exit 1
fi

echo -e "\033[32mStarte Minimalen Server...\033[0m"
python backend/minimal_server.py --port 8005 