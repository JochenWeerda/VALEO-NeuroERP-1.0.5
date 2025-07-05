from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum, Text, Boolean, DateTime
from sqlalchemy.orm import relationship
import enum
from backend.app.models.base import Base

class UserRole(str, enum.Enum):
    ADMIN = "admin"
    MANAGER = "manager"
    USER = "user"
    CUSTOMER = "customer"  # Rolle für Kunden mit eingeschränkten Rechten

class User(Base):
    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    full_name = Column(String)
    role = Column(Enum(UserRole), default=UserRole.USER)
    is_active = Column(Boolean, default=True)
    
    # Beziehungen
    orders = relationship("Order", back_populates="user")
    customers = relationship("Customer", back_populates="sales_rep")

class Customer(Base):
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    email = Column(String, unique=True, index=True)
    phone = Column(String)
    address = Column(Text)
    sales_rep_id = Column(Integer, ForeignKey("user.id"))
    
    # Beziehungen
    sales_rep = relationship("User", back_populates="customers")
    orders = relationship("Order", back_populates="customer")

class Product(Base):
    id = Column(Integer, primary_key=True, index=True)
    sku = Column(String, unique=True, index=True, nullable=False)
    name = Column(String, nullable=False)
    description = Column(Text)
    price = Column(Float, nullable=False)
    stock_quantity = Column(Integer, default=0)
    min_stock_level = Column(Integer, default=10)
    
    # Beziehungen
    order_items = relationship("OrderItem", back_populates="product")

class Order(Base):
    id = Column(Integer, primary_key=True, index=True)
    order_number = Column(String, unique=True, index=True, nullable=False)
    customer_id = Column(Integer, ForeignKey("customer.id"), nullable=False)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    status = Column(String, default="pending")  # pending, processing, shipped, delivered, cancelled
    total_amount = Column(Float, default=0.0)
    
    # Beziehungen
    customer = relationship("Customer", back_populates="orders")
    user = relationship("User", back_populates="orders")
    items = relationship("OrderItem", back_populates="order")

class OrderItem(Base):
    id = Column(Integer, primary_key=True, index=True)
    order_id = Column(Integer, ForeignKey("order.id"), nullable=False)
    product_id = Column(Integer, ForeignKey("product.id"), nullable=False)
    quantity = Column(Integer, nullable=False)
    unit_price = Column(Float, nullable=False)
    
    # Beziehungen
    order = relationship("Order", back_populates="items")
    product = relationship("Product", back_populates="order_items")

class Inventory(Base):
    id = Column(Integer, primary_key=True, index=True)
    product_id = Column(Integer, ForeignKey("product.id"), nullable=False)
    quantity = Column(Integer, default=0)
    location = Column(String)
    last_restock_date = Column(DateTime)
    
    # Beziehungen
    product = relationship("Product") 