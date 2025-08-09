#!/usr/bin/env bash
set -euo pipefail

# Optionales Vector-Backend (Standard: chroma)
: "${VECTOR_BACKEND:=chroma}"

echo "[VALERO] Starte Vollzyklus mit VECTOR_BACKEND=${VECTOR_BACKEND}"

# 1) Analyse
make analyze || true

# 2) RAG Index aufbauen
if [ "${VECTOR_BACKEND}" = "chroma" ]; then
  make rag-build-chroma || true
else
  make rag-build || true
fi

# 3) Beispiel-Query
make rag-query Q="Where is the LangGraph workflow defined?" K=5 || true

# 4) Serena Playbook + Dry Apply
make serena-plan || true
make serena-apply || true

echo "[VALERO] Zyklus abgeschlossen. Artefakte unter output/valero_system/."