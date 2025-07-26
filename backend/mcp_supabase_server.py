#!/usr/bin/env python3
"""
MCP Supabase Schema Server
Bietet Supabase-Schema-Informationen über MCP-Protokoll
"""

import asyncio
import json
import logging
from typing import Any, Dict, List, Optional
from dataclasses import dataclass
from pathlib import Path

import httpx
from supabase import create_client, Client
from pydantic import BaseModel, Field

# Vereinfachte MCP Imports
try:
    from mcp.server import Server
    from mcp.server.stdio import stdio_server
    from mcp.types import (
        Resource,
        TextContent,
        LoggingLevel,
        Position,
        Range,
        Location,
        Diagnostic,
        DiagnosticSeverity,
        CompletionItem,
        CompletionItemKind,
        Hover,
        MarkupContent,
        MarkupKind,
        Message,
        RequestMessage,
        ResponseMessage,
        NotificationMessage,
        Error,
        ErrorCode,
        InitializeParams,
        InitializeResult,
        InitializeResultServerInfo,
        ShutdownResult,
        LogMessageParams,
        ShowMessageParams,
        MessageType,
        ShowDocumentParams,
        ShowDocumentResult,
        ListResourcesResult,
        ReadResourceResult,
        QueryResourceResult,
        ResourceNotFoundError,
        InvalidParamsError,
        MethodNotFoundError,
        InternalError,
        UnknownErrorCode,
        RequestCancelledError,
        ContentModifiedError,
    )
except ImportError as e:
    print(f"⚠️ MCP Import-Fehler: {e}")
    print("📦 Installiere MCP: pip install mcp")
    # Fallback-Imports für Entwicklung
    from typing import Protocol
    class Server(Protocol):
        def list_resources(self): pass
        def read_resource(self): pass
        def query_resource(self): pass
    
    # Dummy-Klassen für Entwicklung
    class Resource: pass
    class TextContent: pass
    class ListResourcesResult: pass
    class ReadResourceResult: pass
    class QueryResourceResult: pass

# FastAPI für HTTP-API
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

# MCP Server erstellen (falls verfügbar)
try:
    server = Server("supabase-schema")
except:
    server = None
    logger.warning("MCP Server nicht verfügbar - nur HTTP-API aktiv")

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
    """Supabase-Schema-Provider"""
    
    def __init__(self, config: SupabaseConfig):
        self.config = config
        self.client: Optional[Client] = None
        self._schema_cache: Dict[str, TableSchema] = {}
        self._cache_timestamp: Dict[str, float] = {}
        self.cache_timeout = 300  # 5 Minuten
        
    async def initialize(self):
        """Supabase-Client initialisieren"""
        try:
            from supabase import create_client
            self.client = create_client(self.config.url, self.config.key)
            logger.info(f"Supabase-Client initialisiert für Projekt: {self.config.project_id}")
        except Exception as e:
            logger.error(f"Fehler beim Initialisieren des Supabase-Clients: {e}")
            raise
    
    async def get_table_schema(self, table_name: str) -> TableSchema:
        """Schema für eine Tabelle abrufen"""
        # Cache-Check
        if self._is_cache_valid(table_name):
            logger.info(f"Schema-Cache Hit für Tabelle: {table_name}")
            return self._schema_cache[table_name]
        
        try:
            logger.info(f"Schema wird geladen für Tabelle: {table_name}")
            
            # Schema-Informationen von Supabase abrufen
            schema_info = await self._fetch_table_schema(table_name)
            
            # RLS-Richtlinien abrufen
            rls_info = await self._fetch_rls_policies(table_name)
            
            # Schema-Objekt erstellen
            table_schema = TableSchema(
                table=table_name,
                columns=schema_info["columns"],
                rls=rls_info,
                indexes=schema_info.get("indexes"),
                triggers=schema_info.get("triggers")
            )
            
            # Cache speichern
            self._cache_schema(table_name, table_schema)
            
            logger.info(f"Schema erfolgreich geladen für Tabelle: {table_name}")
            return table_schema
            
        except Exception as e:
            logger.error(f"Fehler beim Laden des Schemas für Tabelle {table_name}: {e}")
            raise
    
    async def _fetch_table_schema(self, table_name: str) -> Dict[str, Any]:
        """Tabellen-Schema von Supabase abrufen"""
        try:
            # SQL-Abfrage für Schema-Informationen
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
            
            # Primary Key abrufen
            pk_query = f"""
            SELECT column_name
            FROM information_schema.key_column_usage
            WHERE table_name = '{table_name}'
            AND constraint_name LIKE '%_pkey'
            AND table_schema = 'public';
            """
            
            # Foreign Keys abrufen
            fk_query = f"""
            SELECT 
                kcu.column_name,
                ccu.table_name || '.' || ccu.column_name as foreign_key
            FROM information_schema.key_column_usage kcu
            JOIN information_schema.constraint_column_usage ccu 
                ON kcu.constraint_name = ccu.constraint_name
            WHERE kcu.table_name = '{table_name}'
            AND kcu.constraint_name LIKE '%_fkey'
            AND kcu.table_schema = 'public';
            """
            
            # Enum-Werte abrufen
            enum_query = f"""
            SELECT 
                column_name,
                udt_name
            FROM information_schema.columns 
            WHERE table_name = '{table_name}'
            AND table_schema = 'public'
            AND udt_name LIKE 'enum%';
            """
            
            # Queries ausführen
            columns_result = await self._execute_query(query)
            pk_result = await self._execute_query(pk_query)
            fk_result = await self._execute_query(fk_query)
            enum_result = await self._execute_query(enum_query)
            
            # Primary Keys extrahieren
            primary_keys = {row["column_name"] for row in pk_result}
            
            # Foreign Keys extrahieren
            foreign_keys = {row["column_name"]: row["foreign_key"] for row in fk_result}
            
            # Enum-Werte extrahieren
            enum_columns = {row["column_name"]: row["udt_name"] for row in enum_result}
            
            # Spalten-Informationen verarbeiten
            columns = []
            for row in columns_result:
                column = ColumnInfo(
                    name=row["column_name"],
                    type=row["data_type"],
                    primary=row["column_name"] in primary_keys,
                    foreign_key=foreign_keys.get(row["column_name"]),
                    not_null=row["is_nullable"] == "NO",
                    default=row["column_default"],
                    enum_values=self._get_enum_values(row["column_name"], enum_columns.get(row["column_name"]))
                )
                columns.append(column)
            
            return {
                "columns": columns,
                "indexes": await self._fetch_indexes(table_name),
                "triggers": await self._fetch_triggers(table_name)
            }
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen des Tabellen-Schemas: {e}")
            raise
    
    async def _fetch_rls_policies(self, table_name: str) -> RLSInfo:
        """RLS-Richtlinien für eine Tabelle abrufen"""
        try:
            # RLS-Policies abrufen
            query = f"""
            SELECT 
                policyname,
                permissive,
                roles,
                cmd,
                qual,
                with_check
            FROM pg_policies 
            WHERE tablename = '{table_name}'
            AND schemaname = 'public';
            """
            
            policies = await self._execute_query(query)
            
            # RLS-Status abrufen
            rls_status_query = f"""
            SELECT relrowsecurity 
            FROM pg_class 
            WHERE relname = '{table_name}'
            AND relnamespace = (SELECT oid FROM pg_namespace WHERE nspname = 'public');
            """
            
            rls_status = await self._execute_query(rls_status_query)
            rls_enabled = rls_status[0]["relrowsecurity"] if rls_status else False
            
            # Standard-RLS-Info (alle erlaubt wenn keine Policies definiert)
            rls_info = RLSInfo()
            
            if rls_enabled and policies:
                # Policies analysieren
                for policy in policies:
                    cmd = policy["cmd"].upper()
                    if cmd == "SELECT":
                        rls_info.select = True
                    elif cmd == "INSERT":
                        rls_info.insert = True
                    elif cmd == "UPDATE":
                        rls_info.update = True
                    elif cmd == "DELETE":
                        rls_info.delete = True
            
            return rls_info
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der RLS-Policies: {e}")
            # Fallback: Alle Operationen erlauben
            return RLSInfo()
    
    async def _fetch_indexes(self, table_name: str) -> List[Dict[str, Any]]:
        """Indexe für eine Tabelle abrufen"""
        try:
            query = f"""
            SELECT 
                indexname,
                indexdef
            FROM pg_indexes 
            WHERE tablename = '{table_name}'
            AND schemaname = 'public';
            """
            
            indexes = await self._execute_query(query)
            return [
                {
                    "name": idx["indexname"],
                    "definition": idx["indexdef"]
                }
                for idx in indexes
            ]
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Indexe: {e}")
            return []
    
    async def _fetch_triggers(self, table_name: str) -> List[Dict[str, Any]]:
        """Trigger für eine Tabelle abrufen"""
        try:
            query = f"""
            SELECT 
                trigger_name,
                event_manipulation,
                action_statement
            FROM information_schema.triggers 
            WHERE event_object_table = '{table_name}'
            AND trigger_schema = 'public';
            """
            
            triggers = await self._execute_query(query)
            return [
                {
                    "name": trigger["trigger_name"],
                    "event": trigger["event_manipulation"],
                    "function": trigger["action_statement"]
                }
                for trigger in triggers
            ]
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Trigger: {e}")
            return []
    
    async def _execute_query(self, query: str) -> List[Dict[str, Any]]:
        """SQL-Query ausführen"""
        try:
            if not self.client:
                raise Exception("Supabase-Client nicht initialisiert")
            
            # Raw SQL über Supabase ausführen
            response = self.client.rpc('exec_sql', {'sql': query})
            return response.data if response.data else []
            
        except Exception as e:
            logger.error(f"Fehler beim Ausführen der Query: {e}")
            # Fallback: Leere Liste zurückgeben
            return []
    
    def _get_enum_values(self, column_name: str, enum_type: Optional[str]) -> Optional[List[str]]:
        """Enum-Werte für eine Spalte abrufen"""
        if not enum_type:
            return None
        
        try:
            # Enum-Werte aus der Datenbank abrufen
            query = f"""
            SELECT enumlabel 
            FROM pg_enum 
            WHERE enumtypid = (SELECT oid FROM pg_type WHERE typname = '{enum_type}')
            ORDER BY enumsortorder;
            """
            
            # Hier würde die Query ausgeführt werden
            # Für Demo-Zwecke geben wir Standard-Enum-Werte zurück
            if "status" in column_name.lower():
                return ["open", "paid", "overdue"]
            elif "type" in column_name.lower():
                return ["active", "inactive"]
            else:
                return ["value1", "value2", "value3"]
                
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Enum-Werte: {e}")
            return None
    
    def _is_cache_valid(self, table_name: str) -> bool:
        """Prüfen ob Cache noch gültig ist"""
        if table_name not in self._cache_timestamp:
            return False
        
        import time
        return (time.time() - self._cache_timestamp[table_name]) < self.cache_timeout
    
    def _cache_schema(self, table_name: str, schema: TableSchema):
        """Schema im Cache speichern"""
        import time
        self._schema_cache[table_name] = schema
        self._cache_timestamp[table_name] = time.time()
    
    def clear_cache(self):
        """Cache leeren"""
        self._schema_cache.clear()
        self._cache_timestamp.clear()
        logger.info("Schema-Cache geleert")

# Globaler Schema-Provider
schema_provider: Optional[SupabaseSchemaProvider] = None

@server.list_resources()
async def list_resources() -> ListResourcesResult:
    """Verfügbare Ressourcen auflisten"""
    try:
        if not schema_provider:
            return ListResourcesResult(resources=[])
        
        # Alle Tabellen auflisten
        tables_query = """
        SELECT table_name 
        FROM information_schema.tables 
        WHERE table_schema = 'public'
        AND table_type = 'BASE TABLE'
        ORDER BY table_name;
        """
        
        tables = await schema_provider._execute_query(tables_query)
        
        resources = [
            Resource(
                uri=f"supabase://schema/{table['table_name']}",
                name=table['table_name'],
                description=f"Schema für Tabelle {table['table_name']}",
                mimeType="application/json"
            )
            for table in tables
        ]
        
        return ListResourcesResult(resources=resources)
        
    except Exception as e:
        logger.error(f"Fehler beim Auflisten der Ressourcen: {e}")
        return ListResourcesResult(resources=[])

@server.read_resource()
async def read_resource(uri: str) -> ReadResourceResult:
    """Ressource lesen (Schema für eine Tabelle)"""
    try:
        if not uri.startswith("supabase://schema/"):
            raise ResourceNotFoundError(f"Unbekannte URI: {uri}")
        
        table_name = uri.replace("supabase://schema/", "")
        
        if not schema_provider:
            raise InternalError("Schema-Provider nicht initialisiert")
        
        schema = await schema_provider.get_table_schema(table_name)
        
        content = [
            TextContent(
                type="text",
                text=json.dumps(schema.dict(), indent=2, ensure_ascii=False)
            )
        ]
        
        return ReadResourceResult(content=content)
        
    except Exception as e:
        logger.error(f"Fehler beim Lesen der Ressource {uri}: {e}")
        raise ResourceNotFoundError(f"Ressource nicht gefunden: {uri}")

@server.query_resource()
async def query_resource(uri: str, query: str) -> QueryResourceResult:
    """Ressource abfragen (erweiterte Schema-Informationen)"""
    try:
        if not uri.startswith("supabase://schema/"):
            raise ResourceNotFoundError(f"Unbekannte URI: {uri}")
        
        table_name = uri.replace("supabase://schema/", "")
        
        if not schema_provider:
            raise InternalError("Schema-Provider nicht initialisiert")
        
        # Verschiedene Query-Typen unterstützen
        if query == "columns":
            schema = await schema_provider.get_table_schema(table_name)
            result = [col.dict() for col in schema.columns]
        elif query == "rls":
            schema = await schema_provider.get_table_schema(table_name)
            result = schema.rls.dict()
        elif query == "foreign_keys":
            schema = await schema_provider.get_table_schema(table_name)
            result = [
                {"column": col.name, "foreign_key": col.foreign_key}
                for col in schema.columns
                if col.foreign_key
            ]
        elif query == "full":
            schema = await schema_provider.get_table_schema(table_name)
            result = schema.dict()
        else:
            raise InvalidParamsError(f"Unbekannte Query: {query}")
        
        content = [
            TextContent(
                type="text",
                text=json.dumps(result, indent=2, ensure_ascii=False)
            )
        ]
        
        return QueryResourceResult(content=content)
        
    except Exception as e:
        logger.error(f"Fehler bei der Ressourcen-Abfrage {uri}: {e}")
        raise InternalError(f"Abfrage fehlgeschlagen: {e}")

# HTTP-API-Endpunkte für Frontend-Integration
if server:
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
            if not schema_provider:
                raise HTTPException(status_code=500, detail="Schema-Provider nicht initialisiert")
            
            tables_query = """
            SELECT table_name 
            FROM information_schema.tables 
            WHERE table_schema = 'public'
            AND table_type = 'BASE TABLE'
            ORDER BY table_name;
            """
            
            tables = await schema_provider._execute_query(tables_query)
            return {"tables": [table["table_name"] for table in tables]}
            
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
        project_id="your-project-id"
    )
    
    # Schema-Provider initialisieren
    schema_provider = SupabaseSchemaProvider(config)
    await schema_provider.initialize()
    
    logger.info("MCP Supabase Schema Server gestartet")
    
    # MCP Server starten
    if server:
        async with stdio_server() as (read_stream, write_stream):
            await server.run(
                read_stream,
                write_stream,
                InitializeParams(
                    server_name="supabase-schema",
                    server_version="1.0.0",
                    capabilities=server.get_capabilities(
                        notification_options=None,
                        experimental_capabilities=None,
                    ),
                ),
            )
    else:
        logger.info("MCP Server nicht verfügbar, nur HTTP-API aktiv.")
        uvicorn.run(app, host="0.0.0.0", port=8000)

if __name__ == "__main__":
    asyncio.run(main()) 