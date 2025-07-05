"""
QS-Futtermittel API für das AI-gestützte ERP-System.

Diese API implementiert die Endpunkte für die QS-konforme Chargenverwaltung
in der Futtermittelherstellung, speziell für fahrbare Mahl- und Mischanlagen
gemäß dem QS-Leitfaden (01.01.2025).
"""

from datetime import datetime, timezone, timedelta
from typing import Dict, List, Optional, Union, Any
import json
import logging
from math import ceil

from starlette.responses import JSONResponse
from pydantic import BaseModel, Field, EmailStr, validator

from backend.models.lager import (
    Charge, ChargeStatus
)
from backend.models.qs_futtermittel import (
    QSFuttermittelCharge, QSRohstoff, QSMonitoring, QSEreignis, 
    QSBenachrichtigung, QSDokument, QSStatus, KontaminationsRisiko, 
    MonitoringStatus, QSRohstoffTyp, EreignisTyp, EreignisPrioritaet
)

# Konfiguration des Loggers
logger = logging.getLogger(__name__)

# Pydantic-Modelle für die API-Anfragen und -Antworten

# Gemeinsame Basisklasse für Rohstoffe
class RohstoffBase(BaseModel):
    rohstoff_charge_id: int
    rohstoff_typ: QSRohstoffTyp
    menge: float
    einheit_id: int
    anteil: Optional[float] = None
    lieferant_id: Optional[int] = None
    lieferant_chargen_nr: Optional[str] = None
    kontaminationsrisiko: KontaminationsRisiko = KontaminationsRisiko.NIEDRIG
    qs_zertifiziert: bool = False
    zertifikat_nr: Optional[str] = None
    mischposition: Optional[int] = None

# Rohstoff für die Erstellung
class RohstoffCreate(RohstoffBase):
    pass

# Rohstoff für die Rückgabe
class RohstoffResponse(RohstoffBase):
    id: int
    charge_id: int
    erstellt_am: datetime

    class Config:
        orm_mode = True

# Gemeinsame Basisklasse für Monitoring
class MonitoringBase(BaseModel):
    proben_id: str
    status: MonitoringStatus = MonitoringStatus.GEPLANT
    probentyp: str
    entnahme_datum: Optional[datetime] = None
    entnommen_durch_id: Optional[int] = None
    labor_id: Optional[int] = None
    labor_eingang_datum: Optional[datetime] = None
    ergebnis_datum: Optional[datetime] = None
    ergebnis_werte: Optional[Dict[str, Any]] = None
    grenzwert_eingehalten: Optional[bool] = None
    bemerkung: Optional[str] = None

# Monitoring für die Erstellung
class MonitoringCreate(MonitoringBase):
    pass

# Monitoring für die Rückgabe
class MonitoringResponse(MonitoringBase):
    id: int
    charge_id: int
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None

    class Config:
        orm_mode = True

# Gemeinsame Basisklasse für Ereignisse
class EreignisBase(BaseModel):
    ereignis_typ: EreignisTyp
    titel: str
    beschreibung: Optional[str] = None
    prioritaet: EreignisPrioritaet = EreignisPrioritaet.MITTEL
    ereignis_datum: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    faellig_bis: Optional[datetime] = None
    ist_abgeschlossen: bool = False
    ist_bearbeitet: bool = False
    erstellt_von_id: Optional[int] = None
    zugewiesen_an_id: Optional[int] = None
    massnahmen: Optional[str] = None
    nachfolgemassnahmen: Optional[str] = None

# Ereignis für die Erstellung
class EreignisCreate(EreignisBase):
    pass

# Ereignis für die Rückgabe
class EreignisResponse(EreignisBase):
    id: int
    charge_id: int
    abgeschlossen_am: Optional[datetime] = None
    abgeschlossen_von_id: Optional[int] = None
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None

    class Config:
        orm_mode = True

# Benachrichtigung für die Erstellung
class BenachrichtigungCreate(BaseModel):
    empfaenger_id: Optional[int] = None
    empfaenger_email: Optional[EmailStr] = None
    betreff: str
    inhalt: str

# Benachrichtigung für die Rückgabe
class BenachrichtigungResponse(BenachrichtigungCreate):
    id: int
    ereignis_id: int
    gesendet: bool = False
    gesendet_am: Optional[datetime] = None
    gelesen: bool = False
    gelesen_am: Optional[datetime] = None
    erstellt_am: datetime

    class Config:
        orm_mode = True

# Dokument für die Erstellung
class DokumentCreate(BaseModel):
    titel: str
    beschreibung: Optional[str] = None
    dokument_typ: str
    dateiname: str
    dateipfad: Optional[str] = None
    mime_type: Optional[str] = None
    erstellt_von_id: Optional[int] = None

# Dokument für die Rückgabe
class DokumentResponse(DokumentCreate):
    id: int
    charge_id: Optional[int] = None
    ereignis_id: Optional[int] = None
    monitoring_id: Optional[int] = None
    erstellt_am: datetime

    class Config:
        orm_mode = True

# Gemeinsame Basisklasse für QS-Futtermittelchargen
class QSFuttermittelChargeBase(BaseModel):
    produktbezeichnung: str
    herstellungsdatum: datetime = Field(default_factory=lambda: datetime.now(timezone.utc))
    mindesthaltbarkeitsdatum: Optional[datetime] = None
    qs_status: QSStatus = QSStatus.IN_PRUEFUNG
    mischzeit: Optional[int] = None
    mahlzeit: Optional[int] = None
    mischtemperatur: Optional[float] = None
    feuchtigkeit: Optional[float] = None
    bediener_id: Optional[int] = None
    qualitaetsverantwortlicher_id: Optional[int] = None
    kunde_id: Optional[int] = None
    ist_spuelcharge: bool = False
    nach_kritischem_material: bool = False
    qs_freigabe_datum: Optional[datetime] = None
    qs_freigabe_durch_id: Optional[int] = None
    qs_kennzeichnung_vollstaendig: bool = False
    qs_dokumentation_vollstaendig: bool = False
    monitoringpflicht: bool = False
    monitoringintervall_tage: Optional[int] = None
    haccp_ccp_temperatur: bool = False
    haccp_ccp_magnetabscheider: bool = False
    haccp_ccp_siebung: bool = False
    ccp_messwerte: Optional[Dict[str, Any]] = None
    vorgaenger_chargen: Optional[List[int]] = None

# QS-Futtermittelcharge für die Erstellung
class QSFuttermittelChargeCreate(QSFuttermittelChargeBase):
    charge_id: int
    rohstoffe: List[RohstoffCreate] = []

# QS-Futtermittelcharge für die Aktualisierung
class QSFuttermittelChargeUpdate(BaseModel):
    produktbezeichnung: Optional[str] = None
    mindesthaltbarkeitsdatum: Optional[datetime] = None
    qs_status: Optional[QSStatus] = None
    mischzeit: Optional[int] = None
    mahlzeit: Optional[int] = None
    mischtemperatur: Optional[float] = None
    feuchtigkeit: Optional[float] = None
    bediener_id: Optional[int] = None
    qualitaetsverantwortlicher_id: Optional[int] = None
    kunde_id: Optional[int] = None
    ist_spuelcharge: Optional[bool] = None
    nach_kritischem_material: Optional[bool] = None
    qs_freigabe_datum: Optional[datetime] = None
    qs_freigabe_durch_id: Optional[int] = None
    qs_kennzeichnung_vollstaendig: Optional[bool] = None
    qs_dokumentation_vollstaendig: Optional[bool] = None
    monitoringpflicht: Optional[bool] = None
    monitoringintervall_tage: Optional[int] = None
    haccp_ccp_temperatur: Optional[bool] = None
    haccp_ccp_magnetabscheider: Optional[bool] = None
    haccp_ccp_siebung: Optional[bool] = None
    ccp_messwerte: Optional[Dict[str, Any]] = None
    vorgaenger_chargen: Optional[List[int]] = None

# QS-Futtermittelcharge für die Rückgabe
class QSFuttermittelChargeResponse(QSFuttermittelChargeBase):
    id: int
    charge_id: int
    erstellt_am: datetime
    geaendert_am: Optional[datetime] = None
    rohstoffe: List[RohstoffResponse] = []
    monitoring: List[MonitoringResponse] = []
    ereignisse: List[EreignisResponse] = []

    class Config:
        orm_mode = True

# Filterparameter für die Suche nach QS-Futtermittelchargen
class QSFuttermittelChargeFilter(BaseModel):
    qs_status: Optional[QSStatus] = None
    herstellungsdatum_von: Optional[datetime] = None
    herstellungsdatum_bis: Optional[datetime] = None
    ist_spuelcharge: Optional[bool] = None
    monitoringpflicht: Optional[bool] = None
    kunde_id: Optional[int] = None
    produktbezeichnung: Optional[str] = None

# Antwort für Listenergebnisse mit Paginierung
class PaginatedResponse(BaseModel):
    items: List[Any]
    total: int
    page: int
    page_size: int
    total_pages: int

# API-Endpunkte für QS-Futtermittelchargen

async def get_qs_futtermittel_chargen(
    session,
    page: int = 1, 
    page_size: int = 20,
    qs_status: Optional[QSStatus] = None,
    herstellungsdatum_von: Optional[datetime] = None,
    herstellungsdatum_bis: Optional[datetime] = None,
    ist_spuelcharge: Optional[bool] = None,
    monitoringpflicht: Optional[bool] = None,
    kunde_id: Optional[int] = None,
    produktbezeichnung: Optional[str] = None
) -> JSONResponse:
    """
    Liefert eine paginierte Liste von QS-Futtermittelchargen zurück.
    Unterstützt Filter für verschiedene Attribute.
    """
    try:
        # Basis-Query
        query = session.query(QSFuttermittelCharge)
        
        # Filter anwenden
        if qs_status:
            query = query.filter(QSFuttermittelCharge.qs_status == qs_status)
        if herstellungsdatum_von:
            query = query.filter(QSFuttermittelCharge.herstellungsdatum >= herstellungsdatum_von)
        if herstellungsdatum_bis:
            query = query.filter(QSFuttermittelCharge.herstellungsdatum <= herstellungsdatum_bis)
        if ist_spuelcharge is not None:
            query = query.filter(QSFuttermittelCharge.ist_spuelcharge == ist_spuelcharge)
        if monitoringpflicht is not None:
            query = query.filter(QSFuttermittelCharge.monitoringpflicht == monitoringpflicht)
        if kunde_id:
            query = query.filter(QSFuttermittelCharge.kunde_id == kunde_id)
        if produktbezeichnung:
            query = query.filter(QSFuttermittelCharge.produktbezeichnung.ilike(f"%{produktbezeichnung}%"))
            
        # Gesamtzahl der Ergebnisse
        total = query.count()
        
        # Paginierung
        query = query.order_by(QSFuttermittelCharge.herstellungsdatum.desc())
        query = query.offset((page - 1) * page_size).limit(page_size)
        
        # Ergebnisse abfragen mit zugehörigen Beziehungen
        chargen = query.all()
        
        # Ergebnisse formatieren
        charge_data = []
        for charge in chargen:
            charge_dict = {
                "id": charge.id,
                "charge_id": charge.charge_id,
                "produktbezeichnung": charge.produktbezeichnung,
                "herstellungsdatum": charge.herstellungsdatum,
                "mindesthaltbarkeitsdatum": charge.mindesthaltbarkeitsdatum,
                "qs_status": charge.qs_status.value,
                "mischzeit": charge.mischzeit,
                "mahlzeit": charge.mahlzeit,
                "mischtemperatur": charge.mischtemperatur,
                "feuchtigkeit": charge.feuchtigkeit,
                "bediener_id": charge.bediener_id,
                "qualitaetsverantwortlicher_id": charge.qualitaetsverantwortlicher_id,
                "kunde_id": charge.kunde_id,
                "ist_spuelcharge": charge.ist_spuelcharge,
                "nach_kritischem_material": charge.nach_kritischem_material,
                "qs_freigabe_datum": charge.qs_freigabe_datum,
                "qs_freigabe_durch_id": charge.qs_freigabe_durch_id,
                "qs_kennzeichnung_vollstaendig": charge.qs_kennzeichnung_vollstaendig,
                "qs_dokumentation_vollstaendig": charge.qs_dokumentation_vollstaendig,
                "monitoringpflicht": charge.monitoringpflicht,
                "monitoringintervall_tage": charge.monitoringintervall_tage,
                "haccp_ccp_temperatur": charge.haccp_ccp_temperatur,
                "haccp_ccp_magnetabscheider": charge.haccp_ccp_magnetabscheider,
                "haccp_ccp_siebung": charge.haccp_ccp_siebung,
                "ccp_messwerte": charge.ccp_messwerte,
                "vorgaenger_chargen": charge.vorgaenger_chargen,
                "erstellt_am": charge.erstellt_am,
                "geaendert_am": charge.geaendert_am,
                "rohstoffe": [],
                "monitoring": [],
                "ereignisse": []
            }
            
            # Rohstoffe hinzufügen
            for rohstoff in charge.rohstoffe:
                rohstoff_dict = {
                    "id": rohstoff.id,
                    "charge_id": rohstoff.charge_id,
                    "rohstoff_charge_id": rohstoff.rohstoff_charge_id,
                    "rohstoff_typ": rohstoff.rohstoff_typ.value,
                    "menge": rohstoff.menge,
                    "einheit_id": rohstoff.einheit_id,
                    "anteil": rohstoff.anteil,
                    "lieferant_id": rohstoff.lieferant_id,
                    "lieferant_chargen_nr": rohstoff.lieferant_chargen_nr,
                    "kontaminationsrisiko": rohstoff.kontaminationsrisiko.value,
                    "qs_zertifiziert": rohstoff.qs_zertifiziert,
                    "zertifikat_nr": rohstoff.zertifikat_nr,
                    "mischposition": rohstoff.mischposition,
                    "erstellt_am": rohstoff.erstellt_am
                }
                charge_dict["rohstoffe"].append(rohstoff_dict)
            
            # Monitoring hinzufügen
            for monitoring in charge.monitoring:
                monitoring_dict = {
                    "id": monitoring.id,
                    "charge_id": monitoring.charge_id,
                    "proben_id": monitoring.proben_id,
                    "status": monitoring.status.value,
                    "probentyp": monitoring.probentyp,
                    "entnahme_datum": monitoring.entnahme_datum,
                    "entnommen_durch_id": monitoring.entnommen_durch_id,
                    "labor_id": monitoring.labor_id,
                    "labor_eingang_datum": monitoring.labor_eingang_datum,
                    "ergebnis_datum": monitoring.ergebnis_datum,
                    "ergebnis_werte": monitoring.ergebnis_werte,
                    "grenzwert_eingehalten": monitoring.grenzwert_eingehalten,
                    "bemerkung": monitoring.bemerkung,
                    "erstellt_am": monitoring.erstellt_am,
                    "geaendert_am": monitoring.geaendert_am
                }
                charge_dict["monitoring"].append(monitoring_dict)
            
            # Ereignisse hinzufügen
            for ereignis in charge.ereignisse:
                ereignis_dict = {
                    "id": ereignis.id,
                    "charge_id": ereignis.charge_id,
                    "ereignis_typ": ereignis.ereignis_typ.value,
                    "titel": ereignis.titel,
                    "beschreibung": ereignis.beschreibung,
                    "prioritaet": ereignis.prioritaet.value,
                    "ereignis_datum": ereignis.ereignis_datum,
                    "faellig_bis": ereignis.faellig_bis,
                    "abgeschlossen_am": ereignis.abgeschlossen_am,
                    "ist_abgeschlossen": ereignis.ist_abgeschlossen,
                    "ist_bearbeitet": ereignis.ist_bearbeitet,
                    "erstellt_von_id": ereignis.erstellt_von_id,
                    "zugewiesen_an_id": ereignis.zugewiesen_an_id,
                    "abgeschlossen_von_id": ereignis.abgeschlossen_von_id,
                    "massnahmen": ereignis.massnahmen,
                    "nachfolgemassnahmen": ereignis.nachfolgemassnahmen,
                    "erstellt_am": ereignis.erstellt_am,
                    "geaendert_am": ereignis.geaendert_am
                }
                charge_dict["ereignisse"].append(ereignis_dict)
                
            charge_data.append(charge_dict)
        
        # Paginierte Antwort erstellen
        response_data = {
            "items": charge_data,
            "total": total,
            "page": page,
            "page_size": page_size,
            "total_pages": ceil(total / page_size) if total > 0 else 1
        }
        
        return JSONResponse(response_data)
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen von QS-Futtermittelchargen: {str(e)}")
        return JSONResponse(
            {"error": "Fehler beim Abrufen der QS-Futtermittelchargen", "details": str(e)},
            status_code=500
        )

async def get_qs_futtermittel_charge_by_id(session, charge_id: int) -> JSONResponse:
    """
    Liefert detaillierte Informationen zu einer bestimmten QS-Futtermittelcharge.
    """
    try:
        charge = session.query(QSFuttermittelCharge).filter(QSFuttermittelCharge.id == charge_id).first()
        
        if not charge:
            return JSONResponse(
                {"error": f"QS-Futtermittelcharge mit ID {charge_id} nicht gefunden"},
                status_code=404
            )
        
        # Charge-Daten aufbereiten
        charge_data = {
            "id": charge.id,
            "charge_id": charge.charge_id,
            "produktbezeichnung": charge.produktbezeichnung,
            "herstellungsdatum": charge.herstellungsdatum,
            "mindesthaltbarkeitsdatum": charge.mindesthaltbarkeitsdatum,
            "qs_status": charge.qs_status.value,
            "mischzeit": charge.mischzeit,
            "mahlzeit": charge.mahlzeit,
            "mischtemperatur": charge.mischtemperatur,
            "feuchtigkeit": charge.feuchtigkeit,
            "bediener_id": charge.bediener_id,
            "qualitaetsverantwortlicher_id": charge.qualitaetsverantwortlicher_id,
            "kunde_id": charge.kunde_id,
            "ist_spuelcharge": charge.ist_spuelcharge,
            "nach_kritischem_material": charge.nach_kritischem_material,
            "qs_freigabe_datum": charge.qs_freigabe_datum,
            "qs_freigabe_durch_id": charge.qs_freigabe_durch_id,
            "qs_kennzeichnung_vollstaendig": charge.qs_kennzeichnung_vollstaendig,
            "qs_dokumentation_vollstaendig": charge.qs_dokumentation_vollstaendig,
            "monitoringpflicht": charge.monitoringpflicht,
            "monitoringintervall_tage": charge.monitoringintervall_tage,
            "haccp_ccp_temperatur": charge.haccp_ccp_temperatur,
            "haccp_ccp_magnetabscheider": charge.haccp_ccp_magnetabscheider,
            "haccp_ccp_siebung": charge.haccp_ccp_siebung,
            "ccp_messwerte": charge.ccp_messwerte,
            "vorgaenger_chargen": charge.vorgaenger_chargen,
            "erstellt_am": charge.erstellt_am,
            "geaendert_am": charge.geaendert_am,
            "rohstoffe": [],
            "monitoring": [],
            "ereignisse": []
        }
        
        # Rohstoffe hinzufügen
        for rohstoff in charge.rohstoffe:
            rohstoff_dict = {
                "id": rohstoff.id,
                "charge_id": rohstoff.charge_id,
                "rohstoff_charge_id": rohstoff.rohstoff_charge_id,
                "rohstoff_typ": rohstoff.rohstoff_typ.value,
                "menge": rohstoff.menge,
                "einheit_id": rohstoff.einheit_id,
                "anteil": rohstoff.anteil,
                "lieferant_id": rohstoff.lieferant_id,
                "lieferant_chargen_nr": rohstoff.lieferant_chargen_nr,
                "kontaminationsrisiko": rohstoff.kontaminationsrisiko.value,
                "qs_zertifiziert": rohstoff.qs_zertifiziert,
                "zertifikat_nr": rohstoff.zertifikat_nr,
                "mischposition": rohstoff.mischposition,
                "erstellt_am": rohstoff.erstellt_am
            }
            charge_data["rohstoffe"].append(rohstoff_dict)
        
        # Monitoring hinzufügen
        for monitoring in charge.monitoring:
            monitoring_dict = {
                "id": monitoring.id,
                "charge_id": monitoring.charge_id,
                "proben_id": monitoring.proben_id,
                "status": monitoring.status.value,
                "probentyp": monitoring.probentyp,
                "entnahme_datum": monitoring.entnahme_datum,
                "entnommen_durch_id": monitoring.entnommen_durch_id,
                "labor_id": monitoring.labor_id,
                "labor_eingang_datum": monitoring.labor_eingang_datum,
                "ergebnis_datum": monitoring.ergebnis_datum,
                "ergebnis_werte": monitoring.ergebnis_werte,
                "grenzwert_eingehalten": monitoring.grenzwert_eingehalten,
                "bemerkung": monitoring.bemerkung,
                "erstellt_am": monitoring.erstellt_am,
                "geaendert_am": monitoring.geaendert_am
            }
            charge_data["monitoring"].append(monitoring_dict)
        
        # Ereignisse hinzufügen
        for ereignis in charge.ereignisse:
            ereignis_dict = {
                "id": ereignis.id,
                "charge_id": ereignis.charge_id,
                "ereignis_typ": ereignis.ereignis_typ.value,
                "titel": ereignis.titel,
                "beschreibung": ereignis.beschreibung,
                "prioritaet": ereignis.prioritaet.value,
                "ereignis_datum": ereignis.ereignis_datum,
                "faellig_bis": ereignis.faellig_bis,
                "abgeschlossen_am": ereignis.abgeschlossen_am,
                "ist_abgeschlossen": ereignis.ist_abgeschlossen,
                "ist_bearbeitet": ereignis.ist_bearbeitet,
                "erstellt_von_id": ereignis.erstellt_von_id,
                "zugewiesen_an_id": ereignis.zugewiesen_an_id,
                "abgeschlossen_von_id": ereignis.abgeschlossen_von_id,
                "massnahmen": ereignis.massnahmen,
                "nachfolgemassnahmen": ereignis.nachfolgemassnahmen,
                "erstellt_am": ereignis.erstellt_am,
                "geaendert_am": ereignis.geaendert_am
            }
            charge_data["ereignisse"].append(ereignis_dict)
        
        return JSONResponse(charge_data)
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen der QS-Futtermittelcharge: {str(e)}")
        return JSONResponse(
            {"error": "Fehler beim Abrufen der QS-Futtermittelcharge", "details": str(e)},
            status_code=500
        )

async def create_qs_futtermittel_charge(session, charge_data: QSFuttermittelChargeCreate) -> JSONResponse:
    """
    Erstellt eine neue QS-Futtermittelcharge mit zugehörigen Rohstoffen.
    """
    try:
        # Prüfen, ob die Basischarge existiert
        basis_charge = session.query(Charge).filter(Charge.id == charge_data.charge_id).first()
        if not basis_charge:
            return JSONResponse(
                {"error": f"Basischarge mit ID {charge_data.charge_id} nicht gefunden"},
                status_code=404
            )
        
        # Prüfen, ob bereits eine QS-Futtermittelcharge für diese Charge existiert
        existing_charge = session.query(QSFuttermittelCharge).filter(
            QSFuttermittelCharge.charge_id == charge_data.charge_id
        ).first()
        if existing_charge:
            return JSONResponse(
                {"error": f"Es existiert bereits eine QS-Futtermittelcharge für die Charge mit ID {charge_data.charge_id}"},
                status_code=400
            )
        
        # Neue QS-Futtermittelcharge erstellen
        new_charge = QSFuttermittelCharge(
            charge_id=charge_data.charge_id,
            produktbezeichnung=charge_data.produktbezeichnung,
            herstellungsdatum=charge_data.herstellungsdatum,
            mindesthaltbarkeitsdatum=charge_data.mindesthaltbarkeitsdatum,
            qs_status=charge_data.qs_status,
            mischzeit=charge_data.mischzeit,
            mahlzeit=charge_data.mahlzeit,
            mischtemperatur=charge_data.mischtemperatur,
            feuchtigkeit=charge_data.feuchtigkeit,
            bediener_id=charge_data.bediener_id,
            qualitaetsverantwortlicher_id=charge_data.qualitaetsverantwortlicher_id,
            kunde_id=charge_data.kunde_id,
            ist_spuelcharge=charge_data.ist_spuelcharge,
            nach_kritischem_material=charge_data.nach_kritischem_material,
            qs_freigabe_datum=charge_data.qs_freigabe_datum,
            qs_freigabe_durch_id=charge_data.qs_freigabe_durch_id,
            qs_kennzeichnung_vollstaendig=charge_data.qs_kennzeichnung_vollstaendig,
            qs_dokumentation_vollstaendig=charge_data.qs_dokumentation_vollstaendig,
            monitoringpflicht=charge_data.monitoringpflicht,
            monitoringintervall_tage=charge_data.monitoringintervall_tage,
            haccp_ccp_temperatur=charge_data.haccp_ccp_temperatur,
            haccp_ccp_magnetabscheider=charge_data.haccp_ccp_magnetabscheider,
            haccp_ccp_siebung=charge_data.haccp_ccp_siebung,
            ccp_messwerte=charge_data.ccp_messwerte,
            vorgaenger_chargen=charge_data.vorgaenger_chargen,
            erstellt_am=datetime.now(timezone.utc)
        )
        
        session.add(new_charge)
        session.flush()  # Um die ID für die Rohstoffe zu erhalten
        
        # Rohstoffe hinzufügen
        for rohstoff_data in charge_data.rohstoffe:
            # Prüfen, ob die Rohstoff-Charge existiert
            rohstoff_charge = session.query(Charge).filter(Charge.id == rohstoff_data.rohstoff_charge_id).first()
            if not rohstoff_charge:
                return JSONResponse(
                    {"error": f"Rohstoff-Charge mit ID {rohstoff_data.rohstoff_charge_id} nicht gefunden"},
                    status_code=404
                )
            
            new_rohstoff = QSRohstoff(
                charge_id=new_charge.id,
                rohstoff_charge_id=rohstoff_data.rohstoff_charge_id,
                rohstoff_typ=rohstoff_data.rohstoff_typ,
                menge=rohstoff_data.menge,
                einheit_id=rohstoff_data.einheit_id,
                anteil=rohstoff_data.anteil,
                lieferant_id=rohstoff_data.lieferant_id,
                lieferant_chargen_nr=rohstoff_data.lieferant_chargen_nr,
                kontaminationsrisiko=rohstoff_data.kontaminationsrisiko,
                qs_zertifiziert=rohstoff_data.qs_zertifiziert,
                zertifikat_nr=rohstoff_data.zertifikat_nr,
                mischposition=rohstoff_data.mischposition,
                erstellt_am=datetime.now(timezone.utc)
            )
            session.add(new_rohstoff)
        
        session.commit()
        
        # Antwort vorbereiten
        response_data = {
            "id": new_charge.id,
            "charge_id": new_charge.charge_id,
            "produktbezeichnung": new_charge.produktbezeichnung,
            "herstellungsdatum": new_charge.herstellungsdatum,
            "message": "QS-Futtermittelcharge erfolgreich erstellt"
        }
        
        return JSONResponse(response_data, status_code=201)
        
    except Exception as e:
        session.rollback()
        logger.error(f"Fehler beim Erstellen der QS-Futtermittelcharge: {str(e)}")
        return JSONResponse(
            {"error": "Fehler beim Erstellen der QS-Futtermittelcharge", "details": str(e)},
            status_code=500
        )

async def update_qs_futtermittel_charge(session, charge_id: int, update_data: QSFuttermittelChargeUpdate) -> JSONResponse:
    """
    Aktualisiert eine bestehende QS-Futtermittelcharge.
    """
    try:
        # Charge suchen
        charge = session.query(QSFuttermittelCharge).filter(QSFuttermittelCharge.id == charge_id).first()
        
        if not charge:
            return JSONResponse(
                {"error": f"QS-Futtermittelcharge mit ID {charge_id} nicht gefunden"},
                status_code=404
            )
        
        # Charge aktualisieren
        update_dict = update_data.dict(exclude_unset=True)
        for key, value in update_dict.items():
            setattr(charge, key, value)
        
        charge.geaendert_am = datetime.now(timezone.utc)
        
        session.commit()
        
        return JSONResponse({
            "id": charge.id,
            "message": "QS-Futtermittelcharge erfolgreich aktualisiert"
        })
        
    except Exception as e:
        session.rollback()
        logger.error(f"Fehler beim Aktualisieren der QS-Futtermittelcharge: {str(e)}")
        return JSONResponse(
            {"error": "Fehler beim Aktualisieren der QS-Futtermittelcharge", "details": str(e)},
            status_code=500
        )

async def delete_qs_futtermittel_charge(session, charge_id: int) -> JSONResponse:
    """
    Löscht eine QS-Futtermittelcharge und alle zugehörigen Daten.
    """
    try:
        # Charge suchen
        charge = session.query(QSFuttermittelCharge).filter(QSFuttermittelCharge.id == charge_id).first()
        
        if not charge:
            return JSONResponse(
                {"error": f"QS-Futtermittelcharge mit ID {charge_id} nicht gefunden"},
                status_code=404
            )
        
        # Charge löschen (Kaskadenlöschung für Rohstoffe, Monitoring, Ereignisse durch ORM-Beziehungen)
        session.delete(charge)
        session.commit()
        
        return JSONResponse({
            "message": f"QS-Futtermittelcharge mit ID {charge_id} erfolgreich gelöscht"
        })
        
    except Exception as e:
        session.rollback()
        logger.error(f"Fehler beim Löschen der QS-Futtermittelcharge: {str(e)}")
        return JSONResponse(
            {"error": "Fehler beim Löschen der QS-Futtermittelcharge", "details": str(e)},
            status_code=500
        )

# Monitoring API-Endpunkte

async def add_monitoring(session, charge_id: int, monitoring_data: MonitoringCreate) -> JSONResponse:
    """
    Fügt einer QS-Futtermittelcharge ein neues Monitoring hinzu.
    """
    try:
        # Charge suchen
        charge = session.query(QSFuttermittelCharge).filter(QSFuttermittelCharge.id == charge_id).first()
        
        if not charge:
            return JSONResponse(
                {"error": f"QS-Futtermittelcharge mit ID {charge_id} nicht gefunden"},
                status_code=404
            )
        
        # Monitoring erstellen
        new_monitoring = QSMonitoring(
            charge_id=charge_id,
            proben_id=monitoring_data.proben_id,
            status=monitoring_data.status,
            probentyp=monitoring_data.probentyp,
            entnahme_datum=monitoring_data.entnahme_datum,
            entnommen_durch_id=monitoring_data.entnommen_durch_id,
            labor_id=monitoring_data.labor_id,
            labor_eingang_datum=monitoring_data.labor_eingang_datum,
            ergebnis_datum=monitoring_data.ergebnis_datum,
            ergebnis_werte=monitoring_data.ergebnis_werte,
            grenzwert_eingehalten=monitoring_data.grenzwert_eingehalten,
            bemerkung=monitoring_data.bemerkung,
            erstellt_am=datetime.now(timezone.utc)
        )
        
        session.add(new_monitoring)
        session.commit()
        
        # Monitoring-Daten aufbereiten
        monitoring_dict = {
            "id": new_monitoring.id,
            "charge_id": new_monitoring.charge_id,
            "proben_id": new_monitoring.proben_id,
            "status": new_monitoring.status.value,
            "probentyp": new_monitoring.probentyp,
            "entnahme_datum": new_monitoring.entnahme_datum,
            "entnommen_durch_id": new_monitoring.entnommen_durch_id,
            "labor_id": new_monitoring.labor_id,
            "labor_eingang_datum": new_monitoring.labor_eingang_datum,
            "ergebnis_datum": new_monitoring.ergebnis_datum,
            "ergebnis_werte": new_monitoring.ergebnis_werte,
            "grenzwert_eingehalten": new_monitoring.grenzwert_eingehalten,
            "bemerkung": new_monitoring.bemerkung,
            "erstellt_am": new_monitoring.erstellt_am,
            "geaendert_am": new_monitoring.geaendert_am,
            "message": "Monitoring erfolgreich erstellt"
        }
        
        return JSONResponse(monitoring_dict, status_code=201)
        
    except Exception as e:
        session.rollback()
        logger.error(f"Fehler beim Erstellen des Monitorings: {str(e)}")
        return JSONResponse(
            {"error": "Fehler beim Erstellen des Monitorings", "details": str(e)},
            status_code=500
        )

# Ereignis API-Endpunkte

async def add_ereignis(session, charge_id: int, ereignis_data: EreignisCreate) -> JSONResponse:
    """
    Fügt einer QS-Futtermittelcharge ein neues Ereignis hinzu.
    """
    try:
        # Charge suchen
        charge = session.query(QSFuttermittelCharge).filter(QSFuttermittelCharge.id == charge_id).first()
        
        if not charge:
            return JSONResponse(
                {"error": f"QS-Futtermittelcharge mit ID {charge_id} nicht gefunden"},
                status_code=404
            )
        
        # Ereignis erstellen
        new_ereignis = QSEreignis(
            charge_id=charge_id,
            ereignis_typ=ereignis_data.ereignis_typ,
            titel=ereignis_data.titel,
            beschreibung=ereignis_data.beschreibung,
            prioritaet=ereignis_data.prioritaet,
            ereignis_datum=ereignis_data.ereignis_datum,
            faellig_bis=ereignis_data.faellig_bis,
            ist_abgeschlossen=ereignis_data.ist_abgeschlossen,
            ist_bearbeitet=ereignis_data.ist_bearbeitet,
            erstellt_von_id=ereignis_data.erstellt_von_id,
            zugewiesen_an_id=ereignis_data.zugewiesen_an_id,
            massnahmen=ereignis_data.massnahmen,
            nachfolgemassnahmen=ereignis_data.nachfolgemassnahmen,
            erstellt_am=datetime.now(timezone.utc)
        )
        
        session.add(new_ereignis)
        session.commit()
        
        # Ereignis-Daten aufbereiten
        ereignis_dict = {
            "id": new_ereignis.id,
            "charge_id": new_ereignis.charge_id,
            "ereignis_typ": new_ereignis.ereignis_typ.value,
            "titel": new_ereignis.titel,
            "beschreibung": new_ereignis.beschreibung,
            "prioritaet": new_ereignis.prioritaet.value,
            "ereignis_datum": new_ereignis.ereignis_datum,
            "faellig_bis": new_ereignis.faellig_bis,
            "ist_abgeschlossen": new_ereignis.ist_abgeschlossen,
            "ist_bearbeitet": new_ereignis.ist_bearbeitet,
            "erstellt_von_id": new_ereignis.erstellt_von_id,
            "zugewiesen_an_id": new_ereignis.zugewiesen_an_id,
            "massnahmen": new_ereignis.massnahmen,
            "nachfolgemassnahmen": new_ereignis.nachfolgemassnahmen,
            "erstellt_am": new_ereignis.erstellt_am,
            "message": "Ereignis erfolgreich erstellt"
        }
        
        return JSONResponse(ereignis_dict, status_code=201)
        
    except Exception as e:
        session.rollback()
        logger.error(f"Fehler beim Erstellen des Ereignisses: {str(e)}")
        return JSONResponse(
            {"error": "Fehler beim Erstellen des Ereignisses", "details": str(e)},
            status_code=500
        )

async def add_benachrichtigung(session, ereignis_id: int, benachrichtigung_data: BenachrichtigungCreate) -> JSONResponse:
    """
    Fügt einem Ereignis eine neue Benachrichtigung hinzu.
    """
    try:
        # Ereignis suchen
        ereignis = session.query(QSEreignis).filter(QSEreignis.id == ereignis_id).first()
        
        if not ereignis:
            return JSONResponse(
                {"error": f"Ereignis mit ID {ereignis_id} nicht gefunden"},
                status_code=404
            )
        
        # Benachrichtigung erstellen
        new_benachrichtigung = QSBenachrichtigung(
            ereignis_id=ereignis_id,
            empfaenger_id=benachrichtigung_data.empfaenger_id,
            empfaenger_email=benachrichtigung_data.empfaenger_email,
            betreff=benachrichtigung_data.betreff,
            inhalt=benachrichtigung_data.inhalt,
            erstellt_am=datetime.now(timezone.utc)
        )
        
        session.add(new_benachrichtigung)
        session.commit()
        
        # Benachrichtigung-Daten aufbereiten
        benachrichtigung_dict = {
            "id": new_benachrichtigung.id,
            "ereignis_id": new_benachrichtigung.ereignis_id,
            "empfaenger_id": new_benachrichtigung.empfaenger_id,
            "empfaenger_email": new_benachrichtigung.empfaenger_email,
            "betreff": new_benachrichtigung.betreff,
            "inhalt": new_benachrichtigung.inhalt,
            "gesendet": new_benachrichtigung.gesendet,
            "gesendet_am": new_benachrichtigung.gesendet_am,
            "gelesen": new_benachrichtigung.gelesen,
            "gelesen_am": new_benachrichtigung.gelesen_am,
            "erstellt_am": new_benachrichtigung.erstellt_am,
            "message": "Benachrichtigung erfolgreich erstellt"
        }
        
        return JSONResponse(benachrichtigung_dict, status_code=201)
        
    except Exception as e:
        session.rollback()
        logger.error(f"Fehler beim Erstellen der Benachrichtigung: {str(e)}")
        return JSONResponse(
            {"error": "Fehler beim Erstellen der Benachrichtigung", "details": str(e)},
            status_code=500
        )

# Dokument API-Endpunkte

async def add_dokument(
    session,
    dokument_data: DokumentCreate,
    charge_id: Optional[int] = None,
    ereignis_id: Optional[int] = None,
    monitoring_id: Optional[int] = None
) -> JSONResponse:
    """
    Fügt ein neues Dokument hinzu und verknüpft es mit einer Charge, einem Ereignis oder einem Monitoring.
    """
    try:
        # Prüfen, ob mindestens eine Verknüpfung angegeben wurde
        if not any([charge_id, ereignis_id, monitoring_id]):
            return JSONResponse(
                {"error": "Es muss eine Verknüpfung zu einer Charge, einem Ereignis oder einem Monitoring angegeben werden"},
                status_code=400
            )
        
        # Wenn charge_id angegeben, prüfen ob Charge existiert
        if charge_id:
            charge = session.query(QSFuttermittelCharge).filter(QSFuttermittelCharge.id == charge_id).first()
            if not charge:
                return JSONResponse(
                    {"error": f"QS-Futtermittelcharge mit ID {charge_id} nicht gefunden"},
                    status_code=404
                )
        
        # Wenn ereignis_id angegeben, prüfen ob Ereignis existiert
        if ereignis_id:
            ereignis = session.query(QSEreignis).filter(QSEreignis.id == ereignis_id).first()
            if not ereignis:
                return JSONResponse(
                    {"error": f"Ereignis mit ID {ereignis_id} nicht gefunden"},
                    status_code=404
                )
        
        # Wenn monitoring_id angegeben, prüfen ob Monitoring existiert
        if monitoring_id:
            monitoring = session.query(QSMonitoring).filter(QSMonitoring.id == monitoring_id).first()
            if not monitoring:
                return JSONResponse(
                    {"error": f"Monitoring mit ID {monitoring_id} nicht gefunden"},
                    status_code=404
                )
        
        # Dokument erstellen
        new_dokument = QSDokument(
            charge_id=charge_id,
            ereignis_id=ereignis_id,
            monitoring_id=monitoring_id,
            titel=dokument_data.titel,
            beschreibung=dokument_data.beschreibung,
            dokument_typ=dokument_data.dokument_typ,
            dateiname=dokument_data.dateiname,
            dateipfad=dokument_data.dateipfad,
            mime_type=dokument_data.mime_type,
            erstellt_von_id=dokument_data.erstellt_von_id,
            erstellt_am=datetime.now(timezone.utc)
        )
        
        session.add(new_dokument)
        session.commit()
        
        # Dokument-Daten aufbereiten
        dokument_dict = {
            "id": new_dokument.id,
            "charge_id": new_dokument.charge_id,
            "ereignis_id": new_dokument.ereignis_id,
            "monitoring_id": new_dokument.monitoring_id,
            "titel": new_dokument.titel,
            "beschreibung": new_dokument.beschreibung,
            "dokument_typ": new_dokument.dokument_typ,
            "dateiname": new_dokument.dateiname,
            "dateipfad": new_dokument.dateipfad,
            "mime_type": new_dokument.mime_type,
            "erstellt_von_id": new_dokument.erstellt_von_id,
            "erstellt_am": new_dokument.erstellt_am,
            "message": "Dokument erfolgreich erstellt"
        }
        
        return JSONResponse(dokument_dict, status_code=201)
        
    except Exception as e:
        session.rollback()
        logger.error(f"Fehler beim Erstellen des Dokuments: {str(e)}")
        return JSONResponse(
            {"error": "Fehler beim Erstellen des Dokuments", "details": str(e)},
            status_code=500
        )

# QS-API Simulation

async def simulate_qs_api_lieferantenstatus(session, lieferanten_id: int) -> JSONResponse:
    """
    Simuliert einen Aufruf an die QS-API, um den Status eines Lieferanten abzufragen.
    """
    try:
        # Simulierte QS-API-Antwort
        status_data = {
            "lieferanten_id": lieferanten_id,
            "name": f"Lieferant {lieferanten_id}",
            "qs_status": "zugelassen",
            "zertifikat_nr": f"QS-{lieferanten_id}-{datetime.now().year}",
            "gueltigkeit": (datetime.now() + timedelta(days=365)).isoformat(),
            "risikokategorie": "niedrig",
            "letzte_pruefung": (datetime.now() - timedelta(days=30)).isoformat()
        }
        
        return JSONResponse(status_data)
        
    except Exception as e:
        logger.error(f"Fehler bei der QS-API-Simulation für Lieferantenstatus: {str(e)}")
        return JSONResponse(
            {"error": "Fehler bei der QS-API-Simulation", "details": str(e)},
            status_code=500
        )

async def simulate_qs_api_probenupload(session, monitoring_id: int) -> JSONResponse:
    """
    Simuliert einen Aufruf an die QS-API, um Probendaten zu übermitteln.
    """
    try:
        # Monitoring suchen
        monitoring = session.query(QSMonitoring).filter(QSMonitoring.id == monitoring_id).first()
        
        if not monitoring:
            return JSONResponse(
                {"error": f"Monitoring mit ID {monitoring_id} nicht gefunden"},
                status_code=404
            )
        
        # Simulierte QS-API-Antwort
        upload_data = {
            "monitoring_id": monitoring_id,
            "proben_id": monitoring.proben_id,
            "upload_status": "erfolgreich",
            "upload_zeitpunkt": datetime.now().isoformat(),
            "qs_referenz_nr": f"QS-REF-{monitoring_id}-{datetime.now().strftime('%Y%m%d%H%M%S')}",
            "nachricht": "Probendaten erfolgreich übermittelt"
        }
        
        return JSONResponse(upload_data)
        
    except Exception as e:
        logger.error(f"Fehler bei der QS-API-Simulation für Probenupload: {str(e)}")
        return JSONResponse(
            {"error": "Fehler bei der QS-API-Simulation", "details": str(e)},
            status_code=500
        )

# KI-Modul für Anomalieerkennung

async def analyze_charge_anomalies(session, charge_id: int) -> JSONResponse:
    """
    Analysiert eine Charge auf Anomalien basierend auf historischen Daten.
    """
    try:
        # Charge suchen
        charge = session.query(QSFuttermittelCharge).filter(QSFuttermittelCharge.id == charge_id).first()
        
        if not charge:
            return JSONResponse(
                {"error": f"QS-Futtermittelcharge mit ID {charge_id} nicht gefunden"},
                status_code=404
            )
        
        # Simulierte KI-Analyse
        # In einer realen Implementierung würde hier ein KI-Modell genutzt
        # und historische Daten analysiert werden
        
        # Beispiel-Ergebnis der Analyse
        analysis_result = {
            "charge_id": charge_id,
            "analysis_timestamp": datetime.now().isoformat(),
            "risk_score": 0.23,  # Beispielwert zwischen 0 und 1
            "anomalies_detected": False,
            "confidence": 0.87,  # Vertrauenswert der Analyse
            "insights": [
                {
                    "parameter": "Mischzeit",
                    "value": charge.mischzeit,
                    "historical_avg": 320,  # Beispielwert
                    "deviation": -0.05,  # Abweichung vom historischen Mittelwert in %
                    "is_anomaly": False
                },
                {
                    "parameter": "Feuchtigkeit",
                    "value": charge.feuchtigkeit,
                    "historical_avg": 14.2,  # Beispielwert
                    "deviation": 0.02,  # Abweichung vom historischen Mittelwert in %
                    "is_anomaly": False
                }
            ],
            "recommendations": [
                "Keine Anomalien erkannt, Charge entspricht den erwarteten Parametern."
            ]
        }
        
        return JSONResponse(analysis_result)
        
    except Exception as e:
        logger.error(f"Fehler bei der KI-Analyse der Charge: {str(e)}")
        return JSONResponse(
            {"error": "Fehler bei der KI-Analyse", "details": str(e)},
            status_code=500
        ) 