"""
Datenanalyse-Tasks für das VALEO-NeuroERP-System.

Dieses Modul enthält Celery-Tasks für zeitintensive Datenanalysen,
die asynchron im Hintergrund ausgeführt werden.
"""

import os
import time
import logging
import json
import numpy as np
import pandas as pd
from typing import Dict, Any, List, Optional, Union, Tuple
from celery import shared_task

# Für Zeitreihenanalyse
from statsmodels.tsa.arima.model import ARIMA

# Für Cluster-Analyse
from sklearn.cluster import KMeans, DBSCAN
from sklearn.preprocessing import StandardScaler

# Für Anomalieerkennung
from sklearn.ensemble import IsolationForest

# Für prädiktive Modellierung
from sklearn.ensemble import RandomForestRegressor, RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import mean_squared_error, accuracy_score

# Lokale Imports
from backend.services.task_queue import update_task_progress

logger = logging.getLogger(__name__)

@shared_task(bind=True)
def analyze_time_series(self, data_path: str, column: str, 
                       p: int = 1, d: int = 1, q: int = 1) -> Dict[str, Any]:
    """
    Führt eine ARIMA-Zeitreihenanalyse auf den angegebenen Daten durch.
    
    Args:
        data_path: Pfad zur CSV-Datei mit Zeitreihendaten
        column: Name der zu analysierenden Spalte
        p: Autoregressive Ordnung (AR)
        d: Differenzierungsgrad (I)
        q: Moving-Average-Ordnung (MA)
        
    Returns:
        Dict mit Analyseergebnissen und Vorhersagen
    """
    logger.info(f"Starte Zeitreihenanalyse für {data_path}, Spalte {column}")
    
    try:
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 10, "Daten werden geladen")
        
        # Daten laden
        df = pd.read_csv(data_path, parse_dates=True)
        if column not in df.columns:
            raise ValueError(f"Spalte {column} nicht in Datensatz gefunden")
        
        series = df[column].astype(float)
        
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 30, "ARIMA-Modell wird trainiert")
        
        # ARIMA-Modell anwenden
        model = ARIMA(series, order=(p, d, q))
        model_fit = model.fit()
        
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 60, "Vorhersagen werden generiert")
        
        # Vorhersagen für die nächsten 10 Perioden
        forecast_steps = 10
        forecast = model_fit.forecast(steps=forecast_steps)
        
        # Ergebnisse zusammenstellen
        results = {
            "model_summary": model_fit.summary().tables[1].as_html(),
            "forecast": forecast.tolist(),
            "aic": model_fit.aic,
            "bic": model_fit.bic
        }
        
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 100, "Zeitreihenanalyse abgeschlossen")
        
        return results
        
    except Exception as e:
        logger.error(f"Fehler bei der Zeitreihenanalyse: {str(e)}")
        raise

@shared_task(bind=True)
def perform_cluster_analysis(self, data_path: str, columns: List[str], 
                            method: str = "kmeans", n_clusters: int = 3) -> Dict[str, Any]:
    """
    Führt eine Cluster-Analyse auf den angegebenen Daten durch.
    
    Args:
        data_path: Pfad zur CSV-Datei mit Daten
        columns: Liste der zu verwendenden Spalten
        method: Clustering-Methode ('kmeans' oder 'dbscan')
        n_clusters: Anzahl der Cluster (nur für KMeans)
        
    Returns:
        Dict mit Cluster-Zuordnungen und Statistiken
    """
    logger.info(f"Starte Cluster-Analyse für {data_path} mit Methode {method}")
    
    try:
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 10, "Daten werden geladen")
        
        # Daten laden
        df = pd.read_csv(data_path)
        
        # Prüfen, ob alle angegebenen Spalten existieren
        missing_columns = [col for col in columns if col not in df.columns]
        if missing_columns:
            raise ValueError(f"Spalten nicht gefunden: {', '.join(missing_columns)}")
        
        # Nur die angegebenen Spalten verwenden
        data = df[columns].copy()
        
        # Fehlende Werte behandeln
        data = data.dropna()
        
        # Daten standardisieren
        update_task_progress(self.request.id, 30, "Daten werden standardisiert")
        scaler = StandardScaler()
        scaled_data = scaler.fit_transform(data)
        
        # Clustering durchführen
        update_task_progress(self.request.id, 50, f"Clustering mit {method} wird durchgeführt")
        
        if method.lower() == "kmeans":
            model = KMeans(n_clusters=n_clusters, random_state=42)
            clusters = model.fit_predict(scaled_data)
            
            # Cluster-Zentren in ursprünglichen Skala zurücktransformieren
            centers = scaler.inverse_transform(model.cluster_centers_)
            
            # Ergebnisse zusammenstellen
            results = {
                "cluster_assignments": clusters.tolist(),
                "cluster_centers": centers.tolist(),
                "inertia": model.inertia_
            }
            
        elif method.lower() == "dbscan":
            model = DBSCAN(eps=0.5, min_samples=5)
            clusters = model.fit_predict(scaled_data)
            
            # Anzahl der Cluster (ohne Rauschen)
            n_clusters_found = len(set(clusters)) - (1 if -1 in clusters else 0)
            
            # Ergebnisse zusammenstellen
            results = {
                "cluster_assignments": clusters.tolist(),
                "n_clusters": n_clusters_found,
                "n_noise": list(clusters).count(-1)
            }
            
        else:
            raise ValueError(f"Unbekannte Clustering-Methode: {method}")
        
        # Cluster-Statistiken berechnen
        update_task_progress(self.request.id, 80, "Cluster-Statistiken werden berechnet")
        
        df['cluster'] = clusters
        cluster_stats = df.groupby('cluster').agg(['mean', 'std', 'count'])
        
        # In JSON-serialisierbares Format umwandeln
        stats_dict = {}
        for col in cluster_stats.columns.levels[0]:
            stats_dict[col] = {}
            for stat in cluster_stats.columns.levels[1]:
                stats_dict[col][stat] = cluster_stats[col, stat].to_dict()
        
        results["cluster_stats"] = stats_dict
        
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 100, "Cluster-Analyse abgeschlossen")
        
        return results
        
    except Exception as e:
        logger.error(f"Fehler bei der Cluster-Analyse: {str(e)}")
        raise

@shared_task(bind=True)
def detect_anomalies(self, data_path: str, columns: List[str], 
                    contamination: float = 0.05) -> Dict[str, Any]:
    """
    Erkennt Anomalien in den angegebenen Daten mit Isolation Forest.
    
    Args:
        data_path: Pfad zur CSV-Datei mit Daten
        columns: Liste der zu verwendenden Spalten
        contamination: Erwarteter Anteil der Anomalien
        
    Returns:
        Dict mit Anomalie-Flags und -Scores
    """
    logger.info(f"Starte Anomalieerkennung für {data_path}")
    
    try:
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 10, "Daten werden geladen")
        
        # Daten laden
        df = pd.read_csv(data_path)
        
        # Prüfen, ob alle angegebenen Spalten existieren
        missing_columns = [col for col in columns if col not in df.columns]
        if missing_columns:
            raise ValueError(f"Spalten nicht gefunden: {', '.join(missing_columns)}")
        
        # Nur die angegebenen Spalten verwenden
        data = df[columns].copy()
        
        # Fehlende Werte behandeln
        data = data.dropna()
        
        # Anomalieerkennung durchführen
        update_task_progress(self.request.id, 40, "Isolation Forest wird angewendet")
        
        model = IsolationForest(contamination=contamination, random_state=42)
        anomaly_labels = model.fit_predict(data)
        anomaly_scores = model.score_samples(data)
        
        # -1 für Anomalien, 1 für normale Datenpunkte in Isolation Forest
        # Umwandeln in boolean (True für Anomalien)
        anomalies = (anomaly_labels == -1)
        
        # Ergebnisse zusammenstellen
        update_task_progress(self.request.id, 70, "Ergebnisse werden zusammengestellt")
        
        # Original-Indizes speichern
        original_indices = data.index.tolist()
        
        results = {
            "anomaly_flags": anomalies.tolist(),
            "anomaly_scores": anomaly_scores.tolist(),
            "original_indices": original_indices,
            "num_anomalies": sum(anomalies),
            "total_samples": len(anomalies)
        }
        
        # Statistiken zu Anomalien
        if sum(anomalies) > 0:
            anomaly_data = data.iloc[anomalies]
            normal_data = data.iloc[~anomalies]
            
            # Mittelwerte und Standardabweichungen für normale und anomale Datenpunkte
            results["anomaly_stats"] = {
                "mean": {col: float(anomaly_data[col].mean()) for col in columns},
                "std": {col: float(anomaly_data[col].std()) for col in columns}
            }
            
            results["normal_stats"] = {
                "mean": {col: float(normal_data[col].mean()) for col in columns},
                "std": {col: float(normal_data[col].std()) for col in columns}
            }
        
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 100, "Anomalieerkennung abgeschlossen")
        
        return results
        
    except Exception as e:
        logger.error(f"Fehler bei der Anomalieerkennung: {str(e)}")
        raise

@shared_task(bind=True)
def build_predictive_model(self, data_path: str, target_column: str, 
                          feature_columns: List[str], model_type: str = "regression",
                          test_size: float = 0.2) -> Dict[str, Any]:
    """
    Erstellt ein prädiktives Modell basierend auf Random Forest.
    
    Args:
        data_path: Pfad zur CSV-Datei mit Daten
        target_column: Zielvariable
        feature_columns: Liste der Feature-Spalten
        model_type: 'regression' oder 'classification'
        test_size: Anteil der Testdaten
        
    Returns:
        Dict mit Modellbewertung und Feature-Wichtigkeiten
    """
    logger.info(f"Erstelle prädiktives Modell für {data_path}, Ziel: {target_column}")
    
    try:
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 10, "Daten werden geladen")
        
        # Daten laden
        df = pd.read_csv(data_path)
        
        # Prüfen, ob alle angegebenen Spalten existieren
        all_columns = feature_columns + [target_column]
        missing_columns = [col for col in all_columns if col not in df.columns]
        if missing_columns:
            raise ValueError(f"Spalten nicht gefunden: {', '.join(missing_columns)}")
        
        # Features und Target extrahieren
        X = df[feature_columns].copy()
        y = df[target_column].copy()
        
        # Fehlende Werte behandeln
        X = X.fillna(X.mean())
        
        # Daten aufteilen
        update_task_progress(self.request.id, 30, "Daten werden in Trainings- und Testsets aufgeteilt")
        X_train, X_test, y_train, y_test = train_test_split(
            X, y, test_size=test_size, random_state=42
        )
        
        # Modell trainieren
        update_task_progress(self.request.id, 50, f"Random Forest {model_type} wird trainiert")
        
        if model_type.lower() == "regression":
            model = RandomForestRegressor(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)
            
            # Vorhersagen und Bewertung
            y_pred = model.predict(X_test)
            mse = mean_squared_error(y_test, y_pred)
            rmse = np.sqrt(mse)
            
            # Ergebnisse zusammenstellen
            results = {
                "model_type": "regression",
                "mse": float(mse),
                "rmse": float(rmse),
                "feature_importance": dict(zip(feature_columns, model.feature_importances_.tolist()))
            }
            
        elif model_type.lower() == "classification":
            model = RandomForestClassifier(n_estimators=100, random_state=42)
            model.fit(X_train, y_train)
            
            # Vorhersagen und Bewertung
            y_pred = model.predict(X_test)
            accuracy = accuracy_score(y_test, y_pred)
            
            # Ergebnisse zusammenstellen
            results = {
                "model_type": "classification",
                "accuracy": float(accuracy),
                "feature_importance": dict(zip(feature_columns, model.feature_importances_.tolist()))
            }
            
        else:
            raise ValueError(f"Unbekannter Modelltyp: {model_type}")
        
        # Feature-Wichtigkeit sortieren
        sorted_importance = sorted(
            results["feature_importance"].items(), 
            key=lambda x: x[1], 
            reverse=True
        )
        results["sorted_importance"] = sorted_importance
        
        # Fortschritt aktualisieren
        update_task_progress(self.request.id, 100, "Prädiktives Modell erstellt")
        
        return results
        
    except Exception as e:
        logger.error(f"Fehler beim Erstellen des prädiktiven Modells: {str(e)}")
        raise 