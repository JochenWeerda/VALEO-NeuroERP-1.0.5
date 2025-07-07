#!/usr/bin/env python3
"""
Hauptanwendungsdatei für das VALEO-NeuroERP-Backend.
Integriert alle implementierten Komponenten.
"""

import os
import sys
import logging
from fastapi import FastAPI, Depends, HTTPException, status
from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import OAuth2PasswordBearer, OAuth2PasswordRequestForm
from typing import List, Dict, Any, Optional
from pydantic import BaseModel
import uvicorn
import json
from datetime import datetime, timedelta
from backend.middleware.security import (
    SecurityMiddleware,
    RateLimitMiddleware,
    CORSMiddleware as CustomCORSMiddleware
)
from backend.core.config import settings

# Komponenten importieren
sys.path.append(os.path.dirname(os.path.abspath(__file__)))
from components.UserAuthenticationComponent import UserAuthenticationComponent
from components.TransactionProcessingComponent import TransactionProcessingComponent
from components.ReportGenerationComponent import ReportGenerationComponent
from components.InventoryManagementComponent import InventoryManagementComponent
from components.DocumentManagementComponent import DocumentManagementComponent
from components.DataAnalysisComponent import DataAnalysisComponent
from components.NotificationComponent import NotificationComponent

# Logger konfigurieren
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s - %(name)s - %(levelname)s - %(message)s",
    handlers=[
        logging.StreamHandler(),
        logging.FileHandler("logs/backend.log"),
    ],
)
logger = logging.getLogger(__name__)

# Anwendung erstellen
app = FastAPI(
    title=settings.PROJECT_NAME,
    description=settings.PROJECT_DESCRIPTION,
    version=settings.VERSION
)

# Security Middleware
app.add_middleware(SecurityMiddleware)
app.add_middleware(
    RateLimitMiddleware,
    rate_limit=settings.RATE_LIMIT,
    window_size=settings.RATE_LIMIT_WINDOW
)

# CORS Middleware
app.add_middleware(
    CustomCORSMiddleware,
    allow_origins=settings.CORS_ORIGINS,
    allow_methods=settings.CORS_METHODS,
    allow_headers=settings.CORS_HEADERS,
    expose_headers=settings.CORS_EXPOSE_HEADERS,
    max_age=settings.CORS_MAX_AGE
)

# OAuth2-Schema für die Authentifizierung
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="token")

# Komponenten initialisieren
auth_component = UserAuthenticationComponent()
transaction_component = TransactionProcessingComponent()
report_component = ReportGenerationComponent()
inventory_component = InventoryManagementComponent()
document_component = DocumentManagementComponent()
data_analysis_component = DataAnalysisComponent()
notification_component = NotificationComponent()

# Datenmodelle
class User(BaseModel):
    username: str
    email: Optional[str] = None
    full_name: Optional[str] = None
    disabled: Optional[bool] = None

class UserInDB(User):
    hashed_password: str

class Token(BaseModel):
    access_token: str
    token_type: str

class TokenData(BaseModel):
    username: Optional[str] = None

class Transaction(BaseModel):
    id: Optional[str] = None
    type: str
    amount: float
    date: datetime
    description: Optional[str] = None
    user_id: str

class Report(BaseModel):
    id: Optional[str] = None
    name: str
    type: str
    parameters: Dict[str, Any]
    created_at: Optional[datetime] = None
    user_id: str

class InventoryItem(BaseModel):
    id: Optional[str] = None
    name: str
    sku: str
    quantity: int
    unit_price: float
    location: Optional[str] = None

class Document(BaseModel):
    id: Optional[str] = None
    name: str
    type: str
    content: str
    created_at: Optional[datetime] = None
    user_id: str

class Notification(BaseModel):
    id: Optional[str] = None
    title: str
    message: str
    recipient_id: str
    read: Optional[bool] = False
    created_at: Optional[datetime] = None

# Hilfsfunktionen
def get_current_user(token: str = Depends(oauth2_scheme)):
    credentials_exception = HTTPException(
        status_code=status.HTTP_401_UNAUTHORIZED,
        detail="Could not validate credentials",
        headers={"WWW-Authenticate": "Bearer"},
    )
    try:
        user = auth_component.validate_token(token)
        if user is None:
            raise credentials_exception
        return user
    except Exception:
        raise credentials_exception

def get_current_active_user(current_user: User = Depends(get_current_user)):
    if current_user.disabled:
        raise HTTPException(status_code=400, detail="Inactive user")
    return current_user

# Routen

@app.get("/")
async def root():
    return {"message": "Willkommen bei der VALEO-NeuroERP API"}

@app.post("/token", response_model=Token)
async def login_for_access_token(form_data: OAuth2PasswordRequestForm = Depends()):
    user = auth_component.authenticate_user(form_data.username, form_data.password)
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Incorrect username or password",
            headers={"WWW-Authenticate": "Bearer"},
        )
    access_token = auth_component.create_access_token(
        data={"sub": user.username}, expires_delta=timedelta(minutes=30)
    )
    return {"access_token": access_token, "token_type": "bearer"}

# Benutzer-Routen
@app.get("/users/me", response_model=User)
async def read_users_me(current_user: User = Depends(get_current_active_user)):
    return current_user

@app.get("/users/", response_model=List[User])
async def read_users(skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_active_user)):
    return auth_component.get_users(skip=skip, limit=limit)

# Transaktions-Routen
@app.post("/transactions/", response_model=Transaction)
async def create_transaction(transaction: Transaction, current_user: User = Depends(get_current_active_user)):
    return transaction_component.create_transaction(transaction)

@app.get("/transactions/", response_model=List[Transaction])
async def read_transactions(skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_active_user)):
    return transaction_component.get_transactions(skip=skip, limit=limit)

@app.get("/transactions/{transaction_id}", response_model=Transaction)
async def read_transaction(transaction_id: str, current_user: User = Depends(get_current_active_user)):
    transaction = transaction_component.get_transaction(transaction_id)
    if transaction is None:
        raise HTTPException(status_code=404, detail="Transaction not found")
    return transaction

# Berichts-Routen
@app.post("/reports/", response_model=Report)
async def create_report(report: Report, current_user: User = Depends(get_current_active_user)):
    return report_component.create_report(report)

@app.get("/reports/", response_model=List[Report])
async def read_reports(skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_active_user)):
    return report_component.get_reports(skip=skip, limit=limit)

@app.get("/reports/{report_id}", response_model=Report)
async def read_report(report_id: str, current_user: User = Depends(get_current_active_user)):
    report = report_component.get_report(report_id)
    if report is None:
        raise HTTPException(status_code=404, detail="Report not found")
    return report

# Inventar-Routen
@app.post("/inventory/", response_model=InventoryItem)
async def create_inventory_item(item: InventoryItem, current_user: User = Depends(get_current_active_user)):
    return inventory_component.create_item(item)

@app.get("/inventory/", response_model=List[InventoryItem])
async def read_inventory(skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_active_user)):
    return inventory_component.get_items(skip=skip, limit=limit)

@app.get("/inventory/{item_id}", response_model=InventoryItem)
async def read_inventory_item(item_id: str, current_user: User = Depends(get_current_active_user)):
    item = inventory_component.get_item(item_id)
    if item is None:
        raise HTTPException(status_code=404, detail="Inventory item not found")
    return item

# Dokument-Routen
@app.post("/documents/", response_model=Document)
async def create_document(document: Document, current_user: User = Depends(get_current_active_user)):
    return document_component.create_document(document)

@app.get("/documents/", response_model=List[Document])
async def read_documents(skip: int = 0, limit: int = 100, current_user: User = Depends(get_current_active_user)):
    return document_component.get_documents(skip=skip, limit=limit)

@app.get("/documents/{document_id}", response_model=Document)
async def read_document(document_id: str, current_user: User = Depends(get_current_active_user)):
    document = document_component.get_document(document_id)
    if document is None:
        raise HTTPException(status_code=404, detail="Document not found")
    return document

# Datenanalyse-Routen
@app.post("/analysis/")
async def perform_analysis(parameters: Dict[str, Any], current_user: User = Depends(get_current_active_user)):
    return data_analysis_component.analyze_data(parameters)

# Benachrichtigungs-Routen
@app.post("/notifications/", response_model=Notification)
async def create_notification(notification: Notification, current_user: User = Depends(get_current_active_user)):
    return notification_component.create_notification(notification)

@app.get("/notifications/", response_model=List[Notification])
async def read_notifications(current_user: User = Depends(get_current_active_user)):
    return notification_component.get_notifications(recipient_id=current_user.id)

@app.put("/notifications/{notification_id}/read")
async def mark_notification_read(notification_id: str, current_user: User = Depends(get_current_active_user)):
    success = notification_component.mark_as_read(notification_id)
    if not success:
        raise HTTPException(status_code=404, detail="Notification not found")
    return {"status": "success"}

# API Router importieren und einbinden
from backend.api.v1.api import api_router
app.include_router(api_router, prefix=settings.API_V1_STR)

# Health Check
@app.get("/health")
async def health_check():
    """Health Check Endpoint"""
    return {"status": "healthy"}

if __name__ == "__main__":
    # Stellen Sie sicher, dass der Logs-Ordner existiert
    os.makedirs("logs", exist_ok=True)
    
    # Server starten
    uvicorn.run(app, host="0.0.0.0", port=8000)
