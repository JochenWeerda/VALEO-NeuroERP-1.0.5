# Aufgabenliste (PLAN)

Stand: 2025-08-12
Modus: PLAN

## Priorität P0 – Produktionsreife & Stabilität
- [ ] Settings-Propagation umsetzen (Backend/Runtime)
  - **Akzeptanz**: Umschalter (Voice/RAG/Vector-Backend/LLM) wirken konsistent; Status-UI korrekt; ggf. Neustart-Hinweis.
  - Owner: T.B.D.
- [ ] RAG-Frontend (Build/Query/Answer) mit Progress & Ordnerauswahl
  - **Akzeptanz**: Build auf `linkup_mcp` liefert Treffer; Trefferliste inkl. Datei/Zeilen; `/rag/answer` zeigt Antwort.
  - Owner: T.B.D.
- [ ] Tests/QA (Unit/Integration/E2E)
  - **Akzeptanz**: API-Tests für /voice, /settings, /autoconfig, /rag, /biz; E2E: First-Run → Settings → RAG/Voice grün.
  - Owner: T.B.D.
- [ ] Sicherheit/DSGVO-Härtung
  - **Akzeptanz**: API-Key/CORS sauber; Logging minimal; RBAC für sensible Endpunkte.
  - Owner: T.B.D.

## Priorität P1 – Demo & Training
- [ ] Demo-Daten (SQL + JSON) erweitern und UI-Buttons „Testdaten laden“
  - **Akzeptanz**: Klick lädt Daten, Dashboard zeigt KPIs.
  - Owner: T.B.D.
- [ ] Trainingspfad (Übungen/Walkthrough)
  - **Akzeptanz**: 2–3 Aufgaben mit Anleitung und Auswertung.
  - Owner: T.B.D.

## Priorität P1 – Memory-Bank Integration
- [ ] „Memory Bank aktivieren“ in Einstellungen (init + optional Mongo-Import)
  - **Akzeptanz**: Struktur erstellt, Status sichtbar; RAG-Build optional über `memory-bank/`.
  - Owner: T.B.D.

## Priorität P2 – Kommunikation & Refactoring
- [ ] Tabs „Interner Chat“ und „WhatsApp“ inhaltlich anbinden (Mock → echte Daten)
  - **Akzeptanz**: Historien sichtbar oder klarer Mock mit Roadmap.
  - Owner: T.B.D.
- [ ] Serena/Workflow erweitern (Playbook, Dry-Run-Diffs, selektive Apply)
  - **Akzeptanz**: Playbook im UI, sichere Teilanwendung möglich.
  - Owner: T.B.D.

## Abhängigkeiten
- RAG-Frontend ↔ RAG-API stabil; Settings-Propagation vor E2E-Tests abschließen.

## Hinweise
- Ressourcen-schonend: BM25 default; Vektordienste on-demand.
- Voice: Geräte/ffmpeg prüfen; Textmodus-Fallback.
