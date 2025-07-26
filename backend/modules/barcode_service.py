"""
VALEO NeuroERP - Barcode Service
Adaptiert von Lakasir's ProductBarcode Feature
"""

import logging
from typing import Optional, List, Dict, Any
from decimal import Decimal
import json
from dataclasses import dataclass
from enum import Enum

logger = logging.getLogger(__name__)

class BarcodeType(Enum):
    """Barcode-Typen"""
    EAN13 = "ean13"
    EAN8 = "ean8"
    CODE128 = "code128"
    CODE39 = "code39"
    UPC = "upc"
    QR = "qr"

@dataclass
class BarcodeInfo:
    """Barcode-Informationen"""
    barcode: str
    barcode_type: BarcodeType
    artikel_nr: str
    bezeichnung: str
    aktiv: bool = True
    erstellt_am: Optional[str] = None

class BarcodeService:
    """Barcode-Service für VALEO NeuroERP"""
    
    def __init__(self, db_connection):
        self.db = db_connection
        self._init_barcode_table()
    
    def _init_barcode_table(self):
        """Initialisiert die Barcode-Tabelle falls nicht vorhanden"""
        try:
            with self.db.cursor() as cursor:
                cursor.execute("""
                    CREATE TABLE IF NOT EXISTS artikel_barcodes (
                        id SERIAL PRIMARY KEY,
                        artikel_nr VARCHAR(50) NOT NULL,
                        barcode VARCHAR(100) NOT NULL UNIQUE,
                        barcode_typ VARCHAR(20) DEFAULT 'EAN13',
                        aktiv BOOLEAN DEFAULT true,
                        erstellt_am TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                        FOREIGN KEY (artikel_nr) REFERENCES artikel_stammdaten(artikel_nr)
                    )
                """)
                
                # Indizes erstellen
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_artikel_barcodes_barcode 
                    ON artikel_barcodes(barcode)
                """)
                cursor.execute("""
                    CREATE INDEX IF NOT EXISTS idx_artikel_barcodes_artikel_nr 
                    ON artikel_barcodes(artikel_nr)
                """)
                
                self.db.commit()
                logger.info("Barcode-Tabelle initialisiert")
        except Exception as e:
            logger.error(f"Fehler beim Initialisieren der Barcode-Tabelle: {e}")
    
    def lookup_product_by_barcode(self, barcode: str) -> Optional[Dict[str, Any]]:
        """
        Sucht einen Artikel anhand des Barcodes
        
        Args:
            barcode: Der zu suchende Barcode
            
        Returns:
            Artikel-Daten oder None wenn nicht gefunden
        """
        try:
            with self.db.cursor() as cursor:
                cursor.execute("""
                    SELECT 
                        a.artikel_nr,
                        a.bezeichnung,
                        a.kurztext,
                        a.verkaufspreis_netto,
                        a.verkaufspreis_brutto,
                        a.mwst_satz,
                        a.einheit,
                        a.lagerbestand,
                        a.ean_code,
                        a.kategorie,
                        a.bild_url,
                        a.aktiv,
                        ab.barcode,
                        ab.barcode_typ
                    FROM artikel_stammdaten a
                    INNER JOIN artikel_barcodes ab ON a.artikel_nr = ab.artikel_nr
                    WHERE ab.barcode = %s AND ab.aktiv = true AND a.aktiv = true
                """, (barcode,))
                
                result = cursor.fetchone()
                if result:
                    return {
                        'artikel_nr': result[0],
                        'bezeichnung': result[1],
                        'kurztext': result[2],
                        'verkaufspreis_netto': Decimal(str(result[3])),
                        'verkaufspreis_brutto': Decimal(str(result[4])),
                        'mwst_satz': Decimal(str(result[5])),
                        'einheit': result[6],
                        'lagerbestand': Decimal(str(result[7])),
                        'ean_code': result[8],
                        'kategorie': result[9],
                        'bild_url': result[10],
                        'aktiv': result[11],
                        'barcode': result[12],
                        'barcode_typ': result[13]
                    }
                return None
        except Exception as e:
            logger.error(f"Fehler beim Barcode-Lookup: {e}")
            return None
    
    def register_barcode(self, artikel_nr: str, barcode: str, barcode_type: BarcodeType = BarcodeType.EAN13) -> bool:
        """
        Registriert einen neuen Barcode für einen Artikel
        
        Args:
            artikel_nr: Artikelnummer
            barcode: Barcode-String
            barcode_type: Typ des Barcodes
            
        Returns:
            True wenn erfolgreich, False bei Fehler
        """
        try:
            # Prüfen ob Artikel existiert
            with self.db.cursor() as cursor:
                cursor.execute("""
                    SELECT artikel_nr FROM artikel_stammdaten 
                    WHERE artikel_nr = %s AND aktiv = true
                """, (artikel_nr,))
                
                if not cursor.fetchone():
                    logger.error(f"Artikel {artikel_nr} nicht gefunden")
                    return False
                
                # Barcode registrieren
                cursor.execute("""
                    INSERT INTO artikel_barcodes (artikel_nr, barcode, barcode_typ)
                    VALUES (%s, %s, %s)
                    ON CONFLICT (barcode) DO UPDATE SET
                        artikel_nr = EXCLUDED.artikel_nr,
                        barcode_typ = EXCLUDED.barcode_typ,
                        aktiv = true
                """, (artikel_nr, barcode, barcode_type.value))
                
                self.db.commit()
                logger.info(f"Barcode {barcode} für Artikel {artikel_nr} registriert")
                return True
        except Exception as e:
            logger.error(f"Fehler beim Registrieren des Barcodes: {e}")
            return False
    
    def deactivate_barcode(self, barcode: str) -> bool:
        """
        Deaktiviert einen Barcode
        
        Args:
            barcode: Der zu deaktivierende Barcode
            
        Returns:
            True wenn erfolgreich
        """
        try:
            with self.db.cursor() as cursor:
                cursor.execute("""
                    UPDATE artikel_barcodes 
                    SET aktiv = false 
                    WHERE barcode = %s
                """, (barcode,))
                
                self.db.commit()
                logger.info(f"Barcode {barcode} deaktiviert")
                return True
        except Exception as e:
            logger.error(f"Fehler beim Deaktivieren des Barcodes: {e}")
            return False
    
    def get_barcodes_for_article(self, artikel_nr: str) -> List[BarcodeInfo]:
        """
        Holt alle Barcodes für einen Artikel
        
        Args:
            artikel_nr: Artikelnummer
            
        Returns:
            Liste der Barcode-Informationen
        """
        try:
            with self.db.cursor() as cursor:
                cursor.execute("""
                    SELECT barcode, barcode_typ, aktiv, erstellt_am
                    FROM artikel_barcodes
                    WHERE artikel_nr = %s
                    ORDER BY erstellt_am DESC
                """, (artikel_nr,))
                
                results = cursor.fetchall()
                barcodes = []
                
                for result in results:
                    barcodes.append(BarcodeInfo(
                        barcode=result[0],
                        barcode_type=BarcodeType(result[1]),
                        artikel_nr=artikel_nr,
                        bezeichnung="",  # Wird später gefüllt
                        aktiv=result[2],
                        erstellt_am=result[3].isoformat() if result[3] else None
                    ))
                
                return barcodes
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Barcodes: {e}")
            return []
    
    def validate_barcode(self, barcode: str, barcode_type: BarcodeType) -> bool:
        """
        Validiert einen Barcode
        
        Args:
            barcode: Der zu validierende Barcode
            barcode_type: Erwarteter Barcode-Typ
            
        Returns:
            True wenn gültig
        """
        if not barcode or len(barcode.strip()) == 0:
            return False
        
        barcode = barcode.strip()
        
        # EAN-13 Validierung
        if barcode_type == BarcodeType.EAN13:
            if len(barcode) != 13 or not barcode.isdigit():
                return False
            # Prüfziffer validieren
            return self._validate_ean13_checksum(barcode)
        
        # EAN-8 Validierung
        elif barcode_type == BarcodeType.EAN8:
            if len(barcode) != 8 or not barcode.isdigit():
                return False
            return self._validate_ean8_checksum(barcode)
        
        # Code 128 Validierung
        elif barcode_type == BarcodeType.CODE128:
            if len(barcode) < 1:
                return False
            # Code 128 kann alle ASCII-Zeichen enthalten
            return True
        
        # Code 39 Validierung
        elif barcode_type == BarcodeType.CODE39:
            if len(barcode) < 1:
                return False
            # Code 39: Zahlen, Großbuchstaben, -, ., /, +, %, $
            valid_chars = set('0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ-. /+%$')
            return all(c in valid_chars for c in barcode)
        
        return True
    
    def _validate_ean13_checksum(self, barcode: str) -> bool:
        """Validiert EAN-13 Prüfziffer"""
        if len(barcode) != 13:
            return False
        
        # Prüfziffer berechnen
        sum_odd = sum(int(barcode[i]) for i in range(0, 12, 2))
        sum_even = sum(int(barcode[i]) for i in range(1, 12, 2))
        checksum = (10 - ((sum_odd + sum_even * 3) % 10)) % 10
        
        return checksum == int(barcode[12])
    
    def _validate_ean8_checksum(self, barcode: str) -> bool:
        """Validiert EAN-8 Prüfziffer"""
        if len(barcode) != 8:
            return False
        
        # Prüfziffer berechnen
        sum_odd = sum(int(barcode[i]) for i in range(0, 7, 2))
        sum_even = sum(int(barcode[i]) for i in range(1, 7, 2))
        checksum = (10 - ((sum_odd + sum_even * 3) % 10)) % 10
        
        return checksum == int(barcode[7])
    
    def generate_barcode_suggestions(self, artikel_nr: str) -> List[str]:
        """
        Generiert Barcode-Vorschläge für einen Artikel
        
        Args:
            artikel_nr: Artikelnummer
            
        Returns:
            Liste von Barcode-Vorschlägen
        """
        suggestions = []
        
        # EAN-13 basierend auf Artikelnummer
        if len(artikel_nr) <= 12:
            # Deutsche EAN-13: 400-440
            base_ean = "400" + artikel_nr.zfill(9)
            checksum = self._calculate_ean13_checksum(base_ean)
            suggestions.append(base_ean + str(checksum))
        
        # Code 128 basierend auf Artikelnummer
        suggestions.append(f"ART{artikel_nr}")
        
        # Code 39 basierend auf Artikelnummer
        suggestions.append(f"*{artikel_nr}*")
        
        return suggestions
    
    def _calculate_ean13_checksum(self, barcode: str) -> int:
        """Berechnet EAN-13 Prüfziffer"""
        sum_odd = sum(int(barcode[i]) for i in range(0, 12, 2))
        sum_even = sum(int(barcode[i]) for i in range(1, 12, 2))
        return (10 - ((sum_odd + sum_even * 3) % 10)) % 10 