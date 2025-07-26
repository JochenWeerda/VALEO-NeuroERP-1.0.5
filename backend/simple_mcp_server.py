#!/usr/bin/env python3
"""
Vereinfachter MCP Supabase Schema Server
Bietet Supabase-Schema-Informationen über HTTP-API
"""

import asyncio
import json
import logging
from typing import Any, Dict, List, Optional
from dataclasses import dataclass

import httpx
from supabase import create_client, Client
from pydantic import BaseModel, Field
from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
import uvicorn

# Logging konfigurieren
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Supabase-Konfiguration - VALEO NeuroERP
SUPABASE_URL = "https://ftybxxndembbfjdkcsuk.supabase.co"
SUPABASE_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1pbXJmbmx0cGV2cWh3dXFtamp6Iiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDU0NzQ0NTcsImV4cCI6MjA2MTA1MDQ1N30.S-n-zv2PwUSLHuY5St9ZNJpS_IcUTBhDslngs6G9eIU"

# FastAPI App erstellen
app = FastAPI(
    title="VALEO NeuroERP MCP Server",
    description="Supabase Schema Provider für VALEO NeuroERP",
    version="1.0.0"
)

# CORS konfigurieren
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@dataclass
class SupabaseConfig:
    """Supabase-Konfiguration"""
    url: str
    key: str
    project_id: str

class ColumnInfo(BaseModel):
    """Spalten-Informationen"""
    name: str
    type: str
    primary: bool = False
    foreign_key: Optional[str] = None
    not_null: bool = False
    default: Optional[str] = None
    enum_values: Optional[List[str]] = None
    check: Optional[str] = None
    read_only: bool = False

class RLSInfo(BaseModel):
    """RLS-Richtlinien"""
    select: bool = True
    insert: bool = True
    update: bool = True
    delete: bool = True

class TableSchema(BaseModel):
    """Tabellen-Schema"""
    table: str
    columns: List[ColumnInfo]
    rls: RLSInfo
    indexes: Optional[List[Dict[str, Any]]] = None
    triggers: Optional[List[Dict[str, Any]]] = None

class SupabaseSchemaProvider:
    """Supabase Schema Provider"""
    
    def __init__(self, config: SupabaseConfig):
        self.config = config
        self.client: Optional[Client] = None
        self.cache: Dict[str, Any] = {}
        self.cache_timeout = 300  # 5 Minuten
        
    async def initialize(self):
        """Initialisierung"""
        try:
            self.client = create_client(self.config.url, self.config.key)
            logger.info("Supabase-Client erfolgreich initialisiert")
        except Exception as e:
            logger.error(f"Fehler bei der Supabase-Initialisierung: {e}")
            raise
    
    async def get_table_schema(self, table_name: str) -> TableSchema:
        """Schema für eine Tabelle abrufen"""
        try:
            # Prüfe Cache
            if self._is_cache_valid(table_name):
                return self.cache[table_name]["schema"]
            
            # Schema von Supabase abrufen
            schema_data = await self._fetch_table_schema(table_name)
            rls_data = await self._fetch_rls_policies(table_name)
            
            # Schema erstellen
            schema = TableSchema(
                table=table_name,
                columns=schema_data["columns"],
                rls=rls_data,
                indexes=schema_data.get("indexes", []),
                triggers=schema_data.get("triggers", [])
            )
            
            # Cache speichern
            self._cache_schema(table_name, schema)
            
            return schema
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen des Schemas für {table_name}: {e}")
            raise
    
    async def _fetch_table_schema(self, table_name: str) -> Dict[str, Any]:
        """Tabellen-Schema von Supabase abrufen"""
        try:
            # SQL-Query für Tabellen-Schema
            query = f"""
            SELECT 
                column_name,
                data_type,
                is_nullable,
                column_default,
                character_maximum_length,
                numeric_precision,
                numeric_scale
            FROM information_schema.columns 
            WHERE table_name = '{table_name}'
            AND table_schema = 'public'
            ORDER BY ordinal_position;
            """
            
            result = await self._execute_query(query)
            
            columns = []
            for row in result:
                column = ColumnInfo(
                    name=row["column_name"],
                    type=row["data_type"],
                    not_null=row["is_nullable"] == "NO",
                    default=row["column_default"]
                )
                columns.append(column)
            
            return {
                "columns": columns,
                "indexes": [],
                "triggers": []
            }
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen des Tabellen-Schemas: {e}")
            raise
    
    async def _fetch_rls_policies(self, table_name: str) -> RLSInfo:
        """RLS-Richtlinien abrufen"""
        try:
            # Vereinfachte RLS-Richtlinien
            return RLSInfo(
                select=True,
                insert=True,
                update=True,
                delete=True
            )
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der RLS-Richtlinien: {e}")
            return RLSInfo()
    
    async def _execute_query(self, query: str) -> List[Dict[str, Any]]:
        """SQL-Query ausführen"""
        try:
            # Mock-Daten für Entwicklung
            if "invoices" in query.lower():
                return [
                    {
                        "column_name": "id",
                        "data_type": "uuid",
                        "is_nullable": "NO",
                        "column_default": "gen_random_uuid()"
                    },
                    {
                        "column_name": "customer_id",
                        "data_type": "uuid",
                        "is_nullable": "NO",
                        "column_default": None
                    },
                    {
                        "column_name": "amount",
                        "data_type": "numeric",
                        "is_nullable": "NO",
                        "column_default": None
                    },
                    {
                        "column_name": "status",
                        "data_type": "enum",
                        "is_nullable": "NO",
                        "column_default": "'open'"
                    },
                    {
                        "column_name": "notes",
                        "data_type": "text",
                        "is_nullable": "YES",
                        "column_default": None
                    },
                    {
                        "column_name": "created_at",
                        "data_type": "timestamp",
                        "is_nullable": "NO",
                        "column_default": "now()"
                    }
                ]
            elif "customers" in query.lower():
                return [
                    {
                        "column_name": "id",
                        "data_type": "uuid",
                        "is_nullable": "NO",
                        "column_default": "gen_random_uuid()"
                    },
                    {
                        "column_name": "name",
                        "data_type": "text",
                        "is_nullable": "NO",
                        "column_default": None
                    },
                    {
                        "column_name": "email",
                        "data_type": "text",
                        "is_nullable": "NO",
                        "column_default": None
                    },
                    {
                        "column_name": "phone",
                        "data_type": "text",
                        "is_nullable": "YES",
                        "column_default": None
                    }
                ]
            else:
                return []
                
        except Exception as e:
            logger.error(f"Fehler bei der Query-Ausführung: {e}")
            return []
    
    def _is_cache_valid(self, table_name: str) -> bool:
        """Prüfe Cache-Gültigkeit"""
        if table_name not in self.cache:
            return False
        
        import time
        cache_time = self.cache[table_name]["timestamp"]
        return (time.time() - cache_time) < self.cache_timeout
    
    def _cache_schema(self, table_name: str, schema: TableSchema):
        """Schema cachen"""
        import time
        self.cache[table_name] = {
            "schema": schema,
            "timestamp": time.time()
        }
    
    def clear_cache(self):
        """Cache leeren"""
        self.cache.clear()

# Globaler Schema-Provider
schema_provider: Optional[SupabaseSchemaProvider] = None

@app.get("/api/schema/{table_name}")
async def get_table_schema(table_name: str):
    """Schema für eine Tabelle abrufen"""
    try:
        if not schema_provider:
            raise HTTPException(status_code=500, detail="Schema-Provider nicht initialisiert")
        
        schema = await schema_provider.get_table_schema(table_name)
        return schema.dict()
        
    except Exception as e:
        logger.error(f"Fehler beim Abrufen des Schemas für {table_name}: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/tables")
async def list_tables():
    """Alle Tabellen auflisten"""
    try:
        # Mock-Tabellen für Entwicklung
        tables = ["invoices", "customers", "assets", "maintenance"]
        return {"tables": tables}
        
    except Exception as e:
        logger.error(f"Fehler beim Auflisten der Tabellen: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.post("/api/cache/clear")
async def clear_cache():
    """Cache leeren"""
    try:
        if schema_provider:
            schema_provider.clear_cache()
        return {"message": "Cache erfolgreich geleert"}
        
    except Exception as e:
        logger.error(f"Fehler beim Leeren des Caches: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/health")
async def health_check():
    """Health-Check-Endpunkt"""
    return {
        "status": "healthy",
        "provider_initialized": schema_provider is not None,
        "supabase_connected": schema_provider.client is not None if schema_provider else False
    }

async def main():
    """Hauptfunktion"""
    global schema_provider
    
    # Supabase-Konfiguration
    config = SupabaseConfig(
        url=SUPABASE_URL,
        key=SUPABASE_KEY,
        project_id="ftybxxndembbfjdkcsuk"
    )
    
    # Schema-Provider initialisieren
    schema_provider = SupabaseSchemaProvider(config)
    await schema_provider.initialize()
    
    logger.info("MCP Supabase Schema Server gestartet")
    
    # HTTP-Server starten
    uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    asyncio.run(main()) 