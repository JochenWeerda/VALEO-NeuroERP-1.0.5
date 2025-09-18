# Ollama-Integration für den VAN-Modus

## Übersicht

Die Ollama-Integration ermöglicht es dem VAN-Modus, lokale Large Language Models (LLMs) zu nutzen. Dies bietet mehrere Vorteile:

- **Kostenlos**: Keine API-Gebühren
- **Privat**: Alle Daten bleiben lokal
- **Schnell**: Keine Netzwerk-Latenz
- **Flexibel**: Verschiedene Modelle verfügbar

## Installation

### 1. Ollama installieren

#### Windows
```bash
# Download von https://ollama.ai/download
# Oder mit winget
winget install Ollama.Ollama
```

#### macOS
```bash
# Mit Homebrew
brew install ollama

# Oder Download von https://ollama.ai/download
```

#### Linux
```bash
# Mit curl
curl -fsSL https://ollama.ai/install.sh | sh

# Oder mit apt (Ubuntu/Debian)
curl -fsSL https://ollama.ai/install.sh | sudo sh
```

### 2. Ollama starten

```bash
# Ollama-Service starten
ollama serve

# Im Hintergrund laufen lassen
nohup ollama serve > ollama.log 2>&1 &
```

### 3. Erste Modelle herunterladen

```bash
# Standard-Modell (3B Parameter, ~2GB)
ollama pull llama3.2:3b

# Größeres Modell (8B Parameter, ~5GB)
ollama pull llama3.2:8b

# Spezialisiertes Modell für Code
ollama pull codellama:7b

# Französisches Modell
ollama pull mistral:7b
```

## Konfiguration

### Umgebungsvariablen

```bash
# Standard-Konfiguration
export LLM_PROVIDER=ollama
export OLLAMA_BASE_URL=http://localhost:11434
export OLLAMA_MODEL=llama3.2:3b

# Alternative Modelle
export OLLAMA_MODEL=mistral:7b
export OLLAMA_MODEL=codellama:7b
export OLLAMA_MODEL=llama3.2:8b
```

### Konfigurationsdatei

```json
{
  "providers": {
    "ollama": {
      "name": "Ollama (Lokale LLMs)",
      "description": "Lokale LLMs über Ollama (kostenlos, privat)",
      "enabled": true,
      "config": {
        "base_url": "http://localhost:11434",
        "default_model": "llama3.2:3b",
        "available_models": [
          "llama3.2:3b",
          "llama3.2:8b", 
          "llama3.2:70b",
          "mistral:7b",
          "codellama:7b",
          "deepseek-coder:6.7b"
        ]
      }
    }
  },
  "default_provider": "ollama"
}
```

## Verwendung

### 1. Demo mit Ollama starten

```bash
# Standard-Demo mit Ollama
python scripts/run_van_workflow_demo.py

# Mit spezifischem Modell
OLLAMA_MODEL=mistral:7b python scripts/run_van_workflow_demo.py

# Mit verschiedenen Modellen vergleichen
for model in "llama3.2:3b" "mistral:7b" "codellama:7b"; do
  echo "=== Teste Modell: $model ==="
  OLLAMA_MODEL=$model python scripts/run_van_workflow_demo.py
  echo
done
```

### 2. Ollama-Integration testen

```bash
# Vollständiger Ollama-Test
python scripts/test_ollama_integration.py

# Nur Verbindung testen
python -c "
import asyncio
from backend.apm_framework.llm_service import LLMService, LLMProvider

async def test():
    llm = LLMService(LLMProvider.OLLAMA)
    result = await llm.analyze_requirement('Test-Anforderung')
    print('✅ Ollama funktioniert:', result[:100])

asyncio.run(test())
"
```

### 3. Verschiedene Modelle vergleichen

```bash
#!/bin/bash
# Modell-Vergleich-Skript

echo "🚀 Modell-Vergleich für VAN-Modus"
echo "=================================="

models=("llama3.2:3b" "mistral:7b" "codellama:7b")
requirement="Als Disponent möchte ich Bestellungen automatisch prüfen lassen."

for model in "${models[@]}"; do
    echo -e "\n📦 Teste Modell: $model"
    echo "----------------------------------------"
    
    # Modell testen
    OLLAMA_MODEL="$model" python -c "
import asyncio
import os
import sys
sys.path.insert(0, '..')
from backend.apm_framework.llm_service import LLMService, LLMProvider

async def test_model():
    llm = LLMService(LLMProvider.OLLAMA)
    start_time = asyncio.get_event_loop().time()
    
    try:
        result = await llm.analyze_requirement('$requirement')
        end_time = asyncio.get_event_loop().time()
        duration = end_time - start_time
        
        print(f'✅ Erfolgreich in {duration:.2f}s')
        print(f'📝 Antwort-Länge: {len(result)} Zeichen')
        print(f'🔍 Erste 100 Zeichen: {result[:100]}...')
        
    except Exception as e:
        print(f'❌ Fehler: {e}')

asyncio.run(test_model())
"
done
```

## Verfügbare Modelle

### Empfohlene Modelle für VAN-Modus

#### 1. Llama 3.2 (Meta)
- **llama3.2:3b**: ~2GB, schnell, gut für Tests
- **llama3.2:8b**: ~5GB, ausgewogen, empfohlen
- **llama3.2:70b**: ~40GB, beste Qualität, langsam

#### 2. Mistral (Mistral AI)
- **mistral:7b**: ~4GB, sehr gut, schnell
- **mistral:7b-instruct**: ~4GB, optimiert für Anweisungen

#### 3. Code Llama (Meta)
- **codellama:7b**: ~4GB, spezialisiert auf Code
- **codellama:13b**: ~8GB, bessere Code-Qualität

#### 4. DeepSeek
- **deepseek-coder:6.7b**: ~4GB, Code-spezialisiert

### Modell-Auswahl nach Anforderungen

```bash
# Für schnelle Tests
export OLLAMA_MODEL=llama3.2:3b

# Für Produktionsnutzung
export OLLAMA_MODEL=mistral:7b

# Für Code-bezogene Analysen
export OLLAMA_MODEL=codellama:7b

# Für beste Qualität (langsam)
export OLLAMA_MODEL=llama3.2:70b
```

## Performance-Optimierung

### 1. Modell-Caching

```bash
# Modelle im Speicher halten
ollama run llama3.2:3b

# In separatem Terminal
python scripts/run_van_workflow_demo.py
```

### 2. Batch-Verarbeitung

```python
# Mehrere Anforderungen gleichzeitig verarbeiten
async def batch_analyze(requirements: List[str]):
    llm = LLMService(LLMProvider.OLLAMA)
    
    tasks = [
        llm.analyze_requirement(req) 
        for req in requirements
    ]
    
    results = await asyncio.gather(*tasks)
    return results
```

### 3. Modell-Parameter optimieren

```python
# Optimierte Parameter für Ollama
data = {
    "model": "llama3.2:3b",
    "messages": messages,
    "stream": False,
    "options": {
        "temperature": 0.3,      # Weniger kreativ, konsistenter
        "top_p": 0.9,           # Fokus auf wahrscheinliche Antworten
        "num_predict": 1000,    # Kürzere Antworten, schneller
        "top_k": 40,            # Weniger Auswahlmöglichkeiten
        "repeat_penalty": 1.1   # Weniger Wiederholungen
    }
}
```

## Troubleshooting

### Häufige Probleme

#### 1. Ollama läuft nicht
```bash
# Status prüfen
ollama list

# Service starten
ollama serve

# Port prüfen
netstat -an | grep 11434
```

#### 2. Modell nicht gefunden
```bash
# Verfügbare Modelle anzeigen
ollama list

# Modell herunterladen
ollama pull llama3.2:3b

# Modell-Status prüfen
ollama show llama3.2:3b
```

#### 3. Langsame Antworten
```bash
# Modell im Speicher halten
ollama run llama3.2:3b

# Kleinere Modelle verwenden
export OLLAMA_MODEL=llama3.2:3b

# Parameter optimieren (siehe oben)
```

#### 4. Speicher-Probleme
```bash
# Speicher freigeben
ollama rm llama3.2:70b

# Nur benötigte Modelle behalten
ollama list | grep -E "(llama3.2:3b|mistral:7b)"
```

### Debugging

#### 1. Ollama-Logs
```bash
# Detaillierte Logs
ollama serve --verbose

# Logs in Datei
ollama serve > ollama.log 2>&1
```

#### 2. API-Tests
```bash
# Direkte API-Anfrage
curl -X POST http://localhost:11434/api/chat \
  -H "Content-Type: application/json" \
  -d '{
    "model": "llama3.2:3b",
    "messages": [{"role": "user", "content": "Hallo"}],
    "stream": false
  }'
```

#### 3. Modell-Informationen
```bash
# Detaillierte Modell-Info
ollama show llama3.2:3b

# Modell-Parameter
ollama show --json llama3.2:3b
```

## Integration in bestehende Workflows

### 1. VAN-Modus mit Ollama

```python
from backend.apm_framework.van_mode import VANMode
from backend.apm_framework.mongodb_connector import APMMongoDBConnector

# VAN-Modus mit Ollama initialisieren
connector = APMMongoDBConnector("mongodb://localhost:27017/", "valeo_neuroerp")
van_mode = VANMode(connector, "project-123", "ollama")

# Anforderung analysieren
result = await van_mode.run("Meine Anforderung...")
```

### 2. Fallback-Strategie

```python
# Automatischer Fallback
try:
    # Primär: Ollama
    llm = LLMService(LLMProvider.OLLAMA)
    result = await llm.analyze_requirement(text)
except Exception:
    try:
        # Sekundär: RAG-Service
        result = await rag_service.rag_query(text)
    except Exception:
        # Tertiär: Mock-LLM
        llm = LLMService(LLMProvider.MOCK)
        result = await llm.analyze_requirement(text)
```

### 3. Modell-Wechsel zur Laufzeit

```python
# Modell dynamisch wechseln
van_mode.set_llm_provider("ollama")

# Verschiedene Modelle testen
for model in ["llama3.2:3b", "mistral:7b", "codellama:7b"]:
    os.environ["OLLAMA_MODEL"] = model
    result = await van_mode.run(requirement)
    print(f"Modell {model}: {len(result['analysis'])} Zeichen")
```

## Nächste Schritte

### Kurzfristig (1-2 Wochen)
- [ ] Verschiedene Modelle testen
- [ ] Performance-Optimierung
- [ ] Batch-Verarbeitung implementieren

### Mittelfristig (1-2 Monate)
- [ ] Modell-Ensemble (mehrere Modelle kombinieren)
- [ ] Automatische Modell-Auswahl
- [ ] Modell-Fine-tuning für VAN-Aufgaben

### Langfristig (3-6 Monate)
- [ ] Lokale Embedding-Modelle
- [ ] RAG mit lokalen Modellen
- [ ] Vollständig lokale KI-Pipeline

---

**Letzte Aktualisierung**: 2025-08-20  
**Version**: 1.0  
**Status**: Produktiv einsatzbereit
