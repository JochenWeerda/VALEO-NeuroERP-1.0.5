"""
VALEO NeuroERP 2.0 - Testdaten Initialisierung
Erstellt umfangreiche Testdaten für alle Module der ERP-Software
"""

import asyncio
from sqlalchemy.orm import Session
from app.db.database import SessionLocal
from app.models.warenwirtschaft import (
    Artikelstammdaten, Lager, Einlagerung, Auslagerung, Bestellung, 
    Lieferant, Inventur, Wareneingang, Warenausgang, Kommissionierung,
    Produktion, Rezeptur, Chargenverwaltung, Seriennummernverwaltung
)
from app.models.finanzbuchhaltung import (
    Konto, Buchung, Rechnung, Zahlung, Kostenstelle, Budget, 
    Anlagenbuchhaltung, Steuerwesen, Liquiditaetsplanung
)
from app.models.crm import (
    Kunde, Kontakt, Angebot, Auftrag, Verkaufschance, MarketingKampagne,
    Kundenservice, Besuchsbericht, Kundenbewertung, Vertrag
)
from app.models.uebergreifende_services import (
    Benutzer, Rolle, Permission, SystemEinstellung, WorkflowDefinition,
    Dokument, MonitoringAlert, Mandant, Standort
)
import uuid
from datetime import datetime, timedelta
import random

class TestDataInitializer:
    def __init__(self):
        self.db = SessionLocal()
    
    def create_test_data(self):
        """Erstellt umfangreiche Testdaten für alle Module"""
        print("🚀 Initialisiere Testdaten für VALEO NeuroERP 2.0...")
        
        try:
            # Warenwirtschaft Testdaten
            self.create_warenwirtschaft_test_data()
            
            # Finanzbuchhaltung Testdaten
            self.create_finanzbuchhaltung_test_data()
            
            # CRM Testdaten
            self.create_crm_test_data()
            
            # Übergreifende Services Testdaten
            self.create_uebergreifende_services_test_data()
            
            self.db.commit()
            print("✅ Testdaten erfolgreich erstellt!")
            
        except Exception as e:
            self.db.rollback()
            print(f"❌ Fehler beim Erstellen der Testdaten: {e}")
            raise
        finally:
            self.db.close()
    
    def create_warenwirtschaft_test_data(self):
        """Erstellt Testdaten für Warenwirtschaft"""
        print("📦 Erstelle Warenwirtschaft Testdaten...")
        
        # Lieferanten
        lieferanten = [
            Lieferant(
                id=str(uuid.uuid4()),
                name="Metallbau Schmidt GmbH",
                adresse="Industriestr. 15, 12345 Musterstadt",
                telefon="+49 123 456789",
                email="info@schmidt-metall.de",
                steuernummer="DE123456789",
                zahlungsbedingungen="30 Tage netto",
                bewertung=4.5,
                aktiv=True
            ),
            Lieferant(
                id=str(uuid.uuid4()),
                name="Stahlhandel Weber",
                adresse="Hafenstr. 8, 54321 Hafenstadt",
                telefon="+49 987 654321",
                email="kontakt@weber-stahl.de",
                steuernummer="DE987654321",
                zahlungsbedingungen="14 Tage netto",
                bewertung=4.2,
                aktiv=True
            ),
            Lieferant(
                id=str(uuid.uuid4()),
                name="Maschinenbau Müller",
                adresse="Gewerbepark 3, 67890 Industrieort",
                telefon="+49 555 123456",
                email="service@mueller-maschinen.de",
                steuernummer="DE555123456",
                zahlungsbedingungen="45 Tage netto",
                bewertung=4.8,
                aktiv=True
            )
        ]
        
        for lieferant in lieferanten:
            self.db.add(lieferant)
        
        # Artikelstammdaten
        artikel = [
            Artikelstammdaten(
                id=str(uuid.uuid4()),
                artikelnummer="ART-001",
                bezeichnung="Stahlblech 2mm",
                kategorie="Rohstoffe",
                einheit="m²",
                einkaufspreis=15.50,
                verkaufspreis=22.00,
                mindestbestand=100,
                aktueller_bestand=250,
                lagerplatz="A-01-01",
                lieferant_id=lieferanten[0].id,
                aktiv=True
            ),
            Artikelstammdaten(
                id=str(uuid.uuid4()),
                artikelnummer="ART-002",
                bezeichnung="Schrauben M8x20",
                kategorie="Verbrauchsmaterial",
                einheit="Stück",
                einkaufspreis=0.15,
                verkaufspreis=0.25,
                mindestbestand=1000,
                aktueller_bestand=2500,
                lagerplatz="B-02-03",
                lieferant_id=lieferanten[1].id,
                aktiv=True
            ),
            Artikelstammdaten(
                id=str(uuid.uuid4()),
                artikelnummer="ART-003",
                bezeichnung="Maschinenschraube M12x50",
                kategorie="Verbrauchsmaterial",
                einheit="Stück",
                einkaufspreis=0.85,
                verkaufspreis=1.20,
                mindestbestand=500,
                aktueller_bestand=1200,
                lagerplatz="B-02-04",
                lieferant_id=lieferanten[1].id,
                aktiv=True
            )
        ]
        
        for art in artikel:
            self.db.add(art)
        
        # Lager
        lager = [
            Lager(
                id=str(uuid.uuid4()),
                name="Hauptlager",
                adresse="Lagerstr. 1, 12345 Musterstadt",
                lagerleiter="Max Mustermann",
                kapazitaet=10000,
                auslastung=65,
                aktiv=True
            ),
            Lager(
                id=str(uuid.uuid4()),
                name="Nebenlager",
                adresse="Industriestr. 15, 12345 Musterstadt",
                lagerleiter="Anna Schmidt",
                kapazitaet=5000,
                auslastung=45,
                aktiv=True
            )
        ]
        
        for l in lager:
            self.db.add(l)
        
        # Bestellungen
        bestellungen = [
            Bestellung(
                id=str(uuid.uuid4()),
                bestellnummer="BEST-2024-001",
                lieferant_id=lieferanten[0].id,
                bestelldatum=datetime.now() - timedelta(days=5),
                liefertermin=datetime.now() + timedelta(days=7),
                status="bestellt",
                gesamtbetrag=1550.00,
                waehrung="EUR"
            ),
            Bestellung(
                id=str(uuid.uuid4()),
                bestellnummer="BEST-2024-002",
                lieferant_id=lieferanten[1].id,
                bestelldatum=datetime.now() - timedelta(days=3),
                liefertermin=datetime.now() + timedelta(days=5),
                status="bestellt",
                gesamtbetrag=875.50,
                waehrung="EUR"
            )
        ]
        
        for bestellung in bestellungen:
            self.db.add(bestellung)
        
        print(f"✅ {len(lieferanten)} Lieferanten, {len(artikel)} Artikel, {len(lager)} Lager, {len(bestellungen)} Bestellungen erstellt")
    
    def create_finanzbuchhaltung_test_data(self):
        """Erstellt Testdaten für Finanzbuchhaltung"""
        print("💰 Erstelle Finanzbuchhaltung Testdaten...")
        
        # Konten
        konten = [
            Konto(
                id=str(uuid.uuid4()),
                kontonummer="1000",
                bezeichnung="Kasse",
                kontotyp="Aktivkonto",
                saldo=5000.00,
                waehrung="EUR",
                aktiv=True
            ),
            Konto(
                id=str(uuid.uuid4()),
                kontonummer="1200",
                bezeichnung="Bankkonto",
                kontotyp="Aktivkonto",
                saldo=25000.00,
                waehrung="EUR",
                aktiv=True
            ),
            Konto(
                id=str(uuid.uuid4()),
                kontonummer="1400",
                bezeichnung="Forderungen",
                kontotyp="Aktivkonto",
                saldo=15000.00,
                waehrung="EUR",
                aktiv=True
            ),
            Konto(
                id=str(uuid.uuid4()),
                kontonummer="1600",
                bezeichnung="Verbindlichkeiten",
                kontotyp="Passivkonto",
                saldo=8000.00,
                waehrung="EUR",
                aktiv=True
            )
        ]
        
        for konto in konten:
            self.db.add(konto)
        
        # Buchungen
        buchungen = [
            Buchung(
                id=str(uuid.uuid4()),
                buchungsnummer="BUCH-2024-001",
                buchungsdatum=datetime.now() - timedelta(days=1),
                soll_konto_id=konten[0].id,
                haben_konto_id=konten[1].id,
                betrag=1000.00,
                waehrung="EUR",
                buchungstext="Einzahlung Kasse",
                belegnummer="BELEG-001"
            ),
            Buchung(
                id=str(uuid.uuid4()),
                buchungsnummer="BUCH-2024-002",
                buchungsdatum=datetime.now(),
                soll_konto_id=konten[2].id,
                haben_konto_id=konten[0].id,
                betrag=2500.00,
                waehrung="EUR",
                buchungstext="Verkauf auf Rechnung",
                belegnummer="BELEG-002"
            )
        ]
        
        for buchung in buchungen:
            self.db.add(buchung)
        
        # Rechnungen
        rechnungen = [
            Rechnung(
                id=str(uuid.uuid4()),
                rechnungsnummer="RE-2024-001",
                kunde_id=str(uuid.uuid4()),  # Mock Kunde ID
                rechnungsdatum=datetime.now() - timedelta(days=5),
                faelligkeitsdatum=datetime.now() + timedelta(days=25),
                betrag=2500.00,
                waehrung="EUR",
                status="offen",
                steuersatz=19.0
            ),
            Rechnung(
                id=str(uuid.uuid4()),
                rechnungsnummer="RE-2024-002",
                kunde_id=str(uuid.uuid4()),  # Mock Kunde ID
                rechnungsdatum=datetime.now() - timedelta(days=3),
                faelligkeitsdatum=datetime.now() + timedelta(days=27),
                betrag=1800.00,
                waehrung="EUR",
                status="bezahlt",
                steuersatz=19.0
            )
        ]
        
        for rechnung in rechnungen:
            self.db.add(rechnung)
        
        print(f"✅ {len(konten)} Konten, {len(buchungen)} Buchungen, {len(rechnungen)} Rechnungen erstellt")
    
    def create_crm_test_data(self):
        """Erstellt Testdaten für CRM"""
        print("👥 Erstelle CRM Testdaten...")
        
        # Kunden
        kunden = [
            Kunde(
                id=str(uuid.uuid4()),
                kundennummer="K-001",
                name="Metallbau Meier GmbH",
                adresse="Industriestr. 25, 12345 Musterstadt",
                telefon="+49 123 456789",
                email="info@meier-metallbau.de",
                kundentyp="geschaeftskunde",
                umsatz_letztes_jahr=150000.00,
                aktiv=True
            ),
            Kunde(
                id=str(uuid.uuid4()),
                kundennummer="K-002",
                name="Stahlhandel Weber",
                adresse="Hafenstr. 12, 54321 Hafenstadt",
                telefon="+49 987 654321",
                email="kontakt@weber-stahl.de",
                kundentyp="geschaeftskunde",
                umsatz_letztes_jahr=85000.00,
                aktiv=True
            ),
            Kunde(
                id=str(uuid.uuid4()),
                kundennummer="K-003",
                name="Privatkunde Schmidt",
                adresse="Musterstr. 5, 67890 Privatort",
                telefon="+49 555 123456",
                email="schmidt@example.com",
                kundentyp="privatkunde",
                umsatz_letztes_jahr=2500.00,
                aktiv=True
            )
        ]
        
        for kunde in kunden:
            self.db.add(kunde)
        
        # Kontakte
        kontakte = [
            Kontakt(
                id=str(uuid.uuid4()),
                kunde_id=kunden[0].id,
                name="Max Mustermann",
                position="Einkaufsleiter",
                telefon="+49 123 456789",
                email="max.mustermann@meier-metallbau.de",
                hauptansprechpartner=True,
                aktiv=True
            ),
            Kontakt(
                id=str(uuid.uuid4()),
                kunde_id=kunden[1].id,
                name="Anna Weber",
                position="Geschäftsführerin",
                telefon="+49 987 654321",
                email="anna.weber@weber-stahl.de",
                hauptansprechpartner=True,
                aktiv=True
            )
        ]
        
        for kontakt in kontakte:
            self.db.add(kontakt)
        
        # Angebote
        angebote = [
            Angebot(
                id=str(uuid.uuid4()),
                angebotsnummer="ANG-2024-001",
                kunde_id=kunden[0].id,
                angebotsdatum=datetime.now() - timedelta(days=10),
                gueltig_bis=datetime.now() + timedelta(days=20),
                gesamtbetrag=5000.00,
                waehrung="EUR",
                status="versendet"
            ),
            Angebot(
                id=str(uuid.uuid4()),
                angebotsnummer="ANG-2024-002",
                kunde_id=kunden[1].id,
                angebotsdatum=datetime.now() - timedelta(days=5),
                gueltig_bis=datetime.now() + timedelta(days=25),
                gesamtbetrag=3200.00,
                waehrung="EUR",
                status="versendet"
            )
        ]
        
        for angebot in angebote:
            self.db.add(angebot)
        
        print(f"✅ {len(kunden)} Kunden, {len(kontakte)} Kontakte, {len(angebote)} Angebote erstellt")
    
    def create_uebergreifende_services_test_data(self):
        """Erstellt Testdaten für übergreifende Services"""
        print("🔧 Erstelle übergreifende Services Testdaten...")
        
        # Benutzer
        benutzer = [
            Benutzer(
                id=str(uuid.uuid4()),
                benutzername="admin",
                email="admin@valeo-neuroerp.de",
                vorname="Administrator",
                nachname="System",
                aktiv=True,
                letzter_login=datetime.now()
            ),
            Benutzer(
                id=str(uuid.uuid4()),
                benutzername="max.mustermann",
                email="max.mustermann@valeo-neuroerp.de",
                vorname="Max",
                nachname="Mustermann",
                aktiv=True,
                letzter_login=datetime.now() - timedelta(days=1)
            ),
            Benutzer(
                id=str(uuid.uuid4()),
                benutzername="anna.schmidt",
                email="anna.schmidt@valeo-neuroerp.de",
                vorname="Anna",
                nachname="Schmidt",
                aktiv=True,
                letzter_login=datetime.now() - timedelta(hours=2)
            )
        ]
        
        for benutzer_item in benutzer:
            self.db.add(benutzer_item)
        
        # Rollen
        rollen = [
            Rolle(
                id=str(uuid.uuid4()),
                name="Administrator",
                beschreibung="Vollzugriff auf alle Funktionen",
                aktiv=True
            ),
            Rolle(
                id=str(uuid.uuid4()),
                name="Manager",
                beschreibung="Erweiterte Rechte für Management",
                aktiv=True
            ),
            Rolle(
                id=str(uuid.uuid4()),
                name="Mitarbeiter",
                beschreibung="Standard-Benutzerrechte",
                aktiv=True
            )
        ]
        
        for rolle in rollen:
            self.db.add(rolle)
        
        # Systemeinstellungen
        systemeinstellungen = [
            SystemEinstellung(
                id=str(uuid.uuid4()),
                schluessel="company_name",
                wert="VALEO NeuroERP 2.0",
                beschreibung="Firmenname",
                kategorie="allgemein"
            ),
            SystemEinstellung(
                id=str(uuid.uuid4()),
                schluessel="default_currency",
                wert="EUR",
                beschreibung="Standard-Währung",
                kategorie="finanzen"
            ),
            SystemEinstellung(
                id=str(uuid.uuid4()),
                schluessel="auto_save_interval",
                wert="300",
                beschreibung="Auto-Save Intervall in Sekunden",
                kategorie="system"
            )
        ]
        
        for einstellung in systemeinstellungen:
            self.db.add(einstellung)
        
        print(f"✅ {len(benutzer)} Benutzer, {len(rollen)} Rollen, {len(systemeinstellungen)} Systemeinstellungen erstellt")

def init_test_data():
    """Hauptfunktion zur Initialisierung der Testdaten"""
    initializer = TestDataInitializer()
    initializer.create_test_data()

if __name__ == "__main__":
    init_test_data() 