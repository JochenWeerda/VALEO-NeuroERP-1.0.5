# Phase 3: Datenbankoptimierung (Sprint 2)

## Übersicht

Die Datenbankoptimierung ist ein wesentlicher Bestandteil der Performance-Optimierung des ERP-Systems. In dieser Phase werden verschiedene Techniken eingesetzt, um die Datenbankabfragen zu optimieren, die Antwortzeiten zu reduzieren und die Skalierbarkeit des Systems zu verbessern.

## Zielsetzungen

1. **Identifikation von Performance-Engpässen** in API-Endpunkten mit Fokus auf Datenbankabfragen
2. **Optimierung kritischer Abfragen** durch verschiedene Techniken
3. **Implementierung von Indizes** für häufig abgefragte Felder
4. **Einführung von Batch-Processing** für große Datensätze
5. **Optimierung komplexer Abfragen** durch bessere Abfragestrategien
6. **Reduzierung der Anzahl von Datenbankabfragen** pro API-Anfrage
7. **Messung und Dokumentation** der Performance-Verbesserungen

## Implementierungsplan

### Schritt 1: Performance-Analyse

Da der komplexe modulare Server einige Probleme bei der Ausführung hat, verwenden wir einen vereinfachten Ansatz mit:

1. **Einfacher API-Server** (`simple_server.py`): Ein vereinfachter FastAPI-Server, der grundlegende API-Endpunkte bereitstellt und künstliche Verzögerungen enthält, um die Datenbankabfragen zu simulieren.
2. **Datenbankoptimierungs-Tool** (`db_optimizer.py`): Ein Tool, das API-Endpunkte profiliert, Datenbankabfragen analysiert und Optimierungsvorschläge gibt.

Diese vereinfachten Tools ermöglichen es uns, die Kernprinzipien der Datenbankoptimierung zu demonstrieren, ohne die Komplexität des vollständigen modularen Servers zu bewältigen.

### Schritt 2: Implementierung von Optimierungstechniken

Basierend auf den Ergebnissen der Performance-Analyse werden wir verschiedene Optimierungstechniken anwenden:

1. **Indexoptimierung**
   - Identifizierung und Erstellung geeigneter Indizes für häufig abgefragte Felder
   - Optimierung bestehender Indizes

2. **Abfrageoptimierung**
   - Umstrukturierung ineffizienter Abfragen
   - Vermeidung von N+1-Problemen durch Batch-Abfragen oder Joins
   - Optimierung von JOIN-Bedingungen

3. **Datenbankschema-Optimierung**
   - Datentypen überprüfen und optimieren
   - Normalisierung/Denormalisierung, wo angemessen

4. **Implementierung von Batch-Processing**
   - Einführung von Batch-Operationen für große Datensätze
   - Paginierung für umfangreiche Ergebnismengen

5. **Caching-Integration**
   - Identifikation von Cacheable-Daten
   - Integration mit dem bestehenden Cache-System

### Schritt 3: Implementierung von Metriken und Überwachung

1. **Erweiterung des Profiling-Systems**
   - Detaillierte Erfassung von Datenbankabfragen
   - Automatische Erkennung von Slow Queries

2. **Dashboard für Datenbankperformance**
   - Visualisierung von Abfragezeiten
   - Trendanalyse der Datenbankleistung

### Schritt 4: Dokumentation und Best Practices

1. **Dokumentation der Optimierungen**
   - Beschreibung der implementierten Optimierungen
   - Vergleich der Performance vor und nach der Optimierung

2. **Entwicklung von Best Practices**
   - Richtlinien für effiziente Datenbankabfragen
   - Code-Reviews mit Fokus auf Datenbankzugriff

## Technische Details

### Optimierungsstrategien für häufige Probleme

1. **N+1 Problem**
   - **Problem**: Für jedes Ergebnis einer Abfrage wird eine zusätzliche Abfrage ausgeführt
   - **Lösung**: Batch-Abfragen oder JOIN-Operationen verwenden

2. **Ineffiziente Indizes**
   - **Problem**: Fehlende oder falsch konfigurierte Indizes führen zu langsamen Abfragen
   - **Lösung**: Analyse der Abfragemuster und Erstellung passender Indizes

3. **Übermäßige Datenabrufe**
   - **Problem**: Abrufen von mehr Daten als benötigt
   - **Lösung**: Spezifische Spaltenauswahl statt SELECT *

4. **Komplexe Abfragen**
   - **Problem**: Unnötig komplexe Abfragen, die die Datenbank belasten
   - **Lösung**: Abfragen vereinfachen, auf temporäre Tabellen oder materialisierte Views zurückgreifen

5. **Fehlende Paginierung**
   - **Problem**: Abrufen großer Datensätze ohne Paginierung
   - **Lösung**: Paginierung für alle Listen-Endpunkte implementieren

### Implementierung von Datenbankindizes

```sql
-- Beispiel für die Erstellung eines Indexes für häufig verwendete Suchfelder
CREATE INDEX idx_artikel_kategorie ON artikel(kategorie);
CREATE INDEX idx_charge_artikel_id ON charge(artikel_id);
CREATE INDEX idx_charge_prod_datum ON charge(produktionsdatum);
```

### Implementierung von Batch-Operationen

```python
# Beispiel für Batch-Abruf statt N+1-Abfragen
def get_artikel_mit_chargen(artikel_ids):
    artikel_dict = {a.id: a for a in db.query(Artikel).filter(Artikel.id.in_(artikel_ids))}
    chargen = db.query(Charge).filter(Charge.artikel_id.in_(artikel_ids))
    
    # Chargen zu den entsprechenden Artikeln zuordnen
    for charge in chargen:
        artikel = artikel_dict.get(charge.artikel_id)
        if artikel:
            if not hasattr(artikel, 'chargen'):
                artikel.chargen = []
            artikel.chargen.append(charge)
    
    return list(artikel_dict.values())
```

## Erwartete Ergebnisse

1. **Reduzierung der durchschnittlichen Antwortzeit** um mindestens 40%
2. **Reduzierung der Anzahl von Datenbankabfragen** pro API-Anfrage um mindestens 30%
3. **Verbesserte Skalierbarkeit** des Systems bei steigender Last
4. **Reduzierung der CPU- und Speicherauslastung** der Datenbankserver

## Fortschrittsverfolgung

| Optimierung                                    | Status      | Verbesserung    |
|------------------------------------------------|-------------|-----------------|
| Analyse der kritischen Endpunkte               | Geplant     | -               |
| Indexoptimierung                               | Geplant     | -               |
| Batch-Processing für Chargen                   | Geplant     | -               |
| Optimierung komplexer JOIN-Abfragen            | Geplant     | -               |
| Implementierung des Überwachungssystems        | Geplant     | -               |
| Dokumentation der Best Practices               | Geplant     | -               | 