# VALERO Makefile – einfache Startbefehle

.PHONY: help analyze rag-build rag-query serena-plan serena-apply api vector-up vector-down mcp biz-reorder biz-dedupe biz-match biz-dunning setup-chroma setup-qdrant rag-build-chroma rag-query-chroma rag-build-dir rag-query-dir rag-build-chroma-dir rag-query-chroma-dir set-local-llm start-ollama start-openwebui voice-demo

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

# Ordner-spezifisch (BM25/Default)
rag-build-dir:
	@if [ -z "$(DIR)" ]; then echo "Bitte Verzeichnis mit DIR=pfad angeben"; exit 1; fi
	python3 -c "from linkup_mcp.memory.rag_manager import RAGMemoryManager; m=RAGMemoryManager(); m.build_index(['$(DIR)']); print(m.export_manifest())"

rag-query-dir:
	@if [ -z "$(Q)" ] || [ -z "$(DIR)" ]; then echo "Bitte DIR=pfad und Q=\"...\" angeben"; exit 1; fi
	python3 -c "from linkup_mcp.memory.rag_manager import RAGMemoryManager; m=RAGMemoryManager(); m.build_index(['$(DIR)']); import json; print(json.dumps(m.query('$(Q)', top_k=$(K)), ensure_ascii=False, indent=2))"

# Ordner-spezifisch (Chroma)
rag-build-chroma-dir:
	@if [ -z "$(DIR)" ]; then echo "Bitte Verzeichnis mit DIR=pfad angeben"; exit 1; fi
	VECTOR_BACKEND=chroma $(MAKE) rag-build-dir DIR=$(DIR)

rag-query-chroma-dir:
	@if [ -z "$(Q)" ] || [ -z "$(DIR)" ]; then echo "Bitte DIR=pfad und Q=\"...\" angeben"; exit 1; fi
	VECTOR_BACKEND=chroma $(MAKE) rag-query-dir DIR=$(DIR) Q="$(Q)" K=$(K) 

set-local-llm:
	@echo "LLM_BASE_URL=http://localhost:11434" > .env.local
	@echo "LLM_MODEL=gpt-oss-20b-small" >> .env.local
	@echo "VECTOR_BACKEND=fallback" >> .env.local
	@echo "LANGCHAIN_TRACING_V2=false" >> .env.local
	@echo "CHROMA_TELEMETRY_DISABLED=1" >> .env.local
	@echo "ANONYMIZED_TELEMETRY=false" >> .env.local
	@echo "Lokale LLM-Defaults in .env.local geschrieben."

start-ollama:
	@echo "Bitte stelle sicher, dass Ollama installiert ist. Starte dann den Dienst und lade das Modell:"
	@echo "  ollama pull gpt-oss:20b"
	@echo "Optional Modelfile (kleiner Ressourcenbedarf) und create:"
	@echo "  ollama create gpt-oss-20b-small -f Modelfile"

start-openwebui:
	@echo "Starte OpenWebUI auf Port 8501:"
	@echo "  DATA_DIR=~/.open-webui uvx --python 3.11 open-webui@latest serve --host 0.0.0.0 --port 8501" 

voice-demo:
	@echo "Lokaler Voice-Agent (Beispiel):"
	@echo "  git clone https://github.com/everlastconsulting/gpt-oss-local-voice-agent-demo"
	@echo "  cd gpt-oss-local-voice-agent-demo"
	@echo "  # .env: OLLAMA_BASE_URL=http://localhost:11434 ; MODEL=gpt-oss-20b-small"
	@echo "  # Starten gemäß README; Audioausgabe über Systemlautsprecher/Headset" 