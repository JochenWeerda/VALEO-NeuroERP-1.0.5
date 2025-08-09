# Verzeichnis der Verarbeitungstätigkeiten – VALERO-Die NeuroERP (lokales LLM)

## Verantwortlicher
- Firma/Organisation: <euer Unternehmen>
- Ansprechpartner: <DSB/IT-Leitung>

## Tätigkeit
- Zweck: KI-gestützte Codeanalyse, Dokumentation, Refactoring, interne Wissensabfrage (RAG)
- Kategorien betroffener Personen: Entwickler, Mitarbeiter (nur soweit im Code/Doku enthalten)
- Kategorien personenbezogener Daten: in der Regel keine, ggf. in Doku/Kommentaren enthaltene Namen/E-Mails (zu vermeiden)
- Datenquellen: internes Repository, interne Dokumentation
- Empfänger/Kategorien: keine externen Empfänger (on-prem)
- Drittlandtransfer: nein

## Rechtsgrundlage
- Berechtigtes Interesse (Art. 6 Abs. 1 lit. f DSGVO) bzw. Vertragserfüllung (Art. 6 Abs. 1 lit. b) – je nach Einsatzszenario

## Lösch-/Aufbewahrungsfristen
- RAG-Index/Logs: max. 90 Tage, danach Löschung/Neuaufbau
- Änderungs-Reports: 180 Tage, sofern erforderlich für Qualitätssicherung
- Sofortige Löschung sensibler Daten nach Meldung

## Technische und organisatorische Maßnahmen (TOMs)
- On-Prem-Ausführung, keine Telemetrie (CHROMA_TELEMETRY_DISABLED=1, LangChain Tracing off)
- Zugriffsschutz/RBAC, Netzsegmentierung, Verschlüsselung at rest (FS/DB)
- Datenminimierung: sensible Inhalte nicht indexieren (Pre-Filter)
- Pseudonymisierung/Anonymisierung falls unvermeidbar
- Protokollierung minimal, zweckgebunden; regelmäßige Reviews

## Betroffenenrechte
- Auskunft, Berichtigung, Löschung, Einschränkung, Widerspruch – prozessual verankert

## Datenschutz-Folgenabschätzung (falls erforderlich)
- Nicht erforderlich bei lokalen, nicht-personenbezogenen Daten; falls sensible Inhalte, Prüfung durchführen