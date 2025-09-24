# Handover: VAN → PLAN

- Datum: 2025-08-12
- Von Modus: VAN
- Zu Modus: PLAN

## Zusammenfassung (Kurz)
Die Basisfunktionen sind einsatzbereit: Voice-Assistent (Intents + Entwurfs-/Buchungsfluss), KI-Chat mit Voice-Toggle in rechter Sidebar, RAG-API (Build/Query/Answer), Business-Tools (Wawi/CRM/FiBu) per REST, Onboarding (First-Run + Auto-Config), Programm-Einstellungen (Assistenten/Modi), Vector-DB docker-compose (Chroma/Qdrant). VAN empfiehlt, diese Bausteine in PLAN strukturiert zusammenzuführen, hart zu testen und produktionsreif zu machen (Ressourcen/DSGVO/UX).

## Aktueller Status
- Backend:
  - FastAPI Endpunkte: /voice, /settings, /autoconfig, /rag (build/query/answer), /biz (reorder/dedupe/match/dunning), /demo/seed
  - Systemkonfiguration mit Hardware-Check + Auto-Config
  - RAG Backend standardmäßig BM25; on-demand Chroma/Qdrant via docker-compose
  - Serena/Workflow/Change-Logger minimal (platzhalter) vorhanden
- Frontend:
  - Einstellungen-Seite (Modus, Assistenten, Vector-Backend, Auto-Config)
  - First-Run Wizard mit „Vorschlag übernehmen“
  - Rechte Chat-Sidebar (Tabs: Interner Chat, WhatsApp, KI-Chat mit Voice-Toggle)
  - KI-Chat (HorizonBetaChat) mit lokalem Voice-API-Toggle
- Voice:
  - `scripts/voice_assistant.py` mit Intents (Lieferschein, Auftrag, Rechnung, Bestellung, Lead, Termin, Mahnung, Zahlung, Bestand, RAG), Entwurfs-Review → Enter bucht
  - Auto-/Daemon-Modus (`--auto`) + PID-File + API-Start/Stop
- Daten/Seeds:
  - Demo-JSONs via `/demo/seed` (output/demo/*)

## Offene Aufgaben (Priorisiert)
- P0 Stabilisierung/Produktionsreife
  - Einstellungen wirksam machen (Ende-zu-Ende): Voice/RAG/LLM lesen Settings zur Laufzeit (Hot-Reload oder Neustart-Hinweis).
  - RAG UI: Build/Query/Answer im Frontend (Fortschrittsanzeige, Ordnerwahl, Trefferliste mit Jump-to-Code).
  - Tests: API-Unit/Integration für /voice, /settings, /autoconfig, /rag, /biz; E2E: First-Run → Einstellungen → RAG/Voice.
  - Sicherheit: API-Key/CORS feinschärfen; minimal Logging (DSGVO), RBAC für sensible Endpunkte.
- P1 Demo- & Trainingsmodus
  - Demo-Seeds erweitern (SQL + JSON); „Testdaten laden“ Button; Visualisierungen im Dashboard.
  - Trainingspfad: Übungen/Walkthrough-Seiten (Onboarding → Übungen → Auswertung).
- P1 Memory-Bank Integration
  - UI-Schalter „Memory Bank aktivieren“ (init + optional Mongo-Import); RAG-Build optional über `memory-bank/` chunken.
- P2 WhatsApp/Interner Chat
  - Tab-Inhalte anbinden (historische Kommunikationen/Bridge, falls vorhanden oder Mock + Roadmap).
- P2 Serena/Workflow
  - Serena-Plan/Apply erweitern (Dry-Run → selektive Edits); Report-Generator/Change-Logger UI.

## Umsetzungsschritte (PLAN → IMPLEMENT)
1. Settings-Propagation (P0)
   - Backend: Lesen von `settings.json` beim Start + `POST /settings` → persistiert und setzt Flags (z. B. env/Singleton-Konfig). Hinweis im UI, ob Neustart nötig.
   - Voice/RAG: respektieren `assistants.voice`, `assistants.vector_backend`, `llm.model`.
   - Akzeptanz: Umschalter in Einstellungen führt zu konsistenter Laufzeitwirkung; Status-UI korrekt.
2. RAG-Frontend (P0)
   - Seite/Panel: Build (Ordnerauswahl, Backend-Auswahl), Progress, Query-Eingabe, Trefferliste mit Dateipfad/Zeilen, Copy/Jump.
   - Akzeptanz: Build über `linkup_mcp` liefert Treffer; `/rag/answer` zeigt sinnvolle Antwort mit Zitaten.
3. Tests/QA (P0)
   - Unit/Integration für API; Cypress/Playwright E2E: First-Run, Settings, RAG, Voice-Start/Stop.
   - Akzeptanz: CI grün, Kernpfade stabil.
4. Demo/Training (P1)
   - Buttons in Einstellungen: „Demo-Daten laden“, „Trainingsmodus starten“; einfache KPI-Kacheln.
   - Akzeptanz: Demo-Flow klickbar, Trainingsseite mit 2–3 Aufgaben.
5. Memory-Bank UI (P1)
   - Einstellungen: „Memory Bank aktivieren“, optional Mongo-Import; RAG-Build mit `memory-bank/` Checkbox.
   - Akzeptanz: Aktivierung erzeugt Struktur/Status; RAG findet Einträge aus Memory-Bank.
6. Serena/Workflow (P2)
   - API/Frontend: Playbook anzeigen, Dry-Run-Diffs, gezielte Apply-Edits (sicher).

## Risiken & Gegenmaßnahmen
- Ressourcen (lokale LLM/RAG): Default auf BM25/Small-Model, on-demand Chroma/Qdrant; Limits in docker-compose.
- Audio/Windows/WSL2: Geräteerkennung/FFmpeg-Prüfung testen; Fallback Textmodus.
- DS/Datenschutz: Telemetrie off, minimale Logs, RBAC.

## Definition of Done
- SETTINGS wirken (Voice/RAG/LLM). RAG-UI vorhanden, Abfragen produktiv nutzbar. Tests grün. Demo/Training-Flow klickbar. Memory-Bank optional integrierbar. Sicherheit/DSGVO berücksichtigt.
