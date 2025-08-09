# VALERO Makefile – einfache Startbefehle

.PHONY: help analyze rag-build rag-query serena-plan serena-apply api vector-up vector-down mcp biz-reorder biz-dedupe biz-match biz-dunning setup-chroma setup-qdrant rag-build-chroma rag-query-chroma

help:
	@echo "VALERO – einfache Befehle:"
	@echo "  make analyze                 # Vollanalyse (Root=.)"
	@echo "  make rag-build               # RAG-Index aufbauen (Root=.)"
	@echo "  make rag-query Q='Frage' K=5 # RAG-Query mit Top-K"
	@echo "  make serena-plan             # Playbook erzeugen"
	@echo "  make serena-apply            # Playbook anwenden (dry)"
	@echo "  make api                     # API starten (uvicorn benötigt)"
	@echo "  make vector-up               # Qdrant/Chroma starten (Docker)"
	@echo "  make vector-down             # Qdrant/Chroma stoppen"
	@echo "  make mcp                     # MCP-Server starten (Abhängigk.)"

# Parameter: ROOT (Standard .), Q (Frage), K (Top-K)
ROOT ?= .
Q ?= ""
K ?= 6

analyze:
	python3 -m linkup_mcp.cli analyze $(ROOT)

rag-build:
	python3 -m linkup_mcp.cli rag-build $(ROOT)

rag-query:
	@if [ -z "$(Q)" ]; then echo "Bitte Frage mit Q=\"...\" angeben"; exit 1; fi
	python3 -m linkup_mcp.cli rag-query "$(Q)" --top-k $(K)

serena-plan:
	python3 -m linkup_mcp.cli serena-plan

serena-apply:
	python3 -m linkup_mcp.cli serena-apply

api:
	@echo "Starte API auf :8080 (falls fastapi/uvicorn installiert)"
	uvicorn linkup_mcp.api:app --host 0.0.0.0 --port 8080

vector-up:
	docker compose -f docker/docker-compose.rag.yml up -d

vector-down:
	docker compose -f docker/docker-compose.rag.yml down

mcp:
	python3 -m linkup_mcp.server 

biz-reorder:
	@if [ -z "$(FILE)" ]; then echo "Bitte Lagerdatei mit FILE=pfad.json angeben"; exit 1; fi
	python3 -c "from linkup_mcp.apps.business_tools import suggest_reorder_from_file; import json; print(json.dumps(suggest_reorder_from_file('$(FILE)'), ensure_ascii=False, indent=2))"

biz-dedupe:
	@if [ -z "$(FILE)" ]; then echo "Bitte Leadsdatei mit FILE=pfad.json angeben"; exit 1; fi
	python3 -c "from linkup_mcp.apps.business_tools import dedupe_leads_from_file; import json; print(json.dumps(dedupe_leads_from_file('$(FILE)'), ensure_ascii=False, indent=2))"

biz-match:
	@if [ -z "$(INV)" ] || [ -z "$(PAY)" ]; then echo "Bitte Rechnungen und Zahlungen mit INV=inv.json PAY=pay.json angeben"; exit 1; fi
	python3 -c "from linkup_mcp.apps.business_tools import match_payments_from_files; import json; print(json.dumps(match_payments_from_files('$(INV)','$(PAY)'), ensure_ascii=False, indent=2))"

biz-dunning:
	@if [ -z "$(INV)" ]; then echo "Bitte Rechnungsdatei mit INV=pfad.json angeben"; exit 1; fi
	python3 -c "from linkup_mcp.apps.business_tools import generate_dunning_from_file; import json, os; print(json.dumps(generate_dunning_from_file('$(INV)'), ensure_ascii=False, indent=2))" 

setup-chroma:
	pip3 install --user --break-system-packages -q \
	  langchain==0.2.16 langchain-community==0.2.16 langchain-text-splitters==0.2.2 \
	  langchain-huggingface==0.0.3 chromadb==0.5.3 qdrant-client==1.10.0
	@echo "Chroma/Qdrant-Client + LangChain installiert (User-Scope)."

setup-qdrant:
	pip3 install --user --break-system-packages -q qdrant-client==1.10.0
	@echo "Qdrant-Client installiert. Nutze 'make vector-up' für Docker-Start."

rag-build-chroma:
	VECTOR_BACKEND=chroma $(MAKE) rag-build

rag-query-chroma:
	@if [ -z "$(Q)" ]; then echo "Bitte Frage mit Q=\"...\" angeben"; exit 1; fi
	VECTOR_BACKEND=chroma $(MAKE) rag-query Q="$(Q)" K=$(K) 