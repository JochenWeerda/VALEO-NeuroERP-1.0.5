"""
Modelle für VALEO-NeuroERP

Dieses Paket enthält die Pydantic-Modelle für die Datenstrukturen des VALEO-NeuroERP-Systems.
"""

from backend.models.search_history import (
    SearchQuery,
    SearchResult,
    SearchHistoryItem,
    RAGQueryHistoryItem,
    DocumentProcessingHistoryItem
)

# Temporär auskommentiert, da die Klassen noch nicht existieren
# from backend.models.reports import (
#     Report,
#     ReportDistribution,
#     ReportSchedule
# )
