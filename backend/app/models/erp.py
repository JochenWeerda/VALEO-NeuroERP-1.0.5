from sqlalchemy import Column, Integer, String, Float, ForeignKey, Enum, Text, Boolean, DateTime, Table
from sqlalchemy.orm import relationship, backref
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
    roles = relationship(
        "Role",
        secondary="user_role_association",
        back_populates="users"
    )

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

# Neue Tabellen für Rollen- und Berechtigungssystem

# Assoziationstabelle User <-> Role
UserRoleAssociation = Table(
    "user_role_association",
    Base.metadata,
    Column("user_id", Integer, ForeignKey("user.id"), primary_key=True),
    Column("role_id", Integer, ForeignKey("role.id"), primary_key=True)
)

# Assoziationstabelle Role <-> Permission
RolePermissionAssociation = Table(
    "role_permission_association",
    Base.metadata,
    Column("role_id", Integer, ForeignKey("role.id"), primary_key=True),
    Column("permission_id", Integer, ForeignKey("permission.id"), primary_key=True)
)

class Role(Base):
    __tablename__ = "role"
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, unique=True, nullable=False)
    description = Column(String)
    permissions = relationship(
        "Permission",
        secondary=RolePermissionAssociation,
        back_populates="roles"
    )
    users = relationship(
        "User",
        secondary=UserRoleAssociation,
        back_populates="roles"
    )
    created_at = Column(DateTime)
    updated_at = Column(DateTime)

class Permission(Base):
    __tablename__ = "permission"
    id = Column(Integer, primary_key=True, index=True)
    resource = Column(String, nullable=False)
    action = Column(String, nullable=False)
    conditions = Column(Text)  # JSON-String für Bedingungen
    fields = Column(Text)      # JSON-String für Feldlisten
    roles = relationship(
        "Role",
        secondary=RolePermissionAssociation,
        back_populates="permissions"
    )

class TemporaryPermission(Base):
    __tablename__ = "temporary_permission"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    permission_id = Column(Integer, ForeignKey("permission.id"), nullable=False)
    valid_from = Column(DateTime, nullable=False)
    valid_until = Column(DateTime, nullable=False)
    context = Column(Text)  # JSON-String für Kontextregeln
    granted_by = Column(Integer, ForeignKey("user.id"))
    user = relationship("User", foreign_keys=[user_id], backref=backref("temporary_permissions", lazy="dynamic"))
    permission = relationship("Permission")
    granter = relationship("User", foreign_keys=[granted_by])

class PermissionAuditLog(Base):
    __tablename__ = "permission_audit_log"
    id = Column(Integer, primary_key=True, index=True)
    user_id = Column(Integer, ForeignKey("user.id"), nullable=False)
    action = Column(String, nullable=False)  # z.B. 'grant', 'revoke', 'update'
    permission_id = Column(Integer, ForeignKey("permission.id"))
    role_id = Column(Integer, ForeignKey("role.id"))
    timestamp = Column(DateTime, nullable=False)
    context = Column(Text)  # JSON-String für Kontext/Begründung
    user = relationship("User")
    permission = relationship("Permission")
    role = relationship("Role") 