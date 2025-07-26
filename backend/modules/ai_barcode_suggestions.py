"""
VALEO NeuroERP - KI-basierte Barcode-Vorschläge
Intelligente Barcode-Generierung und -Optimierung mit ML
"""
import logging
import json
import numpy as np
from typing import List, Dict, Any, Optional, Tuple
from dataclasses import dataclass
from datetime import datetime, timedelta
from decimal import Decimal
import uuid
from collections import defaultdict, Counter
import sqlite3
import pickle
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.cluster import KMeans
from sklearn.ensemble import RandomForestClassifier
from sklearn.model_selection import train_test_split
from sklearn.metrics import accuracy_score, classification_report
import joblib
import os

logger = logging.getLogger(__name__)

@dataclass
class BarcodeSuggestion:
    """Barcode-Vorschlag mit KI-Metadaten"""
    id: str
    product_name: str
    suggested_barcode: str
    confidence_score: float
    reasoning: str
    category: str
    similar_products: List[str]
    market_trends: Dict[str, Any]
    created_at: datetime

@dataclass
class BarcodePattern:
    """Barcode-Muster für ML-Analyse"""
    pattern: str
    frequency: int
    category: str
    success_rate: float
    avg_length: float
    common_prefixes: List[str]
    common_suffixes: List[str]

class AIBarcodeSuggestions:
    """
    KI-basierte Barcode-Vorschläge und Optimierung
    """
    
    def __init__(self, db_connection):
        self.db_connection = db_connection
        self.vectorizer = TfidfVectorizer(max_features=1000, stop_words='english')
        self.classifier = RandomForestClassifier(n_estimators=100, random_state=42)
        self.cluster_model = KMeans(n_clusters=10, random_state=42)
        self.model_path = "ai_models/barcode_suggestions/"
        self.patterns_cache = {}
        self.suggestions_history = []
        
        # Erstelle Model-Verzeichnis
        os.makedirs(self.model_path, exist_ok=True)
        
        # Initialisiere Modelle
        self._initialize_models()
    
    def _initialize_models(self):
        """Initialisiere ML-Modelle"""
        try:
            # Lade gespeicherte Modelle falls vorhanden
            if os.path.exists(f"{self.model_path}vectorizer.pkl"):
                self.vectorizer = joblib.load(f"{self.model_path}vectorizer.pkl")
                logger.info("Barcode Vectorizer geladen")
            
            if os.path.exists(f"{self.model_path}classifier.pkl"):
                self.classifier = joblib.load(f"{self.model_path}classifier.pkl")
                logger.info("Barcode Classifier geladen")
            
            if os.path.exists(f"{self.model_path}cluster_model.pkl"):
                self.cluster_model = joblib.load(f"{self.model_path}cluster_model.pkl")
                logger.info("Barcode Cluster Model geladen")
                
        except Exception as e:
            logger.warning(f"Fehler beim Laden der Modelle: {e}")
    
    def _save_models(self):
        """Speichere trainierte Modelle"""
        try:
            joblib.dump(self.vectorizer, f"{self.model_path}vectorizer.pkl")
            joblib.dump(self.classifier, f"{self.model_path}classifier.pkl")
            joblib.dump(self.cluster_model, f"{self.model_path}cluster_model.pkl")
            logger.info("Barcode ML-Modelle gespeichert")
        except Exception as e:
            logger.error(f"Fehler beim Speichern der Modelle: {e}")
    
    def _extract_barcode_patterns(self) -> List[BarcodePattern]:
        """Extrahiere Barcode-Muster aus bestehenden Daten"""
        patterns = []
        
        try:
            cursor = self.db_connection.cursor()
            
            # Hole alle bestehenden Barcodes
            cursor.execute("""
                SELECT barcode, product_name, category, created_at
                FROM barcodes 
                WHERE is_active = 1
                ORDER BY created_at DESC
            """)
            
            barcodes = cursor.fetchall()
            
            if not barcodes:
                return patterns
            
            # Analysiere Muster
            pattern_stats = defaultdict(lambda: {
                'count': 0,
                'categories': Counter(),
                'lengths': [],
                'prefixes': Counter(),
                'suffixes': Counter()
            })
            
            for barcode, product_name, category, created_at in barcodes:
                if not barcode or len(barcode) < 3:
                    continue
                
                # Extrahiere Muster (erste 3 und letzte 3 Zeichen)
                prefix = barcode[:3]
                suffix = barcode[-3:]
                length = len(barcode)
                
                pattern_key = f"{prefix}***{suffix}"
                
                pattern_stats[pattern_key]['count'] += 1
                pattern_stats[pattern_key]['categories'][category] += 1
                pattern_stats[pattern_key]['lengths'].append(length)
                pattern_stats[pattern_key]['prefixes'][prefix] += 1
                pattern_stats[pattern_key]['suffixes'][suffix] += 1
            
            # Erstelle BarcodePattern Objekte
            for pattern, stats in pattern_stats.items():
                if stats['count'] >= 2:  # Mindestens 2 Vorkommen
                    avg_length = np.mean(stats['lengths'])
                    most_common_category = stats['categories'].most_common(1)[0][0]
                    
                    # Berechne Erfolgsrate basierend auf Kategorie-Konsistenz
                    total = stats['count']
                    category_count = stats['categories'][most_common_category]
                    success_rate = category_count / total
                    
                    patterns.append(BarcodePattern(
                        pattern=pattern,
                        frequency=stats['count'],
                        category=most_common_category,
                        success_rate=success_rate,
                        avg_length=avg_length,
                        common_prefixes=[p for p, _ in stats['prefixes'].most_common(3)],
                        common_suffixes=[s for s, _ in stats['suffixes'].most_common(3)]
                    ))
            
            # Sortiere nach Häufigkeit
            patterns.sort(key=lambda x: x.frequency, reverse=True)
            
        except Exception as e:
            logger.error(f"Fehler beim Extrahieren von Barcode-Mustern: {e}")
        
        return patterns
    
    def _train_ml_models(self):
        """Trainiere ML-Modelle mit bestehenden Daten"""
        try:
            cursor = self.db_connection.cursor()
            
            # Hole Trainingsdaten
            cursor.execute("""
                SELECT product_name, barcode, category, 
                       CASE WHEN is_active = 1 THEN 1 ELSE 0 END as success
                FROM barcodes 
                WHERE product_name IS NOT NULL 
                AND barcode IS NOT NULL
                AND category IS NOT NULL
            """)
            
            data = cursor.fetchall()
            
            if len(data) < 10:
                logger.warning("Zu wenig Daten für ML-Training")
                return
            
            # Bereite Daten vor
            product_names = [row[0] for row in data]
            barcodes = [row[1] for row in data]
            categories = [row[2] for row in data]
            success_labels = [row[3] for row in data]
            
            # Trainiere TF-IDF Vectorizer
            self.vectorizer.fit(product_names)
            product_features = self.vectorizer.transform(product_names)
            
            # Trainiere Classifier für Kategorie-Vorhersage
            self.classifier.fit(product_features, categories)
            
            # Trainiere Cluster Model für Barcode-Muster
            barcode_lengths = [[len(bc)] for bc in barcodes]
            self.cluster_model.fit(barcode_lengths)
            
            # Speichere Modelle
            self._save_models()
            
            logger.info(f"ML-Modelle mit {len(data)} Datensätzen trainiert")
            
        except Exception as e:
            logger.error(f"Fehler beim Training der ML-Modelle: {e}")
    
    def suggest_barcode(self, product_name: str, category: str = None) -> List[BarcodeSuggestion]:
        """
        Generiere intelligente Barcode-Vorschläge für ein Produkt
        """
        suggestions = []
        
        try:
            # Trainiere Modelle falls nötig
            if not hasattr(self.classifier, 'classes_'):
                self._train_ml_models()
            
            # Extrahiere Muster
            patterns = self._extract_barcode_patterns()
            
            # Vorhersage Kategorie falls nicht angegeben
            if not category:
                product_features = self.vectorizer.transform([product_name])
                predicted_category = self.classifier.predict(product_features)[0]
                category = predicted_category
            
            # Generiere Vorschläge basierend auf Mustern
            for pattern in patterns[:5]:  # Top 5 Muster
                if pattern.category == category or pattern.success_rate > 0.7:
                    # Generiere Barcode basierend auf Muster
                    suggested_barcode = self._generate_barcode_from_pattern(
                        pattern, product_name, category
                    )
                    
                    if suggested_barcode:
                        # Berechne Confidence Score
                        confidence = self._calculate_confidence(
                            pattern, product_name, category
                        )
                        
                        # Finde ähnliche Produkte
                        similar_products = self._find_similar_products(
                            product_name, category
                        )
                        
                        # Markttrends
                        market_trends = self._get_market_trends(category)
                        
                        suggestion = BarcodeSuggestion(
                            id=str(uuid.uuid4()),
                            product_name=product_name,
                            suggested_barcode=suggested_barcode,
                            confidence_score=confidence,
                            reasoning=f"Basierend auf Muster {pattern.pattern} (Erfolgsrate: {pattern.success_rate:.2%})",
                            category=category,
                            similar_products=similar_products,
                            market_trends=market_trends,
                            created_at=datetime.now()
                        )
                        
                        suggestions.append(suggestion)
            
            # Sortiere nach Confidence Score
            suggestions.sort(key=lambda x: x.confidence_score, reverse=True)
            
            # Speichere Vorschlag in Historie
            if suggestions:
                self.suggestions_history.append({
                    'product_name': product_name,
                    'category': category,
                    'suggestions': [s.suggested_barcode for s in suggestions[:3]],
                    'timestamp': datetime.now().isoformat()
                })
            
        except Exception as e:
            logger.error(f"Fehler bei Barcode-Vorschlägen: {e}")
        
        return suggestions[:5]  # Maximal 5 Vorschläge
    
    def _generate_barcode_from_pattern(self, pattern: BarcodePattern, 
                                     product_name: str, category: str) -> str:
        """Generiere Barcode basierend auf Muster"""
        try:
            # Verwende häufigste Präfixe und Suffixe
            prefix = pattern.common_prefixes[0] if pattern.common_prefixes else "001"
            suffix = pattern.common_suffixes[0] if pattern.common_suffixes else "999"
            
            # Generiere mittleren Teil basierend auf Produktname
            product_hash = abs(hash(product_name)) % 10000
            middle_part = f"{product_hash:04d}"
            
            # Kombiniere zu Barcode
            barcode = f"{prefix}{middle_part}{suffix}"
            
            # Validiere Länge
            if len(barcode) < 8:
                barcode = barcode.ljust(8, '0')
            elif len(barcode) > 13:
                barcode = barcode[:13]
            
            return barcode
            
        except Exception as e:
            logger.error(f"Fehler bei Barcode-Generierung: {e}")
            return None
    
    def _calculate_confidence(self, pattern: BarcodePattern, 
                            product_name: str, category: str) -> float:
        """Berechne Confidence Score für Vorschlag"""
        try:
            confidence = 0.0
            
            # Basis-Confidence aus Muster-Erfolgsrate
            confidence += pattern.success_rate * 0.4
            
            # Kategorie-Match
            if pattern.category == category:
                confidence += 0.3
            elif pattern.success_rate > 0.8:
                confidence += 0.2
            
            # Produktname-Länge (längere Namen = bessere Beschreibung)
            name_length_factor = min(len(product_name) / 50.0, 1.0)
            confidence += name_length_factor * 0.1
            
            # Muster-Häufigkeit
            frequency_factor = min(pattern.frequency / 100.0, 1.0)
            confidence += frequency_factor * 0.2
            
            return min(confidence, 1.0)
            
        except Exception as e:
            logger.error(f"Fehler bei Confidence-Berechnung: {e}")
            return 0.5
    
    def _find_similar_products(self, product_name: str, category: str) -> List[str]:
        """Finde ähnliche Produkte"""
        try:
            cursor = self.db_connection.cursor()
            
            # Suche nach ähnlichen Produkten in derselben Kategorie
            cursor.execute("""
                SELECT product_name, barcode
                FROM barcodes 
                WHERE category = ? 
                AND is_active = 1
                AND product_name != ?
                ORDER BY created_at DESC
                LIMIT 5
            """, (category, product_name))
            
            similar = cursor.fetchall()
            return [f"{name} ({barcode})" for name, barcode in similar]
            
        except Exception as e:
            logger.error(f"Fehler beim Finden ähnlicher Produkte: {e}")
            return []
    
    def _get_market_trends(self, category: str) -> Dict[str, Any]:
        """Hole Markttrends für Kategorie"""
        try:
            cursor = self.db_connection.cursor()
            
            # Analysiere Barcode-Erstellung in den letzten 30 Tagen
            thirty_days_ago = datetime.now() - timedelta(days=30)
            
            cursor.execute("""
                SELECT COUNT(*) as total_new,
                       COUNT(CASE WHEN is_active = 1 THEN 1 END) as successful
                FROM barcodes 
                WHERE category = ? 
                AND created_at >= ?
            """, (category, thirty_days_ago))
            
            result = cursor.fetchone()
            
            if result and result[0] > 0:
                success_rate = result[1] / result[0]
                trend = "steigend" if success_rate > 0.7 else "stabil" if success_rate > 0.5 else "fallend"
            else:
                success_rate = 0.0
                trend = "unbekannt"
            
            return {
                'category': category,
                'new_barcodes_30d': result[0] if result else 0,
                'success_rate': success_rate,
                'trend': trend,
                'last_updated': datetime.now().isoformat()
            }
            
        except Exception as e:
            logger.error(f"Fehler beim Abrufen von Markttrends: {e}")
            return {
                'category': category,
                'new_barcodes_30d': 0,
                'success_rate': 0.0,
                'trend': 'unbekannt',
                'last_updated': datetime.now().isoformat()
            }
    
    def optimize_existing_barcodes(self) -> Dict[str, Any]:
        """Optimiere bestehende Barcodes mit KI"""
        try:
            cursor = self.db_connection.cursor()
            
            # Hole alle aktiven Barcodes
            cursor.execute("""
                SELECT id, product_name, barcode, category, created_at
                FROM barcodes 
                WHERE is_active = 1
            """)
            
            barcodes = cursor.fetchall()
            
            if not barcodes:
                return {'message': 'Keine Barcodes zur Optimierung gefunden'}
            
            optimization_results = {
                'total_barcodes': len(barcodes),
                'optimized': 0,
                'suggestions': [],
                'patterns_found': 0
            }
            
            # Analysiere Muster
            patterns = self._extract_barcode_patterns()
            optimization_results['patterns_found'] = len(patterns)
            
            # Prüfe jeden Barcode auf Optimierungspotential
            for barcode_id, product_name, barcode, category, created_at in barcodes:
                # Generiere neue Vorschläge
                suggestions = self.suggest_barcode(product_name, category)
                
                if suggestions:
                    best_suggestion = suggestions[0]
                    
                    # Prüfe ob Vorschlag besser ist als aktueller Barcode
                    if best_suggestion.confidence_score > 0.8:
                        optimization_results['suggestions'].append({
                            'barcode_id': barcode_id,
                            'product_name': product_name,
                            'current_barcode': barcode,
                            'suggested_barcode': best_suggestion.suggested_barcode,
                            'confidence': best_suggestion.confidence_score,
                            'reasoning': best_suggestion.reasoning
                        })
                        optimization_results['optimized'] += 1
            
            logger.info(f"Barcode-Optimierung abgeschlossen: {optimization_results['optimized']} Vorschläge")
            
            return optimization_results
            
        except Exception as e:
            logger.error(f"Fehler bei Barcode-Optimierung: {e}")
            return {'error': str(e)}
    
    def get_suggestion_statistics(self) -> Dict[str, Any]:
        """Hole Statistiken über Barcode-Vorschläge"""
        try:
            stats = {
                'total_suggestions': len(self.suggestions_history),
                'recent_suggestions': 0,
                'categories': Counter(),
                'confidence_distribution': {
                    'high': 0,
                    'medium': 0,
                    'low': 0
                }
            }
            
            # Analysiere Historie
            for entry in self.suggestions_history:
                # Kategorien zählen
                if 'category' in entry:
                    stats['categories'][entry['category']] += 1
                
                # Kürzliche Vorschläge (letzte 7 Tage)
                timestamp = datetime.fromisoformat(entry['timestamp'])
                if timestamp > datetime.now() - timedelta(days=7):
                    stats['recent_suggestions'] += 1
            
            return stats
            
        except Exception as e:
            logger.error(f"Fehler bei Statistiken: {e}")
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
            cursor = self.db_connection.cursor()
            
            # Hole Testdaten
            cursor.execute("""
                SELECT product_name, category
                FROM barcodes 
                WHERE product_name IS NOT NULL 
                AND category IS NOT NULL
                ORDER BY RANDOM()
                LIMIT 100
            """)
            
            test_data = cursor.fetchall()
            
            if len(test_data) < 10:
                return {'error': 'Zu wenig Testdaten'}
            
            # Teste Classifier
            product_names = [row[0] for row in test_data]
            true_categories = [row[1] for row in test_data]
            
            product_features = self.vectorizer.transform(product_names)
            predicted_categories = self.classifier.predict(product_features)
            
            accuracy = accuracy_score(true_categories, predicted_categories)
            
            return {
                'classifier_accuracy': accuracy,
                'test_samples': len(test_data),
                'categories_tested': len(set(true_categories))
            }
            
        except Exception as e:
            logger.error(f"Fehler beim Testen der Modelle: {e}")
            return {'error': str(e)} 