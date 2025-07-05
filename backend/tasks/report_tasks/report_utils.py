"""
Hilfsfunktionen für die Berichtsgenerierung im VALEO-NeuroERP-System.

Dieses Modul enthält Hilfsfunktionen für die Formatierung und Validierung von Berichtsdaten.
"""

import logging
from typing import Dict, List, Any, Optional, Union, Tuple
from datetime import datetime

logger = logging.getLogger(__name__)

def validate_report_parameters(data: Dict[str, Any], required_fields: List[str]) -> bool:
    """
    Validiert die Parameter für die Berichtsgenerierung.
    
    Args:
        data: Dictionary mit den zu validierenden Daten
        required_fields: Liste der erforderlichen Felder
    
    Returns:
        True, wenn alle erforderlichen Felder vorhanden sind
        
    Raises:
        ValueError: Wenn ein erforderliches Feld fehlt
    """
    missing_fields = [field for field in required_fields if field not in data]
    
    if missing_fields:
        error_msg = f"Fehlende Pflichtfelder: {', '.join(missing_fields)}"
        logger.error(error_msg)
        raise ValueError(error_msg)
    
    return True

def format_report_data(data: Dict[str, Any], format_type: str = 'default') -> Dict[str, Any]:
    """
    Formatiert Daten für die Berichtsgenerierung.
    
    Args:
        data: Dictionary mit den zu formatierenden Daten
        format_type: Art der Formatierung ('default', 'financial', 'project', etc.)
    
    Returns:
        Dictionary mit den formatierten Daten
    """
    formatted_data = data.copy()
    
    # Je nach Format-Typ unterschiedliche Formatierung anwenden
    if format_type == 'financial':
        # Finanzwerte formatieren
        for key, value in data.items():
            if isinstance(value, (int, float)) and any(financial_key in key for financial_key in ['amount', 'price', 'cost', 'revenue', 'expense', 'budget']):
                formatted_data[key] = format_currency(value)
    
    elif format_type == 'date':
        # Datumswerte formatieren
        for key, value in data.items():
            if isinstance(value, str) and any(date_key in key for date_key in ['date', 'time', 'timestamp']):
                try:
                    date_obj = datetime.fromisoformat(value)
                    formatted_data[key] = format_date(date_obj)
                except ValueError:
                    pass
    
    # Metadaten hinzufügen
    formatted_data['_meta'] = {
        'formatted_at': datetime.now().isoformat(),
        'format_type': format_type
    }
    
    return formatted_data

def format_currency(value: Union[int, float], currency_symbol: str = '€', 
                  decimal_places: int = 2) -> str:
    """
    Formatiert einen Wert als Währungsbetrag.
    
    Args:
        value: Zu formatierender Wert
        currency_symbol: Währungssymbol
        decimal_places: Anzahl der Nachkommastellen
    
    Returns:
        Formatierter Währungsbetrag als String
    """
    return f"{value:,.{decimal_places}f} {currency_symbol}"

def format_date(date_obj: datetime, format_str: str = '%d.%m.%Y') -> str:
    """
    Formatiert ein Datum.
    
    Args:
        date_obj: Zu formatierendes Datum
        format_str: Formatierungsstring
    
    Returns:
        Formatiertes Datum als String
    """
    return date_obj.strftime(format_str)

def format_percentage(value: Union[int, float], decimal_places: int = 1) -> str:
    """
    Formatiert einen Wert als Prozentsatz.
    
    Args:
        value: Zu formatierender Wert
        decimal_places: Anzahl der Nachkommastellen
    
    Returns:
        Formatierter Prozentsatz als String
    """
    return f"{value:.{decimal_places}f}%"

def truncate_text(text: str, max_length: int = 100, suffix: str = '...') -> str:
    """
    Kürzt einen Text auf eine maximale Länge.
    
    Args:
        text: Zu kürzender Text
        max_length: Maximale Länge
        suffix: Suffix für gekürzte Texte
    
    Returns:
        Gekürzter Text
    """
    if len(text) <= max_length:
        return text
    
    return text[:max_length - len(suffix)] + suffix

def format_table_data(data: List[Dict[str, Any]], columns: List[str]) -> List[List[Any]]:
    """
    Formatiert Daten für die Darstellung in einer Tabelle.
    
    Args:
        data: Liste von Dictionaries mit den Daten
        columns: Liste der Spalten, die in der Tabelle angezeigt werden sollen
    
    Returns:
        Liste von Listen mit den formatierten Daten
    """
    table_data = []
    
    for item in data:
        row = []
        for column in columns:
            row.append(item.get(column, ''))
        
        table_data.append(row)
    
    return table_data

def generate_summary(data: Dict[str, Any], metrics: List[str]) -> str:
    """
    Generiert eine Zusammenfassung der Daten.
    
    Args:
        data: Dictionary mit den Daten
        metrics: Liste der Metriken, die in der Zusammenfassung enthalten sein sollen
    
    Returns:
        Zusammenfassung als String
    """
    summary_lines = []
    
    for metric in metrics:
        if metric in data:
            value = data[metric]
            
            # Je nach Metrik unterschiedliche Formatierung anwenden
            if isinstance(value, (int, float)) and any(financial_key in metric for financial_key in ['amount', 'price', 'cost', 'revenue', 'expense', 'budget']):
                formatted_value = format_currency(value)
            elif isinstance(value, (int, float)) and any(percent_key in metric for percent_key in ['percentage', 'rate', 'ratio']):
                formatted_value = format_percentage(value)
            elif isinstance(value, str) and any(date_key in metric for date_key in ['date', 'time', 'timestamp']):
                try:
                    date_obj = datetime.fromisoformat(value)
                    formatted_value = format_date(date_obj)
                except ValueError:
                    formatted_value = value
            else:
                formatted_value = str(value)
            
            # Metrik-Namen formatieren (Unterstriche durch Leerzeichen ersetzen, erste Buchstaben groß)
            metric_name = ' '.join(word.capitalize() for word in metric.split('_'))
            
            summary_lines.append(f"{metric_name}: {formatted_value}")
    
    return '\n'.join(summary_lines)

def sanitize_filename(filename: str) -> str:
    """
    Bereinigt einen Dateinamen von ungültigen Zeichen.
    
    Args:
        filename: Zu bereinigender Dateiname
    
    Returns:
        Bereinigter Dateiname
    """
    # Ungültige Zeichen durch Unterstriche ersetzen
    invalid_chars = '<>:"/\\|?*'
    for char in invalid_chars:
        filename = filename.replace(char, '_')
    
    # Leerzeichen durch Unterstriche ersetzen
    filename = filename.replace(' ', '_')
    
    return filename 