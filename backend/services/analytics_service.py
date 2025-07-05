from typing import Dict, List, Optional
from datetime import datetime
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import pandas as pd
import numpy as np
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestRegressor
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, r2_score
import tensorflow as tf
from transformers import pipeline

class AnalyticsService:
    def __init__(self, mongodb_uri: str):
        self.client = AsyncIOMotorClient(mongodb_uri)
        self.db = self.client.valeo_erp
        self.sentiment_analyzer = pipeline("sentiment-analysis")
        
    async def get_sales_analytics(self, start_date: datetime, end_date: datetime) -> Dict:
        """Analysiert Verkaufsdaten im angegebenen Zeitraum."""
        pipeline = [
            {
                "$match": {
                    "datum": {"$gte": start_date, "$lte": end_date},
                    "typ": "verkauf"
                }
            },
            {
                "$group": {
                    "_id": {
                        "year": {"$year": "$datum"},
                        "month": {"$month": "$datum"}
                    },
                    "umsatz": {"$sum": "$betrag"},
                    "anzahl": {"$sum": 1}
                }
            },
            {"$sort": {"_id.year": 1, "_id.month": 1}}
        ]
        
        results = await self.db.transaktionen.aggregate(pipeline).to_list(None)
        return {
            "zeitreihe": results,
            "gesamt_umsatz": sum(r["umsatz"] for r in results),
            "durchschnitt_pro_monat": sum(r["umsatz"] for r in results) / len(results) if results else 0
        }
    
    async def analyze_customer_segments(self) -> Dict:
        """Führt eine Kundenanalyse mit K-Means Clustering durch."""
        customers = await self.db.kunden.find({}).to_list(None)
        
        if not customers:
            return {"error": "Keine Kundendaten gefunden"}
            
        # Vorbereitung der Daten für Clustering
        features = pd.DataFrame([{
            'jahresumsatz': c.get('jahresumsatz', 0),
            'bestellhaeufigkeit': c.get('bestellhaeufigkeit', 0),
            'durchschnittlicher_bestellwert': c.get('durchschnittlicher_bestellwert', 0)
        } for c in customers])
        
        # Normalisierung
        scaler = StandardScaler()
        features_scaled = scaler.fit_transform(features)
        
        # K-Means Clustering
        kmeans = KMeans(n_clusters=4, random_state=42)
        clusters = kmeans.fit_predict(features_scaled)
        
        # Segmentanalyse
        segments = []
        for i in range(4):
            segment_mask = clusters == i
            segment_data = features[segment_mask]
            segments.append({
                "segment_id": i,
                "anzahl_kunden": len(segment_data),
                "durchschnittlicher_jahresumsatz": segment_data['jahresumsatz'].mean(),
                "durchschnittliche_bestellhaeufigkeit": segment_data['bestellhaeufigkeit'].mean(),
                "durchschnittlicher_bestellwert": segment_data['durchschnittlicher_bestellwert'].mean()
            })
        
        return {
            "segments": segments,
            "total_customers": len(customers)
        }
    
    async def get_inventory_optimization(self) -> Dict:
        """Berechnet optimierte Lagerbestandsempfehlungen."""
        inventory = await self.db.lagerbestand.find({}).to_list(None)
        
        if not inventory:
            return {"error": "Keine Lagerbestandsdaten gefunden"}
            
        recommendations = []
        for item in inventory:
            # ABC-Analyse basierend auf Umsatz und Bestandskosten
            importance_score = (item.get('jahresumsatz', 0) * 0.7 + 
                              item.get('bestandskosten', 0) * 0.3)
            
            # Berechnung der optimalen Bestellmenge
            annual_demand = item.get('jahresbedarf', 0)
            ordering_cost = item.get('bestellkosten', 0)
            holding_cost = item.get('lagerkosten', 0)
            
            if annual_demand > 0 and ordering_cost > 0 and holding_cost > 0:
                eoq = np.sqrt((2 * annual_demand * ordering_cost) / holding_cost)
            else:
                eoq = 0
                
            recommendations.append({
                "artikel_id": item.get('_id'),
                "artikelname": item.get('name'),
                "importance_score": importance_score,
                "optimal_order_quantity": eoq,
                "current_stock": item.get('aktueller_bestand', 0),
                "recommendation": "nachbestellen" if item.get('aktueller_bestand', 0) < eoq else "ausreichend"
            })
        
        return {
            "recommendations": sorted(recommendations, 
                                   key=lambda x: x['importance_score'], 
                                   reverse=True),
            "total_items": len(inventory)
        }

    async def predict_sales(self, product_id: str, forecast_periods: int = 12) -> Dict:
        """Prognostiziert Verkaufszahlen mit Random Forest."""
        # Historische Daten laden
        sales_data = await self.db.transaktionen.find({
            "produkt_id": product_id,
            "typ": "verkauf"
        }).to_list(None)

        if not sales_data:
            return {"error": "Keine Verkaufsdaten gefunden"}

        # Daten für ML vorbereiten
        df = pd.DataFrame(sales_data)
        df['datum'] = pd.to_datetime(df['datum'])
        df = df.set_index('datum')
        df = df.resample('M')['menge'].sum().reset_index()

        # Features erstellen
        df['month'] = df['datum'].dt.month
        df['year'] = df['datum'].dt.year
        df['trend'] = np.arange(len(df))

        # Train-Test-Split
        X = df[['month', 'year', 'trend']]
        y = df['menge']
        X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

        # Model Training
        model = RandomForestRegressor(n_estimators=100, random_state=42)
        model.fit(X_train, y_train)

        # Vorhersage
        future_dates = pd.date_range(start=df['datum'].max(), periods=forecast_periods + 1, freq='M')[1:]
        future_df = pd.DataFrame({
            'datum': future_dates,
            'month': future_dates.month,
            'year': future_dates.year,
            'trend': np.arange(len(df), len(df) + len(future_dates))
        })

        predictions = model.predict(future_df[['month', 'year', 'trend']])

        return {
            "forecast": [
                {"date": date.strftime("%Y-%m"), "predicted_sales": float(pred)}
                for date, pred in zip(future_dates, predictions)
            ],
            "model_metrics": {
                "r2_score": r2_score(y_test, model.predict(X_test)),
                "rmse": np.sqrt(mean_squared_error(y_test, model.predict(X_test)))
            }
        }

    async def analyze_customer_feedback(self, feedback_text: str) -> Dict:
        """Analysiert Kundenfeedback mit NLP."""
        sentiment_result = self.sentiment_analyzer(feedback_text)
        
        return {
            "sentiment": sentiment_result[0]["label"],
            "confidence": sentiment_result[0]["score"],
            "text_length": len(feedback_text),
            "language": "de"  # Könnte mit Spracherkennung erweitert werden
        }

    async def detect_anomalies(self, data_type: str, threshold: float = 2.0) -> Dict:
        """Erkennt Anomalien in verschiedenen Datensätzen mit ML."""
        collection_map = {
            "sales": "transaktionen",
            "inventory": "lagerbestand",
            "production": "produktion"
        }

        if data_type not in collection_map:
            return {"error": "Ungültiger Datentyp"}

        # Daten laden
        data = await self.db[collection_map[data_type]].find({}).to_list(None)
        if not data:
            return {"error": "Keine Daten gefunden"}

        df = pd.DataFrame(data)
        
        # Numerische Spalten für Anomalieerkennung
        numeric_cols = df.select_dtypes(include=[np.number]).columns

        anomalies = {}
        for col in numeric_cols:
            values = df[col].values
            mean = np.mean(values)
            std = np.std(values)
            
            # Z-Score basierte Anomalieerkennung
            z_scores = np.abs((values - mean) / std)
            anomaly_indices = np.where(z_scores > threshold)[0]
            
            if len(anomaly_indices) > 0:
                anomalies[col] = {
                    "indices": anomaly_indices.tolist(),
                    "values": values[anomaly_indices].tolist(),
                    "z_scores": z_scores[anomaly_indices].tolist()
                }

        return {
            "data_type": data_type,
            "anomalies_found": len(anomalies) > 0,
            "anomalies": anomalies,
            "threshold_used": threshold
        } 