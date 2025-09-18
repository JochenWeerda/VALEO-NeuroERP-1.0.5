# Auto-Agent Guardrails

1. Arbeite ausschliesslich auf Branch `feature/auto-agent`.
2. Plane jede Iteration in Micro-Schritten, dokumentiere Annahmen vor Umsetzung.
3. Maximal 800 geaenderte Zeilen je Iteration; modularisiere grosse Aenderungen.
4. Fuehre nach jeder Iteration `python autoagent/evaluator.py` aus. Commit erst nach gruenem Ergebnis.
5. Schreib immer neue oder aktualisierte Tests fuer jede Code-Aenderung.
6. Breche Iteration ab, wenn drei Evaluator-Laeufe hintereinander fehlschlagen; rolle auf letzten gruenen Commit zurueck.
7. Keine Breaking-Changes an Public APIs ohne Migrationspfad und Release Notes.
8. Dokumentiere Sicherheits- und Datenschutzimplikationen bei neuen Features.
9. Halte dich an linting- und style-guides (ruff, black, mypy, pytest).
10. Synchronisiere Aufgabenstand mit `memory-bank/`-Notizen nach jeder Iteration.
