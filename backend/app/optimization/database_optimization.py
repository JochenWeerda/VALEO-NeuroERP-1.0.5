"""
Datenbank-Optimierungen für VALEO NeuroERP 2.0
Connection Pooling, Query-Optimierung und Performance-Monitoring
"""

from typing import Dict, List, Optional, Any, Callable
from contextlib import contextmanager
import time
from sqlalchemy import create_engine, event, text, pool
from sqlalchemy.orm import Session, sessionmaker, Query
from sqlalchemy.engine import Engine
from sqlalchemy.pool import QueuePool, NullPool, StaticPool
import asyncio
from concurrent.futures import ThreadPoolExecutor
import threading

from backend.app.monitoring.logging_config import get_logger, db_logger
from backend.app.monitoring.metrics import metrics_collector
from backend.app.optimization.caching import query_cache
import os

logger = get_logger("database.optimization")

class DatabaseConfig:
    """Datenbank-Konfiguration für Optimierungen"""
    
    def __init__(
        self,
        # Connection Pool
        pool_size: int = 20,
        max_overflow: int = 10,
        pool_timeout: float = 30.0,
        pool_recycle: int = 3600,
        pool_pre_ping: bool = True,
        
        # Query-Optimierung
        echo_pool: bool = False,
        query_cache_size: int = 1000,
        enable_query_cache: bool = True,
        
        # Performance
        statement_timeout: int = 30000,  # ms
        lock_timeout: int = 10000,  # ms
        idle_in_transaction_timeout: int = 60000,  # ms
        
        # Monitoring
        enable_slow_query_log: bool = True,
        slow_query_threshold: float = 1.0,  # seconds
    ):
        self.pool_size = pool_size
        self.max_overflow = max_overflow
        self.pool_timeout = pool_timeout
        self.pool_recycle = pool_recycle
        self.pool_pre_ping = pool_pre_ping
        
        self.echo_pool = echo_pool
        self.query_cache_size = query_cache_size
        self.enable_query_cache = enable_query_cache
        
        self.statement_timeout = statement_timeout
        self.lock_timeout = lock_timeout
        self.idle_in_transaction_timeout = idle_in_transaction_timeout
        
        self.enable_slow_query_log = enable_slow_query_log
        self.slow_query_threshold = slow_query_threshold

class OptimizedDatabaseEngine:
    """Optimierte Datenbank-Engine mit erweiterten Features"""
    
    def __init__(self, database_url: str, config: DatabaseConfig):
        self.database_url = database_url
        self.config = config
        self._engine: Optional[Engine] = None
        self._session_factory: Optional[sessionmaker] = None
        self._thread_pool = ThreadPoolExecutor(max_workers=config.pool_size)
        
        # Query Statistics
        self.query_stats = {
            "total_queries": 0,
            "slow_queries": 0,
            "cache_hits": 0,
            "cache_misses": 0,
            "total_query_time": 0.0,
        }
        self._stats_lock = threading.Lock()
    
    @property
    def engine(self) -> Engine:
        """Lazy-Loading der Engine"""
        if self._engine is None:
            self._engine = self._create_engine()
            self._setup_event_listeners()
            self._configure_database()
        return self._engine
    
    @property
    def session_factory(self) -> sessionmaker:
        """Session Factory mit Optimierungen"""
        if self._session_factory is None:
            self._session_factory = sessionmaker(
                bind=self.engine,
                expire_on_commit=False,  # Verhindert unnötige Reloads
                class_=OptimizedSession
            )
        return self._session_factory
    
    def _create_engine(self) -> Engine:
        """Erstellt optimierte Engine"""
        # Pool-Klasse basierend auf Datenbank-Typ
        if self.database_url.startswith("sqlite"):
            # SQLite unterstützt kein Connection Pooling
            poolclass = StaticPool if ":memory:" in self.database_url else NullPool
        else:
            poolclass = QueuePool
        
        # Engine-Argumente
        engine_args = {
            "poolclass": poolclass,
            "echo_pool": self.config.echo_pool,
            "future": True,  # SQLAlchemy 2.0 Style
        }
        
        # Pool-Konfiguration für unterstützte Datenbanken
        if poolclass == QueuePool:
            engine_args.update({
                "pool_size": self.config.pool_size,
                "max_overflow": self.config.max_overflow,
                "pool_timeout": self.config.pool_timeout,
                "pool_recycle": self.config.pool_recycle,
                "pool_pre_ping": self.config.pool_pre_ping,
            })
        
        # PostgreSQL-spezifische Optionen
        if self.database_url.startswith("postgresql"):
            engine_args["connect_args"] = {
                "server_settings": {
                    "jit": "off",  # JIT kann manchmal langsamer sein
                    "application_name": "valeo_neuroerp",
                },
                "command_timeout": self.config.statement_timeout / 1000,
                "options": f"-c statement_timeout={self.config.statement_timeout}",
            }
        
        return create_engine(self.database_url, **engine_args)
    
    def _setup_event_listeners(self):
        """Registriert Event-Listener für Monitoring"""
        
        # Connection Events
        @event.listens_for(self.engine, "connect")
        def receive_connect(dbapi_conn, connection_record):
            """Bei neuer Verbindung"""
            connection_record.info['connect_time'] = time.time()
            
            # PostgreSQL-spezifische Einstellungen
            if self.database_url.startswith("postgresql"):
                with dbapi_conn.cursor() as cursor:
                    cursor.execute(f"SET statement_timeout = {self.config.statement_timeout}")
                    cursor.execute(f"SET lock_timeout = {self.config.lock_timeout}")
                    cursor.execute(f"SET idle_in_transaction_session_timeout = {self.config.idle_in_transaction_timeout}")
        
        @event.listens_for(self.engine, "checkout")
        def receive_checkout(dbapi_conn, connection_record, connection_proxy):
            """Wenn Verbindung aus Pool geholt wird"""
            # Update Metrics
            metrics_collector.update_db_metrics(
                active=self.engine.pool.size() - self.engine.pool.checkedin(),
                idle=self.engine.pool.checkedin()
            )
        
        @event.listens_for(self.engine, "checkin")
        def receive_checkin(dbapi_conn, connection_record):
            """Wenn Verbindung zurück in Pool geht"""
            # Update Metrics
            metrics_collector.update_db_metrics(
                active=self.engine.pool.size() - self.engine.pool.checkedin(),
                idle=self.engine.pool.checkedin()
            )
        
        # Query Events
        @event.listens_for(self.engine, "before_cursor_execute")
        def before_cursor_execute(conn, cursor, statement, parameters, context, executemany):
            """Vor Query-Ausführung"""
            conn.info.setdefault('query_start_time', []).append(time.time())
            conn.info.setdefault('current_query', []).append(statement)
        
        @event.listens_for(self.engine, "after_cursor_execute")
        def after_cursor_execute(conn, cursor, statement, parameters, context, executemany):
            """Nach Query-Ausführung"""
            total_time = time.time() - conn.info['query_start_time'].pop(-1)
            conn.info['current_query'].pop(-1)
            
            # Update Statistics
            with self._stats_lock:
                self.query_stats["total_queries"] += 1
                self.query_stats["total_query_time"] += total_time
            
            # Log slow queries
            if total_time > self.config.slow_query_threshold:
                with self._stats_lock:
                    self.query_stats["slow_queries"] += 1
                
                logger.warning(
                    "Slow query detected",
                    query=statement[:200],
                    duration=total_time,
                    parameters=parameters
                )
                
                # Performance-Metriken
                if hasattr(context, 'compiled') and hasattr(context.compiled, 'statement'):
                    table_name = self._extract_table_name(statement)
                    metrics_collector.record_db_query(
                        query_type=self._get_query_type(statement),
                        table=table_name or "unknown",
                        duration=total_time,
                        success=True
                    )
            
            # Database Query Logger
            db_logger.log_query(statement, parameters or {}, total_time)
    
    def _configure_database(self):
        """Konfiguriert datenbankspezifische Optimierungen"""
        with self.engine.connect() as conn:
            # PostgreSQL Optimierungen
            if self.database_url.startswith("postgresql"):
                # Autovacuum aggressiver für Tabellen mit vielen Updates
                conn.execute(text("""
                    ALTER TABLE customers SET (autovacuum_vacuum_scale_factor = 0.1);
                    ALTER TABLE articles SET (autovacuum_vacuum_scale_factor = 0.1);
                    ALTER TABLE invoices SET (autovacuum_vacuum_scale_factor = 0.1);
                """))
                
                # Work Memory für komplexe Queries
                conn.execute(text("SET work_mem = '256MB'"))
                
                # Parallelität aktivieren
                conn.execute(text("SET max_parallel_workers_per_gather = 4"))
                
            # MySQL/MariaDB Optimierungen
            elif self.database_url.startswith("mysql"):
                conn.execute(text("SET SESSION query_cache_type = ON"))
                conn.execute(text("SET SESSION query_cache_size = 268435456"))  # 256MB
                
                # InnoDB Buffer Pool
                conn.execute(text("SET GLOBAL innodb_buffer_pool_size = 2147483648"))  # 2GB
    
    @contextmanager
    def get_session(self) -> Session:
        """Context Manager für optimierte Sessions"""
        session = self.session_factory()
        try:
            yield session
            session.commit()
        except Exception:
            session.rollback()
            raise
        finally:
            session.close()
    
    def _extract_table_name(self, query: str) -> Optional[str]:
        """Extrahiert Tabellennamen aus Query"""
        query_upper = query.upper()
        
        # Einfache Extraktion für häufige Patterns
        if "FROM" in query_upper:
            parts = query_upper.split("FROM")
            if len(parts) > 1:
                table_part = parts[1].strip().split()[0]
                return table_part.lower().strip('"')
        
        for keyword in ["UPDATE", "INSERT INTO", "DELETE FROM"]:
            if keyword in query_upper:
                parts = query_upper.split(keyword)
                if len(parts) > 1:
                    table_part = parts[1].strip().split()[0]
                    return table_part.lower().strip('"')
        
        return None
    
    def _get_query_type(self, query: str) -> str:
        """Bestimmt Query-Typ"""
        query_start = query.strip().upper()[:10]
        
        if query_start.startswith("SELECT"):
            return "SELECT"
        elif query_start.startswith("INSERT"):
            return "INSERT"
        elif query_start.startswith("UPDATE"):
            return "UPDATE"
        elif query_start.startswith("DELETE"):
            return "DELETE"
        else:
            return "OTHER"
    
    def get_pool_status(self) -> Dict[str, Any]:
        """Gibt Pool-Status zurück"""
        if hasattr(self.engine.pool, 'size'):
            return {
                "size": self.engine.pool.size(),
                "checked_in": self.engine.pool.checkedin(),
                "overflow": self.engine.pool.overflow(),
                "total": self.engine.pool.size() + self.engine.pool.overflow(),
                "checked_out": self.engine.pool.size() - self.engine.pool.checkedin()
            }
        return {}
    
    def get_query_statistics(self) -> Dict[str, Any]:
        """Gibt Query-Statistiken zurück"""
        with self._stats_lock:
            stats = self.query_stats.copy()
            
        # Berechnete Metriken
        if stats["total_queries"] > 0:
            stats["avg_query_time"] = stats["total_query_time"] / stats["total_queries"]
            stats["slow_query_percentage"] = (stats["slow_queries"] / stats["total_queries"]) * 100
            stats["cache_hit_rate"] = (stats["cache_hits"] / (stats["cache_hits"] + stats["cache_misses"])) * 100 if (stats["cache_hits"] + stats["cache_misses"]) > 0 else 0
        else:
            stats["avg_query_time"] = 0
            stats["slow_query_percentage"] = 0
            stats["cache_hit_rate"] = 0
        
        return stats
    
    def reset_statistics(self):
        """Setzt Statistiken zurück"""
        with self._stats_lock:
            self.query_stats = {
                "total_queries": 0,
                "slow_queries": 0,
                "cache_hits": 0,
                "cache_misses": 0,
                "total_query_time": 0.0,
            }
    
    async def execute_async(self, func: Callable, *args, **kwargs) -> Any:
        """Führt Datenbank-Operation asynchron aus"""
        loop = asyncio.get_event_loop()
        return await loop.run_in_executor(self._thread_pool, func, *args, **kwargs)
    
    def close(self):
        """Schließt Engine und Pools"""
        if self._engine:
            self._engine.dispose()
        self._thread_pool.shutdown(wait=True)

class OptimizedSession(Session):
    """Erweiterte Session mit Caching und Optimierungen"""
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._query_cache = {}
        self._cache_enabled = True
    
    def query(self, *entities, **kwargs) -> Query:
        """Überschriebene query-Methode mit Caching"""
        query = super().query(*entities, **kwargs)
        return OptimizedQuery(query, self)
    
    def enable_cache(self):
        """Aktiviert Session-Cache"""
        self._cache_enabled = True
    
    def disable_cache(self):
        """Deaktiviert Session-Cache"""
        self._cache_enabled = False
    
    def clear_cache(self):
        """Leert Session-Cache"""
        self._query_cache.clear()

class OptimizedQuery(Query):
    """Erweiterte Query mit Caching und Optimierungen"""
    
    def __init__(self, query: Query, session: OptimizedSession):
        self._query = query
        self._session = session
        self._cache_key = None
        self._cache_ttl = 300  # 5 Minuten default
        
        # Kopiere alle Attribute
        for attr in dir(query):
            if not attr.startswith('_') and not hasattr(self, attr):
                setattr(self, attr, getattr(query, attr))
    
    def cache(self, ttl: int = 300) -> 'OptimizedQuery':
        """Aktiviert Caching für diese Query"""
        self._cache_ttl = ttl
        return self
    
    def _generate_cache_key(self) -> str:
        """Generiert Cache-Key für Query"""
        # Vereinfachte Implementierung
        statement = str(self._query.statement)
        params = str(self._query.statement.compile().params)
        return f"query:{hash(statement + params)}"
    
    def all(self):
        """Überschriebene all() mit Caching"""
        if self._session._cache_enabled and query_cache.cache.config.enable_query_cache:
            cache_key = self._generate_cache_key()
            
            # Check Cache
            cached_result = query_cache.get_query_result(
                str(self._query.statement),
                dict(self._query.statement.compile().params)
            )
            
            if cached_result is not None:
                self._session.bind.dialect.do_execute(
                    context=None, 
                    cursor=None, 
                    statement="-- CACHE HIT --", 
                    parameters=None
                )
                return cached_result
            
            # Execute Query
            result = self._query.all()
            
            # Cache Result
            query_cache.set_query_result(
                str(self._query.statement),
                result,
                dict(self._query.statement.compile().params),
                self._cache_ttl
            )
            
            return result
        
        return self._query.all()
    
    def first(self):
        """Überschriebene first() mit Caching"""
        # Ähnliche Implementierung wie all()
        results = self.limit(1).all()
        return results[0] if results else None
    
    def one(self):
        """Überschriebene one() mit Caching"""
        results = self.all()
        if len(results) != 1:
            raise Exception(f"Expected one result, got {len(results)}")
        return results[0]
    
    def count(self):
        """Optimierter count()"""
        # Verwende COUNT(*) anstatt alle Zeilen zu laden
        from sqlalchemy import func
        return self._query.with_entities(func.count()).scalar()

# Index-Advisor

class IndexAdvisor:
    """Analysiert Queries und schlägt Indizes vor"""
    
    def __init__(self, engine: Engine):
        self.engine = engine
        self.missing_indexes = []
    
    def analyze_query_plan(self, query: str, params: Optional[Dict] = None) -> Dict[str, Any]:
        """Analysiert Query-Ausführungsplan"""
        with self.engine.connect() as conn:
            if self.engine.dialect.name == "postgresql":
                # EXPLAIN ANALYZE
                explain_query = f"EXPLAIN (ANALYZE, BUFFERS) {query}"
                result = conn.execute(text(explain_query), params or {})
                plan = [row[0] for row in result]
                
                # Analysiere Plan
                analysis = {
                    "plan": plan,
                    "uses_index": any("Index" in line for line in plan),
                    "seq_scans": [line for line in plan if "Seq Scan" in line],
                    "index_scans": [line for line in plan if "Index Scan" in line],
                    "sort_operations": [line for line in plan if "Sort" in line],
                    "hash_joins": [line for line in plan if "Hash Join" in line],
                }
                
                # Empfehlungen
                recommendations = []
                
                if analysis["seq_scans"]:
                    recommendations.append("Consider adding indexes for sequential scan operations")
                
                if analysis["sort_operations"]:
                    recommendations.append("Consider adding indexes for ORDER BY columns")
                
                analysis["recommendations"] = recommendations
                
                return analysis
            
            # Für andere Datenbanken
            return {"plan": ["Query plan analysis not supported for this database"]}
    
    def suggest_indexes(self, table_name: str) -> List[str]:
        """Schlägt Indizes für eine Tabelle vor"""
        suggestions = []
        
        with self.engine.connect() as conn:
            if self.engine.dialect.name == "postgresql":
                # Analysiere häufige Queries ohne Index
                query = text("""
                    SELECT 
                        schemaname,
                        tablename,
                        attname,
                        n_distinct,
                        most_common_vals
                    FROM pg_stats
                    WHERE tablename = :table_name
                    AND n_distinct > 10
                    AND attname NOT IN (
                        SELECT column_name
                        FROM information_schema.constraint_column_usage
                        WHERE table_name = :table_name
                    )
                """)
                
                result = conn.execute(query, {"table_name": table_name})
                
                for row in result:
                    if row.n_distinct > 100:  # Hohe Kardinalität
                        suggestions.append(
                            f"CREATE INDEX idx_{table_name}_{row.attname} "
                            f"ON {table_name}({row.attname});"
                        )
        
        return suggestions

# Globale Instanz
db_config = DatabaseConfig()
optimized_db = OptimizedDatabaseEngine(
    database_url=os.getenv("DATABASE_URL", "postgresql://localhost/valeo_neuroerp"),
    config=db_config
)
index_advisor = IndexAdvisor(optimized_db.engine)