import asyncio
import logging
import signal
import sqlite3
from pathlib import Path
from typing import Dict, Any

logger = logging.getLogger(__name__)

class RecoveryTest:
    def __init__(self):
        self.db_path = Path("test_queue.db")
        self.test_data = [
            {"id": 1, "data": "Test1"},
            {"id": 2, "data": "Test2"},
            {"id": 3, "data": "Test3"}
        ]

    async def setup_test_database(self):
        """Erstellt eine Test-Datenbank mit Beispieldaten."""
        conn = sqlite3.connect(str(self.db_path))
        cursor = conn.cursor()
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS queue (
                id INTEGER PRIMARY KEY,
                data TEXT,
                status TEXT
            )
        """)
        for item in self.test_data:
            cursor.execute("INSERT INTO queue (id, data, status) VALUES (?, ?, ?)",
                         (item["id"], item["data"], "pending"))
        conn.commit()
        conn.close()

    async def simulate_crash(self):
        """Simuliert einen Systemabsturz."""
        # Sende SIGTERM Signal
        pid = signal.getpid()
        signal.raise_signal(signal.SIGTERM)
        await asyncio.sleep(1)  # Warte kurz

    async def verify_data_integrity(self) -> Dict[str, Any]:
        """Überprüft die Datenintegrität nach Wiederherstellung."""
        try:
            conn = sqlite3.connect(str(self.db_path))
            cursor = conn.cursor()
            cursor.execute("SELECT * FROM queue")
            rows = cursor.fetchall()
            conn.close()

            # Überprüfe, ob alle Testdaten vorhanden sind
            recovered_data = {row[0]: row[1] for row in rows}
            original_data = {item["id"]: item["data"] for item in self.test_data}

            integrity_check = recovered_data == original_data
            return {
                "integrity": integrity_check,
                "recovered_items": len(recovered_data),
                "expected_items": len(original_data)
            }
        except Exception as e:
            return {"integrity": False, "error": str(e)}

    async def run_recovery_test(self) -> Dict[str, Any]:
        """Führt den vollständigen Wiederherstellungstest durch."""
        results = {}
        
        # Test 1: Systemabsturz während der Verarbeitung
        logger.info("Starte Wiederherstellungstest: Systemabsturz")
        await self.setup_test_database()
        start_time = asyncio.get_event_loop().time()
        
        try:
            await self.simulate_crash()
        except Exception as e:
            logger.info(f"Simulierter Absturz: {e}")
        
        # Warte auf Wiederherstellung
        await asyncio.sleep(5)
        
        # Überprüfe Wiederherstellung
        recovery_time = asyncio.get_event_loop().time() - start_time
        integrity_results = await self.verify_data_integrity()
        
        results["crash_recovery"] = {
            "recovery_time": recovery_time,
            "data_integrity": integrity_results
        }
        
        # Aufräumen
        if self.db_path.exists():
            self.db_path.unlink()
        
        return results 