"""
Materialisierte Ansichten für das ERP-System.

Dieses Modul stellt Funktionen zur Erstellung und Aktualisierung
materialisierter Ansichten bereit, um häufige Abfragen zu optimieren.
"""

import logging
from sqlalchemy import create_engine, text, Table, MetaData, Column, Integer, String, Float, DateTime
from sqlalchemy.schema import CreateTable, DropTable
from sqlalchemy.exc import SQLAlchemyError
from typing import Dict, Any, Optional, List
import time
import datetime

# Logger konfigurieren
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Standardansichten definieren
STANDARD_VIEWS = {
    "mv_lagerbestand_pro_artikel": """
        SELECT artikel_id, SUM(menge) as bestand
        FROM lagerbewegung
        GROUP BY artikel_id
    """,
    "mv_chargen_pro_kategorie": """
        SELECT a.kategorie, COUNT(c.id) as anzahl_chargen
        FROM charge c
        JOIN artikel a ON c.artikel_id = a.id
        GROUP BY a.kategorie
    """,
    "mv_durchschnittlicher_artikelpreis": """
        SELECT kategorie, AVG(preis) as durchschnittspreis
        FROM artikel
        GROUP BY kategorie
    """,
    "mv_lagerbewegungen_pro_monat": """
        SELECT 
            strftime('%Y-%m', datum) as monat, 
            COUNT(*) as anzahl_bewegungen,
            SUM(CASE WHEN menge > 0 THEN menge ELSE 0 END) as eingang,
            SUM(CASE WHEN menge < 0 THEN -menge ELSE 0 END) as ausgang
        FROM lagerbewegung
        GROUP BY strftime('%Y-%m', datum)
    """
}

def create_materialized_view(engine, view_name: str, query: str, recreate: bool = False):
    """
    Erstellt eine materialisierte Ansicht in der Datenbank.
    
    Da SQLite keine nativen materialisierten Ansichten unterstützt, 
    wird eine Tabelle erstellt und mit den Ergebnissen der Abfrage gefüllt.
    
    Args:
        engine: SQLAlchemy-Engine
        view_name: Name der materialisierten Ansicht
        query: SQL-Abfrage für die Ansicht
        recreate: Ob die Ansicht neu erstellt werden soll, falls sie bereits existiert
    
    Returns:
        bool: True bei Erfolg, False bei Fehler
    """
    try:
        with engine.connect() as conn:
            # Prüfen, ob die Ansicht bereits existiert
            result = conn.execute(text(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{view_name}'"))
            exists = result.fetchone() is not None
            
            if exists and not recreate:
                logger.info(f"Materialisierte Ansicht {view_name} existiert bereits. Überspringe...")
                return True
            
            if exists:
                # Ansicht löschen, wenn sie bereits existiert und neu erstellt werden soll
                conn.execute(text(f"DROP TABLE IF EXISTS {view_name}"))
                logger.info(f"Materialisierte Ansicht {view_name} gelöscht")
            
            # Ansicht erstellen
            create_stmt = f"CREATE TABLE {view_name} AS {query}"
            conn.execute(text(create_stmt))
            
            # Zeitstempel für die Aktualisierung speichern
            conn.execute(text(f"""
                CREATE TABLE IF NOT EXISTS materialized_views_meta (
                    view_name TEXT PRIMARY KEY,
                    last_refresh TIMESTAMP,
                    refresh_count INTEGER
                )
            """))
            
            # Metadaten aktualisieren
            now = datetime.datetime.now().isoformat()
            conn.execute(text(f"""
                INSERT OR REPLACE INTO materialized_views_meta (view_name, last_refresh, refresh_count)
                VALUES ('{view_name}', '{now}', 1)
            """))
            
            conn.commit()
            logger.info(f"Materialisierte Ansicht {view_name} erfolgreich erstellt")
            return True
    
    except SQLAlchemyError as e:
        logger.error(f"Fehler beim Erstellen der materialisierten Ansicht {view_name}: {e}")
        return False

def refresh_materialized_view(engine, view_name: str, query: Optional[str] = None):
    """
    Aktualisiert eine materialisierte Ansicht.
    
    Args:
        engine: SQLAlchemy-Engine
        view_name: Name der materialisierten Ansicht
        query: SQL-Abfrage für die Ansicht (falls nicht angegeben, wird die aktuelle Ansicht verwendet)
    
    Returns:
        bool: True bei Erfolg, False bei Fehler
    """
    try:
        with engine.connect() as conn:
            # Prüfen, ob die Ansicht existiert
            result = conn.execute(text(f"SELECT name FROM sqlite_master WHERE type='table' AND name='{view_name}'"))
            exists = result.fetchone() is not None
            
            if not exists:
                logger.error(f"Materialisierte Ansicht {view_name} existiert nicht")
                return False
            
            # Wenn keine Abfrage angegeben wurde, versuchen wir die Abfrage aus den Standardansichten zu bekommen
            if query is None:
                if view_name in STANDARD_VIEWS:
                    query = STANDARD_VIEWS[view_name]
                else:
                    logger.error(f"Keine Abfrage für Ansicht {view_name} angegeben und keine Standardansicht gefunden")
                    return False
            
            # Temporäre Tabelle für die Aktualisierung erstellen
            temp_table = f"{view_name}_temp"
            conn.execute(text(f"DROP TABLE IF EXISTS {temp_table}"))
            conn.execute(text(f"CREATE TABLE {temp_table} AS {query}"))
            
            # Atomarer Austausch der Tabellen
            conn.execute(text(f"DROP TABLE {view_name}"))
            conn.execute(text(f"ALTER TABLE {temp_table} RENAME TO {view_name}"))
            
            # Metadaten aktualisieren
            now = datetime.datetime.now().isoformat()
            conn.execute(text(f"""
                UPDATE materialized_views_meta 
                SET last_refresh = '{now}', refresh_count = refresh_count + 1
                WHERE view_name = '{view_name}'
            """))
            
            conn.commit()
            logger.info(f"Materialisierte Ansicht {view_name} erfolgreich aktualisiert")
            return True
    
    except SQLAlchemyError as e:
        logger.error(f"Fehler beim Aktualisieren der materialisierten Ansicht {view_name}: {e}")
        return False

def get_materialized_view_info(engine, view_name: Optional[str] = None):
    """
    Gibt Informationen über materialisierte Ansichten zurück.
    
    Args:
        engine: SQLAlchemy-Engine
        view_name: Optional, Name einer spezifischen materialisierten Ansicht
        
    Returns:
        dict: Informationen über die materialisierten Ansichten
    """
    try:
        with engine.connect() as conn:
            if view_name:
                # Informationen über eine spezifische Ansicht abrufen
                result = conn.execute(text(f"""
                    SELECT view_name, last_refresh, refresh_count
                    FROM materialized_views_meta
                    WHERE view_name = '{view_name}'
                """))
                row = result.fetchone()
                
                if row:
                    return {
                        "view_name": row[0],
                        "last_refresh": row[1],
                        "refresh_count": row[2]
                    }
                else:
                    return {"error": f"Materialisierte Ansicht {view_name} nicht gefunden"}
            else:
                # Informationen über alle Ansichten abrufen
                result = conn.execute(text("""
                    SELECT view_name, last_refresh, refresh_count
                    FROM materialized_views_meta
                """))
                
                views = []
                for row in result.fetchall():
                    views.append({
                        "view_name": row[0],
                        "last_refresh": row[1],
                        "refresh_count": row[2]
                    })
                
                return {"views": views}
    
    except SQLAlchemyError as e:
        logger.error(f"Fehler beim Abrufen von Informationen über materialisierte Ansichten: {e}")
        return {"error": str(e)}

def setup_materialized_views(engine):
    """
    Richtet alle Standardansichten ein.
    
    Args:
        engine: SQLAlchemy-Engine
        
    Returns:
        dict: Ergebnis der Einrichtung
    """
    results = {}
    
    for view_name, query in STANDARD_VIEWS.items():
        start_time = time.time()
        success = create_materialized_view(engine, view_name, query)
        duration = time.time() - start_time
        
        results[view_name] = {
            "success": success,
            "duration": duration
        }
    
    return results

def refresh_all_materialized_views(engine):
    """
    Aktualisiert alle materialisierten Ansichten.
    
    Args:
        engine: SQLAlchemy-Engine
        
    Returns:
        dict: Ergebnis der Aktualisierung
    """
    results = {}
    
    for view_name, query in STANDARD_VIEWS.items():
        start_time = time.time()
        success = refresh_materialized_view(engine, view_name, query)
        duration = time.time() - start_time
        
        results[view_name] = {
            "success": success,
            "duration": duration
        }
    
    return results 