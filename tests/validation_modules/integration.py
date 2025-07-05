import asyncio
import logging
from typing import Dict, Any, List
import aiohttp
import json
from pathlib import Path
import psycopg2
import redis
from datetime import datetime

logger = logging.getLogger(__name__)

class IntegrationTest:
    def __init__(self):
        self.base_url = "http://localhost:8000"
        self.external_systems = {
            "database": "postgresql://localhost:5432/test",
            "redis": "redis://localhost:6379/0",
            "api": "http://localhost:8001/api",
            "events": "http://localhost:8002/events",
            "notifications": "http://localhost:8003/notifications"
        }
        self.test_data = {
            "user": {"id": 1, "name": "Test User"},
            "event": {"type": "test_event", "data": {"message": "Test Event"}},
            "notification": {"type": "test_notification", "message": "Test Notification"}
        }

    async def verify_connection(self, url: str, timeout: int = 5) -> Dict[str, Any]:
        """Überprüft die Verbindung zu einem Service."""
        try:
            async with aiohttp.ClientSession() as session:
                async with session.get(url, timeout=timeout) as response:
                    return {
                        "status": "connected",
                        "response_time": response.elapsed.total_seconds() if hasattr(response, 'elapsed') else None,
                        "status_code": response.status
                    }
        except asyncio.TimeoutError:
            return {"status": "timeout", "error": "Connection timed out"}
        except Exception as e:
            return {"status": "error", "error": str(e)}

    async def test_api_endpoints(self) -> Dict[str, Any]:
        """Testet die REST API-Integration mit erweiterten Tests."""
        endpoints = [
            {"path": "/health", "method": "GET", "expected_status": 200},
            {"path": "/api/v1/queue/status", "method": "GET", "expected_status": 200},
            {"path": "/api/v1/sync/status", "method": "GET", "expected_status": 200},
            {"path": "/api/v1/events", "method": "POST", "expected_status": 201},
            {"path": "/api/v1/users", "method": "GET", "expected_status": 200},
            {"path": "/api/v1/notifications", "method": "POST", "expected_status": 201}
        ]
        
        results = {}
        async with aiohttp.ClientSession() as session:
            for endpoint in endpoints:
                try:
                    method = getattr(session, endpoint["method"].lower())
                    async with method(f"{self.base_url}{endpoint['path']}") as response:
                        response_json = await response.json() if response.content_type == 'application/json' else None
                        results[endpoint["path"]] = {
                            "method": endpoint["method"],
                            "status": response.status,
                            "expected_status": endpoint["expected_status"],
                            "response_time": response.elapsed.total_seconds() if hasattr(response, 'elapsed') else None,
                            "content_type": response.content_type,
                            "success": response.status == endpoint["expected_status"],
                            "response_data": response_json
                        }
                except Exception as e:
                    results[endpoint["path"]] = {
                        "method": endpoint["method"],
                        "error": str(e),
                        "success": False
                    }
        
        return results

    async def test_database_connection(self) -> Dict[str, Any]:
        """Testet die Datenbankverbindung mit erweiterter Funktionalität."""
        try:
            # PostgreSQL-Verbindung
            conn = psycopg2.connect(self.external_systems["database"])
            cur = conn.cursor()
            
            # Teste Schreibzugriff
            cur.execute("""
                CREATE TABLE IF NOT EXISTS integration_test (
                    id SERIAL PRIMARY KEY,
                    test_data JSONB,
                    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                )
            """)
            
            # Füge Testdaten ein
            cur.execute(
                "INSERT INTO integration_test (test_data) VALUES (%s) RETURNING id",
                (json.dumps(self.test_data),)
            )
            inserted_id = cur.fetchone()[0]
            
            # Lese Testdaten
            cur.execute("SELECT * FROM integration_test WHERE id = %s", (inserted_id,))
            result = cur.fetchone()
            
            # Cleanup
            cur.execute("DROP TABLE integration_test")
            conn.commit()
            cur.close()
            conn.close()
            
            return {
                "status": "connected",
                "write_test": "success",
                "read_test": "success" if result else "failed",
                "inserted_id": inserted_id
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}

    async def test_redis_connection(self) -> Dict[str, Any]:
        """Testet die Redis-Integration."""
        try:
            redis_client = redis.Redis.from_url(self.external_systems["redis"])
            
            # Teste Schreib- und Lesezugriff
            test_key = "integration_test"
            test_value = json.dumps(self.test_data)
            
            redis_client.set(test_key, test_value, ex=60)  # 60 Sekunden TTL
            retrieved_value = redis_client.get(test_key)
            
            redis_client.delete(test_key)
            redis_client.close()
            
            return {
                "status": "connected",
                "write_test": "success",
                "read_test": "success" if retrieved_value else "failed",
                "data_match": json.loads(retrieved_value) == self.test_data if retrieved_value else False
            }
        except Exception as e:
            return {"status": "error", "error": str(e)}

    async def test_event_system(self) -> Dict[str, Any]:
        """Testet das Event-System mit verschiedenen Event-Typen."""
        test_events = [
            {"type": "user_created", "data": self.test_data["user"]},
            {"type": "notification_sent", "data": self.test_data["notification"]},
            {"type": "system_event", "data": {"status": "test"}}
        ]
        
        results = []
        async with aiohttp.ClientSession() as session:
            for event in test_events:
                try:
                    async with session.post(
                        self.external_systems["events"],
                        json=event
                    ) as response:
                        results.append({
                            "event_type": event["type"],
                            "status": response.status,
                            "response_time": response.elapsed.total_seconds() if hasattr(response, 'elapsed') else None,
                            "success": response.status in [200, 201]
                        })
                except Exception as e:
                    results.append({
                        "event_type": event["type"],
                        "error": str(e),
                        "success": False
                    })
        
        return {
            "total_events": len(test_events),
            "successful_events": sum(1 for r in results if r["success"]),
            "results": results
        }

    async def test_notification_system(self) -> Dict[str, Any]:
        """Testet das Benachrichtigungssystem mit verschiedenen Nachrichtentypen."""
        test_notifications = [
            {"type": "email", "recipient": "test@example.com", "message": "Test Email"},
            {"type": "sms", "recipient": "+1234567890", "message": "Test SMS"},
            {"type": "push", "recipient": "device_id_123", "message": "Test Push"}
        ]
        
        results = []
        async with aiohttp.ClientSession() as session:
            for notification in test_notifications:
                try:
                    async with session.post(
                        self.external_systems["notifications"],
                        json=notification
                    ) as response:
                        results.append({
                            "notification_type": notification["type"],
                            "status": response.status,
                            "response_time": response.elapsed.total_seconds() if hasattr(response, 'elapsed') else None,
                            "success": response.status in [200, 201]
                        })
                except Exception as e:
                    results.append({
                        "notification_type": notification["type"],
                        "error": str(e),
                        "success": False
                    })
        
        return {
            "total_notifications": len(test_notifications),
            "successful_notifications": sum(1 for r in results if r["success"]),
            "results": results
        }

    async def run_integration_test(self) -> Dict[str, Any]:
        """Führt alle Integrationstests durch."""
        logger.info("Starte Integrationstests")
        start_time = datetime.now()
        results = {}
        
        # 1. Verbindungstests
        logger.info("Teste Verbindungen zu externen Systemen")
        results["connections"] = {
            name: await self.verify_connection(url)
            for name, url in self.external_systems.items()
        }
        
        # 2. API-Tests
        logger.info("Teste API-Endpunkte")
        results["api"] = await self.test_api_endpoints()
        
        # 3. Datenbank-Tests
        logger.info("Teste Datenbankverbindung")
        results["database"] = await self.test_database_connection()
        
        # 4. Redis-Tests
        logger.info("Teste Redis-Integration")
        results["redis"] = await self.test_redis_connection()
        
        # 5. Event-System-Tests
        logger.info("Teste Event-System")
        results["events"] = await self.test_event_system()
        
        # 6. Benachrichtigungssystem-Tests
        logger.info("Teste Benachrichtigungssystem")
        results["notifications"] = await self.test_notification_system()
        
        # Berechne Gesamtstatistik
        end_time = datetime.now()
        results["summary"] = {
            "duration": (end_time - start_time).total_seconds(),
            "total_tests": sum(
                len(r) if isinstance(r, dict) else 1
                for r in results.values()
            ),
            "successful_tests": sum(
                sum(1 for v in r.values() if isinstance(v, dict) and v.get("success", False))
                if isinstance(r, dict) else (1 if r.get("success", False) else 0)
                for r in results.values()
            )
        }
        
        # Speichere detaillierte Ergebnisse
        results_path = Path("integration_test_results.json")
        results_path.write_text(json.dumps(results, indent=2))
        
        return results 