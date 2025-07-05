"""
Performance-Monitoring für Datenbankoperationen.

Dieses Modul implementiert Funktionen zur Überwachung und Analyse der Datenbankperformance,
zur Erkennung von langsamen Abfragen und zur Visualisierung von Performance-Metriken.
"""

import time
import logging
import threading
import sqlite3
from datetime import datetime, timedelta
from collections import defaultdict, deque
from typing import Dict, List, Optional, Callable, Any, Deque, Tuple
import json
import statistics
from functools import wraps

# Logger konfigurieren
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

class PerformanceMonitor:
    """
    Überwacht die Performance von Datenbankabfragen und speichert Metriken.
    """
    
    def __init__(self, db_path: str = 'performance_metrics.db', slow_query_threshold: float = 0.5):
        """
        Initialisiert den Performance-Monitor.
        
        Args:
            db_path: Pfad zur Datenbank für Performance-Metriken
            slow_query_threshold: Schwellwert in Sekunden für langsame Abfragen
        """
        self.db_path = db_path
        self.slow_query_threshold = slow_query_threshold
        self.metrics: Dict[str, Deque[Dict[str, Any]]] = defaultdict(lambda: deque(maxlen=1000))
        self.query_stats: Dict[str, Dict[str, Any]] = defaultdict(lambda: {"count": 0, "total_time": 0.0, "max_time": 0.0})
        self.lock = threading.Lock()
        
        # Initialisiere die Metriken-Datenbank
        self._init_db()
    
    def _init_db(self):
        """Initialisiert die Datenbank für Performance-Metriken."""
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Tabelle für Performance-Metriken erstellen
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS query_metrics (
                id INTEGER PRIMARY KEY,
                timestamp TEXT,
                query_name TEXT,
                duration REAL,
                query_params TEXT,
                is_slow BOOLEAN
            )
            ''')
            
            # Tabelle für tägliche Zusammenfassungen erstellen
            cursor.execute('''
            CREATE TABLE IF NOT EXISTS daily_summary (
                date TEXT PRIMARY KEY,
                total_queries INTEGER,
                avg_duration REAL,
                slow_queries INTEGER,
                data TEXT
            )
            ''')
            
            conn.commit()
            conn.close()
            logger.info(f"Performance-Metriken-Datenbank initialisiert: {self.db_path}")
        except Exception as e:
            logger.error(f"Fehler bei der Initialisierung der Performance-Datenbank: {e}")
    
    def record_query(self, query_name: str, duration: float, params: Optional[Dict[str, Any]] = None):
        """
        Zeichnet Metriken für eine Datenbankabfrage auf.
        
        Args:
            query_name: Name der Abfrage oder des Endpunkts
            duration: Dauer der Abfrage in Sekunden
            params: Optionale Parameter für die Abfrage
        """
        timestamp = datetime.now().isoformat()
        is_slow = duration >= self.slow_query_threshold
        
        # Metriken in Memory-Cache speichern
        with self.lock:
            self.metrics[query_name].append({
                "timestamp": timestamp,
                "duration": duration,
                "params": params,
                "is_slow": is_slow
            })
            
            # Statistik aktualisieren
            self.query_stats[query_name]["count"] += 1
            self.query_stats[query_name]["total_time"] += duration
            self.query_stats[query_name]["max_time"] = max(self.query_stats[query_name]["max_time"], duration)
        
        # In die Datenbank schreiben
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute(
                "INSERT INTO query_metrics (timestamp, query_name, duration, query_params, is_slow) VALUES (?, ?, ?, ?, ?)",
                (timestamp, query_name, duration, json.dumps(params) if params else None, is_slow)
            )
            
            conn.commit()
            conn.close()
        except Exception as e:
            logger.error(f"Fehler beim Aufzeichnen der Abfragemetrik: {e}")
        
        # Warnung für langsame Abfragen ausgeben
        if is_slow:
            logger.warning(f"Slow query detected: '{query_name}' took {duration:.4f} seconds")
    
    def get_query_stats(self, query_name: Optional[str] = None, hours: int = 24) -> Dict[str, Any]:
        """
        Gibt Statistiken für Abfragen zurück.
        
        Args:
            query_name: Optional, Name der Abfrage für spezifische Statistiken
            hours: Zeitraum in Stunden für die Statistiken
            
        Returns:
            Dictionary mit Abfragestatistiken
        """
        since = datetime.now() - timedelta(hours=hours)
        since_str = since.isoformat()
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            if query_name:
                # Statistiken für eine spezifische Abfrage
                cursor.execute(
                    """
                    SELECT COUNT(*), AVG(duration), MAX(duration), SUM(is_slow)
                    FROM query_metrics
                    WHERE query_name = ? AND timestamp >= ?
                    """,
                    (query_name, since_str)
                )
                count, avg_duration, max_duration, slow_count = cursor.fetchone()
                
                # Zeitverlauf für die Abfrage
                cursor.execute(
                    """
                    SELECT timestamp, duration
                    FROM query_metrics
                    WHERE query_name = ? AND timestamp >= ?
                    ORDER BY timestamp
                    """,
                    (query_name, since_str)
                )
                timeline = [{"timestamp": ts, "duration": dur} for ts, dur in cursor.fetchall()]
                
                conn.close()
                
                return {
                    "query_name": query_name,
                    "count": count or 0,
                    "avg_duration": avg_duration or 0,
                    "max_duration": max_duration or 0,
                    "slow_count": slow_count or 0,
                    "timeline": timeline
                }
            else:
                # Übersichtsstatistiken für alle Abfragen
                cursor.execute(
                    """
                    SELECT query_name, COUNT(*), AVG(duration), MAX(duration), SUM(is_slow)
                    FROM query_metrics
                    WHERE timestamp >= ?
                    GROUP BY query_name
                    ORDER BY AVG(duration) DESC
                    """,
                    (since_str,)
                )
                
                stats = []
                for name, count, avg_duration, max_duration, slow_count in cursor.fetchall():
                    stats.append({
                        "query_name": name,
                        "count": count,
                        "avg_duration": avg_duration,
                        "max_duration": max_duration,
                        "slow_count": slow_count or 0
                    })
                
                conn.close()
                
                return {
                    "period_hours": hours,
                    "total_queries": sum(s["count"] for s in stats),
                    "total_slow_queries": sum(s["slow_count"] for s in stats),
                    "queries": stats
                }
        
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der Abfragestatistiken: {e}")
            return {"error": str(e)}
    
    def get_slow_queries(self, hours: int = 24, limit: int = 100) -> List[Dict[str, Any]]:
        """
        Gibt eine Liste der langsamsten Abfragen zurück.
        
        Args:
            hours: Zeitraum in Stunden
            limit: Maximale Anzahl der zurückzugebenden Abfragen
            
        Returns:
            Liste der langsamsten Abfragen
        """
        since = datetime.now() - timedelta(hours=hours)
        since_str = since.isoformat()
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute(
                """
                SELECT timestamp, query_name, duration, query_params
                FROM query_metrics
                WHERE timestamp >= ? AND is_slow = 1
                ORDER BY duration DESC
                LIMIT ?
                """,
                (since_str, limit)
            )
            
            slow_queries = []
            for timestamp, name, duration, params_json in cursor.fetchall():
                slow_queries.append({
                    "timestamp": timestamp,
                    "query_name": name,
                    "duration": duration,
                    "params": json.loads(params_json) if params_json else None
                })
            
            conn.close()
            return slow_queries
        
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der langsamen Abfragen: {e}")
            return []
    
    def generate_daily_summary(self, date: Optional[datetime] = None):
        """
        Generiert eine tägliche Zusammenfassung der Performance-Metriken.
        
        Args:
            date: Datum für die Zusammenfassung, standardmäßig heute
        """
        if date is None:
            date = datetime.now()
        
        date_str = date.strftime("%Y-%m-%d")
        start = datetime.strptime(f"{date_str} 00:00:00", "%Y-%m-%d %H:%M:%S").isoformat()
        end = datetime.strptime(f"{date_str} 23:59:59", "%Y-%m-%d %H:%M:%S").isoformat()
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            # Abfragestatistiken für den Tag abrufen
            cursor.execute(
                """
                SELECT COUNT(*), AVG(duration), SUM(is_slow)
                FROM query_metrics
                WHERE timestamp >= ? AND timestamp <= ?
                """,
                (start, end)
            )
            
            total_queries, avg_duration, slow_queries = cursor.fetchone()
            
            if total_queries is None or total_queries == 0:
                logger.info(f"Keine Daten für tägliche Zusammenfassung am {date_str}")
                conn.close()
                return
            
            # Detailliertere Daten für die Zusammenfassung abrufen
            cursor.execute(
                """
                SELECT query_name, COUNT(*), AVG(duration), MAX(duration), SUM(is_slow)
                FROM query_metrics
                WHERE timestamp >= ? AND timestamp <= ?
                GROUP BY query_name
                ORDER BY AVG(duration) DESC
                """,
                (start, end)
            )
            
            query_stats = []
            for name, count, avg_dur, max_dur, slow_count in cursor.fetchall():
                query_stats.append({
                    "query_name": name,
                    "count": count,
                    "avg_duration": avg_dur,
                    "max_duration": max_dur,
                    "slow_count": slow_count or 0
                })
            
            # Stündliche Verteilung
            cursor.execute(
                """
                SELECT strftime('%H', timestamp) as hour, COUNT(*)
                FROM query_metrics
                WHERE timestamp >= ? AND timestamp <= ?
                GROUP BY hour
                ORDER BY hour
                """,
                (start, end)
            )
            
            hourly_distribution = {hour: count for hour, count in cursor.fetchall()}
            
            # Daten zusammenstellen
            summary_data = {
                "date": date_str,
                "query_stats": query_stats,
                "hourly_distribution": hourly_distribution
            }
            
            # In der Zusammenfassungstabelle speichern
            cursor.execute(
                """
                INSERT OR REPLACE INTO daily_summary (date, total_queries, avg_duration, slow_queries, data)
                VALUES (?, ?, ?, ?, ?)
                """,
                (date_str, total_queries, avg_duration, slow_queries, json.dumps(summary_data))
            )
            
            conn.commit()
            conn.close()
            
            logger.info(f"Tägliche Zusammenfassung für {date_str} generiert: {total_queries} Abfragen, {slow_queries} langsame Abfragen")
        
        except Exception as e:
            logger.error(f"Fehler bei der Generierung der täglichen Zusammenfassung: {e}")
    
    def get_daily_summary(self, date: Optional[datetime] = None) -> Dict[str, Any]:
        """
        Ruft die tägliche Zusammenfassung für ein bestimmtes Datum ab.
        
        Args:
            date: Datum für die Zusammenfassung, standardmäßig heute
            
        Returns:
            Dictionary mit der täglichen Zusammenfassung
        """
        if date is None:
            date = datetime.now()
        
        date_str = date.strftime("%Y-%m-%d")
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute(
                "SELECT total_queries, avg_duration, slow_queries, data FROM daily_summary WHERE date = ?",
                (date_str,)
            )
            
            result = cursor.fetchone()
            conn.close()
            
            if result:
                total_queries, avg_duration, slow_queries, data_json = result
                return {
                    "date": date_str,
                    "total_queries": total_queries,
                    "avg_duration": avg_duration,
                    "slow_queries": slow_queries,
                    "details": json.loads(data_json)
                }
            else:
                # Keine Zusammenfassung gefunden, generiere eine
                self.generate_daily_summary(date)
                return self.get_daily_summary(date)
        
        except Exception as e:
            logger.error(f"Fehler beim Abrufen der täglichen Zusammenfassung: {e}")
            return {"error": str(e)}
    
    def clear_old_data(self, days: int = 90):
        """
        Löscht ältere Daten aus der Datenbank.
        
        Args:
            days: Daten älter als diese Anzahl von Tagen werden gelöscht
        """
        cutoff = (datetime.now() - timedelta(days=days)).isoformat()
        
        try:
            conn = sqlite3.connect(self.db_path)
            cursor = conn.cursor()
            
            cursor.execute(
                "DELETE FROM query_metrics WHERE timestamp < ?",
                (cutoff,)
            )
            
            deleted_count = cursor.rowcount
            conn.commit()
            conn.close()
            
            logger.info(f"Alte Performance-Daten gelöscht: {deleted_count} Einträge älter als {days} Tage")
        
        except Exception as e:
            logger.error(f"Fehler beim Löschen alter Performance-Daten: {e}")

# Globale Instanz für den Performance-Monitor
monitor = PerformanceMonitor()

def monitor_query(func=None, *, name=None):
    """
    Decorator zum Überwachen der Performance einer Datenbankabfrage.
    
    Args:
        func: Die zu dekorierende Funktion
        name: Optionaler Name für die Abfrage, standardmäßig der Funktionsname
        
    Returns:
        Dekorierte Funktion mit Performance-Monitoring
    """
    def decorator(f):
        @wraps(f)
        def wrapper(*args, **kwargs):
            query_name = name or f.__name__
            start_time = time.time()
            
            try:
                result = f(*args, **kwargs)
                return result
            finally:
                duration = time.time() - start_time
                # Parameter für die Abfrage erfassen (ohne self)
                params = {}
                if args and len(args) > 1:
                    params["args"] = args[1:]  # Erstes Argument (self) überspringen
                if kwargs:
                    params.update(kwargs)
                
                monitor.record_query(query_name, duration, params)
        
        return wrapper
    
    return decorator(func) if func else decorator

def get_performance_dashboard_data() -> Dict[str, Any]:
    """
    Gibt Daten für ein Performance-Dashboard zurück.
    
    Returns:
        Dictionary mit umfassenden Performance-Daten
    """
    # Aktuelle Statistiken
    current_stats = monitor.get_query_stats(hours=24)
    
    # Langsamste Abfragen
    slow_queries = monitor.get_slow_queries(hours=24, limit=10)
    
    # Tägliche Zusammenfassung für heute
    today_summary = monitor.get_daily_summary()
    
    # Tägliche Zusammenfassungen für die letzten 7 Tage
    daily_summaries = []
    for i in range(7):
        date = datetime.now() - timedelta(days=i)
        daily_summaries.append(monitor.get_daily_summary(date))
    
    return {
        "current_stats": current_stats,
        "slow_queries": slow_queries,
        "today_summary": today_summary,
        "daily_summaries": daily_summaries
    }

# Middleware für FastAPI zum Aufzeichnen von API-Endpunkt-Performance
async def db_performance_middleware(request, call_next):
    """
    Middleware für FastAPI zum Aufzeichnen der Performance von API-Endpunkten.
    
    Args:
        request: Der eingehende Request
        call_next: Die nächste Funktion in der Middleware-Kette
        
    Returns:
        Die Antwort des API-Endpunkts
    """
    start_time = time.time()
    
    try:
        # Route extrahieren (ohne Query-Parameter)
        path = request.url.path
        method = request.method
        endpoint_name = f"{method} {path}"
        
        # Request weiterleiten
        response = await call_next(request)
        
        # Performance aufzeichnen
        duration = time.time() - start_time
        monitor.record_query(endpoint_name, duration)
        
        return response
    except Exception as e:
        logger.error(f"Fehler in der Performance-Middleware: {e}")
        # Ursprüngliche Exception weitergeben
        raise 