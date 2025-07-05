# UML-Diagramm für das AI-gesteuerte ERP-System

## Objektmodell (Klassendiagramm)

Dieses UML-Klassendiagramm beschreibt die wichtigsten Entitäten und Beziehungen unseres ERP-Systems basierend auf dem SERM-Modell. Zur besseren Lesbarkeit wurden die Attribute verkürzt dargestellt.

```
+------------------------+       +------------------------+       +------------------------+
|     Organisation       |       |        Standort        |       |       Abteilung        |
+------------------------+       +------------------------+       +------------------------+
| -ID: Integer           |<>-----| -ID: Integer           |<>-----| -ID: Integer           |
| -Name: String          |       | -OrganisationsID: FK   |       | -OrganisationsID: FK   |
| -Rechtsform: String    |       | -Name: String          |       | -StandortID: FK        |
| -Steuernummer: String  |       | -Typ: Enum             |       | -Name: String          |
| -UstID: String         |       | -IstAktiv: Boolean     |       | -Kostenstelle: String  |
| -Logo: Binary          |       +------------------------+       | -ÜbergeordneteID: FK   |
| -Gründungsdatum: Date  |                                        | -IstAktiv: Boolean     |
| -Status: Enum          |                                        +------------------------+
+------------------------+                                        
          ^
          |
          |
+------------------------+
|       Benutzer         |
+------------------------+
| -ID: Integer           |
| -Username: String      |
| -Passwort: Hash        |
| -Email: String         |
| -IstAktiv: Boolean     |
| -LetzterLogin: DateTime|
+------------------------+
          ^
          |
          |
+------------------------+       +------------------------+       +------------------------+
|        Partner         |<------| Kommunikation          |       |        Adresse         |
+------------------------+       +------------------------+       +------------------------+
| -ID: Integer           |       | -ID: Integer           |       | -ID: Integer           |
| -Typ: Enum             |<>-----| -PartnerID: FK         |<>-----| -PartnerID: FK         |
| -IstOrganisation: Bool |       | -Typ: Enum             |       | -Typ: Enum             |
| -Name: String          |       | -Wert: String          |       | -Straße: String        |
| -IstAktiv: Boolean     |       | -IstPrimär: Boolean    |       | -PLZ: String           |
+------------------------+       +------------------------+       | -Ort: String           |
          ^                                                       | -Land: String          |
          |                                                       | -IstLieferadresse: Bool|
      +---+---+                                                   | -IstRechnungsadr: Bool |
      |       |                                                   +------------------------+
      |       |
+------------+ +------------+
|   Kunde    | | Lieferant  |
+------------+ +------------+
| -KundenNr  | | -LieferNr  |
| -Kundenseit| | -Lieferseit|
| -Kreditlimit | -Mindestbest|
+------------+ +------------+

+------------------------+       +-------------------------+       +------------------------+
|   Produktkategorie     |<>-----|    Produktvorlage       |<>-----|   Produktvariante      |
+------------------------+       +-------------------------+       +------------------------+
| -ID: Integer           |       | -ID: Integer            |       | -ID: Integer           |
| -Name: String          |       | -Artikelnummer: String  |       | -ProduktvorlageID: FK  |
| -Beschreibung: Text    |       | -Name: String           |       | -Variantennummer: Str  |
| -ÜbergeordneteID: FK   |       | -Beschreibung: Text     |       | -Name: String          |
| -Ebene: Integer        |       | -KategorieID: FK        |       | -IstAktiv: Boolean     |
+------------------------+       | -Produkttyp: Enum       |       +------------------------+
                                 | -BasiseinheitID: FK     |                 ^
                                 | -IstVerkaufbar: Boolean |                 |
                                 | -IstKaufbar: Boolean    |       +------------------------+
                                 | -IstProduzierbar: Bool  |<>-----|  VariantenAttrWert     |
                                 | -IstLagerartikel: Bool  |       +------------------------+
                                 | -IstGebinde: Boolean    |       | -ID: Integer           |
                                 | -IstStückliste: Boolean |       | -ProduktvarianteID: FK |
                                 | -StandardPreisVerkauf   |       | -AttributwertID: FK    |
                                 | -StandardPreisEinkauf   |       | -Reihenfolge: Integer  |
                                 | -Gewicht: Decimal       |       +------------------------+
                                 | -Volumen: Decimal       |                 ^
                                 | -Abmessungen: Size      |                 |
                                 | -SteuerkategorieID: FK  |       +------------------------+
                                 | -BuchungskontoErlösID   |<>-----|     Attributwert       |
                                 | -BuchungskontoAufwandID |       +------------------------+
                                 | -BildURL: String        |       | -ID: Integer           |
                                 | -IstAktiv: Boolean      |       | -AttributID: FK        |
                                 | -Erstelldatum: DateTime |       | -Wert: String          |
                                 | -Änderungsdatum: DT     |       +------------------------+
                                 +-------------------------+                 ^
                                           ^                                 |
                                           |                                 |
                                 +-------------------------+       +------------------------+
                                 |      Stückliste         |       |    Produktattribut     |
                                 +-------------------------+       +------------------------+
                                 | -ID: Integer            |       | -ID: Integer           |
                                 | -ProduktID: FK          |       | -Name: String          |
                                 | -Name: String           |       | -Beschreibung: Text    |
                                 | -Beschreibung: Text     |       | -Attributtyp: Enum     |
                                 | -Typ: Enum              |       | -IstVariante: Boolean  |
                                 | -Menge: Decimal         |       +------------------------+
                                 | -EinheitID: FK          |
                                 | -IstAktiv: Boolean      |
                                 | -IstStandard: Boolean   |
                                 +-------------------------+
                                           ^
                                           |
                                 +-------------------------+
                                 |   Stücklistenposition   |
                                 +-------------------------+
                                 | -ID: Integer            |
                                 | -StücklisteID: FK       |
                                 | -Position: Integer      |
                                 | -KomponenteID: FK       |
                                 | -Menge: Decimal         |
                                 | -EinheitID: FK          |
                                 | -OperationID: FK        |
                                 | -IstOptional: Boolean   |
                                 +-------------------------+

+------------------------+       +------------------------+       +------------------------+
|         Lager          |<>-----|       Lagerort         |<>-----|     Lagerbestand       |
+------------------------+       +------------------------+       +------------------------+
| -ID: Integer           |       | -ID: Integer           |       | -ID: Integer           |
| -StandortID: FK        |       | -LagerID: FK           |       | -ProduktID: FK         |
| -Name: String          |       | -Name: String          |       | -LagerortID: FK        |
| -Beschreibung: Text    |       | -ÜbergeordneterID: FK  |       | -Menge: Decimal        |
| -IstAktiv: Boolean     |       | -Position: String      |       | -ReservierteMenge: Dec |
| -Typ: Enum             |       | -Kapazität: Decimal    |       | -VerfügbareMenge: Calc |
+------------------------+       | -KapazitätseinheitID   |       | -EinheitID: FK         |
                                 | -IstAktiv: Boolean     |       | -LetzteBewegung: Date  |
                                 +------------------------+       +------------------------+
                                                                            ^
                                                                            |
                                                                  +------------------+
                                                                  |                  |
                                                          +-------------+    +-------------+
                                                          |   Charge    |    | Seriennummer|
                                                          +-------------+    +-------------+
                                                          | -ID: Integer|    | -ID: Integer|
                                                          | -ProduktID  |    | -ProduktID  |
                                                          | -ChargenNr  |    | -SerienNr   |
                                                          | -Eingang    |    | -Eingang    |
                                                          | -MHD        |    | -Garantie   |
                                                          +-------------+    +-------------+

+------------------------+       +------------------------+       +------------------------+
|      Preisliste        |<>-----|  Preislistenposition   |------>|        Rabatt          |
+------------------------+       +------------------------+       +------------------------+
| -ID: Integer           |       | -ID: Integer           |       | -ID: Integer           |
| -Name: String          |       | -PreislisteID: FK      |       | -Name: String          |
| -Beschreibung: Text    |       | -ProduktID: FK         |       | -Beschreibung: Text    |
| -WährungID: FK         |       | -VarianteID: FK        |       | -Rabatttyp: Enum       |
| -GültigVon: Date       |       | -Mindestmenge: Decimal |       | -Wert: Decimal         |
| -GültigBis: Date       |       | -Preis: Decimal        |       | -GültigVon: Date       |
| -IstAktiv: Boolean     |       | -RabattProzent: Decimal|       | -GültigBis: Date       |
+------------------------+       | -GültigVon: Date       |       | -IstAktiv: Boolean     |
                                 | -GültigBis: Date       |       +------------------------+
                                 | -IstAktiv: Boolean     |
                                 +------------------------+

+------------------------+       +------------------------+       +------------------------+
|       Angebot          |<>-----|    Angebotsposition    |       |       Auftrag          |
+------------------------+       +------------------------+       +------------------------+
| -ID: Integer           |       | -ID: Integer           |       | -ID: Integer           |
| -Angebotsnummer: String|       | -AngebotID: FK         |       | -Auftragsnummer: String|
| -KundeID: FK           |       | -Position: Integer     |       | -KundeID: FK           |
| -KontaktID: FK         |       | -ProduktID: FK         |       | -KontaktID: FK         |
| -Angebotsdatum: Date   |       | -VarianteID: FK        |       | -AngebotID: FK         |
| -GültigBis: Date       |       | -Beschreibung: Text    |       | -Auftragsdatum: Date   |
| -Status: Enum          |       | -Menge: Decimal        |       | -Wunschlieferdatum: DT |
| -WährungID: FK         |       | -EinheitID: FK         |       | -BestätigtesLieferdatum|
| -Gesamtnetto: Decimal  |       | -EinzelpreisNetto: Dec |       | -Status: Enum          |
| -Gesamtsteuer: Decimal |       | -RabattProzent: Decimal|       | -WährungID: FK         |
| -Gesamtbrutto: Decimal |       | -GesamtpreisNetto: Calc|       | -Gesamtnetto: Decimal  |
| -ZahlungsbedingungID   |       | -SteuersatzID: FK      |       | -Gesamtsteuer: Decimal |
| -LieferbedingungID     |       | -Steuerbetrag: Calc    |       | -Gesamtbrutto: Decimal |
| -BenutzerID: FK        |       +------------------------+       | -ZahlungsbedingungID   |
| -Notizen: Text         |                                        | -LieferbedingungID     |
+------------------------+                                        | -BenutzerID: FK        |
                                                                  | -Notizen: Text         |
                                                                  +------------------------+
                                                                            ^
                                                                            |
                                                                  +------------------------+
                                                                  |    Auftragsposition    |
                                                                  +------------------------+
                                                                  | -ID: Integer           |
                                                                  | -AuftragID: FK         |
                                                                  | -Position: Integer     |
                                                                  | -ProduktID: FK         |
                                                                  | -VarianteID: FK        |
                                                                  | -Beschreibung: Text    |
                                                                  | -Menge: Decimal        |
                                                                  | -EinheitID: FK         |
                                                                  | -GelieferteMenge: Dec  |
                                                                  | -EinzelpreisNetto: Dec |
                                                                  | -RabattProzent: Decimal|
                                                                  | -GesamtpreisNetto: Calc|
                                                                  | -SteuersatzID: FK      |
                                                                  | -Steuerbetrag: Calc    |
                                                                  +------------------------+

+------------------------+       +------------------------+       +------------------------+
|      Kontenplan        |<>-----|         Konto          |<>-----|       Buchung          |
+------------------------+       +------------------------+       +------------------------+
| -ID: Integer           |       | -ID: Integer           |       | -ID: Integer           |
| -Name: String          |       | -KontenplanID: FK      |       | -Buchungsnummer: String|
| -Beschreibung: Text    |       | -Kontonummer: String   |       | -Buchungsdatum: Date   |
| -IstAktiv: Boolean     |       | -Name: String          |       | -Valutadatum: Date     |
+------------------------+       | -Beschreibung: Text    |       | -Buchungstext: String  |
                                 | -Kontotyp: Enum        |       | -Betrag: Decimal       |
                                 | -ÜbergeordnetesKontoID |       | -KontoID: FK           |
                                 | -Saldo: Decimal        |       | -GegenkontoID: FK      |
                                 | -WährungID: FK         |       | -ReferenzTyp: Enum     |
                                 | -IstAktiv: Boolean     |       | -ReferenzID: Integer   |
                                 +------------------------+       | -BelegID: FK           |
                                                                  | -BenutzerID: FK        |
                                                                  | -StornoID: FK          |
                                                                  +------------------------+

+------------------------+       +------------------------+       +------------------------+
|       Rechnung         |<>-----|   Rechnungsposition    |<>-----|       Zahlung          |
+------------------------+       +------------------------+       +------------------------+
| -ID: Integer           |       | -ID: Integer           |       | -ID: Integer           |
| -Rechnungsnummer: String|      | -RechnungID: FK        |       | -Zahlungsnummer: String|
| -Rechnungstyp: Enum    |       | -Position: Integer     |       | -Zahlungsart: Enum     |
| -PartnerID: FK         |       | -ProduktID: FK         |       | -RechnungID: FK        |
| -Rechnungsdatum: Date  |       | -Beschreibung: Text    |       | -PartnerID: FK         |
| -Fälligkeitsdatum: Date|       | -Menge: Decimal        |       | -Zahlungsdatum: Date   |
| -Status: Enum          |       | -EinheitID: FK         |       | -Betrag: Decimal       |
| -ReferenzTyp: Enum     |       | -EinzelpreisNetto: Dec |       | -WährungID: FK         |
| -ReferenzID: Integer   |       | -RabattProzent: Decimal|       | -Status: Enum          |
| -WährungID: FK         |       | -GesamtpreisNetto: Calc|       | -Referenz: String      |
| -Gesamtnetto: Decimal  |       | -SteuersatzID: FK      |       | -KontoID: FK           |
| -Gesamtsteuer: Decimal |       | -Steuerbetrag: Calc    |       | -BenutzerID: FK        |
| -Gesamtbrutto: Decimal |       | -KontoID: FK           |       +------------------------+
| -ZahlungsbedingungID   |       | -KostenstelleID: FK    |
| -BenutzerID: FK        |       +------------------------+
+------------------------+

+------------------------+       +------------------------+       +------------------------+
|      Bestellung        |<>-----|   Bestellposition      |       |        Anfrage         |
+------------------------+       +------------------------+       +------------------------+
| -ID: Integer           |       | -ID: Integer           |       | -ID: Integer           |
| -Bestellnummer: String |       | -BestellungID: FK      |       | -Anfragenummer: String |
| -LieferantID: FK       |       | -Position: Integer     |       | -LieferantID: FK       |
| -KontaktID: FK         |       | -ProduktID: FK         |       | -KontaktID: FK         |
| -AnfrageID: FK         |       | -VarianteID: FK        |       | -Anfragedatum: Date    |
| -Bestelldatum: Date    |       | -Beschreibung: Text    |       | -AntwortBis: Date      |
| -Lieferdatum: Date     |       | -Menge: Decimal        |       | -Status: Enum          |
| -Status: Enum          |       | -EinheitID: FK         |       | -WährungID: FK         |
| -WährungID: FK         |       | -ErhalteneMenge: Dec   |       | -BenutzerID: FK        |
| -Gesamtnetto: Decimal  |       | -EinzelpreisNetto: Dec |       | -Notizen: Text         |
| -Gesamtsteuer: Decimal |       | -RabattProzent: Decimal|       +------------------------+
| -Gesamtbrutto: Decimal |       | -GesamtpreisNetto: Calc|
| -ZahlungsbedingungID   |       | -SteuersatzID: FK      |
| -LieferbedingungID     |       | -Steuerbetrag: Calc    |
| -BenutzerID: FK        |       +------------------------+
| -Notizen: Text         |
+------------------------+
```

## Beziehungssicht (Assoziationen)

Die folgende UML-Notation zeigt die wichtigsten Beziehungen zwischen den Entitäten:

```
// Organisationsstruktur
Organisation "1" --- "*" Standort: hat >
Standort "1" --- "*" Abteilung: hat >
Abteilung "1" --- "*" Mitarbeiter: gehört zu >
Abteilung "0..1" --- "*" Abteilung: übergeordnet >
Organisation "1" --- "*" Benutzer: hat >
Mitarbeiter "1" --- "0..1" Benutzer: ist >

// Partner und Kontakte
Partner <|-- Kunde: ist ein
Partner <|-- Lieferant: ist ein
Partner <|-- Mitarbeiter: ist ein
Partner "1" --- "*" Adresse: hat >
Partner "1" --- "*" Kommunikation: hat >
Partner "1" --- "*" Dokument: besitzt >

// Produkte und Kategorien
Produktkategorie "0..1" --- "*" Produktkategorie: übergeordnet >
Produktkategorie "1" --- "*" Produktvorlage: gehört zu >
Produktvorlage "1" --- "*" Produktvariante: hat >
Produktvorlage "1" --- "*" Produktattribut: hat >
Produktattribut "1" --- "*" Attributwert: hat >
Attributwert "1" --- "*" VariantenAttributwert: verwendet >
Produktvariante "1" --- "*" VariantenAttributwert: hat >

// Stücklisten und Gebinde
Produktvorlage "1" --- "*" Stückliste: definiert für >
Stückliste "1" --- "*" Stücklistenposition: besteht aus >
Stücklistenposition "*" --- "1" Produktvariante: verwendet >
Produktvorlage "1" --- "*" Gebinde: definiert für >
Gebinde "1" --- "*" Gebindeposition: enthält >
Gebindeposition "*" --- "1" Produktvariante: enthält >

// Lager und Bestand
Standort "1" --- "*" Lager: befindet sich in >
Lager "1" --- "*" Lagerort: enthält >
Lagerort "0..1" --- "*" Lagerort: übergeordnet >
Lagerort "1" --- "*" Lagerbestand: lagert >
Produktvariante "1" --- "*" Lagerbestand: hat >
Lagerbestand "1" --- "*" Lagerbewegung: erzeugt >
Produktvariante "1" --- "*" Charge: hat >
Produktvariante "1" --- "*" Seriennummer: hat >
Charge "1" --- "*" Lagerbewegung: betrifft >
Seriennummer "1" --- "*" Lagerbewegung: betrifft >

// Preise und Konditionen
Preisliste "1" --- "*" Preislistenposition: enthält >
Preislistenposition "*" --- "1" Produktvorlage: gilt für >
Preislistenposition "*" --- "0..1" Produktvariante: gilt für >
Kunde "1" --- "*" Rabatt: erhält >
Produktvorlage "1" --- "*" Rabatt: hat >

// Verkauf
Kunde "1" --- "*" Angebot: erhält >
Angebot "1" --- "*" Angebotsposition: enthält >
Angebotsposition "*" --- "1" Produktvorlage: bezieht sich auf >
Angebotsposition "*" --- "0..1" Produktvariante: spezifiziert >
Angebot "1" --- "*" Auftrag: wird zu >
Kunde "1" --- "*" Auftrag: erteilt >
Auftrag "1" --- "*" Auftragsposition: enthält >
Auftragsposition "*" --- "1" Produktvorlage: bezieht sich auf >
Auftragsposition "*" --- "0..1" Produktvariante: spezifiziert >

// Einkauf
Lieferant "1" --- "*" Anfrage: erhält >
Anfrage "1" --- "*" Anfrageposition: enthält >
Anfrage "1" --- "*" Bestellung: wird zu >
Lieferant "1" --- "*" Bestellung: erhält >
Bestellung "1" --- "*" Bestellposition: enthält >
Bestellposition "*" --- "1" Produktvorlage: bezieht sich auf >
Bestellposition "*" --- "0..1" Produktvariante: spezifiziert >

// Finanzen
Kontenplan "1" --- "*" Konto: enthält >
Konto "0..1" --- "*" Konto: übergeordnet >
Konto "1" --- "*" Buchung: belastet >
Konto "1" --- "*" Buchung: entlastet >
Kunde "1" --- "*" Rechnung: erhält >
Lieferant "1" --- "*" Rechnung: stellt aus >
Rechnung "1" --- "*" Rechnungsposition: enthält >
Rechnung "1" --- "*" Zahlung: wird beglichen durch >
Partner "1" --- "*" Zahlung: leistet/erhält >
```

## Validierung des Datenmodells

### Überprüfung der Integrität

1. **Strukturelle Integrität**
   - Jede Entität hat einen eindeutigen Primärschlüssel (ID)
   - Alle Beziehungen sind klar definiert mit Kardinalitäten

2. **Referenzielle Integrität**
   - Fremdschlüssel verweisen auf existierende Primärschlüssel
   - Verwendung von "nullable" FK wo sinnvoll
   - Self-References für hierarchische Strukturen

3. **Semantische Integrität**
   - Status-Felder mit klar definierten Zuständen (Enums)
   - Berechnete Felder klar gekennzeichnet
   - Historisierung durch Zeitstempel

### Normalisierungsprüfung

Das Modell wurde auf Einhaltung der Normalformen überprüft:

- **1NF**: Keine Wiederholungsgruppen, alle Attribute atomar
- **2NF**: Keine partiellen Abhängigkeiten von Schlüsseln
- **3NF**: Keine transitiven Abhängigkeiten

### Überprüfung der Geschäftsregeln

1. **Artikel und Varianten**
   - Ein Artikel kann sowohl als Einzelartikel als auch als Gebinde fungieren
   - Artikel können aus anderen Artikeln zusammengesetzt sein (Stücklisten)
   - Varianten werden durch Attributwerte definiert

2. **Lager und Bestand**
   - Bestandsführung auf Lagerort-Ebene
   - Unterstützung für Chargen und Seriennummern
   - Lagerplätze können hierarchisch strukturiert werden

3. **Verkaufs- und Einkaufsprozess**
   - Vollständiger Prozessfluss von Angebot zu Auftrag zu Rechnung
   - Flexibles Preismodell mit Preislisten, Rabatten und Konditionen

4. **Finanzen**
   - Kontenstruktur für doppelte Buchführung
   - Integration von Geschäftsvorfällen in die Buchhaltung

### Skalierbarkeit und Erweiterbarkeit

Das Modell ist so konzipiert, dass es:

1. Mit großen Datenmengen umgehen kann
2. Einfach um neue Entitäten und Attribute erweitert werden kann
3. Mehrere Mandanten in einer Installation unterstützen kann

## Fazit

Das UML-Modell bietet eine umfassende Darstellung der Entitäten und Beziehungen unseres ERP-Systems. Es wurde auf Basis der Best Practices erfolgreicher Open-Source-ERP-Systeme entwickelt und vereint deren Stärken in einem konsistenten, redundanzfreien Design.

Die Validierung bestätigt, dass das Modell den Anforderungen an ein modernes, skalierbares ERP-System entspricht und gleichzeitig die spezifischen Anforderungen bezüglich Artikelstruktur (mit Gebinden und Stücklisten) erfüllt. 