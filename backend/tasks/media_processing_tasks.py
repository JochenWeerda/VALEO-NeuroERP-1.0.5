"""
Medienverarbeitungs-Tasks für das VALEO-NeuroERP-System.

Dieses Modul enthält Celery-Tasks für die asynchrone Verarbeitung von Bildern
und Dokumenten, einschließlich OCR, Bildverarbeitung und PDF-Verarbeitung.
"""

import os
import time
import logging
import json
from typing import Dict, List, Any, Optional, Union, Tuple
from pathlib import Path
from celery import shared_task

# Bildverarbeitung
import cv2
import numpy as np
from PIL import Image

# OCR (Texterkennung)
try:
    import pytesseract
    TESSERACT_AVAILABLE = True
except ImportError:
    TESSERACT_AVAILABLE = False
    logging.warning("pytesseract nicht installiert. OCR-Funktionalität ist eingeschränkt.")

# PDF-Verarbeitung
try:
    from pdf2image import convert_from_path
    from PyPDF2 import PdfReader, PdfWriter
    PDF_PROCESSING_AVAILABLE = True
except ImportError:
    PDF_PROCESSING_AVAILABLE = False
    logging.warning("pdf2image oder PyPDF2 nicht installiert. PDF-Verarbeitung ist eingeschränkt.")

# Lokale Imports
from backend.services.task_queue import update_task_progress

logger = logging.getLogger(__name__)

@shared_task(bind=True)
def process_image(self, image_path: str, operations: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Verarbeitet ein Bild mit den angegebenen Operationen.
    
    Args:
        image_path: Pfad zum Eingabebild
        operations: Liste von Operationen, die auf das Bild angewendet werden sollen
                    Jede Operation ist ein Dict mit:
                    - 'type': Art der Operation (z.B. 'resize', 'rotate', 'filter')
                    - weitere Parameter je nach Operation
    
    Returns:
        Dict mit Verarbeitungsergebnissen und Pfad zum verarbeiteten Bild
    """
    logger.info(f"Starte Bildverarbeitung für {image_path}")
    
    try:
        # Standardwerte
        operations = operations or []
        
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 10, "Bild wird geladen")
        
        # Prüfen, ob die Datei existiert
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Bilddatei nicht gefunden: {image_path}")
        
        # Bild laden
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Konnte Bild nicht laden: {image_path}")
        
        # Verarbeitungsschritte durchführen
        total_operations = len(operations)
        results = {"operations_applied": []}
        
        for i, operation in enumerate(operations):
            op_type = operation.get('type', '').lower()
            progress = 10 + int(80 * (i + 1) / (total_operations + 1))
            
            update_task_progress(self.request.id, progress, f"Operation '{op_type}' wird angewendet")
            
            if op_type == 'resize':
                width = operation.get('width', img.shape[1])
                height = operation.get('height', img.shape[0])
                img = cv2.resize(img, (width, height))
                results["operations_applied"].append(f"resize to {width}x{height}")
                
            elif op_type == 'rotate':
                angle = operation.get('angle', 0)
                center = tuple(np.array(img.shape[1::-1]) / 2)
                rot_mat = cv2.getRotationMatrix2D(center, angle, 1.0)
                img = cv2.warpAffine(img, rot_mat, img.shape[1::-1], flags=cv2.INTER_LINEAR)
                results["operations_applied"].append(f"rotate {angle} degrees")
                
            elif op_type == 'crop':
                x = operation.get('x', 0)
                y = operation.get('y', 0)
                width = operation.get('width', img.shape[1] - x)
                height = operation.get('height', img.shape[0] - y)
                img = img[y:y+height, x:x+width]
                results["operations_applied"].append(f"crop to {width}x{height} from ({x},{y})")
                
            elif op_type == 'filter':
                filter_type = operation.get('filter_type', 'blur')
                
                if filter_type == 'blur':
                    kernel_size = operation.get('kernel_size', 5)
                    img = cv2.GaussianBlur(img, (kernel_size, kernel_size), 0)
                    results["operations_applied"].append(f"gaussian blur with kernel {kernel_size}")
                    
                elif filter_type == 'sharpen':
                    kernel = np.array([[-1, -1, -1], [-1, 9, -1], [-1, -1, -1]])
                    img = cv2.filter2D(img, -1, kernel)
                    results["operations_applied"].append("sharpen")
                    
                elif filter_type == 'edge_detection':
                    img = cv2.Canny(img, 100, 200)
                    results["operations_applied"].append("edge detection")
                    
            elif op_type == 'threshold':
                threshold_value = operation.get('value', 127)
                max_value = operation.get('max_value', 255)
                threshold_type = operation.get('threshold_type', 'binary')
                
                if threshold_type == 'binary':
                    _, img = cv2.threshold(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY), 
                                         threshold_value, max_value, cv2.THRESH_BINARY)
                elif threshold_type == 'adaptive':
                    img = cv2.adaptiveThreshold(cv2.cvtColor(img, cv2.COLOR_BGR2GRAY),
                                              max_value, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                              cv2.THRESH_BINARY, 11, 2)
                
                results["operations_applied"].append(f"{threshold_type} threshold")
        
        # Ergebnisbild speichern
        output_dir = os.path.dirname(image_path)
        base_name = os.path.basename(image_path)
        name, ext = os.path.splitext(base_name)
        output_path = os.path.join(output_dir, f"{name}_processed{ext}")
        
        update_task_progress(self.request.id, 90, "Verarbeitetes Bild wird gespeichert")
        cv2.imwrite(output_path, img)
        
        # Bildstatistiken berechnen
        if len(img.shape) == 3:  # Farbbild
            height, width, channels = img.shape
            results["image_stats"] = {
                "height": height,
                "width": width,
                "channels": channels,
                "mean_color": [float(img[:,:,i].mean()) for i in range(channels)]
            }
        else:  # Graustufenbild
            height, width = img.shape
            results["image_stats"] = {
                "height": height,
                "width": width,
                "channels": 1,
                "mean_intensity": float(img.mean())
            }
        
        results["output_path"] = output_path
        update_task_progress(self.request.id, 100, "Bildverarbeitung abgeschlossen")
        
        return results
        
    except Exception as e:
        logger.error(f"Fehler bei der Bildverarbeitung: {str(e)}")
        raise

@shared_task(bind=True)
def extract_text_ocr(self, image_path: str, language: str = 'deu', 
                    preprocess: bool = True) -> Dict[str, Any]:
    """
    Extrahiert Text aus einem Bild mittels OCR (Optical Character Recognition).
    
    Args:
        image_path: Pfad zum Eingabebild
        language: Sprache des Textes im Bild (z.B. 'deu', 'eng')
        preprocess: Ob das Bild vor der OCR vorverarbeitet werden soll
    
    Returns:
        Dict mit extrahiertem Text und Konfidenzwerten
    """
    logger.info(f"Starte OCR-Textextraktion für {image_path}")
    
    try:
        if not TESSERACT_AVAILABLE:
            raise ImportError("pytesseract ist nicht installiert. OCR-Funktionalität ist nicht verfügbar.")
        
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 10, "Bild wird geladen")
        
        # Prüfen, ob die Datei existiert
        if not os.path.exists(image_path):
            raise FileNotFoundError(f"Bilddatei nicht gefunden: {image_path}")
        
        # Bild laden
        img = cv2.imread(image_path)
        if img is None:
            raise ValueError(f"Konnte Bild nicht laden: {image_path}")
        
        # Vorverarbeitung für bessere OCR-Ergebnisse
        if preprocess:
            update_task_progress(self.request.id, 30, "Bild wird für OCR vorverarbeitet")
            
            # Konvertierung zu Graustufen
            gray = cv2.cvtColor(img, cv2.COLOR_BGR2GRAY)
            
            # Rauschreduktion
            gray = cv2.GaussianBlur(gray, (5, 5), 0)
            
            # Adaptive Threshold-Anwendung
            thresh = cv2.adaptiveThreshold(gray, 255, cv2.ADAPTIVE_THRESH_GAUSSIAN_C,
                                         cv2.THRESH_BINARY, 11, 2)
            
            # Morphologische Operationen
            kernel = np.ones((1, 1), np.uint8)
            img = cv2.morphologyEx(thresh, cv2.MORPH_OPEN, kernel)
        
        # OCR durchführen
        update_task_progress(self.request.id, 60, "OCR wird durchgeführt")
        
        # Tesseract-Konfiguration für bessere Ergebnisse
        custom_config = f'--oem 3 --psm 6 -l {language}'
        
        # Text extrahieren
        text = pytesseract.image_to_string(img, config=custom_config)
        
        # Detaillierte OCR-Daten mit Konfidenzwerten
        update_task_progress(self.request.id, 80, "OCR-Daten werden analysiert")
        ocr_data = pytesseract.image_to_data(img, config=custom_config, output_type=pytesseract.Output.DICT)
        
        # Wörter mit Konfidenzwerten extrahieren
        words_with_confidence = []
        for i in range(len(ocr_data['text'])):
            if int(ocr_data['conf'][i]) > 0:  # Nur Einträge mit positiver Konfidenz
                words_with_confidence.append({
                    'text': ocr_data['text'][i],
                    'confidence': int(ocr_data['conf'][i]),
                    'bbox': [
                        ocr_data['left'][i],
                        ocr_data['top'][i],
                        ocr_data['width'][i],
                        ocr_data['height'][i]
                    ]
                })
        
        # Durchschnittliche Konfidenz berechnen
        confidences = [word['confidence'] for word in words_with_confidence if word['confidence'] > 0]
        avg_confidence = sum(confidences) / len(confidences) if confidences else 0
        
        results = {
            "extracted_text": text,
            "words_with_confidence": words_with_confidence,
            "average_confidence": avg_confidence,
            "language": language,
            "word_count": len([word for word in words_with_confidence if word['text'].strip()])
        }
        
        update_task_progress(self.request.id, 100, "OCR-Textextraktion abgeschlossen")
        
        return results
        
    except Exception as e:
        logger.error(f"Fehler bei der OCR-Textextraktion: {str(e)}")
        raise

@shared_task(bind=True)
def process_pdf(self, pdf_path: str, operations: List[Dict[str, Any]] = None) -> Dict[str, Any]:
    """
    Verarbeitet ein PDF-Dokument mit den angegebenen Operationen.
    
    Args:
        pdf_path: Pfad zum PDF-Dokument
        operations: Liste von Operationen, die auf das PDF angewendet werden sollen
                   Jede Operation ist ein Dict mit:
                   - 'type': Art der Operation (z.B. 'extract_text', 'extract_images', 'split')
                   - weitere Parameter je nach Operation
    
    Returns:
        Dict mit Verarbeitungsergebnissen
    """
    logger.info(f"Starte PDF-Verarbeitung für {pdf_path}")
    
    try:
        if not PDF_PROCESSING_AVAILABLE:
            raise ImportError("pdf2image oder PyPDF2 ist nicht installiert. PDF-Verarbeitung ist nicht verfügbar.")
        
        # Standardwerte
        operations = operations or []
        
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 10, "PDF wird geladen")
        
        # Prüfen, ob die Datei existiert
        if not os.path.exists(pdf_path):
            raise FileNotFoundError(f"PDF-Datei nicht gefunden: {pdf_path}")
        
        # PDF laden
        pdf = PdfReader(pdf_path)
        num_pages = len(pdf.pages)
        
        # Ergebnisse initialisieren
        results = {
            "pdf_info": {
                "path": pdf_path,
                "num_pages": num_pages,
                "metadata": dict(pdf.metadata) if pdf.metadata else {}
            },
            "operations_results": []
        }
        
        # Verarbeitungsschritte durchführen
        total_operations = len(operations)
        
        for i, operation in enumerate(operations):
            op_type = operation.get('type', '').lower()
            progress = 10 + int(80 * (i + 1) / (total_operations + 1))
            
            update_task_progress(self.request.id, progress, f"Operation '{op_type}' wird durchgeführt")
            
            if op_type == 'extract_text':
                # Text aus PDF extrahieren
                page_range = operation.get('page_range', (0, num_pages))
                start_page = max(0, page_range[0])
                end_page = min(num_pages, page_range[1])
                
                extracted_text = []
                for page_num in range(start_page, end_page):
                    page = pdf.pages[page_num]
                    extracted_text.append(page.extract_text())
                
                results["operations_results"].append({
                    "type": "extract_text",
                    "text": extracted_text,
                    "page_range": [start_page, end_page]
                })
                
            elif op_type == 'extract_images':
                # Bilder aus PDF extrahieren
                page_range = operation.get('page_range', (0, num_pages))
                start_page = max(0, page_range[0])
                end_page = min(num_pages, page_range[1])
                output_dir = operation.get('output_dir', os.path.dirname(pdf_path))
                
                # Ausgabeverzeichnis erstellen, falls es nicht existiert
                os.makedirs(output_dir, exist_ok=True)
                
                # PDF-Seiten in Bilder umwandeln
                images = convert_from_path(
                    pdf_path, 
                    first_page=start_page + 1,  # pdf2image verwendet 1-basierte Indizierung
                    last_page=end_page
                )
                
                # Bilder speichern
                image_paths = []
                for i, image in enumerate(images):
                    image_path = os.path.join(
                        output_dir, 
                        f"{os.path.splitext(os.path.basename(pdf_path))[0]}_page_{start_page + i}.png"
                    )
                    image.save(image_path, 'PNG')
                    image_paths.append(image_path)
                
                results["operations_results"].append({
                    "type": "extract_images",
                    "image_paths": image_paths,
                    "page_range": [start_page, end_page]
                })
                
            elif op_type == 'split':
                # PDF in einzelne Dateien aufteilen
                chunk_size = operation.get('chunk_size', 1)  # Seiten pro Chunk
                output_dir = operation.get('output_dir', os.path.dirname(pdf_path))
                
                # Ausgabeverzeichnis erstellen, falls es nicht existiert
                os.makedirs(output_dir, exist_ok=True)
                
                # PDF in Chunks aufteilen
                output_paths = []
                for i in range(0, num_pages, chunk_size):
                    writer = PdfWriter()
                    
                    # Seiten zum neuen PDF hinzufügen
                    for j in range(i, min(i + chunk_size, num_pages)):
                        writer.add_page(pdf.pages[j])
                    
                    # Neues PDF speichern
                    output_path = os.path.join(
                        output_dir, 
                        f"{os.path.splitext(os.path.basename(pdf_path))[0]}_part_{i//chunk_size + 1}.pdf"
                    )
                    with open(output_path, 'wb') as f:
                        writer.write(f)
                    
                    output_paths.append(output_path)
                
                results["operations_results"].append({
                    "type": "split",
                    "output_paths": output_paths,
                    "chunk_size": chunk_size
                })
        
        update_task_progress(self.request.id, 100, "PDF-Verarbeitung abgeschlossen")
        
        return results
        
    except Exception as e:
        logger.error(f"Fehler bei der PDF-Verarbeitung: {str(e)}")
        raise

@shared_task(bind=True)
def batch_process_documents(self, document_paths: List[str], 
                           operations: List[Dict[str, Any]]) -> Dict[str, Any]:
    """
    Verarbeitet mehrere Dokumente im Batch-Modus.
    
    Args:
        document_paths: Liste von Pfaden zu den zu verarbeitenden Dokumenten
        operations: Liste von Operationen, die auf jedes Dokument angewendet werden sollen
    
    Returns:
        Dict mit Verarbeitungsergebnissen für alle Dokumente
    """
    logger.info(f"Starte Batch-Dokumentenverarbeitung für {len(document_paths)} Dokumente")
    
    try:
        # Fortschritt initialisieren
        update_task_progress(self.request.id, 0, "Batch-Verarbeitung wird vorbereitet")
        
        if not document_paths:
            raise ValueError("Keine Dokumente zur Verarbeitung angegeben")
        
        # Ergebnisse initialisieren
        results = {
            "total_documents": len(document_paths),
            "successful_documents": 0,
            "failed_documents": 0,
            "document_results": []
        }
        
        # Dokumente verarbeiten
        for i, doc_path in enumerate(document_paths):
            progress = int(100 * i / len(document_paths))
            update_task_progress(self.request.id, progress, f"Verarbeite Dokument {i+1}/{len(document_paths)}")
            
            try:
                # Dateityp bestimmen
                _, ext = os.path.splitext(doc_path)
                ext = ext.lower()
                
                doc_result = {
                    "path": doc_path,
                    "status": "success",
                    "operations_results": []
                }
                
                # Je nach Dateityp unterschiedliche Verarbeitung
                if ext in ['.jpg', '.jpeg', '.png', '.bmp', '.tiff', '.tif']:
                    # Bildverarbeitung
                    for operation in operations:
                        op_type = operation.get('type', '').lower()
                        
                        if op_type == 'process_image':
                            img_operations = operation.get('operations', [])
                            result = process_image.apply(
                                args=[doc_path, img_operations],
                                throw=True
                            ).get()
                            doc_result["operations_results"].append({
                                "type": "process_image",
                                "result": result
                            })
                            
                        elif op_type == 'extract_text_ocr':
                            language = operation.get('language', 'deu')
                            preprocess = operation.get('preprocess', True)
                            result = extract_text_ocr.apply(
                                args=[doc_path, language, preprocess],
                                throw=True
                            ).get()
                            doc_result["operations_results"].append({
                                "type": "extract_text_ocr",
                                "result": result
                            })
                
                elif ext == '.pdf':
                    # PDF-Verarbeitung
                    for operation in operations:
                        op_type = operation.get('type', '').lower()
                        
                        if op_type == 'process_pdf':
                            pdf_operations = operation.get('operations', [])
                            result = process_pdf.apply(
                                args=[doc_path, pdf_operations],
                                throw=True
                            ).get()
                            doc_result["operations_results"].append({
                                "type": "process_pdf",
                                "result": result
                            })
                
                else:
                    doc_result["status"] = "error"
                    doc_result["error"] = f"Nicht unterstützter Dateityp: {ext}"
                    results["failed_documents"] += 1
                    continue
                
                results["successful_documents"] += 1
                results["document_results"].append(doc_result)
                
            except Exception as e:
                logger.error(f"Fehler bei der Verarbeitung von {doc_path}: {str(e)}")
                results["failed_documents"] += 1
                results["document_results"].append({
                    "path": doc_path,
                    "status": "error",
                    "error": str(e)
                })
        
        update_task_progress(self.request.id, 100, "Batch-Dokumentenverarbeitung abgeschlossen")
        
        return results
        
    except Exception as e:
        logger.error(f"Fehler bei der Batch-Dokumentenverarbeitung: {str(e)}")
        raise 