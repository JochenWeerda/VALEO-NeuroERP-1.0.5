#!/usr/bin/env python3
"""
VALEO-NeuroERP Development Environment Starter
Startet die lokale Entwicklungsumgebung mit Docker Compose
"""
import os
import subprocess
import sys
import time
import requests
from datetime import datetime
from typing import Dict

class DevEnvironmentStarter:
    """Entwicklungsumgebung Starter"""
    
    def __init__(self):
        self.services = {
            "postgres": {"port": 5432, "url": "http://localhost:5432", "name": "PostgreSQL"},
            "redis": {"port": 6379, "url": "http://localhost:6379", "name": "Redis"},
            "rabbitmq": {"port": 5672, "url": "http://localhost:15672", "name": "RabbitMQ"},
            "elasticsearch": {"port": 9200, "url": "http://localhost:9200", "name": "Elasticsearch"},
            "kibana": {"port": 5601, "url": "http://localhost:5601", "name": "Kibana"},
            "prometheus": {"port": 9090, "url": "http://localhost:9090", "name": "Prometheus"},
            "grafana": {"port": 3000, "url": "http://localhost:3000", "name": "Grafana"}
        }
    
    def check_docker(self) -> bool:
        """Prüft ob Docker verfügbar ist"""
        try:
            result = subprocess.run(["docker", "--version"], 
                                  capture_output=True, text=True, check=True)
            print(f"✅ Docker verfügbar: {result.stdout.strip()}")
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ Docker nicht gefunden. Bitte Docker installieren.")
            return False
    
    def check_docker_compose(self) -> bool:
        """Prüft ob Docker Compose verfügbar ist"""
        try:
            result = subprocess.run(["docker-compose", "--version"], 
                                  capture_output=True, text=True, check=True)
            print(f"✅ Docker Compose verfügbar: {result.stdout.strip()}")
            return True
        except (subprocess.CalledProcessError, FileNotFoundError):
            print("❌ Docker Compose nicht gefunden. Bitte Docker Compose installieren.")
            return False
    
    def start_services(self) -> bool:
        """Startet alle Services mit Docker Compose"""
        print("\n🚀 Starte VALEO-NeuroERP Entwicklungsumgebung...")
        
        try:
            # Docker Compose starten
            result = subprocess.run(["docker-compose", "up", "-d"], 
                                  capture_output=True, text=True, check=True)
            print("✅ Docker Compose Services gestartet")
            return True
        except subprocess.CalledProcessError as e:
            print(f"❌ Fehler beim Starten der Services: {e}")
            print(f"Stderr: {e.stderr}")
            return False
    
    def wait_for_service(self, service_name: str, url: str, timeout: int = 60) -> bool:
        """Wartet bis ein Service verfügbar ist"""
        print(f"⏳ Warte auf {service_name}...")
        
        start_time = time.time()
        while time.time() - start_time < timeout:
            try:
                response = requests.get(url, timeout=5)
                if response.status_code in [200, 401, 403]:  # Verschiedene Erfolgs-Codes
                    print(f"✅ {service_name} ist verfügbar")
                    return True
            except requests.exceptions.RequestException:
                pass
            
            time.sleep(2)
        
        print(f"⚠️  {service_name} nicht verfügbar nach {timeout}s")
        return False
    
    def check_all_services(self) -> Dict[str, bool]:
        """Prüft alle Services auf Verfügbarkeit"""
        print("\n🔍 Prüfe Service-Verfügbarkeit...")
        
        service_status = {}
        for service_id, service_info in self.services.items():
            if service_id == "postgres":
                # PostgreSQL speziell prüfen
                try:
                    import psycopg2
                    conn = psycopg2.connect(
                        host="localhost",
                        port=5432,
                        database="valeo_neuroerp",
                        user="valeo_user",
                        password="valeo_password"
                    )
                    conn.close()
                    service_status[service_id] = True
                    print(f"✅ {service_info['name']} ist verfügbar")
                except Exception:
                    service_status[service_id] = False
                    print(f"❌ {service_info['name']} nicht verfügbar")
            elif service_id == "redis":
                # Redis speziell prüfen
                try:
                    import redis
                    r = redis.Redis(host='localhost', port=6379, db=0)
                    r.ping()
                    service_status[service_id] = True
                    print(f"✅ {service_info['name']} ist verfügbar")
                except Exception:
                    service_status[service_id] = False
                    print(f"❌ {service_info['name']} nicht verfügbar")
            else:
                # HTTP Services prüfen
                service_status[service_id] = self.wait_for_service(
                    service_info['name'], 
                    service_info['url']
                )
        
        return service_status
    
    def show_service_urls(self):
        """Zeigt alle Service-URLs an"""
        print("\n🌐 Service-URLs:")
        print("-" * 50)
        
        urls = {
            "RabbitMQ Management": "http://localhost:15672",
            "Kibana": "http://localhost:5601", 
            "Prometheus": "http://localhost:9090",
            "Grafana": "http://localhost:3000"
        }
        
        for name, url in urls.items():
            print(f"   • {name}: {url}")
        
        print("\n🔐 Standard-Credentials:")
        print("-" * 30)
        print("   • PostgreSQL: valeo_user / valeo_password")
        print("   • RabbitMQ: valeo_user / valeo_password")
        print("   • Grafana: admin / valeo_admin")
    
    def stop_services(self):
        """Stoppt alle Services"""
        print("\n🛑 Stoppe Entwicklungsumgebung...")
        
        try:
            result = subprocess.run(["docker-compose", "down"], 
                                  capture_output=True, text=True, check=True)
            print("✅ Services gestoppt")
        except subprocess.CalledProcessError as e:
            print(f"❌ Fehler beim Stoppen: {e}")

def main():
    """Hauptfunktion"""
    print("🏗️  VALEO-NeuroERP Development Environment Starter")
    print("=" * 60)
    
    starter = DevEnvironmentStarter()
    
    # Docker prüfen
    if not starter.check_docker():
        return
    
    if not starter.check_docker_compose():
        return
    
    # Services starten
    if not starter.start_services():
        return
    
    # Kurz warten
    print("\n⏳ Warte auf Service-Start...")
    time.sleep(10)
    
    # Services prüfen
    service_status = starter.check_all_services()
    
    # Status zusammenfassen
    running_services = sum(service_status.values())
    total_services = len(service_status)
    
    print(f"\n📊 Service-Status: {running_services}/{total_services} Services laufen")
    
    if running_services == total_services:
        print("🎉 Alle Services erfolgreich gestartet!")
        starter.show_service_urls()
        
        print(f"\n🚀 VALEO-NeuroERP Development Environment bereit!")
        print("   • Backend kann jetzt gestartet werden")
        print("   • Frontend kann entwickelt werden")
        print("   • Monitoring ist verfügbar")
        
    else:
        print("⚠️  Einige Services sind nicht verfügbar")
        print("   • Prüfe Docker Compose Logs: docker-compose logs")
        print("   • Prüfe Service-Konfiguration")
    
    print("\n" + "=" * 60)
    print("Development Environment Setup beendet")

if __name__ == "__main__":
    try:
        main()
    except KeyboardInterrupt:
        print("\n⚠️  Setup abgebrochen")
    except Exception as e:
        print(f"\n❌ Unerwarteter Fehler: {e}") 