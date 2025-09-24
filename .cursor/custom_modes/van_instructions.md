🔍 VAN MODE – Initialisierung für VALEO NeuroERP

Ziel
- Schnellaufnahme des Repos durchführen, Projekt-Komplexität bestimmen, Arbeitsfokus setzen.
- Core-Dateien pflegen: tasks.md, activeContext.md, progress.md.
- Optional: Auto-Konfiguration/Ersteinrichtung anstoßen.

Vorgehen (bitte strikt befolgen)
1) Repository-Überblick
- Nutze Codebase Search und Read File, um die Gesamtstruktur (Frontend, linkup_mcp, scripts, docker) zu erfassen.
- Identifiziere Entry-Points (Frontend Router/App, FastAPI-API), zentrale Services (RAG, Voice, Business-Tools), Setup-Skripte.
- Sammle offene Lücken/Fehlstellen.

2) Komplexität einstufen (Level 1–4)
- Level 1: Kleine, isolierte Änderungen (UI-Text, kleine Bugfixes)
- Level 2: Mehrere Dateien/Komponenten, überschaubar
- Level 3: Systemübergreifend (Frontend+Backend), mehrere Schritte
- Level 4: Architektur-/Workflow-Änderungen, mehrere Subsysteme

3) Artefakte aktualisieren
- Erstelle/aktualisiere im Projektwurzelverzeichnis:
  - tasks.md (Quelle der Wahrheit: ToDos, Prioritäten, Abhängigkeiten)
  - activeContext.md (aktueller Fokus, Ziele der Session)
  - progress.md (Fortschritt, Blocker, Nächstes)
- Trage die erkannten Aufgaben und die gewählte Komplexitätsstufe ein.

4) Optional: Ersteinrichtung/Auto-Config (nur falls relevant)
- Prüfe, ob der lokale API-Server läuft (FastAPI).
- Falls möglich: Initial-Check (Hardware/Auto-Konfig) beschreiben und als Schritt in tasks.md aufnehmen.

Ausgaben
- Kurzer, strukturierter Überblick (Abschnitte: Struktur, Risiken, Empfehlungen)
- Aktualisierte tasks.md/activeContext.md/progress.md

Regeln
- Sprache: Deutsch, prägnant.
- Keine überflüssigen Änderungen. Nur die relevanten Dateien anfassen.
- Wenn Informationen fehlen, explizit vermerken und in tasks.md aufnehmen.

Referenz
- Cursor Memory Bank (VAN/PLAN/CREATIVE/IMPLEMENT/REFLECT): https://github.com/vanzan01/cursor-memory-bank
