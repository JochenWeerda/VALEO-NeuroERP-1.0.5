"""
VALEO NeuroERP - KI-basierte Voucher-Optimierung
Intelligente Rabatt-Strategien und Kampagnen-Optimierung mit ML
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
from sklearn.ensemble import RandomForestRegressor, GradientBoostingRegressor
from sklearn.preprocessing import StandardScaler, LabelEncoder
from sklearn.cluster import KMeans
from sklearn.metrics import mean_absolute_error, mean_squared_error, r2_score
import joblib
import os

logger = logging.getLogger(__name__)

@dataclass
class VoucherOptimization:
    """Voucher-Optimierung mit KI-Metadaten"""
    id: str
    voucher_id: str
    voucher_name: str
    current_nominal: float
    suggested_nominal: float
    confidence_score: float
    reasoning: str
    expected_revenue_increase: float
    target_customer_segments: List[str]
    optimal_duration_days: int
    seasonal_factors: Dict[str, Any]
    risk_assessment: Dict[str, Any]
    created_at: datetime

@dataclass
class CustomerSegment:
    """Kunden-Segment für Voucher-Optimierung"""
    segment_id: str
    segment_name: str
    avg_purchase_value: float
    purchase_frequency: float
    voucher_usage_rate: float
    price_sensitivity: float
    customer_count: int
    total_revenue: float

class AIVoucherOptimization:
    """
    KI-basierte Voucher-Optimierung und Rabatt-Strategien
    """
    
    def __init__(self, db_connection):
        self.db_connection = db_connection
        self.revenue_predictor = RandomForestRegressor(n_estimators=100, random_state=42)
        self.customer_segmenter = KMeans(n_clusters=5, random_state=42)
        self.voucher_performance_predictor = GradientBoostingRegressor(n_estimators=100, random_state=42)
        self.scaler = StandardScaler()
        self.label_encoder = LabelEncoder()
        self.model_path = "ai_models/voucher_optimization/"
        self.optimization_history = []
        self.segments_cache = {}
        
        # Erstelle Model-Verzeichnis
        os.makedirs(self.model_path, exist_ok=True)
        
        # Initialisiere Modelle
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialisiere ML-Modelle"""
        try:
            # Lade gespeicherte Modelle falls vorhanden
            if os.path.exists(f"{self.model_path}revenue_predictor.pkl"):
                self.revenue_predictor = joblib.load(f"{self.model_path}revenue_predictor.pkl")
                logger.info("Revenue Predictor geladen")
            
            if os.path.exists(f"{self.model_path}customer_segmenter.pkl"):
                self.customer_segmenter = joblib.load(f"{self.model_path}customer_segmenter.pkl")
                logger.info("Customer Segmenter geladen")
            
            if os.path.exists(f"{self.model_path}voucher_performance_predictor.pkl"):
                self.voucher_performance_predictor = joblib.load(f"{self.model_path}voucher_performance_predictor.pkl")
                logger.info("Voucher Performance Predictor geladen")
            
            if os.path.exists(f"{self.model_path}scaler.pkl"):
                self.scaler = joblib.load(f"{self.model_path}scaler.pkl")
                logger.info("Scaler geladen")
                
        except Exception as e:
            logger.warning(f"Fehler beim Laden der Modelle: {e}")
    
    def _save_models(self):
        """Speichere trainierte Modelle"""
        try:
            joblib.dump(self.revenue_predictor, f"{self.model_path}revenue_predictor.pkl")
            joblib.dump(self.customer_segmenter, f"{self.model_path}customer_segmenter.pkl")
            joblib.dump(self.voucher_performance_predictor, f"{self.model_path}voucher_performance_predictor.pkl")
            joblib.dump(self.scaler, f"{self.model_path}scaler.pkl")
            logger.info("Voucher Optimization ML-Modelle gespeichert")
        except Exception as e:
            logger.error(f"Fehler beim Speichern der Modelle: {e}")
    
    def _extract_voucher_data(self) -> pd.DataFrame:
        """Extrahiere Voucher-Daten für ML-Analyse"""
        try:
            cursor = self.db_connection.cursor()
            
            # Hole Voucher-Historie
            cursor.execute("""
                SELECT 
                    v.id,
                    v.name,
                    v.code,
                    v.type,
                    v.nominal,
                    v.kuota,
                    v.used_count,
                    v.start_date,
                    v.expired,
                    v.minimal_buying,
                    v.is_active,
                    v.created_at,
                    COUNT(vu.id) as usage_count,
                    AVG(vu.discount_amount) as avg_discount,
                    SUM(vu.discount_amount) as total_discount_given
                FROM vouchers v
                LEFT JOIN voucher_usage vu ON v.id = vu.voucher_id
                GROUP BY v.id, v.name, v.code, v.type, v.nominal, v.kuota, 
                         v.used_count, v.start_date, v.expired, v.minimal_buying, 
                         v.is_active, v.created_at
                ORDER BY v.created_at DESC
            """)
            
            voucher_data = cursor.fetchall()
            
            if not voucher_data:
                return pd.DataFrame()
            
            # Konvertiere zu DataFrame
            df = pd.DataFrame(voucher_data, columns=[
                'id', 'name', 'code', 'type', 'nominal', 'kuota', 'used_count',
                'start_date', 'expired', 'minimal_buying', 'is_active', 'created_at',
                'usage_count', 'avg_discount', 'total_discount_given'
            ])
            
            # Konvertiere Datum
            df['start_date'] = pd.to_datetime(df['start_date'])
            df['expired'] = pd.to_datetime(df['expired'])
            df['created_at'] = pd.to_datetime(df['created_at'])
            
            # Berechne zusätzliche Features
            df['duration_days'] = (df['expired'] - df['start_date']).dt.days
            df['usage_rate'] = df['used_count'] / df['kuota']
            df['discount_percentage'] = df['nominal'] / df['minimal_buying'] * 100
            df['month'] = df['start_date'].dt.month
            df['quarter'] = df['start_date'].dt.quarter
            df['year'] = df['start_date'].dt.year
            
            return df
            
        except Exception as e:
            logger.error(f"Fehler beim Extrahieren von Voucher-Daten: {e}")
            return pd.DataFrame()
    
    def _extract_customer_data(self) -> pd.DataFrame:
        """Extrahiere Kunden-Daten für Segmentierung"""
        try:
            cursor = self.db_connection.cursor()
            
            # Hole Kunden-Verkaufsdaten der letzten 12 Monate
            one_year_ago = datetime.now() - timedelta(days=365)
            
            cursor.execute("""
                SELECT 
                    c.id as customer_id,
                    c.name as customer_name,
                    c.email,
                    COUNT(t.id) as transaction_count,
                    SUM(t.total_amount) as total_spent,
                    AVG(t.total_amount) as avg_purchase_value,
                    COUNT(DISTINCT DATE(t.created_at)) as unique_visit_days,
                    COUNT(vu.id) as voucher_usage_count,
                    SUM(vu.discount_amount) as total_discount_used,
                    MAX(t.created_at) as last_purchase_date
                FROM customers c
                LEFT JOIN transactions t ON c.id = t.customer_id
                LEFT JOIN voucher_usage vu ON t.id = vu.transaction_id
                WHERE t.created_at >= ? OR t.created_at IS NULL
                GROUP BY c.id, c.name, c.email
            """, (one_year_ago,))
            
            customer_data = cursor.fetchall()
            
            if not customer_data:
                return pd.DataFrame()
            
            # Konvertiere zu DataFrame
            df = pd.DataFrame(customer_data, columns=[
                'customer_id', 'customer_name', 'email', 'transaction_count',
                'total_spent', 'avg_purchase_value', 'unique_visit_days',
                'voucher_usage_count', 'total_discount_used', 'last_purchase_date'
            ])
            
            # Berechne zusätzliche Features
            df['purchase_frequency'] = df['transaction_count'] / 365
            df['voucher_usage_rate'] = df['voucher_usage_count'] / df['transaction_count']
            df['price_sensitivity'] = df['total_discount_used'] / df['total_spent']
            df['days_since_last_purchase'] = (datetime.now() - pd.to_datetime(df['last_purchase_date'])).dt.days
            
            # Fülle NaN-Werte
            df = df.fillna(0)
            
            return df
            
        except Exception as e:
            logger.error(f"Fehler beim Extrahieren von Kunden-Daten: {e}")
            return pd.DataFrame()
    
    def _extract_transaction_data(self) -> pd.DataFrame:
        """Extrahiere Transaktions-Daten für Revenue-Prognose"""
        try:
            cursor = self.db_connection.cursor()
            
            # Hole Transaktionsdaten der letzten 6 Monate
            six_months_ago = datetime.now() - timedelta(days=180)
            
            cursor.execute("""
                SELECT 
                    t.id,
                    t.customer_id,
                    t.total_amount,
                    t.discount_amount,
                    t.payment_method,
                    t.created_at,
                    COUNT(ti.id) as item_count,
                    AVG(ti.unit_price) as avg_item_price,
                    v.id as voucher_id,
                    v.nominal as voucher_nominal,
                    v.type as voucher_type
                FROM transactions t
                LEFT JOIN transaction_items ti ON t.id = ti.transaction_id
                LEFT JOIN voucher_usage vu ON t.id = vu.transaction_id
                LEFT JOIN vouchers v ON vu.voucher_id = v.id
                WHERE t.created_at >= ?
                GROUP BY t.id, t.customer_id, t.total_amount, t.discount_amount,
                         t.payment_method, t.created_at, v.id, v.nominal, v.type
            """, (six_months_ago,))
            
            transaction_data = cursor.fetchall()
            
            if not transaction_data:
                return pd.DataFrame()
            
            # Konvertiere zu DataFrame
            df = pd.DataFrame(transaction_data, columns=[
                'id', 'customer_id', 'total_amount', 'discount_amount', 'payment_method',
                'created_at', 'item_count', 'avg_item_price', 'voucher_id',
                'voucher_nominal', 'voucher_type'
            ])
            
            # Konvertiere Datum
            df['created_at'] = pd.to_datetime(df['created_at'])
            
            # Berechne zusätzliche Features
            df['discount_percentage'] = df['discount_amount'] / df['total_amount'] * 100
            df['has_voucher'] = df['voucher_id'].notna().astype(int)
            df['month'] = df['created_at'].dt.month
            df['day_of_week'] = df['created_at'].dt.dayofweek
            df['hour'] = df['created_at'].dt.hour
            
            return df
            
        except Exception as e:
            logger.error(f"Fehler beim Extrahieren von Transaktions-Daten: {e}")
            return pd.DataFrame()
    
    def _train_ml_models(self):
        """Trainiere ML-Modelle mit bestehenden Daten"""
        try:
            # Extrahiere Daten
            voucher_df = self._extract_voucher_data()
            customer_df = self._extract_customer_data()
            transaction_df = self._extract_transaction_data()
            
            if voucher_df.empty or customer_df.empty or transaction_df.empty:
                logger.warning("Zu wenig Daten für ML-Training")
                return
            
            # Trainiere Customer Segmenter
            customer_features = [
                'transaction_count', 'total_spent', 'avg_purchase_value',
                'purchase_frequency', 'voucher_usage_rate', 'price_sensitivity'
            ]
            
            X_customer = customer_df[customer_features].fillna(0)
            X_customer_scaled = self.scaler.fit_transform(X_customer)
            self.customer_segmenter.fit(X_customer_scaled)
            
            # Trainiere Revenue Predictor
            transaction_features = [
                'total_amount', 'discount_amount', 'item_count', 'avg_item_price',
                'discount_percentage', 'has_voucher', 'month', 'day_of_week', 'hour'
            ]
            
            X_transaction = transaction_df[transaction_features].fillna(0)
            y_revenue = transaction_df['total_amount']
            
            X_transaction_scaled = self.scaler.transform(X_transaction)
            self.revenue_predictor.fit(X_transaction_scaled, y_revenue)
            
            # Trainiere Voucher Performance Predictor
            voucher_features = [
                'nominal', 'kuota', 'minimal_buying', 'duration_days',
                'discount_percentage', 'month', 'quarter'
            ]
            
            X_voucher = voucher_df[voucher_features].fillna(0)
            y_performance = voucher_df['usage_rate']
            
            X_voucher_scaled = self.scaler.transform(X_voucher)
            self.voucher_performance_predictor.fit(X_voucher_scaled, y_performance)
            
            # Speichere Modelle
            self._save_models()
            
            logger.info(f"ML-Modelle mit {len(voucher_df)} Vouchers, {len(customer_df)} Kunden, {len(transaction_df)} Transaktionen trainiert")
            
        except Exception as e:
            logger.error(f"Fehler beim Training der ML-Modelle: {e}")
    
    def optimize_voucher_strategy(self, voucher_id: str = None) -> List[VoucherOptimization]:
        """
        Generiere intelligente Voucher-Optimierungsvorschläge
        """
        optimizations = []
        
        try:
            # Trainiere Modelle falls nötig
            if not hasattr(self.revenue_predictor, 'estimators_'):
                self._train_ml_models()
            
            # Hole Voucher-Daten
            cursor = self.db_connection.cursor()
            
            if voucher_id:
                # Spezifischer Voucher
                cursor.execute("""
                    SELECT id, name, code, type, nominal, kuota, used_count,
                           start_date, expired, minimal_buying, is_active
                    FROM vouchers 
                    WHERE id = ?
                """, (voucher_id,))
                vouchers = cursor.fetchall()
            else:
                # Alle aktiven Vouchers
                cursor.execute("""
                    SELECT id, name, code, type, nominal, kuota, used_count,
                           start_date, expired, minimal_buying, is_active
                    FROM vouchers 
                    WHERE is_active = 1
                    ORDER BY created_at DESC
                    LIMIT 20
                """)
                vouchers = cursor.fetchall()
            
            for voucher in vouchers:
                voucher_id, name, code, voucher_type, nominal, kuota, used_count, start_date, expired, minimal_buying, is_active = voucher
                
                # Generiere Optimierung
                optimization = self._generate_voucher_optimization(
                    voucher_id, name, voucher_type, nominal, kuota, used_count,
                    start_date, expired, minimal_buying
                )
                
                if optimization:
                    optimizations.append(optimization)
            
            # Sortiere nach erwarteter Revenue-Steigerung
            optimizations.sort(key=lambda x: x.expected_revenue_increase, reverse=True)
            
            # Speichere Optimierungen in Historie
            for optimization in optimizations[:10]:
                self.optimization_history.append({
                    'voucher_id': optimization.voucher_id,
                    'voucher_name': optimization.voucher_name,
                    'current_nominal': optimization.current_nominal,
                    'suggested_nominal': optimization.suggested_nominal,
                    'expected_revenue_increase': optimization.expected_revenue_increase,
                    'confidence': optimization.confidence_score,
                    'timestamp': datetime.now().isoformat()
                })
            
        except Exception as e:
            logger.error(f"Fehler bei Voucher-Optimierung: {e}")
        
        return optimizations
    
    def _generate_voucher_optimization(self, voucher_id: str, name: str,
                                     voucher_type: str, nominal: float,
                                     kuota: int, used_count: int,
                                     start_date: datetime, expired: datetime,
                                     minimal_buying: float) -> Optional[VoucherOptimization]:
        """Generiere Voucher-Optimierung für einen Voucher"""
        try:
            # Berechne aktuelle Performance
            current_usage_rate = used_count / kuota if kuota > 0 else 0
            days_active = (expired - start_date).days if expired and start_date else 30
            
            # Hole Kunden-Segmente
            customer_segments = self._get_customer_segments()
            
            # Berechne optimale Parameter
            optimal_params = self._calculate_optimal_voucher_params(
                voucher_type, nominal, minimal_buying, current_usage_rate,
                customer_segments
            )
            
            if not optimal_params:
                return None
            
            # Berechne erwartete Revenue-Steigerung
            revenue_increase = self._predict_revenue_increase(
                voucher_type, optimal_params['nominal'], optimal_params['minimal_buying'],
                customer_segments
            )
            
            # Berechne Confidence Score
            confidence = self._calculate_optimization_confidence(
                current_usage_rate, days_active, customer_segments
            )
            
            # Bestimme Ziel-Kundensegmente
            target_segments = self._identify_target_segments(
                voucher_type, optimal_params['nominal'], customer_segments
            )
            
            # Saisonale Faktoren
            seasonal_factors = self._get_seasonal_factors(voucher_type)
            
            # Risiko-Bewertung
            risk_assessment = self._assess_optimization_risk(
                optimal_params['nominal'], optimal_params['minimal_buying'],
                revenue_increase, customer_segments
            )
            
            reasoning = f"Aktuelle Nutzungsrate: {current_usage_rate:.1%}. "
            reasoning += f"Optimale Rabatt-Höhe: {optimal_params['nominal']:.2f}€ "
            reasoning += f"(aktuell: {nominal:.2f}€). "
            reasoning += f"Erwartete Revenue-Steigerung: {revenue_increase:.2f}€. "
            reasoning += f"Confidence: {confidence:.1%}"
            
            return VoucherOptimization(
                id=str(uuid.uuid4()),
                voucher_id=voucher_id,
                voucher_name=name,
                current_nominal=nominal,
                suggested_nominal=optimal_params['nominal'],
                confidence_score=confidence,
                reasoning=reasoning,
                expected_revenue_increase=revenue_increase,
                target_customer_segments=target_segments,
                optimal_duration_days=optimal_params['duration_days'],
                seasonal_factors=seasonal_factors,
                risk_assessment=risk_assessment,
                created_at=datetime.now()
            )
            
        except Exception as e:
            logger.error(f"Fehler bei Voucher-Optimierung-Generierung: {e}")
            return None
    
    def _get_customer_segments(self) -> List[CustomerSegment]:
        """Hole Kunden-Segmente"""
        try:
            if self.segments_cache:
                return list(self.segments_cache.values())
            
            customer_df = self._extract_customer_data()
            
            if customer_df.empty:
                return []
            
            # Segmentierung
            customer_features = [
                'transaction_count', 'total_spent', 'avg_purchase_value',
                'purchase_frequency', 'voucher_usage_rate', 'price_sensitivity'
            ]
            
            X_customer = customer_df[customer_features].fillna(0)
            X_customer_scaled = self.scaler.transform(X_customer)
            
            # Vorhersage Segmente
            segments = self.customer_segmenter.predict(X_customer_scaled)
            
            # Erstelle CustomerSegment Objekte
            segment_stats = defaultdict(lambda: {
                'customers': [],
                'total_revenue': 0,
                'avg_purchase_value': 0,
                'purchase_frequency': 0,
                'voucher_usage_rate': 0,
                'price_sensitivity': 0
            })
            
            for i, segment_id in enumerate(segments):
                customer_data = customer_df.iloc[i]
                segment_stats[segment_id]['customers'].append(customer_data)
                segment_stats[segment_id]['total_revenue'] += customer_data['total_spent']
                segment_stats[segment_id]['avg_purchase_value'] += customer_data['avg_purchase_value']
                segment_stats[segment_id]['purchase_frequency'] += customer_data['purchase_frequency']
                segment_stats[segment_id]['voucher_usage_rate'] += customer_data['voucher_usage_rate']
                segment_stats[segment_id]['price_sensitivity'] += customer_data['price_sensitivity']
            
            # Erstelle CustomerSegment Objekte
            customer_segments = []
            segment_names = ['Niedrige Käufer', 'Gelegentliche Käufer', 'Regelmäßige Käufer', 'Premium Käufer', 'Voucher-Liebhaber']
            
            for segment_id, stats in segment_stats.items():
                customer_count = len(stats['customers'])
                if customer_count > 0:
                    customer_segments.append(CustomerSegment(
                        segment_id=str(segment_id),
                        segment_name=segment_names[segment_id] if segment_id < len(segment_names) else f'Segment {segment_id}',
                        avg_purchase_value=stats['avg_purchase_value'] / customer_count,
                        purchase_frequency=stats['purchase_frequency'] / customer_count,
                        voucher_usage_rate=stats['voucher_usage_rate'] / customer_count,
                        price_sensitivity=stats['price_sensitivity'] / customer_count,
                        customer_count=customer_count,
                        total_revenue=stats['total_revenue']
                    ))
            
            # Cache Segmente
            self.segments_cache = {seg.segment_id: seg for seg in customer_segments}
            
            return customer_segments
            
        except Exception as e:
            logger.error(f"Fehler bei Kunden-Segmentierung: {e}")
            return []
    
    def _calculate_optimal_voucher_params(self, voucher_type: str, current_nominal: float,
                                        minimal_buying: float, current_usage_rate: float,
                                        customer_segments: List[CustomerSegment]) -> Optional[Dict[str, Any]]:
        """Berechne optimale Voucher-Parameter"""
        try:
            # Basis-Parameter
            base_nominal = current_nominal
            base_minimal_buying = minimal_buying
            
            # Anpassung basierend auf Nutzungsrate
            if current_usage_rate < 0.3:  # Niedrige Nutzung
                # Erhöhe Attraktivität
                suggested_nominal = base_nominal * 1.2
                suggested_minimal_buying = base_minimal_buying * 0.9
            elif current_usage_rate > 0.8:  # Hohe Nutzung
                # Reduziere Kosten
                suggested_nominal = base_nominal * 0.9
                suggested_minimal_buying = base_minimal_buying * 1.1
            else:  # Mittlere Nutzung
                # Feine Anpassung
                suggested_nominal = base_nominal * 1.05
                suggested_minimal_buying = base_minimal_buying * 0.95
            
            # Anpassung basierend auf Kundensegmenten
            avg_price_sensitivity = np.mean([seg.price_sensitivity for seg in customer_segments])
            
            if avg_price_sensitivity > 0.1:  # Preis-sensitive Kunden
                suggested_nominal = suggested_nominal * 1.1
                suggested_minimal_buying = suggested_minimal_buying * 0.95
            elif avg_price_sensitivity < 0.05:  # Weniger preis-sensitive Kunden
                suggested_nominal = suggested_nominal * 0.95
                suggested_minimal_buying = suggested_minimal_buying * 1.05
            
            # Optimaler Rabatt-Prozentsatz (5-25%)
            discount_percentage = (suggested_nominal / suggested_minimal_buying) * 100
            if discount_percentage < 5:
                suggested_nominal = suggested_minimal_buying * 0.05
            elif discount_percentage > 25:
                suggested_nominal = suggested_minimal_buying * 0.25
            
            # Optimale Dauer (7-30 Tage)
            optimal_duration = 14  # Standard
            if current_usage_rate < 0.3:
                optimal_duration = 21  # Längere Dauer für niedrige Nutzung
            elif current_usage_rate > 0.8:
                optimal_duration = 7   # Kürzere Dauer für hohe Nutzung
            
            return {
                'nominal': round(suggested_nominal, 2),
                'minimal_buying': round(suggested_minimal_buying, 2),
                'duration_days': optimal_duration,
                'discount_percentage': round(discount_percentage, 1)
            }
            
        except Exception as e:
            logger.error(f"Fehler bei Parameter-Berechnung: {e}")
            return None
    
    def _predict_revenue_increase(self, voucher_type: str, nominal: float,
                                minimal_buying: float, customer_segments: List[CustomerSegment]) -> float:
        """Vorhersage Revenue-Steigerung"""
        try:
            # Basis-Revenue-Steigerung
            base_increase = 0.0
            
            for segment in customer_segments:
                # Berechne potenzielle Steigerung pro Segment
                segment_potential = segment.avg_purchase_value * segment.customer_count * 0.1
                
                # Anpassung basierend auf Voucher-Nutzung
                if segment.voucher_usage_rate > 0.5:
                    segment_potential *= 1.5  # Voucher-affine Kunden
                elif segment.voucher_usage_rate < 0.1:
                    segment_potential *= 0.5  # Weniger Voucher-affine Kunden
                
                # Anpassung basierend auf Preis-Sensitivität
                if segment.price_sensitivity > 0.1:
                    segment_potential *= 1.3  # Preis-sensitive Kunden
                
                base_increase += segment_potential
            
            # Anpassung basierend auf Voucher-Typ
            if voucher_type == 'prozent':
                base_increase *= 1.2  # Prozentuale Rabatte sind attraktiver
            elif voucher_type == 'betrag':
                base_increase *= 1.0  # Standard
            elif voucher_type == 'versandkosten':
                base_increase *= 0.8  # Versandkosten-Rabatte weniger attraktiv
            
            # Anpassung basierend auf Rabatt-Höhe
            discount_percentage = (nominal / minimal_buying) * 100
            if 10 <= discount_percentage <= 20:
                base_increase *= 1.2  # Optimaler Rabatt-Bereich
            elif discount_percentage > 25:
                base_increase *= 0.8  # Zu hoher Rabatt
            
            return round(base_increase, 2)
            
        except Exception as e:
            logger.error(f"Fehler bei Revenue-Vorhersage: {e}")
            return 0.0
    
    def _calculate_optimization_confidence(self, current_usage_rate: float,
                                         days_active: int, customer_segments: List[CustomerSegment]) -> float:
        """Berechne Confidence Score für Optimierung"""
        try:
            confidence = 0.0
            
            # Basis-Confidence aus Nutzungsrate
            if 0.3 <= current_usage_rate <= 0.7:
                confidence += 0.4  # Mittlere Nutzung = gute Daten
            elif current_usage_rate > 0.7:
                confidence += 0.3  # Hohe Nutzung
            else:
                confidence += 0.2  # Niedrige Nutzung
            
            # Dauer der Aktivität
            if days_active >= 30:
                confidence += 0.3  # Ausreichend Daten
            elif days_active >= 14:
                confidence += 0.2
            else:
                confidence += 0.1
            
            # Kunden-Segmente
            if len(customer_segments) >= 3:
                confidence += 0.2  # Mehrere Segmente
            elif len(customer_segments) >= 1:
                confidence += 0.1
            
            # Datenqualität
            total_customers = sum(seg.customer_count for seg in customer_segments)
            if total_customers >= 100:
                confidence += 0.1  # Ausreichend Kunden
            
            return min(confidence, 1.0)
            
        except Exception as e:
            logger.error(f"Fehler bei Confidence-Berechnung: {e}")
            return 0.5
    
    def _identify_target_segments(self, voucher_type: str, nominal: float,
                                customer_segments: List[CustomerSegment]) -> List[str]:
        """Identifiziere Ziel-Kundensegmente"""
        try:
            target_segments = []
            
            for segment in customer_segments:
                # Kriterien für Ziel-Segmente
                is_target = False
                
                # Voucher-affine Kunden
                if segment.voucher_usage_rate > 0.3:
                    is_target = True
                
                # Preis-sensitive Kunden für hohe Rabatte
                if nominal > 10 and segment.price_sensitivity > 0.08:
                    is_target = True
                
                # Regelmäßige Käufer für moderate Rabatte
                if 5 <= nominal <= 10 and segment.purchase_frequency > 0.1:
                    is_target = True
                
                # Premium-Kunden für exklusive Angebote
                if segment.avg_purchase_value > 100 and nominal > 15:
                    is_target = True
                
                if is_target:
                    target_segments.append(segment.segment_name)
            
            return target_segments[:3]  # Maximal 3 Ziel-Segmente
            
        except Exception as e:
            logger.error(f"Fehler bei Ziel-Segment-Identifikation: {e}")
            return []
    
    def _get_seasonal_factors(self, voucher_type: str) -> Dict[str, Any]:
        """Hole saisonale Faktoren"""
        try:
            current_month = datetime.now().month
            
            # Saisonale Faktoren basierend auf Voucher-Typ
            seasonal_factors = {
                'prozent': {
                    'high_season': [11, 12, 1, 2],  # Weihnachten, Neujahr
                    'medium_season': [3, 4, 9, 10],  # Frühling, Herbst
                    'low_season': [5, 6, 7, 8]      # Sommer
                },
                'betrag': {
                    'high_season': [11, 12],        # Weihnachten
                    'medium_season': [1, 2, 9, 10], # Neujahr, Herbst
                    'low_season': [3, 4, 5, 6, 7, 8] # Rest des Jahres
                },
                'versandkosten': {
                    'high_season': [11, 12],        # Online-Shopping
                    'medium_season': [1, 2, 9, 10], # Nach-Feiertage
                    'low_season': [3, 4, 5, 6, 7, 8] # Sommer
                }
            }
            
            factors = seasonal_factors.get(voucher_type, seasonal_factors['betrag'])
            
            if current_month in factors['high_season']:
                season = 'hoch'
                factor = 1.3
            elif current_month in factors['medium_season']:
                season = 'mittel'
                factor = 1.0
            else:
                season = 'niedrig'
                factor = 0.8
            
            return {
                'current_season': season,
                'seasonal_factor': factor,
                'month': current_month,
                'recommendation': f"Saisonale Anpassung für {season} Saison"
            }
            
        except Exception as e:
            logger.error(f"Fehler bei saisonalen Faktoren: {e}")
            return {
                'current_season': 'unbekannt',
                'seasonal_factor': 1.0,
                'month': datetime.now().month,
                'recommendation': 'Standard-Empfehlung'
            }
    
    def _assess_optimization_risk(self, nominal: float, minimal_buying: float,
                                expected_revenue: float, customer_segments: List[CustomerSegment]) -> Dict[str, Any]:
        """Bewerte Optimierungs-Risiko"""
        try:
            risk_score = 0.0
            risk_factors = []
            
            # Rabatt-Höhe Risiko
            discount_percentage = (nominal / minimal_buying) * 100
            if discount_percentage > 25:
                risk_score += 0.4
                risk_factors.append("Sehr hoher Rabatt (>25%)")
            elif discount_percentage > 20:
                risk_score += 0.2
                risk_factors.append("Hoher Rabatt (>20%)")
            
            # Margen-Risiko
            if minimal_buying < nominal * 2:
                risk_score += 0.3
                risk_factors.append("Niedrige Mindestbestellmenge")
            
            # Kunden-Segment Risiko
            price_sensitive_customers = sum(seg.customer_count for seg in customer_segments if seg.price_sensitivity > 0.1)
            total_customers = sum(seg.customer_count for seg in customer_segments)
            
            if total_customers > 0 and price_sensitive_customers / total_customers > 0.7:
                risk_score += 0.2
                risk_factors.append("Hoher Anteil preis-sensitiver Kunden")
            
            # Revenue-Risiko
            if expected_revenue < nominal * 10:
                risk_score += 0.3
                risk_factors.append("Niedrige erwartete Revenue-Steigerung")
            
            # Risiko-Level bestimmen
            if risk_score >= 0.7:
                risk_level = "hoch"
            elif risk_score >= 0.4:
                risk_level = "mittel"
            else:
                risk_level = "niedrig"
            
            return {
                'risk_score': round(risk_score, 2),
                'risk_level': risk_level,
                'risk_factors': risk_factors,
                'recommendation': self._get_risk_recommendation(risk_level, risk_factors)
            }
            
        except Exception as e:
            logger.error(f"Fehler bei Risiko-Bewertung: {e}")
            return {
                'risk_score': 0.5,
                'risk_level': 'unbekannt',
                'risk_factors': ['Fehler bei Risiko-Bewertung'],
                'recommendation': 'Manuelle Überprüfung empfohlen'
            }
    
    def _get_risk_recommendation(self, risk_level: str, risk_factors: List[str]) -> str:
        """Generiere Risiko-Empfehlung"""
        if risk_level == "hoch":
            return "Vorsicht: Hohes Risiko. Schrittweise Implementierung empfohlen."
        elif risk_level == "mittel":
            return "Moderates Risiko. Überwachung während Implementierung."
        else:
            return "Niedriges Risiko. Sichere Implementierung möglich."
    
    def get_voucher_analytics(self) -> Dict[str, Any]:
        """Hole Voucher-Analytics"""
        try:
            cursor = self.db_connection.cursor()
            
            # Gesamtstatistiken
            cursor.execute("""
                SELECT 
                    COUNT(*) as total_vouchers,
                    COUNT(CASE WHEN is_active = 1 THEN 1 END) as active_vouchers,
                    SUM(used_count) as total_usage,
                    AVG(nominal) as avg_nominal,
                    AVG(used_count * 1.0 / kuota) as avg_usage_rate
                FROM vouchers
            """)
            
            stats = cursor.fetchone()
            
            # Typ-Analyse
            cursor.execute("""
                SELECT type,
                       COUNT(*) as count,
                       AVG(nominal) as avg_nominal,
                       AVG(used_count * 1.0 / kuota) as avg_usage_rate
                FROM vouchers
                GROUP BY type
                ORDER BY count DESC
            """)
            
            types = cursor.fetchall()
            
            # Performance-Analyse
            performance_analysis = {
                'excellent': 0,
                'good': 0,
                'poor': 0
            }
            
            for optimization in self.optimization_history[-100:]:
                if optimization.get('expected_revenue_increase', 0) > 1000:
                    performance_analysis['excellent'] += 1
                elif optimization.get('expected_revenue_increase', 0) > 500:
                    performance_analysis['good'] += 1
                else:
                    performance_analysis['poor'] += 1
            
            return {
                'total_vouchers': stats[0],
                'active_vouchers': stats[1],
                'total_usage': stats[2],
                'avg_nominal': stats[3],
                'avg_usage_rate': stats[4],
                'voucher_types': [{
                    'type': t[0],
                    'count': t[1],
                    'avg_nominal': t[2],
                    'avg_usage_rate': t[3]
                } for t in types],
                'performance_distribution': performance_analysis,
                'optimizations_generated': len(self.optimization_history)
            }
            
        except Exception as e:
            logger.error(f"Fehler bei Voucher-Analytics: {e}")
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
            voucher_df = self._extract_voucher_data()
            transaction_df = self._extract_transaction_data()
            
            if voucher_df.empty or transaction_df.empty:
                return {'error': 'Zu wenig Testdaten'}
            
            # Teste Revenue Predictor
            transaction_features = [
                'total_amount', 'discount_amount', 'item_count', 'avg_item_price',
                'discount_percentage', 'has_voucher', 'month', 'day_of_week', 'hour'
            ]
            
            X_transaction = transaction_df[transaction_features].fillna(0)
            y_revenue = transaction_df['total_amount']
            
            X_transaction_scaled = self.scaler.transform(X_transaction)
            y_pred = self.revenue_predictor.predict(X_transaction_scaled)
            
            mae = mean_absolute_error(y_revenue, y_pred)
            mse = mean_squared_error(y_revenue, y_pred)
            r2 = r2_score(y_revenue, y_pred)
            
            # Teste Voucher Performance Predictor
            voucher_features = [
                'nominal', 'kuota', 'minimal_buying', 'duration_days',
                'discount_percentage', 'month', 'quarter'
            ]
            
            X_voucher = voucher_df[voucher_features].fillna(0)
            y_performance = voucher_df['usage_rate']
            
            X_voucher_scaled = self.scaler.transform(X_voucher)
            y_pred_performance = self.voucher_performance_predictor.predict(X_voucher_scaled)
            
            mae_performance = mean_absolute_error(y_performance, y_pred_performance)
            
            return {
                'revenue_predictor_mae': mae,
                'revenue_predictor_mse': mse,
                'revenue_predictor_r2': r2,
                'voucher_performance_mae': mae_performance,
                'test_samples_transactions': len(transaction_df),
                'test_samples_vouchers': len(voucher_df)
            }
            
        except Exception as e:
            logger.error(f"Fehler beim Testen der Modelle: {e}")
            return {'error': str(e)} 