# Schulungsmaterial: Web-Suche und RAG-Funktionalitäten in VALEO-NeuroERP

Dieses Schulungsmaterial führt Sie in die Nutzung der neuen Web-Suche und RAG-Funktionalitäten (Retrieval-Augmented Generation) in VALEO-NeuroERP ein.

## Inhaltsverzeichnis

1. [Einführung](#einführung)
2. [Web-Suche](#web-suche)
3. [Dokumentensuche mit RAG](#dokumentensuche-mit-rag)
4. [Unterstützte Dokumentformate](#unterstützte-dokumentformate)
5. [Anwendungsfälle nach Abteilung](#anwendungsfälle-nach-abteilung)
6. [Tipps für effektive Suchanfragen](#tipps-für-effektive-suchanfragen)
7. [Häufig gestellte Fragen](#häufig-gestellte-fragen)

## Einführung

Die Integration von Web-Suche und RAG-Funktionalitäten in VALEO-NeuroERP ermöglicht Ihnen:

- Aktuelle Informationen aus dem Web direkt im ERP-System zu recherchieren
- Interne Dokumente intelligent zu durchsuchen und zu analysieren
- Kontextbezogene Antworten auf Basis interner und externer Informationen zu erhalten

Diese Funktionalitäten sind nahtlos in Ihre gewohnte Arbeitsumgebung integriert und können über die Cursor.ai-Schnittstelle genutzt werden.

## Web-Suche

Die Web-Suche-Funktionalität ermöglicht es Ihnen, aktuelle Informationen aus dem Internet direkt in VALEO-NeuroERP zu recherchieren.

### Zugriff auf die Web-Suche

1. Öffnen Sie Cursor.ai in VALEO-NeuroERP
2. Geben Sie eine Suchanfrage ein, z.B. "Aktuelle ERP-Trends 2025"
3. Wählen Sie die Web-Suche-Funktion aus dem Werkzeugmenü

### Suchoptionen

Die Web-Suche bietet verschiedene Optionen zur Verfeinerung Ihrer Suchanfragen:

- **Zeitraum**: Begrenzen Sie die Suche auf einen bestimmten Zeitraum (z.B. letzte Woche, letzter Monat)
- **Region**: Fokussieren Sie die Suche auf eine bestimmte Region oder ein Land
- **Sprache**: Wählen Sie die bevorzugte Sprache für die Suchergebnisse
- **Domänenspezifische Suche**: Beschränken Sie die Suche auf bestimmte Domänen oder Quellentypen

### Beispiel für eine Web-Suche

```
Suche nach: Aktuelle Änderungen in der Umsatzsteuer Deutschland 2025
Zeitraum: Letzter Monat
Region: Deutschland
Sprache: Deutsch
```

## Dokumentensuche mit RAG

Die RAG-Funktionalität ermöglicht es Ihnen, interne Dokumente intelligent zu durchsuchen und zu analysieren.

### Zugriff auf die RAG-Funktionalität

1. Öffnen Sie Cursor.ai in VALEO-NeuroERP
2. Geben Sie eine Frage zu internen Dokumenten ein, z.B. "Was sind unsere aktuellen Richtlinien für Reisekostenabrechnungen?"
3. Wählen Sie die RAG-Funktion aus dem Werkzeugmenü

### Suchoptionen

Die RAG-Funktionalität bietet verschiedene Optionen zur Verfeinerung Ihrer Suchanfragen:

- **Dokumentenauswahl**: Wählen Sie bestimmte Dokumente oder Dokumentensammlungen aus
- **Metadaten-Filter**: Filtern Sie nach Autor, Erstellungsdatum, Abteilung, etc.
- **Kontexttiefe**: Bestimmen Sie, wie viel Kontext aus den Dokumenten berücksichtigt werden soll

### Beispiel für eine RAG-Anfrage

```
Frage: Was sind die aktuellen Genehmigungsstufen für Investitionen?
Dokumentenauswahl: Finanzrichtlinien, Prozesshandbuch
Metadaten-Filter: Letzte Aktualisierung nach 01.01.2025
```

## Unterstützte Dokumentformate

Das RAG-System unterstützt eine Vielzahl von Dokumentformaten:

### Microsoft Office Formate
- Word-Dokumente (.docx, .doc)
- Excel-Tabellen (.xlsx, .xls)
- PowerPoint-Präsentationen (.pptx, .ppt)

### LibreOffice Formate
- Writer-Dokumente (.odt, .ott)
- Calc-Tabellen (.ods, .ots)
- Impress-Präsentationen (.odp, .otp)
- Draw-Dokumente (.odg, .otg)

### Weitere Formate
- PDF-Dokumente (.pdf)
- Textdateien (.txt)
- Markdown-Dateien (.md)
- HTML-Dokumente (.html, .htm)
- Gescannte Dokumente (mit OCR-Unterstützung)

### Arbeiten mit LibreOffice-Dokumenten

Die Integration von LibreOffice-Dokumenten bietet besondere Vorteile:

1. **Vollständige Unterstützung offener Standards**: Alle ODF-Formate (Open Document Format) werden nativ unterstützt.
2. **Strukturierte Datenextraktion**: Aus Calc-Tabellen werden Daten strukturiert extrahiert, mit Erhalt der Tabellenstruktur.
3. **Präsentationsanalyse**: Aus Impress-Präsentationen werden sowohl Folieninhalte als auch Notizen extrahiert.
4. **Zeichnungstexte**: Aus Draw-Dokumenten werden Beschriftungen und Textelemente extrahiert.

#### Tipps für optimale Ergebnisse mit LibreOffice-Dokumenten:

- Verwenden Sie aussagekräftige Dokumenttitel und Überschriften
- Nutzen Sie die Formatvorlagen von LibreOffice für eine bessere Strukturerkennung
- Bei Calc-Tabellen: Verwenden Sie Tabellenbeschriftungen und Zellkommentare für zusätzlichen Kontext
- Bei Impress-Präsentationen: Fügen Sie Notizen hinzu, um den Kontext der Folien zu erweitern

## Anwendungsfälle nach Abteilung

### Finanzen

- **Marktanalyse**: Recherchieren Sie aktuelle Finanztrends und -entwicklungen
- **Compliance-Überwachung**: Bleiben Sie über regulatorische Änderungen informiert
- **Richtlinienabfragen**: Finden Sie schnell relevante Informationen in internen Finanzrichtlinien

### Einkauf

- **Lieferantenanalyse**: Recherchieren Sie potenzielle Lieferanten und deren Reputation
- **Marktpreisvergleiche**: Ermitteln Sie aktuelle Marktpreise für Produkte und Dienstleistungen
- **Vertragsverwaltung**: Finden Sie relevante Klauseln in Einkaufsverträgen

### Vertrieb

- **Kundenrecherche**: Sammeln Sie Informationen über potenzielle Kunden
- **Wettbewerbsanalyse**: Bleiben Sie über Aktivitäten der Konkurrenz informiert
- **Produktwissen**: Greifen Sie schnell auf interne Produktdokumentationen zu

### Produktentwicklung

- **Technologietrends**: Recherchieren Sie aktuelle technologische Entwicklungen
- **Patentrecherche**: Überprüfen Sie Patente und geistiges Eigentum
- **Anforderungsanalyse**: Analysieren Sie interne Anforderungsdokumente

## Tipps für effektive Suchanfragen

### Web-Suche

1. **Spezifische Begriffe verwenden**: Je spezifischer Ihre Anfrage, desto relevanter die Ergebnisse
2. **Zeitliche Eingrenzung**: Nutzen Sie die Zeitraumfilter für aktuelle Informationen
3. **Domänenspezifische Suche**: Beschränken Sie die Suche auf vertrauenswürdige Quellen

### RAG-Anfragen

1. **Präzise Fragen stellen**: Formulieren Sie klare und spezifische Fragen
2. **Kontext hinzufügen**: Geben Sie relevanten Kontext für Ihre Anfrage an
3. **Dokumentenauswahl eingrenzen**: Wählen Sie die relevantesten Dokumente für Ihre Anfrage aus

## Häufig gestellte Fragen

### Allgemein

**F: Wie unterscheiden sich Web-Suche und RAG-Funktionalität?**  
A: Die Web-Suche greift auf aktuelle Informationen aus dem Internet zu, während die RAG-Funktionalität interne Dokumente analysiert.

**F: Sind meine Suchanfragen vertraulich?**  
A: Ja, alle Suchanfragen werden gemäß unserer Datenschutzrichtlinien behandelt und nicht für andere Zwecke verwendet.

### Web-Suche

**F: Wie aktuell sind die Informationen aus der Web-Suche?**  
A: Die Web-Suche greift auf aktuelle Informationen aus dem Internet zu, die Aktualität hängt von der Indexierung der Suchmaschine ab.

**F: Kann ich die Suchergebnisse speichern?**  
A: Ja, Sie können Suchergebnisse speichern und in Berichte oder andere Dokumente integrieren.

### RAG-Funktionalität

**F: Welche internen Dokumente werden durchsucht?**  
A: Das System durchsucht alle Dokumente, auf die Sie Zugriff haben, gemäß Ihren Berechtigungen.

**F: Wie werden vertrauliche Informationen geschützt?**  
A: Das System berücksichtigt Ihre Zugriffsberechtigungen und gibt nur Informationen preis, auf die Sie Zugriff haben.

**F: Wie werden LibreOffice-Dokumente im Vergleich zu Microsoft Office-Dokumenten verarbeitet?**  
A: LibreOffice-Dokumente werden nativ über die UNO-Bridge verarbeitet, was eine präzise Extraktion von Text und Struktur ermöglicht. Microsoft Office-Dokumente werden über spezialisierte Parser verarbeitet. Beide Ansätze liefern hochwertige Ergebnisse, wobei die LibreOffice-Integration besonders gut für ODF-Formate optimiert ist.

---

Bei weiteren Fragen wenden Sie sich bitte an das Support-Team unter support@valeo-neuroerp.com oder nutzen Sie das interne Ticketsystem. 