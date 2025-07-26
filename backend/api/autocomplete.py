"""
🧠 FastAPI Autocomplete API
KI-first Autocomplete mit PostgreSQL-Integration für Stammdaten
Typeahead, Fuzzy Matching und intelligente Vorschläge
"""

from fastapi import FastAPI, HTTPException, Query, Depends
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import asyncpg
import asyncio
import logging
from datetime import datetime
import re

# Logging konfigurieren
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# FastAPI App
app = FastAPI(
    title="VALEO NeuroERP Autocomplete API",
    description="KI-first Autocomplete mit PostgreSQL-Integration",
    version="1.0.0"
)

# CORS konfigurieren
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Pydantic Models
class AutocompleteOption(BaseModel):
    id: str
    value: str
    label: str
    type: str
    category: Optional[str] = None
    subcategory: Optional[str] = None
    metadata: Optional[Dict[str, Any]] = None
    score: Optional[float] = None
    isExact: Optional[bool] = None
    isFuzzy: Optional[bool] = None

class AutocompleteResponse(BaseModel):
    results: List[AutocompleteOption]
    total: int
    query: str
    type: str
    execution_time_ms: float

# Database Configuration
DATABASE_CONFIG = {
    "host": "localhost",
    "port": 5432,
    "user": "n8n",
    "password": "n8n_password",
    "database": "n8n"
}

# Database connection pool
async def get_db_pool():
    """Database connection pool erstellen"""
    return await asyncpg.create_pool(**DATABASE_CONFIG)

# Fuzzy Search Implementation
def fuzzy_search(query: str, text: str) -> float:
    """Fuzzy Search Algorithm"""
    query_lower = query.lower()
    text_lower = text.lower()
    
    if query_lower in text_lower:
        return 1.0  # Exact match
    
    # Simple fuzzy matching
    score = 0
    query_index = 0
    
    for i in range(len(text_lower)):
        if query_index < len(query_lower) and text_lower[i] == query_lower[query_index]:
            score += 1
            query_index += 1
    
    return score / len(query_lower) if len(query_lower) > 0 else 0

# Search Queries für verschiedene Stammdaten
SEARCH_QUERIES = {
    "customer": """
        SELECT 
            customer_number as id,
            customer_number as value,
            CONCAT(customer_number, ' - ', COALESCE(company_name, first_name, 'Unbekannt')) as label,
            'customer' as type,
            customer_type as category,
            industry as subcategory,
            json_build_object(
                'email', email,
                'phone', phone,
                'city', city,
                'country', country,
                'status', status
            ) as metadata
        FROM customers 
        WHERE 
            customer_number ILIKE $1 OR 
            company_name ILIKE $1 OR 
            first_name ILIKE $1 OR 
            last_name ILIKE $1 OR
            email ILIKE $1
        ORDER BY 
            CASE WHEN customer_number ILIKE $1 THEN 1 ELSE 0 END DESC,
            CASE WHEN company_name ILIKE $1 THEN 1 ELSE 0 END DESC,
            company_name
        LIMIT $2
    """,
    
    "supplier": """
        SELECT 
            supplier_number as id,
            supplier_number as value,
            CONCAT(supplier_number, ' - ', company_name) as label,
            'supplier' as type,
            industry as category,
            supplier_type as subcategory,
            json_build_object(
                'email', email,
                'phone', phone,
                'city', city,
                'country', country,
                'status', status,
                'rating', rating
            ) as metadata
        FROM suppliers 
        WHERE 
            supplier_number ILIKE $1 OR 
            company_name ILIKE $1 OR 
            industry ILIKE $1 OR
            contact_person ILIKE $1
        ORDER BY 
            CASE WHEN supplier_number ILIKE $1 THEN 1 ELSE 0 END DESC,
            CASE WHEN company_name ILIKE $1 THEN 1 ELSE 0 END DESC,
            company_name
        LIMIT $2
    """,
    
    "article": """
        SELECT 
            article_number as id,
            article_number as value,
            CONCAT(article_number, ' - ', article_name) as label,
            'article' as type,
            category as category,
            subcategory as subcategory,
            json_build_object(
                'description', description,
                'unit', unit,
                'price', price,
                'stock', stock,
                'supplier', supplier_name
            ) as metadata
        FROM articles 
        WHERE 
            article_number ILIKE $1 OR 
            article_name ILIKE $1 OR 
            category ILIKE $1 OR
            description ILIKE $1
        ORDER BY 
            CASE WHEN article_number ILIKE $1 THEN 1 ELSE 0 END DESC,
            CASE WHEN article_name ILIKE $1 THEN 1 ELSE 0 END DESC,
            article_name
        LIMIT $2
    """,
    
    "personnel": """
        SELECT 
            employee_number as id,
            employee_number as value,
            CONCAT(employee_number, ' - ', first_name, ' ', last_name) as label,
            'personnel' as type,
            department as category,
            position as subcategory,
            json_build_object(
                'email', email,
                'phone', phone,
                'hire_date', hire_date,
                'status', status
            ) as metadata
        FROM personnel 
        WHERE 
            employee_number ILIKE $1 OR 
            first_name ILIKE $1 OR 
            last_name ILIKE $1 OR
            department ILIKE $1
        ORDER BY 
            CASE WHEN employee_number ILIKE $1 THEN 1 ELSE 0 END DESC,
            CASE WHEN first_name ILIKE $1 THEN 1 ELSE 0 END DESC,
            last_name, first_name
        LIMIT $2
    """,
    
    "charge": """
        SELECT 
            charge_number as id,
            charge_number as value,
            CONCAT(charge_number, ' - ', article_name, ' (', supplier_name, ')') as label,
            'charge' as type,
            quality_status as category,
            vlog_gmo_status as subcategory,
            json_build_object(
                'article_number', article_number,
                'supplier_number', supplier_number,
                'production_date', production_date,
                'expiry_date', expiry_date,
                'batch_size', batch_size,
                'unit', unit
            ) as metadata
        FROM charges 
        WHERE 
            charge_number ILIKE $1 OR 
            article_name ILIKE $1 OR 
            supplier_name ILIKE $1 OR
            article_number ILIKE $1
        ORDER BY 
            CASE WHEN charge_number ILIKE $1 THEN 1 ELSE 0 END DESC,
            CASE WHEN article_name ILIKE $1 THEN 1 ELSE 0 END DESC,
            production_date DESC
        LIMIT $2
    """,
    
    "location": """
        SELECT 
            location_id as id,
            location_code as value,
            CONCAT(location_code, ' - ', location_name) as label,
            'location' as type,
            location_type as category,
            region as subcategory,
            json_build_object(
                'address', address,
                'city', city,
                'country', country,
                'capacity', capacity
            ) as metadata
        FROM locations 
        WHERE 
            location_code ILIKE $1 OR 
            location_name ILIKE $1 OR 
            city ILIKE $1 OR
            region ILIKE $1
        ORDER BY 
            CASE WHEN location_code ILIKE $1 THEN 1 ELSE 0 END DESC,
            CASE WHEN location_name ILIKE $1 THEN 1 ELSE 0 END DESC,
            location_name
        LIMIT $2
    """,
    
    "bank": """
        SELECT 
            bank_id as id,
            bank_code as value,
            CONCAT(bank_code, ' - ', bank_name) as label,
            'bank' as type,
            bank_type as category,
            country as subcategory,
            json_build_object(
                'bic', bic,
                'address', address,
                'city', city,
                'country', country
            ) as metadata
        FROM banks 
        WHERE 
            bank_code ILIKE $1 OR 
            bank_name ILIKE $1 OR 
            bic ILIKE $1 OR
            city ILIKE $1
        ORDER BY 
            CASE WHEN bank_code ILIKE $1 THEN 1 ELSE 0 END DESC,
            CASE WHEN bank_name ILIKE $1 THEN 1 ELSE 0 END DESC,
            bank_name
        LIMIT $2
    """
}

# Mock Data für Entwicklung (falls keine Datenbank verfügbar)
MOCK_DATA = {
    "customer": [
        {
            "id": "K001",
            "value": "K001",
            "label": "K001 - Jochen Weerda",
            "type": "customer",
            "category": "Privatkunde",
            "subcategory": "Landwirt",
            "metadata": {
                "email": "jochen.weerda@example.com",
                "phone": "+49 123 456789",
                "city": "Hamburg",
                "country": "Deutschland",
                "status": "active"
            }
        },
        {
            "id": "K002",
            "value": "K002",
            "label": "K002 - Joachim Neumann",
            "type": "customer",
            "category": "Geschäftskunde",
            "subcategory": "Tierarzt",
            "metadata": {
                "email": "joachim.neumann@example.com",
                "phone": "+49 987 654321",
                "city": "Berlin",
                "country": "Deutschland",
                "status": "active"
            }
        },
        {
            "id": "K003",
            "value": "K003",
            "label": "K003 - Jordan GmbH",
            "type": "customer",
            "category": "Geschäftskunde",
            "subcategory": "Futtermittelhandel",
            "metadata": {
                "email": "info@jordan-gmbh.de",
                "phone": "+49 555 123456",
                "city": "München",
                "country": "Deutschland",
                "status": "active"
            }
        }
    ],
    
    "supplier": [
        {
            "id": "L001",
            "value": "L001",
            "label": "L001 - Agrarhandel GmbH",
            "type": "supplier",
            "category": "Landhandel",
            "subcategory": "Hauptlieferant",
            "metadata": {
                "email": "info@agrarhandel.de",
                "phone": "+49 40 123456",
                "city": "Hamburg",
                "country": "Deutschland",
                "status": "active",
                "rating": 4.5
            }
        },
        {
            "id": "L002",
            "value": "L002",
            "label": "L002 - Futtermittel AG",
            "type": "supplier",
            "category": "Futtermittel",
            "subcategory": "Nebenlieferant",
            "metadata": {
                "email": "kontakt@futtermittel-ag.de",
                "phone": "+49 30 654321",
                "city": "Berlin",
                "country": "Deutschland",
                "status": "active",
                "rating": 4.2
            }
        },
        {
            "id": "L003",
            "value": "L003",
            "label": "L003 - Dünger & Co KG",
            "type": "supplier",
            "category": "Düngemittel",
            "subcategory": "Notfalllieferant",
            "metadata": {
                "email": "info@duenger-co.de",
                "phone": "+49 89 789123",
                "city": "München",
                "country": "Deutschland",
                "status": "active",
                "rating": 3.8
            }
        }
    ],
    
    "article": [
        {
            "id": "ART001",
            "value": "ART001",
            "label": "ART001 - Sojaschrot Premium",
            "type": "article",
            "category": "Futtermittel",
            "subcategory": "Proteinfuttermittel",
            "metadata": {
                "description": "Hochwertiges Sojaschrot für die Tierernährung",
                "unit": "kg",
                "price": 0.85,
                "stock": 5000,
                "supplier": "Agrarhandel GmbH"
            }
        },
        {
            "id": "ART002",
            "value": "ART002",
            "label": "ART002 - Weizenkleie",
            "type": "article",
            "category": "Futtermittel",
            "subcategory": "Nebenprodukt",
            "metadata": {
                "description": "Weizenkleie für die Fütterung",
                "unit": "kg",
                "price": 0.35,
                "stock": 8000,
                "supplier": "Futtermittel AG"
            }
        },
        {
            "id": "ART003",
            "value": "ART003",
            "label": "ART003 - Maiskleber",
            "type": "article",
            "category": "Futtermittel",
            "subcategory": "Proteinfuttermittel",
            "metadata": {
                "description": "Maiskleber für die Tierernährung",
                "unit": "kg",
                "price": 1.20,
                "stock": 3000,
                "supplier": "Dünger & Co KG"
            }
        }
    ],
    
    "personnel": [
        {
            "id": "M001",
            "value": "M001",
            "label": "M001 - Max Mustermann",
            "type": "personnel",
            "category": "Vertrieb",
            "subcategory": "Vertriebsleiter",
            "metadata": {
                "email": "max.mustermann@valeo.de",
                "phone": "+49 40 111111",
                "hire_date": "2020-01-15",
                "status": "active"
            }
        },
        {
            "id": "M002",
            "value": "M002",
            "label": "M002 - Maria Schmidt",
            "type": "personnel",
            "category": "Buchhaltung",
            "subcategory": "Buchhalterin",
            "metadata": {
                "email": "maria.schmidt@valeo.de",
                "phone": "+49 40 222222",
                "hire_date": "2019-03-01",
                "status": "active"
            }
        }
    ],
    
    "charge": [
        {
            "id": "CH20240701001",
            "value": "CH20240701001",
            "label": "CH20240701001 - Sojaschrot Premium (Agrarhandel GmbH)",
            "type": "charge",
            "category": "approved",
            "subcategory": "VLOG",
            "metadata": {
                "article_number": "ART001",
                "supplier_number": "L001",
                "production_date": "2024-07-01",
                "expiry_date": "2025-07-01",
                "batch_size": 5000,
                "unit": "kg"
            }
        },
        {
            "id": "CH20240702001",
            "value": "CH20240702001",
            "label": "CH20240702001 - Weizenkleie (Futtermittel AG)",
            "type": "charge",
            "category": "pending",
            "subcategory": "VLOG",
            "metadata": {
                "article_number": "ART002",
                "supplier_number": "L002",
                "production_date": "2024-07-02",
                "expiry_date": "2025-01-02",
                "batch_size": 8000,
                "unit": "kg"
            }
        }
    ]
}

# API Endpoints
@app.get("/api/search", response_model=AutocompleteResponse)
async def search_autocomplete(
    q: str = Query(..., description="Suchbegriff"),
    type: str = Query(..., description="Typ der Stammdaten"),
    limit: int = Query(10, description="Maximale Anzahl Ergebnisse"),
    use_mock: bool = Query(False, description="Mock-Daten verwenden")
):
    """Allgemeine Autocomplete-Suche"""
    start_time = datetime.now()
    
    try:
        if use_mock or type not in SEARCH_QUERIES:
            # Mock-Daten verwenden
            mock_data = MOCK_DATA.get(type, [])
            results = []
            
            for item in mock_data:
                score = fuzzy_search(q, item["label"])
                if score > 0.3:  # Mindest-Score
                    results.append(AutocompleteOption(
                        **item,
                        score=score,
                        isExact=item["label"].lower().includes(q.lower()),
                        isFuzzy=not item["label"].lower().includes(q.lower()) and score > 0.5
                    ))
            
            # Sortieren nach Relevanz
            results.sort(key=lambda x: (x.isExact, x.score), reverse=True)
            results = results[:limit]
            
        else:
            # Echte Datenbank-Abfrage
            pool = await get_db_pool()
            async with pool.acquire() as conn:
                query = SEARCH_QUERIES[type]
                search_pattern = f"%{q}%"
                
                rows = await conn.fetch(query, search_pattern, limit)
                results = []
                
                for row in rows:
                    score = fuzzy_search(q, row["label"])
                    if score > 0.3:
                        results.append(AutocompleteOption(
                            id=row["id"],
                            value=row["value"],
                            label=row["label"],
                            type=row["type"],
                            category=row["category"],
                            subcategory=row["subcategory"],
                            metadata=row["metadata"],
                            score=score,
                            isExact=row["label"].lower().includes(q.lower()),
                            isFuzzy=not row["label"].lower().includes(q.lower()) and score > 0.5
                        ))
                
                # Sortieren nach Relevanz
                results.sort(key=lambda x: (x.isExact, x.score), reverse=True)
        
        execution_time = (datetime.now() - start_time).total_seconds() * 1000
        
        return AutocompleteResponse(
            results=results,
            total=len(results),
            query=q,
            type=type,
            execution_time_ms=execution_time
        )
        
    except Exception as e:
        logger.error(f"Autocomplete search error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/customers/search", response_model=AutocompleteResponse)
async def search_customers(
    q: str = Query(..., description="Kunden-Suchbegriff"),
    limit: int = Query(10, description="Maximale Anzahl Ergebnisse"),
    use_mock: bool = Query(False, description="Mock-Daten verwenden")
):
    """Kunden-Autocomplete-Suche"""
    return await search_autocomplete(q=q, type="customer", limit=limit, use_mock=use_mock)

@app.get("/api/suppliers/search", response_model=AutocompleteResponse)
async def search_suppliers(
    q: str = Query(..., description="Lieferanten-Suchbegriff"),
    limit: int = Query(10, description="Maximale Anzahl Ergebnisse"),
    use_mock: bool = Query(False, description="Mock-Daten verwenden")
):
    """Lieferanten-Autocomplete-Suche"""
    return await search_autocomplete(q=q, type="supplier", limit=limit, use_mock=use_mock)

@app.get("/api/articles/search", response_model=AutocompleteResponse)
async def search_articles(
    q: str = Query(..., description="Artikel-Suchbegriff"),
    limit: int = Query(10, description="Maximale Anzahl Ergebnisse"),
    use_mock: bool = Query(False, description="Mock-Daten verwenden")
):
    """Artikel-Autocomplete-Suche"""
    return await search_autocomplete(q=q, type="article", limit=limit, use_mock=use_mock)

@app.get("/api/personnel/search", response_model=AutocompleteResponse)
async def search_personnel(
    q: str = Query(..., description="Personal-Suchbegriff"),
    limit: int = Query(10, description="Maximale Anzahl Ergebnisse"),
    use_mock: bool = Query(False, description="Mock-Daten verwenden")
):
    """Personal-Autocomplete-Suche"""
    return await search_autocomplete(q=q, type="personnel", limit=limit, use_mock=use_mock)

@app.get("/api/charges/search", response_model=AutocompleteResponse)
async def search_charges(
    q: str = Query(..., description="Chargen-Suchbegriff"),
    limit: int = Query(10, description="Maximale Anzahl Ergebnisse"),
    use_mock: bool = Query(False, description="Mock-Daten verwenden")
):
    """Chargen-Autocomplete-Suche"""
    return await search_autocomplete(q=q, type="charge", limit=limit, use_mock=use_mock)

@app.get("/api/locations/search", response_model=AutocompleteResponse)
async def search_locations(
    q: str = Query(..., description="Standort-Suchbegriff"),
    limit: int = Query(10, description="Maximale Anzahl Ergebnisse"),
    use_mock: bool = Query(False, description="Mock-Daten verwenden")
):
    """Standort-Autocomplete-Suche"""
    return await search_autocomplete(q=q, type="location", limit=limit, use_mock=use_mock)

@app.get("/api/banks/search", response_model=AutocompleteResponse)
async def search_banks(
    q: str = Query(..., description="Bank-Suchbegriff"),
    limit: int = Query(10, description="Maximale Anzahl Ergebnisse"),
    use_mock: bool = Query(False, description="Mock-Daten verwenden")
):
    """Bank-Autocomplete-Suche"""
    return await search_autocomplete(q=q, type="bank", limit=limit, use_mock=use_mock)

# Health Check
@app.get("/health")
async def health_check():
    """Health Check Endpoint"""
    return {
        "status": "healthy",
        "timestamp": datetime.now().isoformat(),
        "service": "VALEO NeuroERP Autocomplete API",
        "version": "1.0.0",
        "features": [
            "Fuzzy Search",
            "Typeahead",
            "PostgreSQL Integration",
            "Mock Data Support"
        ]
    }

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8003) 