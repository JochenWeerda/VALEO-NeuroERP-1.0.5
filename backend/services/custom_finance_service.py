from fastapi import FastAPI, HTTPException, Query
from pydantic import BaseModel
from typing import List, Optional
from datetime import date
from sqlalchemy import create_engine, Column, Integer, String, Float, Date, Text
from sqlalchemy.ext.declarative import declarative_base
from sqlalchemy.orm import sessionmaker, Session
import os

DATABASE_URL = os.environ.get("CUSTOM_FINANCE_DB", "sqlite:///custom_finance.db")
engine = create_engine(DATABASE_URL, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
Base = declarative_base()

class CustomFinanceEntryDB(Base):
    __tablename__ = "custom_finance_entry"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    amount = Column(Float, nullable=False)
    date = Column(Date, nullable=False)
    account = Column(String, nullable=True)
    partner = Column(String, nullable=True)
    note = Column(Text, nullable=True)

class CustomFinanceEntry(BaseModel):
    id: Optional[int]
    name: str
    amount: float
    date: date
    account: Optional[str] = None
    partner: Optional[str] = None
    note: Optional[str] = None
    class Config:
        orm_mode = True

app = FastAPI(title="Custom Finance Service", description="Microservice für Finanzbuchungen (Odoo-Übersetzung)")

# DB-Init & Demo-Daten
Base.metadata.create_all(bind=engine)
def seed_demo():
    db = SessionLocal()
    if not db.query(CustomFinanceEntryDB).first():
        demo = CustomFinanceEntryDB(
            name="Testbuchung 1",
            amount=100.0,
            date=date(2024, 1, 1),
            account="1200",
            partner="Musterkunde",
            note="Beispielbuchung"
        )
        db.add(demo)
        db.commit()
    db.close()
seed_demo()

# Dependency
from fastapi import Depends
def get_db():
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()

@app.get("/finance/entries", response_model=List[CustomFinanceEntry])
def list_entries(skip: int = 0, limit: int = 100, db: Session = Depends(get_db)):
    return db.query(CustomFinanceEntryDB).offset(skip).limit(limit).all()

@app.post("/finance/entries", response_model=CustomFinanceEntry)
def create_entry(entry: CustomFinanceEntry, db: Session = Depends(get_db)):
    db_entry = CustomFinanceEntryDB(**entry.dict(exclude={"id"}))
    db.add(db_entry)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.get("/finance/entries/{entry_id}", response_model=CustomFinanceEntry)
def get_entry(entry_id: int, db: Session = Depends(get_db)):
    entry = db.query(CustomFinanceEntryDB).filter(CustomFinanceEntryDB.id == entry_id).first()
    if not entry:
        raise HTTPException(status_code=404, detail="Eintrag nicht gefunden")
    return entry

@app.put("/finance/entries/{entry_id}", response_model=CustomFinanceEntry)
def update_entry(entry_id: int, entry: CustomFinanceEntry, db: Session = Depends(get_db)):
    db_entry = db.query(CustomFinanceEntryDB).filter(CustomFinanceEntryDB.id == entry_id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Eintrag nicht gefunden")
    for field, value in entry.dict(exclude_unset=True, exclude={"id"}).items():
        setattr(db_entry, field, value)
    db.commit()
    db.refresh(db_entry)
    return db_entry

@app.delete("/finance/entries/{entry_id}")
def delete_entry(entry_id: int, db: Session = Depends(get_db)):
    db_entry = db.query(CustomFinanceEntryDB).filter(CustomFinanceEntryDB.id == entry_id).first()
    if not db_entry:
        raise HTTPException(status_code=404, detail="Eintrag nicht gefunden")
    db.delete(db_entry)
    db.commit()
    return {"ok": True} 