"""
Demo-Skript zur Demonstration des APM-Frameworks
"""

import os
import asyncio
import logging
from dotenv import load_dotenv

from backend.apm_framework.apm_workflow import APMWorkflow
from backend.mongodb_connector import MongoDBConnector

# Logging konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("apm_demo.log")
    ]
)
logger = logging.getLogger(__name__)

# Mock-RAG-Service für Demonstrationszwecke
class MockRAGService:
    """
    Mock-RAG-Service für Demonstrationszwecke.
    """
    
    async def query(self, prompt: str, agent_id: str = None) -> str:
        """
        Simuliert eine RAG-Abfrage.
        
        Args:
            prompt: Prompt
            agent_id: Agent-ID
            
        Returns:
            Antwort
        """
        logger.info(f"RAG-Abfrage von Agent {agent_id}: {prompt[:50]}...")
        
        if "Analysiere folgende Anforderung" in prompt:
            return """
            # Analyse der Anforderung
            
            ## Funktionale Anforderungen
            - Speicherung von Suchanfragen in MongoDB
            - Speicherung von RAG-Abfragen in MongoDB
            - Abruf der Suchhistorie
            - Abruf der RAG-Abfragehistorie
            
            ## Nicht-funktionale Anforderungen
            - Performante Datenbankabfragen
            - Skalierbarkeit für große Datenmengen
            - Fehlertoleranz bei Datenbankausfällen
            
            ## Systemgrenzen und Schnittstellen
            - Integration mit dem bestehenden MCP-Server
            - Schnittstelle zur MongoDB-Datenbank
            - Schnittstelle zur Linkup-API
            
            ## Herausforderungen
            - Sicherstellung der Pydantic v2-Kompatibilität
            - Behandlung verschiedener Antwortformate der Linkup-API
            """
        
        elif "Klärungsfragen" in prompt:
            return """
            1. Wie lange sollen die Suchanfragen und RAG-Abfragen gespeichert werden?
            2. Welche Indizes sollten für optimale Abfrageleistung erstellt werden?
            3. Sollen die Daten anonymisiert gespeichert werden?
            4. Wie soll mit fehlgeschlagenen Datenbankoperationen umgegangen werden?
            5. Welche Berechtigungen sind für den Zugriff auf die gespeicherten Daten erforderlich?
            """
        
        elif "Projektplan" in prompt:
            return """
            Name: MongoDB-Integration für VALEO-NeuroERP
            
            Beschreibung: Implementierung der MongoDB-Integration für die Speicherung von Suchanfragen und RAG-Abfragen im VALEO-NeuroERP-System.
            
            Meilenstein 1: Datenbankmodelle und Connector
            Beschreibung: Implementierung der Datenbankmodelle und des MongoDB-Connectors
            Aufwand: 3 Personentage
            Start: 01.06.2025
            Ende: 03.06.2025
            
            Meilenstein 2: Integration in MCP-Server
            Beschreibung: Integration der MongoDB-Funktionalität in den MCP-Server
            Aufwand: 4 Personentage
            Start: 04.06.2025
            Ende: 07.06.2025
            
            Meilenstein 3: Tests und Dokumentation
            Beschreibung: Implementierung von Tests und Erstellung der Dokumentation
            Aufwand: 3 Personentage
            Start: 08.06.2025
            Ende: 10.06.2025
            """
        
        elif "Lösungsdesign" in prompt:
            return """
            Architekturübersicht: Die MongoDB-Integration besteht aus einem MongoDB-Connector, Datenmodellen und Service-Integrationen.
            
            Designentscheidung 1: Verwendung eines generischen MongoDB-Connectors
            Begründung: Ein generischer Connector ermöglicht die Wiederverwendung für verschiedene Datentypen und reduziert Code-Duplikation.
            
            Designentscheidung 2: Pydantic v2 für Datenmodelle
            Begründung: Pydantic v2 bietet verbesserte Leistung und Typsicherheit für die Datenvalidierung.
            
            Alternative 1: Direkte Verwendung von PyMongo
            Vorteile: Weniger Abstraktionsebenen, direkter Zugriff auf alle MongoDB-Funktionen
            Nachteile: Mehr boilerplate-Code, weniger Wiederverwendbarkeit
            
            Alternative 2: Verwendung eines ORM wie MongoEngine
            Vorteile: Objektorientierter Zugriff auf die Datenbank
            Nachteile: Leistungseinbußen, Einschränkungen bei komplexen Abfragen
            
            Technologien:
            - PyMongo für die Datenbankverbindung
            - Pydantic v2 für die Datenvalidierung
            - Asyncio für asynchrone Operationen
            """
        
        elif "Aufgaben" in prompt:
            return """
            Aufgabe 1: Implementierung des MongoDB-Connectors
            Beschreibung: Implementierung einer Klasse für die Verbindung zur MongoDB-Datenbank und grundlegende CRUD-Operationen
            Aufwand: 4 Stunden
            Priorität: 1
            
            Aufgabe 2: Implementierung der Datenmodelle
            Beschreibung: Implementierung von Pydantic-Modellen für Suchanfragen, RAG-Abfragen und Dokumentenverarbeitung
            Aufwand: 3 Stunden
            Priorität: 1
            Abhängigkeiten: 
            
            Aufgabe 3: Integration des MongoDB-Connectors in den MCP-Server
            Beschreibung: Anpassung des MCP-Servers zur Verwendung des MongoDB-Connectors
            Aufwand: 5 Stunden
            Priorität: 2
            Abhängigkeiten: Aufgabe 1, Aufgabe 2
            
            Aufgabe 4: Implementierung der Tools für den MCP-Server
            Beschreibung: Implementierung von Tools für den Abruf von Daten aus MongoDB
            Aufwand: 4 Stunden
            Priorität: 2
            Abhängigkeiten: Aufgabe 3
            
            Aufgabe 5: Implementierung von Tests
            Beschreibung: Implementierung von Tests für den MongoDB-Connector und die Integration
            Aufwand: 3 Stunden
            Priorität: 3
            Abhängigkeiten: Aufgabe 1, Aufgabe 2, Aufgabe 3, Aufgabe 4
            
            Aufgabe 6: Erstellung der Dokumentation
            Beschreibung: Erstellung einer Dokumentation für die MongoDB-Integration
            Aufwand: 2 Stunden
            Priorität: 3
            Abhängigkeiten: Aufgabe 1, Aufgabe 2, Aufgabe 3, Aufgabe 4
            """
        
        else:
            return f"Antwort auf: {prompt[:50]}..."

async def run_demo():
    """
    Führt die APM-Framework-Demo aus.
    """
    # Umgebungsvariablen laden
    load_dotenv()
    
    # MongoDB-URI und Datenbankname aus Umgebungsvariablen oder Standardwerte
    mongodb_uri = os.environ.get("MONGODB_URI", "mongodb://localhost:27017/")
    db_name = os.environ.get("MONGODB_DB_NAME", "valeo_neuroerp_demo")
    
    logger.info(f"Starte APM-Framework-Demo mit MongoDB-URI: {mongodb_uri}, DB: {db_name}")
    
    try:
        # APM-Workflow initialisieren
        workflow = APMWorkflow(mongodb_uri=mongodb_uri, db_name=db_name)
        
        # Mock-RAG-Service setzen
        workflow.set_rag_service(MockRAGService())
        
        # Anforderung definieren
        requirement_text = """
        Implementierung der MongoDB-Integration für das VALEO-NeuroERP-System zur Speicherung von Suchanfragen und RAG-Abfragen.
        
        Die Integration soll folgende Funktionen bieten:
        - Speicherung von Web-Suchanfragen und -ergebnissen
        - Speicherung von RAG-Abfragen und -antworten
        - Speicherung von Dokumentenverarbeitungshistorie
        - Abruf der gespeicherten Daten über den MCP-Server
        
        Die Integration soll mit Pydantic v2 kompatibel sein und eine robuste Fehlerbehandlung bieten.
        """
        
        # Workflow ausführen
        result = await workflow.run_workflow(requirement_text)
        
        # Ergebnis anzeigen
        logger.info("APM-Workflow abgeschlossen!")
        logger.info(f"Workflow-ID: {result.get('id')}")
        logger.info(f"VAN-Analyse-ID: {result.get('van_result', {}).get('id')}")
        logger.info(f"PLAN-Ergebnis-ID: {result.get('plan_result', {}).get('id')}")
        logger.info(f"Anzahl der Klärungsfragen: {len(result.get('van_result', {}).get('clarifications', []))}")
        logger.info(f"Anzahl der Aufgaben: {len(result.get('plan_result', {}).get('tasks', []))}")
        
        # Verbindungen schließen
        workflow.close()
        
    except Exception as e:
        logger.error(f"Fehler bei der Demo: {str(e)}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    # Event-Loop erstellen und Demo ausführen
    asyncio.run(run_demo()) 