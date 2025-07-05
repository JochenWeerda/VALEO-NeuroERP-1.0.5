"""
MongoDB Restart Manager für VALEO-NeuroERP

Dieses Modul implementiert einen Restart-Manager für MongoDB, der bei Ausfällen
automatisch einen Neustart durchführt und die Verbindung wiederherstellt.
"""

import os
import sys
import time
import logging
import subprocess
import platform
from typing import Optional, Dict, Any, List, Tuple
import pymongo
from pymongo.errors import ConnectionFailure, ServerSelectionTimeoutError
import signal

# Logger konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s',
    handlers=[
        logging.FileHandler("mongodb_restart_manager.log"),
        logging.StreamHandler()
    ]
)
logger = logging.getLogger("MongoDBRestartManager")

class MongoDBRestartManager:
    """
    Manager für automatischen Neustart von MongoDB bei Ausfällen.
    """
    
    def __init__(
        self, 
        connection_string: str = "mongodb://localhost:27017/",
        max_retries: int = 5,
        retry_delay: int = 10,
        service_name: str = "mongodb",
        db_path: str = None,
        config_path: str = None
    ):
        """
        Initialisiert den MongoDB Restart Manager.
        
        Args:
            connection_string: MongoDB-Verbindungsstring
            max_retries: Maximale Anzahl von Wiederverbindungsversuchen
            retry_delay: Verzögerung zwischen Wiederverbindungsversuchen in Sekunden
            service_name: Name des MongoDB-Dienstes
            db_path: Pfad zur MongoDB-Datenbank (für manuelle Starts)
            config_path: Pfad zur MongoDB-Konfigurationsdatei (für manuelle Starts)
        """
        self.connection_string = connection_string
        self.max_retries = max_retries
        self.retry_delay = retry_delay
        self.service_name = service_name
        self.db_path = db_path
        self.config_path = config_path
        self.client = None
        self.is_running = False
        self.os_type = platform.system().lower()
        
        logger.info(f"MongoDB Restart Manager initialisiert mit: connection_string={connection_string}, "
                   f"max_retries={max_retries}, retry_delay={retry_delay}, service_name={service_name}")
    
    def connect(self) -> bool:
        """
        Stellt eine Verbindung zu MongoDB her.
        
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
            self.is_running = True
            return True
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"Verbindung zu MongoDB fehlgeschlagen: {str(e)}")
            self.is_running = False
            return False
    
    def check_connection(self) -> bool:
        """
        Überprüft die bestehende Verbindung zu MongoDB.
        
        Returns:
            bool: True, wenn die Verbindung aktiv ist, sonst False
        """
        if not self.client:
            logger.warning("Keine MongoDB-Client-Instanz vorhanden.")
            return False
        
        try:
            self.client.admin.command('ping')
            logger.debug("MongoDB-Verbindung ist aktiv.")
            return True
        except (ConnectionFailure, ServerSelectionTimeoutError) as e:
            logger.error(f"MongoDB-Verbindung ist nicht aktiv: {str(e)}")
            return False
    
    def restart_mongodb_service(self) -> bool:
        """
        Startet den MongoDB-Dienst neu.
        
        Returns:
            bool: True, wenn der Neustart erfolgreich war, sonst False
        """
        logger.info(f"Versuche MongoDB-Dienst ({self.service_name}) neu zu starten...")
        
        # Kommandos für verschiedene Betriebssysteme
        if self.os_type == "windows":
            return self._restart_mongodb_windows()
        elif self.os_type == "linux":
            return self._restart_mongodb_linux()
        elif self.os_type == "darwin":  # macOS
            return self._restart_mongodb_macos()
        else:
            logger.error(f"Nicht unterstütztes Betriebssystem: {self.os_type}")
            return False
    
    def _restart_mongodb_windows(self) -> bool:
        """
        Startet den MongoDB-Dienst unter Windows neu.
        
        Returns:
            bool: True, wenn der Neustart erfolgreich war, sonst False
        """
        try:
            # MongoDB-Dienst stoppen
            logger.info("Stoppe MongoDB-Dienst unter Windows...")
            stop_cmd = ["net", "stop", self.service_name]
            subprocess.run(stop_cmd, check=True, capture_output=True)
            
            # Kurze Pause
            time.sleep(2)
            
            # MongoDB-Dienst starten
            logger.info("Starte MongoDB-Dienst unter Windows...")
            start_cmd = ["net", "start", self.service_name]
            subprocess.run(start_cmd, check=True, capture_output=True)
            
            logger.info("MongoDB-Dienst erfolgreich neu gestartet.")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Fehler beim Neustart des MongoDB-Dienstes unter Windows: {str(e)}")
            
            # Versuche manuellen Start, wenn Dienst nicht verfügbar
            if self.db_path and self.config_path:
                logger.info("Versuche manuellen Start von MongoDB...")
                return self._start_mongodb_manually_windows()
            return False
    
    def _restart_mongodb_linux(self) -> bool:
        """
        Startet den MongoDB-Dienst unter Linux neu.
        
        Returns:
            bool: True, wenn der Neustart erfolgreich war, sonst False
        """
        try:
            # MongoDB-Dienst neustarten
            logger.info("Starte MongoDB-Dienst unter Linux neu...")
            
            # Prüfe, ob systemctl verfügbar ist
            if self._command_exists("systemctl"):
                cmd = ["sudo", "systemctl", "restart", self.service_name]
                subprocess.run(cmd, check=True, capture_output=True)
            # Prüfe, ob service verfügbar ist
            elif self._command_exists("service"):
                cmd = ["sudo", "service", self.service_name, "restart"]
                subprocess.run(cmd, check=True, capture_output=True)
            else:
                logger.error("Weder systemctl noch service-Befehl gefunden.")
                
                # Versuche manuellen Start
                if self.db_path:
                    logger.info("Versuche manuellen Start von MongoDB...")
                    return self._start_mongodb_manually_linux()
                return False
            
            logger.info("MongoDB-Dienst erfolgreich neu gestartet.")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Fehler beim Neustart des MongoDB-Dienstes unter Linux: {str(e)}")
            
            # Versuche manuellen Start
            if self.db_path:
                logger.info("Versuche manuellen Start von MongoDB...")
                return self._start_mongodb_manually_linux()
            return False
    
    def _restart_mongodb_macos(self) -> bool:
        """
        Startet den MongoDB-Dienst unter macOS neu.
        
        Returns:
            bool: True, wenn der Neustart erfolgreich war, sonst False
        """
        try:
            # Prüfe, ob MongoDB über brew installiert wurde
            if self._command_exists("brew"):
                logger.info("Starte MongoDB-Dienst über Homebrew neu...")
                stop_cmd = ["brew", "services", "stop", "mongodb-community"]
                subprocess.run(stop_cmd, check=True, capture_output=True)
                
                time.sleep(2)
                
                start_cmd = ["brew", "services", "start", "mongodb-community"]
                subprocess.run(start_cmd, check=True, capture_output=True)
            else:
                # Versuche über launchctl (für MongoDB als Service)
                logger.info("Starte MongoDB-Dienst über launchctl neu...")
                stop_cmd = ["launchctl", "unload", f"/usr/local/opt/mongodb-community/homebrew.mxcl.{self.service_name}.plist"]
                subprocess.run(stop_cmd, check=True, capture_output=True)
                
                time.sleep(2)
                
                start_cmd = ["launchctl", "load", f"/usr/local/opt/mongodb-community/homebrew.mxcl.{self.service_name}.plist"]
                subprocess.run(start_cmd, check=True, capture_output=True)
            
            logger.info("MongoDB-Dienst erfolgreich neu gestartet.")
            return True
        except subprocess.CalledProcessError as e:
            logger.error(f"Fehler beim Neustart des MongoDB-Dienstes unter macOS: {str(e)}")
            
            # Versuche manuellen Start
            if self.db_path:
                logger.info("Versuche manuellen Start von MongoDB...")
                return self._start_mongodb_manually_macos()
            return False
    
    def _start_mongodb_manually_windows(self) -> bool:
        """
        Startet MongoDB manuell unter Windows.
        
        Returns:
            bool: True, wenn der Start erfolgreich war, sonst False
        """
        try:
            cmd = ["mongod"]
            
            if self.db_path:
                cmd.extend(["--dbpath", self.db_path])
            
            if self.config_path:
                cmd.extend(["--config", self.config_path])
            
            # Starte MongoDB im Hintergrund
            subprocess.Popen(cmd, 
                            stdout=subprocess.DEVNULL,
                            stderr=subprocess.DEVNULL,
                            creationflags=subprocess.CREATE_NEW_PROCESS_GROUP)
            
            logger.info("MongoDB manuell gestartet.")
            
            # Warte kurz und prüfe, ob MongoDB läuft
            time.sleep(5)
            return self.connect()
        except Exception as e:
            logger.error(f"Fehler beim manuellen Start von MongoDB unter Windows: {str(e)}")
            return False
    
    def _start_mongodb_manually_linux(self) -> bool:
        """
        Startet MongoDB manuell unter Linux.
        
        Returns:
            bool: True, wenn der Start erfolgreich war, sonst False
        """
        try:
            cmd = ["mongod"]
            
            if self.db_path:
                cmd.extend(["--dbpath", self.db_path])
            
            if self.config_path:
                cmd.extend(["--config", self.config_path])
            
            # Starte MongoDB im Hintergrund
            process = subprocess.Popen(cmd, 
                                      stdout=subprocess.DEVNULL,
                                      stderr=subprocess.DEVNULL,
                                      start_new_session=True)
            
            logger.info(f"MongoDB manuell gestartet mit PID: {process.pid}")
            
            # Warte kurz und prüfe, ob MongoDB läuft
            time.sleep(5)
            return self.connect()
        except Exception as e:
            logger.error(f"Fehler beim manuellen Start von MongoDB unter Linux: {str(e)}")
            return False
    
    def _start_mongodb_manually_macos(self) -> bool:
        """
        Startet MongoDB manuell unter macOS.
        
        Returns:
            bool: True, wenn der Start erfolgreich war, sonst False
        """
        try:
            cmd = ["mongod"]
            
            if self.db_path:
                cmd.extend(["--dbpath", self.db_path])
            
            if self.config_path:
                cmd.extend(["--config", self.config_path])
            
            # Starte MongoDB im Hintergrund
            process = subprocess.Popen(cmd, 
                                      stdout=subprocess.DEVNULL,
                                      stderr=subprocess.DEVNULL,
                                      start_new_session=True)
            
            logger.info(f"MongoDB manuell gestartet mit PID: {process.pid}")
            
            # Warte kurz und prüfe, ob MongoDB läuft
            time.sleep(5)
            return self.connect()
        except Exception as e:
            logger.error(f"Fehler beim manuellen Start von MongoDB unter macOS: {str(e)}")
            return False
    
    def _command_exists(self, command: str) -> bool:
        """
        Prüft, ob ein Befehl im System verfügbar ist.
        
        Args:
            command: Der zu prüfende Befehl
        
        Returns:
            bool: True, wenn der Befehl verfügbar ist, sonst False
        """
        if self.os_type == "windows":
            cmd = ["where", command]
        else:
            cmd = ["which", command]
        
        try:
            subprocess.run(cmd, check=True, capture_output=True)
            return True
        except subprocess.CalledProcessError:
            return False
    
    def reconnect(self) -> bool:
        """
        Versucht, die Verbindung zu MongoDB wiederherzustellen.
        
        Returns:
            bool: True, wenn die Wiederverbindung erfolgreich war, sonst False
        """
        logger.info("Versuche, die Verbindung zu MongoDB wiederherzustellen...")
        
        for attempt in range(1, self.max_retries + 1):
            logger.info(f"Wiederverbindungsversuch {attempt}/{self.max_retries}")
            
            if self.connect():
                logger.info("Wiederverbindung erfolgreich hergestellt.")
                return True
            
            if attempt < self.max_retries:
                logger.info(f"Warte {self.retry_delay} Sekunden vor dem nächsten Versuch...")
                time.sleep(self.retry_delay)
        
        logger.error(f"Alle {self.max_retries} Wiederverbindungsversuche fehlgeschlagen.")
        return False
    
    def handle_connection_failure(self) -> bool:
        """
        Behandelt einen Verbindungsausfall zu MongoDB.
        
        Returns:
            bool: True, wenn die Verbindung wiederhergestellt wurde, sonst False
        """
        logger.warning("MongoDB-Verbindungsausfall erkannt. Starte Wiederherstellungsprozess...")
        
        # Versuche zuerst eine einfache Wiederverbindung
        if self.reconnect():
            return True
        
        # Wenn die Wiederverbindung fehlschlägt, versuche einen Neustart
        logger.info("Wiederverbindung fehlgeschlagen. Versuche Neustart des MongoDB-Dienstes...")
        if self.restart_mongodb_service():
            # Nach dem Neustart erneut verbinden
            time.sleep(5)  # Warte, bis der Dienst vollständig gestartet ist
            return self.reconnect()
        
        logger.error("Konnte MongoDB-Dienst nicht neustarten und keine Verbindung wiederherstellen.")
        return False
    
    def monitor(self, check_interval: int = 60) -> None:
        """
        Überwacht kontinuierlich die MongoDB-Verbindung und behandelt Ausfälle.
        
        Args:
            check_interval: Intervall in Sekunden zwischen den Verbindungsprüfungen
        """
        logger.info(f"Starte MongoDB-Verbindungsüberwachung mit Intervall {check_interval} Sekunden...")
        
        # Erste Verbindung herstellen
        if not self.connect():
            logger.error("Initiale Verbindung zu MongoDB konnte nicht hergestellt werden.")
            if not self.handle_connection_failure():
                logger.critical("Konnte keine Verbindung zu MongoDB herstellen. Überwachung wird beendet.")
                return
        
        try:
            while True:
                if not self.check_connection():
                    logger.warning("MongoDB-Verbindung unterbrochen.")
                    if not self.handle_connection_failure():
                        logger.error("Konnte Verbindung nicht wiederherstellen. Nächster Versuch in "
                                    f"{check_interval} Sekunden.")
                
                time.sleep(check_interval)
        except KeyboardInterrupt:
            logger.info("MongoDB-Verbindungsüberwachung durch Benutzer beendet.")
        except Exception as e:
            logger.error(f"Fehler in der MongoDB-Verbindungsüberwachung: {str(e)}")
    
    def close(self) -> None:
        """
        Schließt die MongoDB-Verbindung.
        """
        if self.client:
            logger.info("Schließe MongoDB-Verbindung...")
            self.client.close()
            self.client = None
            self.is_running = False
            logger.info("MongoDB-Verbindung geschlossen.")


def main():
    """
    Hauptfunktion für die Ausführung des MongoDB Restart Managers als Standalone-Skript.
    """
    import argparse
    
    parser = argparse.ArgumentParser(description="MongoDB Restart Manager")
    parser.add_argument("--connection-string", default="mongodb://localhost:27017/",
                        help="MongoDB-Verbindungsstring")
    parser.add_argument("--max-retries", type=int, default=5,
                        help="Maximale Anzahl von Wiederverbindungsversuchen")
    parser.add_argument("--retry-delay", type=int, default=10,
                        help="Verzögerung zwischen Wiederverbindungsversuchen in Sekunden")
    parser.add_argument("--service-name", default="mongodb",
                        help="Name des MongoDB-Dienstes")
    parser.add_argument("--db-path", default=None,
                        help="Pfad zur MongoDB-Datenbank (für manuelle Starts)")
    parser.add_argument("--config-path", default=None,
                        help="Pfad zur MongoDB-Konfigurationsdatei (für manuelle Starts)")
    parser.add_argument("--check-interval", type=int, default=60,
                        help="Intervall in Sekunden zwischen den Verbindungsprüfungen")
    
    args = parser.parse_args()
    
    restart_manager = MongoDBRestartManager(
        connection_string=args.connection_string,
        max_retries=args.max_retries,
        retry_delay=args.retry_delay,
        service_name=args.service_name,
        db_path=args.db_path,
        config_path=args.config_path
    )
    
    # Signal-Handler für sauberes Beenden
    def signal_handler(sig, frame):
        logger.info("Programm wird beendet...")
        restart_manager.close()
        sys.exit(0)
    
    signal.signal(signal.SIGINT, signal_handler)
    signal.signal(signal.SIGTERM, signal_handler)
    
    # Starte die Überwachung
    restart_manager.monitor(check_interval=args.check_interval)


if __name__ == "__main__":
    main()
