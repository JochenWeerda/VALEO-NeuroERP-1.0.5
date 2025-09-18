# CREATIVE: RAG-Frontend Architektur & UX

Datum: 2025-08-12
Modus: CREATIVE

## Problemrahmen
- Ziel: UI für RAG Build/Query/Answer mit progressiver Nutzerführung.
- Anforderungen:
  - Build: Ordnerauswahl/Angabe, Backend-Auswahl (BM25/Chroma/Qdrant), Fortschritt/Status.
  - Query: Eingabe (Top-K), Trefferliste mit Datei/Zeilen und Copy/Jump.
  - Answer: `/rag/answer` mit lokalem LLM; Antwortanzeige mit kompakten Zitaten.
- Randbedingungen: Ressourcen-schonend (BM25 default), DSGVO, einfache Bedienung (rechtsseitige Chat-Sidebar vorhanden), vorhandene API `/rag/build`, `/rag/query`, `/rag/answer`.

## Optionen
1) Panel in rechter Chat-Sidebar (neuer Tab „RAG“)
- Vorteile: Immer verfügbar, wenig Kontextwechsel, kompakt.
- Nachteile: Beengter Platz (360px), begrenzte Dateiansicht.

2) Dedizierte Seite „/rag“
- Vorteile: Mehr Platz, erweiterbar (Filter, Trefferdiff, Vorschau).
- Nachteile: Kontextwechsel, zusätzl. Navigation.

3) Modal-Wizard
- Vorteile: Geführter Flow (Build → Query → Answer).
- Nachteile: Modals für längere Prozesse suboptimal, blockiert UI.

## Entscheidung
- Kurzfristig: Option 1 (Sidebar-Tab „RAG“) für schnelle Nutzung.
- Mittelfristig: Option 2 als erweiterte Route `/rag` mit erweiterten Features.

## UI-Skizze (Sidebar-Tab „RAG“)
- Sektionen: Build | Query | Answer
- Build:
  - Eingaben: Textfeld „Pfad(e)“ (Kommagetrennt), Select „Backend“, Button „Index bauen“.
  - Anzeige: Chip Status (ok/fehler), einfache Progress/Spinner.
- Query:
  - Eingaben: Textfeld „Frage/Query“, Select „Top K“, Button „Suchen“.
  - Trefferliste: Datei, Zeilen, Score, Aktionen: Kopieren, „In Editor öffnen“, „Als Kontext merken“ (künftig).
- Answer:
  - Button „Synthese starten“, Anzeige der Antwort, optional „Zitate anzeigen“.

## API-Mapping
- Build → POST `/rag/build` Body: `{ paths: ["linkup_mcp"], backend?: "fallback"|... }`
- Query → GET `/rag/query?q=...&k=...`
- Answer → POST `/rag/answer` Body: `{ question: string, k: number }`

## Telemetrie/DSGVO
- Keine externen Calls; lokales LLM per Ollama.
- Minimal-Logging (UI nur Statuscodes/Fehler).

## Risiken / Maßnahmen
- Lange Build-Zeiten → Spinner + Hinweis, Pfad-Granularität, später Streaming/Progress.
- Dateizugriff im Browser → nur Pfad-Strings; „Open in Editor“ optional via Protokoll/IDE-Bridge.

## Nächste Schritte (IMPLEMENT)
- Sidebar-Tab „RAG“ addieren (MUI Tabs), Komponenten für Build/Query/Answer.
- Optional Route `/rag` scaffolden und später ausbauen.
