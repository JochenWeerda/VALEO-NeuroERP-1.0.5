# 🛡️ FEHLERBEHANDLUNGSRICHTLINIEN für VALEO NeuroERP SDK

## 🔒 GRUNDPRINZIPIEN - NIEMALS ÜBERSCHREIBEN!

### 1. **KARDINALREGEL: KEIN CODE-ÜBERSCHREIBEN**
❌ **VERBOTEN:** Bestehende Dateien komplett ersetzen bei Fehlern  
✅ **ERLAUBT:** Behutsame Erweiterungen mit klarer Dokumentation  
⚠️ **WARNUNG:** Jede Überschreibung führt zu Produktivitätsverlust

### 2. **PROGRESSIVE FEHLERBEHANDLUNG**
1. **ERKENNEN** → Fehler identifizieren und klassifizieren
2. **DOKUMENTIEREN** → Ausführliche Logs und Error-Docs erstellen  
3. **FALLBACK** → Robuste Alternative aktivieren
4. **RECOVERY** → Schrittweise Wiederherstellung
5. **LERNEN** → Verbesserungen für zukünftige Zyklen

### 3. **APM-KONFORMITÄT BEWAHREN**
🔄 Auch bei Fehlern: **VAN → PLAN → CREATE → IMPLEMENT → REFLECT**  
📋 Jede Recovery-Aktion dokumentiert APM-Phase  
💾 RAG-Handovers bleiben intakt oder werden fallback-gespeichert

---

## 🚨 IDENTIFIZIERTE FEHLERQUELLEN UND BEHANDLUNG

### 🔑 API-KEY PROBLEME

#### **Symptome:**
- `401 Unauthorized` Responses
- `API key not found` Errors  
- `Invalid authentication` Messages

#### **ROBUSTE BEHANDLUNG:**
```python
# 1. Multi-Level Key Search
search_paths = [".env", ".env.local", "config/.env", "../.env"]

# 2. Environment Variable Scan  
for env_var in os.environ:
    if 'API' in env_var.upper() or 'KEY' in env_var.upper():
        # Verwende gefundenen Key

# 3. Template Creation als letzter Ausweg
if no_keys_found:
    create_env_template_with_guidance()
    
# 4. NIEMALS neuen Code schreiben - nur erweitern!
```

#### **STRIKT VERBOTEN:**
❌ Neue API-Integration programmieren  
❌ Authentication-System überschreiben  
❌ "Einfachere" Login-Methoden implementieren

#### **ERLAUBTE RECOVERY:**
✅ .env Template erstellen  
✅ Dokumentation aktualisieren  
✅ Alternative Key-Quellen prüfen  
✅ Offline-Modus aktivieren

---

### 📁 DATEI NICHT GEFUNDEN

#### **Symptome:**
- `FileNotFoundError`
- `No such file or directory`
- `Import ModuleNotFoundError`

#### **ROBUSTE BEHANDLUNG:**
```python
# 1. Multi-Path Search Strategy
search_locations = [
    ".", "src", "backend", "linkup_mcp", 
    "../", "scripts", "apm_framework"
]

# 2. Graceful Fallback File Creation
if file_type == ".py":
    create_minimal_python_stub()  # Nur Placeholder
elif file_type == ".json":
    create_minimal_json_structure()
    
# 3. Dependency Documentation
document_missing_dependency()
```

#### **STRIKT VERBOTEN:**
❌ Komplette neue Implementierung schreiben  
❌ Andere Bibliotheken "schnell" einbauen  
❌ Architektur-Änderungen für "einfachere" Lösung

#### **ERLAUBTE RECOVERY:**
✅ Minimale Stub-Dateien (nur Placeholder)  
✅ requirements.txt erweitern  
✅ Alternative Pfade dokumentieren  
✅ Abhängigkeits-Map erstellen

---

### 🔗 IMPORT-FEHLER

#### **Symptome:**
- `No module named 'xyz'`
- `ImportError: cannot import name`
- `ModuleNotFoundError`

#### **ROBUSTE BEHANDLUNG:**
```python
# 1. Conditional Imports mit Fallback
try:
    from external_lib import feature
    FEATURE_AVAILABLE = True
except ImportError:
    FEATURE_AVAILABLE = False
    
    # Erstelle lokalen Fallback
    def feature_fallback():
        return {"status": "fallback_mode", "data": {}}
    
    feature = feature_fallback

# 2. Requirements Management
update_requirements_txt(missing_module)
document_optional_dependency(missing_module)
```

#### **STRIKT VERBOTEN:**
❌ Alternative Bibliothek "schnell" einbauen  
❌ Funktionalität komplett neu programmieren  
❌ Import-System umschreiben

#### **ERLAUBTE RECOVERY:**
✅ Graceful Degradation mit Fallbacks  
✅ requirements.txt erweitern  
✅ Optional Dependencies dokumentieren  
✅ Feature-Flags für fehlende Module

---

### 🌐 NETZWERK-PROBLEME

#### **Symptome:**
- `ConnectionError`
- `Timeout exceptions`
- `DNS resolution failed`

#### **ROBUSTE BEHANDLUNG:**
```python
# 1. Retry-Strategie mit Exponential Backoff
@retry(tries=3, delay=1, backoff=2)
def network_operation():
    # Original operation
    
# 2. Offline-Modus Aktivierung
if network_failed:
    activate_offline_mode()
    use_local_cache()
    queue_for_later_sync()

# 3. Fallback zu lokalen Ressourcen  
if api_unavailable:
    use_local_data_store()
    simulate_api_responses()
```

#### **STRIKT VERBOTEN:**
❌ Networking-Code komplett neu schreiben  
❌ "Offline-First" Architektur implementieren  
❌ Caching-System von Grund auf bauen

#### **ERLAUBTE RECOVERY:**
✅ Offline-Modus mit lokalem Cache  
✅ Request-Queue für spätere Synchronisation  
✅ Retry-Mechanismen mit Limits  
✅ Graceful Degradation dokumentieren

---

### 💾 RAG-SPEICHER AUSFALL

#### **Symptome:**
- MongoDB Verbindung fehlgeschlagen
- RAG-API nicht erreichbar  
- Speicher-Quota überschritten

#### **ROBUSTE BEHANDLUNG:**
```python
# 1. Lokaler JSON-Fallback
if rag_unavailable:
    local_rag_store = f"logs/rag_fallback/session_{timestamp}.json"
    
    # Speichere alle Handovers lokal
    save_apm_handover_locally(phase_data)

# 2. Synchronisation bei Wiederherstellung
def sync_when_available():
    if rag_connection_restored():
        sync_local_to_rag()
        
# 3. Redundante Speicherung
always_backup_locally = True
```

#### **STRIKT VERBOTEN:**
❌ Neues RAG-System programmieren  
❌ Database-Schema ändern  
❌ Alternative Storage-Lösung "schnell" bauen

#### **ERLAUBTE RECOVERY:**
✅ Lokaler JSON-Fallback  
✅ Automatische Sync-Queues  
✅ Redundante Speicherung  
✅ Manual-Export für wichtige Daten

---

### ⚙️ APM-ZYKLUS UNTERBRECHUNG

#### **Symptome:**
- Unvollständiger VAN→PLAN→CREATE→IMPLEMENT→REFLECT Zyklus
- Handover-Daten verloren
- Phase-Zustand inkonsistent

#### **ROBUSTE BEHANDLUNG:**
```python
# 1. State-Recovery aus Logs
def recover_apm_state():
    recovery_state = load_from_file("logs/apm_recovery_state.json")
    resume_from_phase(recovery_state["last_completed_phase"])

# 2. Partielle Wiederholung statt Neustart
if phase_interrupted:
    rollback_to_last_stable_handover()
    resume_from_clean_state()
    
# 3. Minimaler Recovery-Zyklus
if full_recovery_impossible:
    execute_minimal_apm_cycle()  # Dokumentation statt volle Implementierung
```

#### **STRIKT VERBOTEN:**
❌ APM-Framework überschreiben  
❌ "Vereinfachte" Entwicklungszyklen implementieren  
❌ Phase-Reihenfolge ändern

#### **ERLAUBTE RECOVERY:**
✅ State-Recovery aus persistenten Logs  
✅ Partielle Phase-Wiederholung  
✅ Minimaler Dokumentations-Zyklus  
✅ Handover-Reconstruction aus Logs

---

## 🔧 PRAKTISCHE RECOVERY-STRATEGIEN

### 📋 FEHLER-TRIAGE-SYSTEM

#### **PRIORITÄT 1: SYSTEM-KRITISCH**
- SDK komplett nicht ausführbar
- APM-Zyklus vollständig blockiert
- Alle Module betroffen

**Recovery:** Minimal-Working-System wiederherstellen

#### **PRIORITÄT 2: FUNKTIONAL-KRITISCH**  
- Einzelne Module nicht verfügbar
- Bestimmte APM-Phasen problematisch
- Performance stark degradiert

**Recovery:** Fallback-Mechanismen aktivieren

#### **PRIORITÄT 3: CONVENIENCE-PROBLEME**
- Nicht-kritische Features fehlen
- Kosmetische Probleme
- Performance-Optimierungen

**Recovery:** Dokumentieren für späteren Fix

### 🔄 RECOVERY-LOOPS VERMEIDEN

#### **PROBLEM:** Endlose Recovery-Versuche
```python
# GEFÄHRLICH - Kann in Loop führen
while not success:
    try_recovery()  # Ohne Limit!
```

#### **LÖSUNG:** Begrenzte Recovery mit Fallback
```python
# SICHER - Mit klaren Limits
max_recovery_attempts = 3
for attempt in range(max_recovery_attempts):
    if try_recovery():
        break
else:
    activate_degraded_mode()  # Definierter Fallback
```

### 📊 ERROR-DOKUMENTATION

#### **MINIMUM-REQUIREMENTS für jeden Fehler:**
```json
{
  "timestamp": "2024-01-15T14:30:00Z",
  "error_type": "api_key_missing",
  "error_details": { ... },
  "context": "VAN phase execution",
  "recovery_attempted": true,
  "recovery_successful": false,
  "fallback_activated": "local_mode",
  "user_action_required": "Set OPENAI_API_KEY in .env",
  "prevention_strategy": "Enhanced key validation"
}
```

---

## 🎯 VALIDIERUNG DER GEHÄRTETEN SYSTEME

### ✅ CHECKLISTE vor jeder Implementierung:

1. **[ ] KEIN ÜBERSCHREIBEN bestätigt**
   - Bestehende Dateien bleiben intakt
   - Nur additive Änderungen
   - Rückwärts-Kompatibilität gewährleistet

2. **[ ] FALLBACK-MECHANISMEN implementiert**
   - Offline-Modus verfügbar
   - Lokale Speicher-Alternative
   - Graceful Degradation definiert

3. **[ ] APM-KONFORMITÄT validiert**
   - Alle Phasen weiterhin durchlaufbar
   - RAG-Handovers gesichert (lokal wenn nötig)
   - Phase-Recovery möglich

4. **[ ] ERROR-DOKUMENTATION vollständig**
   - Strukturierte Logs vorhanden
   - Recovery-Strategien dokumentiert
   - User-Actions klar definiert

5. **[ ] TESTING unter Fehlerbedingungen**
   - Alle Kommandos bei API-Ausfall getestet
   - Datei-Löschung simuliert und recovered
   - Netzwerk-Disconnection behandelt

---

## 🛡️ FINALE SICHERHEITSREGELN

### ⚠️ ABSOLUT VERBOTEN:
1. Code komplett überschreiben bei Problemen
2. APM-Framework-Reihenfolge ändern  
3. "Einfachere" Lösungen implementieren die Architektur brechen
4. Recovery-Loops ohne definierte Limits
5. Fehler ignorieren ohne Dokumentation

### ✅ IMMER ERLAUBT:
1. Minimale Fallback-Stubs erstellen
2. Lokale JSON-Backups für alles
3. Graceful Degradation mit klaren Meldungen
4. Ausführliche Error-Dokumentation
5. Benutzer über Fallback-Modi informieren

### 🔄 RECOVERY-MANTRA:
**"DOKUMENTIEREN → DEGRADIEREN → WIEDERHERSTELLEN → VERBESSERN"**

Niemals direkt "reparieren" - immer systematisch durch definierte Recovery-Phasen!

---
**🛡️ Diese Richtlinien sind bindend für alle SDK-Operationen und Cursor.ai Integrationen** 