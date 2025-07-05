"""
Datenbankoptimierungsmodul für das ERP-System.

Dieses Modul enthält Funktionen zur Optimierung von Datenbankabfragen,
Batch-Processing und anderen Datenbank-Performance-Verbesserungen.
"""

from sqlalchemy import create_engine, text, inspect
from sqlalchemy.orm import Session
from typing import List, Dict, Any, Optional, Set, Tuple, Union
import logging
import time
from functools import wraps

# Logger konfigurieren
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

def profile_query(func):
    """Decorator zum Profilieren von Datenbankabfragen."""
    @wraps(func)
    def wrapper(*args, **kwargs):
        start_time = time.time()
        result = func(*args, **kwargs)
        duration = time.time() - start_time
        
        # Query-Zeit protokollieren
        logger.info(f"Query '{func.__name__}' took {duration:.4f} seconds")
        
        # Langsame Abfragen markieren
        if duration > 0.5:  # Schwellwert für langsame Abfragen: 500ms
            logger.warning(f"Slow query detected: '{func.__name__}' took {duration:.4f} seconds")
        
        return result
    return wrapper

def batch_process(items, batch_size=100, callback=None):
    """
    Verarbeitet eine Liste von Elementen in Batches.
    
    Args:
        items: Liste der zu verarbeitenden Elemente
        batch_size: Größe jedes Batches
        callback: Callback-Funktion, die auf jeden Batch angewendet wird
        
    Returns:
        Liste der Ergebnisse (wenn callback vorhanden)
    """
    results = []
    for i in range(0, len(items), batch_size):
        batch = items[i:i+batch_size]
        if callback:
            batch_result = callback(batch)
            if batch_result:
                if isinstance(batch_result, list):
                    results.extend(batch_result)
                else:
                    results.append(batch_result)
    
    return results if callback else None

def optimize_in_query(db: Session, model_class, ids: List[int], relation_field=None, relation_model=None):
    """
    Optimiert IN-Abfragen für eine Menge von IDs und lädt optional zugehörige Relationen.
    
    Verhindert N+1-Probleme durch effiziente Batch-Abfragen.
    
    Args:
        db: Datenbankverbindung
        model_class: Modellklasse für die Hauptabfrage
        ids: Liste von IDs für die IN-Abfrage
        relation_field: Feld, das auf das Relationsobjekt verweist
        relation_model: Modellklasse für die Relation
        
    Returns:
        Dictionary von Modellobjekten, indiziert nach ID
    """
    if not ids:
        return {}
    
    # Hauptobjekte abrufen
    main_objects = {obj.id: obj for obj in db.query(model_class).filter(model_class.id.in_(ids))}
    
    # Optional zugehörige Objekte abrufen
    if relation_field and relation_model and main_objects:
        # IDs der zugehörigen Objekte extrahieren
        relation_ids = {getattr(obj, relation_field) for obj in main_objects.values() 
                        if getattr(obj, relation_field) is not None}
        
        # Zugehörige Objekte in einem Batch abrufen
        relation_objects = {obj.id: obj for obj in db.query(relation_model).filter(relation_model.id.in_(relation_ids))}
        
        # Zugehörige Objekte den Hauptobjekten zuweisen
        for obj in main_objects.values():
            relation_id = getattr(obj, relation_field)
            if relation_id in relation_objects:
                # Name des Relationsattributs aus dem Feldnamen ableiten (z.B. artikel_id -> artikel)
                relation_attr = relation_field[:-3] if relation_field.endswith('_id') else relation_field
                setattr(obj, relation_attr, relation_objects[relation_id])
    
    return main_objects

def add_indices(engine, indices: List[Dict[str, Any]]):
    """
    Fügt Indizes zur Datenbank hinzu, falls sie noch nicht existieren.
    
    Args:
        engine: SQLAlchemy-Engine
        indices: Liste von Indizes, jeder als Dict mit:
            - table: Name der Tabelle
            - columns: Liste von Spaltennamen
            - name: Name des Index (optional)
    """
    inspector = inspect(engine)
    
    with engine.connect() as conn:
        for idx in indices:
            table = idx['table']
            columns = idx['columns']
            name = idx.get('name', f"idx_{table}_{'_'.join(columns)}")
            
            # Prüfen, ob der Index bereits existiert
            existing_indices = inspector.get_indexes(table)
            exists = any(idx_info['name'] == name for idx_info in existing_indices)
            
            if not exists:
                logger.info(f"Creating index {name} on {table}({', '.join(columns)})")
                
                # SQL für die Indexerstellung erstellen
                columns_str = ', '.join(columns)
                sql = text(f"CREATE INDEX {name} ON {table} ({columns_str})")
                
                try:
                    conn.execute(sql)
                    conn.commit()
                    logger.info(f"Index {name} successfully created")
                except Exception as e:
                    logger.error(f"Failed to create index {name}: {e}")

def create_recommended_indices(engine):
    """
    Erstellt die empfohlenen Indizes für das ERP-System.
    """
    recommended_indices = [
        {"table": "artikel", "columns": ["kategorie"], "name": "idx_artikel_kategorie"},
        {"table": "artikel", "columns": ["name"], "name": "idx_artikel_name"},
        {"table": "charge", "columns": ["artikel_id"], "name": "idx_charge_artikel_id"},
        {"table": "charge", "columns": ["produktionsdatum"], "name": "idx_charge_prod_datum"},
        {"table": "lagerbewegung", "columns": ["charge_id"], "name": "idx_lagerbewegung_charge"},
        {"table": "lager_chargen_reservierung", "columns": ["charge_id"], "name": "idx_reservierung_charge"},
        {"table": "chargen_lager_bewegung", "columns": ["charge_id"], "name": "idx_chargenlagerbewegung_charge"}
    ]
    
    add_indices(engine, recommended_indices)

# Optimierte Abfragefunktionen für häufig verwendete Endpunkte

def get_charges_optimized(db: Session, artikel_id: Optional[int] = None):
    """
    Optimierte Version der Chargen-Abfrage, die N+1-Probleme vermeidet.
    
    Args:
        db: Datenbankverbindung
        artikel_id: Optional, filtert nach Artikel-ID
        
    Returns:
        Liste von Chargen mit Artikelinformationen
    """
    from backend.models.lager import Charge
    from backend.models.artikel import Artikel
    
    # Basisabfrage
    query = db.query(Charge)
    
    # Filterung anwenden
    if artikel_id:
        query = query.filter(Charge.artikel_id == artikel_id)
    
    # Alle benötigten Chargen auf einmal abrufen
    charges = query.all()
    
    # Wenn keine Chargen gefunden wurden, leere Liste zurückgeben
    if not charges:
        return []
    
    # Alle benötigten Artikel-IDs sammeln
    artikel_ids = {charge.artikel_id for charge in charges if charge.artikel_id is not None}
    
    # Batch-Abruf aller benötigten Artikel
    artikel_dict = {
        artikel.id: artikel 
        for artikel in db.query(Artikel).filter(Artikel.id.in_(artikel_ids))
    }
    
    # Ergebnisse zusammenstellen
    result = []
    for charge in charges:
        artikel = artikel_dict.get(charge.artikel_id)
        charge_data = {
            "id": charge.id,
            "charge_number": charge.charge_number if hasattr(charge, 'charge_number') else f"CH-{charge.id}",
            "artikel_id": charge.artikel_id,
            "artikel_name": artikel.name if artikel else None,
            "production_date": charge.produktionsdatum if hasattr(charge, 'produktionsdatum') else None
        }
        result.append(charge_data)
    
    return result

def get_articles_optimized(db: Session, category: Optional[str] = None, page: int = 1, page_size: int = 10):
    """
    Optimierte Version der Artikel-Abfrage mit Filterung, Sortierung und Paginierung.
    
    Args:
        db: Datenbankverbindung
        category: Optional, filtert nach Kategorie
        page: Seitennummer (beginnend bei 1)
        page_size: Anzahl der Ergebnisse pro Seite
        
    Returns:
        Dictionary mit Artikeln und Paginierungsinformationen
    """
    from backend.models.artikel import Artikel
    
    # Basisabfrage mit effizienter Datenbankfilterung und -sortierung
    query = db.query(Artikel)
    
    # Filterung anwenden
    if category:
        query = query.filter(Artikel.kategorie == category)
    
    # Sortierung in der Datenbank durchführen
    query = query.order_by(Artikel.name)
    
    # Gesamtzahl für Paginierung berechnen
    total = query.count()
    
    # Paginierung in der Datenbank durchführen
    query = query.offset((page - 1) * page_size).limit(page_size)
    
    # Optimierte Abfrage ausführen
    articles = query.all()
    
    return {
        "items": articles,
        "total": total,
        "page": page,
        "page_size": page_size,
        "pages": (total + page_size - 1) // page_size
    }

def process_artikel_batches(db: Session, artikel_ids, batch_size=100, callback=None):
    """
    Verarbeitet Artikel in Batches, um Speicherverbrauch zu reduzieren.
    
    Args:
        db: Datenbankverbindung
        artikel_ids: Liste von Artikel-IDs
        batch_size: Größe jedes Batches
        callback: Optionale Callback-Funktion für jeden Batch
        
    Returns:
        Ergebnisse der Verarbeitung
    """
    from backend.models.artikel import Artikel
    
    results = []
    
    for i in range(0, len(artikel_ids), batch_size):
        batch = artikel_ids[i:i+batch_size]
        artikel_batch = db.query(Artikel).filter(Artikel.id.in_(batch)).all()
        
        if callback:
            batch_result = callback(artikel_batch)
            if batch_result:
                if isinstance(batch_result, list):
                    results.extend(batch_result)
                else:
                    results.append(batch_result)
        else:
            results.extend(artikel_batch)
    
    return results 