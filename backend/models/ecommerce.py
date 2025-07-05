from datetime import datetime
from typing import List, Optional
from pydantic import BaseModel, Field


class Product(BaseModel):
    """Produktmodell für E-Commerce"""
    id: Optional[int] = None
    sku: str = Field(..., description="Eindeutige Artikelnummer")
    name: str = Field(..., description="Produktname")
    description: str = Field(None, description="Produktbeschreibung")
    price: float = Field(..., description="Verkaufspreis")
    cost_price: float = Field(None, description="Einkaufspreis")
    inventory_level: int = Field(default=0, description="Lagerbestand")
    category_id: Optional[int] = Field(None, description="Kategorie-ID")
    tax_rate: float = Field(default=19.0, description="Steuersatz in Prozent")
    weight: Optional[float] = Field(None, description="Gewicht in kg")
    dimensions: Optional[str] = Field(None, description="Dimensionen (L x B x H)")
    active: bool = Field(default=True, description="Ist Produkt aktiv?")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None
    image_urls: List[str] = Field(default_factory=list)
    tags: List[str] = Field(default_factory=list)


class ProductCategory(BaseModel):
    """Produktkategorie für E-Commerce"""
    id: Optional[int] = None
    name: str = Field(..., description="Kategoriename")
    description: Optional[str] = Field(None, description="Kategoriebeschreibung")
    parent_id: Optional[int] = Field(None, description="Übergeordnete Kategorie")
    active: bool = Field(default=True, description="Ist Kategorie aktiv?")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None


class CartItem(BaseModel):
    """Warenkorb-Item für E-Commerce"""
    id: Optional[int] = None
    cart_id: int = Field(..., description="Warenkorb-ID")
    product_id: int = Field(..., description="Produkt-ID")
    quantity: int = Field(default=1, description="Menge")
    price: float = Field(..., description="Preis pro Einheit")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None


class ShoppingCart(BaseModel):
    """Warenkorb für E-Commerce"""
    id: Optional[int] = None
    customer_id: Optional[int] = Field(None, description="Kunden-ID wenn angemeldet")
    session_id: str = Field(..., description="Session-ID für nicht angemeldete Benutzer")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None
    items: List[CartItem] = Field(default_factory=list)
    

class Order(BaseModel):
    """Bestellung für E-Commerce"""
    id: Optional[int] = None
    order_number: str = Field(..., description="Bestellnummer")
    customer_id: int = Field(..., description="Kunden-ID")
    order_date: datetime = Field(default_factory=datetime.now)
    status: str = Field(default="neu", description="Bestellstatus")
    shipping_address_id: int = Field(..., description="Lieferadresse-ID")
    billing_address_id: int = Field(..., description="Rechnungsadresse-ID")
    payment_method: str = Field(..., description="Zahlungsmethode")
    shipping_method: str = Field(..., description="Versandmethode")
    subtotal: float = Field(..., description="Zwischensumme ohne Steuern")
    tax_amount: float = Field(..., description="Steuerbetrag")
    shipping_cost: float = Field(..., description="Versandkosten")
    discount_amount: float = Field(default=0.0, description="Rabattbetrag")
    total_amount: float = Field(..., description="Gesamtbetrag")
    notes: Optional[str] = Field(None, description="Bestellnotizen")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None


class OrderItem(BaseModel):
    """Bestellposition für E-Commerce"""
    id: Optional[int] = None
    order_id: int = Field(..., description="Bestellungs-ID")
    product_id: int = Field(..., description="Produkt-ID")
    product_name: str = Field(..., description="Produktname")
    quantity: int = Field(..., description="Menge")
    unit_price: float = Field(..., description="Preis pro Einheit")
    tax_rate: float = Field(..., description="Steuersatz")
    discount_amount: float = Field(default=0.0, description="Rabattbetrag")
    total_price: float = Field(..., description="Gesamtpreis")
    created_at: datetime = Field(default_factory=datetime.now)


class Address(BaseModel):
    """Adresse für E-Commerce"""
    id: Optional[int] = None
    customer_id: int = Field(..., description="Kunden-ID")
    address_type: str = Field(..., description="Adresstyp (Lieferung/Rechnung)")
    first_name: str = Field(..., description="Vorname")
    last_name: str = Field(..., description="Nachname")
    company: Optional[str] = Field(None, description="Firma")
    street: str = Field(..., description="Straße und Hausnummer")
    additional: Optional[str] = Field(None, description="Zusätzliche Adressinformation")
    postal_code: str = Field(..., description="PLZ")
    city: str = Field(..., description="Stadt")
    country: str = Field(..., description="Land")
    phone: Optional[str] = Field(None, description="Telefonnummer")
    is_default: bool = Field(default=False, description="Ist Standardadresse?")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None


class Discount(BaseModel):
    """Rabatt für E-Commerce"""
    id: Optional[int] = None
    code: str = Field(..., description="Rabattcode")
    description: str = Field(..., description="Beschreibung")
    discount_type: str = Field(..., description="Rabatttyp (prozentual, fest)")
    discount_value: float = Field(..., description="Rabattwert")
    minimum_order_value: Optional[float] = Field(None, description="Minimaler Bestellwert")
    valid_from: datetime = Field(..., description="Gültig ab")
    valid_to: Optional[datetime] = Field(None, description="Gültig bis")
    usage_limit: Optional[int] = Field(None, description="Nutzungslimit")
    used_count: int = Field(default=0, description="Bereits genutzt")
    active: bool = Field(default=True, description="Ist aktiv?")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None


class Review(BaseModel):
    """Produktbewertung für E-Commerce"""
    id: Optional[int] = None
    product_id: int = Field(..., description="Produkt-ID")
    customer_id: int = Field(..., description="Kunden-ID")
    rating: int = Field(..., description="Bewertung (1-5)")
    title: str = Field(..., description="Titel")
    comment: str = Field(..., description="Kommentar")
    verified_purchase: bool = Field(default=False, description="Verifizierter Kauf")
    created_at: datetime = Field(default_factory=datetime.now)
    updated_at: Optional[datetime] = None
    is_approved: bool = Field(default=False, description="Ist genehmigt") 