"""
REFLECT-ARCHIVE Data Loader für VALEO-NeuroERP

Dieses Modul lädt strukturierte Daten aus dem AI_driven_ERP-Verzeichnis
in die MongoDB für den REFLECT-ARCHIVE-Mode.
"""

import os
import sys
import json
import logging
import datetime
from pathlib import Path
from typing import Dict, List, Any, Optional, Union
import pymongo
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError

# Logger konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("reflect_archive_data_loader.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("ReflectArchiveDataLoader")

class ReflectArchiveDataLoader:
    """
    Lädt strukturierte Daten aus dem AI_driven_ERP-Verzeichnis in die MongoDB.
    """
    
    def __init__(
        self, 
        connection_string: str = "mongodb://localhost:27017/",
        database_name: str = "valeo_neuroerp",
        source_dir: str = "C:/AI_driven_ERP"
    ):
        """
        Initialisiert den ReflectArchiveDataLoader.
        
        Args:
            connection_string: MongoDB-Verbindungsstring
            database_name: Name der Zieldatenbank
            source_dir: Quellverzeichnis für die Daten
        """
        self.connection_string = connection_string
        self.database_name = database_name
        self.source_dir = Path(source_dir)
        self.client = None
        self.db = None
        self.collections = {
            "project_structure": None,
            "code_files": None,
            "documentation": None,
            "tasks": None,
            "context": None
        }
        
        logger.info(f"ReflectArchiveDataLoader initialisiert mit: connection_string={connection_string}, "
                   f"database_name={database_name}, source_dir={source_dir}")
    
    def connect(self) -> bool:
        """
        Stellt eine Verbindung zur MongoDB her und initialisiert die Sammlungen.
        
        Returns:
            bool: True, wenn die Verbindung erfolgreich hergestellt wurde, sonst False
        """
        try:
            logger.info("Verbindung zu MongoDB wird hergestellt...")
            self.client = pymongo.MongoClient(
                self.connection_string,
                serverSelectionTimeoutMS=5000
            )
            # Verbindung testen
            self.client.admin.command('ping')
            logger.info("Verbindung zu MongoDB erfolgreich hergestellt.")
            
            # Datenbank und Sammlungen initialisieren
            self.db = self.client[self.database_name]
            
            for collection_name in self.collections:
                self.collections[collection_name] = self.db[collection_name]
                logger.info(f"Sammlung '{collection_name}' initialisiert.")
            
            return True
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"Verbindung zu MongoDB fehlgeschlagen: {str(e)}")
            return False
    
    def load_data(self) -> bool:
        """
        Lädt alle Daten aus dem Quellverzeichnis in die MongoDB.
        
        Returns:
            bool: True, wenn das Laden erfolgreich war, sonst False
        """
        if not self.connect():
            logger.error("Konnte keine Verbindung zur MongoDB herstellen.")
            return False
        
        try:
            # Projektstruktur laden
            self._load_project_structure()
            
            # Code-Dateien laden
            self._load_code_files()
            
            # Dokumentation laden
            self._load_documentation()
            
            # Aufgaben laden
            self._load_tasks()
            
            # Kontext laden
            self._load_context()
            
            logger.info("Alle Daten erfolgreich in die MongoDB geladen.")
            return True
        except Exception as e:
            logger.error(f"Fehler beim Laden der Daten: {str(e)}")
            return False
        finally:
            if self.client:
                self.client.close()
                logger.info("MongoDB-Verbindung geschlossen.")
    
    def _load_project_structure(self) -> None:
        """
        Lädt die Projektstruktur in die MongoDB.
        """
        logger.info("Lade Projektstruktur...")
        
        # Sammlung leeren
        self.collections["project_structure"].delete_many({})
        
        # Projektstruktur rekursiv durchlaufen
        structure = self._scan_directory(self.source_dir)
        
        # In MongoDB speichern
        self.collections["project_structure"].insert_one({
            "timestamp": datetime.datetime.now(),
            "structure": structure
        })
        
        logger.info("Projektstruktur erfolgreich geladen.")
    
    def _scan_directory(self, directory: Path) -> Dict[str, Any]:
        """
        Scannt ein Verzeichnis rekursiv und gibt die Struktur zurück.
        
        Args:
            directory: Das zu scannende Verzeichnis
            
        Returns:
            Dict: Die Verzeichnisstruktur
        """
        result = {
            "name": directory.name,
            "type": "directory",
            "path": str(directory),
            "children": []
        }
        
        try:
            for item in directory.iterdir():
                if item.is_dir():
                    # Rekursiver Aufruf für Unterverzeichnisse
                    if not item.name.startswith('.') and not item.name == 'node_modules' and not item.name == 'venv':
                        result["children"].append(self._scan_directory(item))
                else:
                    # Datei hinzufügen
                    result["children"].append({
                        "name": item.name,
                        "type": "file",
                        "path": str(item),
                        "extension": item.suffix,
                        "size": item.stat().st_size
                    })
        except PermissionError:
            logger.warning(f"Keine Berechtigung für Verzeichnis: {directory}")
        except Exception as e:
            logger.warning(f"Fehler beim Scannen von {directory}: {str(e)}")
        
        return result
    
    def _load_code_files(self) -> None:
        """
        Lädt relevante Code-Dateien in die MongoDB.
        """
        logger.info("Lade Code-Dateien...")
        
        # Sammlung leeren
        self.collections["code_files"].delete_many({})
        
        # Relevante Dateierweiterungen
        code_extensions = ['.py', '.js', '.jsx', '.ts', '.tsx', '.html', '.css', '.json', '.yml', '.yaml']
        
        # Dateien rekursiv durchsuchen
        for code_file in self._find_files_by_extensions(self.source_dir, code_extensions):
            try:
                # Binärmodus zum Erkennen von Null-Bytes
                with open(code_file, 'rb') as f:
                    content_bytes = f.read()
                
                # Prüfen auf Null-Bytes
                if b'\x00' in content_bytes:
                    logger.warning(f"Datei {code_file} enthält Null-Bytes und wird übersprungen.")
                    continue
                
                # In Text umwandeln
                try:
                    content = content_bytes.decode('utf-8')
                except UnicodeDecodeError:
                    logger.warning(f"Datei {code_file} konnte nicht als UTF-8 dekodiert werden, versuche latin-1.")
                    content = content_bytes.decode('latin-1')
                
                # In MongoDB speichern
                self.collections["code_files"].insert_one({
                    "filename": code_file.name,
                    "path": str(code_file),
                    "extension": code_file.suffix,
                    "content": content,
                    "size": code_file.stat().st_size,
                    "last_modified": datetime.datetime.fromtimestamp(code_file.stat().st_mtime),
                    "timestamp": datetime.datetime.now()
                })
            except Exception as e:
                logger.warning(f"Fehler beim Lesen der Datei {code_file}: {str(e)}")
        
        logger.info("Code-Dateien erfolgreich geladen.")
    
    def _load_documentation(self) -> None:
        """
        Lädt Dokumentationsdateien in die MongoDB.
        """
        logger.info("Lade Dokumentation...")
        
        # Sammlung leeren
        self.collections["documentation"].delete_many({})
        
        # Relevante Dateierweiterungen
        doc_extensions = ['.md', '.txt']
        
        # Dateien rekursiv durchsuchen
        for doc_file in self._find_files_by_extensions(self.source_dir, doc_extensions):
            try:
                # Binärmodus zum Erkennen von Null-Bytes
                with open(doc_file, 'rb') as f:
                    content_bytes = f.read()
                
                # Prüfen auf Null-Bytes
                if b'\x00' in content_bytes:
                    logger.warning(f"Datei {doc_file} enthält Null-Bytes und wird übersprungen.")
                    continue
                
                # In Text umwandeln
                try:
                    content = content_bytes.decode('utf-8')
                except UnicodeDecodeError:
                    logger.warning(f"Datei {doc_file} konnte nicht als UTF-8 dekodiert werden, versuche latin-1.")
                    content = content_bytes.decode('latin-1')
                
                # In MongoDB speichern
                self.collections["documentation"].insert_one({
                    "filename": doc_file.name,
                    "path": str(doc_file),
                    "extension": doc_file.suffix,
                    "content": content,
                    "size": doc_file.stat().st_size,
                    "last_modified": datetime.datetime.fromtimestamp(doc_file.stat().st_mtime),
                    "timestamp": datetime.datetime.now()
                })
            except Exception as e:
                logger.warning(f"Fehler beim Lesen der Datei {doc_file}: {str(e)}")
        
        logger.info("Dokumentation erfolgreich geladen.")
    
    def _load_tasks(self) -> None:
        """
        Lädt Aufgabendateien in die MongoDB.
        """
        logger.info("Lade Aufgaben...")
        
        # Sammlung leeren
        self.collections["tasks"].delete_many({})
        
        # Aufgabendateien suchen
        tasks_files = [
            self.source_dir / "memory-bank" / "tasks.md",
            self.source_dir / "memory-bank" / "tasks-new.md"
        ]
        
        for task_file in tasks_files:
            if task_file.exists():
                try:
                    # Binärmodus zum Erkennen von Null-Bytes
                    with open(task_file, 'rb') as f:
                        content_bytes = f.read()
                    
                    # Prüfen auf Null-Bytes
                    if b'\x00' in content_bytes:
                        logger.warning(f"Datei {task_file} enthält Null-Bytes und wird übersprungen.")
                        continue
                    
                    # In Text umwandeln
                    try:
                        content = content_bytes.decode('utf-8')
                    except UnicodeDecodeError:
                        logger.warning(f"Datei {task_file} konnte nicht als UTF-8 dekodiert werden, versuche latin-1.")
                        content = content_bytes.decode('latin-1')
                    
                    # Aufgaben parsen
                    tasks = self._parse_tasks(content)
                    
                    # In MongoDB speichern
                    self.collections["tasks"].insert_one({
                        "filename": task_file.name,
                        "path": str(task_file),
                        "content": content,
                        "parsed_tasks": tasks,
                        "last_modified": datetime.datetime.fromtimestamp(task_file.stat().st_mtime),
                        "timestamp": datetime.datetime.now()
                    })
                except Exception as e:
                    logger.warning(f"Fehler beim Lesen der Aufgabendatei {task_file}: {str(e)}")
        
        logger.info("Aufgaben erfolgreich geladen.")
    
    def _load_context(self) -> None:
        """
        Lädt Kontextdateien in die MongoDB.
        """
        logger.info("Lade Kontext...")
        
        # Sammlung leeren
        self.collections["context"].delete_many({})
        
        # Kontextdateien suchen
        context_files = [
            self.source_dir / "memory-bank" / "activeContext.md",
            self.source_dir / "memory-bank" / "progress.md"
        ]
        
        for context_file in context_files:
            if context_file.exists():
                try:
                    # Binärmodus zum Erkennen von Null-Bytes
                    with open(context_file, 'rb') as f:
                        content_bytes = f.read()
                    
                    # Prüfen auf Null-Bytes
                    if b'\x00' in content_bytes:
                        logger.warning(f"Datei {context_file} enthält Null-Bytes und wird übersprungen.")
                        continue
                    
                    # In Text umwandeln
                    try:
                        content = content_bytes.decode('utf-8')
                    except UnicodeDecodeError:
                        logger.warning(f"Datei {context_file} konnte nicht als UTF-8 dekodiert werden, versuche latin-1.")
                        content = content_bytes.decode('latin-1')
                    
                    # In MongoDB speichern
                    self.collections["context"].insert_one({
                        "filename": context_file.name,
                        "path": str(context_file),
                        "content": content,
                        "last_modified": datetime.datetime.fromtimestamp(context_file.stat().st_mtime),
                        "timestamp": datetime.datetime.now()
                    })
                except Exception as e:
                    logger.warning(f"Fehler beim Lesen der Kontextdatei {context_file}: {str(e)}")
        
        logger.info("Kontext erfolgreich geladen.")
    
    def _find_files_by_extensions(self, directory: Path, extensions: List[str]) -> List[Path]:
        """
        Findet alle Dateien mit den angegebenen Erweiterungen in einem Verzeichnis.
        
        Args:
            directory: Das zu durchsuchende Verzeichnis
            extensions: Liste der Dateierweiterungen
            
        Returns:
            List[Path]: Liste der gefundenen Dateien
        """
        result = []
        
        try:
            for item in directory.rglob("*"):
                if item.is_file() and item.suffix.lower() in extensions:
                    # Ignoriere bestimmte Verzeichnisse
                    if not any(part.startswith('.') or part == 'node_modules' or part == 'venv' 
                              for part in item.parts):
                        result.append(item)
        except PermissionError:
            logger.warning(f"Keine Berechtigung für Verzeichnis: {directory}")
        except Exception as e:
            logger.warning(f"Fehler beim Durchsuchen von {directory}: {str(e)}")
        
        return result
    
    def _parse_tasks(self, content: str) -> List[Dict[str, Any]]:
        """
        Parst Aufgaben aus einer Markdown-Datei.
        
        Args:
            content: Inhalt der Markdown-Datei
            
        Returns:
            List[Dict]: Liste der geparsten Aufgaben
        """
        tasks = []
        current_section = None
        current_task = None
        
        for line in content.split('\n'):
            # Abschnitte erkennen (### Niedrige Komplexität)
            if line.startswith('### '):
                current_section = line.strip('# ').strip()
                continue
            
            # Aufgaben erkennen (1. ✅ **Fehlende Module installieren**)
            if current_section and line.strip().startswith(('1.', '2.', '3.', '4.', '5.', '6.', '7.', '8.', '9.', '10.')):
                # Vorherige Aufgabe speichern, falls vorhanden
                if current_task:
                    tasks.append(current_task)
                
                # Neue Aufgabe erstellen
                parts = line.strip().split(' ', 1)
                if len(parts) > 1:
                    task_number = parts[0].strip('.')
                    task_text = parts[1].strip()
                    
                    # Status erkennen (✅, ⬜, 📝)
                    status = "offen"
                    if "✅" in task_text:
                        status = "abgeschlossen"
                    elif "📝" in task_text:
                        status = "in_bearbeitung"
                    
                    # Aufgabentitel extrahieren
                    title = task_text.replace("✅", "").replace("⬜", "").replace("📝", "").strip()
                    if "**" in title:
                        title = title.split("**")[1] if len(title.split("**")) > 1 else title
                    
                    current_task = {
                        "number": int(task_number),
                        "title": title,
                        "status": status,
                        "complexity": current_section,
                        "description": "",
                        "subtasks": []
                    }
                continue
            
            # Unteraufgaben erkennen (- Formik und Yup für Formulare)
            if current_task and line.strip().startswith('-'):
                subtask_text = line.strip('- ').strip()
                current_task["subtasks"].append(subtask_text)
                continue
            
            # Beschreibung zur aktuellen Aufgabe hinzufügen
            if current_task and line.strip() and not line.startswith('#'):
                if current_task["description"]:
                    current_task["description"] += "\n" + line
                else:
                    current_task["description"] = line
        
        # Letzte Aufgabe speichern, falls vorhanden
        if current_task:
            tasks.append(current_task)
        
        return tasks


def main():
    """
    Hauptfunktion für die Ausführung des ReflectArchiveDataLoaders als Standalone-Skript.
    """
    import argparse
    
    parser = argparse.ArgumentParser(description="REFLECT-ARCHIVE Data Loader")
    parser.add_argument("--connection-string", default="mongodb://localhost:27017/",
                        help="MongoDB-Verbindungsstring")
    parser.add_argument("--database-name", default="valeo_neuroerp",
                        help="Name der Zieldatenbank")
    parser.add_argument("--source-dir", default="C:/AI_driven_ERP",
                        help="Quellverzeichnis für die Daten")
    
    args = parser.parse_args()
    
    data_loader = ReflectArchiveDataLoader(
        connection_string=args.connection_string,
        database_name=args.database_name,
        source_dir=args.source_dir
    )
    
    success = data_loader.load_data()
    
    if success:
        logger.info("Daten erfolgreich in die MongoDB geladen.")
        sys.exit(0)
    else:
        logger.error("Fehler beim Laden der Daten in die MongoDB.")
        sys.exit(1)


if __name__ == "__main__":
    main()