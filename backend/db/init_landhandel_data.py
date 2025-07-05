
# -*- coding: utf-8 -*-
"""
Testdaten für Landhandel-Module
"""
from datetime import datetime, timedelta
from sqlalchemy.orm import Session
from backend.db.session import get_db
from backend.models import landhandel as models

def create_test_data():
    """Erstellt Testdaten für die Landhandel-Module"""
    db = next(get_db())
    
    # Hersteller erstellen
    hersteller = [
        models.Hersteller(name="AgrarTech GmbH", anschrift="Industriestr. 45, 70565 Stuttgart", 
                         kontakt_email="info@agrartech.de", kontakt_telefon="0711-12345678"),
        models.Hersteller(name="BioSaat AG", anschrift="Hauptstr. 22, 80331 München", 
                         kontakt_email="kontakt@biosaat.de", kontakt_telefon="089-87654321"),
        models.Hersteller(name="ChemiePlant KG", anschrift="Hafenweg 8, 20457 Hamburg", 
                         kontakt_email="office@chemieplant.de", kontakt_telefon="040-55667788")
    ]
    
    for h in hersteller:
        db.add(h)
    
    db.commit()
    
    # Lager erstellen
    lager = [
        models.Lager(name="Hauptlager", standort="Betriebsgelände Nord", kapazitaet=500.0,
                    temperatur_min=5.0, temperatur_max=25.0),
        models.Lager(name="Kühlhalle", standort="Betriebsgelände Ost", kapazitaet=200.0,
                    temperatur_min=2.0, temperatur_max=10.0, luftfeuchtigkeit_min=40.0, luftfeuchtigkeit_max=60.0),
        models.Lager(name="Außenlager", standort="Feldweg 12", kapazitaet=1000.0)
    ]
    
    for l in lager:
        db.add(l)
    
    db.commit()
    
    # Saatgut erstellen
    saatgut = [
        models.Saatgut(artikelnummer="S-1001", name="Winterweizen Premium", beschreibung="Hochertragssorte",
                      hersteller_id=1, einheit="kg", preis_netto=3.45, typ=models.SaatgutTyp.GETREIDE,
                      sorte="Genius", saison=models.Saison.HERBST, keimfaehigkeit=95.0,
                      tausendkorngewicht=48.5, aussaatmenge_min=140.0, aussaatmenge_max=180.0),
        models.Saatgut(artikelnummer="S-1002", name="Sommergerste Standard", beschreibung="Braugerste",
                      hersteller_id=1, einheit="kg", preis_netto=2.95, typ=models.SaatgutTyp.GETREIDE,
                      sorte="Avalon", saison=models.Saison.FRUEHJAHR, keimfaehigkeit=92.0,
                      tausendkorngewicht=42.0, aussaatmenge_min=120.0, aussaatmenge_max=160.0),
        models.Saatgut(artikelnummer="S-2001", name="Mais Hybrid F1", beschreibung="Silomais",
                      hersteller_id=2, einheit="Einheit", preis_netto=89.95, typ=models.SaatgutTyp.MAIS,
                      sorte="PowerCorn", saison=models.Saison.FRUEHJAHR, keimfaehigkeit=98.0,
                      aussaatmenge_min=2.0, aussaatmenge_max=2.5)
    ]
    
    for s in saatgut:
        db.add(s)
    
    db.commit()
    
    # Düngemittel erstellen
    duengemittel = [
        models.Duengemittel(artikelnummer="D-3001", name="NPK 15-15-15", beschreibung="Universaldünger",
                           hersteller_id=3, einheit="kg", preis_netto=0.85, typ=models.DuengerTyp.MINERALISCH,
                           n_gehalt=15.0, p_gehalt=15.0, k_gehalt=15.0),
        models.Duengemittel(artikelnummer="D-3002", name="Kalkammonsalpeter", beschreibung="Stickstoffdünger",
                           hersteller_id=3, einheit="kg", preis_netto=0.65, typ=models.DuengerTyp.MINERALISCH,
                           n_gehalt=27.0, s_gehalt=4.0)
    ]
    
    for d in duengemittel:
        db.add(d)
    
    db.commit()
    
    # Pflanzenschutzmittel erstellen
    pflanzenschutzmittel = [
        models.Pflanzenschutzmittel(artikelnummer="P-4001", name="Unkraut-Ex", beschreibung="Breitbandherbizid",
                                  hersteller_id=3, einheit="l", preis_netto=24.95, typ=models.PflanzenschutzTyp.HERBIZID,
                                  wirkstoff="Glyphosat", zulassungsnummer="12345", zulassung_bis=datetime.now() + timedelta(days=365),
                                  wartezeit=7),
        models.Pflanzenschutzmittel(artikelnummer="P-4002", name="Fungistop", beschreibung="Gegen Mehltau und Rost",
                                  hersteller_id=3, einheit="l", preis_netto=32.50, typ=models.PflanzenschutzTyp.FUNGIZID,
                                  wirkstoff="Azoxystrobin", zulassungsnummer="67890", zulassung_bis=datetime.now() + timedelta(days=730),
                                  wartezeit=14)
    ]
    
    for p in pflanzenschutzmittel:
        db.add(p)
    
    db.commit()
    
    # Bestände erstellen
    bestaende = [
        models.Bestand(produkt_id=1, lager_id=1, menge=2500.0, mindestbestand=500.0,
                      chargennummer="CH-2023-001", haltbar_bis=datetime.now() + timedelta(days=365)),
        models.Bestand(produkt_id=2, lager_id=1, menge=1800.0, mindestbestand=400.0,
                      chargennummer="CH-2023-002", haltbar_bis=datetime.now() + timedelta(days=365)),
        models.Bestand(produkt_id=3, lager_id=2, menge=150.0, mindestbestand=50.0,
                      chargennummer="CH-2023-003", haltbar_bis=datetime.now() + timedelta(days=180)),
        models.Bestand(produkt_id=4, lager_id=3, menge=5000.0, mindestbestand=1000.0,
                      chargennummer="CH-2023-004"),
        models.Bestand(produkt_id=5, lager_id=3, menge=3000.0, mindestbestand=800.0,
                      chargennummer="CH-2023-005"),
        models.Bestand(produkt_id=6, lager_id=2, menge=250.0, mindestbestand=100.0,
                      chargennummer="CH-2023-006", haltbar_bis=datetime.now() + timedelta(days=730)),
        models.Bestand(produkt_id=7, lager_id=2, menge=180.0, mindestbestand=100.0,
                      chargennummer="CH-2023-007", haltbar_bis=datetime.now() + timedelta(days=730))
    ]
    
    for b in bestaende:
        db.add(b)
    
    db.commit()
    
    # Bestandsbewegungen erstellen
    bewegungen = [
        models.BestandsBewegung(produkt_id=1, lager_id=1, typ=models.BestandsBewegungsTyp.EINGANG,
                               menge=2500.0, chargennummer="CH-2023-001", beleg_nr="WE-2023-001",
                               durchgefuehrt_von="System"),
        models.BestandsBewegung(produkt_id=2, lager_id=1, typ=models.BestandsBewegungsTyp.EINGANG,
                               menge=2000.0, chargennummer="CH-2023-002", beleg_nr="WE-2023-002",
                               durchgefuehrt_von="System"),
        models.BestandsBewegung(produkt_id=2, lager_id=1, typ=models.BestandsBewegungsTyp.AUSGANG,
                               menge=200.0, chargennummer="CH-2023-002", beleg_nr="WA-2023-001",
                               durchgefuehrt_von="System")
    ]
    
    for b in bewegungen:
        db.add(b)
    
    db.commit()
    
    # Saisonale Planung erstellen
    planung = models.SaisonalePlanung(
        name="Frühjahrsbestellung 2024",
        jahr=2024,
        saison=models.Saison.FRUEHJAHR,
        start_datum=datetime(2024, 2, 15),
        end_datum=datetime(2024, 4, 30),
        beschreibung="Planung für die Frühjahrsbestellung 2024"
    )
    
    db.add(planung)
    db.commit()
    
    # Planungsdetails erstellen
    details = [
        models.SaisonalePlanungDetail(planung_id=planung.id, produkt_id=2, geplante_menge=1500.0),
        models.SaisonalePlanungDetail(planung_id=planung.id, produkt_id=3, geplante_menge=100.0),
        models.SaisonalePlanungDetail(planung_id=planung.id, produkt_id=5, geplante_menge=2000.0)
    ]
    
    for d in details:
        db.add(d)
    
    db.commit()
    
    return "Testdaten erfolgreich erstellt"

if __name__ == "__main__":
    create_test_data()
