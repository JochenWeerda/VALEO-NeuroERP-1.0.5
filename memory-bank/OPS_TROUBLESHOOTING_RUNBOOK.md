# VALEO NeuroERP – Troubleshooting & Best Practices Runbook

Dieses Runbook dokumentiert fortlaufend Fehlersymptome, Ursachen, Fixes und Präventionsmaßnahmen. Es dient als Nachschlagewerk für wiederkehrende Probleme (RAG, MCP, Docker/NGINX, Frontend/Backend, Supabase).

## 1) Frontend: React Router Fehler
- Symptom: "You cannot render a <Router> inside another <Router>" / "useNavigate only in a <Router> context"
- Ursache: Mehrfaches Einbetten von `BrowserRouter` (`App.tsx`, `PreloadRouter.tsx`).
- Fix: Nur ein Top‑Level `BrowserRouter` in `frontend/src/main.tsx`, Router in Komponenten entfernt.
- Prävention: Code‑Review‑Check: 1 Router pro App. E2E-Route-Smoke-Test im CI.

## 2) Backend: Modulpfad/Import in Docker
- Symptom: `ModuleNotFoundError: No module named 'backend.api'` beim Start.
- Ursache: Build-Kontext/Volume-Mount falsch; `CMD` war uneindeutig; `PYTHONPATH` nicht passend.
- Fix: `docker-compose.yml` Volume auf `./:/app`; `PYTHONPATH=/app`; `CMD uvicorn backend.api.main:app`; absolute Importe `backend.*`.
- Prävention: Einheitlicher Paket-Root `/app`; keine relativen Importe.

## 3) APIRouter Middleware-Fehler
- Symptom: `AttributeError: 'APIRouter' object has no attribute 'middleware'`.
- Ursache: Middleware-Dekorator auf `APIRouter` verwendet.
- Fix: Middleware als `BaseHTTPMiddleware` implementiert (`WhatsAppSecurityHeadersMiddleware`) und per `app.add_middleware(...)` registriert.
- Prävention: Middleware immer auf App-Ebene registrieren.

## 4) Pydantic v2 Validierung (Enums/Alias)
- Symptome:
  - `ContactWeekdays` verlangt lowercase Werte (z. B. `"monday"`).
  - Feldalias `from` musste via `Field(alias="from")` gesetzt werden.
- Fix:
  - Mockdaten (für Dev) auf lowercase umgestellt.
  - In Produktivmodus Mocks deaktiviert (`USE_MOCK_DATA=false`).
  - Beim Model `CustomerCommunication` Alias via `from_`/`Field(alias="from")` genutzt.
- Prävention: Einheitliche Enum-Values, Pydantic v2 Kompatibilität beachten.

## 5) Mock-Daten vs. Realdaten
- Entscheidung: Standardmäßig Realdaten. Umschaltung über `USE_MOCK_DATA` (Default: false).
- Anpassung: `CRMService` lädt Mocks nur, wenn `USE_MOCK_DATA=true`. Andernfalls ausschließlich echte DB.
- Prävention: Keine implizite Mock-Erzeugung im Produktionsbetrieb.

## 6) Datenbank-Initialisierung
- Maßnahme: DB-Init (`init_database()`) im FastAPI-Lifespan ausgeführt.
- Prävention: Migrationen/DDL im CI/CD validieren; Health-Check erweitert.

## 7) PowerShell Requests (JSON Escaping)
- Symptom: `JSON decode error`, leere Pipe-Elemente.
- Ursache: Falsches Escaping bei Inline-JSON in PS.
- Fix: Body als Objekt via `@{}` + `ConvertTo-Json` senden; keine Pipes in derselben Zeile missbrauchen.
- Prävention: Hilfsskripte bereitstellen.

---

## Standardisierte Checkliste (Schnellhilfe)
1. Container Startet nicht? → Logs prüfen: `docker logs valeo-neuroerp-backend`.
2. Importfehler? → `PYTHONPATH=/app`, absolute Importe `backend.*`, Volume `./:/app`.
3. Router-Fehler? → Nur ein `BrowserRouter` im `main.tsx`.
4. Pydantic-Fehler? → Enum-Values/Field Aliases prüfen (v2-Regeln).
5. Health prüfen → `GET /health`, `GET /api/health`.
6. CORS/Origin → `allow_origins` in `backend/api/main.py` anpassen.
7. Auth-Flow → `/api/v1/auth/register` → `/token` → `/users/me`.

---

## Nächste Schritte (RAG/MCP/Supabase Protokollierung)
- Zentrales Experimente-Log als JSONL (`logs/ops/experiment_log.jsonl`).
- Geplante Erweiterung: Supabase-Tabelle `ops_logs` (via MCP) zur zentralen Speicherung.
- Periodische Best-Practice-Synthese aus Logs in diese Datei (automatisiert).

Format für Logeinträge (JSONL):
```json
{
  "ts": "2025-08-25T20:16:00Z",
  "component": "backend",
  "action": "docker_start",
  "status": "ok",
  "notes": "Uvicorn läuft, Health 200"
}
```
