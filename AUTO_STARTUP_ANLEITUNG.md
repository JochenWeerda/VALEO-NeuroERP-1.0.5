# 🚀 VALEO NeuroERP - Automatisches Startup nach Neustart

## ✅ Vorbereitung abgeschlossen!

Alle Services sind jetzt eingerichtet und funktionsfähig. Nach einem Neustart können Sie alles automatisch wieder starten.

## 🔧 Verfügbare Scripts

### 1. `startup-services.bat` - Alles starten
```batch
# Startet alle Services automatisch
startup-services.bat
```

**Startet:**
- ✅ n8n Container (Port 5678)
- ✅ Schema MCP Server (Port 8000)
- ✅ UI Metadata MCP Server (Port 8001)
- ✅ Automatische Tests aller Services

### 2. `stop-services.bat` - Alles stoppen
```batch
# Stoppt alle Services sauber
stop-services.bat
```

**Stoppt:**
- 🛑 n8n Container
- 🛑 Python-Server
- 🛑 Port-Freigabe

### 3. `check-services.bat` - Status prüfen
```batch
# Prüft den Status aller Services
check-services.bat
```

**Prüft:**
- 🔍 n8n Container Status
- 🔍 MCP-Server Verfügbarkeit
- 🔍 HTTP-Endpunkte

## 🎯 Workflow nach Neustart

### Schritt 1: Services starten
```batch
# Nach Neustart ausführen
startup-services.bat
```

### Schritt 2: Status prüfen
```batch
# Verifikation
check-services.bat
```

### Schritt 3: Cursor starten
- Cursor.ai öffnen
- Projekt öffnen: `C:\Users\Jochen\VALEO-NeuroERP-2.0`

## 🌐 Service-URLs

Nach erfolgreichem Startup sind verfügbar:

| Service | URL | Login |
|---------|-----|-------|
| **n8n Dashboard** | http://localhost:5678 | admin / valeo2024 |
| **Schema MCP API** | http://localhost:8000 | - |
| **UI Metadata API** | http://localhost:8001 | - |

## 🔄 Automatisches Startup einrichten

### Option 1: Windows Startup-Ordner
1. **Windows + R** → `shell:startup` eingeben
2. **Verknüpfung** zu `startup-services.bat` erstellen
3. **Automatischer Start** nach jedem Neustart

### Option 2: Desktop-Verknüpfung
1. **Verknüpfung** zu `startup-services.bat` auf Desktop erstellen
2. **Nach Neustart** doppelklicken

### Option 3: Manueller Start
```batch
# Nach Neustart manuell ausführen
cd C:\Users\Jochen\VALEO-NeuroERP-2.0
startup-services.bat
```

## 🧪 Test der Integration

### 1. Dual-MCP Demo testen
```typescript
// In Cursor: frontend/src/examples/DualMCPDemo.tsx
// Zeigt kombinierte Schema- und UI-Metadaten
```

### 2. n8n Workflow importieren
1. **n8n öffnen**: http://localhost:5678
2. **Login**: admin / valeo2024
3. **Workflow importieren**: `n8n-flows/dual-mcp-cursor-automation.json`

### 3. API-Endpunkte testen
```bash
# Schema MCP
curl http://localhost:8000/api/tables

# UI Metadata MCP
curl http://localhost:8001/ui/tables

# n8n Dashboard
curl http://localhost:5678
```

## 🛠️ Troubleshooting

### Problem: Services starten nicht
```batch
# 1. Alles stoppen
stop-services.bat

# 2. Neu starten
startup-services.bat

# 3. Status prüfen
check-services.bat
```

### Problem: Ports belegt
```batch
# Ports prüfen
netstat -an | findstr ":8000\|:8001\|:5678"

# Bei Bedarf Prozesse beenden
taskkill /f /im python.exe
docker stop valeo-n8n
```

### Problem: Docker Container startet nicht
```batch
# Container neu erstellen
docker rm -f valeo-n8n
startup-services.bat
```

## 📋 Checkliste nach Neustart

- [ ] **Services starten**: `startup-services.bat`
- [ ] **Status prüfen**: `check-services.bat`
- [ ] **n8n Dashboard**: http://localhost:5678 (admin / valeo2024)
- [ ] **Cursor starten** und Projekt öffnen
- [ ] **Dual-MCP Demo** testen
- [ ] **n8n Workflow** importieren

## 🎉 Erfolgreiche Integration

### Was funktioniert:
- ✅ **Automatisches Startup** aller Services
- ✅ **Dual-MCP-Architektur** (Schema + UI Metadata)
- ✅ **n8n-Integration** mit Cursor AI
- ✅ **React-Komponenten-Generierung** über MCP
- ✅ **Sauberes Shutdown** und Restart

### Nächste Schritte:
1. **Cursor neu starten** und Integration testen
2. **n8n Workflows** für Automatisierung nutzen
3. **React-Komponenten** über Dual-MCP generieren
4. **Produktions-Setup** vorbereiten

---

**VALEO NeuroERP - Automatisches Startup-System**  
*Bereit für produktive Entwicklung nach Neustart* 🚀 