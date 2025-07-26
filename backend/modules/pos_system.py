"""
VALEO NeuroERP - Kassensystem (POS) Modul
Integriert in die bestehende Datenstruktur mit TSE-Unterstützung
"""

import json
import logging
from datetime import datetime, date
from typing import Dict, List, Optional, Any
from decimal import Decimal
from dataclasses import dataclass, asdict
from enum import Enum
import uuid

# TSE Integration
try:
    from tse import TSE
except ImportError:
    TSE = None

logger = logging.getLogger(__name__)

class PaymentMethod(Enum):
    """Zahlungsarten"""
    BAR = "bar"
    EC_KARTE = "ec_karte"
    KREDITKARTE = "kreditkarte"
    PAYPAL = "paypal"
    KLARNA = "klarna"
    UEBERWEISUNG = "ueberweisung"
    RECHNUNG = "rechnung"

class SaleStatus(Enum):
    """Verkaufsstatus"""
    OFFEN = "offen"
    ABGESCHLOSSEN = "abgeschlossen"
    STORNIERT = "storniert"
    RÜCKGABE = "rueckgabe"

@dataclass
class POSProduct:
    """Artikel für das Kassensystem"""
    artikel_nr: str
    bezeichnung: str
    kurztext: str
    verkaufspreis_netto: Decimal
    verkaufspreis_brutto: Decimal
    mwst_satz: Decimal
    einheit: str
    lagerbestand: Decimal
    ean_code: Optional[str] = None
    kategorie: Optional[str] = None
    bild_url: Optional[str] = None
    aktiv: bool = True

@dataclass
class POSCartItem:
    """Warenkorb-Artikel"""
    artikel_nr: str
    bezeichnung: str
    menge: Decimal
    einzelpreis_netto: Decimal
    einzelpreis_brutto: Decimal
    gesamtpreis_netto: Decimal
    gesamtpreis_brutto: Decimal
    mwst_satz: Decimal
    mwst_betrag: Decimal
    einheit: str
    ean_code: Optional[str] = None

@dataclass
class POSSale:
    """Verkaufstransaktion"""
    beleg_nr: str
    kunde_id: Optional[str]
    kunde_name: Optional[str]
    verkaufsdatum: datetime
    artikel_liste: List[POSCartItem]
    gesamt_netto: Decimal
    gesamt_brutto: Decimal
    mwst_gesamt: Decimal
    rabatt_prozent: Decimal = Decimal('0')
    rabatt_betrag: Decimal = Decimal('0')
    zahlungsart: PaymentMethod = PaymentMethod.BAR
    status: SaleStatus = SaleStatus.OFFEN
    kassierer_id: Optional[str] = None
    kassierer_name: Optional[str] = None
    tse_signatur: Optional[str] = None
    tse_serien_nr: Optional[str] = None
    tse_signatur_counter: Optional[int] = None
    beleg_hash: Optional[str] = None
    notiz: Optional[str] = None

@dataclass
class POSDailyReport:
    """Tagesjournal"""
    datum: date
    kasse_id: str
    kassierer_id: str
    anzahl_belege: int
    gesamt_umsatz_netto: Decimal
    gesamt_umsatz_brutto: Decimal
    mwst_gesamt: Decimal
    zahlungsarten_aufschlüsselung: Dict[str, Decimal]
    kassenbestand_anfang: Decimal
    kassenbestand_ende: Decimal
    differenz: Decimal
    tse_signaturen: List[str]
    status: str = "offen"

class POSSystem:
    """Hauptklasse für das Kassensystem"""
    
    def __init__(self, db_connection, tse_config: Optional[Dict] = None):
        self.db = db_connection
        self.tse = None
        self.current_cart: List[POSCartItem] = []
        self.current_sale: Optional[POSSale] = None
        self.daily_report: Optional[POSDailyReport] = None
        
        # TSE Initialisierung
        if tse_config and TSE:
            try:
                self.tse = TSE(
                    host=tse_config.get('host', 'localhost'),
                    port=tse_config.get('port', 8080),
                    timeout=tse_config.get('timeout', 30)
                )
                logger.info("TSE erfolgreich initialisiert")
            except Exception as e:
                logger.error(f"TSE Initialisierung fehlgeschlagen: {e}")
    
    def get_products(self, kategorie: Optional[str] = None, search_term: Optional[str] = None) -> List[POSProduct]:
        """Artikel aus der Datenbank laden"""
        try:
            # Hier würde die Integration mit der bestehenden Artikel-Datenbank erfolgen
            # Beispiel-Implementierung basierend auf artikel_stammdaten_model.json
            
            query = """
            SELECT 
                a.artikel_nr,
                a.bezeichnung,
                a.kurztext,
                p.netto as verkaufspreis_netto,
                p.brutto as verkaufspreis_brutto,
                p.mwst_satz,
                a.mengen_einheit as einheit,
                l.bestand as lagerbestand,
                a.ean_code,
                a.artikel_gruppe as kategorie,
                a.bild_url,
                a.artikel_gesperrt as aktiv
            FROM artikel_stammdaten a
            LEFT JOIN artikel_preise p ON a.artikel_nr = p.artikel_nr
            LEFT JOIN lager_bestand l ON a.artikel_nr = l.artikel_nr
            WHERE a.artikel_gesperrt = false
            """
            
            params = []
            if kategorie:
                query += " AND a.artikel_gruppe = %s"
                params.append(kategorie)
            
            if search_term:
                query += " AND (a.bezeichnung ILIKE %s OR a.kurztext ILIKE %s OR a.artikel_nr ILIKE %s)"
                search_pattern = f"%{search_term}%"
                params.extend([search_pattern, search_pattern, search_pattern])
            
            # Hier würde die tatsächliche Datenbankabfrage erfolgen
            # Für jetzt verwenden wir Mock-Daten
            return self._get_mock_products()
            
        except Exception as e:
            logger.error(f"Fehler beim Laden der Artikel: {e}")
            return []
    
    def _get_mock_products(self) -> List[POSProduct]:
        """Mock-Artikel für Testzwecke"""
        return [
            POSProduct(
                artikel_nr="ART001",
                bezeichnung="Bio-Apfel",
                kurztext="Bio-Äpfel aus regionalem Anbau",
                verkaufspreis_netto=Decimal('2.50'),
                verkaufspreis_brutto=Decimal('2.98'),
                mwst_satz=Decimal('19.0'),
                einheit="kg",
                lagerbestand=Decimal('50.0'),
                ean_code="4001234567890",
                kategorie="Obst",
                aktiv=True
            ),
            POSProduct(
                artikel_nr="ART002",
                bezeichnung="Vollkornbrot",
                kurztext="Vollkornbrot vom Bäcker",
                verkaufspreis_netto=Decimal('3.20'),
                verkaufspreis_brutto=Decimal('3.81'),
                mwst_satz=Decimal('19.0'),
                einheit="Stück",
                lagerbestand=Decimal('20.0'),
                ean_code="4001234567891",
                kategorie="Backwaren",
                aktiv=True
            )
        ]
    
    def add_to_cart(self, artikel_nr: str, menge: Decimal) -> bool:
        """Artikel zum Warenkorb hinzufügen"""
        try:
            # Artikel aus der Datenbank laden
            products = self.get_products()
            product = next((p for p in products if p.artikel_nr == artikel_nr), None)
            
            if not product:
                logger.error(f"Artikel {artikel_nr} nicht gefunden")
                return False
            
            if product.lagerbestand < menge:
                logger.error(f"Unzureichender Lagerbestand für Artikel {artikel_nr}")
                return False
            
            # Berechne Preise
            einzelpreis_netto = product.verkaufspreis_netto
            einzelpreis_brutto = product.verkaufspreis_brutto
            gesamtpreis_netto = einzelpreis_netto * menge
            gesamtpreis_brutto = einzelpreis_brutto * menge
            mwst_betrag = gesamtpreis_brutto - gesamtpreis_netto
            
            cart_item = POSCartItem(
                artikel_nr=product.artikel_nr,
                bezeichnung=product.bezeichnung,
                menge=menge,
                einzelpreis_netto=einzelpreis_netto,
                einzelpreis_brutto=einzelpreis_brutto,
                gesamtpreis_netto=gesamtpreis_netto,
                gesamtpreis_brutto=gesamtpreis_brutto,
                mwst_satz=product.mwst_satz,
                mwst_betrag=mwst_betrag,
                einheit=product.einheit,
                ean_code=product.ean_code
            )
            
            # Prüfe ob Artikel bereits im Warenkorb
            existing_item = next((item for item in self.current_cart if item.artikel_nr == artikel_nr), None)
            if existing_item:
                existing_item.menge += menge
                existing_item.gesamtpreis_netto = existing_item.einzelpreis_netto * existing_item.menge
                existing_item.gesamtpreis_brutto = existing_item.einzelpreis_brutto * existing_item.menge
                existing_item.mwst_betrag = existing_item.gesamtpreis_brutto - existing_item.gesamtpreis_netto
            else:
                self.current_cart.append(cart_item)
            
            logger.info(f"Artikel {artikel_nr} zum Warenkorb hinzugefügt")
            return True
            
        except Exception as e:
            logger.error(f"Fehler beim Hinzufügen zum Warenkorb: {e}")
            return False
    
    def remove_from_cart(self, artikel_nr: str, menge: Optional[Decimal] = None) -> bool:
        """Artikel aus dem Warenkorb entfernen"""
        try:
            item = next((item for item in self.current_cart if item.artikel_nr == artikel_nr), None)
            if not item:
                return False
            
            if menge is None or menge >= item.menge:
                self.current_cart.remove(item)
            else:
                item.menge -= menge
                item.gesamtpreis_netto = item.einzelpreis_netto * item.menge
                item.gesamtpreis_brutto = item.einzelpreis_brutto * item.menge
                item.mwst_betrag = item.gesamtpreis_brutto - item.gesamtpreis_netto
            
            return True
            
        except Exception as e:
            logger.error(f"Fehler beim Entfernen aus dem Warenkorb: {e}")
            return False
    
    def get_cart_total(self) -> Dict[str, Decimal]:
        """Warenkorb-Gesamtsumme berechnen"""
        gesamt_netto = sum(item.gesamtpreis_netto for item in self.current_cart)
        gesamt_brutto = sum(item.gesamtpreis_brutto for item in self.current_cart)
        mwst_gesamt = sum(item.mwst_betrag for item in self.current_cart)
        
        return {
            'netto': gesamt_netto,
            'brutto': gesamt_brutto,
            'mwst': mwst_gesamt,
            'anzahl_artikel': len(self.current_cart)
        }
    
    def apply_discount(self, rabatt_prozent: Decimal) -> bool:
        """Rabatt auf den gesamten Warenkorb anwenden"""
        try:
            if rabatt_prozent < 0 or rabatt_prozent > 100:
                return False
            
            for item in self.current_cart:
                rabatt_betrag = item.gesamtpreis_netto * (rabatt_prozent / 100)
                item.gesamtpreis_netto -= rabatt_betrag
                item.gesamtpreis_brutto = item.gesamtpreis_netto * (1 + item.mwst_satz / 100)
                item.mwst_betrag = item.gesamtpreis_brutto - item.gesamtpreis_netto
            
            return True
            
        except Exception as e:
            logger.error(f"Fehler beim Anwenden des Rabatts: {e}")
            return False
    
    def create_sale(self, kunde_id: Optional[str] = None, zahlungsart: PaymentMethod = PaymentMethod.BAR) -> Optional[POSSale]:
        """Verkaufstransaktion erstellen"""
        try:
            if not self.current_cart:
                logger.error("Warenkorb ist leer")
                return None
            
            cart_total = self.get_cart_total()
            
            # Belegnummer generieren
            beleg_nr = self._generate_receipt_number()
            
            # TSE-Signatur erstellen falls verfügbar
            tse_signatur = None
            tse_serien_nr = None
            tse_signatur_counter = None
            
            if self.tse:
                try:
                    tse_data = self.tse.sign_transaction(
                        transaction_data={
                            'receipt_number': beleg_nr,
                            'total_amount': float(cart_total['brutto']),
                            'timestamp': datetime.now().isoformat()
                        }
                    )
                    tse_signatur = tse_data.get('signature')
                    tse_serien_nr = tse_data.get('serial_number')
                    tse_signatur_counter = tse_data.get('signature_counter')
                except Exception as e:
                    logger.error(f"TSE-Signatur fehlgeschlagen: {e}")
            
            # Verkaufstransaktion erstellen
            sale = POSSale(
                beleg_nr=beleg_nr,
                kunde_id=kunde_id,
                kunde_name=self._get_customer_name(kunde_id) if kunde_id else None,
                verkaufsdatum=datetime.now(),
                artikel_liste=self.current_cart.copy(),
                gesamt_netto=cart_total['netto'],
                gesamt_brutto=cart_total['brutto'],
                mwst_gesamt=cart_total['mwst'],
                zahlungsart=zahlungsart,
                status=SaleStatus.ABGESCHLOSSEN,
                tse_signatur=tse_signatur,
                tse_serien_nr=tse_serien_nr,
                tse_signatur_counter=tse_signatur_counter
            )
            
            self.current_sale = sale
            
            # Kassenschublade öffnen bei Barzahlung
            if zahlungsart == PaymentMethod.BAR:
                self._open_cash_drawer()
            
            # Warenkorb leeren
            self.current_cart.clear()
            
            logger.info(f"Verkaufstransaktion {beleg_nr} erstellt")
            return sale
            
        except Exception as e:
            logger.error(f"Fehler beim Erstellen der Verkaufstransaktion: {e}")
            return None
    
    def _generate_receipt_number(self) -> str:
        """Belegnummer generieren"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        random_part = str(uuid.uuid4())[:8]
        return f"BELEG-{timestamp}-{random_part}"
    
    def _get_customer_name(self, kunde_id: str) -> Optional[str]:
        """Kundenname aus der Datenbank laden"""
        # Hier würde die Integration mit der Kunden-Datenbank erfolgen
        return "Max Mustermann"  # Mock-Daten
    
    def _open_cash_drawer(self):
        """Kassenschublade öffnen"""
        try:
            # Hier würde die Integration mit der Kassenschublade erfolgen
            # Beispiel für serielle Schnittstelle
            logger.info("Kassenschublade wird geöffnet")
        except Exception as e:
            logger.error(f"Fehler beim Öffnen der Kassenschublade: {e}")
    
    def save_sale_to_database(self, sale: POSSale) -> bool:
        """Verkaufstransaktion in der Datenbank speichern"""
        try:
            # Hier würde die Integration mit der bestehenden Datenbank erfolgen
            # Beispiel für die Speicherung in verschiedenen Tabellen
            
            # 1. Hauptverkaufstabelle
            sale_data = {
                'beleg_nr': sale.beleg_nr,
                'kunde_id': sale.kunde_id,
                'verkaufsdatum': sale.verkaufsdatum,
                'gesamt_netto': float(sale.gesamt_netto),
                'gesamt_brutto': float(sale.gesamt_brutto),
                'mwst_gesamt': float(sale.mwst_gesamt),
                'rabatt_prozent': float(sale.rabatt_prozent),
                'rabatt_betrag': float(sale.rabatt_betrag),
                'zahlungsart': sale.zahlungsart.value,
                'status': sale.status.value,
                'tse_signatur': sale.tse_signatur,
                'tse_serien_nr': sale.tse_serien_nr,
                'tse_signatur_counter': sale.tse_signatur_counter,
                'erstellt_am': datetime.now()
            }
            
            # 2. Verkaufsartikel-Tabelle
            sale_items = []
            for item in sale.artikel_liste:
                item_data = {
                    'beleg_nr': sale.beleg_nr,
                    'artikel_nr': item.artikel_nr,
                    'bezeichnung': item.bezeichnung,
                    'menge': float(item.menge),
                    'einzelpreis_netto': float(item.einzelpreis_netto),
                    'einzelpreis_brutto': float(item.einzelpreis_brutto),
                    'gesamtpreis_netto': float(item.gesamtpreis_netto),
                    'gesamtpreis_brutto': float(item.gesamtpreis_brutto),
                    'mwst_satz': float(item.mwst_satz),
                    'mwst_betrag': float(item.mwst_betrag),
                    'einheit': item.einheit
                }
                sale_items.append(item_data)
            
            # 3. Lagerbestand aktualisieren
            for item in sale.artikel_liste:
                self._update_inventory(item.artikel_nr, item.menge)
            
            # 4. FIBU-Integration vorbereiten
            self._prepare_fibu_integration(sale)
            
            logger.info(f"Verkaufstransaktion {sale.beleg_nr} in Datenbank gespeichert")
            return True
            
        except Exception as e:
            logger.error(f"Fehler beim Speichern der Verkaufstransaktion: {e}")
            return False
    
    def _update_inventory(self, artikel_nr: str, menge: Decimal):
        """Lagerbestand aktualisieren"""
        try:
            # Hier würde die Aktualisierung des Lagerbestands erfolgen
            logger.info(f"Lagerbestand für Artikel {artikel_nr} um {menge} reduziert")
        except Exception as e:
            logger.error(f"Fehler beim Aktualisieren des Lagerbestands: {e}")
    
    def _prepare_fibu_integration(self, sale: POSSale):
        """FIBU-Integration vorbereiten"""
        try:
            # Hier würde die Vorbereitung für die FIBU-Integration erfolgen
            # Beispiel: Buchungssätze erstellen
            
            fibu_data = {
                'beleg_nr': sale.beleg_nr,
                'buchungsdatum': sale.verkaufsdatum.date(),
                'buchungssaetze': [
                    {
                        'konto': '1200',  # Forderungen aus Lieferungen und Leistungen
                        'buchungstext': f'Verkauf {sale.beleg_nr}',
                        'betrag': float(sale.gesamt_netto),
                        'soll_haben': 'Soll'
                    },
                    {
                        'konto': '3806',  # Umsatzsteuer 19%
                        'buchungstext': f'Umsatzsteuer {sale.beleg_nr}',
                        'betrag': float(sale.mwst_gesamt),
                        'soll_haben': 'Soll'
                    },
                    {
                        'konto': '8400',  # Erlöse
                        'buchungstext': f'Verkaufserlös {sale.beleg_nr}',
                        'betrag': float(sale.gesamt_netto),
                        'soll_haben': 'Haben'
                    }
                ]
            }
            
            # Hier würde die Speicherung in der FIBU-Tabelle erfolgen
            logger.info(f"FIBU-Integration für {sale.beleg_nr} vorbereitet")
            
        except Exception as e:
            logger.error(f"Fehler bei der FIBU-Integration: {e}")
    
    def create_daily_report(self, kasse_id: str, kassierer_id: str) -> Optional[POSDailyReport]:
        """Tagesjournal erstellen"""
        try:
            today = date.today()
            
            # Alle Verkäufe des Tages laden
            sales = self._get_sales_for_date(today)
            
            if not sales:
                logger.warning("Keine Verkäufe für heute gefunden")
                return None
            
            # Aufschlüsselung nach Zahlungsarten
            zahlungsarten_aufschlüsselung = {}
            for sale in sales:
                zahlungsart = sale.zahlungsart.value
                zahlungsarten_aufschlüsselung[zahlungsart] = zahlungsarten_aufschlüsselung.get(zahlungsart, 0) + float(sale.gesamt_brutto)
            
            # TSE-Signaturen sammeln
            tse_signaturen = [sale.tse_signatur for sale in sales if sale.tse_signatur]
            
            daily_report = POSDailyReport(
                datum=today,
                kasse_id=kasse_id,
                kassierer_id=kassierer_id,
                anzahl_belege=len(sales),
                gesamt_umsatz_netto=sum(sale.gesamt_netto for sale in sales),
                gesamt_umsatz_brutto=sum(sale.gesamt_brutto for sale in sales),
                mwst_gesamt=sum(sale.mwst_gesamt for sale in sales),
                zahlungsarten_aufschlüsselung=zahlungsarten_aufschlüsselung,
                kassenbestand_anfang=Decimal('0'),  # Wird aus der Kasse gelesen
                kassenbestand_ende=Decimal('0'),    # Wird aus der Kasse gelesen
                differenz=Decimal('0'),
                tse_signaturen=tse_signaturen
            )
            
            self.daily_report = daily_report
            logger.info(f"Tagesjournal für {today} erstellt")
            return daily_report
            
        except Exception as e:
            logger.error(f"Fehler beim Erstellen des Tagesjournals: {e}")
            return None
    
    def _get_sales_for_date(self, datum: date) -> List[POSSale]:
        """Verkäufe für ein bestimmtes Datum laden"""
        # Hier würde die Datenbankabfrage erfolgen
        # Für jetzt verwenden wir Mock-Daten
        return []
    
    def export_to_fibu(self, daily_report: POSDailyReport) -> bool:
        """Tagesjournal in FIBU exportieren"""
        try:
            # Hier würde die Integration mit dem FIBU-Modul erfolgen
            # Beispiel für die Erstellung von Buchungssätzen
            
            fibu_export = {
                'export_datum': datetime.now().isoformat(),
                'tagesjournal_datum': daily_report.datum.isoformat(),
                'kasse_id': daily_report.kasse_id,
                'gesamt_umsatz_netto': float(daily_report.gesamt_umsatz_netto),
                'gesamt_umsatz_brutto': float(daily_report.gesamt_umsatz_brutto),
                'mwst_gesamt': float(daily_report.mwst_gesamt),
                'buchungssaetze': [
                    {
                        'konto': '1200',  # Forderungen
                        'buchungstext': f'Tagesumsatz {daily_report.datum}',
                        'betrag': float(daily_report.gesamt_umsatz_netto),
                        'soll_haben': 'Soll'
                    },
                    {
                        'konto': '3806',  # Umsatzsteuer
                        'buchungstext': f'Umsatzsteuer {daily_report.datum}',
                        'betrag': float(daily_report.mwst_gesamt),
                        'soll_haben': 'Soll'
                    },
                    {
                        'konto': '8400',  # Erlöse
                        'buchungstext': f'Tageserlös {daily_report.datum}',
                        'betrag': float(daily_report.gesamt_umsatz_netto),
                        'soll_haben': 'Haben'
                    }
                ]
            }
            
            # Hier würde die Speicherung in der FIBU-Datenbank erfolgen
            logger.info(f"FIBU-Export für {daily_report.datum} erstellt")
            return True
            
        except Exception as e:
            logger.error(f"Fehler beim FIBU-Export: {e}")
            return False
    
    def get_receipt_template(self, sale: POSSale) -> str:
        """Beleg-Template generieren"""
        try:
            template = f"""
=== VALEO NeuroERP Kassensystem ===
Beleg-Nr: {sale.beleg_nr}
Datum: {sale.verkaufsdatum.strftime('%d.%m.%Y %H:%M')}
Kassierer: {sale.kassierer_name or 'Unbekannt'}

Artikel:
"""
            
            for item in sale.artikel_liste:
                template += f"""
{item.bezeichnung}
{item.menge} {item.einheit} x {item.einzelpreis_brutto:.2f}€ = {item.gesamtpreis_brutto:.2f}€
"""
            
            template += f"""
----------------------------------------
Zwischensumme: {sale.gesamt_netto:.2f}€
MwSt. ({sale.mwst_gesamt / sale.gesamt_netto * 100:.1f}%): {sale.mwst_gesamt:.2f}€
----------------------------------------
Gesamtbetrag: {sale.gesamt_brutto:.2f}€

Zahlungsart: {sale.zahlungsart.value.upper()}

"""
            
            if sale.tse_signatur:
                template += f"""
TSE-Signatur: {sale.tse_signatur}
TSE-Serien-Nr: {sale.tse_serien_nr}
Signatur-Counter: {sale.tse_signatur_counter}

Vielen Dank für Ihren Einkauf!
"""
            
            return template
            
        except Exception as e:
            logger.error(f"Fehler beim Generieren des Beleg-Templates: {e}")
            return "Fehler beim Generieren des Belegs" 