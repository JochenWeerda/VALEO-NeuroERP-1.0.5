"""
AI Service für VALEO NeuroERP
Predictive Analytics und intelligente Datenanalyse
"""

import asyncio
import logging
from datetime import datetime, timedelta
from typing import Dict, List, Optional, Any
import numpy as np
import pandas as pd
from sklearn.ensemble import RandomForestRegressor, IsolationForest
from sklearn.preprocessing import StandardScaler
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_absolute_error, mean_squared_error
import joblib
import json

logger = logging.getLogger(__name__)

class AIService:
    """AI Service für Predictive Analytics"""
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.anomaly_detector = None
        self.is_initialized = False
        
    async def initialize(self):
        """Initialisiert AI-Service und lädt Modelle"""
        try:
            logger.info("Initialisiere AI-Service...")
            
            # Anomaly Detection Model
            self.anomaly_detector = IsolationForest(
                contamination=0.1,
                random_state=42
            )
            
            # Predictive Models
            self.models['transaction_forecast'] = RandomForestRegressor(
                n_estimators=100,
                random_state=42
            )
            
            self.models['inventory_optimization'] = RandomForestRegressor(
                n_estimators=100,
                random_state=42
            )
            
            # Scaler für Feature Normalisierung
            self.scalers['transaction'] = StandardScaler()
            self.scalers['inventory'] = StandardScaler()
            
            self.is_initialized = True
            logger.info("AI-Service erfolgreich initialisiert")
            
        except Exception as e:
            logger.error(f"Fehler bei AI-Service Initialisierung: {e}")
            raise
    
    async def predict_transaction_trends(self, historical_data: List[Dict]) -> Dict[str, Any]:
        """Vorhersage von Transaktionstrends"""
        try:
            if not self.is_initialized:
                await self.initialize()
            
            # Daten vorbereiten
            df = pd.DataFrame(historical_data)
            df['date'] = pd.to_datetime(df['date'])
            df['month'] = df['date'].dt.month
            df['day_of_week'] = df['date'].dt.dayofweek
            df['amount'] = pd.to_numeric(df['amount'])
            
            # Features erstellen
            features = ['month', 'day_of_week', 'amount']
            X = df[features].values
            y = df['amount'].values
            
            # Modell trainieren
            X_train, X_test, y_train, y_test = train_test_split(
                X, y, test_size=0.2, random_state=42
            )
            
            # Scaler anpassen
            X_train_scaled = self.scalers['transaction'].fit_transform(X_train)
            X_test_scaled = self.scalers['transaction'].transform(X_test)
            
            # Modell trainieren
            model = self.models['transaction_forecast']
            model.fit(X_train_scaled, y_train)
            
            # Vorhersage für nächste 30 Tage
            future_dates = pd.date_range(
                start=datetime.now(),
                periods=30,
                freq='D'
            )
            
            future_features = []
            for date in future_dates:
                future_features.append([
                    date.month,
                    date.dayofweek,
                    df['amount'].mean()  # Durchschnittlicher Betrag
                ])
            
            future_X = np.array(future_features)
            future_X_scaled = self.scalers['transaction'].transform(future_X)
            predictions = model.predict(future_X_scaled)
            
            # Metriken berechnen
            y_pred_test = model.predict(X_test_scaled)
            mae = mean_absolute_error(y_test, y_pred_test)
            mse = mean_squared_error(y_test, y_pred_test)
            
            return {
                'predictions': predictions.tolist(),
                'dates': [d.strftime('%Y-%m-%d') for d in future_dates],
                'metrics': {
                    'mae': float(mae),
                    'mse': float(mse),
                    'rmse': float(np.sqrt(mse))
                },
                'confidence': 0.85
            }
            
        except Exception as e:
            logger.error(f"Fehler bei Transaktionsvorhersage: {e}")
            return {
                'error': str(e),
                'predictions': [],
                'confidence': 0.0
            }
    
    async def detect_anomalies(self, data: List[Dict], data_type: str = 'transactions') -> Dict[str, Any]:
        """Erkennt Anomalien in den Daten"""
        try:
            if not self.is_initialized:
                await self.initialize()
            
            df = pd.DataFrame(data)
            
            if data_type == 'transactions':
                # Anomalien in Transaktionsbeträgen
                amounts = df['amount'].values.reshape(-1, 1)
                anomaly_scores = self.anomaly_detector.fit_predict(amounts)
                
                anomalies = df[anomaly_scores == -1]
                normal = df[anomaly_scores == 1]
                
                return {
                    'anomalies': anomalies.to_dict('records'),
                    'normal_count': len(normal),
                    'anomaly_count': len(anomalies),
                    'anomaly_percentage': len(anomalies) / len(df) * 100,
                    'severity': 'high' if len(anomalies) / len(df) > 0.1 else 'medium'
                }
            
            elif data_type == 'inventory':
                # Anomalien im Inventar
                quantities = df['quantity'].values.reshape(-1, 1)
                prices = df['unit_price'].values.reshape(-1, 1)
                
                # Kombinierte Features
                features = np.hstack([quantities, prices])
                anomaly_scores = self.anomaly_detector.fit_predict(features)
                
                anomalies = df[anomaly_scores == -1]
                
                return {
                    'anomalies': anomalies.to_dict('records'),
                    'normal_count': len(df) - len(anomalies),
                    'anomaly_count': len(anomalies),
                    'anomaly_percentage': len(anomalies) / len(df) * 100,
                    'severity': 'high' if len(anomalies) / len(df) > 0.15 else 'medium'
                }
            
            else:
                raise ValueError(f"Unbekannter Datentyp: {data_type}")
                
        except Exception as e:
            logger.error(f"Fehler bei Anomalie-Erkennung: {e}")
            return {
                'error': str(e),
                'anomalies': [],
                'severity': 'unknown'
            }
    
    async def optimize_inventory(self, inventory_data: List[Dict], 
                               demand_history: List[Dict]) -> Dict[str, Any]:
        """Optimiert Inventar basierend auf Nachfragevorhersage"""
        try:
            if not self.is_initialized:
                await self.initialize()
            
            # Nachfragevorhersage
            demand_df = pd.DataFrame(demand_history)
            demand_df['date'] = pd.to_datetime(demand_df['date'])
            
            # Features für Nachfragevorhersage
            demand_features = []
            demand_targets = []
            
            for i in range(len(demand_df) - 7):  # 7-Tage Lookback
                features = demand_df['quantity'].iloc[i:i+7].values
                target = demand_df['quantity'].iloc[i+7]
                
                demand_features.append(features)
                demand_targets.append(target)
            
            if len(demand_features) < 10:
                return {
                    'error': 'Unzureichende Daten für Vorhersage',
                    'recommendations': []
                }
            
            X = np.array(demand_features)
            y = np.array(demand_targets)
            
            # Modell trainieren
            model = self.models['inventory_optimization']
            model.fit(X, y)
            
            # Vorhersage für nächste 7 Tage
            last_week = demand_df['quantity'].tail(7).values.reshape(1, -1)
            predicted_demand = model.predict(last_week)[0]
            
            # Inventar-Optimierung
            inventory_df = pd.DataFrame(inventory_data)
            recommendations = []
            
            for _, item in inventory_df.iterrows():
                current_stock = item['quantity']
                safety_stock = max(predicted_demand * 0.2, 5)  # 20% Safety Stock
                optimal_stock = predicted_demand + safety_stock
                
                if current_stock < optimal_stock * 0.8:
                    action = 'restock'
                    urgency = 'high' if current_stock < safety_stock else 'medium'
                elif current_stock > optimal_stock * 1.5:
                    action = 'reduce'
                    urgency = 'medium'
                else:
                    action = 'maintain'
                    urgency = 'low'
                
                recommendations.append({
                    'item_id': item['id'],
                    'item_name': item['name'],
                    'current_stock': int(current_stock),
                    'optimal_stock': int(optimal_stock),
                    'action': action,
                    'urgency': urgency,
                    'predicted_demand': int(predicted_demand),
                    'safety_stock': int(safety_stock)
                })
            
            return {
                'recommendations': recommendations,
                'predicted_demand': int(predicted_demand),
                'confidence': 0.82
            }
            
        except Exception as e:
            logger.error(f"Fehler bei Inventar-Optimierung: {e}")
            return {
                'error': str(e),
                'recommendations': []
            }
    
    async def analyze_user_behavior(self, user_data: List[Dict]) -> Dict[str, Any]:
        """Analysiert Benutzerverhalten für Personalisierung"""
        try:
            df = pd.DataFrame(user_data)
            
            # Benutzer-Segmentierung
            if 'login_count' in df.columns and 'last_login' in df.columns:
                # Aktive vs. inaktive Benutzer
                df['days_since_login'] = (
                    datetime.now() - pd.to_datetime(df['last_login'])
                ).dt.days
                
                active_users = df[df['days_since_login'] <= 7]
                inactive_users = df[df['days_since_login'] > 30]
                
                # Feature-Nutzung Analyse
                feature_usage = {}
                if 'features_used' in df.columns:
                    for features in df['features_used'].dropna():
                        if isinstance(features, str):
                            features = json.loads(features)
                        for feature in features:
                            feature_usage[feature] = feature_usage.get(feature, 0) + 1
                
                return {
                    'total_users': len(df),
                    'active_users': len(active_users),
                    'inactive_users': len(inactive_users),
                    'engagement_rate': len(active_users) / len(df) * 100,
                    'feature_usage': feature_usage,
                    'user_segments': {
                        'power_users': len(df[df['login_count'] > 50]),
                        'regular_users': len(df[(df['login_count'] > 10) & (df['login_count'] <= 50)]),
                        'casual_users': len(df[df['login_count'] <= 10])
                    }
                }
            
            return {
                'error': 'Unzureichende Benutzerdaten für Analyse',
                'total_users': len(df)
            }
            
        except Exception as e:
            logger.error(f"Fehler bei Benutzerverhaltensanalyse: {e}")
            return {
                'error': str(e),
                'total_users': 0
            }
    
    async def generate_insights(self, data: Dict[str, Any]) -> List[Dict[str, Any]]:
        """Generiert intelligente Insights aus Daten"""
        insights = []
        
        try:
            # Transaktions-Insights
            if 'transactions' in data:
                transactions = data['transactions']
                if transactions:
                    total_amount = sum(t['amount'] for t in transactions)
                    avg_amount = total_amount / len(transactions)
                    
                    insights.append({
                        'type': 'transaction',
                        'title': 'Transaktionsanalyse',
                        'description': f'Durchschnittlicher Transaktionsbetrag: €{avg_amount:.2f}',
                        'severity': 'info',
                        'confidence': 0.95
                    })
            
            # Inventar-Insights
            if 'inventory' in data:
                inventory = data['inventory']
                if inventory:
                    low_stock_items = [item for item in inventory if item['quantity'] < 10]
                    
                    if low_stock_items:
                        insights.append({
                            'type': 'inventory',
                            'title': 'Niedriger Lagerbestand',
                            'description': f'{len(low_stock_items)} Artikel haben niedrigen Lagerbestand',
                            'severity': 'warning',
                            'confidence': 0.90,
                            'items': low_stock_items
                        })
            
            # Performance-Insights
            if 'performance' in data:
                performance = data['performance']
                if performance.get('response_time', 0) > 2.0:
                    insights.append({
                        'type': 'performance',
                        'title': 'Langsame Antwortzeiten',
                        'description': 'System zeigt erhöhte Antwortzeiten',
                        'severity': 'warning',
                        'confidence': 0.85
                    })
            
            return insights
            
        except Exception as e:
            logger.error(f"Fehler bei Insight-Generierung: {e}")
            return [{
                'type': 'error',
                'title': 'Analyse-Fehler',
                'description': str(e),
                'severity': 'error',
                'confidence': 0.0
            }]
    
    async def get_ai_health_status(self) -> Dict[str, Any]:
        """Gibt den Gesundheitsstatus des AI-Services zurück"""
        return {
            'status': 'healthy' if self.is_initialized else 'initializing',
            'models_loaded': len(self.models),
            'anomaly_detector_ready': self.anomaly_detector is not None,
            'last_update': datetime.now().isoformat(),
            'version': '2.0.0'
        }

# Singleton-Instanz
ai_service = AIService() 