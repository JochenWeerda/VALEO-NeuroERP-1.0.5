from sqlalchemy.ext.declarative import declarative_base

# Import all the models for Alembic
from backend.app.db.base_class import Base
from backend.app.models.wws_models import Kunde, WWS_Artikel, WWS_Verkauf1, WWS_Verkauf2, TSE_Transaktion, Waage_Messung, WWS_WSTR
from backend.app.models.erp import User
from backend.models.inventory import Inventur, Inventurposition, Lager, Artikelbestand, Artikel

Base = declarative_base() 