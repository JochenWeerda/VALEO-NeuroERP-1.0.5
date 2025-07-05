from backend.app.models.base import Base
from backend.app.models.erp import User, Customer, Product, Order, OrderItem, Inventory
from backend.app.models.wws_models import (
    Kunde, 
    WWS_Artikel, 
    WWS_Verkauf1, 
    WWS_Verkauf2, 
    WWS_WSTR, 
    Zahlvorsch, 
    Zusatzfelder_Kunde,
    TSE_Transaktion,
    Waage_Messung
) 