from sqlalchemy import Column, Integer, String, Float, DateTime, ForeignKey
from sqlalchemy.orm import relationship
from datetime import datetime
from core.db.postgresql import Base
from pydantic import BaseModel
from typing import Optional

class TransactionDB(Base):
    """SQLAlchemy-Modell für Transaktionen"""
    __tablename__ = "transactions"

    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(String, index=True)
    type = Column(String, index=True)
    amount = Column(Float)
    currency = Column(String)
    description = Column(String)
    reference = Column(String, unique=True, index=True)
    status = Column(String, index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class TransactionBase(BaseModel):
    """Basis-Pydantic-Modell für Transaktionen"""
    type: str
    amount: float
    currency: str
    description: Optional[str] = None
    reference: str

class TransactionCreate(TransactionBase):
    """Pydantic-Modell für Transaktionserstellung"""
    pass

class TransactionUpdate(BaseModel):
    """Pydantic-Modell für Transaktionsaktualisierung"""
    type: Optional[str] = None
    amount: Optional[float] = None
    currency: Optional[str] = None
    description: Optional[str] = None
    status: Optional[str] = None

class Transaction(TransactionBase):
    """Pydantic-Modell für Transaktionsantworten"""
    id: int
    user_id: str
    status: str
    created_at: datetime
    updated_at: datetime

    class Config:
        orm_mode = True 