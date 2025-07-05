from typing import List, Optional
from fastapi import APIRouter, Depends, HTTPException, Cookie, Response, Query
from starlette.status import HTTP_201_CREATED, HTTP_404_NOT_FOUND
import uuid

from models.ecommerce import (
    Product, ProductCategory, CartItem, ShoppingCart, 
    Order, OrderItem, Address, Discount, Review
)
from services.ecommerce_service import ECommerceService

router = APIRouter()
ecommerce_service = ECommerceService()

# Session-Management-Hilfsfunktionen
def get_session_id(session_id: Optional[str] = Cookie(None)) -> str:
    """Gibt die Session-ID zurück oder generiert eine neue"""
    if not session_id:
        return str(uuid.uuid4())
    return session_id

def set_session_cookie(response: Response, session_id: str) -> None:
    """Setzt ein Session-Cookie"""
    response.set_cookie(
        key="session_id",
        value=session_id,
        max_age=3600 * 24 * 30,  # 30 Tage
        httponly=True,
        samesite="lax"
    )

# Produkt-Routen
@router.get("/produkte", response_model=List[Product], tags=["Produkte"])
async def get_products(
    skip: int = 0, 
    limit: int = 100,
    category_id: Optional[int] = None,
    active_only: bool = True
):
    """Produkte auflisten, optional nach Kategorie filtern"""
    return ecommerce_service.get_products(skip, limit, category_id, active_only)

@router.get("/produkte/{product_id}", response_model=Product, tags=["Produkte"])
async def get_product(product_id: int):
    """Ein bestimmtes Produkt abrufen"""
    product = ecommerce_service.get_product(product_id)
    if not product:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Produkt nicht gefunden")
    return product

@router.post("/produkte", response_model=Product, status_code=HTTP_201_CREATED, tags=["Produkte"])
async def create_product(product: Product):
    """Ein neues Produkt erstellen"""
    return ecommerce_service.create_product(product)

@router.put("/produkte/{product_id}", response_model=Product, tags=["Produkte"])
async def update_product(product_id: int, product: Product):
    """Ein Produkt aktualisieren"""
    updated_product = ecommerce_service.update_product(product_id, product)
    if not updated_product:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Produkt nicht gefunden")
    return updated_product

@router.delete("/produkte/{product_id}", tags=["Produkte"])
async def delete_product(product_id: int):
    """Ein Produkt löschen (deaktivieren)"""
    success = ecommerce_service.delete_product(product_id)
    if not success:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Produkt nicht gefunden")
    return {"status": "success", "message": "Produkt wurde deaktiviert"}

# Kategorie-Routen
@router.get("/kategorien", response_model=List[ProductCategory], tags=["Kategorien"])
async def get_categories(skip: int = 0, limit: int = 100, active_only: bool = True):
    """Produktkategorien auflisten"""
    return ecommerce_service.get_categories(skip, limit, active_only)

@router.get("/kategorien/{category_id}", response_model=ProductCategory, tags=["Kategorien"])
async def get_category(category_id: int):
    """Eine bestimmte Kategorie abrufen"""
    category = ecommerce_service.get_category(category_id)
    if not category:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Kategorie nicht gefunden")
    return category

@router.post("/kategorien", response_model=ProductCategory, status_code=HTTP_201_CREATED, tags=["Kategorien"])
async def create_category(category: ProductCategory):
    """Eine neue Kategorie erstellen"""
    return ecommerce_service.create_category(category)

@router.put("/kategorien/{category_id}", response_model=ProductCategory, tags=["Kategorien"])
async def update_category(category_id: int, category: ProductCategory):
    """Eine Kategorie aktualisieren"""
    updated_category = ecommerce_service.update_category(category_id, category)
    if not updated_category:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Kategorie nicht gefunden")
    return updated_category

@router.delete("/kategorien/{category_id}", tags=["Kategorien"])
async def delete_category(category_id: int):
    """Eine Kategorie löschen (deaktivieren)"""
    success = ecommerce_service.delete_category(category_id)
    if not success:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Kategorie nicht gefunden")
    return {"status": "success", "message": "Kategorie wurde deaktiviert"}

# Warenkorb-Routen
@router.get("/warenkorb", response_model=ShoppingCart, tags=["Warenkorb"])
async def get_cart(
    response: Response,
    session_id: str = Depends(get_session_id)
):
    """Den aktuellen Warenkorb abrufen"""
    cart = ecommerce_service.get_cart(session_id)
    set_session_cookie(response, session_id)
    return cart

@router.post("/warenkorb/items", response_model=ShoppingCart, tags=["Warenkorb"])
async def add_to_cart(
    product_id: int,
    quantity: int = 1,
    response: Response = None,
    session_id: str = Depends(get_session_id)
):
    """Ein Produkt zum Warenkorb hinzufügen"""
    try:
        cart = ecommerce_service.add_to_cart(session_id, product_id, quantity)
        if response:
            set_session_cookie(response, session_id)
        return cart
    except ValueError as e:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail=str(e))

@router.delete("/warenkorb/items/{product_id}", response_model=ShoppingCart, tags=["Warenkorb"])
async def remove_from_cart(
    product_id: int,
    quantity: Optional[int] = None,
    response: Response = None,
    session_id: str = Depends(get_session_id)
):
    """Ein Produkt aus dem Warenkorb entfernen"""
    try:
        cart = ecommerce_service.remove_from_cart(session_id, product_id, quantity)
        if response:
            set_session_cookie(response, session_id)
        return cart
    except ValueError as e:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail=str(e))

@router.delete("/warenkorb", response_model=ShoppingCart, tags=["Warenkorb"])
async def clear_cart(
    response: Response,
    session_id: str = Depends(get_session_id)
):
    """Den Warenkorb leeren"""
    cart = ecommerce_service.clear_cart(session_id)
    set_session_cookie(response, session_id)
    return cart

# Bestellrouten
@router.post("/bestellungen", response_model=Order, status_code=HTTP_201_CREATED, tags=["Bestellungen"])
async def create_order(
    customer_id: int, 
    shipping_address_id: int, 
    billing_address_id: int,
    payment_method: str, 
    shipping_method: str,
    response: Response,
    session_id: str = Depends(get_session_id)
):
    """Eine neue Bestellung erstellen"""
    try:
        cart = ecommerce_service.get_cart(session_id)
        order = ecommerce_service.create_order(
            cart, 
            customer_id, 
            shipping_address_id, 
            billing_address_id,
            payment_method, 
            shipping_method
        )
        set_session_cookie(response, session_id)
        return order
    except ValueError as e:
        raise HTTPException(status_code=400, detail=str(e))

@router.get("/bestellungen", response_model=List[Order], tags=["Bestellungen"])
async def get_orders(
    customer_id: int, 
    skip: int = 0, 
    limit: int = 100
):
    """Bestellungen eines Kunden abrufen"""
    return ecommerce_service.get_orders(customer_id, skip, limit)

@router.get("/bestellungen/{order_id}", response_model=Order, tags=["Bestellungen"])
async def get_order(order_id: int):
    """Eine bestimmte Bestellung abrufen"""
    order = ecommerce_service.get_order(order_id)
    if not order:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Bestellung nicht gefunden")
    return order

@router.get("/bestellungen/{order_id}/items", response_model=List[OrderItem], tags=["Bestellungen"])
async def get_order_items(order_id: int):
    """Die Positionen einer Bestellung abrufen"""
    return ecommerce_service.get_order_items(order_id)

@router.put("/bestellungen/{order_id}/status", response_model=Order, tags=["Bestellungen"])
async def update_order_status(order_id: int, status: str):
    """Den Status einer Bestellung aktualisieren"""
    updated_order = ecommerce_service.update_order_status(order_id, status)
    if not updated_order:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Bestellung nicht gefunden")
    return updated_order

# Adress-Routen
@router.get("/adressen", response_model=List[Address], tags=["Adressen"])
async def get_addresses(customer_id: int):
    """Die Adressen eines Kunden abrufen"""
    return ecommerce_service.get_addresses(customer_id)

@router.get("/adressen/{address_id}", response_model=Address, tags=["Adressen"])
async def get_address(address_id: int):
    """Eine bestimmte Adresse abrufen"""
    address = ecommerce_service.get_address(address_id)
    if not address:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Adresse nicht gefunden")
    return address

@router.post("/adressen", response_model=Address, status_code=HTTP_201_CREATED, tags=["Adressen"])
async def create_address(address: Address):
    """Eine neue Adresse erstellen"""
    return ecommerce_service.create_address(address)

@router.put("/adressen/{address_id}", response_model=Address, tags=["Adressen"])
async def update_address(address_id: int, address: Address):
    """Eine Adresse aktualisieren"""
    updated_address = ecommerce_service.update_address(address_id, address)
    if not updated_address:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Adresse nicht gefunden")
    return updated_address

@router.delete("/adressen/{address_id}", tags=["Adressen"])
async def delete_address(address_id: int):
    """Eine Adresse löschen"""
    success = ecommerce_service.delete_address(address_id)
    if not success:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Adresse nicht gefunden")
    return {"status": "success", "message": "Adresse wurde gelöscht"}

# Rabatt-Routen
@router.get("/rabatte", response_model=List[Discount], tags=["Rabatte"])
async def get_discounts(active_only: bool = True):
    """Rabatte auflisten"""
    return ecommerce_service.get_discounts(active_only)

@router.get("/rabatte/{discount_id}", response_model=Discount, tags=["Rabatte"])
async def get_discount(discount_id: int):
    """Einen bestimmten Rabatt abrufen"""
    discount = ecommerce_service.get_discount(discount_id)
    if not discount:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Rabatt nicht gefunden")
    return discount

@router.get("/rabatte/code/{code}", response_model=Discount, tags=["Rabatte"])
async def get_discount_by_code(code: str):
    """Einen Rabatt nach Code abrufen"""
    discount = ecommerce_service.get_discount_by_code(code)
    if not discount:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Rabatt nicht gefunden")
    return discount

@router.post("/rabatte", response_model=Discount, status_code=HTTP_201_CREATED, tags=["Rabatte"])
async def create_discount(discount: Discount):
    """Einen neuen Rabatt erstellen"""
    return ecommerce_service.create_discount(discount)

@router.put("/rabatte/{discount_id}", response_model=Discount, tags=["Rabatte"])
async def update_discount(discount_id: int, discount: Discount):
    """Einen Rabatt aktualisieren"""
    updated_discount = ecommerce_service.update_discount(discount_id, discount)
    if not updated_discount:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Rabatt nicht gefunden")
    return updated_discount

@router.delete("/rabatte/{discount_id}", tags=["Rabatte"])
async def delete_discount(discount_id: int):
    """Einen Rabatt löschen (deaktivieren)"""
    success = ecommerce_service.delete_discount(discount_id)
    if not success:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Rabatt nicht gefunden")
    return {"status": "success", "message": "Rabatt wurde deaktiviert"}

# Bewertungs-Routen
@router.get("/produkte/{product_id}/bewertungen", response_model=List[Review], tags=["Bewertungen"])
async def get_product_reviews(
    product_id: int, 
    skip: int = 0, 
    limit: int = 100,
    approved_only: bool = True
):
    """Bewertungen für ein Produkt abrufen"""
    return ecommerce_service.get_product_reviews(product_id, skip, limit, approved_only)

@router.post("/bewertungen", response_model=Review, status_code=HTTP_201_CREATED, tags=["Bewertungen"])
async def create_review(review: Review):
    """Eine neue Produktbewertung erstellen"""
    return ecommerce_service.create_review(review)

@router.put("/bewertungen/{review_id}/approve", response_model=Review, tags=["Bewertungen"])
async def approve_review(review_id: int):
    """Eine Bewertung genehmigen"""
    approved_review = ecommerce_service.approve_review(review_id)
    if not approved_review:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Bewertung nicht gefunden")
    return approved_review

@router.delete("/bewertungen/{review_id}", tags=["Bewertungen"])
async def delete_review(review_id: int):
    """Eine Bewertung löschen"""
    success = ecommerce_service.delete_review(review_id)
    if not success:
        raise HTTPException(status_code=HTTP_404_NOT_FOUND, detail="Bewertung nicht gefunden")
    return {"status": "success", "message": "Bewertung wurde gelöscht"} 