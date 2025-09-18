from sqlalchemy import Column, String, Float, Integer, Text, JSON, Boolean, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from datetime import datetime
from typing import Optional

from backend.database.database import Base

class CustomerORM(Base):
    __tablename__ = "customers"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    customerNumber: Mapped[str] = mapped_column(String, index=True)
    debtorAccount: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    customerGroup: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    salesRep: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    dispatcher: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    creditLimit: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    name: Mapped[str] = mapped_column(String, index=True)
    address: Mapped[Optional[dict]] = mapped_column(JSON, nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    whatsapp: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    status: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    priority: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    createdAt: Mapped[str] = mapped_column(String)
    updatedAt: Mapped[str] = mapped_column(String)
    totalRevenue: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    openInvoices: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    creditUsed: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    paymentTerms: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    customerSegment: Mapped[Optional[str]] = mapped_column(String, index=True)
    riskScore: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)

class ContactPersonORM(Base):
    __tablename__ = "contact_persons"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    customerId: Mapped[str] = mapped_column(String, index=True)
    firstName: Mapped[str] = mapped_column(String)
    lastName: Mapped[str] = mapped_column(String)
    position: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    department: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    phone: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    whatsapp: Mapped[Optional[str]] = mapped_column(String, nullable=True)
    isPrimary: Mapped[bool] = mapped_column(Boolean, default=False)
    contactWeekdays: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    notes: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    createdAt: Mapped[str] = mapped_column(String)
    updatedAt: Mapped[str] = mapped_column(String)

class CustomerCommunicationORM(Base):
    __tablename__ = "customer_communications"
    id: Mapped[str] = mapped_column(String, primary_key=True)
    customerId: Mapped[str] = mapped_column(String, index=True)
    type: Mapped[str] = mapped_column(String)
    subject: Mapped[str] = mapped_column(String)
    content: Mapped[str] = mapped_column(Text)
    date: Mapped[str] = mapped_column(String)
    status: Mapped[str] = mapped_column(String)
    outcome: Mapped[str] = mapped_column(String)
    attachments: Mapped[Optional[list]] = mapped_column(JSON, nullable=True)
    from_field: Mapped[str] = mapped_column("from", String)  # reserved keyword workaround
    to: Mapped[str] = mapped_column(String)
    priority: Mapped[str] = mapped_column(String)
    createdBy: Mapped[str] = mapped_column(String)
    updatedAt: Mapped[str] = mapped_column(String)
