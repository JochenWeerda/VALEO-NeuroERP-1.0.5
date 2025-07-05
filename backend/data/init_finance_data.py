"""
Initialisiert die Finanzdaten in der Datenbank.
Lädt den standardisierten Kontenplan, Steuersätze, etc.
"""

import logging
from datetime import datetime, date
from sqlalchemy.orm import Session
from sqlalchemy.exc import IntegrityError

# Import der Modelle und Standarddaten
try:
    from app.models.finanzen import Konto, Steuersatz, Geschaeftsjahr, Kostenstelle
    from data.kontenplan import (
        STANDARD_KONTENPLAN,
        STANDARD_STEUERSAETZE,
        STANDARD_GESCHAEFTSJAHR,
        STANDARD_KOSTENSTELLEN
    )
except ImportError:
    # Alternativer Import-Pfad
    from backend.app.models.finanzen import Konto, Steuersatz, Geschaeftsjahr, Kostenstelle
    from backend.data.kontenplan import (
        STANDARD_KONTENPLAN,
        STANDARD_STEUERSAETZE,
        STANDARD_GESCHAEFTSJAHR,
        STANDARD_KOSTENSTELLEN
    )

logger = logging.getLogger(__name__)


def init_kontenplan(db: Session) -> None:
    """
    Initialisiert den Standardkontenplan in der Datenbank.
    """
    logger.info("Initialisiere Kontenplan...")
    
    konten_count = db.query(Konto).count()
    if konten_count > 0:
        logger.info(f"Kontenplan bereits initialisiert. {konten_count} Konten vorhanden.")
        return
    
    for konto_data in STANDARD_KONTENPLAN:
        db_konto = Konto(
            kontonummer=konto_data["kontonummer"],
            bezeichnung=konto_data["bezeichnung"],
            typ=konto_data["typ"],
            saldo=0.0,
            waehrung="EUR",
            ist_aktiv=True,
            erstellt_am=datetime.utcnow(),
            aktualisiert_am=datetime.utcnow()
        )
        db.add(db_konto)
    
    try:
        db.commit()
        logger.info(f"Kontenplan erfolgreich initialisiert. {len(STANDARD_KONTENPLAN)} Konten angelegt.")
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Fehler beim Initialisieren des Kontenplans: {str(e)}")


def init_steuersaetze(db: Session) -> None:
    """
    Initialisiert die Standardsteuersätze in der Datenbank.
    """
    logger.info("Initialisiere Steuersätze...")
    
    steuersaetze_count = db.query(Steuersatz).count()
    if steuersaetze_count > 0:
        logger.info(f"Steuersätze bereits initialisiert. {steuersaetze_count} Steuersätze vorhanden.")
        return
    
    for satz_data in STANDARD_STEUERSAETZE:
        db_satz = Steuersatz(
            bezeichnung=satz_data["bezeichnung"],
            prozentsatz=satz_data["prozentsatz"],
            ist_aktiv=satz_data["ist_aktiv"],
            erstellt_am=datetime.utcnow(),
            aktualisiert_am=datetime.utcnow()
        )
        db.add(db_satz)
    
    try:
        db.commit()
        logger.info(f"Steuersätze erfolgreich initialisiert. {len(STANDARD_STEUERSAETZE)} Steuersätze angelegt.")
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Fehler beim Initialisieren der Steuersätze: {str(e)}")


def init_geschaeftsjahr(db: Session) -> None:
    """
    Initialisiert das Standardgeschäftsjahr in der Datenbank.
    """
    logger.info("Initialisiere Geschäftsjahr...")
    
    geschaeftsjahre_count = db.query(Geschaeftsjahr).count()
    if geschaeftsjahre_count > 0:
        logger.info(f"Geschäftsjahr bereits initialisiert. {geschaeftsjahre_count} Geschäftsjahre vorhanden.")
        return
    
    # Aktuelles Jahr verwenden, falls es bereits 2024 oder später ist
    current_year = datetime.now().year
    if current_year >= 2024:
        start_date = date(current_year, 1, 1)
        end_date = date(current_year, 12, 31)
        bezeichnung = f"Geschäftsjahr {current_year}"
    else:
        # Standard-Daten aus der Konfiguration verwenden
        start_date = datetime.strptime(STANDARD_GESCHAEFTSJAHR["start_datum"], "%Y-%m-%d").date()
        end_date = datetime.strptime(STANDARD_GESCHAEFTSJAHR["end_datum"], "%Y-%m-%d").date()
        bezeichnung = STANDARD_GESCHAEFTSJAHR["bezeichnung"]
    
    db_geschaeftsjahr = Geschaeftsjahr(
        bezeichnung=bezeichnung,
        start_datum=start_date,
        end_datum=end_date,
        ist_abgeschlossen=False,
        erstellt_am=datetime.utcnow(),
        aktualisiert_am=datetime.utcnow()
    )
    db.add(db_geschaeftsjahr)
    
    try:
        db.commit()
        logger.info(f"Geschäftsjahr erfolgreich initialisiert: {bezeichnung}")
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Fehler beim Initialisieren des Geschäftsjahres: {str(e)}")


def init_kostenstellen(db: Session) -> None:
    """
    Initialisiert die Standardkostenstellen in der Datenbank.
    """
    logger.info("Initialisiere Kostenstellen...")
    
    kostenstellen_count = db.query(Kostenstelle).count()
    if kostenstellen_count > 0:
        logger.info(f"Kostenstellen bereits initialisiert. {kostenstellen_count} Kostenstellen vorhanden.")
        return
    
    for ks_data in STANDARD_KOSTENSTELLEN:
        db_kostenstelle = Kostenstelle(
            kostenstellen_nr=ks_data["kostenstellen_nr"],
            bezeichnung=ks_data["bezeichnung"],
            beschreibung=ks_data["beschreibung"],
            budget=ks_data["budget"],
            ist_aktiv=True,
            erstellt_am=datetime.utcnow(),
            aktualisiert_am=datetime.utcnow()
        )
        db.add(db_kostenstelle)
    
    try:
        db.commit()
        logger.info(f"Kostenstellen erfolgreich initialisiert. {len(STANDARD_KOSTENSTELLEN)} Kostenstellen angelegt.")
    except IntegrityError as e:
        db.rollback()
        logger.error(f"Fehler beim Initialisieren der Kostenstellen: {str(e)}")


def init_finance_data(db: Session) -> None:
    """
    Initialisiert alle Finanzdaten in der Datenbank.
    """
    logger.info("Starte Initialisierung der Finanzdaten...")
    
    # Reihenfolge ist wichtig wegen eventueller Abhängigkeiten
    init_kontenplan(db)
    init_steuersaetze(db)
    init_geschaeftsjahr(db)
    init_kostenstellen(db)
    
    logger.info("Initialisierung der Finanzdaten abgeschlossen.")


if __name__ == "__main__":
    # Falls dieses Skript direkt ausgeführt wird, importieren wir die DB-Session
    # und führen die Initialisierung durch
    try:
        from app.db.session import SessionLocal
    except ImportError:
        from backend.app.db.session import SessionLocal
    
    db = SessionLocal()
    try:
        init_finance_data(db)
    finally:
        db.close() 