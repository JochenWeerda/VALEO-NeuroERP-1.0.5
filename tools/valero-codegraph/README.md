# VALERO CodeGraph (LangGraph + RAG)

Multi‑Agenten‑Pipeline zum Scannen, Indizieren (RAG), Analysieren und Erstellen von Reports für das VALERO/VALEO NeuroERP Frontend.

## Nutzung
1) Installation
```bash
cd tools/valero-codegraph
npm install
```

2) Befehle
```bash
# Voller Lauf
npm run pipeline

# Nur Index (RAG)
npm run index

# Qualität
npm run quality

# Refactor‑Plan (nur Vorschläge)
npm run refactor

# Report
npm run report

# Query (RAG)
npm run query -- "Wo werden Benachrichtigungen geladen?"
```

Artefakte liegen unter `tools/valero-codegraph/storage`.
