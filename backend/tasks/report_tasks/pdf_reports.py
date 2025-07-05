"""
PDF-Berichtsgenerierung für das VALEO-NeuroERP-System.

Dieses Modul enthält Celery-Tasks für die asynchrone Generierung von PDF-Berichten.
"""

import os
import logging
import json
from typing import Dict, List, Any, Optional, Union
from datetime import datetime
from celery import shared_task

# PDF-Generierung
# ReportLab wird verwendet, da es die umfangreichste und am besten dokumentierte
# Python-Bibliothek für die Erstellung von PDF-Dokumenten ist. Sie bietet volle Kontrolle
# über das Layout, unterstützt Tabellen, Bilder, Diagramme und komplexe Formatierungen.
try:
    from reportlab.lib.pagesizes import A4, letter
    from reportlab.lib import colors
    from reportlab.platypus import SimpleDocTemplate, Paragraph, Spacer, Table, TableStyle, Image
    from reportlab.lib.styles import getSampleStyleSheet, ParagraphStyle
    REPORTLAB_AVAILABLE = True
except ImportError:
    REPORTLAB_AVAILABLE = False
    logging.warning("ReportLab nicht installiert. PDF-Generierung ist eingeschränkt.")

# Diagramme
try:
    import matplotlib
    matplotlib.use('Agg')  # Nicht-interaktiver Backend
    import matplotlib.pyplot as plt
    import numpy as np
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False
    logging.warning("Matplotlib nicht installiert. Diagrammgenerierung ist eingeschränkt.")

# Lokale Imports
from backend.services.task_queue import update_task_progress
from .report_utils import format_report_data, validate_report_parameters

logger = logging.getLogger(__name__)

@shared_task(bind=True)
def generate_pdf_report(self, report_data: Dict[str, Any], 
                      template_name: str = 'default',
                      output_file: Optional[str] = None) -> Dict[str, Any]:
    """
    Generiert einen PDF-Bericht basierend auf den übergebenen Daten.
    
    Args:
        report_data: Dictionary mit den Daten für den Bericht
        template_name: Name des zu verwendenden Berichtsvorlagen
        output_file: Pfad zur Ausgabedatei (optional)
    
    Returns:
        Dict mit Informationen zum generierten Bericht
    """
    logger.info(f"Starte PDF-Berichtsgenerierung mit Template {template_name}")
    
    try:
        if not REPORTLAB_AVAILABLE:
            raise ImportError("ReportLab ist nicht installiert. PDF-Generierung ist nicht verfügbar.")
        
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 10, "Berichtsdaten werden validiert")
        
        # Parameter validieren
        validate_report_parameters(report_data, required_fields=['title', 'content'])
        
        # Daten extrahieren
        title = report_data.get('title', 'Bericht')
        subtitle = report_data.get('subtitle', '')
        author = report_data.get('author', 'VALEO-NeuroERP')
        content_sections = report_data.get('content', [])
        charts = report_data.get('charts', [])
        tables = report_data.get('tables', [])
        
        # Ausgabepfad bestimmen
        if not output_file:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_dir = os.path.join('reports', 'pdf')
            os.makedirs(output_dir, exist_ok=True)
            output_file = os.path.join(output_dir, f"{title.replace(' ', '_')}_{timestamp}.pdf")
        
        # Sicherstellen, dass das Ausgabeverzeichnis existiert
        os.makedirs(os.path.dirname(os.path.abspath(output_file)), exist_ok=True)
        
        update_task_progress(self.request.id, 20, "PDF-Dokument wird vorbereitet")
        
        # PDF-Dokument erstellen
        doc = SimpleDocTemplate(
            output_file,
            pagesize=letter,
            rightMargin=72,
            leftMargin=72,
            topMargin=72,
            bottomMargin=72
        )
        
        # Stile definieren
        styles = getSampleStyleSheet()
        title_style = styles['Title']
        subtitle_style = styles['Heading2']
        heading_style = styles['Heading1']
        normal_style = styles['Normal']
        
        # Elemente für das PDF sammeln
        elements = []
        
        # Titel und Untertitel hinzufügen
        elements.append(Paragraph(title, title_style))
        if subtitle:
            elements.append(Spacer(1, 12))
            elements.append(Paragraph(subtitle, subtitle_style))
        
        # Metadaten hinzufügen
        elements.append(Spacer(1, 24))
        elements.append(Paragraph(f"Erstellt am: {datetime.now().strftime('%d.%m.%Y %H:%M')}", normal_style))
        elements.append(Paragraph(f"Autor: {author}", normal_style))
        
        # Trennlinie
        elements.append(Spacer(1, 24))
        
        update_task_progress(self.request.id, 30, "Berichtsinhalte werden formatiert")
        
        # Inhaltsabschnitte hinzufügen
        for section in content_sections:
            section_title = section.get('title', '')
            section_content = section.get('content', '')
            
            if section_title:
                elements.append(Spacer(1, 16))
                elements.append(Paragraph(section_title, heading_style))
            
            if section_content:
                elements.append(Spacer(1, 8))
                # Text in Absätze aufteilen
                paragraphs = section_content.split('\n\n')
                for para in paragraphs:
                    elements.append(Paragraph(para, normal_style))
                    elements.append(Spacer(1, 6))
        
        update_task_progress(self.request.id, 50, "Diagramme werden generiert")
        
        # Diagramme hinzufügen
        if MATPLOTLIB_AVAILABLE and charts:
            for i, chart_data in enumerate(charts):
                chart_type = chart_data.get('type', 'bar')
                chart_title = chart_data.get('title', f'Diagramm {i+1}')
                chart_data_values = chart_data.get('data', {})
                
                if not chart_data_values:
                    continue
                
                # Temporäre Datei für das Diagramm
                chart_filename = f"temp_chart_{i}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
                chart_path = os.path.join('temp', chart_filename)
                os.makedirs('temp', exist_ok=True)
                
                # Diagramm erstellen
                plt.figure(figsize=(7, 4))
                
                if chart_type == 'bar':
                    plt.bar(list(chart_data_values.keys()), list(chart_data_values.values()))
                elif chart_type == 'line':
                    plt.plot(list(chart_data_values.keys()), list(chart_data_values.values()))
                elif chart_type == 'pie':
                    plt.pie(list(chart_data_values.values()), labels=list(chart_data_values.keys()), autopct='%1.1f%%')
                
                plt.title(chart_title)
                plt.tight_layout()
                
                # Diagramm speichern
                plt.savefig(chart_path)
                plt.close()
                
                # Diagramm zum PDF hinzufügen
                elements.append(Spacer(1, 16))
                elements.append(Paragraph(chart_title, heading_style))
                elements.append(Spacer(1, 8))
                elements.append(Image(chart_path, width=450, height=300))
        
        update_task_progress(self.request.id, 70, "Tabellen werden formatiert")
        
        # Tabellen hinzufügen
        for i, table_data in enumerate(tables):
            table_title = table_data.get('title', f'Tabelle {i+1}')
            headers = table_data.get('headers', [])
            rows = table_data.get('rows', [])
            
            if not headers or not rows:
                continue
            
            elements.append(Spacer(1, 16))
            elements.append(Paragraph(table_title, heading_style))
            elements.append(Spacer(1, 8))
            
            # Tabelle erstellen
            table = Table([headers] + rows)
            
            # Tabellenstil definieren
            table_style = TableStyle([
                ('BACKGROUND', (0, 0), (-1, 0), colors.grey),
                ('TEXTCOLOR', (0, 0), (-1, 0), colors.whitesmoke),
                ('ALIGN', (0, 0), (-1, -1), 'CENTER'),
                ('FONTNAME', (0, 0), (-1, 0), 'Helvetica-Bold'),
                ('BOTTOMPADDING', (0, 0), (-1, 0), 12),
                ('BACKGROUND', (0, 1), (-1, -1), colors.beige),
                ('GRID', (0, 0), (-1, -1), 1, colors.black)
            ])
            
            # Jede zweite Zeile einfärben
            for i in range(1, len(rows) + 1):
                if i % 2 == 0:
                    table_style.add('BACKGROUND', (0, i), (-1, i), colors.lightgrey)
            
            table.setStyle(table_style)
            elements.append(table)
        
        update_task_progress(self.request.id, 90, "PDF wird erstellt")
        
        # PDF generieren
        doc.build(elements)
        
        # Temporäre Diagrammdateien löschen
        if MATPLOTLIB_AVAILABLE and charts:
            for i in range(len(charts)):
                chart_filename = f"temp_chart_{i}_{datetime.now().strftime('%Y%m%d_%H%M%S')}.png"
                chart_path = os.path.join('temp', chart_filename)
                if os.path.exists(chart_path):
                    try:
                        os.remove(chart_path)
                    except Exception:
                        pass
        
        update_task_progress(self.request.id, 100, "PDF-Bericht erfolgreich generiert")
        
        # Ergebnis zurückgeben
        return {
            "status": "success",
            "report_file": output_file,
            "report_size_bytes": os.path.getsize(output_file),
            "report_title": title,
            "sections_count": len(content_sections),
            "charts_count": len(charts),
            "tables_count": len(tables),
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler bei der PDF-Berichtsgenerierung: {str(e)}")
        raise

@shared_task(bind=True)
def generate_financial_report(self, financial_data: Dict[str, Any], 
                           report_period: str,
                           output_file: Optional[str] = None) -> Dict[str, Any]:
    """
    Generiert einen finanziellen PDF-Bericht basierend auf den übergebenen Daten.
    
    Args:
        financial_data: Dictionary mit Finanzdaten
        report_period: Berichtszeitraum (z.B. 'Q1 2023', 'FY 2022')
        output_file: Pfad zur Ausgabedatei (optional)
    
    Returns:
        Dict mit Informationen zum generierten Bericht
    """
    logger.info(f"Starte Finanzberichtsgenerierung für Zeitraum {report_period}")
    
    try:
        # Finanzdaten in Berichtsformat umwandeln
        report_data = {
            "title": f"Finanzbericht {report_period}",
            "subtitle": "VALEO-NeuroERP Finanzübersicht",
            "author": "Finanzabteilung",
            "content": [
                {
                    "title": "Zusammenfassung",
                    "content": financial_data.get("summary", "Keine Zusammenfassung verfügbar.")
                },
                {
                    "title": "Finanzielle Kennzahlen",
                    "content": "Im folgenden werden die wichtigsten finanziellen Kennzahlen für den Berichtszeitraum dargestellt."
                }
            ],
            "charts": [
                {
                    "type": "bar",
                    "title": "Umsatz nach Monat",
                    "data": financial_data.get("monthly_revenue", {})
                },
                {
                    "type": "pie",
                    "title": "Ausgabenverteilung",
                    "data": financial_data.get("expense_distribution", {})
                }
            ],
            "tables": [
                {
                    "title": "Gewinn- und Verlustrechnung",
                    "headers": ["Position", "Aktueller Zeitraum", "Vorjahreszeitraum", "Veränderung (%)"],
                    "rows": [
                        ["Umsatz", f"{financial_data.get('revenue', 0):,.2f} €", 
                         f"{financial_data.get('previous_revenue', 0):,.2f} €", 
                         f"{financial_data.get('revenue_change', 0):.1f}%"],
                        ["Kosten", f"{financial_data.get('expenses', 0):,.2f} €", 
                         f"{financial_data.get('previous_expenses', 0):,.2f} €", 
                         f"{financial_data.get('expenses_change', 0):.1f}%"],
                        ["Bruttogewinn", f"{financial_data.get('gross_profit', 0):,.2f} €", 
                         f"{financial_data.get('previous_gross_profit', 0):,.2f} €", 
                         f"{financial_data.get('gross_profit_change', 0):.1f}%"],
                        ["Nettogewinn", f"{financial_data.get('net_profit', 0):,.2f} €", 
                         f"{financial_data.get('previous_net_profit', 0):,.2f} €", 
                         f"{financial_data.get('net_profit_change', 0):.1f}%"]
                    ]
                },
                {
                    "title": "Wichtige Kennzahlen",
                    "headers": ["Kennzahl", "Wert", "Vorjahr", "Benchmark"],
                    "rows": [
                        ["ROI", f"{financial_data.get('roi', 0):.2f}%", 
                         f"{financial_data.get('previous_roi', 0):.2f}%", 
                         f"{financial_data.get('roi_benchmark', 0):.2f}%"],
                        ["Liquidität", f"{financial_data.get('liquidity', 0):.2f}", 
                         f"{financial_data.get('previous_liquidity', 0):.2f}", 
                         f"{financial_data.get('liquidity_benchmark', 0):.2f}"],
                        ["Eigenkapitalquote", f"{financial_data.get('equity_ratio', 0):.2f}%", 
                         f"{financial_data.get('previous_equity_ratio', 0):.2f}%", 
                         f"{financial_data.get('equity_ratio_benchmark', 0):.2f}%"]
                    ]
                }
            ]
        }
        
        # Standard-PDF-Bericht mit den formatierten Finanzdaten generieren
        return generate_pdf_report(self, report_data, template_name='financial', output_file=output_file)
        
    except Exception as e:
        logger.error(f"Fehler bei der Finanzberichtsgenerierung: {str(e)}")
        raise

@shared_task(bind=True)
def generate_project_status_report(self, project_data: Dict[str, Any],
                                 include_charts: bool = True,
                                 output_file: Optional[str] = None) -> Dict[str, Any]:
    """
    Generiert einen Projektstatusbericht als PDF.
    
    Args:
        project_data: Dictionary mit Projektdaten
        include_charts: Ob Diagramme im Bericht enthalten sein sollen
        output_file: Pfad zur Ausgabedatei (optional)
    
    Returns:
        Dict mit Informationen zum generierten Bericht
    """
    logger.info(f"Starte Projektstatusbericht für Projekt {project_data.get('project_name', 'Unbekannt')}")
    
    try:
        # Projektdaten extrahieren
        project_name = project_data.get('project_name', 'Unbenanntes Projekt')
        project_manager = project_data.get('project_manager', 'Nicht angegeben')
        start_date = project_data.get('start_date', 'Nicht angegeben')
        end_date = project_data.get('end_date', 'Nicht angegeben')
        status = project_data.get('status', 'Unbekannt')
        completion_percentage = project_data.get('completion_percentage', 0)
        budget_info = project_data.get('budget', {})
        milestones = project_data.get('milestones', [])
        risks = project_data.get('risks', [])
        
        # Status-Text generieren
        status_text = f"""
        Projektstatus: {status}
        Fortschritt: {completion_percentage}%
        Startdatum: {start_date}
        Geplantes Enddatum: {end_date}
        Projektleiter: {project_manager}
        
        Budget:
        - Geplant: {budget_info.get('planned', 0):,.2f} €
        - Aktuell verbraucht: {budget_info.get('spent', 0):,.2f} €
        - Verbleibend: {budget_info.get('remaining', 0):,.2f} €
        """
        
        # Meilenstein-Text generieren
        milestones_text = "\n\n".join([
            f"Meilenstein: {m.get('name', 'Unbenannt')}\n"
            f"Fälligkeit: {m.get('due_date', 'Nicht angegeben')}\n"
            f"Status: {m.get('status', 'Unbekannt')}\n"
            f"Beschreibung: {m.get('description', 'Keine Beschreibung')}"
            for m in milestones
        ]) if milestones else "Keine Meilensteine definiert."
        
        # Risiken-Text generieren
        risks_text = "\n\n".join([
            f"Risiko: {r.get('name', 'Unbenannt')}\n"
            f"Wahrscheinlichkeit: {r.get('probability', 'Nicht angegeben')}\n"
            f"Auswirkung: {r.get('impact', 'Nicht angegeben')}\n"
            f"Maßnahmen: {r.get('mitigation', 'Keine Maßnahmen definiert')}"
            for r in risks
        ]) if risks else "Keine Risiken identifiziert."
        
        # Berichtsdaten zusammenstellen
        report_data = {
            "title": f"Projektstatusbericht: {project_name}",
            "subtitle": f"Status: {status} | Fortschritt: {completion_percentage}%",
            "author": f"Erstellt von: {project_manager}",
            "content": [
                {
                    "title": "Projektstatus",
                    "content": status_text
                },
                {
                    "title": "Meilensteine",
                    "content": milestones_text
                },
                {
                    "title": "Risiken und Maßnahmen",
                    "content": risks_text
                }
            ],
            "tables": [
                {
                    "title": "Meilensteinübersicht",
                    "headers": ["Meilenstein", "Fälligkeit", "Status", "Verantwortlich"],
                    "rows": [
                        [m.get('name', ''), m.get('due_date', ''), m.get('status', ''), m.get('responsible', '')]
                        for m in milestones
                    ]
                }
            ]
        }
        
        # Diagramme hinzufügen, falls gewünscht
        if include_charts:
            # Fortschrittsdiagramm (Donut-Chart simulieren)
            progress_data = {
                "Abgeschlossen": completion_percentage,
                "Offen": 100 - completion_percentage
            }
            
            # Budgetverteilung
            budget_data = {
                "Verbraucht": budget_info.get('spent', 0),
                "Verbleibend": budget_info.get('remaining', 0)
            }
            
            report_data["charts"] = [
                {
                    "type": "pie",
                    "title": "Projektfortschritt",
                    "data": progress_data
                },
                {
                    "type": "pie",
                    "title": "Budgetverteilung",
                    "data": budget_data
                }
            ]
            
            # Wenn Zeitdaten für Meilensteine vorhanden sind, Gantt-Chart simulieren
            if any('due_date' in m for m in milestones):
                # In einer realen Anwendung würde hier ein Gantt-Chart erstellt werden
                # Hier fügen wir nur einen Platzhalter ein
                report_data["content"].append({
                    "title": "Zeitplan",
                    "content": "Ein detaillierter Zeitplan ist im Anhang verfügbar."
                })
        
        # Standard-PDF-Bericht mit den formatierten Projektdaten generieren
        return generate_pdf_report(self, report_data, template_name='project', output_file=output_file)
        
    except Exception as e:
        logger.error(f"Fehler bei der Projektstatusberichtsgenerierung: {str(e)}")
        raise 