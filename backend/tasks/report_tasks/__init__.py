"""
Report-Tasks für das VALEO-NeuroERP-System.

Dieses Modul enthält Celery-Tasks für die asynchrone Generierung von Berichten,
einschließlich PDF-Berichten, Excel-Exporten und Datenvisualisierungen.
"""

# PDF-Berichte
from .pdf_reports import (
    generate_pdf_report,
    generate_financial_report,
    generate_project_status_report
)

# Excel-Exporte
from .excel_exports import (
    generate_excel_export,
    generate_data_analysis_export,
    generate_transaction_report
)

# Datenvisualisierung
from .data_visualization import (
    create_visualization,
    create_dashboard,
    create_time_series_visualization,
    create_static_chart,
    create_interactive_chart
)

# Geplante Berichte
from .scheduled_reports import (
    generate_scheduled_report,
    distribute_report,
    schedule_recurring_report
)

# Hilfsfunktionen
from .report_utils import (
    format_report_data,
    validate_report_parameters,
    format_currency,
    format_date,
    format_percentage,
    truncate_text,
    format_table_data,
    generate_summary,
    sanitize_filename
)

__all__ = [
    # PDF-Berichte
    'generate_pdf_report',
    'generate_financial_report',
    'generate_project_status_report',
    
    # Excel-Exporte
    'generate_excel_export',
    'generate_data_analysis_export',
    'generate_transaction_report',
    
    # Datenvisualisierung
    'create_visualization',
    'create_dashboard',
    'create_time_series_visualization',
    'create_static_chart',
    'create_interactive_chart',
    
    # Geplante Berichte
    'generate_scheduled_report',
    'distribute_report',
    'schedule_recurring_report',
    
    # Hilfsfunktionen
    'format_report_data',
    'validate_report_parameters',
    'format_currency',
    'format_date',
    'format_percentage',
    'truncate_text',
    'format_table_data',
    'generate_summary',
    'sanitize_filename'
] 