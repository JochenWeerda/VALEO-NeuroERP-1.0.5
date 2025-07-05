# Demo-Daten für VALEO-NeuroERP

Dieser Ordner enthält Beispieldaten für die Demonstration der Task-Queue-Funktionalität im VALEO-NeuroERP-System.

## Enthaltene Dateien

### Datenimport-Demos
- `customers.csv` - Kundendaten für CSV-Import
- `products.xlsx` - Produktdaten für Excel-Import
- `orders.json` - Bestelldaten für JSON-Import

### Datenanalyse-Demos
- `sales_data.csv` - Verkaufsdaten für Zeitreihenanalyse
- `customer_segments.csv` - Kundendaten für Cluster-Analyse
- `transactions.csv` - Transaktionsdaten für Anomalieerkennung
- `customer_churn.csv` - Kundendaten für prädiktive Modellierung

### Medienverarbeitungs-Demos
- `sample_image.jpg` - Beispielbild für Bildverarbeitung
- `document_scan.png` - Gescanntes Dokument für OCR
- `sample_document.pdf` - Beispiel-PDF für PDF-Verarbeitung
- `image1.jpg`, `image2.jpg`, `image3.jpg` - Beispielbilder für Batch-Verarbeitung

## Verwendung

Diese Dateien werden vom Demo-Skript `backend/tasks/demo_tasks.py` verwendet, um die verschiedenen Task-Queue-Funktionen zu demonstrieren.

Um die Demo auszuführen:

```bash
python manage.py shell -c "from backend.tasks.demo_tasks import main; main()"
```

Oder mit spezifischen Optionen:

```bash
python manage.py shell -c "import sys; sys.argv=['', '--analysis']; from backend.tasks.demo_tasks import main; main()"
```

## Hinweis

Die Beispieldaten sind fiktiv und dienen nur zu Demonstrationszwecken. In einer Produktionsumgebung sollten echte Daten verwendet werden. 