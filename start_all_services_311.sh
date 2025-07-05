#!/bin/bash
# Start aller Dienste mit Python 3.11
# Aktiviere die virtuelle Umgebung

set -e

echo -e "\033[36mAktiviere Python 3.11 Umgebung...\033[0m"
if [ -f ".venv311/bin/activate" ]; then
    source .venv311/bin/activate
else
    echo -e "\033[31mFehler: Virtuelle Umgebung nicht gefunden!\033[0m"
    exit 1
fi

# Verzeichnisse für Logs erstellen
if [ ! -d "logs" ]; then
    mkdir -p logs
fi

# Starte den minimalen Server im Hintergrund
echo -e "\033[32mStarte Minimalen Server...\033[0m"
python backend/minimal_server.py --port 8005 > logs/minimal_server.log 2> logs/minimal_server_error.log &
MINIMAL_SERVER_PID=$!

# Starte den Observer-Service im Hintergrund
echo -e "\033[32mStarte Observer-Service...\033[0m"
python backend/start_observer_311_fixed.py --port 8010 > logs/observer_service.log 2> logs/observer_service_error.log &
OBSERVER_SERVICE_PID=$!

# Starte den Finance-Service im Hintergrund
echo -e "\033[32mStarte Finance-Service...\033[0m"
python backend/simple_finance_server.py --port 8007 > logs/finance_service.log 2> logs/finance_service_error.log &
FINANCE_SERVICE_PID=$!

# Warte, bis die Dienste gestartet sind
echo -e "\033[33mWarte, bis alle Dienste gestartet sind...\033[0m"
sleep 5

# Teste die Dienste
echo -e "\033[36mTeste Dienste...\033[0m"

# Funktion zum Testen eines Dienstes
test_service() {
    local url=$1
    local name=$2
    
    if curl -s "$url" > /dev/null; then
        echo -e "\033[32m$name: OK\033[0m"
        return 0
    else
        echo -e "\033[31m$name: Fehler\033[0m"
        return 1
    fi
}

test_service "http://localhost:8005/health" "Minimaler Server"
test_service "http://localhost:8010/health" "Observer-Service"
test_service "http://localhost:8007/health" "Finance-Service"

echo -e "\033[33m\nAlle Dienste wurden gestartet. Drücken Sie STRG+C, um alle Dienste zu beenden.\033[0m"

# Funktion zum Beenden aller Prozesse
cleanup() {
    echo -e "\n\033[33mBeende alle Dienste...\033[0m"
    
    if ps -p $MINIMAL_SERVER_PID > /dev/null; then
        kill $MINIMAL_SERVER_PID
        echo -e "\033[36mMinimaler Server beendet.\033[0m"
    fi
    
    if ps -p $OBSERVER_SERVICE_PID > /dev/null; then
        kill $OBSERVER_SERVICE_PID
        echo -e "\033[36mObserver-Service beendet.\033[0m"
    fi
    
    if ps -p $FINANCE_SERVICE_PID > /dev/null; then
        kill $FINANCE_SERVICE_PID
        echo -e "\033[36mFinance-Service beendet.\033[0m"
    fi
    
    echo -e "\033[32mAlle Dienste wurden beendet.\033[0m"
    exit 0
}

# Registriere Cleanup-Funktion für SIGINT (STRG+C)
trap cleanup SIGINT

# Warte auf Benutzerabbruch
while true; do
    sleep 1
done 