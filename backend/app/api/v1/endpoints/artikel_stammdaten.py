"""
API-Endpunkte für Artikel-Stammdaten.
Diese Endpunkte ermöglichen die Verwaltung von erweiterten Artikelstammdaten im ERP-System.
"""

from typing import List, Optional, Dict, Any
from fastapi import APIRouter, Depends, HTTPException, Body, Query, Path
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError
from datetime import datetime

try:
    from backend.app.dependencies import get_db
    from backend.app.schemas.artikel_stammdaten import (
        ArtikelStammdatenCreate, ArtikelStammdatenResponse, ArtikelStammdatenUpdate,
        AlternativeEinheitCreate, AlternativeEinheitResponse,
        VerkaufsPreisCreate, VerkaufsPreisResponse,
        ArtikelDokumentCreate, ArtikelDokumentResponse,
        ArtikelUnterlageCreate, ArtikelUnterlageResponse,
        ArtikelLagerbestandCreate, ArtikelLagerbestandResponse,
        ArtikelKontoCreate, ArtikelKontoResponse,
        KIErweiterungCreate, KIErweiterungResponse
    )
    from backend.app.models.artikel_stammdaten import (
        ArtikelStammdaten, AlternativeEinheit, VerkaufsPreis,
        ArtikelDokument, ArtikelUnterlage, ArtikelLagerbestand, ArtikelKonto,
        KIErweiterung, KIAlternative, SEOKeyword, AlternativArtikel
    )
    from backend.app.models.artikel import Artikel
    from backend.app.crud.artikel_stammdaten import (
        create_artikel_stammdaten, get_artikel_stammdaten, get_artikel_stammdaten_by_artikel_id,
        update_artikel_stammdaten, delete_artikel_stammdaten
    )
except ImportError:
    # Fallback: Vereinfachte Implementierung für Entwicklungszwecke
    from fastapi import Depends
    from sqlalchemy.orm import Session
    from backend.app.dependencies import get_db
    from backend.app.schemas.artikel_stammdaten import (
        ArtikelStammdatenCreate, ArtikelStammdatenResponse, ArtikelStammdatenUpdate,
        AlternativeEinheitCreate, AlternativeEinheitResponse,
        VerkaufsPreisCreate, VerkaufsPreisResponse,
        ArtikelDokumentCreate, ArtikelDokumentResponse,
        ArtikelUnterlageCreate, ArtikelUnterlageResponse,
        ArtikelLagerbestandCreate, ArtikelLagerbestandResponse,
        ArtikelKontoCreate, ArtikelKontoResponse,
        KIErweiterungCreate, KIErweiterungResponse
    )
    from backend.app.models.artikel_stammdaten import (
        ArtikelStammdaten, AlternativeEinheit, VerkaufsPreis,
        ArtikelDokument, ArtikelUnterlage, ArtikelLagerbestand, ArtikelKonto,
        KIErweiterung, KIAlternative, SEOKeyword, AlternativArtikel
    )
    from backend.app.models.artikel import Artikel

router = APIRouter()

# Artikel-Stammdaten-Endpunkte
@router.post("/", response_model=ArtikelStammdatenResponse)
def create_stammdaten(
    stammdaten: ArtikelStammdatenCreate,
    db: Session = Depends(get_db)
):
    """
    Erstellt erweiterte Stammdaten für einen Artikel.
    """
    try:
        # Prüfen, ob der Artikel existiert
        artikel = db.query(Artikel).filter(Artikel.id == stammdaten.artikel_id).first()
        if not artikel:
            raise HTTPException(status_code=404, detail=f"Artikel mit ID {stammdaten.artikel_id} nicht gefunden")
        
        # Prüfen, ob bereits Stammdaten für diesen Artikel existieren
        existing = db.query(ArtikelStammdaten).filter(ArtikelStammdaten.artikel_id == stammdaten.artikel_id).first()
        if existing:
            raise HTTPException(status_code=400, detail=f"Für Artikel {stammdaten.artikel_id} existieren bereits Stammdaten")
        
        # Objekt für Datenbank erstellen
        db_stammdaten = ArtikelStammdaten(
            artikel_id=stammdaten.artikel_id,
            kurztext=stammdaten.kurztext,
            zweite_matchcode=stammdaten.zweite_matchcode,
            artikel_art=stammdaten.artikel_art,
            artikel_gruppe=stammdaten.artikel_gruppe,
            artikel_gesperrt=stammdaten.artikel_gesperrt,
            druck_beschreibung=stammdaten.druck_beschreibung.dict() if stammdaten.druck_beschreibung else {},
            anzeigeoptionen=stammdaten.anzeigeoptionen.dict() if stammdaten.anzeigeoptionen else {},
            mengen_einheit=stammdaten.mengen_einheit,
            gewicht=stammdaten.gewicht,
            hilfsgewicht=stammdaten.hilfsgewicht,
            preis_je=stammdaten.preis_je,
            verpackungseinheit=stammdaten.verpackungseinheit,
            verpackung=stammdaten.verpackung,
            gebinde=stammdaten.gebinde.dict() if stammdaten.gebinde else {},
            steuer=stammdaten.steuer.dict() if stammdaten.steuer else {},
            haupt_artikel_id=stammdaten.haupt_artikel_id,
            ean_code=stammdaten.ean_code,
            ean_code_einheit=stammdaten.ean_code_einheit,
            interner_code=stammdaten.interner_code,
            sichtbarkeit_webshop=stammdaten.sichtbarkeit_webshop,
            etiketten_druck=stammdaten.etiketten_druck,
            mhd_kennzeichnung=stammdaten.mhd_kennzeichnung,
            empfohlener_vk=stammdaten.empfohlener_vk,
            einkaufspreis=stammdaten.einkaufspreis,
            kalkulatorischer_ek=stammdaten.kalkulatorischer_ek,
            rabatt_gruppe=stammdaten.rabatt_gruppe,
            konditionen=stammdaten.konditionen,
            umsatz_trend=stammdaten.umsatz_trend,
            durchschnittlicher_absatz=stammdaten.durchschnittlicher_absatz,
            gefahrgut_klasse=stammdaten.gefahrgut_klasse,
            gefahrgut_nummer=stammdaten.gefahrgut_nummer,
            gefahrgut_beschreibung=stammdaten.gefahrgut_beschreibung,
            ruecknahme_erlaubt=stammdaten.ruecknahme_erlaubt,
            mhd_pflicht=stammdaten.mhd_pflicht,
            toleranz_menge=stammdaten.toleranz_menge,
            kasse_sonderbehandlung=stammdaten.kasse_sonderbehandlung,
            commission=stammdaten.commission,
            etikett_info=stammdaten.etikett_info,
            erstellt_am=datetime.now()
        )
        
        # Speichern des Basis-Objekts
        db.add(db_stammdaten)
        db.flush()  # Flush, um die ID für Beziehungen zu haben
        
        # Alternative Einheiten hinzufügen, falls vorhanden
        if stammdaten.alternative_einheiten:
            for einheit_data in stammdaten.alternative_einheiten:
                einheit = AlternativeEinheit(
                    stammdaten_id=db_stammdaten.id,
                    einheit=einheit_data.einheit,
                    umrechnung=einheit_data.umrechnung,
                    einheit_runden=einheit_data.einheit_runden
                )
                db.add(einheit)
        
        # Verkaufspreise hinzufügen, falls vorhanden
        if stammdaten.verkaufspreise:
            for preis_data in stammdaten.verkaufspreise:
                preis = VerkaufsPreis(
                    stammdaten_id=db_stammdaten.id,
                    tabellen_bezeichnung=preis_data.tabellen_bezeichnung,
                    gueltig_von=preis_data.gueltig_von,
                    gueltig_bis=preis_data.gueltig_bis,
                    basis_preiseinheit=preis_data.basis_preiseinheit,
                    preis_ab_menge=preis_data.preis_ab_menge,
                    brutto=preis_data.brutto,
                    netto=preis_data.netto,
                    mwst=preis_data.mwst
                )
                db.add(preis)
        
        # Dokumente hinzufügen, falls vorhanden
        if stammdaten.dokumente:
            for dok_data in stammdaten.dokumente:
                dok = ArtikelDokument(
                    stammdaten_id=db_stammdaten.id,
                    dateiname=dok_data.dateiname,
                    dateityp=dok_data.dateityp,
                    ablage_kategorie=dok_data.ablage_kategorie,
                    gueltig_ab=dok_data.gueltig_ab,
                    gueltig_bis=dok_data.gueltig_bis
                )
                db.add(dok)
        
        # Unterlagen hinzufügen, falls vorhanden
        if stammdaten.unterlagen:
            for ul_data in stammdaten.unterlagen:
                ul = ArtikelUnterlage(
                    stammdaten_id=db_stammdaten.id,
                    bezeichnung=ul_data.bezeichnung,
                    angelegt_am=ul_data.angelegt_am,
                    gueltig_ab=ul_data.gueltig_ab,
                    gueltig_bis=ul_data.gueltig_bis,
                    bediener=ul_data.bediener,
                    anzahl_seiten=ul_data.anzahl_seiten,
                    kategorie=ul_data.kategorie
                )
                db.add(ul)
        
        # Lagerbestände hinzufügen, falls vorhanden
        if stammdaten.lagerbestaende:
            for lb_data in stammdaten.lagerbestaende:
                lb = ArtikelLagerbestand(
                    stammdaten_id=db_stammdaten.id,
                    lagerort=lb_data.lagerort,
                    buch_bestand=lb_data.buch_bestand,
                    lager_bewertung=lb_data.lager_bewertung,
                    letzte_bewegung=lb_data.letzte_bewegung
                )
                db.add(lb)
        
        # Konten hinzufügen, falls vorhanden
        if stammdaten.artikel_konten:
            for konto_data in stammdaten.artikel_konten:
                konto = ArtikelKonto(
                    stammdaten_id=db_stammdaten.id,
                    beginn_datum=konto_data.beginn_datum,
                    buchungsdatum=konto_data.buchungsdatum,
                    verkaeufe=konto_data.verkaeufe,
                    einkaeufe=konto_data.einkaeufe
                )
                db.add(konto)
        
        # KI-Erweiterungen hinzufügen, falls vorhanden
        if stammdaten.ki_erweiterungen:
            ki_data = stammdaten.ki_erweiterungen
            ki = KIErweiterung(
                stammdaten_id=db_stammdaten.id,
                warengruppe_erkennung_ki=ki_data.warengruppe_erkennung_ki,
                klassifikation_confidence=ki_data.klassifikation_confidence,
                preis_vk_automatisch=ki_data.preis_vk_automatisch,
                preis_ek_automatisch=ki_data.preis_ek_automatisch,
                nachbestellung_prognose=ki_data.nachbestellung_prognose,
                beschreibung_gpt=ki_data.beschreibung_gpt,
                langtext_gpt=ki_data.langtext_gpt,
                auto_preis_update=ki_data.auto_preis_update,
                auto_lagerauffuellung=ki_data.auto_lagerauffuellung,
                auto_kundengruppenrabatt=ki_data.auto_kundengruppenrabatt,
                anomalie_erkannt=ki_data.anomalie_erkannt,
                letzter_check=ki_data.letzter_check,
                geprueft_von=ki_data.geprueft_von
            )
            db.add(ki)
            db.flush()  # Flush, um die ID für KI-Alternativen und Keywords zu haben
            
            # KI-Alternativen hinzufügen, falls vorhanden
            if ki_data.alternativen:
                for alt_data in ki_data.alternativen:
                    alt = KIAlternative(
                        ki_erweiterung_id=ki.id,
                        artikel_id=alt_data.artikel_id,
                        relevanz_score=alt_data.relevanz_score
                    )
                    db.add(alt)
            
            # SEO-Keywords hinzufügen, falls vorhanden
            if ki_data.seo_keywords:
                for kw_data in ki_data.seo_keywords:
                    kw = SEOKeyword(
                        ki_erweiterung_id=ki.id,
                        keyword=kw_data.keyword,
                        relevanz=kw_data.relevanz
                    )
                    db.add(kw)
        
        db.commit()
        db.refresh(db_stammdaten)
        return db_stammdaten
    
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Datenintegrität verletzt: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Erstellen der Stammdaten: {str(e)}")

@router.get("/", response_model=List[ArtikelStammdatenResponse])
def get_stammdaten_list(
    skip: int = 0,
    limit: int = 100,
    artikel_gruppe: Optional[str] = None,
    artikel_art: Optional[str] = None,
    ean_code: Optional[str] = None,
    nur_aktive: bool = True,
    db: Session = Depends(get_db)
):
    """
    Gibt eine Liste von Artikel-Stammdaten zurück.
    Kann nach Gruppe, Art und EAN-Code gefiltert werden.
    """
    query = db.query(ArtikelStammdaten)
    
    # Filter anwenden
    if artikel_gruppe:
        query = query.filter(ArtikelStammdaten.artikel_gruppe == artikel_gruppe)
    if artikel_art:
        query = query.filter(ArtikelStammdaten.artikel_art == artikel_art)
    if ean_code:
        query = query.filter(ArtikelStammdaten.ean_code == ean_code)
    if nur_aktive:
        query = query.filter(ArtikelStammdaten.artikel_gesperrt == False)
    
    # Paginierung anwenden
    stammdaten_list = query.offset(skip).limit(limit).all()
    return stammdaten_list

@router.get("/{stammdaten_id}", response_model=ArtikelStammdatenResponse)
def get_stammdaten_by_id(
    stammdaten_id: int = Path(..., title="Die ID des Stammdatensatzes"),
    db: Session = Depends(get_db)
):
    """
    Gibt einen Stammdatensatz anhand seiner ID zurück.
    """
    stammdaten = db.query(ArtikelStammdaten).filter(ArtikelStammdaten.id == stammdaten_id).first()
    if not stammdaten:
        raise HTTPException(status_code=404, detail=f"Stammdaten mit ID {stammdaten_id} nicht gefunden")
    return stammdaten

@router.get("/artikel/{artikel_id}", response_model=ArtikelStammdatenResponse)
def get_stammdaten_by_artikel_id(
    artikel_id: int = Path(..., title="Die ID des Artikels"),
    db: Session = Depends(get_db)
):
    """
    Gibt den Stammdatensatz für einen bestimmten Artikel zurück.
    """
    stammdaten = db.query(ArtikelStammdaten).filter(ArtikelStammdaten.artikel_id == artikel_id).first()
    if not stammdaten:
        raise HTTPException(status_code=404, detail=f"Stammdaten für Artikel {artikel_id} nicht gefunden")
    return stammdaten

@router.put("/{stammdaten_id}", response_model=ArtikelStammdatenResponse)
def update_stammdaten(
    stammdaten_id: int,
    stammdaten_update: ArtikelStammdatenUpdate,
    db: Session = Depends(get_db)
):
    """
    Aktualisiert einen Stammdatensatz.
    """
    db_stammdaten = db.query(ArtikelStammdaten).filter(ArtikelStammdaten.id == stammdaten_id).first()
    if not db_stammdaten:
        raise HTTPException(status_code=404, detail=f"Stammdaten mit ID {stammdaten_id} nicht gefunden")
    
    # Aktualisieren der Felder, die im Update-Objekt gesetzt sind
    update_data = stammdaten_update.dict(exclude_unset=True)
    
    # JSON-Felder separat behandeln
    for key, value in update_data.items():
        if key in ["druck_beschreibung", "anzeigeoptionen", "gebinde", "steuer"] and value is not None:
            setattr(db_stammdaten, key, value.dict())
        else:
            setattr(db_stammdaten, key, value)
    
    # Aktualisierungsdatum setzen
    db_stammdaten.geaendert_am = datetime.now()
    
    try:
        db.commit()
        db.refresh(db_stammdaten)
        return db_stammdaten
    except IntegrityError as e:
        db.rollback()
        raise HTTPException(status_code=400, detail=f"Datenintegrität verletzt: {str(e)}")
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Aktualisieren der Stammdaten: {str(e)}")

@router.delete("/{stammdaten_id}", status_code=204)
def delete_stammdaten(
    stammdaten_id: int,
    db: Session = Depends(get_db)
):
    """
    Löscht einen Stammdatensatz.
    """
    db_stammdaten = db.query(ArtikelStammdaten).filter(ArtikelStammdaten.id == stammdaten_id).first()
    if not db_stammdaten:
        raise HTTPException(status_code=404, detail=f"Stammdaten mit ID {stammdaten_id} nicht gefunden")
    
    try:
        db.delete(db_stammdaten)
        db.commit()
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Löschen der Stammdaten: {str(e)}")

# Einheiten-Endpunkte
@router.post("/{stammdaten_id}/einheiten", response_model=AlternativeEinheitResponse)
def add_alternative_einheit(
    stammdaten_id: int,
    einheit: AlternativeEinheitCreate,
    db: Session = Depends(get_db)
):
    """
    Fügt eine alternative Einheit zu einem Stammdatensatz hinzu.
    """
    db_stammdaten = db.query(ArtikelStammdaten).filter(ArtikelStammdaten.id == stammdaten_id).first()
    if not db_stammdaten:
        raise HTTPException(status_code=404, detail=f"Stammdaten mit ID {stammdaten_id} nicht gefunden")
    
    db_einheit = AlternativeEinheit(
        stammdaten_id=stammdaten_id,
        einheit=einheit.einheit,
        umrechnung=einheit.umrechnung,
        einheit_runden=einheit.einheit_runden
    )
    
    try:
        db.add(db_einheit)
        db.commit()
        db.refresh(db_einheit)
        return db_einheit
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Hinzufügen der Einheit: {str(e)}")

# Verkaufspreis-Endpunkte
@router.post("/{stammdaten_id}/preise", response_model=VerkaufsPreisResponse)
def add_verkaufspreis(
    stammdaten_id: int,
    preis: VerkaufsPreisCreate,
    db: Session = Depends(get_db)
):
    """
    Fügt einen Verkaufspreis zu einem Stammdatensatz hinzu.
    """
    db_stammdaten = db.query(ArtikelStammdaten).filter(ArtikelStammdaten.id == stammdaten_id).first()
    if not db_stammdaten:
        raise HTTPException(status_code=404, detail=f"Stammdaten mit ID {stammdaten_id} nicht gefunden")
    
    db_preis = VerkaufsPreis(
        stammdaten_id=stammdaten_id,
        tabellen_bezeichnung=preis.tabellen_bezeichnung,
        gueltig_von=preis.gueltig_von,
        gueltig_bis=preis.gueltig_bis,
        basis_preiseinheit=preis.basis_preiseinheit,
        preis_ab_menge=preis.preis_ab_menge,
        brutto=preis.brutto,
        netto=preis.netto,
        mwst=preis.mwst
    )
    
    try:
        db.add(db_preis)
        db.commit()
        db.refresh(db_preis)
        return db_preis
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Hinzufügen des Verkaufspreises: {str(e)}")

# KI-Erweiterungs-Endpunkte
@router.post("/{stammdaten_id}/ki", response_model=KIErweiterungResponse)
def create_ki_erweiterung(
    stammdaten_id: int,
    ki_erweiterung: KIErweiterungCreate,
    db: Session = Depends(get_db)
):
    """
    Erstellt oder aktualisiert KI-Erweiterungen für einen Stammdatensatz.
    """
    db_stammdaten = db.query(ArtikelStammdaten).filter(ArtikelStammdaten.id == stammdaten_id).first()
    if not db_stammdaten:
        raise HTTPException(status_code=404, detail=f"Stammdaten mit ID {stammdaten_id} nicht gefunden")
    
    # Prüfen, ob bereits eine KI-Erweiterung existiert
    existing_ki = db.query(KIErweiterung).filter(KIErweiterung.stammdaten_id == stammdaten_id).first()
    if existing_ki:
        # Aktualisieren der bestehenden KI-Erweiterung
        for key, value in ki_erweiterung.dict(exclude={"alternativen", "seo_keywords"}).items():
            setattr(existing_ki, key, value)
        db_ki = existing_ki
    else:
        # Neue KI-Erweiterung erstellen
        db_ki = KIErweiterung(
            stammdaten_id=stammdaten_id,
            **ki_erweiterung.dict(exclude={"alternativen", "seo_keywords"})
        )
        db.add(db_ki)
    
    db.flush()  # Flush, um die ID für Beziehungen zu haben
    
    # KI-Alternativen hinzufügen oder aktualisieren
    if ki_erweiterung.alternativen:
        # Bestehende entfernen
        db.query(KIAlternative).filter(KIAlternative.ki_erweiterung_id == db_ki.id).delete()
        # Neue hinzufügen
        for alt_data in ki_erweiterung.alternativen:
            alt = KIAlternative(
                ki_erweiterung_id=db_ki.id,
                artikel_id=alt_data.artikel_id,
                relevanz_score=alt_data.relevanz_score
            )
            db.add(alt)
    
    # SEO-Keywords hinzufügen oder aktualisieren
    if ki_erweiterung.seo_keywords:
        # Bestehende entfernen
        db.query(SEOKeyword).filter(SEOKeyword.ki_erweiterung_id == db_ki.id).delete()
        # Neue hinzufügen
        for kw_data in ki_erweiterung.seo_keywords:
            kw = SEOKeyword(
                ki_erweiterung_id=db_ki.id,
                keyword=kw_data.keyword,
                relevanz=kw_data.relevanz
            )
            db.add(kw)
    
    try:
        db.commit()
        db.refresh(db_ki)
        return db_ki
    except Exception as e:
        db.rollback()
        raise HTTPException(status_code=500, detail=f"Fehler beim Erstellen/Aktualisieren der KI-Erweiterung: {str(e)}")

# KI-Analysen
@router.post("/{stammdaten_id}/ki/analyze", response_model=Dict[str, Any])
def analyze_with_ki(
    stammdaten_id: int,
    analysis_type: str = Query(..., description="Typ der Analyse: 'preisempfehlung', 'beschreibung', 'klassifikation'"),
    db: Session = Depends(get_db)
):
    """
    Führt eine KI-Analyse für den Artikel durch und gibt Ergebnisse zurück.
    Die Ergebnisse werden nicht gespeichert, sondern nur zurückgegeben.
    """
    db_stammdaten = db.query(ArtikelStammdaten).filter(ArtikelStammdaten.id == stammdaten_id).first()
    if not db_stammdaten:
        raise HTTPException(status_code=404, detail=f"Stammdaten mit ID {stammdaten_id} nicht gefunden")
    
    # Artikel-Informationen laden
    artikel = db.query(Artikel).filter(Artikel.id == db_stammdaten.artikel_id).first()
    if not artikel:
        raise HTTPException(status_code=404, detail=f"Artikel mit ID {db_stammdaten.artikel_id} nicht gefunden")
    
    # Hier würde in einer echten Implementierung ein KI-Service aufgerufen werden
    # Für diese Implementierung geben wir simulierte Ergebnisse zurück
    
    if analysis_type == "preisempfehlung":
        return {
            "empfohlener_vk": 29.99,
            "marktvergleich": 32.50,
            "confidence": 0.85,
            "begründung": "Basierend auf aktuellen Marktdaten und Ihren Einkaufskonditionen"
        }
    elif analysis_type == "beschreibung":
        return {
            "kurztext": f"Optimierter {artikel.bezeichnung}",
            "langtext": f"Qualitativ hochwertiger {artikel.bezeichnung} für vielfältige Anwendungen. Zeichnet sich durch hohe Langlebigkeit und einfache Handhabung aus.",
            "seo_keywords": ["qualität", "langlebig", "anwendungsfreundlich"],
            "confidence": 0.92
        }
    elif analysis_type == "klassifikation":
        return {
            "vorgeschlagene_gruppe": "Werkzeuge",
            "vorgeschlagene_art": "Handwerkzeug",
            "alternativen": ["Heimwerkerbedarf", "Bauwerkzeuge"],
            "confidence": 0.78
        }
    else:
        raise HTTPException(status_code=400, detail=f"Unbekannter Analysetyp: {analysis_type}") 