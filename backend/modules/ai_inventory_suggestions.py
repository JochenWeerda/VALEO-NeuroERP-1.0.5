"""
VALEO NeuroERP - KI-basierte Inventur-Vorschläge
Automatische Inventur-Optimierung mit ML
"""
import logging
import json
import numpy as np
import pandas as pd
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
from decimal import Decimal
import uuid
from collections import defaultdict, Counter
import sqlite3
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib
import os

logger = logging.getLogger(__name__)

@dataclass
class InventorySuggestion:
    """Inventur-Vorschlag mit KI-Metadaten"""
    id: str
    product_id: str
    product_name: str
    suggested_quantity: float
    confidence_score: float
    reasoning: str
    urgency_level: str  # 'hoch', 'mittel', 'niedrig'
    predicted_shortage_date: Optional[datetime]
    seasonal_factor: float
    demand_forecast: Dict[str, Any]
    cost_impact: Dict[str, Any]
    created_at: datetime

@dataclass
class InventoryPattern:
    """Inventur-Muster für ML-Analyse"""
    product_category: str
    avg_consumption_rate: float
    seasonal_variation: float
    lead_time_days: int
    safety_stock_factor: float
    reorder_point: float
    optimal_batch_size: float

class AIInventorySuggestions:
    """
    KI-basierte Inventur-Vorschläge und Optimierung
    """
    
    def __init__(self, db_connection):
        self.db_connection = db_connection
        self.demand_forecaster = RandomForestRegressor(n_estimators=100, random_state=42)
        self.anomaly_detector = IsolationForest(contamination=0.1, random_state=42)
        self.seasonal_cluster = KMeans(n_clusters=4, random_state=42)  # 4 Jahreszeiten
        self.scaler = StandardScaler()
        self.model_path = "ai_models/inventory_suggestions/"
        self.suggestions_history = []
        self.patterns_cache = {}
        
        # Erstelle Model-Verzeichnis
        os.makedirs(self.model_path, exist_ok=True)
        
        # Initialisiere Modelle
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialisiere ML-Modelle"""
        try:
            # Lade gespeicherte Modelle falls vorhanden
            if os.path.exists(f"{self.model_path}demand_forecaster.pkl"):
                self.demand_forecaster = joblib.load(f"{self.model_path}demand_forecaster.pkl")
                logger.info("Demand Forecaster geladen")
            
            if os.path.exists(f"{self.model_path}anomaly_detector.pkl"):
                self.anomaly_detector = joblib.load(f"{self.model_path}anomaly_detector.pkl")
                logger.info("Anomaly Detector geladen")
            
            if os.path.exists(f"{self.model_path}seasonal_cluster.pkl"):
                self.seasonal_cluster = joblib.load(f"{self.model_path}seasonal_cluster.pkl")
                logger.info("Seasonal Cluster geladen")
            
            if os.path.exists(f"{self.model_path}scaler.pkl"):
                self.scaler = joblib.load(f"{self.model_path}scaler.pkl")
                logger.info("Scaler geladen")
                
        except Exception as e:
            logger.warning(f"Fehler beim Laden der Modelle: {e}")
    
    def _save_models(self):
        """Speichere trainierte Modelle"""
        try:
            joblib.dump(self.demand_forecaster, f"{self.model_path}demand_forecaster.pkl")
            joblib.dump(self.anomaly_detector, f"{self.model_path}anomaly_detector.pkl")
            joblib.dump(self.seasonal_cluster, f"{self.model_path}seasonal_cluster.pkl")
            joblib.dump(self.scaler, f"{self.model_path}scaler.pkl")
            logger.info("Inventory ML-Modelle gespeichert")
        except Exception as e:
            logger.error(f"Fehler beim Speichern der Modelle: {e}")
    
    def _extract_inventory_data(self) -> pd.DataFrame:
        """Extrahiere Inventur-Daten für ML-Analyse"""
        try:
            cursor = self.db_connection.cursor()
            
            # Hole Inventur-Historie
            cursor.execute("""
                SELECT 
                    soi.product_id,
                    soi.product_name,
                    soi.expected_quantity,
                    soi.actual_quantity,
                    soi.difference,
                    soi.unit,
                    so.date as inventory_date,
                    so.status,
                    p.category,
                    p.unit_price,
                    p.supplier_id
                FROM stock_opname_items soi
                JOIN stock_opnames so ON soi.stock_opname_id = so.id
                LEFT JOIN products p ON soi.product_id = p.id
                WHERE so.status = 'abgeschlossen'
                ORDER BY so.date DESC
            """)
            
            inventory_data = cursor.fetchall()
            
            if not inventory_data:
                return pd.DataFrame()
            
            # Konvertiere zu DataFrame
            df = pd.DataFrame(inventory_data, columns=[
                'product_id', 'product_name', 'expected_quantity', 'actual_quantity',
                'difference', 'unit', 'inventory_date', 'status', 'category',
                'unit_price', 'supplier_id'
            ])
            
            # Konvertiere Datum
            df['inventory_date'] = pd.to_datetime(df['inventory_date'])
            
            # Berechne zusätzliche Features
            df['shortage_ratio'] = df['difference'] / df['expected_quantity']
            df['accuracy'] = 1 - abs(df['difference']) / df['expected_quantity']
            df['month'] = df['inventory_date'].dt.month
            df['quarter'] = df['inventory_date'].dt.quarter
            df['year'] = df['inventory_date'].dt.year
            
            return df
            
        except Exception as e:
            logger.error(f"Fehler beim Extrahieren von Inventur-Daten: {e}")
            return pd.DataFrame()
    
    def _extract_sales_data(self) -> pd.DataFrame:
        """Extrahiere Verkaufsdaten für Nachfrage-Prognose"""
        try:
            cursor = self.db_connection.cursor()
            
            # Hole Verkaufsdaten der letzten 12 Monate
            one_year_ago = datetime.now() - timedelta(days=365)
            
            cursor.execute("""
                SELECT 
                    t.product_id,
                    p.product_name,
                    p.category,
                    SUM(t.quantity) as total_quantity,
                    COUNT(*) as transaction_count,
                    AVG(t.unit_price) as avg_price,
                    MIN(t.created_at) as first_sale,
                    MAX(t.created_at) as last_sale
                FROM transactions t
                JOIN products p ON t.product_id = p.id
                WHERE t.created_at >= ?
                GROUP BY t.product_id, p.product_name, p.category
            """, (one_year_ago,))
            
            sales_data = cursor.fetchall()
            
            if not sales_data:
                return pd.DataFrame()
            
            # Konvertiere zu DataFrame
            df = pd.DataFrame(sales_data, columns=[
                'product_id', 'product_name', 'category', 'total_quantity',
                'transaction_count', 'avg_price', 'first_sale', 'last_sale'
            ])
            
            # Berechne zusätzliche Features
            df['avg_daily_demand'] = df['total_quantity'] / 365
            df['demand_volatility'] = df['transaction_count'] / df['total_quantity']
            
            return df
            
        except Exception as e:
            logger.error(f"Fehler beim Extrahieren von Verkaufsdaten: {e}")
            return pd.DataFrame()
    
    def _train_ml_models(self):
        """Trainiere ML-Modelle mit bestehenden Daten"""
        try:
            # Extrahiere Daten
            inventory_df = self._extract_inventory_data()
            sales_df = self._extract_sales_data()
            
            if inventory_df.empty or sales_df.empty:
                logger.warning("Zu wenig Daten für ML-Training")
                return
            
            # Kombiniere Daten
            combined_df = pd.merge(
                inventory_df, sales_df, 
                on=['product_id', 'product_name', 'category'], 
                how='inner'
            )
            
            if len(combined_df) < 20:
                logger.warning("Zu wenig kombinierte Daten für ML-Training")
                return
            
            # Bereite Features vor
            features = [
                'expected_quantity', 'actual_quantity', 'difference',
                'shortage_ratio', 'accuracy', 'month', 'quarter',
                'total_quantity', 'transaction_count', 'avg_price',
                'avg_daily_demand', 'demand_volatility'
            ]
            
            X = combined_df[features].fillna(0)
            y_demand = combined_df['total_quantity']
            
            # Skaliere Features
            X_scaled = self.scaler.fit_transform(X)
            
            # Trainiere Demand Forecaster
            self.demand_forecaster.fit(X_scaled, y_demand)
            
            # Trainiere Anomaly Detector
            self.anomaly_detector.fit(X_scaled)
            
            # Trainiere Seasonal Cluster
            seasonal_features = combined_df[['month', 'quarter', 'total_quantity']].fillna(0)
            self.seasonal_cluster.fit(seasonal_features)
            
            # Speichere Modelle
            self._save_models()
            
            logger.info(f"ML-Modelle mit {len(combined_df)} Datensätzen trainiert")
            
        except Exception as e:
            logger.error(f"Fehler beim Training der ML-Modelle: {e}")
    
    def suggest_inventory_optimization(self, product_id: str = None) -> List[InventorySuggestion]:
        """
        Generiere intelligente Inventur-Vorschläge
        """
        suggestions = []
        
        try:
            # Trainiere Modelle falls nötig
            if not hasattr(self.demand_forecaster, 'estimators_'):
                self._train_ml_models()
            
            # Hole aktuelle Inventur-Daten
            cursor = self.db_connection.cursor()
            
            if product_id:
                # Spezifisches Produkt
                cursor.execute("""
                    SELECT id, product_name, category, current_stock, unit_price,
                           supplier_id, reorder_point, safety_stock
                    FROM products 
                    WHERE id = ?
                """, (product_id,))
                products = cursor.fetchall()
            else:
                # Alle Produkte mit niedrigem Bestand
                cursor.execute("""
                    SELECT id, product_name, category, current_stock, unit_price,
                           supplier_id, reorder_point, safety_stock
                    FROM products 
                    WHERE current_stock <= reorder_point + safety_stock
                    ORDER BY (reorder_point + safety_stock - current_stock) DESC
                    LIMIT 20
                """)
                products = cursor.fetchall()
            
            for product in products:
                product_id, product_name, category, current_stock, unit_price, supplier_id, reorder_point, safety_stock = product
                
                # Generiere Vorschlag
                suggestion = self._generate_inventory_suggestion(
                    product_id, product_name, category, current_stock,
                    unit_price, reorder_point, safety_stock
                )
                
                if suggestion:
                    suggestions.append(suggestion)
            
            # Sortiere nach Dringlichkeit
            suggestions.sort(key=lambda x: self._urgency_score(x), reverse=True)
            
            # Speichere Vorschläge in Historie
            for suggestion in suggestions[:10]:
                self.suggestions_history.append({
                    'product_id': suggestion.product_id,
                    'product_name': suggestion.product_name,
                    'suggested_quantity': suggestion.suggested_quantity,
                    'confidence': suggestion.confidence_score,
                    'urgency': suggestion.urgency_level,
                    'timestamp': datetime.now().isoformat()
                })
            
        except Exception as e:
            logger.error(f"Fehler bei Inventur-Vorschlägen: {e}")
        
        return suggestions
    
    def _generate_inventory_suggestion(self, product_id: str, product_name: str,
                                     category: str, current_stock: float,
                                     unit_price: float, reorder_point: float,
                                     safety_stock: float) -> Optional[InventorySuggestion]:
        """Generiere Inventur-Vorschlag für ein Produkt"""
        try:
            # Hole historische Daten
            cursor = self.db_connection.cursor()
            
            # Verkaufsdaten der letzten 90 Tage
            ninety_days_ago = datetime.now() - timedelta(days=90)
            
            cursor.execute("""
                SELECT SUM(quantity) as total_sold, COUNT(*) as transactions
                FROM transactions 
                WHERE product_id = ? AND created_at >= ?
            """, (product_id, ninety_days_ago))
            
            sales_result = cursor.fetchone()
            total_sold = sales_result[0] if sales_result[0] else 0
            transactions = sales_result[1] if sales_result[1] else 0
            
            # Berechne Nachfrage-Prognose
            daily_demand = total_sold / 90 if total_sold > 0 else 0.1
            
            # Vorhersage für nächste 30 Tage
            predicted_demand_30d = daily_demand * 30
            
            # Berechne optimale Bestellmenge
            lead_time_days = 7  # Standard-Lieferzeit
            demand_during_lead_time = daily_demand * lead_time_days
            
            # Economic Order Quantity (EOQ) Formel
            ordering_cost = 50  # Standard-Bestellkosten
            holding_cost_rate = 0.2  # 20% Lagerhaltungskosten
            annual_demand = daily_demand * 365
            
            if annual_demand > 0 and unit_price > 0:
                eoq = np.sqrt((2 * annual_demand * ordering_cost) / (unit_price * holding_cost_rate))
            else:
                eoq = demand_during_lead_time * 2
            
            # Berechne Confidence Score
            confidence = self._calculate_inventory_confidence(
                transactions, current_stock, reorder_point, safety_stock
            )
            
            # Bestimme Dringlichkeit
            urgency_level = self._determine_urgency_level(
                current_stock, reorder_point, safety_stock, daily_demand
            )
            
            # Vorhersage Engpass-Datum
            shortage_date = None
            if daily_demand > 0 and current_stock > 0:
                days_until_shortage = current_stock / daily_demand
                if days_until_shortage < 30:
                    shortage_date = datetime.now() + timedelta(days=days_until_shortage)
            
            # Saisonale Faktoren
            current_month = datetime.now().month
            seasonal_factor = self._get_seasonal_factor(category, current_month)
            
            # Nachfrage-Prognose
            demand_forecast = {
                'daily_demand': daily_demand,
                'weekly_demand': daily_demand * 7,
                'monthly_demand': daily_demand * 30,
                'annual_demand': annual_demand,
                'demand_volatility': transactions / max(total_sold, 1)
            }
            
            # Kosten-Impact
            cost_impact = {
                'stockout_cost': predicted_demand_30d * unit_price * 0.1,  # 10% Verlust
                'holding_cost': current_stock * unit_price * holding_cost_rate / 12,
                'ordering_cost': ordering_cost,
                'total_inventory_value': current_stock * unit_price
            }
            
            # Generiere Vorschlag
            suggested_quantity = max(eoq, demand_during_lead_time + safety_stock - current_stock)
            
            reasoning = f"Basierend auf täglicher Nachfrage von {daily_demand:.2f} Einheiten. "
            reasoning += f"EOQ: {eoq:.0f}, Lieferzeit-Nachfrage: {demand_during_lead_time:.0f}. "
            reasoning += f"Confidence: {confidence:.1%}"
            
            return InventorySuggestion(
                id=str(uuid.uuid4()),
                product_id=product_id,
                product_name=product_name,
                suggested_quantity=suggested_quantity,
                confidence_score=confidence,
                reasoning=reasoning,
                urgency_level=urgency_level,
                predicted_shortage_date=shortage_date,
                seasonal_factor=seasonal_factor,
                demand_forecast=demand_forecast,
                cost_impact=cost_impact,
                created_at=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Fehler bei Inventur-Vorschlag-Generierung: {e}")
            return None
    
    def _calculate_inventory_confidence(self, transactions: int, current_stock: float,
                                      reorder_point: float, safety_stock: float) -> float:
        """Berechne Confidence Score für Inventur-Vorschlag"""
        try:
            confidence = 0.0
            
            # Basis-Confidence aus Transaktionsanzahl
            if transactions >= 50:
                confidence += 0.4
            elif transactions >= 20:
                confidence += 0.3
            elif transactions >= 10:
                confidence += 0.2
            else:
                confidence += 0.1
            
            # Bestand-Niveau
            if current_stock <= reorder_point:
                confidence += 0.3  # Hohe Dringlichkeit
            elif current_stock <= reorder_point + safety_stock:
                confidence += 0.2  # Mittlere Dringlichkeit
            else:
                confidence += 0.1  # Niedrige Dringlichkeit
            
            # Sicherheitsbestand-Konfiguration
            if safety_stock > 0:
                confidence += 0.2
            else:
                confidence += 0.1
            
            # Bestellpunkt-Konfiguration
            if reorder_point > 0:
                confidence += 0.1
            else:
                confidence += 0.05
            
            return min(confidence, 1.0)
            
        except Exception as e:
            logger.error(f"Fehler bei Confidence-Berechnung: {e}")
            return 0.5
    
    def _determine_urgency_level(self, current_stock: float, reorder_point: float,
                               safety_stock: float, daily_demand: float) -> str:
        """Bestimme Dringlichkeits-Level"""
        try:
            if daily_demand <= 0:
                return 'niedrig'
            
            days_until_stockout = current_stock / daily_demand
            
            if days_until_stockout <= 7:
                return 'hoch'
            elif days_until_stockout <= 14:
                return 'mittel'
            else:
                return 'niedrig'
                
        except Exception as e:
            logger.error(f"Fehler bei Dringlichkeits-Bestimmung: {e}")
            return 'mittel'
    
    def _get_seasonal_factor(self, category: str, month: int) -> float:
        """Berechne saisonalen Faktor"""
        try:
            # Saisonale Faktoren basierend auf Kategorie
            seasonal_factors = {
                'Getränke': [0.8, 0.9, 1.2, 1.3, 1.5, 1.8, 1.8, 1.5, 1.2, 1.0, 0.9, 0.8],
                'Lebensmittel': [1.1, 1.0, 1.0, 1.1, 1.2, 1.1, 1.0, 1.0, 1.1, 1.2, 1.1, 1.0],
                'Elektronik': [1.5, 1.2, 1.0, 0.9, 0.8, 0.8, 0.9, 1.0, 1.1, 1.2, 1.4, 1.6],
                'Kleidung': [1.3, 1.1, 0.9, 0.8, 0.7, 0.8, 0.9, 1.0, 1.2, 1.3, 1.4, 1.2]
            }
            
            # Standard-Faktor falls Kategorie nicht gefunden
            default_factors = [1.0] * 12
            
            factors = seasonal_factors.get(category, default_factors)
            return factors[month - 1] if 1 <= month <= 12 else 1.0
            
        except Exception as e:
            logger.error(f"Fehler bei saisonalem Faktor: {e}")
            return 1.0
    
    def _urgency_score(self, suggestion: InventorySuggestion) -> float:
        """Berechne Dringlichkeits-Score für Sortierung"""
        urgency_scores = {'hoch': 3, 'mittel': 2, 'niedrig': 1}
        return urgency_scores.get(suggestion.urgency_level, 1) * suggestion.confidence_score
    
    def optimize_inventory_parameters(self) -> Dict[str, Any]:
        """Optimiere Inventur-Parameter mit KI"""
        try:
            cursor = self.db_connection.cursor()
            
            # Hole alle Produkte
            cursor.execute("""
                SELECT id, product_name, category, current_stock, unit_price,
                       reorder_point, safety_stock, supplier_id
                FROM products
            """)
            
            products = cursor.fetchall()
            
            if not products:
                return {'message': 'Keine Produkte zur Optimierung gefunden'}
            
            optimization_results = {
                'total_products': len(products),
                'optimized': 0,
                'suggestions': [],
                'cost_savings': 0.0
            }
            
            for product in products:
                product_id, product_name, category, current_stock, unit_price, reorder_point, safety_stock, supplier_id = product
                
                # Generiere optimierte Parameter
                optimized_params = self._optimize_product_parameters(
                    product_id, product_name, category, current_stock, unit_price
                )
                
                if optimized_params:
                    # Berechne Kosteneinsparungen
                    current_cost = (reorder_point + safety_stock) * unit_price
                    optimized_cost = (optimized_params['reorder_point'] + optimized_params['safety_stock']) * unit_price
                    cost_saving = current_cost - optimized_cost
                    
                    optimization_results['suggestions'].append({
                        'product_id': product_id,
                        'product_name': product_name,
                        'current_reorder_point': reorder_point,
                        'current_safety_stock': safety_stock,
                        'optimized_reorder_point': optimized_params['reorder_point'],
                        'optimized_safety_stock': optimized_params['safety_stock'],
                        'cost_saving': cost_saving,
                        'confidence': optimized_params['confidence']
                    })
                    
                    optimization_results['optimized'] += 1
                    optimization_results['cost_savings'] += cost_saving
            
            logger.info(f"Inventur-Parameter-Optimierung abgeschlossen: {optimization_results['optimized']} Produkte")
            
            return optimization_results
            
        except Exception as e:
            logger.error(f"Fehler bei Inventur-Parameter-Optimierung: {e}")
            return {'error': str(e)}
    
    def _optimize_product_parameters(self, product_id: str, product_name: str,
                                   category: str, current_stock: float,
                                   unit_price: float) -> Optional[Dict[str, Any]]:
        """Optimiere Parameter für ein Produkt"""
        try:
            # Hole Verkaufsdaten
            cursor = self.db_connection.cursor()
            
            # Letzte 6 Monate
            six_months_ago = datetime.now() - timedelta(days=180)
            
            cursor.execute("""
                SELECT SUM(quantity) as total_sold, COUNT(*) as transactions,
                       AVG(quantity) as avg_quantity, STDDEV(quantity) as std_quantity
                FROM transactions 
                WHERE product_id = ? AND created_at >= ?
            """, (product_id, six_months_ago))
            
            result = cursor.fetchone()
            
            if not result or result[0] is None:
                return None
            
            total_sold, transactions, avg_quantity, std_quantity = result
            
            if total_sold <= 0:
                return None
            
            # Berechne optimale Parameter
            daily_demand = total_sold / 180
            demand_std = std_quantity if std_quantity else daily_demand * 0.3
            
            # Lead Time (Standard: 7 Tage)
            lead_time_days = 7
            
            # Optimale Sicherheitsbestand (95% Service Level)
            safety_stock = demand_std * np.sqrt(lead_time_days) * 1.645
            
            # Optimaler Bestellpunkt
            reorder_point = daily_demand * lead_time_days + safety_stock
            
            # Confidence basierend auf Datenqualität
            confidence = min(transactions / 100.0, 1.0)
            
            return {
                'reorder_point': max(reorder_point, 1),
                'safety_stock': max(safety_stock, 0),
                'confidence': confidence,
                'daily_demand': daily_demand,
                'demand_volatility': demand_std / daily_demand if daily_demand > 0 else 0
            }
            
        except Exception as e:
            logger.error(f"Fehler bei Parameter-Optimierung: {e}")
            return None
    
    def get_inventory_analytics(self) -> Dict[str, Any]:
        """Hole Inventur-Analytics"""
        try:
            cursor = self.db_connection.cursor()
            
            # Gesamtstatistiken
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_products,
                    SUM(current_stock * unit_price) as total_inventory_value,
                    AVG(current_stock) as avg_stock_level,
                    COUNT(CASE WHEN current_stock <= reorder_point THEN 1 END) as low_stock_count
                FROM products
            """)
            
            stats = cursor.fetchone()
            
            # Kategorie-Analyse
            cursor.execute("""
                SELECT category,
                       COUNT(*) as product_count,
                       SUM(current_stock * unit_price) as category_value,
                       AVG(current_stock) as avg_stock
                FROM products
                GROUP BY category
                ORDER BY category_value DESC
            """)
            
            categories = cursor.fetchall()
            
            # Dringlichkeits-Analyse
            urgency_analysis = {
                'hoch': 0,
                'mittel': 0,
                'niedrig': 0
            }
            
            for suggestion in self.suggestions_history[-100:]:  # Letzte 100 Vorschläge
                urgency = suggestion.get('urgency', 'mittel')
                urgency_analysis[urgency] += 1
            
            return {
                'total_products': stats[0],
                'total_inventory_value': stats[1],
                'avg_stock_level': stats[2],
                'low_stock_count': stats[3],
                'categories': [{
                    'name': cat[0],
                    'product_count': cat[1],
                    'value': cat[2],
                    'avg_stock': cat[3]
                } for cat in categories],
                'urgency_distribution': urgency_analysis,
                'suggestions_generated': len(self.suggestions_history)
            }
            
        except Exception as e:
            logger.error(f"Fehler bei Inventur-Analytics: {e}")
            return {'error': str(e)}
    
    def retrain_models(self) -> Dict[str, Any]:
        """Trainiere ML-Modelle neu"""
        try:
            # Trainiere Modelle
            self._train_ml_models()
            
            # Teste Modelle
            test_results = self._test_models()
            
            return {
                'status': 'success',
                'message': 'ML-Modelle erfolgreich neu trainiert',
                'test_results': test_results
            }
            
        except Exception as e:
            logger.error(f"Fehler beim Neu-Training: {e}")
            return {'error': str(e)}
    
    def _test_models(self) -> Dict[str, Any]:
        """Teste ML-Modelle"""
        try:
            # Extrahiere Testdaten
            inventory_df = self._extract_inventory_data()
            sales_df = self._extract_sales_data()
            
            if inventory_df.empty or sales_df.empty:
                return {'error': 'Zu wenig Testdaten'}
            
            # Kombiniere Daten
            combined_df = pd.merge(
                inventory_df, sales_df, 
                on=['product_id', 'product_name', 'category'], 
                how='inner'
            )
            
            if len(combined_df) < 10:
                return {'error': 'Zu wenig kombinierte Testdaten'}
            
            # Teste Demand Forecaster
            features = [
                'expected_quantity', 'actual_quantity', 'difference',
                'shortage_ratio', 'accuracy', 'month', 'quarter',
                'total_quantity', 'transaction_count', 'avg_price',
                'avg_daily_demand', 'demand_volatility'
            ]
            
            X = combined_df[features].fillna(0)
            y_demand = combined_df['total_quantity']
            
            X_scaled = self.scaler.transform(X)
            y_pred = self.demand_forecaster.predict(X_scaled)
            
            mae = mean_absolute_error(y_demand, y_pred)
            mse = mean_squared_error(y_demand, y_pred)
            
            return {
                'demand_forecaster_mae': mae,
                'demand_forecaster_mse': mse,
                'test_samples': len(combined_df),
                'features_used': len(features)
            }
            
        except Exception as e:
            logger.error(f"Fehler beim Testen der Modelle: {e}")
            return {'error': str(e)} 