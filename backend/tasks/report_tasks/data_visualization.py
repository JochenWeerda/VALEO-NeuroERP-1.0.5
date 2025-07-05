"""
Datenvisualisierungsfunktionen für das VALEO-NeuroERP-System.

Dieses Modul enthält Celery-Tasks für die asynchrone Generierung von Datenvisualisierungen.
"""

import os
import logging
import json
from typing import Dict, List, Any, Optional, Union, Tuple
from datetime import datetime
from celery import shared_task

# Visualisierungsbibliotheken
# Matplotlib wird als Basis-Visualisierungsbibliothek verwendet, da es sehr flexibel und anpassbar ist.
# Seaborn baut auf Matplotlib auf und bietet statistische Visualisierungen mit ansprechendem Design.
# Beide Bibliotheken werden für statische Visualisierungen verwendet, die in Berichte eingebettet werden können.
try:
    import matplotlib
    matplotlib.use('Agg')  # Nicht-interaktiver Backend
    import matplotlib.pyplot as plt
    import numpy as np
    import seaborn as sns
    from matplotlib.figure import Figure
    MATPLOTLIB_AVAILABLE = True
except ImportError:
    MATPLOTLIB_AVAILABLE = False
    logging.warning("Matplotlib oder Seaborn nicht installiert. Visualisierungen sind eingeschränkt.")

# Interaktive Visualisierungen
# Plotly wird für interaktive Visualisierungen verwendet, die in Webanwendungen eingebettet werden können.
# Es bietet umfangreiche Interaktionsmöglichkeiten wie Zoomen, Schwenken und Tooltips, was besonders
# für komplexe Dashboards und explorative Datenanalyse nützlich ist.
try:
    import plotly.express as px
    import plotly.graph_objects as go
    from plotly.subplots import make_subplots
    PLOTLY_AVAILABLE = True
except ImportError:
    PLOTLY_AVAILABLE = False
    logging.warning("Plotly nicht installiert. Interaktive Visualisierungen sind nicht verfügbar.")

# Lokale Imports
from backend.services.task_queue import update_task_progress
from .report_utils import validate_report_parameters

logger = logging.getLogger(__name__)

@shared_task(bind=True)
def create_visualization(self, data: Dict[str, Any], 
                       chart_type: str,
                       output_file: Optional[str] = None,
                       interactive: bool = False) -> Dict[str, Any]:
    """
    Erstellt eine Visualisierung basierend auf den übergebenen Daten.
    
    Args:
        data: Dictionary mit den zu visualisierenden Daten
        chart_type: Art des Diagramms ('bar', 'line', 'pie', 'scatter', etc.)
        output_file: Pfad zur Ausgabedatei (optional)
        interactive: Ob eine interaktive Visualisierung erstellt werden soll
    
    Returns:
        Dict mit Informationen zur erstellten Visualisierung
    """
    logger.info(f"Starte Erstellung einer {chart_type}-Visualisierung")
    
    try:
        # Prüfen, ob die erforderlichen Bibliotheken verfügbar sind
        if interactive and not PLOTLY_AVAILABLE:
            interactive = False
            logger.warning("Plotly nicht verfügbar, erstelle statische Visualisierung")
        
        if not interactive and not MATPLOTLIB_AVAILABLE:
            raise ImportError("Matplotlib nicht verfügbar. Visualisierungen können nicht erstellt werden.")
        
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 10, "Visualisierungsdaten werden validiert")
        
        # Parameter validieren
        validate_report_parameters(data, required_fields=['x_data'])
        
        # Daten extrahieren
        x_data = data.get('x_data', [])
        y_data = data.get('y_data', [])
        labels = data.get('labels', [])
        title = data.get('title', 'Visualisierung')
        x_label = data.get('x_label', 'X-Achse')
        y_label = data.get('y_label', 'Y-Achse')
        color_map = data.get('color_map', 'viridis')
        figsize = data.get('figsize', (10, 6))
        
        # Ausgabepfad bestimmen
        if not output_file:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_dir = os.path.join('reports', 'visualizations')
            os.makedirs(output_dir, exist_ok=True)
            
            if interactive:
                output_file = os.path.join(output_dir, f"{chart_type}_{timestamp}.html")
            else:
                output_file = os.path.join(output_dir, f"{chart_type}_{timestamp}.png")
        
        # Sicherstellen, dass das Ausgabeverzeichnis existiert
        os.makedirs(os.path.dirname(os.path.abspath(output_file)), exist_ok=True)
        
        update_task_progress(self.request.id, 30, "Visualisierung wird erstellt")
        
        # Visualisierung erstellen
        if interactive:
            # Interaktive Visualisierung mit Plotly
            fig = create_interactive_chart(chart_type, data)
            
            # Visualisierung speichern
            fig.write_html(output_file)
            
        else:
            # Statische Visualisierung mit Matplotlib
            fig = create_static_chart(chart_type, data)
            
            # Visualisierung speichern
            plt.savefig(output_file, dpi=300, bbox_inches='tight')
            plt.close(fig)
        
        update_task_progress(self.request.id, 100, "Visualisierung erfolgreich erstellt")
        
        # Ergebnis zurückgeben
        return {
            "status": "success",
            "visualization_file": output_file,
            "visualization_type": chart_type,
            "interactive": interactive,
            "title": title,
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler bei der Erstellung der Visualisierung: {str(e)}")
        raise

def create_static_chart(chart_type: str, data: Dict[str, Any]) -> Figure:
    """
    Erstellt ein statisches Diagramm mit Matplotlib.
    
    Args:
        chart_type: Art des Diagramms
        data: Dictionary mit den zu visualisierenden Daten
    
    Returns:
        Matplotlib Figure-Objekt
    """
    # Daten extrahieren
    x_data = data.get('x_data', [])
    y_data = data.get('y_data', [])
    labels = data.get('labels', [])
    title = data.get('title', 'Visualisierung')
    x_label = data.get('x_label', 'X-Achse')
    y_label = data.get('y_label', 'Y-Achse')
    color_map = data.get('color_map', 'viridis')
    figsize = data.get('figsize', (10, 6))
    
    # Wenn y_data nicht angegeben ist, x_data als y_data verwenden und Indizes als x_data
    if not y_data and x_data:
        y_data = x_data
        x_data = list(range(len(x_data)))
    
    # Wenn labels nicht angegeben sind und y_data ein Dict ist, Schlüssel als Labels verwenden
    if not labels and isinstance(y_data, dict):
        labels = list(y_data.keys())
        y_data = list(y_data.values())
    
    # Seaborn-Stil setzen
    sns.set_style("whitegrid")
    
    # Figur und Achsen erstellen
    fig, ax = plt.subplots(figsize=figsize)
    
    # Je nach Diagrammtyp unterschiedliche Visualisierung erstellen
    if chart_type == 'bar':
        if isinstance(y_data, list) and all(isinstance(item, (int, float)) for item in y_data):
            # Einfaches Balkendiagramm
            ax.bar(x_data, y_data, color=plt.cm.get_cmap(color_map)(np.linspace(0, 1, len(y_data))))
        elif isinstance(y_data, dict):
            # Balkendiagramm aus Dictionary
            ax.bar(list(y_data.keys()), list(y_data.values()), color=plt.cm.get_cmap(color_map)(np.linspace(0, 1, len(y_data))))
        else:
            # Gruppiertes Balkendiagramm
            width = 0.8 / len(y_data)
            for i, (label, values) in enumerate(zip(labels, y_data)):
                positions = [pos + i * width for pos in range(len(values))]
                ax.bar(positions, values, width, label=label)
            ax.set_xticks([pos + width * (len(y_data) - 1) / 2 for pos in range(len(y_data[0]))])
            ax.set_xticklabels(x_data)
            ax.legend()
    
    elif chart_type == 'line':
        if isinstance(y_data, list) and all(isinstance(item, (int, float)) for item in y_data):
            # Einfaches Liniendiagramm
            ax.plot(x_data, y_data, marker='o')
        elif isinstance(y_data, dict):
            # Liniendiagramm aus Dictionary
            ax.plot(list(y_data.keys()), list(y_data.values()), marker='o')
        else:
            # Mehrere Linien
            for i, (label, values) in enumerate(zip(labels, y_data)):
                ax.plot(x_data, values, marker='o', label=label)
            ax.legend()
    
    elif chart_type == 'pie':
        if isinstance(y_data, list) and all(isinstance(item, (int, float)) for item in y_data):
            # Einfaches Kreisdiagramm
            ax.pie(y_data, labels=x_data, autopct='%1.1f%%', startangle=90, colors=plt.cm.get_cmap(color_map)(np.linspace(0, 1, len(y_data))))
        elif isinstance(y_data, dict):
            # Kreisdiagramm aus Dictionary
            ax.pie(list(y_data.values()), labels=list(y_data.keys()), autopct='%1.1f%%', startangle=90, colors=plt.cm.get_cmap(color_map)(np.linspace(0, 1, len(y_data))))
        ax.axis('equal')  # Gleiche Seitenverhältnisse für kreisförmiges Diagramm
    
    elif chart_type == 'scatter':
        if isinstance(y_data, list) and all(isinstance(item, (int, float)) for item in y_data):
            # Einfaches Streudiagramm
            ax.scatter(x_data, y_data)
        elif isinstance(y_data, dict):
            # Streudiagramm aus Dictionary
            ax.scatter(list(y_data.keys()), list(y_data.values()))
        else:
            # Mehrere Datenreihen
            for i, (label, values) in enumerate(zip(labels, y_data)):
                ax.scatter(x_data, values, label=label)
            ax.legend()
    
    elif chart_type == 'heatmap':
        # Heatmap erfordert 2D-Daten
        if isinstance(y_data, list) and all(isinstance(item, list) for item in y_data):
            sns.heatmap(y_data, annot=True, cmap=color_map, xticklabels=x_data, yticklabels=labels if labels else None, ax=ax)
    
    elif chart_type == 'box':
        # Boxplot
        if isinstance(y_data, list) and all(isinstance(item, list) for item in y_data):
            ax.boxplot(y_data, labels=x_data)
        else:
            ax.boxplot(y_data, labels=x_data)
    
    elif chart_type == 'histogram':
        # Histogramm
        if isinstance(y_data, list) and all(isinstance(item, (int, float)) for item in y_data):
            ax.hist(y_data, bins=data.get('bins', 10), color=plt.cm.get_cmap(color_map)(0.5))
        elif isinstance(y_data, dict):
            ax.hist(list(y_data.values()), bins=data.get('bins', 10), color=plt.cm.get_cmap(color_map)(0.5))
    
    # Titel und Achsenbeschriftungen setzen
    ax.set_title(title)
    ax.set_xlabel(x_label)
    ax.set_ylabel(y_label)
    
    # Diagramm optimieren
    plt.tight_layout()
    
    return fig

def create_interactive_chart(chart_type: str, data: Dict[str, Any]) -> Union[go.Figure, px.Figure]:
    """
    Erstellt ein interaktives Diagramm mit Plotly.
    
    Args:
        chart_type: Art des Diagramms
        data: Dictionary mit den zu visualisierenden Daten
    
    Returns:
        Plotly Figure-Objekt
    """
    # Daten extrahieren
    x_data = data.get('x_data', [])
    y_data = data.get('y_data', [])
    labels = data.get('labels', [])
    title = data.get('title', 'Interaktive Visualisierung')
    x_label = data.get('x_label', 'X-Achse')
    y_label = data.get('y_label', 'Y-Achse')
    color_map = data.get('color_map', 'viridis')
    hover_data = data.get('hover_data', {})
    
    # Wenn y_data nicht angegeben ist, x_data als y_data verwenden und Indizes als x_data
    if not y_data and x_data:
        y_data = x_data
        x_data = list(range(len(x_data)))
    
    # Wenn labels nicht angegeben sind und y_data ein Dict ist, Schlüssel als Labels verwenden
    if not labels and isinstance(y_data, dict):
        labels = list(y_data.keys())
        y_data = list(y_data.values())
    
    # Je nach Diagrammtyp unterschiedliche Visualisierung erstellen
    if chart_type == 'bar':
        if isinstance(y_data, list) and all(isinstance(item, (int, float)) for item in y_data):
            # Einfaches Balkendiagramm mit Plotly Express
            fig = px.bar(
                x=x_data, 
                y=y_data, 
                title=title,
                labels={'x': x_label, 'y': y_label},
                color_discrete_sequence=px.colors.sequential.Viridis,
                hover_data=hover_data
            )
        elif isinstance(y_data, dict):
            # Balkendiagramm aus Dictionary
            fig = px.bar(
                x=list(y_data.keys()), 
                y=list(y_data.values()), 
                title=title,
                labels={'x': x_label, 'y': y_label},
                color_discrete_sequence=px.colors.sequential.Viridis,
                hover_data=hover_data
            )
        else:
            # Gruppiertes Balkendiagramm
            fig = go.Figure()
            for i, (label, values) in enumerate(zip(labels, y_data)):
                fig.add_trace(go.Bar(
                    x=x_data,
                    y=values,
                    name=label
                ))
            fig.update_layout(
                title=title,
                xaxis_title=x_label,
                yaxis_title=y_label,
                barmode='group'
            )
    
    elif chart_type == 'line':
        if isinstance(y_data, list) and all(isinstance(item, (int, float)) for item in y_data):
            # Einfaches Liniendiagramm mit Plotly Express
            fig = px.line(
                x=x_data, 
                y=y_data, 
                title=title,
                labels={'x': x_label, 'y': y_label},
                markers=True,
                hover_data=hover_data
            )
        elif isinstance(y_data, dict):
            # Liniendiagramm aus Dictionary
            fig = px.line(
                x=list(y_data.keys()), 
                y=list(y_data.values()), 
                title=title,
                labels={'x': x_label, 'y': y_label},
                markers=True,
                hover_data=hover_data
            )
        else:
            # Mehrere Linien
            fig = go.Figure()
            for i, (label, values) in enumerate(zip(labels, y_data)):
                fig.add_trace(go.Scatter(
                    x=x_data,
                    y=values,
                    mode='lines+markers',
                    name=label
                ))
            fig.update_layout(
                title=title,
                xaxis_title=x_label,
                yaxis_title=y_label
            )
    
    elif chart_type == 'pie':
        if isinstance(y_data, list) and all(isinstance(item, (int, float)) for item in y_data):
            # Einfaches Kreisdiagramm mit Plotly Express
            fig = px.pie(
                values=y_data, 
                names=x_data, 
                title=title,
                hover_data=hover_data
            )
        elif isinstance(y_data, dict):
            # Kreisdiagramm aus Dictionary
            fig = px.pie(
                values=list(y_data.values()), 
                names=list(y_data.keys()), 
                title=title,
                hover_data=hover_data
            )
        fig.update_traces(textposition='inside', textinfo='percent+label')
    
    elif chart_type == 'scatter':
        if isinstance(y_data, list) and all(isinstance(item, (int, float)) for item in y_data):
            # Einfaches Streudiagramm mit Plotly Express
            fig = px.scatter(
                x=x_data, 
                y=y_data, 
                title=title,
                labels={'x': x_label, 'y': y_label},
                hover_data=hover_data
            )
        elif isinstance(y_data, dict):
            # Streudiagramm aus Dictionary
            fig = px.scatter(
                x=list(y_data.keys()), 
                y=list(y_data.values()), 
                title=title,
                labels={'x': x_label, 'y': y_label},
                hover_data=hover_data
            )
        else:
            # Mehrere Datenreihen
            fig = go.Figure()
            for i, (label, values) in enumerate(zip(labels, y_data)):
                fig.add_trace(go.Scatter(
                    x=x_data,
                    y=values,
                    mode='markers',
                    name=label
                ))
            fig.update_layout(
                title=title,
                xaxis_title=x_label,
                yaxis_title=y_label
            )
    
    elif chart_type == 'heatmap':
        # Heatmap erfordert 2D-Daten
        if isinstance(y_data, list) and all(isinstance(item, list) for item in y_data):
            fig = px.imshow(
                y_data,
                x=x_data if x_data else None,
                y=labels if labels else None,
                labels={'color': y_label},
                title=title,
                color_continuous_scale=color_map
            )
    
    elif chart_type == 'box':
        # Boxplot
        if isinstance(y_data, list) and all(isinstance(item, list) for item in y_data):
            fig = go.Figure()
            for i, (label, values) in enumerate(zip(labels if labels else [f"Serie {i+1}" for i in range(len(y_data))], y_data)):
                fig.add_trace(go.Box(
                    y=values,
                    name=label
                ))
            fig.update_layout(
                title=title,
                yaxis_title=y_label
            )
        else:
            fig = px.box(
                y=y_data,
                x=x_data if x_data else None,
                title=title,
                labels={'x': x_label, 'y': y_label}
            )
    
    elif chart_type == 'histogram':
        # Histogramm
        if isinstance(y_data, list) and all(isinstance(item, (int, float)) for item in y_data):
            fig = px.histogram(
                x=y_data,
                nbins=data.get('bins', 10),
                title=title,
                labels={'x': y_label, 'y': 'Häufigkeit'},
                marginal='box'  # Fügt eine Box-Plot-Darstellung am Rand hinzu
            )
        elif isinstance(y_data, dict):
            fig = px.histogram(
                x=list(y_data.values()),
                nbins=data.get('bins', 10),
                title=title,
                labels={'x': y_label, 'y': 'Häufigkeit'},
                marginal='box'
            )
    
    elif chart_type == 'bubble':
        # Bubble-Chart (Streudiagramm mit variabler Punktgröße)
        size_data = data.get('size_data', [10] * len(x_data))
        color_data = data.get('color_data')
        
        fig = px.scatter(
            x=x_data,
            y=y_data,
            size=size_data,
            color=color_data,
            title=title,
            labels={'x': x_label, 'y': y_label, 'size': 'Größe', 'color': 'Farbe'},
            hover_data=hover_data
        )
    
    elif chart_type == 'sunburst':
        # Sunburst-Diagramm für hierarchische Daten
        fig = px.sunburst(
            data.get('hierarchical_data', {}),
            path=data.get('path', []),
            values=data.get('values', None),
            title=title
        )
    
    elif chart_type == 'radar':
        # Radar-Chart (Polar-Chart)
        fig = go.Figure()
        
        if isinstance(y_data, list) and all(isinstance(item, (int, float)) for item in y_data):
            # Einfaches Radar-Chart
            fig.add_trace(go.Scatterpolar(
                r=y_data,
                theta=x_data,
                fill='toself',
                name='Serie 1'
            ))
        else:
            # Mehrere Datenreihen
            for i, (label, values) in enumerate(zip(labels, y_data)):
                fig.add_trace(go.Scatterpolar(
                    r=values,
                    theta=x_data,
                    fill='toself',
                    name=label
                ))
        
        fig.update_layout(
            polar=dict(
                radialaxis=dict(
                    visible=True,
                    range=[0, max([max(series) for series in y_data]) if isinstance(y_data[0], list) else max(y_data)]
                )
            ),
            title=title
        )
    
    else:
        # Standardmäßig ein Liniendiagramm erstellen
        fig = px.line(
            x=x_data, 
            y=y_data, 
            title=title,
            labels={'x': x_label, 'y': y_label}
        )
    
    # Layout anpassen
    fig.update_layout(
        title={
            'text': title,
            'y': 0.95,
            'x': 0.5,
            'xanchor': 'center',
            'yanchor': 'top'
        },
        xaxis_title=x_label,
        yaxis_title=y_label,
        legend_title='Legende',
        font=dict(
            family="Arial, sans-serif",
            size=12
        ),
        hovermode='closest',
        template='plotly_white'  # Verwende ein sauberes, professionelles Template
    )
    
    return fig

@shared_task(bind=True)
def create_dashboard(self, dashboard_data: Dict[str, Any], 
                   output_file: Optional[str] = None) -> Dict[str, Any]:
    """
    Erstellt ein Dashboard mit mehreren Visualisierungen.
    
    Args:
        dashboard_data: Dictionary mit den Daten für das Dashboard
        output_file: Pfad zur Ausgabedatei (optional)
    
    Returns:
        Dict mit Informationen zum erstellten Dashboard
    """
    logger.info("Starte Erstellung eines Dashboards")
    
    try:
        # Prüfen, ob Plotly verfügbar ist
        if not PLOTLY_AVAILABLE:
            raise ImportError("Plotly nicht verfügbar. Dashboards können nicht erstellt werden.")
        
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 10, "Dashboard-Daten werden validiert")
        
        # Parameter validieren
        validate_report_parameters(dashboard_data, required_fields=['title', 'charts'])
        
        # Daten extrahieren
        title = dashboard_data.get('title', 'Dashboard')
        charts = dashboard_data.get('charts', [])
        layout = dashboard_data.get('layout', {'rows': 2, 'cols': 2})
        theme = dashboard_data.get('theme', 'plotly_white')
        
        # Ausgabepfad bestimmen
        if not output_file:
            timestamp = datetime.now().strftime('%Y%m%d_%H%M%S')
            output_dir = os.path.join('reports', 'dashboards')
            os.makedirs(output_dir, exist_ok=True)
            output_file = os.path.join(output_dir, f"dashboard_{timestamp}.html")
        
        # Sicherstellen, dass das Ausgabeverzeichnis existiert
        os.makedirs(os.path.dirname(os.path.abspath(output_file)), exist_ok=True)
        
        update_task_progress(self.request.id, 30, "Dashboard wird erstellt")
        
        # Layout bestimmen
        rows = layout.get('rows', 2)
        cols = layout.get('cols', 2)
        
        # Subplot-Raster erstellen
        fig = make_subplots(
            rows=rows,
            cols=cols,
            subplot_titles=[chart.get('title', f'Diagramm {i+1}') for i, chart in enumerate(charts)],
            specs=[[{'type': 'xy'} for _ in range(cols)] for _ in range(rows)]
        )
        
        # Diagramme hinzufügen
        for i, chart_data in enumerate(charts):
            # Position im Raster bestimmen
            row = (i // cols) + 1
            col = (i % cols) + 1
            
            if row > rows or col > cols:
                logger.warning(f"Diagramm {i+1} passt nicht ins Layout, wird übersprungen")
                continue
            
            # Diagrammtyp und Daten extrahieren
            chart_type = chart_data.get('type', 'bar')
            x_data = chart_data.get('x_data', [])
            y_data = chart_data.get('y_data', [])
            
            # Je nach Diagrammtyp unterschiedliche Visualisierung erstellen
            if chart_type == 'bar':
                fig.add_trace(go.Bar(x=x_data, y=y_data, name=chart_data.get('title', '')), row=row, col=col)
            
            elif chart_type == 'line':
                fig.add_trace(go.Scatter(x=x_data, y=y_data, mode='lines+markers', name=chart_data.get('title', '')), row=row, col=col)
            
            elif chart_type == 'pie':
                fig.add_trace(go.Pie(labels=x_data, values=y_data, name=chart_data.get('title', '')), row=row, col=col)
            
            elif chart_type == 'scatter':
                fig.add_trace(go.Scatter(x=x_data, y=y_data, mode='markers', name=chart_data.get('title', '')), row=row, col=col)
            
            # Achsenbeschriftungen hinzufügen
            fig.update_xaxes(title_text=chart_data.get('x_label', ''), row=row, col=col)
            fig.update_yaxes(title_text=chart_data.get('y_label', ''), row=row, col=col)
        
        # Layout optimieren
        fig.update_layout(
            title={
                'text': title,
                'y': 0.98,
                'x': 0.5,
                'xanchor': 'center',
                'yanchor': 'top'
            },
            height=300 * rows,
            width=400 * cols,
            template=theme,
            showlegend=True
        )
        
        # Dashboard speichern
        fig.write_html(output_file, include_plotlyjs='cdn')
        
        update_task_progress(self.request.id, 100, "Dashboard erfolgreich erstellt")
        
        # Ergebnis zurückgeben
        return {
            "status": "success",
            "dashboard_file": output_file,
            "dashboard_title": title,
            "charts_count": len(charts),
            "layout": f"{rows}x{cols}",
            "generated_at": datetime.now().isoformat()
        }
        
    except Exception as e:
        logger.error(f"Fehler bei der Erstellung des Dashboards: {str(e)}")
        raise

@shared_task(bind=True)
def create_time_series_visualization(self, time_series_data: Dict[str, Any],
                                  chart_type: str = 'line',
                                  output_file: Optional[str] = None) -> Dict[str, Any]:
    """
    Erstellt eine Visualisierung für Zeitreihendaten.
    
    Args:
        time_series_data: Dictionary mit Zeitreihendaten
        chart_type: Art des Diagramms ('line', 'bar', etc.)
        output_file: Pfad zur Ausgabedatei (optional)
    
    Returns:
        Dict mit Informationen zur erstellten Visualisierung
    """
    logger.info(f"Starte Erstellung einer Zeitreihen-Visualisierung vom Typ {chart_type}")
    
    try:
        # Zeitreihendaten extrahieren
        dates = time_series_data.get('dates', [])
        values = time_series_data.get('values', [])
        series_name = time_series_data.get('series_name', 'Zeitreihe')
        
        # Visualisierungsdaten vorbereiten
        visualization_data = {
            'x_data': dates,
            'y_data': values,
            'title': f"{series_name} Zeitreihe",
            'x_label': time_series_data.get('x_label', 'Datum'),
            'y_label': time_series_data.get('y_label', 'Wert')
        }
        
        # Zusätzliche Zeitreihen hinzufügen, falls vorhanden
        additional_series = time_series_data.get('additional_series', [])
        if additional_series:
            # Mehrere Zeitreihen in einem Diagramm
            visualization_data['y_data'] = [values]
            visualization_data['labels'] = [series_name]
            
            for series in additional_series:
                visualization_data['y_data'].append(series.get('values', []))
                visualization_data['labels'].append(series.get('name', 'Unbenannt'))
        
        # Standardvisualisierung erstellen
        return create_visualization(
            self,
            visualization_data,
            chart_type=chart_type,
            output_file=output_file,
            interactive=time_series_data.get('interactive', False)
        )
        
    except Exception as e:
        logger.error(f"Fehler bei der Erstellung der Zeitreihen-Visualisierung: {str(e)}")
        raise 