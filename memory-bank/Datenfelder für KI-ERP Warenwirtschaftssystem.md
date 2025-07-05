# Datenfelder für KI-ERP Warenwirtschaftssystem

## Einleitung

Dieses Dokument definiert die erforderlichen Datenfelder für die Integration in ein KI-getriebenes ERP-Warenwirtschaftssystem. Es dient als Anleitung für Cursor.ai bei der Implementierung der Datenstruktur und der KI-Funktionalitäten. Die Spezifikation umfasst die Kernbereiche Belegfolge, Angebot, Auftrag, Lieferscheinerstellung, Rechnung, Eingangslieferschein und Bestellung.

Das System basiert auf der bestehenden Architektur des AI_driven_ERP-Projekts und erweitert diese um spezifische Datenfelder und KI-Funktionalitäten. Die Implementierung soll die moderne Modulstruktur mit zentralem Pfadregister nutzen, wie im Repository dokumentiert.

## Belegfolgen im Warenwirtschaftssystem

### Ausgehende Belegfolge (Verkauf)
1. Angebot → 2. Auftrag → 3. Lieferschein → 4. Rechnung → 5. Gutschrift (optional)

### Eingehende Belegfolge (Einkauf)
1. Bestellung → 2. Eingangslieferschein → 3. Eingangsrechnung → 4. Reklamation/Gutschrift (optional)

Jede Belegart ist über die Felder `VorgängerBelegID` und `NachfolgerBelegID` mit der Prozesskette verknüpft. Die Richtung (eingehend/ausgehend) ergibt sich aus dem Belegtyp und dem Prozesskontext.

## 1. Belegfolge

Die Belegfolge bildet das Rückgrat des Warenwirtschaftssystems und definiert den Prozessablauf von der Anfrage bis zur Zahlung.

### Grundlegende Datenfelder

- **BelegID**: Eindeutige Kennung für jeden Beleg (String, automatisch generiert)
- **BelegTyp**: Art des Belegs (Enum: Angebot, Auftrag, Lieferschein, Rechnung, Eingangslieferschein, Bestellung)
- **VorgängerBelegID**: Referenz zum vorherigen Beleg in der Kette (String, nullable)
- **NachfolgerBelegID**: Referenz zum nachfolgenden Beleg in der Kette (String, nullable)
- **ErstellDatum**: Zeitpunkt der Erstellung (DateTime)
- **BenutzerID**: ID des erstellenden Benutzers (String)
- **Status**: Aktueller Status des Belegs (Enum: Entwurf, Aktiv, Abgeschlossen, Storniert)
- **Notizen**: Freitextfeld für Anmerkungen (String, nullable)

### KI-spezifische Felder

- **ProzessvorlageID**: Referenz zur verwendeten KI-Prozessvorlage (String, nullable)
- **AutomatisierungsGrad**: Grad der automatischen Verarbeitung (Integer: 0-100%)
- **PrognoseNächsterSchritt**: KI-Vorhersage für den nächsten Prozessschritt (String, nullable)
- **ÄhnlicheBelege**: Liste ähnlicher historischer Belege für Referenz (Array von BelegIDs)

## 2. Angebot

Das Angebot repräsentiert ein formelles Angebot an einen Kunden mit Produkten, Preisen und Konditionen.

### Grundlegende Datenfelder

- **AngebotID**: Eindeutige Kennung des Angebots (String, automatisch generiert)
- **AngebotNummer**: Geschäftliche Angebotsnummer (String)
- **KundenID**: Referenz zum Kunden (String)
- **KundenAnsprechpartner**: Name des Ansprechpartners beim Kunden (String, nullable)
- **Betreff**: Kurzbeschreibung des Angebots (String)
- **ErstellDatum**: Datum der Angebotserstellung (DateTime)
- **GültigBis**: Ablaufdatum des Angebots (DateTime)
- **Währung**: Verwendete Währung (String, Default: "EUR")
- **Gesamtbetrag**: Summe aller Positionen (Decimal)
- **MwStBetrag**: Enthaltene Mehrwertsteuer (Decimal)
- **Rabatt**: Gesamtrabatt auf das Angebot (Decimal)
- **Status**: Status des Angebots (Enum: Entwurf, Versendet, Angenommen, Abgelehnt, Abgelaufen)
- **Zahlungsbedingungen**: Beschreibung der Zahlungsbedingungen (String)
- **Lieferbedingungen**: Beschreibung der Lieferbedingungen (String)

### Positionsdaten

- **PositionsID**: Eindeutige ID der Position (String)
- **ArtikelID**: Referenz zum Artikel (String)
- **ArtikelBezeichnung**: Name des Artikels (String)
- **ArtikelBeschreibung**: Detaillierte Beschreibung (String, nullable)
- **Menge**: Angebotene Menge (Decimal)
- **Einheit**: Mengeneinheit (String)
- **Einzelpreis**: Preis pro Einheit (Decimal)
- **MwStSatz**: Mehrwertsteuersatz in Prozent (Decimal)
- **Rabatt**: Positionsrabatt in Prozent (Decimal)
- **Gesamtpreis**: Berechneter Gesamtpreis der Position (Decimal)

### KI-spezifische Felder

- **KundenAffinität**: KI-Score für Wahrscheinlichkeit der Annahme (Integer: 0-100)
- **OptimiertePreise**: Flag, ob KI-optimierte Preise verwendet wurden (Boolean)
- **PreisOptimierungsBasis**: Datenbasis für die Preisoptimierung (String, nullable)
- **VorgeschlageneAlternativen**: KI-vorgeschlagene alternative Produkte (Array von ArtikelIDs)
- **SaisonaleAnpassung**: Flag für saisonale Preisanpassung (Boolean)
- **MarktpreisVergleich**: Verhältnis zum aktuellen Marktpreis (Decimal, nullable)

## 3. Auftrag

Der Auftrag repräsentiert eine bestätigte Bestellung eines Kunden basierend auf einem Angebot.

### Grundlegende Datenfelder

- **AuftragID**: Eindeutige Kennung des Auftrags (String, automatisch generiert)
- **AuftragNummer**: Geschäftliche Auftragsnummer (String)
- **AngebotID**: Referenz zum zugehörigen Angebot (String, nullable)
- **KundenID**: Referenz zum Kunden (String)
- **KundenBestellnummer**: Bestellnummer des Kunden (String, nullable)
- **ErstellDatum**: Datum der Auftragserstellung (DateTime)
- **Lieferdatum**: Gewünschtes oder vereinbartes Lieferdatum (DateTime, nullable)
- **Status**: Status des Auftrags (Enum: Neu, In Bearbeitung, Teilweise geliefert, Vollständig geliefert, Storniert)
- **Priorität**: Prioritätsstufe des Auftrags (Enum: Niedrig, Normal, Hoch, Kritisch)
- **Gesamtbetrag**: Summe aller Positionen (Decimal)
- **MwStBetrag**: Enthaltene Mehrwertsteuer (Decimal)
- **Rabatt**: Gesamtrabatt auf den Auftrag (Decimal)
- **Zahlungsbedingungen**: Beschreibung der Zahlungsbedingungen (String)
- **Lieferbedingungen**: Beschreibung der Lieferbedingungen (String)
- **Lieferadresse**: Vollständige Lieferadresse (String)
- **Rechnungsadresse**: Vollständige Rechnungsadresse (String)

### Positionsdaten

- **PositionsID**: Eindeutige ID der Position (String)
- **ArtikelID**: Referenz zum Artikel (String)
- **ArtikelBezeichnung**: Name des Artikels (String)
- **Menge**: Bestellte Menge (Decimal)
- **Einheit**: Mengeneinheit (String)
- **Einzelpreis**: Preis pro Einheit (Decimal)
- **MwStSatz**: Mehrwertsteuersatz in Prozent (Decimal)
- **Rabatt**: Positionsrabatt in Prozent (Decimal)
- **Gesamtpreis**: Berechneter Gesamtpreis der Position (Decimal)
- **LieferStatus**: Status der Position (Enum: Offen, Teilweise geliefert, Vollständig geliefert)
- **BereitsGelieferteMenge**: Bereits gelieferte Menge (Decimal)

### KI-spezifische Felder

- **LieferterminPrognose**: KI-berechnete Wahrscheinlichkeit der Termineinhaltung (Integer: 0-100)
- **LagerbestandsOptimierung**: Vorschläge zur Lagerbestandsoptimierung (String, nullable)
- **ProduktionsplanungID**: Referenz zur automatisch erstellten Produktionsplanung (String, nullable)
- **RessourcenKonflikte**: Erkannte Konflikte bei der Ressourcenplanung (Array von Strings)
- **AutomatischePrioritätssetzung**: Von KI vorgeschlagene Priorität (Enum: Niedrig, Normal, Hoch, Kritisch)
- **UmsatzPrognose**: Prognostizierter Umsatz aus diesem Auftrag (Decimal)

## 4. Lieferscheinerstellung

Der Lieferschein dokumentiert die Auslieferung von Waren an den Kunden.

### Grundlegende Datenfelder

- **LieferscheinID**: Eindeutige Kennung des Lieferscheins (String, automatisch generiert)
- **LieferscheinNummer**: Geschäftliche Lieferscheinnummer (String)
- **AuftragID**: Referenz zum zugehörigen Auftrag (String)
- **KundenID**: Referenz zum Kunden (String)
- **ErstellDatum**: Datum der Lieferscheinerstellung (DateTime)
- **Lieferdatum**: Tatsächliches Lieferdatum (DateTime)
- **Status**: Status des Lieferscheins (Enum: Erstellt, Kommissioniert, Versendet, Zugestellt, Storniert)
- **Versandart**: Art des Versands (String)
- **Tracking-Nummer**: Sendungsverfolgungsnummer (String, nullable)
- **Spediteur**: Name des Spediteurs (String, nullable)
- **Lieferadresse**: Vollständige Lieferadresse (String)
- **Gewicht**: Gesamtgewicht der Lieferung (Decimal, nullable)
- **Volumen**: Gesamtvolumen der Lieferung (Decimal, nullable)
- **Anzahl Packstücke**: Anzahl der Packstücke (Integer)

### Positionsdaten

- **PositionsID**: Eindeutige ID der Position (String)
- **AuftragsPositionsID**: Referenz zur Auftragsposition (String)
- **ArtikelID**: Referenz zum Artikel (String)
- **ArtikelBezeichnung**: Name des Artikels (String)
- **Menge**: Gelieferte Menge (Decimal)
- **Einheit**: Mengeneinheit (String)
- **ChargenNummer**: Chargennummer für Rückverfolgbarkeit (String, nullable)
- **SerienNummer**: Seriennummer für Rückverfolgbarkeit (String, nullable)
- **LagerortID**: ID des Lagerorts, von dem geliefert wurde (String)
- **Bemerkung**: Positionsspezifische Bemerkung (String, nullable)

### KI-spezifische Felder

- **OptimierteVerpackung**: KI-optimierte Verpackungsvorschläge (String, nullable)
- **RoutenOptimierung**: Vorschlag für optimierte Lieferroute (String, nullable)
- **ZeitfensterPrognose**: Prognostiziertes Lieferzeitfenster (String)
- **KommissionierungsReihenfolge**: Optimierte Reihenfolge für Kommissionierung (Array von PositionsIDs)
- **AutomatischeDokumentenErstellung**: Flag für automatisch erstellte Dokumente (Boolean)
- **QualitätssicherungsHinweise**: KI-generierte Hinweise zur Qualitätssicherung (String, nullable)

## 5. Rechnung

Die Rechnung dokumentiert die finanziellen Forderungen gegenüber dem Kunden für gelieferte Waren oder Dienstleistungen.

### Grundlegende Datenfelder

- **RechnungID**: Eindeutige Kennung der Rechnung (String, automatisch generiert)
- **RechnungNummer**: Geschäftliche Rechnungsnummer (String)
- **AuftragID**: Referenz zum zugehörigen Auftrag (String)
- **LieferscheinID**: Referenz zum zugehörigen Lieferschein (String, nullable)
- **KundenID**: Referenz zum Kunden (String)
- **ErstellDatum**: Datum der Rechnungserstellung (DateTime)
- **Fälligkeitsdatum**: Datum, bis zu dem die Rechnung bezahlt sein muss (DateTime)
- **Status**: Status der Rechnung (Enum: Erstellt, Versendet, Teilweise bezahlt, Vollständig bezahlt, Storniert, Mahnung)
- **Zahlungsbedingungen**: Beschreibung der Zahlungsbedingungen (String)
- **Zahlungsart**: Art der Zahlung (String)
- **Währung**: Verwendete Währung (String, Default: "EUR")
- **Gesamtbetrag**: Summe aller Positionen (Decimal)
- **MwStBetrag**: Enthaltene Mehrwertsteuer (Decimal)
- **Rabatt**: Gesamtrabatt auf die Rechnung (Decimal)
- **BereitsGezahlt**: Bereits bezahlter Betrag (Decimal)
- **Rechnungsadresse**: Vollständige Rechnungsadresse (String)
- **IBAN**: Internationale Bankkontonummer für Zahlungen (String, nullable)
- **BIC**: Bank Identifier Code (String, nullable)
- **Verwendungszweck**: Vorgegebener Verwendungszweck für Zahlungen (String)

### Positionsdaten

- **PositionsID**: Eindeutige ID der Position (String)
- **LieferscheinPositionsID**: Referenz zur Lieferscheinposition (String, nullable)
- **ArtikelID**: Referenz zum Artikel (String)
- **ArtikelBezeichnung**: Name des Artikels (String)
- **Menge**: Berechnete Menge (Decimal)
- **Einheit**: Mengeneinheit (String)
- **Einzelpreis**: Preis pro Einheit (Decimal)
- **MwStSatz**: Mehrwertsteuersatz in Prozent (Decimal)
- **Rabatt**: Positionsrabatt in Prozent (Decimal)
- **Gesamtpreis**: Berechneter Gesamtpreis der Position (Decimal)
- **Kostenstelle**: Zugeordnete Kostenstelle (String, nullable)

### KI-spezifische Felder

- **ZahlungsprognoseDatum**: KI-Prognose, wann die Zahlung erfolgen wird (DateTime, nullable)
- **ZahlungsausfallRisiko**: Berechnetes Risiko eines Zahlungsausfalls (Integer: 0-100)
- **EmpfohleneZahlungserinnerung**: Vorgeschlagenes Datum für Zahlungserinnerung (DateTime, nullable)
- **UmsatzsteuerKategorisierung**: Automatische Kategorisierung für Steuerberichte (String)
- **BuchhaltungskontoVorschlag**: KI-Vorschlag für Buchungskonto (String)
- **CashflowPrognoseImpact**: Auswirkung auf die Cashflow-Prognose (Decimal)

## 6. Eingangslieferschein

Der Eingangslieferschein dokumentiert den Wareneingang von Lieferanten.

### Grundlegende Datenfelder

- **EingangslieferscheinID**: Eindeutige Kennung des Eingangslieferscheins (String, automatisch generiert)
- **EingangslieferscheinNummer**: Geschäftliche Eingangslieferscheinnummer (String)
- **BestellungID**: Referenz zur zugehörigen Bestellung (String)
- **LieferantenID**: Referenz zum Lieferanten (String)
- **LieferantenLieferscheinNummer**: Lieferscheinnummer des Lieferanten (String, nullable)
- **Eingangsdatum**: Datum des Wareneingangs (DateTime)
- **Status**: Status des Eingangslieferscheins (Enum: Erfasst, Geprüft, Eingelagert, Reklamiert)
- **Annahmeort**: Ort der Warenannahme (String)
- **AngenommenVon**: Name des annehmenden Mitarbeiters (String)
- **Frachtkosten**: Kosten für den Transport (Decimal, nullable)
- **Bemerkungen**: Allgemeine Bemerkungen zum Wareneingang (String, nullable)

### Positionsdaten

- **PositionsID**: Eindeutige ID der Position (String)
- **BestellPositionsID**: Referenz zur Bestellposition (String)
- **ArtikelID**: Referenz zum Artikel (String)
- **ArtikelBezeichnung**: Name des Artikels (String)
- **BestellteMenge**: Ursprünglich bestellte Menge (Decimal)
- **GelieferteMenge**: Tatsächlich gelieferte Menge (Decimal)
- **Einheit**: Mengeneinheit (String)
- **ChargenNummer**: Chargennummer für Rückverfolgbarkeit (String, nullable)
- **SerienNummer**: Seriennummer für Rückverfolgbarkeit (String, nullable)
- **MHD**: Mindesthaltbarkeitsdatum (DateTime, nullable)
- **LagerortID**: ID des Ziellagerorts (String)
- **QualitätsStatus**: Ergebnis der Qualitätsprüfung (Enum: Nicht geprüft, Akzeptiert, Teilweise akzeptiert, Abgelehnt)
- **Abweichungsgrund**: Grund für Mengenabweichungen (String, nullable)

### KI-spezifische Felder

- **AutomatischeQualitätsbewertung**: KI-basierte Bewertung der Warenqualität (Integer: 0-100)
- **LieferantenPerformanceScore**: Bewertung der Lieferantenleistung (Integer: 0-100)
- **OptimaleEinlagerungsVorschläge**: KI-Vorschläge für optimale Lagerorte (Array von LagerortIDs)
- **AbweichungsanalyseErgebnis**: Automatische Analyse von Lieferabweichungen (String, nullable)
- **ReklamationsWahrscheinlichkeit**: Prognose für Reklamationswahrscheinlichkeit (Integer: 0-100)
- **AutomatischeBuchungsvorschläge**: Vorschläge für Buchungen im ERP-System (String, nullable)

## 7. Bestellung

Die Bestellung repräsentiert eine Anforderung von Waren oder Dienstleistungen bei einem Lieferanten.

### Grundlegende Datenfelder

- **BestellungID**: Eindeutige Kennung der Bestellung (String, automatisch generiert)
- **BestellNummer**: Geschäftliche Bestellnummer (String)
- **LieferantenID**: Referenz zum Lieferanten (String)
- **LieferantenAnsprechpartner**: Name des Ansprechpartners beim Lieferanten (String, nullable)
- **ErstellDatum**: Datum der Bestellerstellung (DateTime)
- **Lieferdatum**: Gewünschtes Lieferdatum (DateTime, nullable)
- **Status**: Status der Bestellung (Enum: Entwurf, Bestellt, Teilweise geliefert, Vollständig geliefert, Storniert)
- **Währung**: Verwendete Währung (String, Default: "EUR")
- **Gesamtbetrag**: Summe aller Positionen (Decimal)
- **MwStBetrag**: Enthaltene Mehrwertsteuer (Decimal)
- **Rabatt**: Gesamtrabatt auf die Bestellung (Decimal)
- **Zahlungsbedingungen**: Beschreibung der Zahlungsbedingungen (String)
- **Lieferbedingungen**: Beschreibung der Lieferbedingungen (String)
- **Lieferadresse**: Vollständige Lieferadresse (String)
- **BestellerID**: ID des bestellenden Mitarbeiters (String)
- **Freigegeben**: Status der Bestellfreigabe (Boolean)
- **FreigegebenVon**: ID des freigebenden Mitarbeiters (String, nullable)
- **FreigabeDatum**: Datum der Freigabe (DateTime, nullable)

### Positionsdaten

- **PositionsID**: Eindeutige ID der Position (String)
- **ArtikelID**: Referenz zum Artikel (String)
- **ArtikelBezeichnung**: Name des Artikels (String)
- **ArtikelNummer**: Artikelnummer des Lieferanten (String, nullable)
- **Menge**: Bestellte Menge (Decimal)
- **Einheit**: Mengeneinheit (String)
- **Einzelpreis**: Preis pro Einheit (Decimal)
- **MwStSatz**: Mehrwertsteuersatz in Prozent (Decimal)
- **Rabatt**: Positionsrabatt in Prozent (Decimal)
- **Gesamtpreis**: Berechneter Gesamtpreis der Position (Decimal)
- **Liefertermin**: Spezifischer Liefertermin für diese Position (DateTime, nullable)
- **BereitsGelieferteMenge**: Bereits gelieferte Menge (Decimal)
- **Kostenstelle**: Zugeordnete Kostenstelle (String, nullable)

### KI-spezifische Felder

- **BedarfsermittlungBasis**: Grundlage der automatischen Bedarfsermittlung (String, nullable)
- **PreisvergleichsAnalyse**: Ergebnis des automatischen Preisvergleichs (String, nullable)
- **AlternativeLieferanten**: KI-vorgeschlagene alternative Lieferanten (Array von LieferantenIDs)
- **BestellzeitpunktOptimierung**: Bewertung des optimalen Bestellzeitpunkts (String)
- **MengenOptimierungsFaktor**: Faktor für die Mengenoptimierung (Decimal)
- **LieferantenBewertungScore**: Automatische Bewertung des Lieferanten (Integer: 0-100)
- **NachhaltigkeitsScore**: Bewertung der Nachhaltigkeit der Bestellung (Integer: 0-100)

## KI-Integration

Für die Integration der Datenfelder in das KI-ERP-System sollten folgende Aspekte berücksichtigt werden:

### Datenverarbeitung

- Alle Datenfelder sollten über die API-Schnittstellen des Systems zugänglich sein
- Die Datenbank-Schemas sollten die definierten Datentypen und Beziehungen abbilden
- Für die KI-spezifischen Felder sollten entsprechende Berechnungsmodelle implementiert werden
- Die Daten sollten in regelmäßigen Abständen für das Training der KI-Modelle exportiert werden

### Automatisierungspotenzial

- **Belegfolge**: Automatische Generierung von Folgebelegen basierend auf Mustern und Regeln
- **Angebot**: Preisoptimierung und Kundenspezifische Anpassungen durch KI
- **Auftrag**: Automatische Priorisierung und Ressourcenplanung
- **Lieferschein**: Optimierung von Kommissionierung und Versandrouten
- **Rechnung**: Vorhersage von Zahlungseingängen und automatische Mahnungsvorschläge
- **Eingangslieferschein**: Automatische Qualitätsbewertung und Abweichungsanalyse
- **Bestellung**: Bedarfsermittlung und optimale Bestellmengen durch KI

### Technische Anforderungen

- Die Datenfelder sollten in der FastAPI-Backend-Struktur als Pydantic-Modelle implementiert werden
- Für die KI-Modelle sollten separate Microservices entwickelt werden
- Die Frontend-Komponenten sollten die KI-Vorschläge und -Prognosen visualisieren
- Alle KI-Berechnungen sollten asynchron erfolgen, um die Systemperformance nicht zu beeinträchtigen

## Implementierungshinweise

Bei der Implementierung der Datenfelder in das KI-ERP-System sollten folgende Punkte beachtet werden:

1. **Modulare Struktur**: Die Datenfelder sollten entsprechend der im Repository dokumentierten Modulstruktur implementiert werden
2. **Erweiterbarkeit**: Das System sollte so gestaltet sein, dass weitere Datenfelder einfach hinzugefügt werden können
3. **Validierung**: Alle Datenfelder sollten entsprechende Validierungsregeln haben
4. **Dokumentation**: Die API-Dokumentation sollte automatisch aus den Datenmodellen generiert werden
5. **Versionierung**: Änderungen an den Datenfeldern sollten versioniert werden
6. **Migration**: Es sollten Migrationsskripte für Datenbankänderungen erstellt werden

Die Integration der KI-Komponenten sollte schrittweise erfolgen, beginnend mit den Kernfunktionen wie Bedarfsermittlung und Preisoptimierung, gefolgt von komplexeren Funktionen wie Prognosen und automatischer Dokumentenerstellung.
