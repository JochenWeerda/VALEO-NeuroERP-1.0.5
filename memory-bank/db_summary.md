# Datenbankstruktur des AI-gesteuerten ERP-Systems

Die Datenbankanalyse zeigt eine umfangreiche Datenbankstruktur mit zahlreichen Tabellen, die die Grundlage für das ERP-System bilden werden. Die Struktur umfasst alle wichtigen Bereiche eines ERP-Systems einschließlich Kundenverwaltung, Artikelverwaltung, Lagerverwaltung, Auftragsabwicklung, Finanzbuchhaltung und mehr.

## Hauptkomponenten der Datenbankstruktur

### Kundenverwaltung
- Kundenstammdaten (ABSAGEGRUND, KUNDE, etc.)
- Kundenkontakte und Ansprechpartner
- Zusatzfelder für erweiterte Kundeninformationen (ZUSATZFELDER_KUNDE)

### Artikelverwaltung
- Artikelstammdaten (WWS_ARTIKEL)
- Artikelzusatzinformationen
- Preisgestaltung und Rabatte
- Chargen- und Seriennummernverwaltung

### Lagerverwaltung
- Lagerbestände
- Lagerbewegungen
- Bestandsveränderungen

### Auftragsabwicklung
- Angebote
- Aufträge
- Lieferscheine
- Rechnungen
- Verkaufsdokumente (WWS_VERKAUF1, WWS_VERKAUF2)

### Finanzbuchhaltung
- Offene Posten
- Zahlungsabwicklung (ZAHLVORSCH, ZAHLVEINZ)
- Mahnwesen
- Buchhaltungskontendaten

### Zusatzmodule
- Personalverwaltung (ZUSATZFELDER_PERSONAL)
- Dokumentenmanagement (WWS_WS_UNTERLAGEN, WWS_WS_UNTERLAGENSEITEN)
- Zeiterfassung (ZEITERF_TERMINALS)

## Besondere Merkmale

1. **Flexibles Zusatzfeldersystem**
   - Umfangreiche Zusatzfeldertabellen (ZUSATZFELDER_*)
   - Ermöglicht die Erweiterung von Standardtabellen ohne Schemaänderung

2. **Mehrsprachigkeit**
   - Sprach-spezifische Tabellen für verschiedene Entitäten

3. **Replikationssystem**
   - REPL_ID und REPL_DATABASE Felder in fast allen Tabellen
   - Unterstützt verteilte Datenbanken und Datensynchronisation

4. **Dokumentenmanagement**
   - Integration von Dokumenten und Unterlagen
   - Speicherung von Seitenreferenzen und Metadaten

## Wichtige Tabellen für die Entwicklung

1. **WWS_ARTIKEL** - Zentrale Artikelverwaltung
2. **KUNDE** - Kundenstammdaten
3. **WWS_VERKAUF1/2** - Verkaufsdokumente und -transaktionen
4. **ZAHLVORSCH/ZAHLVEINZ** - Zahlungsabwicklung
5. **WWS_WSTR** - Warenbewegungen und Transaktionen

## Technische Beobachtungen

1. Die Datenbank zeigt eine klassische relationale Struktur
2. Viele Tabellen verwenden ID/DBID als Primärschlüssel
3. Konsistente Namenskonventionen über das gesamte Schema
4. Erweiterbarkeit durch Zusatzfelder
5. Unterstützung für Mehrwährungsfunktionen

Diese Datenbankstruktur bildet die Grundlage für die Entwicklung des AI-gesteuerten ERP-Systems. Bei der Implementierung werden wir dieses Schema verwenden und durch KI-Funktionalitäten erweitern. 