# Medienverarbeitungs-Tasks

Dieses Dokument beschreibt die Medienverarbeitungs-Tasks im VALEO-NeuroERP-System, die für die asynchrone Verarbeitung von Bildern, PDFs und anderen Dokumenten verwendet werden.

## Übersicht

Die Medienverarbeitungs-Tasks bieten folgende Funktionen:

1. **Bildverarbeitung**: Größenänderung, Filterung und andere Bildoperationen
2. **OCR-Textextraktion**: Erkennung von Text in Bildern
3. **PDF-Verarbeitung**: Extraktion von Text und Bildern aus PDFs
4. **Batch-Dokumentenverarbeitung**: Verarbeitung mehrerer Dateien in einem Durchgang

## Voraussetzungen

Für die Verwendung der Medienverarbeitungs-Tasks werden folgende Pakete benötigt:

```bash
pip install pillow pytesseract opencv-python pdf2image PyMuPDF
```

Zusätzlich muss Tesseract OCR installiert sein:

- **Windows**: [Tesseract bei GitHub](https://github.com/UB-Mannheim/tesseract/wiki)
- **Linux**: `apt-get install tesseract-ocr`
- **macOS**: `brew install tesseract`

## Konfiguration

In den Django-Einstellungen kann der Pfad zu Tesseract konfiguriert werden:

```python
# In settings.py
TESSERACT_CMD_PATH = 'C:\\Program Files\\Tesseract-OCR\\tesseract.exe'  # Für Windows
```

## Tasks

### Bildverarbeitung

```python
from backend.tasks.media_processing_tasks import process_image

task = process_image.delay(
    image_path="path/to/image.jpg",  # Pfad zum Eingabebild
    operations=[                      # Liste von Operationen
        {"type": "resize", "width": 800},
        {"type": "filter", "filter": "sharpen"},
        {"type": "adjust", "adjust": "brightness", "factor": 1.2}
    ],
    output_format="JPEG",            # Format der Ausgabedatei
    quality=90                       # Qualität (nur für JPEG)
)
```

#### Unterstützte Operationen

1. **resize**: Bildgröße ändern
   ```python
   {"type": "resize", "width": 800, "height": 600}  # Beide Dimensionen
   {"type": "resize", "width": 800}                # Breite mit proportionaler Höhe
   {"type": "resize", "height": 600}               # Höhe mit proportionaler Breite
   ```

2. **crop**: Bild zuschneiden
   ```python
   {"type": "crop", "left": 10, "top": 20, "right": 300, "bottom": 400}
   ```

3. **rotate**: Bild drehen
   ```python
   {"type": "rotate", "angle": 90, "expand": True}
   ```

4. **flip**: Bild spiegeln
   ```python
   {"type": "flip", "direction": "horizontal"}  # oder "vertical"
   ```

5. **filter**: Filter anwenden
   ```python
   {"type": "filter", "filter": "blur", "radius": 2}
   {"type": "filter", "filter": "sharpen"}
   {"type": "filter", "filter": "edge_enhance"}
   {"type": "filter", "filter": "find_edges"}
   ```

6. **adjust**: Bildparameter anpassen
   ```python
   {"type": "adjust", "adjust": "brightness", "factor": 1.5}
   {"type": "adjust", "adjust": "contrast", "factor": 1.2}
   {"type": "adjust", "adjust": "color", "factor": 0.8}
   {"type": "adjust", "adjust": "sharpness", "factor": 2.0}
   ```

7. **convert**: Farbmodus ändern
   ```python
   {"type": "convert", "mode": "RGB"}  # oder "L" für Graustufen, "CMYK", etc.
   ```

#### Rückgabewerte

```python
{
    "status": "success",
    "original_path": "/path/to/original/image.jpg",
    "processed_path": "/path/to/processed/image_20230624_123456.jpg",
    "original_info": {
        "format": "JPEG",
        "mode": "RGB",
        "size": [1200, 800]
    },
    "processed_info": {
        "format": "JPEG",
        "mode": "RGB",
        "size": [800, 533]
    },
    "operations_applied": 3
}
```

### OCR-Textextraktion

```python
from backend.tasks.media_processing_tasks import extract_text_from_image

task = extract_text_from_image.delay(
    image_path="path/to/document.png",  # Pfad zum Bild
    language="deu",                     # Sprache für OCR
    preprocess=True                     # Vorverarbeitung für bessere Ergebnisse
)
```

#### Parameter

- `image_path`: Pfad zum Eingabebild
- `language`: Sprache für die OCR-Erkennung (z.B. 'deu' für Deutsch, 'eng' für Englisch)
- `preprocess`: Ob das Bild vor der OCR vorverarbeitet werden soll

#### Rückgabewerte

```python
{
    "status": "success",
    "text": "Extrahierter Text aus dem Bild...",
    "text_file_path": "/path/to/document_ocr_20230624_123456.txt",
    "language": "deu",
    "word_count": 157,
    "confidence": 92.5,
    "words_data": [
        {
            "text": "Beispiel",
            "conf": 96.7,
            "box": [100, 200, 80, 30]
        },
        # Weitere Wörter...
    ]
}
```

### PDF-Verarbeitung

```python
from backend.tasks.media_processing_tasks import process_pdf

task = process_pdf.delay(
    pdf_path="path/to/document.pdf",  # Pfad zur PDF-Datei
    operations=[                       # Liste von Operationen
        {"type": "extract_text"},
        {"type": "extract_images"}
    ]
)
```

#### Unterstützte Operationen

1. **extract_text**: Text aus PDF extrahieren
   ```python
   {"type": "extract_text"}
   ```

2. **extract_images**: Bilder aus PDF extrahieren
   ```python
   {"type": "extract_images"}
   ```

3. **convert_to_images**: PDF-Seiten in Bilder umwandeln
   ```python
   {"type": "convert_to_images", "dpi": 300, "format": "PNG"}
   ```

4. **merge_pdfs**: Weitere PDFs mit dieser zusammenführen
   ```python
   {"type": "merge_pdfs", "pdf_paths": ["path/to/other1.pdf", "path/to/other2.pdf"]}
   ```

#### Rückgabewerte

```python
{
    "status": "success",
    "original_path": "/path/to/original/document.pdf",
    "processed_path": "/path/to/processed/document_20230624_123456.pdf",
    "page_count": 5,
    "metadata": {
        "title": "Beispieldokument",
        "author": "Max Mustermann",
        "creator": "PDF Creator",
        "producer": "PDF Library 1.0"
    },
    "operations_applied": 2,
    "operation_results": [
        {
            "text_path": "/path/to/document_text_20230624_123456.txt",
            "text_length": 15420
        },
        {
            "image_count": 8,
            "image_paths": [
                "/path/to/document_image_1_1.jpg",
                # Weitere Bilder...
            ]
        }
    ]
}
```

### Batch-Dokumentenverarbeitung

```python
from backend.tasks.media_processing_tasks import batch_document_processing

task = batch_document_processing.delay(
    file_paths=[                       # Liste von Dateipfaden
        "path/to/image1.jpg",
        "path/to/image2.jpg",
        "path/to/image3.jpg"
    ],
    process_type="image_resize",       # Art der Verarbeitung
    params={                           # Parameter für die Verarbeitung
        "width": 1024,
        "output_format": "PNG"
    }
)
```

#### Unterstützte Prozesstypen

1. **ocr**: OCR-Textextraktion für Bilder
   ```python
   "process_type": "ocr",
   "params": {
       "language": "deu",
       "preprocess": True
   }
   ```

2. **image_resize**: Bildgrößenänderung
   ```python
   "process_type": "image_resize",
   "params": {
       "width": 800,
       "height": 600,
       "output_format": "JPEG",
       "quality": 85
   }
   ```

3. **pdf_text**: Text aus PDF extrahieren
   ```python
   "process_type": "pdf_text"
   ```

#### Rückgabewerte

```python
{
    "status": "success",
    "process_type": "image_resize",
    "total_files": 3,
    "successful": 3,
    "failed": 0,
    "results": [
        {
            "file_path": "path/to/image1.jpg",
            "result": {
                "status": "success",
                "processed_path": "/path/to/image1_processed_20230624_123456.png",
                # Weitere Details...
            }
        },
        # Weitere Ergebnisse...
    ],
    "failures": []
}
```

## Beispiele

### Bildgrößenänderung und Optimierung

```python
from backend.tasks.media_processing_tasks import process_image

# Bild für Web-Anzeige optimieren
task = process_image.delay(
    image_path="uploads/product_photo.jpg",
    operations=[
        {"type": "resize", "width": 1200},  # Breite auf 1200px setzen, Höhe proportional
        {"type": "filter", "filter": "sharpen"},  # Schärfen für bessere Details
        {"type": "adjust", "adjust": "brightness", "factor": 1.1},  # Leicht aufhellen
        {"type": "adjust", "adjust": "contrast", "factor": 1.1}  # Kontrast erhöhen
    ],
    output_format="JPEG",
    quality=85  # Gute Qualität bei reduzierter Dateigröße
)
```

### OCR für gescannte Dokumente

```python
from backend.tasks.media_processing_tasks import extract_text_from_image

# Text aus gescanntem Dokument extrahieren
task = extract_text_from_image.delay(
    image_path="uploads/scanned_invoice.png",
    language="deu+eng",  # Deutsch und Englisch erkennen
    preprocess=True  # Bildvorverarbeitung für bessere OCR-Ergebnisse
)

# Task-ID für spätere Statusabfrage
task_id = task.id
```

### PDF-Verarbeitung für Dokumentenarchivierung

```python
from backend.tasks.media_processing_tasks import process_pdf

# PDF verarbeiten und Inhalte extrahieren
task = process_pdf.delay(
    pdf_path="uploads/contract.pdf",
    operations=[
        {"type": "extract_text"},  # Text extrahieren für Suchbarkeit
        {"type": "extract_images"},  # Bilder extrahieren
        {"type": "convert_to_images", "dpi": 150, "format": "JPEG"}  # Vorschaubilder erstellen
    ]
)
```

### Batch-Verarbeitung von Produktbildern

```python
from backend.tasks.media_processing_tasks import batch_document_processing

# Mehrere Produktbilder gleichzeitig verarbeiten
file_paths = [f"uploads/product_{i}.jpg" for i in range(1, 51)]  # 50 Bilder

task = batch_document_processing.delay(
    file_paths=file_paths,
    process_type="image_resize",
    params={
        "width": 800,  # Standardbreite für Produktbilder
        "output_format": "JPEG",
        "quality": 85
    }
)
```

## Fortschrittsanzeige

Alle Tasks aktualisieren regelmäßig ihren Fortschritt, der über die `AsyncTask`-Tabelle in der Datenbank verfolgt werden kann:

```python
from backend.models.async_task import AsyncTask

# Task-Status abfragen
task = AsyncTask.objects.get(task_id=task_id)
progress = task.result.get('progress', 0)
message = task.result.get('message', '')

print(f"Fortschritt: {progress}% - {message}")
```

## Fehlerbehandlung

Alle Tasks verwenden exponentielles Backoff für Wiederholungsversuche bei Fehlern:

```python
try:
    # Task-Logik
except Exception as e:
    return retry_task_with_exponential_backoff(self, exc=e)
```

Die maximale Anzahl von Wiederholungsversuchen ist standardmäßig auf 3 festgelegt und kann bei der Task-Definition angepasst werden.

## Speicherorte

Verarbeitete Dateien werden im `PROCESSED_MEDIA_PATH` gespeichert, der standardmäßig auf `settings.MEDIA_ROOT/processed` festgelegt ist. Dieser Pfad kann in den Django-Einstellungen angepasst werden:

```python
# In settings.py
MEDIA_ROOT = os.path.join(BASE_DIR, 'media')
PROCESSED_MEDIA_PATH = os.path.join(MEDIA_ROOT, 'custom_processed_folder')
```

## Leistungsoptimierung

Für eine optimale Leistung bei der Verarbeitung großer Mediendateien sollten folgende Aspekte beachtet werden:

1. **Worker-Konfiguration**: Dedizierte Worker für medienintensive Tasks
   ```bash
   celery -A backend worker -l info -Q media_processing --concurrency=2
   ```

2. **Speicherlimits**: Anpassung der Speicherlimits für große Dateien
   ```python
   # In celery_app.py
   app.conf.worker_max_memory_per_child = 1000000  # 1GB
   ```

3. **Batch-Größe**: Verwendung der Batch-Verarbeitung für viele kleine Dateien, aber Aufteilung großer Batches für bessere Parallelisierung

4. **Temporäre Dateien**: Regelmäßige Bereinigung temporärer Dateien durch periodische Tasks 