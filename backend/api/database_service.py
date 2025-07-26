"""
🧠 VALEO NeuroERP - Database Service
===================================
Backend-Service für Datenbankintegration mit Mapping-Layer
Erstellt: 2025-07-23
Status: NeuroFlow-Integration
"""

import asyncio
import logging
from typing import Dict, List, Optional, Any, Union
from datetime import datetime, date
import asyncpg
from pydantic import BaseModel

from .database_mapping import get_field_mapper, DatabaseSchema

# Logging konfigurieren
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# =====================================================
# DATENBANK-KONFIGURATION
# =====================================================

class DatabaseConfig(BaseModel):
    """Datenbank-Konfiguration"""
    host: str = "localhost"
    port: int = 5432
    database: str = "valeo_neuroerp"
    user: str = "valeo_user"
    password: str = "valeo_password"
    min_connections: int = 5
    max_connections: int = 20

# Standard-Konfiguration
DEFAULT_CONFIG = DatabaseConfig()

# =====================================================
# DATENBANK-SERVICE
# =====================================================

class DatabaseService:
    """Hauptklasse für Datenbankoperationen"""
    
    def __init__(self, config: DatabaseConfig = DEFAULT_CONFIG):
        self.config = config
        self.pool: Optional[asyncpg.Pool] = None
        self.field_mapper = get_field_mapper()
    
    async def connect(self):
        """Verbindet zur Datenbank"""
        try:
            self.pool = await asyncpg.create_pool(
                host=self.config.host,
                port=self.config.port,
                database=self.config.database,
                user=self.config.user,
                password=self.config.password,
                min_size=self.config.min_connections,
                max_size=self.config.max_connections
            )
            logger.info(f"✅ Datenbankverbindung hergestellt: {self.config.database}")
        except Exception as e:
            logger.error(f"❌ Datenbankverbindung fehlgeschlagen: {e}")
            raise
    
    async def disconnect(self):
        """Trennt die Datenbankverbindung"""
        if self.pool:
            await self.pool.close()
            logger.info("🔌 Datenbankverbindung getrennt")
    
    async def execute_query(self, query: str, *args) -> List[Dict[str, Any]]:
        """Führt eine SQL-Query aus"""
        if not self.pool:
            raise RuntimeError("Datenbankverbindung nicht hergestellt")
        
        try:
            async with self.pool.acquire() as conn:
                rows = await conn.fetch(query, *args)
                return [dict(row) for row in rows]
        except Exception as e:
            logger.error(f"❌ Query-Fehler: {e}")
            raise
    
    async def execute_command(self, command: str, *args) -> str:
        """Führt einen SQL-Befehl aus"""
        if not self.pool:
            raise RuntimeError("Datenbankverbindung nicht hergestellt")
        
        try:
            async with self.pool.acquire() as conn:
                result = await conn.execute(command, *args)
                return result
        except Exception as e:
            logger.error(f"❌ Command-Fehler: {e}")
            raise
    
    # =====================================================
    # LIEFERANTEN-OPERATIONEN
    # =====================================================
    
    async def get_suppliers(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """Holt Lieferanten aus der Datenbank"""
        query = """
        SELECT 
            lieferant_id,
            lieferant_nr,
            firmenname,
            ansprechpartner,
            telefon,
            email,
            webseite,
            steuernummer,
            ust_id,
            zahlungsziel,
            skonto_prozent,
            bewertung,
            status,
            rechtsform,
            handelsregister,
            kreditlimit,
            zuverlaessigkeits_score,
            qualitaets_score,
            liefer_score,
            durchschnittliche_lieferzeit,
            mindestbestellwert,
            kostenlose_lieferung_ab,
            iso_9001,
            iso_14001,
            weitere_zertifizierungen,
            ist_bevorzugt,
            ist_zertifiziert,
            ist_lokal,
            vertriebsmitarbeiter,
            kostenstelle,
            notizen,
            erstellt_am,
            geaendert_am
        FROM einkauf.lieferanten
        ORDER BY firmenname
        LIMIT $1 OFFSET $2
        """
        
        rows = await self.execute_query(query, limit, offset)
        
        # Mappe zu NeuroFlow-Format
        suppliers = []
        for row in rows:
            neuroflow_supplier = self.field_mapper.map_database_to_neuroflow("suppliers", row)
            suppliers.append(neuroflow_supplier)
        
        return suppliers
    
    async def get_supplier_by_id(self, supplier_id: str) -> Optional[Dict[str, Any]]:
        """Holt einen Lieferanten nach ID"""
        query = """
        SELECT 
            lieferant_id,
            lieferant_nr,
            firmenname,
            ansprechpartner,
            telefon,
            email,
            webseite,
            steuernummer,
            ust_id,
            zahlungsziel,
            skonto_prozent,
            bewertung,
            status,
            rechtsform,
            handelsregister,
            kreditlimit,
            zuverlaessigkeits_score,
            qualitaets_score,
            liefer_score,
            durchschnittliche_lieferzeit,
            mindestbestellwert,
            kostenlose_lieferung_ab,
            iso_9001,
            iso_14001,
            weitere_zertifizierungen,
            ist_bevorzugt,
            ist_zertifiziert,
            ist_lokal,
            vertriebsmitarbeiter,
            kostenstelle,
            notizen,
            erstellt_am,
            geaendert_am
        FROM einkauf.lieferanten
        WHERE lieferant_id = $1
        """
        
        rows = await self.execute_query(query, supplier_id)
        
        if rows:
            row = rows[0]
            return self.field_mapper.map_database_to_neuroflow("suppliers", row)
        
        return None
    
    async def search_suppliers(self, search_term: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Sucht Lieferanten nach Suchbegriff"""
        query = """
        SELECT 
            lieferant_id,
            lieferant_nr,
            firmenname,
            ansprechpartner,
            telefon,
            email,
            webseite,
            steuernummer,
            ust_id,
            zahlungsziel,
            skonto_prozent,
            bewertung,
            status,
            rechtsform,
            handelsregister,
            kreditlimit,
            zuverlaessigkeits_score,
            qualitaets_score,
            liefer_score,
            durchschnittliche_lieferzeit,
            mindestbestellwert,
            kostenlose_lieferung_ab,
            iso_9001,
            iso_14001,
            weitere_zertifizierungen,
            ist_bevorzugt,
            ist_zertifiziert,
            ist_lokal,
            vertriebsmitarbeiter,
            kostenstelle,
            notizen,
            erstellt_am,
            geaendert_am
        FROM einkauf.lieferanten
        WHERE 
            firmenname ILIKE $1 OR
            lieferant_nr ILIKE $1 OR
            ansprechpartner ILIKE $1 OR
            email ILIKE $1
        ORDER BY firmenname
        LIMIT $2
        """
        
        search_pattern = f"%{search_term}%"
        rows = await self.execute_query(query, search_pattern, limit)
        
        # Mappe zu NeuroFlow-Format
        suppliers = []
        for row in rows:
            neuroflow_supplier = self.field_mapper.map_database_to_neuroflow("suppliers", row)
            suppliers.append(neuroflow_supplier)
        
        return suppliers
    
    async def create_supplier(self, supplier_data: Dict[str, Any]) -> Dict[str, Any]:
        """Erstellt einen neuen Lieferanten"""
        # Mappe NeuroFlow-Daten zu Datenbank-Format
        db_data = self.field_mapper.map_neuroflow_to_database("suppliers", supplier_data)
        
        # Erstelle INSERT-Query
        fields = list(db_data.keys())
        placeholders = [f"${i+1}" for i in range(len(fields))]
        values = list(db_data.values())
        
        query = f"""
        INSERT INTO einkauf.lieferanten ({', '.join(fields)})
        VALUES ({', '.join(placeholders)})
        RETURNING lieferant_id
        """
        
        result = await self.execute_query(query, *values)
        
        if result:
            supplier_id = result[0]['lieferant_id']
            return await self.get_supplier_by_id(supplier_id)
        
        raise RuntimeError("Fehler beim Erstellen des Lieferanten")
    
    async def update_supplier(self, supplier_id: str, supplier_data: Dict[str, Any]) -> Dict[str, Any]:
        """Aktualisiert einen Lieferanten"""
        # Mappe NeuroFlow-Daten zu Datenbank-Format
        db_data = self.field_mapper.map_neuroflow_to_database("suppliers", supplier_data)
        
        # Erstelle UPDATE-Query
        set_clauses = [f"{field} = ${i+2}" for i, field in enumerate(db_data.keys())]
        values = list(db_data.values())
        
        query = f"""
        UPDATE einkauf.lieferanten
        SET {', '.join(set_clauses)}, geaendert_am = CURRENT_TIMESTAMP
        WHERE lieferant_id = $1
        RETURNING lieferant_id
        """
        
        result = await self.execute_query(query, supplier_id, *values)
        
        if result:
            return await self.get_supplier_by_id(supplier_id)
        
        raise RuntimeError("Fehler beim Aktualisieren des Lieferanten")
    
    # =====================================================
    # KUNDEN-OPERATIONEN
    # =====================================================
    
    async def get_customers(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """Holt Kunden aus der Datenbank"""
        query = """
        SELECT 
            id,
            kunden_nr,
            firmenname,
            kundentyp,
            branche,
            umsatzklasse,
            kundenstatus,
            kundenbewertung,
            kundenseit,
            zahlungsziel,
            skonto_prozent,
            erstellt_am,
            geaendert_am
        FROM crm.kunden
        ORDER BY firmenname
        LIMIT $1 OFFSET $2
        """
        
        rows = await self.execute_query(query, limit, offset)
        
        # Mappe zu NeuroFlow-Format
        customers = []
        for row in rows:
            neuroflow_customer = self.field_mapper.map_database_to_neuroflow("customers", row)
            customers.append(neuroflow_customer)
        
        return customers
    
    async def search_customers(self, search_term: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Sucht Kunden nach Suchbegriff"""
        query = """
        SELECT 
            id,
            kunden_nr,
            firmenname,
            kundentyp,
            branche,
            umsatzklasse,
            kundenstatus,
            kundenbewertung,
            kundenseit,
            zahlungsziel,
            skonto_prozent,
            erstellt_am,
            geaendert_am
        FROM crm.kunden
        WHERE 
            firmenname ILIKE $1 OR
            kunden_nr ILIKE $1 OR
            branche ILIKE $1
        ORDER BY firmenname
        LIMIT $2
        """
        
        search_pattern = f"%{search_term}%"
        rows = await self.execute_query(query, search_pattern, limit)
        
        # Mappe zu NeuroFlow-Format
        customers = []
        for row in rows:
            neuroflow_customer = self.field_mapper.map_database_to_neuroflow("customers", row)
            customers.append(neuroflow_customer)
        
        return customers
    
    # =====================================================
    # ARTIKEL-OPERATIONEN
    # =====================================================
    
    async def get_articles(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """Holt Artikel aus der Datenbank"""
        query = """
        SELECT 
            artikel_id,
            bezeichnung,
            beschreibung,
            einheit,
            kategorie,
            preis,
            waehrung,
            stock_quantity,
            erstellt_am,
            geaendert_am
        FROM produktion.artikel
        ORDER BY bezeichnung
        LIMIT $1 OFFSET $2
        """
        
        rows = await self.execute_query(query, limit, offset)
        
        # Mappe zu NeuroFlow-Format
        articles = []
        for row in rows:
            neuroflow_article = self.field_mapper.map_database_to_neuroflow("articles", row)
            articles.append(neuroflow_article)
        
        return articles
    
    async def search_articles(self, search_term: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Sucht Artikel nach Suchbegriff"""
        query = """
        SELECT 
            artikel_id,
            bezeichnung,
            beschreibung,
            einheit,
            kategorie,
            preis,
            waehrung,
            stock_quantity,
            erstellt_am,
            geaendert_am
        FROM produktion.artikel
        WHERE 
            bezeichnung ILIKE $1 OR
            artikel_id ILIKE $1 OR
            kategorie ILIKE $1
        ORDER BY bezeichnung
        LIMIT $2
        """
        
        search_pattern = f"%{search_term}%"
        rows = await self.execute_query(query, search_pattern, limit)
        
        # Mappe zu NeuroFlow-Format
        articles = []
        for row in rows:
            neuroflow_article = self.field_mapper.map_database_to_neuroflow("articles", row)
            articles.append(neuroflow_article)
        
        return articles
    
    # =====================================================
    # PERSONAL-OPERATIONEN
    # =====================================================
    
    async def get_personnel(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """Holt Personal aus der Datenbank"""
        query = """
        SELECT 
            mitarbeiter_id,
            vorname,
            nachname,
            email,
            abteilung,
            position,
            telefon,
            mobil,
            status,
            erstellt_am,
            geaendert_am
        FROM personal.mitarbeiter
        ORDER BY nachname, vorname
        LIMIT $1 OFFSET $2
        """
        
        rows = await self.execute_query(query, limit, offset)
        
        # Mappe zu NeuroFlow-Format
        personnel = []
        for row in rows:
            neuroflow_personnel = self.field_mapper.map_database_to_neuroflow("personnel", row)
            personnel.append(neuroflow_personnel)
        
        return personnel
    
    async def search_personnel(self, search_term: str, limit: int = 50) -> List[Dict[str, Any]]:
        """Sucht Personal nach Suchbegriff"""
        query = """
        SELECT 
            mitarbeiter_id,
            vorname,
            nachname,
            email,
            abteilung,
            position,
            telefon,
            mobil,
            status,
            erstellt_am,
            geaendert_am
        FROM personal.mitarbeiter
        WHERE 
            vorname ILIKE $1 OR
            nachname ILIKE $1 OR
            email ILIKE $1 OR
            abteilung ILIKE $1
        ORDER BY nachname, vorname
        LIMIT $2
        """
        
        search_pattern = f"%{search_term}%"
        rows = await self.execute_query(query, search_pattern, limit)
        
        # Mappe zu NeuroFlow-Format
        personnel = []
        for row in rows:
            neuroflow_personnel = self.field_mapper.map_database_to_neuroflow("personnel", row)
            personnel.append(neuroflow_personnel)
        
        return personnel
    
    # =====================================================
    # CHARGEN-OPERATIONEN
    # =====================================================
    
    async def get_charges(self, limit: int = 100, offset: int = 0) -> List[Dict[str, Any]]:
        """Holt Chargen aus der Datenbank"""
        query = """
        SELECT 
            id,
            charge_nr,
            artikel_nr,
            artikel_name,
            lieferant_nr,
            lieferant_name,
            produktionsdatum,
            verfallsdatum,
            charge_groesse,
            einheit,
            qualitaets_status,
            vlog_gmo_status,
            risiko_score,
            qualitaets_score,
            ki_risiko_bewertung,
            qualitaets_vorhersage,
            anomalie_erkennung,
            ki_empfehlungen,
            workflow_status,
            n8n_integration,
            automatisierung_status,
            workflow_trigger,
            automatisierte_prozesse,
            qualitaets_zertifikate,
            compliance_dokumente,
            erstellt_am,
            geaendert_am
        FROM chargen.chargen
        ORDER BY erstellt_am DESC
        LIMIT $1 OFFSET $2
        """
        
        rows = await self.execute_query(query, limit, offset)
        
        # Mappe zu NeuroFlow-Format
        charges = []
        for row in rows:
            neuroflow_charge = self.field_mapper.map_database_to_neuroflow("charges", row)
            charges.append(neuroflow_charge)
        
        return charges
    
    async def create_charge(self, charge_data: Dict[str, Any]) -> Dict[str, Any]:
        """Erstellt eine neue Charge"""
        # Mappe NeuroFlow-Daten zu Datenbank-Format
        db_data = self.field_mapper.map_neuroflow_to_database("charges", charge_data)
        
        # Erstelle INSERT-Query
        fields = list(db_data.keys())
        placeholders = [f"${i+1}" for i in range(len(fields))]
        values = list(db_data.values())
        
        query = f"""
        INSERT INTO chargen.chargen ({', '.join(fields)})
        VALUES ({', '.join(placeholders)})
        RETURNING id
        """
        
        result = await self.execute_query(query, *values)
        
        if result:
            charge_id = result[0]['id']
            # Hole die erstellte Charge zurück
            return await self.get_charge_by_id(charge_id)
        
        raise RuntimeError("Fehler beim Erstellen der Charge")
    
    async def get_charge_by_id(self, charge_id: str) -> Optional[Dict[str, Any]]:
        """Holt eine Charge nach ID"""
        query = """
        SELECT 
            id,
            charge_nr,
            artikel_nr,
            artikel_name,
            lieferant_nr,
            lieferant_name,
            produktionsdatum,
            verfallsdatum,
            charge_groesse,
            einheit,
            qualitaets_status,
            vlog_gmo_status,
            risiko_score,
            qualitaets_score,
            ki_risiko_bewertung,
            qualitaets_vorhersage,
            anomalie_erkennung,
            ki_empfehlungen,
            workflow_status,
            n8n_integration,
            automatisierung_status,
            workflow_trigger,
            automatisierte_prozesse,
            qualitaets_zertifikate,
            compliance_dokumente,
            erstellt_am,
            geaendert_am
        FROM chargen.chargen
        WHERE id = $1
        """
        
        rows = await self.execute_query(query, charge_id)
        
        if rows:
            row = rows[0]
            return self.field_mapper.map_database_to_neuroflow("charges", row)
        
        return None
    
    # =====================================================
    # STATISTIKEN UND REPORTING
    # =====================================================
    
    async def get_supplier_statistics(self) -> Dict[str, Any]:
        """Holt Lieferanten-Statistiken"""
        query = """
        SELECT 
            COUNT(*) as total_suppliers,
            COUNT(CASE WHEN status = 'AKTIV' THEN 1 END) as active_suppliers,
            COUNT(CASE WHEN status = 'INAKTIV' THEN 1 END) as inactive_suppliers,
            COUNT(CASE WHEN status = 'GESPERRT' THEN 1 END) as blocked_suppliers,
            COUNT(CASE WHEN ist_bevorzugt = true THEN 1 END) as preferred_suppliers,
            COUNT(CASE WHEN ist_zertifiziert = true THEN 1 END) as certified_suppliers,
            COUNT(CASE WHEN ist_lokal = true THEN 1 END) as local_suppliers,
            AVG(bewertung) as average_rating,
            AVG(zuverlaessigkeits_score) as average_reliability,
            AVG(qualitaets_score) as average_quality,
            AVG(liefer_score) as average_delivery
        FROM einkauf.lieferanten
        """
        
        rows = await self.execute_query(query)
        return rows[0] if rows else {}
    
    async def get_charge_statistics(self) -> Dict[str, Any]:
        """Holt Chargen-Statistiken"""
        query = """
        SELECT 
            COUNT(*) as total_charges,
            COUNT(CASE WHEN qualitaets_status = 'FREIGEGEBEN' THEN 1 END) as released_charges,
            COUNT(CASE WHEN qualitaets_status = 'ABGELEHNT' THEN 1 END) as rejected_charges,
            COUNT(CASE WHEN qualitaets_status = 'QUARANTAENE' THEN 1 END) as quarantine_charges,
            COUNT(CASE WHEN n8n_integration = true THEN 1 END) as automated_charges,
            AVG(risiko_score) as average_risk_score,
            AVG(qualitaets_score) as average_quality_score
        FROM chargen.chargen
        """
        
        rows = await self.execute_query(query)
        return rows[0] if rows else {}
    
    # =====================================================
    # DATENBANK-GESUNDHEIT
    # =====================================================
    
    async def check_database_health(self) -> Dict[str, Any]:
        """Prüft die Datenbank-Gesundheit"""
        try:
            # Teste Verbindung
            await self.execute_query("SELECT 1 as test")
            
            # Prüfe Tabellen
            tables_query = """
            SELECT 
                schemaname,
                tablename,
                n_tup_ins as inserts,
                n_tup_upd as updates,
                n_tup_del as deletes
            FROM pg_stat_user_tables
            WHERE schemaname IN ('crm', 'einkauf', 'qualitaet', 'chargen', 'personal', 'produktion')
            ORDER BY schemaname, tablename
            """
            
            tables = await self.execute_query(tables_query)
            
            return {
                "status": "healthy",
                "connection": "ok",
                "tables": tables,
                "timestamp": datetime.now().isoformat()
            }
        except Exception as e:
            return {
                "status": "unhealthy",
                "error": str(e),
                "timestamp": datetime.now().isoformat()
            }

# =====================================================
# GLOBALE INSTANZ
# =====================================================

# Globale Instanz des Database Service
db_service = DatabaseService()

# =====================================================
# HILFS-FUNKTIONEN
# =====================================================

async def get_database_service() -> DatabaseService:
    """Gibt die globale Database Service-Instanz zurück"""
    return db_service

async def init_database():
    """Initialisiert die Datenbankverbindung"""
    await db_service.connect()

async def close_database():
    """Schließt die Datenbankverbindung"""
    await db_service.disconnect()

# =====================================================
# TEST-FUNKTIONEN
# =====================================================

async def test_database_service():
    """Testet den Database Service"""
    print("🧠 Teste Database Service...")
    
    try:
        # Verbindung herstellen
        await db_service.connect()
        print("✅ Datenbankverbindung erfolgreich")
        
        # Gesundheitscheck
        health = await db_service.check_database_health()
        print(f"✅ Datenbank-Gesundheit: {health['status']}")
        
        # Teste Lieferanten-Suche
        suppliers = await db_service.search_suppliers("test", 5)
        print(f"✅ Lieferanten-Suche: {len(suppliers)} Ergebnisse")
        
        # Teste Kunden-Suche
        customers = await db_service.search_customers("test", 5)
        print(f"✅ Kunden-Suche: {len(customers)} Ergebnisse")
        
        # Teste Artikel-Suche
        articles = await db_service.search_articles("test", 5)
        print(f"✅ Artikel-Suche: {len(articles)} Ergebnisse")
        
        # Teste Personal-Suche
        personnel = await db_service.search_personnel("test", 5)
        print(f"✅ Personal-Suche: {len(personnel)} Ergebnisse")
        
        # Statistiken
        supplier_stats = await db_service.get_supplier_statistics()
        print(f"✅ Lieferanten-Statistiken: {supplier_stats}")
        
        print("🎉 Database Service Test erfolgreich!")
        
    except Exception as e:
        print(f"❌ Database Service Test fehlgeschlagen: {e}")
    finally:
        await db_service.disconnect()

if __name__ == "__main__":
    asyncio.run(test_database_service()) 