#!/bin/bash

# VALEO-NeuroERP v1.8.1 Startup Script
# Dieses Skript startet alle Komponenten des VALEO-NeuroERP-Systems

# Farben für die Ausgabe
GREEN='\033[0;32m'
BLUE='\033[0;34m'
RED='\033[0;31m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Banner anzeigen
echo -e "${BLUE}"
echo "██╗   ██╗ █████╗ ██╗     ███████╗ ██████╗       ███╗   ██╗███████╗██╗   ██╗██████╗  ██████╗ ███████╗██████╗ ██████╗ "
echo "██║   ██║██╔══██╗██║     ██╔════╝██╔═══██╗      ████╗  ██║██╔════╝██║   ██║██╔══██╗██╔═══██╗██╔════╝██╔══██╗██╔══██╗"
echo "██║   ██║███████║██║     █████╗  ██║   ██║█████╗██╔██╗ ██║█████╗  ██║   ██║██████╔╝██║   ██║█████╗  ██████╔╝██████╔╝"
echo "╚██╗ ██╔╝██╔══██║██║     ██╔══╝  ██║   ██║╚════╝██║╚██╗██║██╔══╝  ██║   ██║██╔══██╗██║   ██║██╔══╝  ██╔══██╗██╔═══╝ "
echo " ╚████╔╝ ██║  ██║███████╗███████╗╚██████╔╝      ██║ ╚████║███████╗╚██████╔╝██║  ██║╚██████╔╝███████╗██║  ██║██║     "
echo "  ╚═══╝  ╚═╝  ╚═╝╚══════╝╚══════╝ ╚═════╝       ╚═╝  ╚═══╝╚══════╝ ╚═════╝ ╚═╝  ╚═╝ ╚═════╝ ╚══════╝╚═╝  ╚═╝╚═╝     "
echo -e "${NC}"
echo -e "${YELLOW}Version 1.8.1 - Edge Integration & Cursor.ai${NC}"
echo ""

# Prüfen, ob Python installiert ist
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Fehler: Python 3 ist nicht installiert.${NC}"
    exit 1
fi

# Prüfen, ob die virtuelle Umgebung existiert
if [ ! -d "venv" ]; then
    echo -e "${YELLOW}Virtuelle Umgebung nicht gefunden. Erstelle neue Umgebung...${NC}"
    python3 -m venv venv
    
    # Aktivieren der virtuellen Umgebung
    source venv/bin/activate
    
    # Installieren der Abhängigkeiten
    echo -e "${BLUE}Installiere Abhängigkeiten...${NC}"
    pip install -r requirements.txt
else
    # Aktivieren der virtuellen Umgebung
    source venv/bin/activate
fi

# Verzeichnisse erstellen, falls sie nicht existieren
mkdir -p data/cursor_prompts/specs
mkdir -p data/handover
mkdir -p logs

# Umgebungsvariablen aus .env laden, falls vorhanden
if [ -f ".env" ]; then
    echo -e "${BLUE}Lade Umgebungsvariablen aus .env...${NC}"
    export $(grep -v '^#' .env | xargs)
fi

# Cursor Task-Verzeichnis erstellen
CURSOR_TASK_DIR="$HOME/cursor-tasks"
mkdir -p "$CURSOR_TASK_DIR"
echo -e "${BLUE}Cursor Task-Verzeichnis erstellt: $CURSOR_TASK_DIR${NC}"

# Starte den MCP-Server und die Cursor.ai-Integration in separaten Prozessen
echo -e "${GREEN}Starte MCP-Server und Cursor.ai-Integration...${NC}"

# Logdateien
LOG_DIR="logs"
mkdir -p $LOG_DIR
STREAMLIT_LOG="$LOG_DIR/streamlit_app.log"
CURSOR_LOG="$LOG_DIR/cursor_integration.log"

# Starte die Cursor.ai-Integration im Hintergrund
echo -e "${BLUE}Starte Cursor.ai-Integration...${NC}"
python scripts/cursor_prompt_integration.py > $CURSOR_LOG 2>&1 &
CURSOR_PID=$!
echo -e "${GREEN}Cursor.ai-Integration gestartet (PID: $CURSOR_PID)${NC}"

# Warte kurz, damit die Cursor.ai-Integration starten kann
sleep 2

# Starte die Streamlit-App
echo -e "${BLUE}Starte Streamlit-App...${NC}"
echo -e "${YELLOW}Die App wird im Browser geöffnet...${NC}"
streamlit run scripts/streamlit_app_mcp_integration.py > $STREAMLIT_LOG 2>&1 &
STREAMLIT_PID=$!

# Warte kurz, damit die App starten kann
sleep 5

# Öffne den Browser (plattformunabhängig)
if command -v xdg-open &> /dev/null; then
    xdg-open http://localhost:8501
elif command -v open &> /dev/null; then
    open http://localhost:8501
elif command -v start &> /dev/null; then
    start http://localhost:8501
fi

echo -e "${GREEN}VALEO-NeuroERP v1.8.1 wurde gestartet!${NC}"
echo -e "${BLUE}Streamlit-App läuft auf: ${YELLOW}http://localhost:8501${NC}"
echo -e "${BLUE}MCP-Server läuft auf: ${YELLOW}http://localhost:6010${NC}"
echo ""
echo -e "${YELLOW}Drücke Strg+C, um alle Prozesse zu beenden${NC}"

# Warte auf Benutzerunterbrechung
trap 'echo -e "${RED}Beende Prozesse...${NC}"; kill $CURSOR_PID $STREAMLIT_PID; exit 0' INT
wait 