"""
Enterprise-Grade Database Connection Pooling für ValeoFlow
Optimierte Verbindungsverwaltung für bessere Performance und Skalierbarkeit
"""

import os
import time
import logging
from contextlib import contextmanager
from typing import Optional, Generator
from sqlalchemy import create_engine, event
from sqlalchemy.orm import sessionmaker, Session
from sqlalchemy.pool import QueuePool, StaticPool
from sqlalchemy.exc import SQLAlchemyError, DisconnectionError
from dotenv import load_dotenv

load_dotenv()

# Logging Setup
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class DatabaseConnectionManager:
    """Enterprise-Grade Database Connection Manager"""
    
    def __init__(self):
        self.engine = None
        self.SessionLocal = None
        self.connection_stats = {
            "total_connections": 0,
            "active_connections": 0,
            "failed_connections": 0,
            "connection_errors": 0
        }
        self._setup_engine()
    
    def _setup_engine(self):
        """Database Engine mit optimierten Connection Pool-Einstellungen"""
        database_url = os.getenv("DATABASE_URL", "postgresql://user:password@localhost/valeoflow")
        
        # Connection Pool Konfiguration
        pool_config = {
            "poolclass": QueuePool,
            "pool_size": int(os.getenv("DB_POOL_SIZE", "20")),  # Maximale Anzahl Verbindungen
            "max_overflow": int(os.getenv("DB_MAX_OVERFLOW", "30")),  # Zusätzliche Verbindungen
            "pool_timeout": int(os.getenv("DB_POOL_TIMEOUT", "30")),  # Timeout für Verbindungsanfrage
            "pool_recycle": int(os.getenv("DB_POOL_RECYCLE", "3600")),  # Verbindungen nach 1h recyceln
            "pool_pre_ping": True,  # Verbindungen vor Verwendung testen
            "echo": os.getenv("DB_ECHO", "false").lower() == "true"  # SQL-Logging
        }
        
        try:
            self.engine = create_engine(database_url, **pool_config)
            self.SessionLocal = sessionmaker(
                autocommit=False,
                autoflush=False,
                bind=self.engine
            )
            
            # Event Listeners für Monitoring
            self._setup_event_listeners()
            
            logger.info("Database connection pool initialized successfully")
            logger.info(f"Pool configuration: {pool_config}")
            
        except Exception as e:
            logger.error(f"Failed to initialize database connection pool: {e}")
            raise
    
    def _setup_event_listeners(self):
        """Event Listeners für Connection Pool Monitoring"""
        
        @event.listens_for(self.engine, "connect")
        def receive_connect(dbapi_connection, connection_record):
            """Verbindung hergestellt"""
            self.connection_stats["total_connections"] += 1
            self.connection_stats["active_connections"] += 1
            logger.debug("Database connection established")
        
        @event.listens_for(self.engine, "checkout")
        def receive_checkout(dbapi_connection, connection_record, connection_proxy):
            """Verbindung aus Pool entnommen"""
            logger.debug("Database connection checked out from pool")
        
        @event.listens_for(self.engine, "checkin")
        def receive_checkin(dbapi_connection, connection_record):
            """Verbindung zurück in Pool"""
            self.connection_stats["active_connections"] -= 1
            logger.debug("Database connection returned to pool")
        
        @event.listens_for(self.engine, "disconnect")
        def receive_disconnect(dbapi_connection, connection_record):
            """Verbindung getrennt"""
            self.connection_stats["active_connections"] -= 1
            logger.debug("Database connection disconnected")
    
    def get_session(self) -> Session:
        """Database Session abrufen"""
        if not self.SessionLocal:
            raise RuntimeError("Database session factory not initialized")
        
        return self.SessionLocal()
    
    @contextmanager
    def get_db_session(self) -> Generator[Session, None, None]:
        """Context Manager für Database Sessions mit automatischem Cleanup"""
        session = self.get_session()
        try:
            yield session
            session.commit()
        except Exception as e:
            session.rollback()
            logger.error(f"Database session error: {e}")
            self.connection_stats["connection_errors"] += 1
            raise
        finally:
            session.close()
    
    def test_connection(self) -> bool:
        """Database-Verbindung testen"""
        try:
            with self.get_db_session() as session:
                session.execute("SELECT 1")
                return True
        except Exception as e:
            logger.error(f"Database connection test failed: {e}")
            self.connection_stats["failed_connections"] += 1
            return False
    
    def get_connection_stats(self) -> dict:
        """Connection Pool Statistiken abrufen"""
        if self.engine:
            pool = self.engine.pool
            return {
                **self.connection_stats,
                "pool_size": pool.size(),
                "checked_in": pool.checkedin(),
                "checked_out": pool.checkedout(),
                "overflow": pool.overflow(),
                "invalid": pool.invalid()
            }
        return self.connection_stats
    
    def health_check(self) -> dict:
        """Database Health Check"""
        start_time = time.time()
        connection_ok = self.test_connection()
        response_time = (time.time() - start_time) * 1000  # in ms
        
        return {
            "status": "healthy" if connection_ok else "unhealthy",
            "response_time_ms": round(response_time, 2),
            "connection_stats": self.get_connection_stats(),
            "timestamp": time.time()
        }
    
    def optimize_pool(self):
        """Connection Pool optimieren"""
        if not self.engine:
            return
        
        pool = self.engine.pool
        stats = self.get_connection_stats()
        
        # Prüfe Pool-Auslastung
        utilization = stats["checked_out"] / pool.size() if pool.size() > 0 else 0
        
        if utilization > 0.8:  # 80% Auslastung
            logger.warning(f"High pool utilization: {utilization:.2%}")
            # Hier könnten automatische Anpassungen erfolgen
        
        # Prüfe invalide Verbindungen
        if stats["invalid"] > 0:
            logger.warning(f"Invalid connections detected: {stats['invalid']}")
            # Pool invalidieren und neu erstellen
            pool.dispose()
    
    def close_all_connections(self):
        """Alle Database-Verbindungen schließen"""
        if self.engine:
            self.engine.dispose()
            logger.info("All database connections closed")

# Global Database Manager Instance
db_manager = DatabaseConnectionManager()

def get_db() -> Generator[Session, None, None]:
    """Database Session Dependency für FastAPI"""
    with db_manager.get_db_session() as session:
        yield session

def get_db_session() -> Session:
    """Direkte Session abrufen (für nicht-FastAPI Kontexte)"""
    return db_manager.get_session()

# Performance Monitoring
class DatabasePerformanceMonitor:
    """Database Performance Monitoring"""
    
    def __init__(self):
        self.query_times = []
        self.slow_queries = []
        self.error_queries = []
    
    def record_query_time(self, query: str, execution_time: float):
        """Query-Ausführungszeit aufzeichnen"""
        self.query_times.append({
            "query": query,
            "execution_time": execution_time,
            "timestamp": time.time()
        })
        
        # Slow Query Detection (> 1 Sekunde)
        if execution_time > 1.0:
            self.slow_queries.append({
                "query": query,
                "execution_time": execution_time,
                "timestamp": time.time()
            })
            logger.warning(f"Slow query detected: {execution_time:.3f}s - {query[:100]}...")
    
    def record_query_error(self, query: str, error: str):
        """Query-Fehler aufzeichnen"""
        self.error_queries.append({
            "query": query,
            "error": error,
            "timestamp": time.time()
        })
        logger.error(f"Query error: {error} - {query[:100]}...")
    
    def get_performance_stats(self) -> dict:
        """Performance-Statistiken abrufen"""
        if not self.query_times:
            return {"message": "No queries recorded"}
        
        execution_times = [q["execution_time"] for q in self.query_times]
        
        return {
            "total_queries": len(self.query_times),
            "average_execution_time": sum(execution_times) / len(execution_times),
            "max_execution_time": max(execution_times),
            "min_execution_time": min(execution_times),
            "slow_queries_count": len(self.slow_queries),
            "error_queries_count": len(self.error_queries),
            "recent_slow_queries": self.slow_queries[-10:],  # Letzte 10 slow queries
            "recent_errors": self.error_queries[-10:]  # Letzte 10 Fehler
        }

# Global Performance Monitor
performance_monitor = DatabasePerformanceMonitor()

# Query Performance Decorator
def monitor_query_performance(func):
    """Decorator für Query Performance Monitoring"""
    def wrapper(*args, **kwargs):
        start_time = time.time()
        try:
            result = func(*args, **kwargs)
            execution_time = time.time() - start_time
            performance_monitor.record_query_time(str(func), execution_time)
            return result
        except Exception as e:
            execution_time = time.time() - start_time
            performance_monitor.record_query_error(str(func), str(e))
            raise
    return wrapper 