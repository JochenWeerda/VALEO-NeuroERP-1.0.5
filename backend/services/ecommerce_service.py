from datetime import datetime
import os
import json
import uuid
from typing import List, Optional, Dict, Any
import logging
from fastapi import APIRouter
from fastapi.responses import PlainTextResponse
import prometheus_client

from models.ecommerce import (
    Product, ProductCategory, CartItem, ShoppingCart, 
    Order, OrderItem, Address, Discount, Review
)

logger = logging.getLogger(__name__)

# Simuliertes Datenbank-Backend mit JSON-Dateien
DATA_DIR = os.path.join(os.path.dirname(os.path.dirname(os.path.abspath(__file__))), "data", "ecommerce")
os.makedirs(DATA_DIR, exist_ok=True)

PRODUCTS_FILE = os.path.join(DATA_DIR, "products.json")
CATEGORIES_FILE = os.path.join(DATA_DIR, "categories.json")
CARTS_FILE = os.path.join(DATA_DIR, "carts.json")
ORDERS_FILE = os.path.join(DATA_DIR, "orders.json")
ORDER_ITEMS_FILE = os.path.join(DATA_DIR, "order_items.json")
ADDRESSES_FILE = os.path.join(DATA_DIR, "addresses.json")
DISCOUNTS_FILE = os.path.join(DATA_DIR, "discounts.json")
REVIEWS_FILE = os.path.join(DATA_DIR, "reviews.json")

# Hilfsfunktionen für die Dateioperationen
def _load_data(file_path: str, default=None):
    if default is None:
        default = []
    if not os.path.exists(file_path):
        return default
    try:
        with open(file_path, 'r', encoding='utf-8') as f:
            return json.load(f)
    except Exception as e:
        logger.error(f"Fehler beim Laden der Daten aus {file_path}: {str(e)}")
        return default

def _save_data(file_path: str, data):
    try:
        with open(file_path, 'w', encoding='utf-8') as f:
            json.dump(data, f, ensure_ascii=False, indent=2)
        return True
    except Exception as e:
        logger.error(f"Fehler beim Speichern der Daten in {file_path}: {str(e)}")
        return False

def _get_next_id(data: List[Dict[str, Any]]) -> int:
    if not data:
        return 1
    return max(item.get('id', 0) for item in data) + 1


class ECommerceService:
    """Service-Klasse für E-Commerce-Funktionalitäten"""
    
    # Produkt-Operationen
    def get_products(self, skip: int = 0, limit: int = 100, category_id: Optional[int] = None, 
                    active_only: bool = True) -> List[Product]:
        """Gibt eine Liste von Produkten zurück, optional gefiltert nach Kategorie"""
        products = _load_data(PRODUCTS_FILE)
        
        # Filtern
        if active_only:
            products = [p for p in products if p.get('active', True)]
        if category_id is not None:
            products = [p for p in products if p.get('category_id') == category_id]
            
        # Paginierung
        paginated = products[skip:skip + limit]
        return [Product(**p) for p in paginated]
    
    def get_product(self, product_id: int) -> Optional[Product]:
        """Gibt ein einzelnes Produkt nach ID zurück"""
        products = _load_data(PRODUCTS_FILE)
        for product in products:
            if product.get('id') == product_id:
                return Product(**product)
        return None
    
    def create_product(self, product: Product) -> Product:
        """Erstellt ein neues Produkt"""
        products = _load_data(PRODUCTS_FILE)
        product_dict = product.dict()
        product_dict['id'] = _get_next_id(products)
        product_dict['created_at'] = datetime.now().isoformat()
        products.append(product_dict)
        _save_data(PRODUCTS_FILE, products)
        return Product(**product_dict)
    
    def update_product(self, product_id: int, product: Product) -> Optional[Product]:
        """Aktualisiert ein bestehendes Produkt"""
        products = _load_data(PRODUCTS_FILE)
        for i, p in enumerate(products):
            if p.get('id') == product_id:
                product_dict = product.dict(exclude_unset=True)
                product_dict['id'] = product_id
                product_dict['updated_at'] = datetime.now().isoformat()
                products[i].update(product_dict)
                _save_data(PRODUCTS_FILE, products)
                return Product(**products[i])
        return None
    
    def delete_product(self, product_id: int) -> bool:
        """Löscht ein Produkt (oder deaktiviert es)"""
        products = _load_data(PRODUCTS_FILE)
        for i, p in enumerate(products):
            if p.get('id') == product_id:
                # Statt zu löschen, deaktivieren
                products[i]['active'] = False
                products[i]['updated_at'] = datetime.now().isoformat()
                _save_data(PRODUCTS_FILE, products)
                return True
        return False
    
    # Kategorie-Operationen
    def get_categories(self, skip: int = 0, limit: int = 100, active_only: bool = True) -> List[ProductCategory]:
        """Gibt eine Liste von Produktkategorien zurück"""
        categories = _load_data(CATEGORIES_FILE)
        
        # Filtern
        if active_only:
            categories = [c for c in categories if c.get('active', True)]
            
        # Paginierung
        paginated = categories[skip:skip + limit]
        return [ProductCategory(**c) for c in paginated]
    
    def get_category(self, category_id: int) -> Optional[ProductCategory]:
        """Gibt eine einzelne Kategorie nach ID zurück"""
        categories = _load_data(CATEGORIES_FILE)
        for category in categories:
            if category.get('id') == category_id:
                return ProductCategory(**category)
        return None
    
    def create_category(self, category: ProductCategory) -> ProductCategory:
        """Erstellt eine neue Produktkategorie"""
        categories = _load_data(CATEGORIES_FILE)
        category_dict = category.dict()
        category_dict['id'] = _get_next_id(categories)
        category_dict['created_at'] = datetime.now().isoformat()
        categories.append(category_dict)
        _save_data(CATEGORIES_FILE, categories)
        return ProductCategory(**category_dict)
    
    def update_category(self, category_id: int, category: ProductCategory) -> Optional[ProductCategory]:
        """Aktualisiert eine bestehende Kategorie"""
        categories = _load_data(CATEGORIES_FILE)
        for i, c in enumerate(categories):
            if c.get('id') == category_id:
                category_dict = category.dict(exclude_unset=True)
                category_dict['id'] = category_id
                category_dict['updated_at'] = datetime.now().isoformat()
                categories[i].update(category_dict)
                _save_data(CATEGORIES_FILE, categories)
                return ProductCategory(**categories[i])
        return None
    
    def delete_category(self, category_id: int) -> bool:
        """Löscht eine Kategorie (oder deaktiviert sie)"""
        categories = _load_data(CATEGORIES_FILE)
        for i, c in enumerate(categories):
            if c.get('id') == category_id:
                # Statt zu löschen, deaktivieren
                categories[i]['active'] = False
                categories[i]['updated_at'] = datetime.now().isoformat()
                _save_data(CATEGORIES_FILE, categories)
                return True
        return False
    
    # Warenkorb-Operationen
    def get_cart(self, session_id: str) -> ShoppingCart:
        """Gibt den Warenkorb für eine Session zurück oder erstellt einen neuen"""
        carts = _load_data(CARTS_FILE)
        for cart in carts:
            if cart.get('session_id') == session_id:
                # Lade Warenkorb-Items
                cart_items = []
                for item in cart.get('items', []):
                    cart_items.append(CartItem(**item))
                cart['items'] = cart_items
                return ShoppingCart(**cart)
        
        # Erstelle neuen Warenkorb, wenn nicht gefunden
        new_cart = ShoppingCart(
            id=_get_next_id(carts),
            session_id=session_id,
            items=[]
        )
        cart_dict = new_cart.dict()
        cart_dict['created_at'] = datetime.now().isoformat()
        carts.append(cart_dict)
        _save_data(CARTS_FILE, carts)
        return new_cart
    
    def add_to_cart(self, session_id: str, product_id: int, quantity: int = 1) -> ShoppingCart:
        """Fügt ein Produkt zum Warenkorb hinzu"""
        # Prüfe, ob Produkt existiert
        product = self.get_product(product_id)
        if not product:
            raise ValueError(f"Produkt mit ID {product_id} nicht gefunden")
        
        # Hole oder erstelle Warenkorb
        cart = self.get_cart(session_id)
        carts = _load_data(CARTS_FILE)
        
        # Finde den Warenkorb in der Liste
        cart_index = -1
        for i, c in enumerate(carts):
            if c.get('session_id') == session_id:
                cart_index = i
                break
        
        if cart_index == -1:
            # Warenkorb existiert nicht, was seltsam ist, da get_cart einen erstellen sollte
            raise ValueError(f"Warenkorb für Session {session_id} konnte nicht gefunden werden")
        
        # Prüfe, ob das Produkt bereits im Warenkorb ist
        item_found = False
        for i, item in enumerate(cart.items):
            if item.product_id == product_id:
                # Update Menge
                item.quantity += quantity
                item.updated_at = datetime.now()
                item_found = True
                # Update in der JSON-Datei
                carts[cart_index]['items'][i] = item.dict()
                break
        
        if not item_found:
            # Neues Item erstellen
            new_item = CartItem(
                cart_id=cart.id,
                product_id=product_id,
                quantity=quantity,
                price=product.price
            )
            if 'items' not in carts[cart_index]:
                carts[cart_index]['items'] = []
            carts[cart_index]['items'].append(new_item.dict())
            cart.items.append(new_item)
        
        # Aktualisiere das Update-Datum
        carts[cart_index]['updated_at'] = datetime.now().isoformat()
        _save_data(CARTS_FILE, carts)
        
        return cart
    
    def remove_from_cart(self, session_id: str, product_id: int, quantity: Optional[int] = None) -> ShoppingCart:
        """Entfernt ein Produkt aus dem Warenkorb oder reduziert die Menge"""
        # Hole Warenkorb
        cart = self.get_cart(session_id)
        carts = _load_data(CARTS_FILE)
        
        # Finde den Warenkorb in der Liste
        cart_index = -1
        for i, c in enumerate(carts):
            if c.get('session_id') == session_id:
                cart_index = i
                break
        
        if cart_index == -1:
            raise ValueError(f"Warenkorb für Session {session_id} konnte nicht gefunden werden")
        
        # Finde das Produkt im Warenkorb
        items_to_remove = []
        for i, item in enumerate(cart.items):
            if item.product_id == product_id:
                if quantity is None or item.quantity <= quantity:
                    # Entferne das Item komplett
                    items_to_remove.append(i)
                else:
                    # Reduziere die Menge
                    item.quantity -= quantity
                    item.updated_at = datetime.now()
                    # Update in der JSON-Datei
                    carts[cart_index]['items'][i] = item.dict()
                break
        
        # Entferne Items
        for i in sorted(items_to_remove, reverse=True):
            del cart.items[i]
            if 'items' in carts[cart_index] and i < len(carts[cart_index]['items']):
                del carts[cart_index]['items'][i]
        
        # Aktualisiere das Update-Datum
        carts[cart_index]['updated_at'] = datetime.now().isoformat()
        _save_data(CARTS_FILE, carts)
        
        return cart
    
    def clear_cart(self, session_id: str) -> ShoppingCart:
        """Leert den Warenkorb komplett"""
        cart = self.get_cart(session_id)
        carts = _load_data(CARTS_FILE)
        
        # Finde den Warenkorb in der Liste
        for i, c in enumerate(carts):
            if c.get('session_id') == session_id:
                carts[i]['items'] = []
                carts[i]['updated_at'] = datetime.now().isoformat()
                _save_data(CARTS_FILE, carts)
                break
        
        cart.items = []
        return cart
    
    # Bestelloperationen
    def create_order(self, cart: ShoppingCart, customer_id: int, 
                    shipping_address_id: int, billing_address_id: int,
                    payment_method: str, shipping_method: str) -> Order:
        """Erstellt eine neue Bestellung aus einem Warenkorb"""
        # Prüfe, ob Warenkorb Produkte enthält
        if not cart.items:
            raise ValueError("Warenkorb ist leer")
        
        # Generiere Bestellnummer
        order_number = f"ORD-{datetime.now().strftime('%Y%m%d')}-{uuid.uuid4().hex[:6]}"
        
        # Berechne Gesamtbeträge
        subtotal = 0.0
        tax_amount = 0.0
        shipping_cost = 10.0  # Standardversandkosten
        
        # Lade aktuelle Produkte für Preise und Steuern
        order_items = []
        for cart_item in cart.items:
            product = self.get_product(cart_item.product_id)
            if not product:
                raise ValueError(f"Produkt mit ID {cart_item.product_id} nicht gefunden")
            
            item_price = product.price * cart_item.quantity
            item_tax = item_price * (product.tax_rate / 100)
            
            subtotal += item_price
            tax_amount += item_tax
            
            order_item = OrderItem(
                product_id=product.id,
                product_name=product.name,
                quantity=cart_item.quantity,
                unit_price=product.price,
                tax_rate=product.tax_rate,
                total_price=item_price + item_tax
            )
            order_items.append(order_item)
        
        total_amount = subtotal + tax_amount + shipping_cost
        
        # Erstelle die Bestellung
        order = Order(
            order_number=order_number,
            customer_id=customer_id,
            shipping_address_id=shipping_address_id,
            billing_address_id=billing_address_id,
            payment_method=payment_method,
            shipping_method=shipping_method,
            subtotal=subtotal,
            tax_amount=tax_amount,
            shipping_cost=shipping_cost,
            total_amount=total_amount
        )
        
        # Speichere die Bestellung
        orders = _load_data(ORDERS_FILE)
        order_dict = order.dict()
        order_dict['id'] = _get_next_id(orders)
        order_dict['created_at'] = datetime.now().isoformat()
        orders.append(order_dict)
        _save_data(ORDERS_FILE, orders)
        
        # Speichere die Bestellpositionen
        order_items_data = _load_data(ORDER_ITEMS_FILE)
        for item in order_items:
            item_dict = item.dict()
            item_dict['id'] = _get_next_id(order_items_data)
            item_dict['order_id'] = order_dict['id']
            item_dict['created_at'] = datetime.now().isoformat()
            order_items_data.append(item_dict)
        _save_data(ORDER_ITEMS_FILE, order_items_data)
        
        # Leere den Warenkorb
        self.clear_cart(cart.session_id)
        
        return Order(**order_dict)
    
    def get_orders(self, customer_id: int, skip: int = 0, limit: int = 100) -> List[Order]:
        """Gibt die Bestellungen eines Kunden zurück"""
        orders = _load_data(ORDERS_FILE)
        customer_orders = [o for o in orders if o.get('customer_id') == customer_id]
        
        # Paginierung
        paginated = customer_orders[skip:skip + limit]
        return [Order(**o) for o in paginated]
    
    def get_order(self, order_id: int) -> Optional[Order]:
        """Gibt eine einzelne Bestellung nach ID zurück"""
        orders = _load_data(ORDERS_FILE)
        for order in orders:
            if order.get('id') == order_id:
                return Order(**order)
        return None
    
    def get_order_items(self, order_id: int) -> List[OrderItem]:
        """Gibt die Positionen einer Bestellung zurück"""
        order_items = _load_data(ORDER_ITEMS_FILE)
        items = [i for i in order_items if i.get('order_id') == order_id]
        return [OrderItem(**i) for i in items]
    
    def update_order_status(self, order_id: int, status: str) -> Optional[Order]:
        """Aktualisiert den Status einer Bestellung"""
        orders = _load_data(ORDERS_FILE)
        for i, o in enumerate(orders):
            if o.get('id') == order_id:
                orders[i]['status'] = status
                orders[i]['updated_at'] = datetime.now().isoformat()
                _save_data(ORDERS_FILE, orders)
                return Order(**orders[i])
        return None
    
    # Adressverwaltung
    def get_addresses(self, customer_id: int) -> List[Address]:
        """Gibt die Adressen eines Kunden zurück"""
        addresses = _load_data(ADDRESSES_FILE)
        customer_addresses = [a for a in addresses if a.get('customer_id') == customer_id]
        return [Address(**a) for a in customer_addresses]
    
    def get_address(self, address_id: int) -> Optional[Address]:
        """Gibt eine einzelne Adresse nach ID zurück"""
        addresses = _load_data(ADDRESSES_FILE)
        for address in addresses:
            if address.get('id') == address_id:
                return Address(**address)
        return None
    
    def create_address(self, address: Address) -> Address:
        """Erstellt eine neue Adresse"""
        addresses = _load_data(ADDRESSES_FILE)
        
        # Prüfe, ob es eine Default-Adresse werden soll
        if address.is_default:
            # Setze alle anderen Adressen des Kunden auf nicht-default
            for i, a in enumerate(addresses):
                if a.get('customer_id') == address.customer_id and a.get('address_type') == address.address_type:
                    addresses[i]['is_default'] = False
        
        address_dict = address.dict()
        address_dict['id'] = _get_next_id(addresses)
        address_dict['created_at'] = datetime.now().isoformat()
        addresses.append(address_dict)
        _save_data(ADDRESSES_FILE, addresses)
        return Address(**address_dict)
    
    def update_address(self, address_id: int, address: Address) -> Optional[Address]:
        """Aktualisiert eine bestehende Adresse"""
        addresses = _load_data(ADDRESSES_FILE)
        
        # Finde die Adresse
        address_index = -1
        customer_id = None
        address_type = None
        
        for i, a in enumerate(addresses):
            if a.get('id') == address_id:
                address_index = i
                customer_id = a.get('customer_id')
                address_type = a.get('address_type')
                break
        
        if address_index == -1:
            return None
        
        # Aktualisiere die Adresse
        address_dict = address.dict(exclude_unset=True)
        address_dict['id'] = address_id
        address_dict['updated_at'] = datetime.now().isoformat()
        
        # Prüfe, ob es eine Default-Adresse werden soll
        if address_dict.get('is_default', False):
            # Setze alle anderen Adressen des Kunden auf nicht-default
            for i, a in enumerate(addresses):
                if i != address_index and a.get('customer_id') == customer_id and a.get('address_type') == address_type:
                    addresses[i]['is_default'] = False
        
        addresses[address_index].update(address_dict)
        _save_data(ADDRESSES_FILE, addresses)
        return Address(**addresses[address_index])
    
    def delete_address(self, address_id: int) -> bool:
        """Löscht eine Adresse"""
        addresses = _load_data(ADDRESSES_FILE)
        for i, a in enumerate(addresses):
            if a.get('id') == address_id:
                del addresses[i]
                _save_data(ADDRESSES_FILE, addresses)
                return True
        return False
    
    # Rabattverwaltung
    def get_discounts(self, active_only: bool = True) -> List[Discount]:
        """Gibt eine Liste von Rabatten zurück"""
        discounts = _load_data(DISCOUNTS_FILE)
        
        # Filtern
        if active_only:
            now = datetime.now()
            discounts = [
                d for d in discounts 
                if d.get('active', True) and 
                datetime.fromisoformat(d.get('valid_from')) <= now and
                (d.get('valid_to') is None or datetime.fromisoformat(d.get('valid_to')) >= now)
            ]
            
        return [Discount(**d) for d in discounts]
    
    def get_discount(self, discount_id: int) -> Optional[Discount]:
        """Gibt einen einzelnen Rabatt nach ID zurück"""
        discounts = _load_data(DISCOUNTS_FILE)
        for discount in discounts:
            if discount.get('id') == discount_id:
                return Discount(**discount)
        return None
    
    def get_discount_by_code(self, code: str) -> Optional[Discount]:
        """Gibt einen Rabatt nach Code zurück"""
        discounts = _load_data(DISCOUNTS_FILE)
        for discount in discounts:
            if discount.get('code').lower() == code.lower():
                return Discount(**discount)
        return None
    
    def create_discount(self, discount: Discount) -> Discount:
        """Erstellt einen neuen Rabatt"""
        discounts = _load_data(DISCOUNTS_FILE)
        discount_dict = discount.dict()
        discount_dict['id'] = _get_next_id(discounts)
        discount_dict['created_at'] = datetime.now().isoformat()
        discounts.append(discount_dict)
        _save_data(DISCOUNTS_FILE, discounts)
        return Discount(**discount_dict)
    
    def update_discount(self, discount_id: int, discount: Discount) -> Optional[Discount]:
        """Aktualisiert einen bestehenden Rabatt"""
        discounts = _load_data(DISCOUNTS_FILE)
        for i, d in enumerate(discounts):
            if d.get('id') == discount_id:
                discount_dict = discount.dict(exclude_unset=True)
                discount_dict['id'] = discount_id
                discount_dict['updated_at'] = datetime.now().isoformat()
                discounts[i].update(discount_dict)
                _save_data(DISCOUNTS_FILE, discounts)
                return Discount(**discounts[i])
        return None
    
    def delete_discount(self, discount_id: int) -> bool:
        """Löscht einen Rabatt (oder deaktiviert ihn)"""
        discounts = _load_data(DISCOUNTS_FILE)
        for i, d in enumerate(discounts):
            if d.get('id') == discount_id:
                # Statt zu löschen, deaktivieren
                discounts[i]['active'] = False
                discounts[i]['updated_at'] = datetime.now().isoformat()
                _save_data(DISCOUNTS_FILE, discounts)
                return True
        return False
    
    def apply_discount_to_cart(self, session_id: str, discount_code: str) -> ShoppingCart:
        """Wendet einen Rabattcode auf einen Warenkorb an"""
        # Hier würde die Implementierung folgen, abhängig von der Integration
        # mit dem Warenkorb-System
        pass
    
    # Bewertungen
    def get_product_reviews(self, product_id: int, skip: int = 0, limit: int = 100,
                          approved_only: bool = True) -> List[Review]:
        """Gibt die Bewertungen für ein Produkt zurück"""
        reviews = _load_data(REVIEWS_FILE)
        
        # Filtern
        product_reviews = [r for r in reviews if r.get('product_id') == product_id]
        if approved_only:
            product_reviews = [r for r in product_reviews if r.get('is_approved', False)]
            
        # Paginierung
        paginated = product_reviews[skip:skip + limit]
        return [Review(**r) for r in paginated]
    
    def create_review(self, review: Review) -> Review:
        """Erstellt eine neue Produktbewertung"""
        reviews = _load_data(REVIEWS_FILE)
        review_dict = review.dict()
        review_dict['id'] = _get_next_id(reviews)
        review_dict['created_at'] = datetime.now().isoformat()
        reviews.append(review_dict)
        _save_data(REVIEWS_FILE, reviews)
        return Review(**review_dict)
    
    def approve_review(self, review_id: int) -> Optional[Review]:
        """Genehmigt eine Bewertung"""
        reviews = _load_data(REVIEWS_FILE)
        for i, r in enumerate(reviews):
            if r.get('id') == review_id:
                reviews[i]['is_approved'] = True
                reviews[i]['updated_at'] = datetime.now().isoformat()
                _save_data(REVIEWS_FILE, reviews)
                return Review(**reviews[i])
        return None
    
    def delete_review(self, review_id: int) -> bool:
        """Löscht eine Bewertung"""
        reviews = _load_data(REVIEWS_FILE)
        for i, r in enumerate(reviews):
            if r.get('id') == review_id:
                del reviews[i]
                _save_data(REVIEWS_FILE, reviews)
                return True
        return False

router = APIRouter()

@router.get("/health", summary="Health-Check", tags=["System"])
def health_check():
    return {"status": "ok", "details": {}}

@router.get("/metrics", summary="Prometheus-Metriken", tags=["Monitoring"])
def metrics():
    data = prometheus_client.generate_latest()
    return PlainTextResponse(data, media_type="text/plain") 