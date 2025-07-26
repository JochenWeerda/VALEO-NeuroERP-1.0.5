"""
VALEO NeuroERP - Stock Opname (Inventur) System
Adaptiert von Lakasir's StockOpname Feature
"""

import logging
from typing import List, Dict, Any, Optional
from decimal import Decimal
from datetime import datetime, date
from dataclasses import dataclass
from enum import Enum
import uuid

logger = logging.getLogger(__name__)

class StockOpnameStatus(Enum):
    """Inventur-Status"""
    OFFEN = "offen"
    IN_BEARBEITUNG = "in_bearbeitung"
    ABGESCHLOSSEN = "abgeschlossen"
    STORNIERT = "storniert"

@dataclass
class StockOpnameItem:
    """Inventur-Artikel"""
    id: Optional[int] = None
    opname_id: Optional[int] = None
    artikel_nr: str = ""
    bezeichnung: str = ""
    soll_bestand: Decimal = Decimal('0')
    ist_bestand: Decimal = Decimal('0')
    differenz: Decimal = Decimal('0')
    notiz: str = ""
    erfasst_am: Optional[datetime] = None

@dataclass
class StockOpname:
    """Inventur"""
    id: Optional[int] = None
    opname_nr: str = ""
    datum: date = date.today()
    kategorie: str = ""
    status: StockOpnameStatus = StockOpnameStatus.OFFEN
    erstellt_von: str = ""
    erstellt_am: Optional[datetime] = None
    abgeschlossen_am: Optional[datetime] = None
    artikel: List[StockOpnameItem] = None
    
    def __post_init__(self):
        if self.artikel is None:
            self.artikel = []

class StockOpnameService:
    """Stock Opname Service für VALEO NeuroERP"""
    
    def __init__(self, db_connection):
        self.db = db_connection
        self._init_stock_opname_tables()
    
    def _init_stock_opname_tables(self):
        """Initialisiert die Stock Opname Tabellen"""
        try:
            with self.db.cursor() as cursor:
                # Haupttabelle
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS stock_opname (
                        id SERIAL PRIMARY KEY,
                        opname_nr VARCHAR(50) UNIQUE NOT NULL,
                        datum DATE NOT NULL,
                        kategorie VARCHAR(100),
                        status VARCHAR(20) DEFAULT 'offen',
                        erstellt_von VARCHAR(50),
                        erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        abgeschlossen_am TIMESTAMP
                    )
                """)
                
                # Artikel-Tabelle
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS stock_opname_items (
                        id SERIAL PRIMARY KEY,
                        opname_id INTEGER REFERENCES stock_opname(id) ON DELETE CASCADE,
                        artikel_nr VARCHAR(50) NOT NULL,
                        bezeichnung VARCHAR(200),
                        soll_bestand DECIMAL(10,2) NOT NULL,
                        ist_bestand DECIMAL(10,2) NOT NULL,
                        differenz DECIMAL(10,2) NOT NULL,
                        notiz TEXT,
                        erfasst_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                    )
                """)
                
                # Indizes
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_stock_opname_datum 
                    ON stock_opname(datum)
                """)
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_stock_opname_status 
                    ON stock_opname(status)
                """)
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_stock_opname_items_opname_id 
                    ON stock_opname_items(opname_id)
                """)
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_stock_opname_items_artikel_nr 
                    ON stock_opname_items(artikel_nr)
                """)
                
                self.db.commit()
                logger.info("Stock Opname Tabellen initialisiert")
        except Exception as e:
            logger.error(f"Fehler beim Initialisieren der Stock Opname Tabellen: {e}")
    
    def create_stock_opname(self, kategorie: str = "", erstellt_von: str = "") -> Optional[StockOpname]:
        """
        Erstellt eine neue Inventur
        
        Args:
            kategorie: Kategorie für die Inventur
            erstellt_von: Benutzer der die Inventur erstellt
            
        Returns:
            StockOpname Objekt oder None bei Fehler
        """
        try:
            opname_nr = self._generate_opname_number()
            
            with self.db.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO stock_opname (opname_nr, datum, kategorie, status, erstellt_von)
                    VALUES (%s, %s, %s, %s, %s)
                    RETURNING id, erstellt_am
                """, (opname_nr, date.today(), kategorie, StockOpnameStatus.OFFEN.value, erstellt_von))
                
                result = cursor.fetchone()
                self.db.commit()
                
                if result:
                    return StockOpname(
                        id=result[0],
                        opname_nr=opname_nr,
                        datum=date.today(),
                        kategorie=kategorie,
                        status=StockOpnameStatus.OFFEN,
                        erstellt_von=erstellt_von,
                        erstellt_am=result[1]
                    )
                return None
        except Exception as e:
            logger.error(f"Fehler beim Erstellen der Stock Opname: {e}")
            return None
    
    def _generate_opname_number(self) -> str:
        """Generiert eine eindeutige Inventur-Nummer"""
        timestamp = datetime.now().strftime("%Y%m%d%H%M%S")
        return f"INV{timestamp}"
    
    def add_item_to_opname(self, opname_id: int, artikel_nr: str, soll_bestand: Decimal) -> bool:
        """
        Fügt einen Artikel zur Inventur hinzu
        
        Args:
            opname_id: ID der Inventur
            artikel_nr: Artikelnummer
            soll_bestand: Soll-Bestand aus der Datenbank
            
        Returns:
            True wenn erfolgreich
        """
        try:
            # Artikel-Informationen abrufen
            artikel_info = self._get_article_info(artikel_nr)
            if not artikel_info:
                logger.error(f"Artikel {artikel_nr} nicht gefunden")
                return False
            
            with self.db.cursor() as cursor:
                cursor.execute("""
                    INSERT INTO stock_opname_items 
                    (opname_id, artikel_nr, bezeichnung, soll_bestand, ist_bestand, differenz)
                    VALUES (%s, %s, %s, %s, %s, %s)
                """, (
                    opname_id,
                    artikel_nr,
                    artikel_info['bezeichnung'],
                    soll_bestand,
                    Decimal('0'),  # Ist-Bestand wird später eingegeben
                    -soll_bestand  # Differenz ist negativ bis Ist-Bestand eingegeben wird
                ))
                
                self.db.commit()
                logger.info(f"Artikel {artikel_nr} zur Inventur {opname_id} hinzugefügt")
                return True
        except Exception as e:
            logger.error(f"Fehler beim Hinzufügen des Artikels: {e}")
            return False
    
    def _get_article_info(self, artikel_nr: str) -> Optional[Dict[str, Any]]:
        """Holt Artikel-Informationen"""
        try:
            with self.db.cursor() as cursor:
                cursor.execute("""
                    SELECT bezeichnung, lagerbestand
                    FROM artikel_stammdaten
                    WHERE artikel_nr = %s AND aktiv = true
                """, (artikel_nr,))
                
                result = cursor.fetchone()
                if result:
                    return {
                        'bezeichnung': result[0],
                        'lagerbestand': result[1]
                    }
                return None
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Artikel-Informationen: {e}")
            return None
    
    def update_item_count(self, opname_id: int, artikel_nr: str, ist_bestand: Decimal, notiz: str = "") -> bool:
        """
        Aktualisiert den Ist-Bestand eines Artikels
        
        Args:
            opname_id: ID der Inventur
            artikel_nr: Artikelnummer
            ist_bestand: Gezählter Ist-Bestand
            notiz: Optionale Notiz
            
        Returns:
            True wenn erfolgreich
        """
        try:
            with self.db.cursor() as cursor:
                # Soll-Bestand abrufen
                cursor.execute("""
                    SELECT soll_bestand FROM stock_opname_items
                    WHERE opname_id = %s AND artikel_nr = %s
                """, (opname_id, artikel_nr))
                
                result = cursor.fetchone()
                if not result:
                    logger.error(f"Artikel {artikel_nr} nicht in Inventur {opname_id} gefunden")
                    return False
                
                soll_bestand = Decimal(str(result[0]))
                differenz = ist_bestand - soll_bestand
                
                # Ist-Bestand aktualisieren
                cursor.execute("""
                    UPDATE stock_opname_items
                    SET ist_bestand = %s, differenz = %s, notiz = %s, erfasst_am = CURRENT_TIMESTAMP
                    WHERE opname_id = %s AND artikel_nr = %s
                """, (ist_bestand, differenz, notiz, opname_id, artikel_nr))
                
                self.db.commit()
                logger.info(f"Ist-Bestand für Artikel {artikel_nr} aktualisiert: {ist_bestand}")
                return True
        except Exception as e:
            logger.error(f"Fehler beim Aktualisieren des Ist-Bestands: {e}")
            return False
    
    def get_stock_opname(self, opname_id: int) -> Optional[StockOpname]:
        """
        Holt eine Inventur mit allen Artikeln
        
        Args:
            opname_id: ID der Inventur
            
        Returns:
            StockOpname Objekt oder None
        """
        try:
            with self.db.cursor() as cursor:
                # Hauptdaten
                cursor.execute("""
                    SELECT opname_nr, datum, kategorie, status, erstellt_von, 
                           erstellt_am, abgeschlossen_am
                    FROM stock_opname
                    WHERE id = %s
                """, (opname_id,))
                
                result = cursor.fetchone()
                if not result:
                    return None
                
                opname = StockOpname(
                    id=opname_id,
                    opname_nr=result[0],
                    datum=result[1],
                    kategorie=result[2],
                    status=StockOpnameStatus(result[3]),
                    erstellt_von=result[4],
                    erstellt_am=result[5],
                    abgeschlossen_am=result[6]
                )
                
                # Artikel laden
                cursor.execute("""
                    SELECT id, artikel_nr, bezeichnung, soll_bestand, ist_bestand, 
                           differenz, notiz, erfasst_am
                    FROM stock_opname_items
                    WHERE opname_id = %s
                    ORDER BY artikel_nr
                """, (opname_id,))
                
                for row in cursor.fetchall():
                    opname.artikel.append(StockOpnameItem(
                        id=row[0],
                        opname_id=opname_id,
                        artikel_nr=row[1],
                        bezeichnung=row[2],
                        soll_bestand=Decimal(str(row[3])),
                        ist_bestand=Decimal(str(row[4])),
                        differenz=Decimal(str(row[5])),
                        notiz=row[6] or "",
                        erfasst_am=row[7]
                    ))
                
                return opname
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Stock Opname: {e}")
            return None
    
    def get_stock_opnames(self, status: Optional[StockOpnameStatus] = None, 
                         start_date: Optional[date] = None, 
                         end_date: Optional[date] = None) -> List[StockOpname]:
        """
        Holt alle Inventuren mit optionalen Filtern
        
        Args:
            status: Optionaler Status-Filter
            start_date: Start-Datum
            end_date: End-Datum
            
        Returns:
            Liste der StockOpname Objekte
        """
        try:
            with self.db.cursor() as cursor:
                query = """
                    SELECT id, opname_nr, datum, kategorie, status, erstellt_von, 
                           erstellt_am, abgeschlossen_am
                    FROM stock_opname
                    WHERE 1=1
                """
                params = []
                
                if status:
                    query += " AND status = %s"
                    params.append(status.value)
                
                if start_date:
                    query += " AND datum >= %s"
                    params.append(start_date)
                
                if end_date:
                    query += " AND datum <= %s"
                    params.append(end_date)
                
                query += " ORDER BY datum DESC, erstellt_am DESC"
                
                cursor.execute(query, params)
                opnames = []
                
                for row in cursor.fetchall():
                    opname = StockOpname(
                        id=row[0],
                        opname_nr=row[1],
                        datum=row[2],
                        kategorie=row[3],
                        status=StockOpnameStatus(row[4]),
                        erstellt_von=row[5],
                        erstellt_am=row[6],
                        abgeschlossen_am=row[7]
                    )
                    opnames.append(opname)
                
                return opnames
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Stock Opnames: {e}")
            return []
    
    def close_stock_opname(self, opname_id: int) -> bool:
        """
        Schließt eine Inventur ab und korrigiert die Lagerbestände
        
        Args:
            opname_id: ID der Inventur
            
        Returns:
            True wenn erfolgreich
        """
        try:
            with self.db.cursor() as cursor:
                # Status prüfen
                cursor.execute("""
                    SELECT status FROM stock_opname WHERE id = %s
                """, (opname_id,))
                
                result = cursor.fetchone()
                if not result or result[0] != StockOpnameStatus.OFFEN.value:
                    logger.error(f"Inventur {opname_id} kann nicht abgeschlossen werden")
                    return False
                
                # Alle Artikel der Inventur abrufen
                cursor.execute("""
                    SELECT artikel_nr, ist_bestand, differenz
                    FROM stock_opname_items
                    WHERE opname_id = %s
                """, (opname_id,))
                
                items = cursor.fetchall()
                
                # Lagerbestände korrigieren
                for item in items:
                    artikel_nr, ist_bestand, differenz = item
                    
                    if differenz != 0:  # Nur korrigieren wenn es Differenzen gibt
                        cursor.execute("""
                            UPDATE artikel_stammdaten
                            SET lagerbestand = %s
                            WHERE artikel_nr = %s
                        """, (ist_bestand, artikel_nr))
                        
                        logger.info(f"Lagerbestand für Artikel {artikel_nr} korrigiert: {ist_bestand}")
                
                # Inventur als abgeschlossen markieren
                cursor.execute("""
                    UPDATE stock_opname
                    SET status = %s, abgeschlossen_am = CURRENT_TIMESTAMP
                    WHERE id = %s
                """, (StockOpnameStatus.ABGESCHLOSSEN.value, opname_id))
                
                self.db.commit()
                logger.info(f"Inventur {opname_id} erfolgreich abgeschlossen")
                return True
        except Exception as e:
            logger.error(f"Fehler beim Abschließen der Inventur: {e}")
            return False
    
    def get_opname_statistics(self, opname_id: int) -> Dict[str, Any]:
        """
        Berechnet Statistiken für eine Inventur
        
        Args:
            opname_id: ID der Inventur
            
        Returns:
            Dictionary mit Statistiken
        """
        try:
            with self.db.cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        COUNT(*) as total_items,
                        COUNT(CASE WHEN differenz = 0 THEN 1 END) as correct_items,
                        COUNT(CASE WHEN differenz != 0 THEN 1 END) as incorrect_items,
                        SUM(ABS(differenz)) as total_difference,
                        SUM(CASE WHEN differenz > 0 THEN differenz ELSE 0 END) as positive_difference,
                        SUM(CASE WHEN differenz < 0 THEN ABS(differenz) ELSE 0 END) as negative_difference
                    FROM stock_opname_items
                    WHERE opname_id = %s
                """, (opname_id,))
                
                result = cursor.fetchone()
                if result:
                    return {
                        'total_items': result[0],
                        'correct_items': result[1],
                        'incorrect_items': result[2],
                        'total_difference': float(result[3]) if result[3] else 0,
                        'positive_difference': float(result[4]) if result[4] else 0,
                        'negative_difference': float(result[5]) if result[5] else 0,
                        'accuracy_percentage': (result[1] / result[0] * 100) if result[0] > 0 else 0
                    }
                return {}
        except Exception as e:
            logger.error(f"Fehler beim Berechnen der Inventur-Statistiken: {e}")
            return {}
    
    def delete_stock_opname(self, opname_id: int) -> bool:
        """
        Löscht eine Inventur (nur wenn noch offen)
        
        Args:
            opname_id: ID der Inventur
            
        Returns:
            True wenn erfolgreich
        """
        try:
            with self.db.cursor() as cursor:
                # Status prüfen
                cursor.execute("""
                    SELECT status FROM stock_opname WHERE id = %s
                """, (opname_id,))
                
                result = cursor.fetchone()
                if not result or result[0] != StockOpnameStatus.OFFEN.value:
                    logger.error(f"Inventur {opname_id} kann nicht gelöscht werden")
                    return False
                
                # Inventur löschen (Artikel werden durch CASCADE gelöscht)
                cursor.execute("""
                    DELETE FROM stock_opname WHERE id = %s
                """, (opname_id,))
                
                self.db.commit()
                logger.info(f"Inventur {opname_id} gelöscht")
                return True
        except Exception as e:
            logger.error(f"Fehler beim Löschen der Inventur: {e}")
            return False 