# VALERO – Multi-Agent Analyse, RAG & Serena

## Schnellstart (CLI)

- Vollanalyse:
  ```bash
  python3 -m linkup_mcp.cli analyze .
  ```
  Artefakte: `output/valero_system/{scan.json, architecture.json, quality.json, playbook.json, report.md}`

- RAG aufbauen:
  ```bash
  python3 -m linkup_mcp.cli rag-build .
  ```

- RAG-Abfrage:
  ```bash
  python3 -m linkup_mcp.cli rag-query "Wie ist die Architektur aufgebaut?" --top-k 5
  ```

- Serena-Plan/Apply:
  ```bash
  python3 -m linkup_mcp.cli serena-plan
  python3 -m linkup_mcp.cli serena-apply --apply  # vorsichtig
  ```

## API (optional)

- ENV vorbereiten (`.env` nach `.env.example`): API-Key optional `VALERO_API_KEY`.
- FastAPI starten (falls installiert):
  ```bash
  uvicorn linkup_mcp.api:app --host 0.0.0.0 --port 8080
  ```
- Endpunkte:
  - POST `/analyze` {"root": "."}
  - POST `/rag/build` {"paths": ["."]}
  - POST `/rag/query` {"question": "...", "top_k": 6}
  - Header: `X-API-Key: <VALERO_API_KEY>` (optional, wenn gesetzt)

## Vectorstores

- Default: `VECTOR_BACKEND=auto` (FAISS→Chroma→Qdrant, je nach Verfügbarkeit)
- Qdrant/Chroma via Docker-Compose:
  ```bash
  docker compose -f docker/docker-compose.rag.yml up -d
  ```

## LangGraph-Workflow

- Orchestrierung in `workflows/langgraph_valero.py` mit optionalen SQLite-Checkpoints (`data/checkpoints/langgraph.db`).
- Fallback auf sequenziellen Lauf, wenn LangGraph nicht verfügbar ist.

## MCP-Server (optional, abhängige Komponenten erforderlich)

- Tools: `run_full_analysis`, `analysis_overview`, `build_rag_index`, `rag_query_local`, `serena_plan`, `serena_apply`.
- Hinweis: `linkup` und `MongoDB` optional erforderlich; sonst CLI nutzen. 

## Testdaten (SQL) einspielen

- CRM: `database/testdata_crm.sql`
- Lager: `database/testdata_warehouse.sql`
- FiBu: `database/testdata_finance.sql`

Mit psql oder in deiner DB-Konsole ausführen, nachdem die zugehörigen Schemas angelegt wurden (siehe `database/*_schema.sql`).

## Business-Tools (Makefile)

- Dispo-Vorschlag aus JSON:
  ```bash
  make biz-reorder FILE=demo_data/stock.json
  ```
- Leads-Dubletten clustern:
  ```bash
  make biz-dedupe FILE=demo_data/leads.json
  ```
- Zahlungseingänge matchen:
  ```bash
  make biz-match INV=demo_data/invoices.json PAY=demo_data/payments.json
  ```
- Mahnwesen generieren:
  ```bash
  make biz-dunning INV=demo_data/invoices.json
  ``` 

## Lokales LLM (Ollama + OpenWebUI)

- Lokale ENV setzen:
  ```bash
  make set-local-llm
  ```
- Ollama/Modell:
  ```bash
  make start-ollama
  # dann im Terminal:
  # ollama pull gpt-oss:20b
  # optional: ollama create gpt-oss-20b-small -f Modelfile
  ```
- OpenWebUI (Port 8501):
  ```bash
  make start-openwebui
  ```

## DSGVO kompakt
- Datenminimierung/Zweckbindung, Lösch-/Aufbewahrungsfristen
- TOMs: Verschlüsselung, RBAC, Netzwerkhärtung; nur interne Ports
- Telemetrie aus: `CHROMA_TELEMETRY_DISABLED=1`, `ANONYMIZED_TELEMETRY=false`, LangChain Tracing off
- Verzeichnis der Verarbeitungstätigkeiten, Rechtsgrundlage (berechtigtes Interesse/vertraglich)
- Anonymisierung/Pseudonymisierung sensibler Daten vor Indexierung 