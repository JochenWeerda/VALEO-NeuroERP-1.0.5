# Visual Process Map: Frontend-Validierung im VAN-Modus

```mermaid
flowchart TD
    A[Start VAN-Modus] --> B{Richtiges Verzeichnis?}
    B -->|Nein| C[Wechsle zu frontend/]
    B -->|Ja| D{package.json vorhanden?}
    
    C --> D
    
    D -->|Nein| E[Erstelle standard package.json]
    D -->|Ja| F{Start-Skripte definiert?}
    
    E --> F
    
    F -->|Nein| G[Füge Standardskripte hinzu]
    F -->|Ja| H{vite.config.js vorhanden?}
    
    G --> H
    
    H -->|Nein| I[Erstelle standard vite.config.js]
    H -->|Ja| J{JSX-Konfiguration korrekt?}
    
    I --> J
    
    J -->|Nein| K[Aktualisiere JSX-Konfiguration]
    J -->|Ja| L{Abhängigkeiten installiert?}
    
    K --> L
    
    L -->|Nein| M[Führe npm install aus]
    L -->|Ja| N{PowerShell-Kompatibel?}
    
    M --> N
    
    N -->|Nein| O[Verwende PowerShell-kompatible Befehle]
    N -->|Ja| P[Starte Frontend mit npm start]
    
    O --> P
    
    P --> Q{Frontend gestartet?}
    
    Q -->|Nein| R{Portkonflikte?}
    Q -->|Ja| S[Erfolgreich: Frontend läuft]
    
    R -->|Ja| T[Alternativen Port verwenden]
    R -->|Nein| U[Debugging-Modus starten]
    
    T --> P
    U --> V[Fehleranalyse durchführen]
    V --> W[Dokumentation konsultieren]
    W --> P
```

## VAN-Modus Checkliste für Frontend-Entwicklung

Diese Checkliste wird verwendet, um die Frontend-Entwicklungsumgebung im VAN-Modus zu validieren:

### 1. Verzeichnisstruktur

- [ ] Arbeite ich im korrekten Verzeichnis?
  ```powershell
  # Wechsle ins frontend-Verzeichnis
  cd frontend
  # Prüfe aktuelles Verzeichnis
  Get-Location
  ```

### 2. Konfigurationsdateien

- [ ] Sind die notwendigen Konfigurationsdateien vorhanden?
  ```powershell
  # Prüfe, ob package.json existiert
  Test-Path package.json
  # Prüfe, ob vite.config.js existiert
  Test-Path vite.config.js
  ```

### 3. Standardskripte

- [ ] Enthält package.json die benötigten Skripte?
  ```powershell
  # Skripte anzeigen
  (Get-Content package.json -Raw | ConvertFrom-Json).scripts
  ```

### 4. JSX-Konfiguration

- [ ] Ist die JSX-Konfiguration in vite.config.js korrekt?
  ```javascript
  // Benötigte Konfiguration in vite.config.js
  esbuild: {
    loader: { '.js': 'jsx', '.ts': 'tsx' },
    jsxFactory: 'React.createElement',
    jsxFragment: 'React.Fragment'
  }
  ```

### 5. Abhängigkeiten

- [ ] Sind alle notwendigen Abhängigkeiten installiert?
  ```powershell
  # Abhängigkeiten installieren
  npm install
  ```

### 6. Starten des Frontends

- [ ] Frontend mit dem korrekten Befehl starten:
  ```powershell
  # Option 1: Standard-Skript
  npm start
  
  # Option 2: Vite direkt
  npx vite
  
  # Option 3: Alternativen Port verwenden
  npm start -- --port 5000
  # oder
  npx vite --port 5000
  ```

## Entscheidungsbaum für Frontend-Probleme

1. **Problem**: "Missing script: start"
   - **Lösung**: Befinden Sie sich im richtigen Verzeichnis? Wechseln Sie zu `frontend/`
   - **Alternative**: Verwenden Sie das Frontend-Starter-Skript: `./scripts/start_frontend.ps1`

2. **Problem**: "&&" Syntax-Fehler
   - **Lösung**: Verwenden Sie in PowerShell keine `&&`-Verkettung, sondern führen Sie Befehle nacheinander aus:
     ```powershell
     cd frontend
     npm start
     ```

3. **Problem**: "The JSX syntax extension is not currently enabled"
   - **Lösung**: Aktualisieren Sie vite.config.js mit der JSX-Loader-Konfiguration
   - **Alternative**: Nutzen Sie das Skript `./scripts/start_frontend.ps1`, das dies automatisch korrigiert

4. **Problem**: "Cannot find module 'typescript'"
   - **Lösung**: Installieren Sie TypeScript als Abhängigkeit: `npm install typescript --save-dev`

5. **Problem**: "Port XXXX is in use"
   - **Lösung**: Verwenden Sie einen alternativen Port: `npm start -- --port 5000` oder `npx vite --port 5000`