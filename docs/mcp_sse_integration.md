# MCP-Server und SSE-Integration für Streamlit

## Überblick

Basierend auf dem Hinweis von @benlau bezüglich des GitHub-Repositories [taggartbg/vibeframe](https://github.com/taggartbg/vibeframe) können wir eine ähnliche Integration für unsere Streamlit-App implementieren. Dieses Repository implementiert eine VSCode-Erweiterung, die MCPs (Model Context Protocol Server) mit Server-Sent Events (SSE) verbindet, um Echtzeit-Kommunikation zwischen verschiedenen Komponenten zu ermöglichen.

## Was ist MCP?

MCP (Model Context Protocol) ist ein Protokoll, das es ermöglicht, KI-Modelle mit verschiedenen Tools und Diensten zu verbinden. Es wird von verschiedenen KI-Assistenten wie Claude Desktop und anderen verwendet, um auf externe Funktionalitäten zuzugreifen.

## Was ist SSE?

Server-Sent Events (SSE) ist eine Technologie, die es einem Server ermöglicht, Daten in Echtzeit an Clients zu senden, ohne dass der Client wiederholt anfragen muss. Im Gegensatz zu WebSockets ist SSE eine unidirektionale Kommunikation vom Server zum Client und basiert auf HTTP.

## Integration in unsere Streamlit-App

### Vorteile der Integration

1. **Echtzeit-Updates**: Die Streamlit-App kann Echtzeit-Updates vom Backend erhalten, ohne ständiges Polling.
2. **Effiziente Kommunikation**: Reduzierung der Serverlast durch Vermeidung von wiederholten Anfragen.
3. **Verbessertes Nutzererlebnis**: Sofortige Anzeige von Änderungen und Fortschritten ohne Verzögerung.
4. **Bessere Pipeline-Fortschrittserkennung**: Echtzeit-Tracking des Pipeline-Fortschritts.
5. **Handover-Fenster**: Automatische Aktualisierung des Handover-Fensters am Ende einer Phase.

### Implementierungsansatz

#### 1. MCP-Server einrichten

```python
from modelcontextprotocol import MCPServer, Tool, ToolCall

# MCP-Server erstellen
server = MCPServer()

# Tools registrieren
@server.tool
def get_pipeline_status():
    """Gibt den aktuellen Status der Pipeline zurück."""
    # Implementierung
    return {"phase": "IMPLEMENT", "progress": 75, "status": "running"}

@server.tool
def get_handover_content():
    """Gibt den Inhalt des Handovers für die aktuelle Phase zurück."""
    # Implementierung
    return {"content": "Handover-Inhalt hier", "phase": "IMPLEMENT"}

# Server starten
server.start()
```

#### 2. SSE-Endpunkt in der Streamlit-App

```python
import streamlit as st
import time
import json
from flask import Flask, Response
import threading

app = Flask(__name__)

@app.route('/sse')
def sse():
    def event_stream():
        while True:
            # Daten vom MCP-Server abrufen
            pipeline_status = get_pipeline_status()
            yield f"event: pipeline_status\ndata: {json.dumps(pipeline_status)}\n\n"
            
            # Handover-Inhalt, wenn verfügbar
            if pipeline_status.get("status") == "completed":
                handover = get_handover_content()
                yield f"event: handover\ndata: {json.dumps(handover)}\n\n"
                
            time.sleep(1)
    
    return Response(event_stream(), mimetype="text/event-stream")

# Flask-Server in separatem Thread starten
def run_flask():
    app.run(port=5000)

threading.Thread(target=run_flask, daemon=True).start()
```

#### 3. JavaScript-Client in Streamlit

```python
def add_sse_client():
    st.markdown("""
    <script>
    const eventSource = new EventSource('http://localhost:5000/sse');
    
    eventSource.addEventListener('pipeline_status', function(event) {
        const data = JSON.parse(event.data);
        // Aktualisiere UI-Elemente mit den neuen Daten
        window.parent.postMessage({
            type: 'pipeline_status',
            data: data
        }, '*');
    });
    
    eventSource.addEventListener('handover', function(event) {
        const data = JSON.parse(event.data);
        // Zeige Handover-Fenster an
        window.parent.postMessage({
            type: 'handover',
            data: data
        }, '*');
    });
    </script>
    """, unsafe_allow_html=True)

# In der Streamlit-App aufrufen
add_sse_client()
```

#### 4. Streamlit-Komponenten für die Anzeige

```python
def create_status_components():
    # Container für Pipeline-Status
    pipeline_status_container = st.empty()
    
    # Container für Handover-Fenster
    handover_container = st.empty()
    
    # Streamlit-Session-State für die Kommunikation zwischen JavaScript und Python
    if 'pipeline_status' not in st.session_state:
        st.session_state.pipeline_status = {"phase": "none", "progress": 0, "status": "idle"}
    
    if 'handover' not in st.session_state:
        st.session_state.handover = None
    
    # Komponenten zurückgeben
    return pipeline_status_container, handover_container

# Komponenten erstellen
pipeline_status_container, handover_container = create_status_components()

# Regelmäßige Aktualisierung der Anzeige
def update_display():
    # Pipeline-Status anzeigen
    status = st.session_state.pipeline_status
    pipeline_status_container.progress(status["progress"] / 100)
    pipeline_status_container.text(f"Phase: {status['phase']} - Status: {status['status']}")
    
    # Handover anzeigen, wenn vorhanden
    if st.session_state.handover:
        with handover_container.container():
            st.markdown("## Handover")
            st.markdown(st.session_state.handover["content"])
            if st.button("Handover akzeptieren"):
                # Handover verarbeiten
                st.session_state.handover = None
```

### Integration mit cursor.ai

Um von ChatGPT generierte Prompts in das Chat-Fenster von cursor.ai zu übergeben, können wir einen ähnlichen Ansatz verwenden:

```python
def generate_and_transfer_prompt(handover_content, review_changes):
    # Prompt mit ChatGPT generieren
    prompt_template = f"""
    Basierend auf folgendem Handover:
    {handover_content}
    
    Und diesen Review-Änderungen:
    {review_changes}
    
    Generiere einen optimalen Prompt für die nächste Phase des GENXAIS-Frameworks.
    """
    
    # API-Aufruf an ChatGPT
    response = call_chatgpt_api(prompt_template)
    generated_prompt = response.generated_prompt
    
    # SSE-Event senden, um den Prompt an cursor.ai zu übergeben
    send_sse_event('cursor_prompt', {
        'prompt': generated_prompt
    })
    
    return generated_prompt
```

Auf der Client-Seite kann ein entsprechender Event-Listener implementiert werden, der den Prompt in die Zwischenablage kopiert oder direkt an cursor.ai übergibt, falls eine API verfügbar ist.

## Implementierungsplan

1. **Phase 1: Grundlegende SSE-Integration**
   - Implementierung des SSE-Servers
   - Einrichtung der Event-Listener in Streamlit
   - Grundlegende Statusaktualisierungen

2. **Phase 2: MCP-Server-Integration**
   - Implementierung des MCP-Servers
   - Registrierung der benötigten Tools
   - Verbindung zwischen MCP-Server und SSE

3. **Phase 3: Erweiterte Funktionalitäten**
   - Handover-Fenster-Integration
   - Prompt-Generierung und -Übertragung
   - Fehlerbehandlung und Wiederverbindungslogik

## Ressourcen und Referenzen

- [taggartbg/vibeframe](https://github.com/taggartbg/vibeframe) - VSCode-Erweiterung für MCP-Server mit SSE
- [node-red-contrib-server-sent-events](https://github.com/tq-bit/node-red-contrib-server-sent-events) - SSE-Implementation für Node-RED
- [mcp-proxy](https://github.com/sparfenyuk/mcp-proxy) - Proxy für MCP-Server
- [VSCode MCP Server](https://marketplace.visualstudio.com/items?itemName=SemanticWorkbenchTeam.mcp-server-vscode) - VSCode-Erweiterung für MCP-Server
- [VSCode as MCP Server](https://marketplace.visualstudio.com/items?itemName=acomagu.vscode-as-mcp-server) - VSCode als MCP-Server

## Fazit

Die Integration von MCP-Servern mit SSE bietet eine leistungsstarke Möglichkeit, Echtzeit-Updates in unserer Streamlit-App zu implementieren. Dies verbessert nicht nur die Benutzererfahrung, sondern ermöglicht auch eine nahtlose Integration mit KI-Assistenten und anderen Tools. Durch die Implementierung dieser Technologien können wir die identifizierten Probleme mit der Versionsnummernanzeige, der Pipeline-Fortschrittserkennung und dem fehlenden Handover-Fenster effektiv lösen. 