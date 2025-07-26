"""
VALEO NeuroERP - Kassensystem API
REST-API für das Point-of-Sale System
"""

from fastapi import APIRouter, HTTPException, Depends, Query
from fastapi.responses import JSONResponse
from typing import List, Optional, Dict, Any
from datetime import datetime, date
from decimal import Decimal
import logging

from ..modules.pos_system import (
    POSSystem, POSProduct, POSCartItem, POSSale, 
    POSDailyReport, PaymentMethod, SaleStatus
)
from ..auth.auth_handler import get_current_user
from ..database.connection import get_database_connection

logger = logging.getLogger(__name__)

router = APIRouter(prefix="/api/pos", tags=["Kassensystem"])

# Globale POS-System-Instanz
pos_system: Optional[POSSystem] = None

def get_pos_system():
    """POS-System-Instanz abrufen"""
    global pos_system
    if pos_system is None:
        db_conn = get_database_connection()
        tse_config = {
            'host': 'localhost',
            'port': 8080,
            'timeout': 30
        }
        pos_system = POSSystem(db_conn, tse_config)
    return pos_system

@router.get("/products", response_model=List[Dict[str, Any]])
async def get_products(
    kategorie: Optional[str] = Query(None, description="Artikelkategorie"),
    search: Optional[str] = Query(None, description="Suchbegriff"),
    current_user: Dict = Depends(get_current_user)
):
    """Artikel für das Kassensystem abrufen"""
    try:
        pos = get_pos_system()
        products = pos.get_products(kategorie, search)
        
        # Konvertiere zu JSON-serialisierbarem Format
        result = []
        for product in products:
            result.append({
                'artikel_nr': product.artikel_nr,
                'bezeichnung': product.bezeichnung,
                'kurztext': product.kurztext,
                'verkaufspreis_netto': float(product.verkaufspreis_netto),
                'verkaufspreis_brutto': float(product.verkaufspreis_brutto),
                'mwst_satz': float(product.mwst_satz),
                'einheit': product.einheit,
                'lagerbestand': float(product.lagerbestand),
                'ean_code': product.ean_code,
                'kategorie': product.kategorie,
                'bild_url': product.bild_url,
                'aktiv': product.aktiv
            })
        
        return result
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Artikel: {e}")
        raise HTTPException(status_code=500, detail="Fehler beim Laden der Artikel")

@router.post("/cart/add")
async def add_to_cart(
    artikel_nr: str,
    menge: float,
    current_user: Dict = Depends(get_current_user)
):
    """Artikel zum Warenkorb hinzufügen"""
    try:
        pos = get_pos_system()
        success = pos.add_to_cart(artikel_nr, Decimal(str(menge)))
        
        if not success:
            raise HTTPException(status_code=400, detail="Fehler beim Hinzufügen zum Warenkorb")
        
        cart_total = pos.get_cart_total()
        return {
            "success": True,
            "message": f"Artikel {artikel_nr} zum Warenkorb hinzugefügt",
            "cart_total": {
                'netto': float(cart_total['netto']),
                'brutto': float(cart_total['brutto']),
                'mwst': float(cart_total['mwst']),
                'anzahl_artikel': cart_total['anzahl_artikel']
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Hinzufügen zum Warenkorb: {e}")
        raise HTTPException(status_code=500, detail="Interner Serverfehler")

@router.delete("/cart/remove")
async def remove_from_cart(
    artikel_nr: str,
    menge: Optional[float] = None,
    current_user: Dict = Depends(get_current_user)
):
    """Artikel aus dem Warenkorb entfernen"""
    try:
        pos = get_pos_system()
        menge_decimal = Decimal(str(menge)) if menge is not None else None
        success = pos.remove_from_cart(artikel_nr, menge_decimal)
        
        if not success:
            raise HTTPException(status_code=400, detail="Artikel nicht im Warenkorb gefunden")
        
        cart_total = pos.get_cart_total()
        return {
            "success": True,
            "message": f"Artikel {artikel_nr} aus dem Warenkorb entfernt",
            "cart_total": {
                'netto': float(cart_total['netto']),
                'brutto': float(cart_total['brutto']),
                'mwst': float(cart_total['mwst']),
                'anzahl_artikel': cart_total['anzahl_artikel']
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Entfernen aus dem Warenkorb: {e}")
        raise HTTPException(status_code=500, detail="Interner Serverfehler")

@router.get("/cart")
async def get_cart(current_user: Dict = Depends(get_current_user)):
    """Aktuellen Warenkorb abrufen"""
    try:
        pos = get_pos_system()
        cart_items = []
        
        for item in pos.current_cart:
            cart_items.append({
                'artikel_nr': item.artikel_nr,
                'bezeichnung': item.bezeichnung,
                'menge': float(item.menge),
                'einzelpreis_netto': float(item.einzelpreis_netto),
                'einzelpreis_brutto': float(item.einzelpreis_brutto),
                'gesamtpreis_netto': float(item.gesamtpreis_netto),
                'gesamtpreis_brutto': float(item.gesamtpreis_brutto),
                'mwst_satz': float(item.mwst_satz),
                'mwst_betrag': float(item.mwst_betrag),
                'einheit': item.einheit,
                'ean_code': item.ean_code
            })
        
        cart_total = pos.get_cart_total()
        
        return {
            "items": cart_items,
            "total": {
                'netto': float(cart_total['netto']),
                'brutto': float(cart_total['brutto']),
                'mwst': float(cart_total['mwst']),
                'anzahl_artikel': cart_total['anzahl_artikel']
            }
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen des Warenkorbs: {e}")
        raise HTTPException(status_code=500, detail="Interner Serverfehler")

@router.post("/cart/clear")
async def clear_cart(current_user: Dict = Depends(get_current_user)):
    """Warenkorb leeren"""
    try:
        pos = get_pos_system()
        pos.current_cart.clear()
        
        return {
            "success": True,
            "message": "Warenkorb geleert"
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Leeren des Warenkorbs: {e}")
        raise HTTPException(status_code=500, detail="Interner Serverfehler")

@router.post("/cart/discount")
async def apply_discount(
    rabatt_prozent: float,
    current_user: Dict = Depends(get_current_user)
):
    """Rabatt auf den Warenkorb anwenden"""
    try:
        pos = get_pos_system()
        success = pos.apply_discount(Decimal(str(rabatt_prozent)))
        
        if not success:
            raise HTTPException(status_code=400, detail="Ungültiger Rabatt")
        
        cart_total = pos.get_cart_total()
        return {
            "success": True,
            "message": f"Rabatt von {rabatt_prozent}% angewendet",
            "cart_total": {
                'netto': float(cart_total['netto']),
                'brutto': float(cart_total['brutto']),
                'mwst': float(cart_total['mwst']),
                'anzahl_artikel': cart_total['anzahl_artikel']
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Anwenden des Rabatts: {e}")
        raise HTTPException(status_code=500, detail="Interner Serverfehler")

@router.post("/sale/create")
async def create_sale(
    kunde_id: Optional[str] = None,
    zahlungsart: PaymentMethod = PaymentMethod.BAR,
    current_user: Dict = Depends(get_current_user)
):
    """Verkaufstransaktion erstellen"""
    try:
        pos = get_pos_system()
        sale = pos.create_sale(kunde_id, zahlungsart)
        
        if not sale:
            raise HTTPException(status_code=400, detail="Fehler beim Erstellen der Verkaufstransaktion")
        
        # Verkauf in Datenbank speichern
        pos.save_sale_to_database(sale)
        
        # Beleg-Template generieren
        receipt_template = pos.get_receipt_template(sale)
        
        return {
            "success": True,
            "message": "Verkaufstransaktion erfolgreich erstellt",
            "sale": {
                'beleg_nr': sale.beleg_nr,
                'kunde_id': sale.kunde_id,
                'kunde_name': sale.kunde_name,
                'verkaufsdatum': sale.verkaufsdatum.isoformat(),
                'gesamt_netto': float(sale.gesamt_netto),
                'gesamt_brutto': float(sale.gesamt_brutto),
                'mwst_gesamt': float(sale.mwst_gesamt),
                'zahlungsart': sale.zahlungsart.value,
                'status': sale.status.value,
                'tse_signatur': sale.tse_signatur,
                'tse_serien_nr': sale.tse_serien_nr,
                'tse_signatur_counter': sale.tse_signatur_counter
            },
            "receipt_template": receipt_template
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Erstellen der Verkaufstransaktion: {e}")
        raise HTTPException(status_code=500, detail="Interner Serverfehler")

@router.get("/sales")
async def get_sales(
    start_date: Optional[date] = Query(None, description="Startdatum"),
    end_date: Optional[date] = Query(None, description="Enddatum"),
    status: Optional[SaleStatus] = Query(None, description="Verkaufsstatus"),
    current_user: Dict = Depends(get_current_user)
):
    """Verkäufe abrufen"""
    try:
        # Hier würde die Datenbankabfrage erfolgen
        # Für jetzt verwenden wir Mock-Daten
        
        mock_sales = [
            {
                'beleg_nr': 'BELEG-20250124120000-12345678',
                'kunde_id': 'KUNDE001',
                'kunde_name': 'Max Mustermann',
                'verkaufsdatum': '2025-01-24T12:00:00',
                'gesamt_netto': 10.50,
                'gesamt_brutto': 12.50,
                'mwst_gesamt': 2.00,
                'zahlungsart': 'bar',
                'status': 'abgeschlossen',
                'anzahl_artikel': 3
            }
        ]
        
        return {
            "sales": mock_sales,
            "total_count": len(mock_sales)
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Verkäufe: {e}")
        raise HTTPException(status_code=500, detail="Interner Serverfehler")

@router.get("/sales/{beleg_nr}")
async def get_sale_details(
    beleg_nr: str,
    current_user: Dict = Depends(get_current_user)
):
    """Details einer Verkaufstransaktion abrufen"""
    try:
        # Hier würde die Datenbankabfrage erfolgen
        # Für jetzt verwenden wir Mock-Daten
        
        mock_sale = {
            'beleg_nr': beleg_nr,
            'kunde_id': 'KUNDE001',
            'kunde_name': 'Max Mustermann',
            'verkaufsdatum': '2025-01-24T12:00:00',
            'gesamt_netto': 10.50,
            'gesamt_brutto': 12.50,
            'mwst_gesamt': 2.00,
            'zahlungsart': 'bar',
            'status': 'abgeschlossen',
            'artikel_liste': [
                {
                    'artikel_nr': 'ART001',
                    'bezeichnung': 'Bio-Apfel',
                    'menge': 2.0,
                    'einzelpreis_brutto': 2.98,
                    'gesamtpreis_brutto': 5.96,
                    'einheit': 'kg'
                }
            ],
            'tse_signatur': 'TSE-SIGNATURE-123',
            'tse_serien_nr': 'TSE-SERIAL-456',
            'tse_signatur_counter': 12345
        }
        
        return mock_sale
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Verkaufsdetails: {e}")
        raise HTTPException(status_code=500, detail="Interner Serverfehler")

@router.post("/daily-report/create")
async def create_daily_report(
    kasse_id: str,
    current_user: Dict = Depends(get_current_user)
):
    """Tagesjournal erstellen"""
    try:
        pos = get_pos_system()
        daily_report = pos.create_daily_report(kasse_id, current_user.get('user_id'))
        
        if not daily_report:
            raise HTTPException(status_code=400, detail="Keine Verkäufe für heute gefunden")
        
        return {
            "success": True,
            "message": "Tagesjournal erfolgreich erstellt",
            "daily_report": {
                'datum': daily_report.datum.isoformat(),
                'kasse_id': daily_report.kasse_id,
                'kassierer_id': daily_report.kassierer_id,
                'anzahl_belege': daily_report.anzahl_belege,
                'gesamt_umsatz_netto': float(daily_report.gesamt_umsatz_netto),
                'gesamt_umsatz_brutto': float(daily_report.gesamt_umsatz_brutto),
                'mwst_gesamt': float(daily_report.mwst_gesamt),
                'zahlungsarten_aufschlüsselung': {
                    k: float(v) for k, v in daily_report.zahlungsarten_aufschlüsselung.items()
                },
                'kassenbestand_anfang': float(daily_report.kassenbestand_anfang),
                'kassenbestand_ende': float(daily_report.kassenbestand_ende),
                'differenz': float(daily_report.differenz),
                'tse_signaturen': daily_report.tse_signaturen,
                'status': daily_report.status
            }
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim Erstellen des Tagesjournals: {e}")
        raise HTTPException(status_code=500, detail="Interner Serverfehler")

@router.post("/daily-report/export-fibu")
async def export_daily_report_to_fibu(
    datum: date,
    current_user: Dict = Depends(get_current_user)
):
    """Tagesjournal in FIBU exportieren"""
    try:
        pos = get_pos_system()
        
        # Tagesjournal laden
        daily_report = pos.daily_report
        if not daily_report or daily_report.datum != datum:
            raise HTTPException(status_code=400, detail="Tagesjournal nicht gefunden")
        
        # FIBU-Export durchführen
        success = pos.export_to_fibu(daily_report)
        
        if not success:
            raise HTTPException(status_code=500, detail="Fehler beim FIBU-Export")
        
        return {
            "success": True,
            "message": f"Tagesjournal für {datum} erfolgreich in FIBU exportiert"
        }
        
    except HTTPException:
        raise
    except Exception as e:
        logger.error(f"Fehler beim FIBU-Export: {e}")
        raise HTTPException(status_code=500, detail="Interner Serverfehler")

@router.get("/payment-methods")
async def get_payment_methods(current_user: Dict = Depends(get_current_user)):
    """Verfügbare Zahlungsarten abrufen"""
    try:
        payment_methods = [
            {
                'value': method.value,
                'label': method.value.replace('_', ' ').title(),
                'description': f"Zahlung per {method.value.replace('_', ' ')}"
            }
            for method in PaymentMethod
        ]
        
        return {
            "payment_methods": payment_methods
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der Zahlungsarten: {e}")
        raise HTTPException(status_code=500, detail="Interner Serverfehler")

@router.get("/status")
async def get_pos_status(current_user: Dict = Depends(get_current_user)):
    """Status des Kassensystems abrufen"""
    try:
        pos = get_pos_system()
        
        cart_total = pos.get_cart_total()
        
        return {
            "system_status": "online",
            "tse_connected": pos.tse is not None,
            "current_cart": {
                'anzahl_artikel': cart_total['anzahl_artikel'],
                'gesamt_brutto': float(cart_total['brutto'])
            },
            "current_user": {
                'user_id': current_user.get('user_id'),
                'username': current_user.get('username'),
                'role': current_user.get('role')
            }
        }
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen des Systemstatus: {e}")
        raise HTTPException(status_code=500, detail="Interner Serverfehler") 