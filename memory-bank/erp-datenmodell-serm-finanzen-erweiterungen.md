# SERM-Datenmodell für das AI-gesteuerte ERP-System - Finanzen-Stammdaten-Erweiterung

## Einführung zur Finanzen-Stammdaten-Erweiterung

Die Finanzen-Stammdaten-Erweiterung baut auf dem bestehenden SERM-Datenmodell auf und implementiert ein umfassendes Stammdatenmodell für Finanzen und Buchhaltung mit speziellen Strukturen für Konten, Steuersätze, Währungen und Buchungen. Diese Erweiterung vertieft die im Basis-SERM-Modell definierten Finanzstrukturen und fügt spezialisierte Entitäten für erweiterte Finanzverwaltung hinzu.

## Erweitertes SERM-Modell für Finanzen-Stammdaten

### 1. Kontenplan und Konten

```
KontoArt [Enum]
├── AKTIVA
├── PASSIVA
├── AUFWAND
├── ERTRAG
└── EIGENKAPITAL

Kontenplan [1..*]
├── ID (PK)
├── Code
├── Name
├── Beschreibung
├── Land
├── Währung
├── Ist_Aktiv (Boolean)
├── Erstellt_Am
└── Geändert_Am

Konto [1..* ⟷ 1 Kontenplan]
├── ID (PK)
├── Kontenplan_ID (FK)
├── Kontonummer
├── Name
├── Beschreibung
├── Kontenart [Aktiva, Passiva, Aufwand, Ertrag, Eigenkapital]
├── Übergeordnetes_Konto_ID (FK → Konto, selbstreferenzierend)
├── Saldo
├── Währung
├── Ist_Gruppe (Boolean)
├── Ist_Aktiv (Boolean)
├── Steuerrelevant (Boolean)
├── Erstellt_Am
└── Geändert_Am
```

### 2. Steuerverwaltung

```
SteuerArt [Enum]
├── UMSATZSTEUER
├── VORSTEUER
└── SONSTIGE

Steuerkategorie [1..*]
├── ID (PK)
├── Name
├── Beschreibung
├── Ist_Aktiv (Boolean)
├── Erstellt_Am
└── Geändert_Am

Steuersatz [1..* ⟷ 1 Steuerkategorie]
├── ID (PK)
├── Steuerkategorie_ID (FK)
├── Code
├── Name
├── Beschreibung
├── Steuerart [Umsatzsteuer, Vorsteuer, Sonstige]
├── Prozentsatz
├── Land
├── Gültig_Ab
├── Gültig_Bis
├── Konto_ID (FK → Konto)
├── Ist_Aktiv (Boolean)
├── Erstellt_Am
└── Geändert_Am

SteuerkategorieZuordnung [0..* ⟷ 1 Steuerkategorie]
├── ID (PK)
├── Steuerkategorie_ID (FK)
├── Referenz_Typ [Kunde, Lieferant, Artikel]
├── Referenz_ID
├── Ist_Standard (Boolean)
├── Erstellt_Am
└── Geändert_Am
```

### 3. Währungen und Wechselkurse

```
Währung [1..*]
├── ID (PK)
├── Code
├── Name
├── Symbol
├── Position_Symbol [vor, nach]
├── Dezimalstellen
├── Ist_Hauptwährung (Boolean)
├── Ist_Aktiv (Boolean)
├── Erstellt_Am
└── Geändert_Am

Wechselkurs [0..* ⟷ 1 Währung]
├── ID (PK)
├── Von_Währung_ID (FK → Währung)
├── Zu_Währung_ID (FK → Währung)
├── Kurs
├── Datum
├── Ist_Aktiv (Boolean)
├── Erstellt_Am
└── Geändert_Am
```

### 4. Buchhaltungsperioden

```
Geschäftsjahr [1..*]
├── ID (PK)
├── Name
├── Von_Datum
├── Bis_Datum
├── Ist_Abgeschlossen (Boolean)
├── Erstellt_Am
└── Geändert_Am

Buchungsperiode [1..* ⟷ 1 Geschäftsjahr]
├── ID (PK)
├── Geschäftsjahr_ID (FK)
├── Name
├── Von_Datum
├── Bis_Datum
├── Ist_Abgeschlossen (Boolean)
├── Erstellt_Am
└── Geändert_Am
```

### 5. Buchungen und Journale

```
Journal [1..*]
├── ID (PK)
├── Code
├── Name
├── Beschreibung
├── Journaltyp [Verkauf, Einkauf, Bank, Allgemein]
├── Standardkonto_ID (FK → Konto)
├── Ist_Aktiv (Boolean)
├── Erstellt_Am
└── Geändert_Am

Buchung [0..* ⟷ 1 Journal]
├── ID (PK)
├── Journal_ID (FK)
├── Buchungsnummer
├── Buchungsdatum
├── Valutadatum
├── Buchungstext
├── Betrag
├── Konto_ID (FK → Konto)
├── Gegenkonto_ID (FK → Konto)
├── Referenz_Typ [Rechnung, Zahlung, Manuell]
├── Referenz_ID
├── Beleg_ID (FK, nullable)
├── Benutzer_ID (FK → User)
├── Storno_ID (FK → Buchung, selbstreferenzierend)
├── Erstellt_Am
└── Geändert_Am
```

### 6. Kostenstellen und Kostenträger

```
Kostenstelle [0..*]
├── ID (PK)
├── Code
├── Name
├── Beschreibung
├── Übergeordnete_Kostenstelle_ID (FK → Kostenstelle, selbstreferenzierend)
├── Ist_Aktiv (Boolean)
├── Erstellt_Am
└── Geändert_Am

Kostenträger [0..*]
├── ID (PK)
├── Code
├── Name
├── Beschreibung
├── Ist_Aktiv (Boolean)
├── Erstellt_Am
└── Geändert_Am
```

### 7. Zahlungsbedingungen

```
Zahlungsbedingung [1..*]
├── ID (PK)
├── Name
├── Beschreibung
├── Zahlungsfrist_Tage
├── Skonto_Prozent
├── Skonto_Tage
├── Ist_Aktiv (Boolean)
├── Erstellt_Am
└── Geändert_Am
```

## Integration mit dem Basis-SERM-Modell

Das erweiterte Finanzen-Stammdaten-Modell integriert sich in das Basis-SERM-Modell durch Verknüpfungen mit Partnern, Artikeln und anderen Entitäten.

### Beziehungen zum Basis-SERM-Modell

- **Konto ⟷ Artikel**: Zuordnung von Buchungskonten zu Artikeln für Erlöse und Aufwendungen
- **Konto ⟷ Partner**: Zuordnung von Buchungskonten zu Partnern für Debitor/Kreditor
- **Steuersatz ⟷ Artikel**: Zuordnung von Steuersätzen zu Artikeln
- **Steuerkategorie ⟷ Partner**: Zuordnung von Steuerkategorien zu Partnern
- **Zahlungsbedingung ⟷ Partner**: Zuordnung von Zahlungsbedingungen zu Partnern
- **Buchung ⟷ Beleg**: Verknüpfung von Buchungen mit Belegen (Rechnungen, Lieferscheine, etc.)
- **Kostenstelle ⟷ Abteilung**: Verknüpfung von Kostenstellen mit Organisationseinheiten

## Erweiterungen zum Basis-SERM-Modell

Das erweiterte Modell fügt folgende Konzepte zum Basis-SERM-Modell hinzu:

1. **Hierarchischer Kontenplan**: Strukturierte Kontenorganisation mit Kontengruppen und Unterkonten
2. **Steuerverwaltung**: Differenzierte Steuerbehandlung nach Kategorien und Ländern
3. **Mehrwährungsfähigkeit**: Unterstützung für verschiedene Währungen und Wechselkurse
4. **Geschäftsjahre und Perioden**: Zeitliche Strukturierung der Buchhaltung
5. **Kostenrechnung**: Kostenstellen und Kostenträger für detaillierte Auswertungen
6. **Zahlungsbedingungen**: Flexible Definitionen von Zahlungsfristen und Skonti

## Vorteile des erweiterten Modells

1. **Vollständige Finanzabbildung**: Umfassende Unterstützung aller Finanzprozesse
2. **Flexibilität**: Anpassbarkeit an unterschiedliche Rechnungslegungsvorschriften
3. **Mehrwährungsfähigkeit**: Internationale Geschäfte und Währungsumrechnungen
4. **Hierarchische Strukturen**: Abbildung komplexer Konten- und Kostenstellenhierarchien
5. **Periodengerechte Buchführung**: Unterstützung für Periodenabschlüsse und Geschäftsjahre

## Implementierungshinweise

- Die Kontenstruktur ermöglicht die Abbildung verschiedener Kontenpläne (SKR03, SKR04, etc.)
- Steuersätze sind zeitlich begrenzt gültig und können für verschiedene Länder definiert werden
- Wechselkurse werden mit Zeitstempel gespeichert für historische Betrachtungen
- Kostenstellenrechnung ermöglicht detaillierte Auswertungen nach Organisationseinheiten
- Alle buchungsrelevanten Entitäten bieten Audit-Trails durch Tracking-Felder

## Fazit

Das erweiterte Finanzen-Stammdaten-Modell bietet eine umfassende Lösung für die Finanzbuchhaltung und das Controlling in einem ERP-System. Es unterstützt sowohl einfache als auch komplexe Buchführungsanforderungen und ist für internationale Geschäftstätigkeiten gerüstet. Die Integration mit anderen Modulen wie Artikelverwaltung und Partnerstammdaten ermöglicht eine durchgängige Prozessabbildung von der Bestellung bis zur Zahlung. 