# 🛡️ VALEO NeuroERP - Gehärtete SDK-Kommandos für Cursor.ai Sidebar

## 🔒 Robuste Warenwirtschafts-SDK Befehle

Diese Kommandos verwenden das gehärtete Error-Handling-Framework und überschreiben niemals bestehenden Code.

### 📋 Verfügbare Kommandos

#### 🚀 Vollständige APM-Pipeline (ROBUST)
```bash
python hardened_warenwirtschaft_sdk.py start
```
**Beschreibung:** Startet den kompletten APM-Zyklus (VAN → PLAN → CREATE → IMPLEMENT → REFLECT) mit robuster Fehlerbehandlung
- ✅ Error Recovery aktiv
- ✅ RAG-Fallback-Mechanismen
- ✅ Niemals Code überschreiben
- ✅ Lokale Backup-Speicherung

#### 🔧 Sichere Einzelmodul-Entwicklung
```bash
python hardened_warenwirtschaft_sdk.py module [MODULE_NAME]
```
**Verfügbare Module:**
- `artikel_stammdaten` - Artikel-Master-Data Management
- `bestandsführung` - Inventory Management mit IoT
- `ai_ml_integration` - ML-Pipeline Integration  
- `mobile_analytics` - Mobile Apps & Analytics

**Beispiel:**
```bash
python hardened_warenwirtschaft_sdk.py module artikel_stammdaten
```

#### ⚡ Fehler-sichere Optimierung
```bash
python hardened_warenwirtschaft_sdk.py optimize
```
**Features:**
- 5 Warenwirtschafts-spezifische Optimierungsaufgaben
- Robuste Validation mit Fallbacks
- Performance-Verbesserungen ohne Risiko

#### 📊 Robustes Performance-Monitoring
```bash
python hardened_warenwirtschaft_sdk.py monitor
```
**Überwacht:**
- Entwicklungsgeschwindigkeit
- Fehlerbehandlung-Coverage
- Code-Qualität Metriken
- System-Ausfallsicherheit

### 🛡️ Error Handling Features

#### 🔑 API Key Recovery
- Automatische Suche in `.env` Dateien
- Umgebungsvariablen-Scan
- Template-Erstellung bei fehlenden Keys

#### 📁 File Recovery
- Alternative Pfad-Suche
- Minimale Fallback-Dateien
- Graceful Degradation

#### 🔄 APM Cycle Recovery
- Unterbrechungs-Behandlung
- Phase-Wiederherstellung
- RAG-Handover-Backup

#### 💾 RAG Fallback System
- Lokale JSON-Speicherung
- MongoDB-Alternative
- Automatische Synchronisation

### 📂 Generierte Dateien und Logs

#### Error Documentation
```
logs/
├── sdk_errors.log                    # Hauptfehler-Log
├── error_docs/                       # Detaillierte Fehlerdokumentation
│   └── error_YYYYMMDD_HHMMSS.json
├── rag_fallback/                     # RAG-Backup bei Ausfall
│   └── rag_YYYYMMDD_HHMMSS.json
└── apm_recovery_state.json           # APM-Wiederherstellungsstand
```

#### Configuration Files
```
config/
├── warenwirtschaft_config.json       # Haupt-Konfiguration
└── .env                              # Umgebungsvariablen
```

### 🔧 Troubleshooting

#### Bei API-Key-Problemen:
1. Prüfe `.env` Dateien in aktuellen und Parent-Verzeichnissen
2. Nutze erstellte `.env.template` als Vorlage
3. Setze Umgebungsvariablen im System

#### Bei Datei-Nicht-Gefunden-Fehlern:
1. SDK sucht automatisch in mehreren Pfaden
2. Erstellt minimale Fallback-Dateien
3. Dokumentiert fehlende Abhängigkeiten

#### Bei Import-Fehlern:
1. Prüfe `requirements.txt` (wird automatisch erstellt)
2. Aktiviere Virtual Environment
3. Installiere fehlende Pakete: `pip install -r requirements.txt`

### 🚀 Quick Start für Cursor.ai

1. **Teste SDK-Verfügbarkeit:**
   ```bash
   python hardened_warenwirtschaft_sdk.py
   ```

2. **Starte robuste Entwicklung:**
   ```bash
   python hardened_warenwirtschaft_sdk.py start
   ```

3. **Entwickle spezifisches Modul:**
   ```bash
   python hardened_warenwirtschaft_sdk.py module bestandsführung
   ```

4. **Optimiere kontinuierlich:**
   ```bash
   python hardened_warenwirtschaft_sdk.py optimize
   ```

5. **Überwache Performance:**
   ```bash
   python hardened_warenwirtschaft_sdk.py monitor
   ```

### 🎯 Wichtige Sicherheitsregeln

⚠️ **NIEMALS ÜBERSCHREIBEN:** Das gehärtete SDK überschreibt niemals bestehenden Code
✅ **BEHUTSAME ERWEITERUNG:** Nur schrittweise, dokumentierte Verbesserungen
🔄 **APM-KONFORMITÄT:** Alle Operationen folgen dem APM Framework
📋 **VOLLSTÄNDIGE DOKUMENTATION:** Jeder Fehler wird ausführlich dokumentiert
💾 **FALLBACK-READY:** Multiple Backup-Mechanismen für Ausfallsicherheit

### 🔗 Integration mit anderen Tools

#### VS Code / Cursor Integration:
- Kommandos in `tasks.json` einbinden
- Error-Logs automatisch öffnen
- Git-Hooks für Sicherheit

#### CI/CD Pipeline:
- Robuste Tests vor Deployment
- Error-Recovery in Build-Process
- Automatische Fallback-Aktivierung

#### Monitoring Integration:
- Prometheus-Metriken Export
- Grafana-Dashboards
- Alert-Manager Regeln

---
**🛡️ ROBUSTES SDK - Entwickelt für maximale Ausfallsicherheit und Produktivität** 