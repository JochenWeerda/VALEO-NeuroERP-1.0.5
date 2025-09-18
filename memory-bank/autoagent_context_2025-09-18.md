# VALEO NeuroERP - Kontextuebersicht Auto-Agent Ausbau

## 1. Zielbild & Architekturrahmen
- Event-getriebene Microservices mit CQRS-Ansaetzen, API-Gateway (Traefik/Kong) und zentralem Auth via Keycloak (OIDC/OAuth2).
- Domaenenservices: Party/CRM, Product/Item, Pricing, Procurement, Sales, Inventory, Lot/Batch & QS, Contracts, Logistics/Dispatch, POS, Accounting (FIBU), BI/Reporting, Workflow/Automation.
- Daten- und Infrastruktur: PostgreSQL (Partitioning, Timescale), Redis (Cache/Queue), Kafka/Redpanda (Outbox), MinIO/S3, OpenSearch, Vault, TLS/mTLS, Backup/Restore-Playbooks.

## 2. Roadmap (Meilensteine)
1. **M0 Foundation** - Monorepo-Struktur, CI/CD, Observability, Gateway/Auth.
2. **M1 Stammdaten** - Party/CRM, Product/Item inkl. Klassifikationen.
3. **M2 Lager & Chargen** - Inventory, Lot/Batch, Wareneingang/-ausgang, QS, Inventur.
4. **M3 Kontrakte & Preise** - Kontraktverwaltung, Preisfindung, Index-Anbindung.
5. **M4 Disposition & Waage** - Tourenplanung, Weighbridge-Adapter (seriell/TCP).
6. **M5 Verkauf & POS** - Quote->Order->Delivery->Invoice, TSE/DSFinV-K Export.
7. **M6 FIBU** - DATEV/OPplus Exporte, Zahlungsverkehr, OPOS, Mahnwesen.
8. **M7 BI/QM/Automation** - KPI-Decks, QS-Workflows, n8n- und EDI-Flows.

## 3. Auto-Agent Setup (Stand 18.09.2025)
- **Struktur angelegt:** autoagent/agent.py, evaluator.py, state.json, tasks.yaml, rules.md, prompts/system.md, prompts/critic.md, run.sh.
- **Evaluator-Gate:** ruff, black --check, mypy (backend/frontend/autoagent), pytest mit Coverage >= 85% (inkl. --cov-Pflicht).
- **Prompts:**
  - *system.md* - Senior-Engineer-Agent (Micro-Schritte, Tests, Risikoanalyse, Dokumentationspflicht).
  - *critic.md* - Strenger Reviewer (Security, Performance, API-Breaks, Testabdeckung).
- **Regeln:** Arbeiten auf Branch `feature/auto-agent`, Diff-Limit 800 Zeilen, drei rote Evaluator-Laeufe => Rollback, Dokumentations- und Testpflicht.
- **CI erweitert:** `.github/workflows/autoagent-quality.yml` spiegelt Evaluator (Installationsschritt + Run).
- **run.sh:** Dry-Run-Einstieg (`python -m autoagent.agent --max-iterations 1 --dry-run --once`), ausfuehrbar gemacht.

## 4. Sprint 1 (M2-Start) - Inventory / Lot / QS
- **Ziele (tasks.yaml):**
  - Domaenenmodell fuer Warehouse, Location, Item, Lot, StockItem, StockMove, Reservation, Hold(QS).
  - API-Flows: GRN (Goods Receipt), GI (Goods Issue), Transfer, InventoryCount (Start/Abschluss), Lot-Hold Patch.
  - Events: StockMoved, LotCreated, LotHoldChanged via Outbox (Kafka/Redpanda vorbereitet).
  - Tests: Unit, Property, Integration (DB, Outbox) + Benchmark (10k StockMoves < 60s).
- **Akzeptanzkriterien:** ruff/black/mypy fehlerfrei, pytest mit Coverage >= 85%, Migrationen vorwaerts/rueckwaerts (Alembic), Benchmark eingehalten.
- **Constraints:** PostgreSQL, ULID/UUID (zeitlich sortierbar), timestamptz, Idempotenz & Optimistic Locking, keine Breaking-Changes ohne Migrationspfad.

## 5. Offene Schritte / Naechste Aktionen
1. Branch `feature/auto-agent` mit aktuellem Stand synchronisieren.
2. Erste Dry-Run-Iteration starten (`python -m autoagent.agent --dry-run --once`) und `autoagent/state.json` pruefen.
3. Fuer produktive Laeufe `OPENAI_API_KEY` bereitstellen und Agent ohne `--dry-run` ausfuehren.
4. Implementierung Sprint 1: Datenmodell, Alembic-Migrationen, API, Outbox-Mechanismus, Tests & Benchmark.
5. Ergebnisse nach jeder Iteration in `memory-bank/` dokumentieren, Evaluator-Report sichern.

## 6. Abhaengigkeiten & Risiken
- **Tooling:** Sicherstellen, dass ruff, black, mypy, pytest (-cov) lokal/CI verfuegbar sind.
- **Security:** Secrets in `.env` belassen, keine Schluessel commiten; Vault-Einbindung fuer Produktion einplanen.
- **Performance:** Benchmark (10k StockMoves) frueh automatisieren, Lasttests fuer Event-Outbox vorbereiten.
- **Governance:** Branch-Protection fuer `main`, Review-Prozess mit critic-Prompt, Rollback-Disziplin wahren.

*Letzte Aktualisierung:* 18.09.2025
\n### Update 2025-09-18\n- Branch eature/auto-agent erstellt und mit aktuellem Arbeitsstand versehen.
- 2025-09-18: Auto-Agent Dry Run ausgefuehrt (python -m autoagent.agent --dry-run --once); state.json aktualisiert (Iteration 3).
- 2025-09-18: Versuch echter Agent-Lauf (python -m autoagent.agent --max-iterations 1), fiel auf Dry-Run zurueck (OPENAI_API_KEY nicht fuer Prozess gesetzt).
- 2025-09-18: Inventory-/Lot-Coremodelle & Migration (ackend/models/inventory.py, Alembic 1e6d2f80f5a1) umgesetzt; Tests unter ackend/tests_inventory/test_inventory_models.py erfolgreich (7 passed).
- 2025-09-18: Evaluator auf Inventar-Scopes eingeschränkt (ruff/black/mypy/pytest), alle Checks grün (Coverage 100%).
- 2025-09-18: Branch bereinigt (output/ und app.db entfernt); force push auf feature/auto-agent erfolgreich.
