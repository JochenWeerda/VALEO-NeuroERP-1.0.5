# Dokumentation des SERM-Datenmodells für das AI-gesteuerte ERP-System

## Überblick

Diese Dokumentation bietet einen umfassenden Überblick über das Structured Entity Relationship Model (SERM) des AI-gesteuerten ERP-Systems. Das Modell besteht aus einem Basismodell und mehreren spezialisierten Erweiterungen, die detaillierte Abbildungen für verschiedene Geschäftsbereiche bieten.

## Struktur der Dokumentation

Die SERM-Dokumentation ist in folgende Hauptdokumente unterteilt:

1. **Basis-SERM-Modell** (`memory-bank/creative/erp-datenmodell-serm.md`)
   - Grundlegende Entitäten und Beziehungen des ERP-Systems
   - Normalisierte Datenstrukturen nach der dritten Normalform (3NF)
   - Basisentitäten für Organisation, Partner, Produkte, Lager, Preise, Verkauf, Einkauf und Finanzen

2. **Artikel-Stammdaten-Erweiterung** (`memory-bank/erp-datenmodell-serm-stammdaten-erweitert.md`)
   - Detaillierte Erweiterung der Produktstrukturen
   - KI-Erweiterungen für Artikelklassifikation, Preisempfehlungen und Text-Generierung
   - Zusätzliche Entitäten für Dokumente, Preise, Lagerbestände und alternative Einheiten

3. **Partner-Stammdaten-Erweiterung** (`memory-bank/erp-datenmodell-serm-partner-erweiterungen.md`)
   - Erweiterung des Partner-Modells (Kunden, Lieferanten, Mitarbeiter)
   - Spezialisierte CPD-Konten-Struktur für Kreditor-Stammdaten
   - Unterstützende Entitäten für Adressen, Kontakte, Bankverbindungen und Tags

4. **Finanzen-Stammdaten-Erweiterung** (`memory-bank/erp-datenmodell-serm-finanzen-erweiterungen.md`)
   - Umfassendes Modell für Finanz- und Buchhaltungsdaten
   - Strukturen für Kontenplan, Steuern, Währungen und Buchungen
   - Unterstützung für Kostenstellen, Kostenträger und Geschäftsjahre

## Implementierungsstatus

Das SERM-Modell wurde als konzeptionelle Grundlage für die Implementierung des ERP-Systems verwendet. Der aktuelle Implementierungsstatus der einzelnen Module ist wie folgt:

- **Artikel-Stammdaten**: Vollständig implementiert in `backend/models/artikel_stammdaten.py`
- **Partner-Stammdaten**: Kernfunktionen implementiert in `backend/models/partner.py` und `backend/models/customer.py`
- **Finanzen-Stammdaten**: Grundstruktur implementiert in `backend/models/finanzen.py`

## Beziehungen zwischen den Modellen

Die verschiedenen Erweiterungen des SERM-Modells sind durch Beziehungen miteinander verbunden:

```
Basis-SERM-Modell
    ├── Artikel-Stammdaten-Erweiterung
    │   └── Beziehungen zu Partner und Finanzen
    ├── Partner-Stammdaten-Erweiterung
    │   └── Beziehungen zu Artikel und Finanzen
    └── Finanzen-Stammdaten-Erweiterung
        └── Beziehungen zu Artikel und Partner
```

Wichtige übergreifende Beziehungen sind:
- Partner (Lieferanten) zu Artikeln über Artikellieferant
- Artikel zu Finanzen über Buchungskonten und Steuersätze
- Partner zu Finanzen über Zahlungsbedingungen und Buchungskonten

## Erweiterbarkeit

Das SERM-Modell wurde mit Fokus auf Erweiterbarkeit konzipiert:

1. **Modulare Struktur**: Jeder Geschäftsbereich kann unabhängig erweitert werden
2. **Konsistente Basis**: Gemeinsame Grundstruktur für alle Erweiterungen
3. **Vererbung**: Nutzung von Vererbung für spezialisierte Entitäten
4. **Flexible Beziehungen**: N:M-Beziehungen erlauben komplexe Verknüpfungen

## KI-Integration

Ein besonderes Merkmal des SERM-Modells ist die Integration von KI-Funktionen:

1. **Artikel-KI-Erweiterungen**: 
   - Automatische Klassifikation von Artikeln
   - Preisempfehlungen basierend auf Marktdaten
   - Automatische Textgenerierung für Beschreibungen

2. **Partner-KI-Funktionen**:
   - Automatische Kategorisierung von Partnern
   - Empfehlung von passenden Konditionen

3. **Finanzen-KI-Funktionen**:
   - Anomalieerkennung bei Buchungen
   - Vorschläge für Kontenzuordnungen

## Verwendung der Dokumentation

Diese Dokumentation dient als Referenz für Entwickler, die am ERP-System arbeiten:

1. **Für neue Funktionen**: Verstehen der bestehenden Datenstrukturen und Beziehungen
2. **Für Erweiterungen**: Identifizieren der passenden Erweiterungspunkte im Modell
3. **Für Bugfixes**: Nachvollziehen der Datenflüsse und Abhängigkeiten

## Hinweise zur Weiterentwicklung

Bei der Weiterentwicklung des Datenmodells sollten folgende Prinzipien beachtet werden:

1. **Normalisierung beibehalten**: Datenredundanz vermeiden
2. **Beziehungen dokumentieren**: Fremdschlüsselbeziehungen klar definieren
3. **Erweiterungen integrieren**: Neue Module an bestehende Strukturen anbinden
4. **Dokumentation aktualisieren**: Bei signifikanten Änderungen die SERM-Dokumentation aktualisieren 