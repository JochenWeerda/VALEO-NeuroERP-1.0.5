# VALEO NeuroERP – Go‑Live Fahrplan (VAN/Frontend)

Datum: 2025-08-24
Verantwortlich: APM-Workflow + Frontend Team
Ziel: Fehlerfreie UI/UX, E2E-stabile Navigation/Workflows, BI-Export, Predictive Economy Prototyp

## Leitprinzipien
- Fehlerbehebung vor Feature-Ausbau
- Durchgängige E2E-Abdeckung (Navigation, Formulare, BI, Export, A11y)
- Lokale LLM-Nutzung (Ollama) + optional OpenAI für Vergleich
- CI-Gates: typecheck, lint, unit, e2e, a11y, perf

## Phase 0 – Test-Infrastruktur & Daten (Tag 1–2)
- Playwright einrichten (Headed/Headless, Screenshot/Trace)
- Test-Seeds/Fixtures (Demo-Daten, User-Rollen)
- A11y-Basischecks, Responsive Breakpoints
- Export-Helper (CSV/PNG) und LibreOffice-Aufruf

## Phase 1 – Navigation & Workflows (Tag 2–4)
- User-Journeys (Belegfolge) definieren und E2E: happy/edge
- Breadcrumbs, Zurück/Vorwärts konsistent
- Unsaved-Changes Warnungen, Guarded Routes

## Phase 2 – Formulare & CRUD (Tag 4–6)
- Generischer CRUD-Test-Harness (Create→Read→Update→Delete→Verify DB)
- Optimistic Updates + Rollback
- Fehler- und Validierungsfeedback (Toast/Inline)

## Phase 3 – BI & Export (Tag 6–8)
- Chart-Regression (Screenshot-Vergleich), große Datasets
- Export CSV/PNG/SVG, Batch-Export Dashboard
- LibreOffice (Calc) Übergabe automatisieren

## Phase 4 – Predictive Economy (Tag 8–10)
- LLM-gestützte Heuristik (Demand-Forecast, Vorbestell-Empfehlungen)
- Evaluationsmetriken, Offline‑Scoring
- UI-Widget “Empfehlungen” + Feedback-Loop

## Phase 5 – Hardening & Go‑Live (Tag 10–12)
- CI-Gates scharf schalten (typecheck, lint, unit, e2e, a11y, perf)
- RBAC-Flow-Negativtests
- Dokumentation, Runbooks, Rollback-Plan

## Definition of Done (DoD)
- 0 kritische/hohe Fehler offen
- E2E > 95% grün für Kern-Journeys
- Export verifiziert in LibreOffice
- Predictive Economy MVP demonstrierbar
- Dokumentation aktualisiert (User/Runbooks)

## Risiken & Gegenmaßnahmen
- Unklare Belegfolgen → Workshops/Mockflows, Tests früh erstellen
- BI-Performance → Sampling/Virtualisierung, Serverseitige Aggregate
- LLM-Qualität → Prompts/Constraints, Fallbacks (Regeln)
