# SERM-Datenmodell für das AI-gesteuerte ERP-System - Partner-Stammdaten-Erweiterung

## Einführung zur Partner-Stammdaten-Erweiterung

Die Partner-Stammdaten-Erweiterung baut auf dem bestehenden SERM-Datenmodell auf und implementiert ein umfassendes Stammdatenmodell für Partner, das Kunden, Lieferanten, Mitarbeiter und CPD-Konten umfasst. Diese Erweiterung vertieft die im Basis-SERM-Modell definierte Partnerstruktur und fügt spezialisierte Entitäten für erweiterte Stammdaten hinzu.

## Erweitertes SERM-Modell für Partner-Stammdaten

### 1. Basis-Partner-Modell (Erweiterung der Partner-Basisklasse)

```
Partner [abstrakt] 
├── ID (PK)
├── Typ [Kunde, Lieferant, Mitarbeiter, Sonstiger]
├── Name
├── Firmenname
├── Rechtsform
├── Steuernummer
├── USt-ID
├── Sprache
├── Währung
├── Zahlungsbedingungen
├── Kreditlimit
├── Website
├── Notizen
├── Erstellt_Am
├── Erstellt_Von (FK → User)
├── Geändert_Am
└── Geändert_Von (FK → User)
```

### 2. Adressmodell für Partner

```
Adresse [0..* ⟷ 1 Partner]
├── ID (PK)
├── Partner_ID (FK)
├── Typ [Rechnung, Lieferung, Privat, Arbeit, Sonstige]
├── Name
├── Straße
├── Hausnummer
├── Zusatz
├── PLZ
├── Ort
├── Land
├── Bundesland
├── Telefon
├── Mobil
├── Email
├── Ist_Standard (Boolean)
├── Ist_Lieferadresse (Boolean)
├── Ist_Rechnungsadresse (Boolean)
├── Latitude
├── Longitude
├── Erstellt_Am
└── Geändert_Am
```

### 3. Kontaktmodell für Partner

```
Kontakt [0..* ⟷ 1 Partner]
├── ID (PK)
├── Partner_ID (FK)
├── Anrede
├── Vorname
├── Nachname
├── Position
├── Abteilung
├── Telefon
├── Mobil
├── Email
├── Notizen
├── Ist_Hauptkontakt (Boolean)
├── Erstellt_Am
└── Geändert_Am
```

### 4. Bankverbindungsmodell für Partner

```
Bankverbindung [0..* ⟷ 1 Partner]
├── ID (PK)
├── Partner_ID (FK)
├── Kontoinhaber
├── IBAN
├── BIC
├── Bankname
├── Währung
├── Ist_Standard (Boolean)
├── Verwendungszweck
├── Erstellt_Am
└── Geändert_Am
```

### 5. Tag-Modell für Partner

```
Tag [0..* ⟷ 0..* Partner]
├── ID (PK)
├── Name
├── Farbe
├── Erstellt_Am
└── Geändert_Am
```

### 6. Customer (CPD-Kreditor-Erweiterung)

```
Customer [spezialisiert]
├── ID (PK)
├── Customer_Number
├── Debitor_Account
├── Search_Term
├── Creation_Date
├── Name
├── Name2
├── Industry
├── Street
├── Country
├── Postal_Code
├── City
├── Post_Box
├── Phone1
├── Phone2
├── Fax
├── Salutation
├── Letter_Salutation
├── Email
├── Website
├── Branch_Office
├── Cost_Center
├── Invoice_Type
├── Collective_Invoice
├── Invoice_Form
├── Sales_Rep_ID (FK → User)
├── Sales_Rep_Code
├── Region
├── Payment_Term1_Days
├── Discount1_Percent
├── Payment_Term2_Days
├── Discount2_Percent
├── Net_Days
├── Is_Active (Boolean)
├── Has_Online_Access (Boolean)
├── Customer_Since
└── Last_Order_Date
```

### 7. Customer Address (CPD-Lieferadressen)

```
CustomerAddress [0..* ⟷ 1 Customer]
├── ID (PK)
├── Customer_ID (FK)
├── Address_Type
├── Name
├── Street
├── Country
├── Postal_Code
├── City
└── Is_Default (Boolean)
```

### 8. Customer Contact (CPD-Ansprechpartner)

```
CustomerContact [0..* ⟷ 1 Customer]
├── ID (PK)
├── Customer_ID (FK)
├── First_Name
├── Last_Name
├── Position
├── Department
├── Email
├── Phone
├── Mobile
└── Is_Primary (Boolean)
```

## CPD-Konten-Modell

Basierend auf dem XML-Schema für CPD_Kreditor bietet das CPD-Konten-Modell eine spezialisierte Struktur für Kreditor-Stammdaten im CPD-Format:

```
CPD_Account [spezialisiert]
├── ID (PK)
├── Account_Number
├── Debtor_Account
├── Search_Term
├── Creation_Date
├── Fields [Gruppiert nach Bereichen]
│   ├── Allgemein
│   │   ├── Kunden-Nr
│   │   ├── Debitoren-Konto
│   │   ├── Suchbegriff
│   │   └── Erstanlage
│   ├── Rechnungsadresse
│   │   ├── Kunden-Name
│   │   ├── Name2
│   │   ├── Branche
│   │   ├── Straße
│   │   ├── Land
│   │   ├── PLZ
│   │   ├── Ort
│   │   ├── Postfach
│   │   ├── Telefon1
│   │   ├── Telefon2
│   │   ├── Telefax
│   │   ├── Anrede
│   │   ├── Brief-Anrede
│   │   ├── E-Mail
│   │   └── Internet-Homepage
│   ├── Organisation
│   │   ├── Geschäftsstelle
│   │   ├── Kostenstelle
│   │   ├── Rechnungsart
│   │   ├── Sammelrechnung
│   │   ├── Rechnungsformular
│   │   ├── VB
│   │   └── Gebiet
│   └── Zahlungsbedingungen
│       ├── Zahlungsziel1_Tage
│       ├── Skonto1_Prozent
│       ├── Zahlungsziel2_Tage
│       ├── Skonto2_Prozent
│       └── Netto_Tage
└── Verknüpfungen zu:
    ├── CPD_Payment_Terms [0..*]
    └── CPD_Account_History [0..*]
```

## Integration mit dem Basis-SERM-Modell

Das erweiterte Partner-Stammdaten-Modell integriert sich in das Basis-SERM-Modell durch die Erweiterung der abstrakten `Partner`-Entität und spezialisierte Unterklassen für Kunden, Lieferanten und CPD-Konten.

### Beziehungen zum Basis-SERM-Modell

- **Partner**: Abstrakte Basisklasse für alle Arten von Geschäftspartnern
- **Kunde ⟹ Partner**: Spezialisierung für Kunden
- **Lieferant ⟹ Partner**: Spezialisierung für Lieferanten
- **Mitarbeiter ⟹ Partner**: Spezialisierung für Mitarbeiter
- **Customer (CPD-Kreditor)**: Spezialisierte Kundendaten im CPD-Format

## Erweiterungen zum Basis-SERM-Modell

Das erweiterte Modell fügt folgende Konzepte zum Basis-SERM-Modell hinzu:

1. **Einheitliches Partner-Management**: Alle Geschäftspartner werden durch ein gemeinsames Basismodell abgebildet
2. **Flexible Adressverwaltung**: Mehrere Adressen mit unterschiedlichen Typen und Verwendungszwecken pro Partner
3. **Detaillierte Kontaktverwaltung**: Ansprechpartner mit umfangreichen Kontaktinformationen
4. **Finanzinformationen**: Bankverbindungen und Zahlungskonditionen
5. **CPD-Konten-Integration**: Spezialisierte Kundendaten im CPD-Format für Kreditorenbuchhaltung
6. **Tagging-System**: Flexible Kategorisierung von Partnern durch Tags

## Vorteile des erweiterten Modells

1. **Zentrale Partnerverwaltung**: Alle Geschäftspartner werden einheitlich verwaltet
2. **Vermeidung von Datenredundanz**: Gemeinsame Attribute in der Basisklasse, spezifische in Unterklassen
3. **Flexible Erweiterbarkeit**: Neue Partnertypen können problemlos hinzugefügt werden
4. **Vollständige Adress- und Kontaktdaten**: Umfassende Verwaltung aller Partner-Kontaktinformationen
5. **CPD-Integration**: Spezielle Unterstützung für das CPD-Format in der Kreditorenbuchhaltung

## Implementierungshinweise

- Die Partnerstruktur folgt dem Prinzip der Vererbung mit einer abstrakten Basisklasse
- Tags ermöglichen eine flexible, nicht-hierarchische Kategorisierung
- Das CPD-Konten-Modell ist auf die speziellen Anforderungen der Kreditorenbuchhaltung ausgerichtet
- Alle Entitäten enthalten Tracking-Felder für Auditing und Nachvollziehbarkeit

## Fazit

Das erweiterte Partner-Stammdaten-Modell bietet eine umfassende Lösung für die Verwaltung von Geschäftspartnern in einem ERP-System. Es kombiniert die Flexibilität eines einheitlichen Partnermodells mit der Spezialisierung für verschiedene Partnertypen und integriert das CPD-Format für die Kreditorenbuchhaltung. Diese Struktur ermöglicht eine effiziente Datenverwaltung und unterstützt alle relevanten Geschäftsprozesse rund um Kunden, Lieferanten und Mitarbeiter. 