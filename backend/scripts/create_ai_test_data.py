#!/usr/bin/env python3
"""
VALEO NeuroERP - Testdaten-Generator für KI-Module
Erstellt umfangreiche Testdaten für Barcode-, Inventur- und Voucher-KI-Tests
"""

import sys
import os
import sqlite3
import json
import random
from datetime import datetime, timedelta
from typing import List, Dict, Any
import uuid

# Füge Backend-Verzeichnis zum Python-Pfad hinzu
sys.path.append(os.path.dirname(os.path.dirname(os.path.abspath(__file__))))

from modules.ai_barcode_suggestions import AIBarcodeSuggestions, BarcodeSuggestion
from modules.ai_inventory_suggestions import AIInventorySuggestions, InventorySuggestion
from modules.ai_voucher_optimization import AIVoucherOptimization, VoucherOptimization

class AITestDataGenerator:
    """Generator für KI-Testdaten"""
    
    def __init__(self, db_path: str = "ai_test_data.db"):
        self.db_path = db_path
        self.db_connection = sqlite3.connect(db_path)
        self.setup_database()
        
        # Initialisiere KI-Services
        self.barcode_service = AIBarcodeSuggestions(self.db_connection)
        self.inventory_service = AIInventorySuggestions(self.db_connection)
        self.voucher_service = AIVoucherOptimization(self.db_connection)
    
    def setup_database(self):
        """Erstelle Datenbank-Tabellen für KI-Testdaten"""
        cursor = self.db_connection.cursor()
        
        # Barcode-Vorschläge Tabelle
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS barcode_suggestions (
                id TEXT PRIMARY KEY,
                product_name TEXT NOT NULL,
                suggested_barcode TEXT NOT NULL,
                confidence_score REAL NOT NULL,
                reasoning TEXT NOT NULL,
                category TEXT NOT NULL,
                similar_products TEXT,
                market_trends TEXT,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Inventur-Vorschläge Tabelle
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS inventory_suggestions (
                id TEXT PRIMARY KEY,
                product_name TEXT NOT NULL,
                current_stock INTEGER NOT NULL,
                suggested_quantity INTEGER NOT NULL,
                urgency_score REAL NOT NULL,
                reasoning TEXT NOT NULL,
                category TEXT NOT NULL,
                demand_forecast REAL NOT NULL,
                cost_impact REAL NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Voucher-Optimierungen Tabelle
        cursor.execute("""
            CREATE TABLE IF NOT EXISTS voucher_optimizations (
                id TEXT PRIMARY KEY,
                customer_segment TEXT NOT NULL,
                suggested_discount REAL NOT NULL,
                confidence_score REAL NOT NULL,
                reasoning TEXT NOT NULL,
                revenue_prediction REAL NOT NULL,
                risk_assessment REAL NOT NULL,
                target_audience TEXT NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            )
        """)
        
        # Produkt-Kategorien für Tests
        self.product_categories = [
            "Elektronik", "Bücher", "Kleidung", "Lebensmittel", "Haushalt",
            "Sport", "Spielzeug", "Garten", "Auto", "Gesundheit"
        ]
        
        # Produkt-Namen für Tests
        self.product_names = [
            "iPhone 15 Pro", "Samsung Galaxy S24", "MacBook Air M3", "iPad Pro",
            "Sony WH-1000XM5", "Nike Air Max", "Adidas Ultraboost", "Puma RS-X",
            "Harry Potter Box Set", "Der Herr der Ringe", "Game of Thrones",
            "Python Programming", "JavaScript Guide", "React Cookbook",
            "Bio Apfel", "Bio Banane", "Bio Milch", "Bio Brot", "Bio Eier",
            "Dyson V15", "Philips Hue", "Nest Thermostat", "Ring Doorbell",
            "Fitness Tracker", "Smart Watch", "Bluetooth Speaker", "Wireless Earbuds",
            "Gaming Mouse", "Mechanical Keyboard", "4K Monitor", "Gaming Chair",
            "Yoga Mat", "Dumbbells", "Resistance Bands", "Foam Roller",
            "Lego Star Wars", "PlayStation 5", "Xbox Series X", "Nintendo Switch",
            "Garden Tools", "Plant Seeds", "Fertilizer", "Garden Hose",
            "Car Wash Kit", "Dash Cam", "Bluetooth Adapter", "Phone Mount"
        ]
        
        # Kunden-Segmente für Voucher-Tests
        self.customer_segments = [
            "Premium", "Regular", "Budget", "New", "Loyal", "VIP",
            "Student", "Senior", "Family", "Business", "Wholesale"
        ]
        
        self.db_connection.commit()
    
    def generate_barcode_test_data(self, count: int = 50):
        """Generiere Barcode-Testdaten"""
        print(f"Generiere {count} Barcode-Testdaten...")
        
        cursor = self.db_connection.cursor()
        
        for i in range(count):
            product_name = random.choice(self.product_names)
            category = random.choice(self.product_categories)
            
            # Generiere realistischen Barcode
            barcode = self._generate_realistic_barcode(category)
            
            # Generiere Konfidenz-Score
            confidence = random.uniform(0.3, 0.95)
            
            # Generiere Begründung
            reasoning = self._generate_barcode_reasoning(product_name, category, confidence)
            
            # Generiere ähnliche Produkte
            similar_products = random.sample(self.product_names, min(3, len(self.product_names)))
            
            # Generiere Markttrends
            market_trends = self._generate_market_trends(category)
            
            # Erstelle Barcode-Vorschlag
            suggestion = BarcodeSuggestion(
                id=str(uuid.uuid4()),
                product_name=product_name,
                suggested_barcode=barcode,
                confidence_score=confidence,
                reasoning=reasoning,
                category=category,
                similar_products=similar_products,
                market_trends=market_trends,
                created_at=datetime.now() - timedelta(days=random.randint(0, 30))
            )
            
            # Speichere in Datenbank
            cursor.execute("""
                INSERT INTO barcode_suggestions 
                (id, product_name, suggested_barcode, confidence_score, reasoning, 
                 category, similar_products, market_trends, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                suggestion.id, suggestion.product_name, suggestion.suggested_barcode,
                suggestion.confidence_score, suggestion.reasoning, suggestion.category,
                json.dumps(suggestion.similar_products), json.dumps(suggestion.market_trends),
                suggestion.created_at.isoformat()
            ))
        
        self.db_connection.commit()
        print(f"✅ {count} Barcode-Testdaten erstellt")
    
    def generate_inventory_test_data(self, count: int = 40):
        """Generiere Inventur-Testdaten"""
        print(f"Generiere {count} Inventur-Testdaten...")
        
        cursor = self.db_connection.cursor()
        
        for i in range(count):
            product_name = random.choice(self.product_names)
            category = random.choice(self.product_categories)
            product_id = str(uuid.uuid4())
            suggested_quantity = random.randint(10, 500)
            confidence_score = random.uniform(0.4, 0.95)
            urgency_level = random.choice(['hoch', 'mittel', 'niedrig'])
            seasonal_factor = random.uniform(0.5, 2.0)
            
            # Generiere Begründung
            reasoning = self._generate_inventory_reasoning(
                product_name, suggested_quantity, urgency_level
            )
            
            # Generiere Demand Forecast
            demand_forecast = {
                "daily_demand": random.uniform(5, 50),
                "weekly_demand": random.uniform(35, 350),
                "monthly_demand": random.uniform(150, 1500),
                "trend": random.choice(["steigend", "fallend", "stabil"]),
                "seasonality": random.choice(["hoch", "mittel", "niedrig"])
            }
            
            # Generiere Cost Impact
            cost_impact = {
                "unit_cost": random.uniform(10, 500),
                "total_cost": suggested_quantity * random.uniform(10, 500),
                "holding_cost": random.uniform(0.1, 0.3),
                "stockout_cost": random.uniform(50, 500)
            }
            
            # Erstelle Inventur-Vorschlag
            suggestion = InventorySuggestion(
                id=str(uuid.uuid4()),
                product_id=product_id,
                product_name=product_name,
                suggested_quantity=suggested_quantity,
                confidence_score=confidence_score,
                reasoning=reasoning,
                urgency_level=urgency_level,
                predicted_shortage_date=datetime.now() + timedelta(days=random.randint(1, 30)),
                seasonal_factor=seasonal_factor,
                demand_forecast=demand_forecast,
                cost_impact=cost_impact,
                created_at=datetime.now() - timedelta(days=random.randint(0, 30))
            )
            
            # Speichere in Datenbank
            cursor.execute("""
                INSERT INTO inventory_suggestions 
                (id, product_name, current_stock, suggested_quantity, urgency_score,
                 reasoning, category, demand_forecast, cost_impact, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                suggestion.id, suggestion.product_name, 0,  # current_stock als 0
                suggestion.suggested_quantity, 
                {"hoch": 0.9, "mittel": 0.5, "niedrig": 0.2}[suggestion.urgency_level],
                suggestion.reasoning, category, 
                json.dumps(suggestion.demand_forecast),
                json.dumps(suggestion.cost_impact), 
                suggestion.created_at.isoformat()
            ))
        
        self.db_connection.commit()
        print(f"✅ {count} Inventur-Testdaten erstellt")
    
    def generate_voucher_test_data(self, count: int = 30):
        """Generiere Voucher-Testdaten"""
        print(f"Generiere {count} Voucher-Testdaten...")
        
        cursor = self.db_connection.cursor()
        
        for i in range(count):
            voucher_id = str(uuid.uuid4())
            voucher_name = f"Voucher {i+1}"
            current_nominal = random.uniform(5, 50)
            suggested_nominal = current_nominal * random.uniform(0.8, 1.2)
            confidence_score = random.uniform(0.4, 0.95)
            expected_revenue_increase = random.uniform(1000, 50000)
            optimal_duration_days = random.randint(7, 90)
            target_customer_segments = random.sample(self.customer_segments, min(3, len(self.customer_segments)))
            
            # Generiere Begründung
            reasoning = self._generate_voucher_reasoning(
                voucher_name, suggested_nominal, confidence_score
            )
            
            # Generiere Seasonal Factors
            seasonal_factors = {
                "season": random.choice(["Frühling", "Sommer", "Herbst", "Winter"]),
                "factor": random.uniform(0.7, 1.3),
                "peak_months": random.sample(range(1, 13), 3),
                "holiday_impact": random.uniform(0.8, 1.5)
            }
            
            # Generiere Risk Assessment
            risk_assessment = {
                "risk_level": random.choice(["niedrig", "mittel", "hoch"]),
                "risk_factors": random.sample([
                    "Preisempfindlichkeit", "Wettbewerb", "Saisonalität", 
                    "Kundenverhalten", "Marktbedingungen"
                ], 2),
                "mitigation_strategies": [
                    "Schrittweise Einführung", "A/B-Testing", "Kunden-Feedback"
                ]
            }
            
            # Erstelle Voucher-Optimierung
            optimization = VoucherOptimization(
                id=str(uuid.uuid4()),
                voucher_id=voucher_id,
                voucher_name=voucher_name,
                current_nominal=current_nominal,
                suggested_nominal=suggested_nominal,
                confidence_score=confidence_score,
                reasoning=reasoning,
                expected_revenue_increase=expected_revenue_increase,
                target_customer_segments=target_customer_segments,
                optimal_duration_days=optimal_duration_days,
                seasonal_factors=seasonal_factors,
                risk_assessment=risk_assessment,
                created_at=datetime.now() - timedelta(days=random.randint(0, 30))
            )
            
            # Speichere in Datenbank
            cursor.execute("""
                INSERT INTO voucher_optimizations 
                (id, customer_segment, suggested_discount, confidence_score, reasoning,
                 revenue_prediction, risk_assessment, target_audience, created_at)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)
            """, (
                optimization.id, 
                ",".join(optimization.target_customer_segments),
                optimization.suggested_nominal, 
                optimization.confidence_score,
                optimization.reasoning, 
                optimization.expected_revenue_increase,
                json.dumps(optimization.risk_assessment), 
                ",".join(optimization.target_customer_segments),
                optimization.created_at.isoformat()
            ))
        
        self.db_connection.commit()
        print(f"✅ {count} Voucher-Testdaten erstellt")
    
    def _generate_realistic_barcode(self, category: str) -> str:
        """Generiere realistischen Barcode basierend auf Kategorie"""
        if category == "Elektronik":
            # EAN-13 für Elektronik
            return f"4{random.randint(100000000000, 999999999999)}"
        elif category == "Bücher":
            # ISBN-13 für Bücher
            return f"978{random.randint(1000000000, 9999999999)}"
        elif category == "Lebensmittel":
            # EAN-8 für Lebensmittel
            return f"{random.randint(10000000, 99999999)}"
        else:
            # Standard EAN-13
            return f"{random.randint(1000000000000, 9999999999999)}"
    
    def _generate_barcode_reasoning(self, product_name: str, category: str, confidence: float) -> str:
        """Generiere Begründung für Barcode-Vorschlag"""
        reasons = [
            f"Barcode basiert auf erfolgreichen Mustern in der {category}-Kategorie",
            f"Ähnliche Produkte zeigen hohe Erfolgsrate mit diesem Barcode-Format",
            f"Marktanalyse zeigt optimale Barcode-Struktur für {product_name}",
            f"KI-Modell erkennt Muster aus {random.randint(100, 1000)} ähnlichen Produkten",
            f"Barcode folgt internationalen Standards für {category}-Produkte"
        ]
        return random.choice(reasons)
    
    def _generate_market_trends(self, category: str) -> Dict[str, Any]:
        """Generiere Markttrends für Kategorie"""
        trends = ["steigend", "fallend", "stabil", "saisonal"]
        return {
            "demand_trend": random.choice(trends),
            "price_trend": random.choice(trends),
            "seasonality": random.choice(["hoch", "mittel", "niedrig"]),
            "market_volume": random.randint(1000, 100000),
            "growth_rate": random.uniform(-0.2, 0.3)
        }
    
    def _generate_inventory_reasoning(self, product_name: str, suggested_quantity: int, 
                                    urgency_level: str) -> str:
        """Generiere Begründung für Inventur-Vorschlag"""
        if suggested_quantity > 100:
            return f"Hohe Nachfrage erwartet für {product_name}. Bestand auf {suggested_quantity} erhöhen."
        elif urgency_level == 'hoch':
            return f"Kritischer Bestand für {product_name}. Sofortige Nachbestellung empfohlen."
        else:
            return f"Normale Nachfrage. Bestand auf {suggested_quantity} optimieren."
    
    def _generate_voucher_reasoning(self, voucher_name: str, suggested_nominal: float, 
                                  confidence: float) -> str:
        """Generiere Begründung für Voucher-Optimierung"""
        return f"{suggested_nominal*100:.1f}% Rabatt für {voucher_name} basierend auf Kaufverhalten und Marktanalyse"
    
    def create_all_test_data(self):
        """Erstelle alle Testdaten"""
        print("🚀 Starte Generierung der KI-Testdaten...")
        
        try:
            self.generate_barcode_test_data(50)
            self.generate_inventory_test_data(40)
            self.generate_voucher_test_data(30)
            
            print("\n✅ Alle KI-Testdaten erfolgreich erstellt!")
            print(f"📊 Datenbank: {self.db_path}")
            print("📈 Testdaten bereit für echte Backend-Tests")
            
        except Exception as e:
            print(f"❌ Fehler beim Erstellen der Testdaten: {e}")
            raise
    
    def cleanup(self):
        """Cleanup der Datenbank-Verbindung"""
        self.db_connection.close()

def main():
    """Hauptfunktion für Testdaten-Generierung"""
    print("VALEO NeuroERP - KI-Testdaten Generator")
    print("=" * 50)
    
    generator = AITestDataGenerator()
    
    try:
        generator.create_all_test_data()
    finally:
        generator.cleanup()

if __name__ == "__main__":
    main() 