import os
import json
import numpy as np
import pandas as pd
from datetime import datetime, timedelta
from typing import List, Dict, Any, Optional, Tuple
import logging
from pathlib import Path
import pickle
from sklearn.ensemble import IsolationForest
from sklearn.preprocessing import StandardScaler
import joblib

# Logger einrichten
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger("anomaly_detection_service")

# Konstanten
MODEL_DIR = Path("backend/data/models/anomaly")
MODEL_DIR.mkdir(parents=True, exist_ok=True)
HISTORY_DIR = Path("backend/data/anomaly_history")
HISTORY_DIR.mkdir(parents=True, exist_ok=True)

class AnomalyDetectionService:
    """
    Service für die KI-basierte Anomalieerkennung in verschiedenen Unternehmensbereichen
    wie Lagerbestand, Finanztransaktionen und Produktionschargen.
    """
    
    def __init__(self):
        self.models = {}
        self.scalers = {}
        self.load_models()
    
    def load_models(self):
        """Lädt alle vorhandenen Modelle aus dem Modellverzeichnis"""
        for file in MODEL_DIR.glob("*.pkl"):
            model_name = file.stem
            if model_name.endswith("_model"):
                domain = model_name.replace("_model", "")
                try:
                    self.models[domain] = joblib.load(file)
                    scaler_file = MODEL_DIR / f"{domain}_scaler.pkl"
                    if scaler_file.exists():
                        self.scalers[domain] = joblib.load(scaler_file)
                    logger.info(f"Modell für Domain '{domain}' geladen")
                except Exception as e:
                    logger.error(f"Fehler beim Laden des Modells {model_name}: {e}")
    
    def save_model(self, domain: str, model, scaler=None):
        """Speichert ein trainiertes Modell und zugehörigen Scaler"""
        try:
            model_path = MODEL_DIR / f"{domain}_model.pkl"
            joblib.dump(model, model_path)
            
            if scaler is not None:
                scaler_path = MODEL_DIR / f"{domain}_scaler.pkl"
                joblib.dump(scaler, scaler_path)
            
            self.models[domain] = model
            if scaler is not None:
                self.scalers[domain] = scaler
                
            logger.info(f"Modell für Domain '{domain}' gespeichert")
        except Exception as e:
            logger.error(f"Fehler beim Speichern des Modells für Domain '{domain}': {e}")
    
    def train_isolation_forest(self, domain: str, data: pd.DataFrame, 
                              contamination: float = 0.05, random_state: int = 42):
        """
        Trainiert ein Isolation Forest Modell für die Anomalieerkennung
        
        Args:
            domain: Bereich für den das Modell trainiert wird (z.B. 'inventory', 'finance')
            data: DataFrame mit Trainingsdaten
            contamination: Erwarteter Anteil von Anomalien in den Daten
            random_state: Seed für Reproduzierbarkeit
        """
        try:
            # Numerische Spalten finden und Daten vorbereiten
            numeric_cols = data.select_dtypes(include=['int64', 'float64']).columns.tolist()
            if not numeric_cols:
                raise ValueError("Keine numerischen Spalten in den Daten gefunden")
            
            X = data[numeric_cols]
            
            # Daten skalieren
            scaler = StandardScaler()
            X_scaled = scaler.fit_transform(X)
            
            # Isolation Forest trainieren
            model = IsolationForest(
                contamination=contamination,
                random_state=random_state,
                n_estimators=100
            )
            model.fit(X_scaled)
            
            # Modell speichern
            self.save_model(domain, model, scaler)
            
            # Trainingsgenauigkeit berechnen
            predictions = model.predict(X_scaled)
            anomaly_count = sum(predictions == -1)
            
            logger.info(f"Modell für '{domain}' trainiert. "
                       f"{anomaly_count} Anomalien in Trainingsdaten gefunden "
                       f"({anomaly_count/len(data)*100:.2f}%).")
            
            return True, f"Modell für '{domain}' erfolgreich trainiert"
        except Exception as e:
            logger.error(f"Fehler beim Training des Modells für '{domain}': {e}")
            return False, str(e)
    
    def detect_anomalies(self, domain: str, data: pd.DataFrame) -> Tuple[List[int], pd.DataFrame]:
        """
        Erkennt Anomalien in den gegebenen Daten mit dem trainierten Modell
        
        Args:
            domain: Domain für die Anomalien erkannt werden sollen
            data: DataFrame mit zu prüfenden Daten
            
        Returns:
            Tuple aus:
            - Liste der Indizes mit anomalen Datensätzen
            - DataFrame mit Anomalie-Scores
        """
        if domain not in self.models:
            raise ValueError(f"Kein Modell für Domain '{domain}' gefunden. "
                            f"Bitte zuerst ein Modell trainieren.")
        
        if domain not in self.scalers:
            raise ValueError(f"Kein Scaler für Domain '{domain}' gefunden.")
        
        model = self.models[domain]
        scaler = self.scalers[domain]
        
        # Numerische Spalten auswählen
        numeric_cols = data.select_dtypes(include=['int64', 'float64']).columns.tolist()
        X = data[numeric_cols]
        
        # Daten skalieren
        X_scaled = scaler.transform(X)
        
        # Anomalien erkennen
        predictions = model.predict(X_scaled)
        scores = model.decision_function(X_scaled)
        
        # Anomalien identifizieren
        anomaly_indices = [i for i, pred in enumerate(predictions) if pred == -1]
        
        # Ergebnisse mit Scores zurückgeben
        result_df = data.copy()
        result_df['anomaly_score'] = scores
        result_df['is_anomaly'] = predictions == -1
        
        # Anomalien protokollieren
        self._log_anomalies(domain, data, anomaly_indices, scores)
        
        return anomaly_indices, result_df
    
    def _log_anomalies(self, domain: str, data: pd.DataFrame, 
                      anomaly_indices: List[int], scores: np.ndarray):
        """Protokolliert erkannte Anomalien für spätere Analyse"""
        if not anomaly_indices:
            return
        
        timestamp = datetime.now().strftime("%Y%m%d_%H%M%S")
        anomaly_file = HISTORY_DIR / f"{domain}_anomalies_{timestamp}.json"
        
        anomaly_records = []
        for idx in anomaly_indices:
            record = data.iloc[idx].to_dict()
            record['anomaly_score'] = float(scores[idx])
            record['detected_at'] = datetime.now().isoformat()
            anomaly_records.append(record)
        
        with open(anomaly_file, 'w', encoding='utf-8') as f:
            json.dump(anomaly_records, f, indent=2, default=str)
        
        logger.info(f"{len(anomaly_indices)} Anomalien für Domain '{domain}' "
                   f"erkannt und in {anomaly_file} protokolliert")
    
    def get_anomaly_history(self, domain: str, days: int = 7) -> List[Dict]:
        """Gibt die Anomaliehistorie für eine Domain zurück"""
        cutoff_date = datetime.now() - timedelta(days=days)
        anomaly_files = [f for f in HISTORY_DIR.glob(f"{domain}_anomalies_*.json")]
        
        all_anomalies = []
        for file in anomaly_files:
            try:
                file_date = datetime.strptime(file.stem.split('_')[-2] + '_' + 
                                              file.stem.split('_')[-1], 
                                              "%Y%m%d_%H%M%S")
                if file_date >= cutoff_date:
                    with open(file, 'r', encoding='utf-8') as f:
                        anomalies = json.load(f)
                        all_anomalies.extend(anomalies)
            except Exception as e:
                logger.error(f"Fehler beim Lesen der Anomalie-Datei {file}: {e}")
        
        return all_anomalies
    
    # Spezifische Methoden für verschiedene Unternehmensbereiche
    
    def detect_inventory_anomalies(self, inventory_data: pd.DataFrame) -> pd.DataFrame:
        """
        Erkennt Anomalien in Lagerbestandsdaten
        
        Typische Anomalien:
        - Ungewöhnlich hohe oder niedrige Lagerbestände
        - Plötzliche Bestandsveränderungen
        - Ungewöhnliche Bestellmuster
        """
        _, result_df = self.detect_anomalies('inventory', inventory_data)
        return result_df
    
    def detect_financial_anomalies(self, transaction_data: pd.DataFrame) -> pd.DataFrame:
        """
        Erkennt Anomalien in Finanztransaktionen
        
        Typische Anomalien:
        - Ungewöhnlich hohe Transaktionen
        - Unregelmäßige Zahlungsmuster
        - Abweichungen vom typischen Kundenverhalten
        """
        _, result_df = self.detect_anomalies('finance', transaction_data)
        return result_df
    
    def detect_production_anomalies(self, production_data: pd.DataFrame) -> pd.DataFrame:
        """
        Erkennt Anomalien in Produktionsdaten
        
        Typische Anomalien:
        - Ungewöhnliche Produktionszeiten
        - Abweichungen in Qualitätsparametern
        - Ineffiziente Ressourcennutzung
        """
        _, result_df = self.detect_anomalies('production', production_data)
        return result_df
    
    def detect_supply_chain_anomalies(self, supply_data: pd.DataFrame) -> pd.DataFrame:
        """
        Erkennt Anomalien in Lieferkettenaktivitäten
        
        Typische Anomalien:
        - Ungewöhnliche Lieferzeiten
        - Preisausreißer bei Rohstoffen
        - Abweichungen vom normalen Lieferantenverhalten
        """
        _, result_df = self.detect_anomalies('supply_chain', supply_data)
        return result_df

# Globale Instanz des Services erstellen
anomaly_detection_service = AnomalyDetectionService() 