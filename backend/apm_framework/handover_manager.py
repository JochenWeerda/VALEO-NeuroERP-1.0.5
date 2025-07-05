#!/usr/bin/env python3
"""
Handover-Manager für das APM-Framework.
Ermöglicht die Erstellung, Speicherung und Verwaltung von Handover-Dokumenten
zwischen verschiedenen Phasen des APM-Workflows.
"""

import os
import sys
import logging
import json
import asyncio
from pathlib import Path
from datetime import datetime
from typing import Dict, Any, Optional, List, Union

# Pfad zum Projektverzeichnis hinzufügen
sys.path.append(str(Path(__file__).resolve().parent.parent.parent))

from backend.apm_framework.mongodb_connector import APMMongoDBConnector

# Logger konfigurieren
logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(name)s - %(levelname)s - %(message)s')
logger = logging.getLogger(__name__)

class HandoverManager:
    """
    Manager für Handover-Dokumente zwischen verschiedenen Phasen des APM-Workflows.
    Unterstützt verschiedene Vorlagen je nach Phase und verwaltet die Speicherung in MongoDB.
    """
    
    # Phasen des APM-Workflows
    PHASE_VAN = "VAN"       # Verstehen, Analysieren, Nachfragen
    PHASE_PLAN = "PLAN"     # Planung
    PHASE_CREATE = "CREATE"  # Kreative Phase
    PHASE_IMPLEMENT = "IMPLEMENT"  # Implementierung
    PHASE_REFLECT = "REFLECT"  # Reflexion und Archivierung
    
    def __init__(self, 
                mongodb_uri: str = "mongodb://localhost:27017/", 
                db_name: str = "valeo_neuroerp",
                project_name: str = "VALEO-NeuroERP"):
        """
        Initialisiert den HandoverManager.
        
        Args:
            mongodb_uri: MongoDB-Verbindungsstring
            db_name: Name der Datenbank
            project_name: Name des Projekts
        """
        self.mongodb_connector = APMMongoDBConnector(mongodb_uri, db_name)
        self.project_name = project_name
        
        # API-Schlüssel aus lokaler Datei laden
        self.api_keys = {"openai": None, "anthropic": None, "groq": None}
        self._load_api_keys()
        
        # Projekt-ID abrufen oder erstellen
        project = self.mongodb_connector.find_one("projects", {"name": project_name})
        if not project:
            project_id = self.mongodb_connector.insert_one("projects", {
                "name": project_name,
                "description": "Neuromorphes ERP-System mit KI-Integration",
                "created_at": datetime.now()
            })
            self.project_id = project_id
        else:
            self.project_id = project["_id"]
        
        # Handover-Vorlagen-Verzeichnis
        self.templates_dir = Path(__file__).resolve().parent.parent.parent / "memory-bank" / "handover" / "templates"
        
        # Handover-Ausgabeverzeichnis
        self.output_dir = Path(__file__).resolve().parent.parent.parent / "memory-bank" / "handover"
        
        # RAG-Workflow für Zusammenfassungen (lazy loading)
        self._rag_workflow = None
    
    def _load_api_keys(self):
        """Lädt API-Schlüssel aus der lokalen Datei."""
        try:
            api_keys_path = Path(__file__).resolve().parent.parent.parent / "api_keys.local.json"
            if api_keys_path.exists():
                with open(api_keys_path, 'r') as f:
                    api_keys_data = json.load(f)
                    self.api_keys["openai"] = api_keys_data["API_KEYS"].get("OPENAI_API_KEY")
                    self.api_keys["anthropic"] = api_keys_data["API_KEYS"].get("ANTHROPIC_API_KEY")
                    self.api_keys["groq"] = api_keys_data["API_KEYS"].get("GROQ_API_KEY")
                logger.info("API-Schlüssel aus lokaler Datei geladen")
            else:
                logger.warning("Keine api_keys.local.json gefunden")
        except Exception as e:
            logger.error(f"Fehler beim Laden der API-Schlüssel: {e}")
    
    def _get_rag_workflow(self):
        """Lazy-Loading des RAG-Workflows."""
        if self._rag_workflow is None:
            try:
                # Versuche zuerst, den OpenAI-basierten RAG-Workflow zu laden
                import openai
                
                # API-Schlüssel setzen
                if self.api_keys["openai"]:
                    os.environ["OPENAI_API_KEY"] = self.api_keys["openai"]
                    openai.api_key = self.api_keys["openai"]
                    
                    # Wir verwenden OpenAI direkt anstatt des RAG-Workflows
                    logger.info("OpenAI-API initialisiert für Zusammenfassungen")
                    self._rag_workflow = "openai_direct"
                else:
                    logger.warning("Kein OpenAI API-Schlüssel gefunden")
                    self._rag_workflow = None
            except (ImportError, Exception) as e:
                logger.warning(f"Fehler beim Initialisieren der OpenAI-API: {str(e)}")
                logger.warning("Verwende einfachen Text-basierten Zusammenfassungsmechanismus")
                self._rag_workflow = None
        
        return self._rag_workflow
    
    def _get_template_path(self, phase: str) -> Path:
        """
        Gibt den Pfad zur Handover-Vorlage für die angegebene Phase zurück.
        
        Args:
            phase: Phase des APM-Workflows
            
        Returns:
            Pfad zur Handover-Vorlage
        """
        # Standardvorlage, falls keine phasenspezifische Vorlage existiert
        template_path = self.templates_dir / "default_handover_template.md"
        
        # Phasenspezifische Vorlage
        phase_template_path = self.templates_dir / f"{phase.lower()}_handover_template.md"
        
        if phase_template_path.exists():
            return phase_template_path
        elif template_path.exists():
            logger.warning(f"Keine spezifische Vorlage für Phase {phase} gefunden. Verwende Standardvorlage.")
            return template_path
        else:
            logger.warning("Keine Handover-Vorlagen gefunden. Verwende eingebaute Standardvorlage.")
            # Erstelle Standardvorlage, falls sie nicht existiert
            self._create_default_templates()
            return template_path
    
    def _create_default_templates(self):
        """Erstellt Standardvorlagen für Handover-Dokumente, falls sie nicht existieren."""
        # Stelle sicher, dass das Verzeichnis existiert
        self.templates_dir.mkdir(parents=True, exist_ok=True)
        
        # Standardvorlage
        default_template = """# Handover-Dokument: {date}

## Aktueller Status
- **Aktuelle Aufgabe:** [Beschreibung]
- **Fortschritt:** [Prozent]
- **Offene Probleme:** [Liste]

## Kontext
- **Zuletzt bearbeitete Dateien:**
  - [Datei 1]
  - [Datei 2]
  - [Datei 3]
- **Aktuelle Konfiguration:** [Details]
- **Letzte Benutzeranweisungen:** [Text]
- **Aktueller Modus:** {phase}

## Nächste Schritte
1. [Prioritäre Aufgabe 1]
2. [Prioritäre Aufgabe 2]
3. [Prioritäre Aufgabe 3]

## Referenzen
- [Links zu relevanten Memory-Bank-Einträgen]
- [Links zu relevanten Dokumentationen]

## Umgebungsinformationen
- **Python-Version:** [Version]
- **Node.js-Version:** [Version]
- **Aktive Services:** [Liste]
- **Besondere Hinweise zur Umgebung:** [Text]

## Konversationskontext
[Zusammenfassung der letzten Konversation und wichtige Entscheidungen]

---

**Übergeben von:** [Agent-Name/Rolle]  
**Übergeben an:** [Agent-Name/Rolle]  
**Datum und Uhrzeit:** {timestamp} 
"""
        
        # VAN-spezifische Vorlage
        van_template = """# Handover-Dokument: {date}

## Aktueller Status
- **Aktuelle Aufgabe:** [Beschreibung]
- **Fortschritt:** [Prozent]
- **Offene Probleme:** [Liste]

## Anforderungsanalyse
- **Hauptanforderungen:**
  - [Anforderung 1]
  - [Anforderung 2]
- **Klärungsfragen:**
  - [Frage 1]
  - [Frage 2]

## Kontext
- **Zuletzt bearbeitete Dateien:**
  - [Datei 1]
  - [Datei 2]
- **Aktuelle Konfiguration:** [Details]
- **Letzte Benutzeranweisungen:** [Text]
- **Aktueller Modus:** VAN

## Nächste Schritte
1. [Prioritäre Aufgabe 1]
2. [Prioritäre Aufgabe 2]
3. [Prioritäre Aufgabe 3]

## Referenzen
- [Links zu relevanten Memory-Bank-Einträgen]
- [Links zu relevanten Dokumentationen]

## Umgebungsinformationen
- **Python-Version:** [Version]
- **Node.js-Version:** [Version]
- **Aktive Services:** [Liste]
- **Besondere Hinweise zur Umgebung:** [Text]

---

**Übergeben von:** [Agent-Name/Rolle]  
**Übergeben an:** [Agent-Name/Rolle]  
**Datum und Uhrzeit:** {timestamp} 
"""
        
        # PLAN-spezifische Vorlage
        plan_template = """# Handover-Dokument: {date}

## Aktueller Status
- **Aktuelle Aufgabe:** [Beschreibung]
- **Fortschritt:** [Prozent]
- **Offene Probleme:** [Liste]

## Planungsdetails
- **Architekturentscheidungen:**
  - [Entscheidung 1]
  - [Entscheidung 2]
- **Ressourcenplanung:**
  - [Ressource 1]
  - [Ressource 2]
- **Zeitplan:**
  - [Meilenstein 1]
  - [Meilenstein 2]

## Kontext
- **Zuletzt bearbeitete Dateien:**
  - [Datei 1]
  - [Datei 2]
- **Aktuelle Konfiguration:** [Details]
- **Letzte Benutzeranweisungen:** [Text]
- **Aktueller Modus:** PLAN

## Nächste Schritte
1. [Prioritäre Aufgabe 1]
2. [Prioritäre Aufgabe 2]
3. [Prioritäre Aufgabe 3]

## Referenzen
- [Links zu relevanten Memory-Bank-Einträgen]
- [Links zu relevanten Dokumentationen]

## Umgebungsinformationen
- **Python-Version:** [Version]
- **Node.js-Version:** [Version]
- **Aktive Services:** [Liste]
- **Besondere Hinweise zur Umgebung:** [Text]

---

**Übergeben von:** [Agent-Name/Rolle]  
**Übergeben an:** [Agent-Name/Rolle]  
**Datum und Uhrzeit:** {timestamp} 
"""
        
        # Vorlagen speichern
        with open(self.templates_dir / "default_handover_template.md", "w", encoding="utf-8") as f:
            f.write(default_template)
        
        with open(self.templates_dir / "van_handover_template.md", "w", encoding="utf-8") as f:
            f.write(van_template)
        
        with open(self.templates_dir / "plan_handover_template.md", "w", encoding="utf-8") as f:
            f.write(plan_template)
        
        logger.info("Standardvorlagen für Handover-Dokumente erstellt")
    
    def create_handover_document(self, 
                               phase: str, 
                               content: Dict[str, Any]) -> str:
        """
        Erstellt ein Handover-Dokument basierend auf der angegebenen Phase und dem Inhalt.
        
        Args:
            phase: Phase des APM-Workflows (VAN, PLAN, CREATE, IMPLEMENT, REFLECT)
            content: Inhalt des Handover-Dokuments
            
        Returns:
            Pfad zum erstellten Handover-Dokument
        """
        # Vorlage laden
        template_path = self._get_template_path(phase)
        with open(template_path, "r", encoding="utf-8") as f:
            template = f.read()
        
        # Aktuelle Zeit
        now = datetime.now()
        date = now.strftime("%d.%m.%Y")
        timestamp = now.strftime("%d.%m.%Y, %H:%M Uhr")
        
        # Grundlegende Ersetzungen
        document = template.format(
            date=date,
            timestamp=timestamp,
            phase=phase
        )
        
        # Benutzerdefinierte Ersetzungen basierend auf dem Inhalt
        for key, value in content.items():
            placeholder = f"[{key}]"
            if isinstance(value, list):
                # Listen als Aufzählungen formatieren
                formatted_value = "\n  - " + "\n  - ".join(value)
                document = document.replace(placeholder, formatted_value)
            else:
                document = document.replace(placeholder, str(value))
        
        # Ausgabedatei
        self.output_dir.mkdir(parents=True, exist_ok=True)
        output_path = self.output_dir / "current-handover.md"
        
        # Dokument speichern
        with open(output_path, "w", encoding="utf-8") as f:
            f.write(document)
        
        logger.info(f"Handover-Dokument für Phase {phase} erstellt: {output_path}")
        
        return str(output_path)
    
    async def _generate_summary(self, content: str) -> str:
        """
        Generiert eine Zusammenfassung des Handover-Dokuments.
        
        Args:
            content: Inhalt des Handover-Dokuments
            
        Returns:
            Zusammenfassung des Handover-Dokuments
        """
        rag_workflow = self._get_rag_workflow()
        
        if rag_workflow == "openai_direct":
            try:
                import openai
                
                # OpenAI für die Zusammenfassung verwenden
                summary_prompt = f"""Fasse die wichtigsten Punkte aus diesem Handover-Dokument zusammen und extrahiere die nächsten Schritte:

{content}

Gib eine prägnante Zusammenfassung der wichtigsten Punkte und nächsten Schritte."""
                
                # Nicht-async Aufruf für die OpenAI API
                response = openai.chat.completions.create(
                    model="gpt-4o",
                    messages=[
                        {"role": "system", "content": "Du bist ein hilfreicher Assistent, der Handover-Dokumente zusammenfasst."},
                        {"role": "user", "content": summary_prompt}
                    ],
                    max_tokens=500
                )
                
                summary = response.choices[0].message.content
                logger.info("Zusammenfassung mit OpenAI erstellt")
                return str(summary)
            except Exception as e:
                logger.error(f"Fehler bei der Erstellung der Zusammenfassung mit OpenAI: {str(e)}")
                logger.info("Verwende einfache Textzusammenfassung")
        
        # Einfache Textzusammenfassung, falls OpenAI nicht verfügbar ist
        lines = content.split("\n")
        summary_lines = []
        
        # Extrahiere wichtige Informationen
        for i, line in enumerate(lines):
            if "Aktuelle Aufgabe:" in line or "Fortschritt:" in line or "Offene Probleme:" in line:
                summary_lines.append(line.strip())
            elif line.strip().startswith("## Nächste Schritte"):
                # Füge die nächsten Schritte hinzu
                j = i + 1
                while j < len(lines) and not lines[j].strip().startswith("##"):
                    if lines[j].strip():
                        summary_lines.append(lines[j].strip())
                    j += 1
        
        summary = " ".join(summary_lines)
        return summary
    
    async def save_to_mongodb(self, handover_path: str) -> str:
        """
        Speichert das Handover-Dokument in MongoDB.
        
        Args:
            handover_path: Pfad zum Handover-Dokument
            
        Returns:
            ID des gespeicherten Handover-Dokuments
        """
        try:
            # Handover-Dokument einlesen
            handover_path_obj = Path(handover_path)
            if not handover_path_obj.exists():
                raise FileNotFoundError(f"Handover-Datei nicht gefunden: {handover_path}")
            
            with open(handover_path_obj, "r", encoding="utf-8") as f:
                handover_content = f.read()
            
            logger.info(f"Handover-Dokument aus {handover_path} eingelesen")
            
            # Zusammenfassung erstellen
            summary = await self._generate_summary(handover_content)
            
            # Handover-Metadaten erstellen
            handover_data = {
                "content": handover_content,
                "summary": summary,
                "timestamp": datetime.now(),
                "source_file": str(handover_path_obj),
                "status": "active",
                "project_id": self.project_id
            }
            
            # In MongoDB speichern
            handover_id = self.mongodb_connector.db["handovers"].insert_one(handover_data)
            logger.info(f"Handover in MongoDB gespeichert mit ID: {handover_id.inserted_id}")
            
            # Referenz im Projekt-Dokument aktualisieren
            self.mongodb_connector.db["projects"].update_one(
                {"_id": self.project_id},
                {"$set": {"current_handover_id": handover_id.inserted_id}}
            )
            
            return str(handover_id.inserted_id)
            
        except Exception as e:
            logger.error(f"Fehler bei der Speicherung des Handover-Dokuments: {str(e)}")
            raise
    
    def get_latest_handover(self) -> Optional[Dict[str, Any]]:
        """
        Gibt das neueste Handover-Dokument zurück.
        
        Returns:
            Neuestes Handover-Dokument oder None, wenn keines gefunden wurde
        """
        handovers = self.mongodb_connector.find_many(
            "handovers", 
            {"project_id": self.project_id}, 
            sort=[("timestamp", -1)], 
            limit=1
        )
        
        if not handovers:
            logger.warning("Keine Handover-Dokumente gefunden")
            return None
        
        return handovers[0]
    
    def close(self):
        """Schließt die MongoDB-Verbindung."""
        self.mongodb_connector.close()
        logger.info("MongoDB-Verbindung geschlossen")

async def main():
    """Beispiel für die Verwendung des HandoverManagers."""
    try:
        # HandoverManager initialisieren
        manager = HandoverManager()
        
        # Handover-Dokument für die VAN-Phase erstellen
        content = {
            "Beschreibung": "Überprüfung der Transaktionsverarbeitung und Planung der nächsten Entwicklungsschritte",
            "Prozent": "100% (Transaktionsverarbeitung), 0% (nächste Aufgaben)",
            "Liste": "Keine kritischen Probleme",
            "Datei 1": "scripts/activate_van_mode.py",
            "Datei 2": "data/transaktionsverarbeitung.txt",
            "Datei 3": "memory-bank/tasks.md",
            "Details": "VAN-Modus mit MongoDB-Verbindung",
            "Text": "Überprüfung der Transaktionsverarbeitung, Analyse weiterer Module, Priorisierung nächster Aufgaben",
            "Prioritäre Aufgabe 1": "Sprint 3: Asynchrone Verarbeitung implementieren (Task-Queue-Infrastruktur aufbauen)",
            "Prioritäre Aufgabe 2": "Frontend-Funktionalitäten mit hoher Priorität umsetzen (Kundenverwaltung, Rechnungsformular, Lagerverwaltung)",
            "Prioritäre Aufgabe 3": "Kubernetes-Migration fortsetzen (Gesundheitsüberwachung, Secret-Management, Ressourcenlimits)",
            "Version": "3.11",
            "Liste": "MongoDB (localhost:27017)",
            "Agent-Name/Rolle": "Claude 3.7 Sonnet",
            "Zusammenfassung der letzten Konversation und wichtige Entscheidungen": "Der VAN-Modus wurde erfolgreich aktiviert und getestet. Die Transaktionsverarbeitung wurde bereits vollständig implementiert mit dem \"Chunked Processing mit Savepoints\"-Ansatz."
        }
        
        handover_path = manager.create_handover_document(HandoverManager.PHASE_VAN, content)
        
        # Handover-Dokument in MongoDB speichern
        handover_id = await manager.save_to_mongodb(handover_path)
        
        # Neuestes Handover-Dokument abrufen
        latest_handover = manager.get_latest_handover()
        
        if latest_handover:
            print(f"Neuestes Handover-Dokument (ID: {latest_handover['_id']}):")
            print(f"Zeitstempel: {latest_handover['timestamp']}")
            print(f"Status: {latest_handover.get('status', 'Unbekannt')}")
            print("\nZusammenfassung:")
            print(latest_handover.get('summary', 'Keine Zusammenfassung verfügbar'))
        
        # Verbindung schließen
        manager.close()
        
    except Exception as e:
        logger.error(f"Fehler im Hauptprogramm: {str(e)}")
        raise

if __name__ == "__main__":
    asyncio.run(main()) 