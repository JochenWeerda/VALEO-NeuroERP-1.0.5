# VALEO-NeuroERP: Web-Suche und RAG-Integration

Diese README bietet einen Überblick über die Integration der Web-Suche und RAG (Retrieval-Augmented Generation) Funktionalitäten in das VALEO-NeuroERP-System.

## Überblick

Die Integration umfasst:

1. **Web-Suche**: Echtzeit-Informationsbeschaffung aus dem Internet
2. **RAG (Retrieval-Augmented Generation)**: Intelligente Analyse interner Dokumente
3. **MCP-Server**: Integration beider Funktionalitäten in Cursor.ai

Diese Funktionalitäten bilden eine leistungsstarke Grundlage für datengestützte Entscheidungsfindung und effiziente Informationsverarbeitung im VALEO-NeuroERP-System.

## Implementierte Komponenten

| Komponente | Beschreibung | Datei |
|------------|-------------|-------|
| Web-Suche | Direkte Integration der Linkup API | `server_simplified.py` |
| RAG-System | Dokumentenanalyse mit OpenAI und FAISS | `rag_simplified.py` |
| MCP-Server | Kombinierte Bereitstellung für Cursor.ai | `server_fastmcp.py` |
| MCP-Konfiguration | Konfiguration für Cursor.ai | `mcp_config.json` |

## Dokumentation

Folgende Dokumente bieten detaillierte Informationen:

1. **[Integration-Strategie](integration_strategie.md)**: Detaillierte Strategie zur Integration in bestehende Geschäftsprozesse
2. **[Prompt-Bibliothek](prompt_bibliothek.md)**: Sammlung optimierter Prompts für verschiedene Anwendungsfälle
3. **[Erweiterungsplan](erweiterungsplan.md)**: Plan für zukünftige Erweiterungen und Verbesserungen
4. **[Zusammenfassung](zusammenfassung.md)**: Technische Zusammenfassung der Implementierung

## Schnellstart

### Web-Suche

```bash
python server_simplified.py
```

Führt eine interaktive Web-Suche durch und gibt die Ergebnisse zurück.

### RAG-System

```bash
python rag_simplified.py
```

Analysiert lokale Dokumente im `data`-Verzeichnis und beantwortet Fragen dazu.

### MCP-Server

```bash
python server_fastmcp.py
```

Startet den MCP-Server auf Port 8001, der sowohl Web-Suche als auch RAG-Funktionalitäten bereitstellt.

## Integration in Cursor.ai

1. Öffnen Sie Cursor.ai
2. Gehen Sie zu den Einstellungen
3. Wählen Sie "MCP" im Menü
4. Klicken Sie auf "+ Add new MCP server"
5. Fügen Sie die Konfiguration aus `mcp_config.json` ein
6. Speichern und aktivieren Sie den Server

## Anwendungsfälle

Die Integration unterstützt verschiedene Anwendungsfälle in allen Abteilungen:

- **Finanzen**: Marktanalyse, Compliance-Überwachung
- **Einkauf**: Lieferantenanalyse, Preisoptimierung
- **Vertrieb**: Kundensegmentierung, Wettbewerbsanalyse
- **Produktentwicklung**: Marktanforderungen, Technologietrends
- **IT & Entwicklung**: Code-Optimierung, Fehlerbehebung

Detaillierte Prompts für diese Anwendungsfälle finden Sie in der [Prompt-Bibliothek](prompt_bibliothek.md).

## Technische Anforderungen

- Python 3.8+
- OpenAI API-Schlüssel
- Linkup API-Schlüssel
- Installierte Abhängigkeiten (siehe `requirements.txt`)

## Nächste Schritte

1. Vorstellung der Integration im nächsten Management-Meeting
2. Bildung eines cross-funktionalen Implementierungsteams
3. Detaillierte Planung der ersten Erweiterungsphase
4. Kick-off-Meeting mit allen Stakeholdern

## Kontakt

Bei Fragen oder Anregungen wenden Sie sich bitte an das VALEO-NeuroERP-Entwicklungsteam. 