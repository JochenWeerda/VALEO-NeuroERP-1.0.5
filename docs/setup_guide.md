# Installationsanleitung für VALEO-NeuroERP Multi-Agent-Framework

Diese Anleitung führt Sie durch die Installation und Einrichtung des VALEO-NeuroERP Multi-Agent-Frameworks mit LangGraph-MCP Integration.

## Voraussetzungen

Bevor Sie beginnen, stellen Sie sicher, dass folgende Voraussetzungen erfüllt sind:

- Python 3.11 oder höher (Python 3.13 wird für die neuesten LangGraph-Funktionen empfohlen)
- pip (Python-Paketmanager)
- Git
- Ausreichend Festplattenspeicher (mindestens 2 GB)
- Internetverbindung für das Herunterladen von Abhängigkeiten

## Schritt 1: Repository klonen

Klonen Sie das VALEO-NeuroERP Repository auf Ihren lokalen Computer:

```bash
git clone https://github.com/your-organization/VALEO-NeuroERP.git
cd VALEO-NeuroERP
```

## Schritt 2: Virtuelle Umgebung erstellen

Es wird empfohlen, eine virtuelle Python-Umgebung zu erstellen, um Konflikte mit anderen Python-Projekten zu vermeiden:

```bash
# Für Windows
python -m venv venv
venv\Scripts\activate

# Für macOS/Linux
python3 -m venv venv
source venv/bin/activate
```

## Schritt 3: Abhängigkeiten installieren

Installieren Sie die erforderlichen Python-Pakete:

```bash
pip install -U "langgraph>=0.4.10" "langchain>=0.3.0" "langchain-openai>=0.3.0" "mcp>=0.0.7"
pip install -e .
```

## Schritt 4: Umgebungsvariablen konfigurieren

Erstellen Sie eine `.env`-Datei im Hauptverzeichnis des Projekts und fügen Sie die erforderlichen Umgebungsvariablen hinzu:

```bash
# .env-Datei erstellen
echo "OPENAI_API_KEY=Ihr_OpenAI_API_Schlüssel" > .env
echo "MCP_SERVER_URL=http://localhost:8000" >> .env
```

Ersetzen Sie `Ihr_OpenAI_API_Schlüssel` durch Ihren tatsächlichen OpenAI API-Schlüssel.

## Schritt 5: MCP-Server einrichten

Der MCP-Server muss separat eingerichtet werden:

```bash
# LangGraph-MCP klonen
git clone https://github.com/esxr/langgraph-mcp.git
cd langgraph-mcp

# Abhängigkeiten installieren
pip install -e .

# Konfiguration kopieren
cp mcp-servers-config.sample.json mcp-servers-config.json

# MCP-Server starten
python -m langgraph_mcp.server
```

Lassen Sie diesen Server in einem separaten Terminal-Fenster laufen.

## Schritt 6: Verzeichnisstruktur erstellen

Erstellen Sie die erforderlichen Verzeichnisse für das Framework:

```bash
# Zurück zum VALEO-NeuroERP-Verzeichnis wechseln
cd ..

# Verzeichnisse erstellen
mkdir -p memory-bank/handover
mkdir -p docs/images
```

## Schritt 7: Konfiguration anpassen

Passen Sie die Konfigurationsdateien an Ihre Bedürfnisse an:

```bash
# Öffnen Sie die Konfigurationsdatei in einem Texteditor
# Für Windows
notepad linkup_mcp\config\parallel_agent_config.py

# Für macOS/Linux
nano linkup_mcp/config/parallel_agent_config.py
```

Passen Sie die Konfigurationswerte nach Bedarf an.

## Schritt 8: Framework testen

Führen Sie einen einfachen Test aus, um sicherzustellen, dass das Framework korrekt installiert wurde:

```bash
# Testskript ausführen
python -c "from linkup_mcp.run_parallel_agents import run_task; print(run_task('Test', 'Testbeschreibung', use_mcp=True))"
```

Wenn alles korrekt installiert ist, sollten Sie eine Ausgabe sehen, die die Ergebnisse der Aufgabenausführung zeigt.

## Schritt 9: Beispielanwendung ausführen

Führen Sie die Beispielanwendung aus, um das Framework in Aktion zu sehen:

```bash
python examples/erp_module_optimization.py
```

## Fehlerbehebung

### Problem: Import-Fehler

Wenn Sie einen Import-Fehler erhalten, stellen Sie sicher, dass Sie sich im Hauptverzeichnis des Projekts befinden und die virtuelle Umgebung aktiviert ist.

### Problem: API-Schlüssel-Fehler

Wenn Sie einen Fehler im Zusammenhang mit dem OpenAI API-Schlüssel erhalten, überprüfen Sie, ob die `.env`-Datei korrekt erstellt wurde und der API-Schlüssel gültig ist.

### Problem: MCP-Server-Verbindungsfehler

Wenn Sie einen Fehler bei der Verbindung zum MCP-Server erhalten:

1. Stellen Sie sicher, dass der MCP-Server läuft
2. Überprüfen Sie die MCP-Server-URL in der `.env`-Datei
3. Überprüfen Sie, ob Firewalls oder Netzwerkeinstellungen die Verbindung blockieren

## Nächste Schritte

Nach der erfolgreichen Installation können Sie:

1. Die [Multi-Agent-Framework-Dokumentation](./multi_agent_framework_integration.md) lesen
2. Die [Phasenendpunkte](./phase_endpoints.md) verstehen
3. Die [LangGraph-MCP-Integration](./langgraph_mcp_integration.md) erkunden
4. Eigene Agenten entwickeln und in das Framework integrieren

## Support

Bei Fragen oder Problemen wenden Sie sich bitte an das VALEO-NeuroERP-Team oder erstellen Sie ein Issue im GitHub-Repository. 