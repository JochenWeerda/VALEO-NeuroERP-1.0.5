"""
Zvoove Models
SQLAlchemy-Modelle für die zvoove Handel ERP-Integration
"""

from sqlalchemy import Column, String, Integer, Float, DateTime, Date, Text, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from datetime import datetime
from database.database import Base

class ZvooveOrder(Base):
    """Zvoove Order Model"""
    __tablename__ = "zvoove_orders"
    
    id = Column(String(50), primary_key=True, index=True)
    customer_number = Column(String(50), nullable=False, index=True)
    debtor_number = Column(String(50), nullable=False, index=True)
    document_date = Column(Date, nullable=False, index=True)
    contact_person = Column(String(100), nullable=False)
    document_type = Column(String(20), nullable=False, default='order', index=True)
    status = Column(String(20), nullable=False, default='draft', index=True)
    net_amount = Column(Float, nullable=False, default=0.0)
    vat_amount = Column(Float, nullable=False, default=0.0)
    total_amount = Column(Float, nullable=False, default=0.0)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    positions = relationship("ZvoovePosition", back_populates="order", cascade="all, delete-orphan")
    deliveries = relationship("ZvooveDelivery", back_populates="order")

class ZvoovePosition(Base):
    """Zvoove Position Model"""
    __tablename__ = "zvoove_positions"
    
    id = Column(String(50), primary_key=True, index=True)
    order_id = Column(String(50), ForeignKey("zvoove_orders.id"), nullable=False, index=True)
    article_number = Column(String(50), nullable=False, index=True)
    description = Column(Text, nullable=False)
    quantity = Column(Float, nullable=False)
    unit = Column(String(20), nullable=False)
    unit_price = Column(Float, nullable=False)
    discount = Column(Float, nullable=False, default=0.0)
    net_price = Column(Float, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order = relationship("ZvooveOrder", back_populates="positions")

class ZvooveContact(Base):
    """Zvoove Contact Model"""
    __tablename__ = "zvoove_contacts"
    
    id = Column(String(50), primary_key=True, index=True)
    contact_number = Column(String(50), nullable=False, unique=True, index=True)
    name = Column(String(100), nullable=False, index=True)
    representative = Column(String(100), index=True)
    contact_type = Column(String(20), nullable=False, default='customer', index=True)
    appointment_date = Column(Date, index=True)
    order_quantity = Column(Integer, default=0)
    remaining_quantity = Column(Integer, default=0)
    status = Column(String(20), nullable=False, default='active', index=True)
    phone = Column(String(20))
    email = Column(String(100), index=True)
    last_contact = Column(Date, index=True)
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

class ZvooveDelivery(Base):
    """Zvoove Delivery Model"""
    __tablename__ = "zvoove_deliveries"
    
    id = Column(String(50), primary_key=True, index=True)
    delivery_number = Column(String(50), nullable=False, unique=True, index=True)
    order_id = Column(String(50), ForeignKey("zvoove_orders.id"), index=True)
    delivery_date = Column(Date, nullable=False, index=True)
    status = Column(String(20), nullable=False, default='pending', index=True)
    shipping_address = Column(Text)
    tracking_number = Column(String(100))
    notes = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
    # Relationships
    order = relationship("ZvooveOrder", back_populates="deliveries")

class ZvooveDocument(Base):
    """Zvoove Document Model"""
    __tablename__ = "zvoove_documents"
    
    id = Column(String(50), primary_key=True, index=True)
    document_type = Column(String(20), nullable=False, index=True)
    reference_id = Column(String(50), nullable=False, index=True)
    file_path = Column(String(255))
    file_size = Column(Integer)
    mime_type = Column(String(100))
    status = Column(String(20), nullable=False, default='draft', index=True)
    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow) 