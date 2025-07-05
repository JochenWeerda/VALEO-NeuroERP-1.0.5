# LibreOffice-Integration für RAG-System

Diese Dokumentation beschreibt die Integration der LibreOffice-Unterstützung in das RAG-System von VALEO-NeuroERP.

## Überblick

Die LibreOffice-Integration ermöglicht die Verarbeitung und Analyse von LibreOffice-Dokumenten im RAG-System. Dies umfasst:

- Writer-Dokumente (`.odt`, `.ott`)
- Calc-Tabellen (`.ods`, `.ots`)
- Impress-Präsentationen (`.odp`, `.otp`)
- Draw-Dokumente (`.odg`, `.otg`)

## Technische Architektur

Die Integration basiert auf einer Kombination aus direkter UNO-Bridge-Nutzung und Konvertierungspipelines:

```
+------------------+          +------------------+          +------------------+
|                  |          |                  |          |                  |
| LibreOffice-     |  ------> | Konvertierungs-  |  ------> | Textextraktion   |
| Dokumente        |          | Pipeline         |          | und Indexierung  |
|                  |          |                  |          |                  |
+------------------+          +------------------+          +------------------+
```

### Komponenten

1. **LibreOffice UNO-Bridge**: Direkte Kommunikation mit LibreOffice über die Universal Network Objects (UNO) API
2. **PyODConverter**: Python-Wrapper für die Dokumentenkonvertierung
3. **Unoconv**: Kommandozeilen-Tool für die Batch-Konvertierung
4. **ODF-Parser**: Direktes Parsen von ODF-Dateien für einfache Textextraktion

## Implementierung

### Installation der Abhängigkeiten

```bash
# Installation von LibreOffice (Ubuntu/Debian)
sudo apt-get install libreoffice libreoffice-script-provider-python

# Installation von LibreOffice (Windows)
# Herunterladen und Installieren von https://www.libreoffice.org/download/

# Python-Abhängigkeiten
pip install pyuno pyodconverter unoconv odfpy ezodf
```

### LibreOffice-Parser

```python
import uno
from com.sun.star.beans import PropertyValue
from com.sun.star.uno import RuntimeException
from com.sun.star.io import IOException
from com.sun.star.lang import IllegalArgumentException

class LibreOfficeParser:
    def __init__(self, port=8100):
        """Initialisiert den LibreOffice-Parser mit einer Verbindung zum LibreOffice-Dienst."""
        self.port = port
        self.local_context = uno.getComponentContext()
        self.resolver = self.local_context.ServiceManager.createInstanceWithContext(
            "com.sun.star.bridge.UnoUrlResolver", self.local_context
        )
        self.connect()
        
    def connect(self):
        """Stellt eine Verbindung zum LibreOffice-Dienst her."""
        try:
            self.context = self.resolver.resolve(
                f"uno:socket,host=localhost,port={self.port};urp;StarOffice.ComponentContext"
            )
            self.desktop = self.context.ServiceManager.createInstanceWithContext(
                "com.sun.star.frame.Desktop", self.context
            )
        except RuntimeException:
            # LibreOffice ist nicht gestartet, wir starten es im Hintergrund
            import subprocess
            subprocess.Popen([
                "soffice",
                "--headless",
                "--accept=socket,host=localhost,port=8100;urp;"
            ])
            # Warten und erneut versuchen
            import time
            time.sleep(5)
            self.connect()
    
    def extract_text(self, file_path):
        """Extrahiert Text aus einem LibreOffice-Dokument."""
        try:
            # Dokument öffnen
            props = (PropertyValue("Hidden", 0, True, 0),)
            url = uno.systemPathToFileUrl(os.path.abspath(file_path))
            document = self.desktop.loadComponentFromURL(url, "_blank", 0, props)
            
            # Text extrahieren basierend auf Dokumenttyp
            if document.supportsService("com.sun.star.text.TextDocument"):
                # Writer-Dokument
                return self._extract_from_writer(document)
            elif document.supportsService("com.sun.star.sheet.SpreadsheetDocument"):
                # Calc-Dokument
                return self._extract_from_calc(document)
            elif document.supportsService("com.sun.star.presentation.PresentationDocument"):
                # Impress-Dokument
                return self._extract_from_impress(document)
            elif document.supportsService("com.sun.star.drawing.DrawingDocument"):
                # Draw-Dokument
                return self._extract_from_draw(document)
            else:
                return "Nicht unterstütztes Dokumentformat"
        except Exception as e:
            return f"Fehler beim Extrahieren des Textes: {str(e)}"
        finally:
            if 'document' in locals():
                document.close(True)
    
    def _extract_from_writer(self, document):
        """Extrahiert Text aus einem Writer-Dokument."""
        text = document.getText()
        return text.getString()
    
    def _extract_from_calc(self, document):
        """Extrahiert Text aus einem Calc-Dokument."""
        sheets = document.getSheets()
        text = []
        for i in range(sheets.getCount()):
            sheet = sheets.getByIndex(i)
            text.append(f"Sheet: {sheet.getName()}")
            cursor = sheet.createCursor()
            cursor.gotoEndOfUsedArea(True)
            rows = cursor.getRows()
            for row_idx in range(rows.getCount()):
                row = []
                for cell in sheet.getCellRangeByPosition(0, row_idx, cursor.getColumns().getCount() - 1, row_idx):
                    row.append(str(cell.getString()))
                text.append(" | ".join(row))
        return "\n".join(text)
    
    def _extract_from_impress(self, document):
        """Extrahiert Text aus einem Impress-Dokument."""
        text = []
        slides = document.getDrawPages()
        for i in range(slides.getCount()):
            slide = slides.getByIndex(i)
            text.append(f"Slide {i+1}:")
            for j in range(slide.getCount()):
                shape = slide.getByIndex(j)
                if hasattr(shape, "getString"):
                    text.append(shape.getString())
        return "\n".join(text)
    
    def _extract_from_draw(self, document):
        """Extrahiert Text aus einem Draw-Dokument."""
        text = []
        pages = document.getDrawPages()
        for i in range(pages.getCount()):
            page = pages.getByIndex(i)
            text.append(f"Page {i+1}:")
            for j in range(page.getCount()):
                shape = page.getByIndex(j)
                if hasattr(shape, "getString"):
                    text.append(shape.getString())
        return "\n".join(text)
```

### Konvertierungspipeline

```python
import os
import subprocess
from tempfile import NamedTemporaryFile

class LibreOfficeConverter:
    def __init__(self, libreoffice_path=None):
        """Initialisiert den LibreOffice-Konverter."""
        self.libreoffice_path = libreoffice_path or self._find_libreoffice_path()
    
    def _find_libreoffice_path(self):
        """Findet den Pfad zur LibreOffice-Installation."""
        possible_paths = [
            "/usr/bin/libreoffice",
            "/usr/bin/soffice",
            "C:\\Program Files\\LibreOffice\\program\\soffice.exe",
            "C:\\Program Files (x86)\\LibreOffice\\program\\soffice.exe",
        ]
        for path in possible_paths:
            if os.path.exists(path):
                return path
        raise FileNotFoundError("LibreOffice nicht gefunden. Bitte installieren Sie LibreOffice oder geben Sie den Pfad manuell an.")
    
    def convert_to_pdf(self, input_file, output_file=None):
        """Konvertiert ein LibreOffice-Dokument in PDF."""
        if output_file is None:
            output_file = os.path.splitext(input_file)[0] + ".pdf"
        
        cmd = [
            self.libreoffice_path,
            "--headless",
            "--convert-to", "pdf",
            "--outdir", os.path.dirname(output_file),
            input_file
        ]
        
        try:
            subprocess.run(cmd, check=True, capture_output=True)
            return output_file
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"Fehler bei der Konvertierung: {e.stderr.decode()}")
    
    def convert_to_text(self, input_file):
        """Konvertiert ein LibreOffice-Dokument in Plaintext."""
        with NamedTemporaryFile(suffix=".txt", delete=False) as temp_file:
            temp_path = temp_file.name
        
        cmd = [
            self.libreoffice_path,
            "--headless",
            "--convert-to", "txt:Text",
            "--outdir", os.path.dirname(temp_path),
            input_file
        ]
        
        try:
            subprocess.run(cmd, check=True, capture_output=True)
            txt_file = os.path.join(
                os.path.dirname(temp_path),
                os.path.basename(os.path.splitext(input_file)[0] + ".txt")
            )
            with open(txt_file, 'r', encoding='utf-8') as f:
                content = f.read()
            os.unlink(txt_file)
            return content
        except subprocess.CalledProcessError as e:
            raise RuntimeError(f"Fehler bei der Konvertierung: {e.stderr.decode()}")
        finally:
            if os.path.exists(temp_path):
                os.unlink(temp_path)
```

### Integration in das RAG-System

```python
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import FAISS

class LibreOfficeRAGProcessor:
    def __init__(self, parser=None, converter=None):
        """Initialisiert den LibreOffice-RAG-Prozessor."""
        self.parser = parser or LibreOfficeParser()
        self.converter = converter or LibreOfficeConverter()
        self.text_splitter = RecursiveCharacterTextSplitter(chunk_size=1000, chunk_overlap=100)
        self.embeddings = OpenAIEmbeddings()
    
    def process_document(self, file_path):
        """Verarbeitet ein LibreOffice-Dokument für das RAG-System."""
        # Versuch der direkten Textextraktion
        try:
            text = self.parser.extract_text(file_path)
        except Exception as e:
            print(f"Direkte Extraktion fehlgeschlagen: {e}")
            # Fallback zur Konvertierung
            text = self.converter.convert_to_text(file_path)
        
        # Metadaten extrahieren
        metadata = {
            "source": file_path,
            "type": os.path.splitext(file_path)[1],
            "filename": os.path.basename(file_path)
        }
        
        # Text in Chunks aufteilen
        chunks = self.text_splitter.split_text(text)
        
        # Dokument-Metadaten zu jedem Chunk hinzufügen
        docs = [
            {"content": chunk, "metadata": {**metadata, "chunk_id": i}}
            for i, chunk in enumerate(chunks)
        ]
        
        return docs
    
    def add_to_index(self, vector_db, file_path):
        """Fügt ein LibreOffice-Dokument zum Vektorindex hinzu."""
        docs = self.process_document(file_path)
        texts = [doc["content"] for doc in docs]
        metadatas = [doc["metadata"] for doc in docs]
        vector_db.add_texts(texts=texts, metadatas=metadatas)
        return len(docs)
```

## Nutzung im RAG-System

```python
# Initialisierung
processor = LibreOfficeRAGProcessor()
vector_db = FAISS.from_texts(texts=[], embedding=OpenAIEmbeddings())

# Dokumente hinzufügen
processor.add_to_index(vector_db, "path/to/document.odt")
processor.add_to_index(vector_db, "path/to/spreadsheet.ods")
processor.add_to_index(vector_db, "path/to/presentation.odp")

# Abfrage
query = "Was sind die Umsatzzahlen für Q2 2025?"
docs = vector_db.similarity_search(query)
```

## Bekannte Einschränkungen

1. **Komplexe Formatierungen**: Einige komplexe Formatierungen in LibreOffice-Dokumenten können bei der Textextraktion verloren gehen.
2. **Eingebettete Objekte**: Eingebettete Objekte wie Bilder oder Diagramme werden nicht vollständig verarbeitet.
3. **Große Tabellen**: Sehr große Calc-Tabellen können zu Performance-Problemen führen.
4. **LibreOffice-Abhängigkeit**: Die direkte UNO-Bridge erfordert eine lokale LibreOffice-Installation.

## Fehlerbehebung

### LibreOffice-Dienst startet nicht

Wenn der LibreOffice-Dienst nicht automatisch startet:

```bash
# Manueller Start des LibreOffice-Dienstes
soffice --headless --accept="socket,host=localhost,port=8100;urp;" --nofirststartwizard
```

### Konvertierungsprobleme

Bei Problemen mit der Konvertierung:

1. Überprüfen Sie, ob LibreOffice korrekt installiert ist
2. Stellen Sie sicher, dass die Dateiberechtigungen korrekt sind
3. Versuchen Sie, die Datei manuell mit LibreOffice zu öffnen, um Korruptionen auszuschließen

## Nächste Schritte

1. **Verbesserte Metadaten-Extraktion**: Implementierung einer tieferen Metadaten-Extraktion aus LibreOffice-Dokumenten
2. **Tabellen-Parsing**: Verbesserung der Tabellenerkennung und -verarbeitung
3. **Bildanalyse**: Integration von OCR für eingebettete Bilder in LibreOffice-Dokumenten
4. **Inkrementelle Updates**: Unterstützung für inkrementelle Updates bei Dokumentänderungen

## Referenzen

- [LibreOffice API Documentation](https://api.libreoffice.org/)
- [PyUNO Documentation](https://wiki.documentfoundation.org/Macros/Python_Guide/Introduction)
- [ODF Specification](http://docs.oasis-open.org/office/v1.2/os/OpenDocument-v1.2-os.html)
- [Unoconv Documentation](https://github.com/unoconv/unoconv) 