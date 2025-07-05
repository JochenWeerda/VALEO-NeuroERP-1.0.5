"""
LibreOffice-Prozessor für die Dokumentenverarbeitung

Dieses Modul implementiert die LibreOffice-Integration für die Dokumentenverarbeitung
im RAG-System von VALEO-NeuroERP.
"""

import os
import logging
import subprocess
from tempfile import NamedTemporaryFile
from typing import Optional

logger = logging.getLogger("valeo-neuroerp.libreoffice")

class LibreOfficeProcessor:
    """
    Klasse zur Verarbeitung von LibreOffice-Dokumenten.
    
    Diese Klasse bietet Funktionen zur Textextraktion aus verschiedenen
    LibreOffice-Dokumentformaten wie Writer, Calc, Impress und Draw.
    """
    
    def __init__(self, libreoffice_path: Optional[str] = None, port: int = 8100):
        """
        Initialisiert den LibreOffice-Prozessor.
        
        Args:
            libreoffice_path: Pfad zur LibreOffice-Installation (optional)
            port: Port für die UNO-Bridge-Verbindung
        """
        self.port = port
        self.libreoffice_path = libreoffice_path or self._find_libreoffice_path()
        self.uno_initialized = False
        
        # Versuche, die UNO-Bridge zu initialisieren
        try:
            self._init_uno_bridge()
            self.uno_initialized = True
            logger.info("UNO-Bridge erfolgreich initialisiert")
        except Exception as e:
            logger.warning(f"UNO-Bridge konnte nicht initialisiert werden: {e}")
            logger.info("Fallback auf Konvertierungsmethode wird verwendet")
    
    def _find_libreoffice_path(self) -> str:
        """
        Findet den Pfad zur LibreOffice-Installation.
        
        Returns:
            str: Pfad zur LibreOffice-Installation
        """
        possible_paths = [
            "/usr/bin/libreoffice",
            "/usr/bin/soffice",
            "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
            "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
        ]
        
        for path in possible_paths:
            if os.path.exists(path):
                logger.info(f"LibreOffice gefunden unter: {path}")
                return path
        
        logger.warning("LibreOffice nicht gefunden. Bitte installieren Sie LibreOffice oder geben Sie den Pfad manuell an.")
        # Fallback auf "soffice", was in der PATH-Variable sein könnte
        return "soffice"
    
    def _init_uno_bridge(self):
        """
        Initialisiert die UNO-Bridge für die direkte Kommunikation mit LibreOffice.
        """
        try:
            # Versuche, die UNO-Module zu importieren
            global uno
            import uno
            from com.sun.star.beans import PropertyValue
            from com.sun.star.uno import RuntimeException
            
            # Lokalen Kontext erstellen
            self.local_context = uno.getComponentContext()
            self.resolver = self.local_context.ServiceManager.createInstanceWithContext(
                "com.sun.star.bridge.UnoUrlResolver", self.local_context
            )
            
            # Verbindung zum LibreOffice-Dienst herstellen
            self._connect_to_libreoffice()
            
        except ImportError:
            logger.error("UNO-Module konnten nicht importiert werden")
            raise
    
    def _connect_to_libreoffice(self):
        """
        Stellt eine Verbindung zum LibreOffice-Dienst her.
        """
        try:
            # Verbindung zum LibreOffice-Dienst herstellen
            self.context = self.resolver.resolve(
                f"uno:socket,host=localhost,port={self.port};urp;StarOffice.ComponentContext"
            )
            self.desktop = self.context.ServiceManager.createInstanceWithContext(
                "com.sun.star.frame.Desktop", self.context
            )
            logger.info("Verbindung zum LibreOffice-Dienst hergestellt")
            
        except Exception:
            logger.warning("LibreOffice-Dienst nicht gefunden, starte neuen Dienst")
            
            # LibreOffice im Headless-Modus starten
            try:
                subprocess.Popen([
                    self.libreoffice_path,
                    "--headless",
                    "--accept=socket,host=localhost,port=8100;urp;"
                ])
                
                # Kurz warten und erneut versuchen
                import time
                time.sleep(5)
                
                # Erneut versuchen, eine Verbindung herzustellen
                self.context = self.resolver.resolve(
                    f"uno:socket,host=localhost,port={self.port};urp;StarOffice.ComponentContext"
                )
                self.desktop = self.context.ServiceManager.createInstanceWithContext(
                    "com.sun.star.frame.Desktop", self.context
                )
                logger.info("Verbindung zum gestarteten LibreOffice-Dienst hergestellt")
                
            except Exception as e:
                logger.error(f"Konnte keine Verbindung zum LibreOffice-Dienst herstellen: {e}")
                raise
    
    def extract_text(self, file_path: str) -> str:
        """
        Extrahiert Text aus einem LibreOffice-Dokument.
        
        Args:
            file_path: Pfad zum LibreOffice-Dokument
            
        Returns:
            str: Extrahierter Text
        """
        if not self.uno_initialized:
            logger.info("UNO-Bridge nicht initialisiert, verwende Konvertierungsmethode")
            return self.convert_to_text(file_path)
        
        try:
            # Dokument öffnen
            from com.sun.star.beans import PropertyValue
            props = (PropertyValue("Hidden", 0, True, 0),)
            url = uno.systemPathToFileUrl(os.path.abspath(file_path))
            document = self.desktop.loadComponentFromURL(url, "_blank", 0, props)
            
            try:
                # Text basierend auf Dokumenttyp extrahieren
                if document.supportsService("com.sun.star.text.TextDocument"):
                    # Writer-Dokument
                    logger.info(f"Writer-Dokument erkannt: {file_path}")
                    text = self._extract_from_writer(document)
                elif document.supportsService("com.sun.star.sheet.SpreadsheetDocument"):
                    # Calc-Dokument
                    logger.info(f"Calc-Dokument erkannt: {file_path}")
                    text = self._extract_from_calc(document)
                elif document.supportsService("com.sun.star.presentation.PresentationDocument"):
                    # Impress-Dokument
                    logger.info(f"Impress-Dokument erkannt: {file_path}")
                    text = self._extract_from_impress(document)
                elif document.supportsService("com.sun.star.drawing.DrawingDocument"):
                    # Draw-Dokument
                    logger.info(f"Draw-Dokument erkannt: {file_path}")
                    text = self._extract_from_draw(document)
                else:
                    logger.warning(f"Nicht unterstütztes Dokumentformat: {file_path}")
                    text = "Nicht unterstütztes Dokumentformat"
                
                return text
            finally:
                # Dokument schließen
                document.close(True)
        
        except Exception as e:
            logger.error(f"Fehler bei der direkten Textextraktion: {e}")
            logger.info("Fallback auf Konvertierungsmethode")
            return self.convert_to_text(file_path)
    
    def _extract_from_writer(self, document) -> str:
        """
        Extrahiert Text aus einem Writer-Dokument.
        
        Args:
            document: LibreOffice-Writer-Dokument
            
        Returns:
            str: Extrahierter Text
        """
        text = document.getText()
        return text.getString()
    
    def _extract_from_calc(self, document) -> str:
        """
        Extrahiert Text aus einem Calc-Dokument.
        
        Args:
            document: LibreOffice-Calc-Dokument
            
        Returns:
            str: Extrahierter Text
        """
        sheets = document.getSheets()
        text_parts = []
        
        for i in range(sheets.getCount()):
            sheet = sheets.getByIndex(i)
            text_parts.append(f"Sheet: {sheet.getName()}")
            
            # Zellenbereich durchlaufen
            cursor = sheet.createCursor()
            cursor.gotoEndOfUsedArea(True)
            
            for row_idx in range(cursor.getRows().getCount()):
                row_texts = []
                for cell in sheet.getCellRangeByPosition(0, row_idx, cursor.getColumns().getCount() - 1, row_idx):
                    row_texts.append(str(cell.getString()))
                text_parts.append(" | ".join(row_texts))
        
        return "\n".join(text_parts)
    
    def _extract_from_impress(self, document) -> str:
        """
        Extrahiert Text aus einem Impress-Dokument.
        
        Args:
            document: LibreOffice-Impress-Dokument
            
        Returns:
            str: Extrahierter Text
        """
        slides = document.getDrawPages()
        text_parts = []
        
        for i in range(slides.getCount()):
            slide = slides.getByIndex(i)
            text_parts.append(f"Slide {i+1}:")
            
            for j in range(slide.getCount()):
                shape = slide.getByIndex(j)
                if hasattr(shape, "getString"):
                    text_parts.append(shape.getString())
                
                # Notizen extrahieren, falls vorhanden
                if hasattr(document, "getNotesPage"):
                    notes_page = document.getNotesPage(slide)
                    if notes_page:
                        text_parts.append("Notizen:")
                        for k in range(notes_page.getCount()):
                            notes_shape = notes_page.getByIndex(k)
                            if hasattr(notes_shape, "getString"):
                                text_parts.append(notes_shape.getString())
        
        return "\n".join(text_parts)
    
    def _extract_from_draw(self, document) -> str:
        """
        Extrahiert Text aus einem Draw-Dokument.
        
        Args:
            document: LibreOffice-Draw-Dokument
            
        Returns:
            str: Extrahierter Text
        """
        pages = document.getDrawPages()
        text_parts = []
        
        for i in range(pages.getCount()):
            page = pages.getByIndex(i)
            text_parts.append(f"Page {i+1}:")
            
            for j in range(page.getCount()):
                shape = page.getByIndex(j)
                if hasattr(shape, "getString"):
                    text_parts.append(shape.getString())
        
        return "\n".join(text_parts)
    
    def convert_to_text(self, file_path: str) -> str:
        """
        Konvertiert ein LibreOffice-Dokument in Plaintext.
        
        Diese Methode wird als Fallback verwendet, wenn die direkte Extraktion fehlschlägt.
        
        Args:
            file_path: Pfad zum LibreOffice-Dokument
            
        Returns:
            str: Extrahierter Text
        """
        logger.info(f"Konvertiere Dokument zu Text: {file_path}")
        
        with NamedTemporaryFile(suffix=".txt", delete=False) as temp_file:
            temp_path = temp_file.name
        
        try:
            # LibreOffice-Kommandozeile für Konvertierung nutzen
            cmd = [
                self.libreoffice_path,
                "--headless",
                "--convert-to", "txt:Text",
                "--outdir", os.path.dirname(temp_path),
                file_path
            ]
            
            logger.debug(f"Ausführen des Konvertierungsbefehls: {' '.join(cmd)}")
            subprocess.run(cmd, check=True, capture_output=True)
            
            # Konvertierte Datei lesen
            txt_file = os.path.join(
                os.path.dirname(temp_path),
                os.path.basename(os.path.splitext(file_path)[0] + ".txt")
            )
            
            if not os.path.exists(txt_file):
                logger.error(f"Konvertierte Datei nicht gefunden: {txt_file}")
                return f"Fehler: Konnte {file_path} nicht konvertieren"
            
            with open(txt_file, 'r', encoding='utf-8') as f:
                content = f.read()
            
            # Temporäre Datei löschen
            os.unlink(txt_file)
            logger.info(f"Dokument erfolgreich konvertiert: {file_path}")
            return content
            
        except Exception as e:
            logger.error(f"Fehler bei der Konvertierung: {e}")
            return f"Fehler bei der Konvertierung: {str(e)}"
        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)
    
    def convert_to_pdf(self, input_file: str, output_file: Optional[str] = None) -> str:
        """
        Konvertiert ein LibreOffice-Dokument in PDF.
        
        Args:
            input_file: Pfad zum LibreOffice-Dokument
            output_file: Pfad zur Ausgabedatei (optional)
            
        Returns:
            str: Pfad zur konvertierten PDF-Datei
        """
        if output_file is None:
            output_file = os.path.splitext(input_file)[0] + ".pdf"
        
        logger.info(f"Konvertiere Dokument zu PDF: {input_file} -> {output_file}")
        
        cmd = [
            self.libreoffice_path,
            "--headless",
            "--convert-to", "pdf",
            "--outdir", os.path.dirname(output_file),
            input_file
        ]
        
        try:
            subprocess.run(cmd, check=True, capture_output=True)
            logger.info(f"Dokument erfolgreich zu PDF konvertiert: {output_file}")
            return output_file
        except subprocess.CalledProcessError as e:
            logger.error(f"Fehler bei der PDF-Konvertierung: {e.stderr.decode()}")
            raise RuntimeError(f"Fehler bei der Konvertierung: {e.stderr.decode()}")
