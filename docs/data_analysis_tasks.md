# Datenanalyse-Tasks

Dieses Dokument beschreibt die Datenanalyse-Tasks im VALEO-NeuroERP-System, die für zeitintensive Datenanalysen und Machine-Learning-Operationen verwendet werden.

## Übersicht

Die Datenanalyse-Tasks bieten folgende Funktionen:

1. **Zeitreihenanalyse**: Analyse von zeitbasierten Daten mit ARIMA-Modellen
2. **Cluster-Analyse**: Segmentierung von Daten mit KMeans oder DBSCAN
3. **Anomalieerkennung**: Identifikation von Ausreißern in Datensätzen
4. **Prädiktive Modellierung**: Erstellung von Vorhersagemodellen

## Voraussetzungen

Für die Verwendung der Datenanalyse-Tasks werden folgende Python-Pakete benötigt:

```bash
pip install numpy pandas scikit-learn statsmodels matplotlib
```

## Tasks

### Zeitreihenanalyse

```python
from backend.tasks.data_analysis_tasks import analyze_time_series

task = analyze_time_series.delay(
    data_source="path/to/data.csv",  # Pfad zur Datei oder Django-Modellname
    target_column="sales",           # Zielspalte für die Analyse
    time_column="date",              # Zeitspalte
    params={
        "p": 1,                      # AR-Parameter
        "d": 1,                      # Differenzierungsgrad
        "q": 1,                      # MA-Parameter
        "forecast_steps": 10         # Anzahl der Vorhersageschritte
    }
)
```

#### Parameter

- `data_source`: Pfad zur Datendatei oder Name der Django-Modellklasse
- `target_column`: Name der Zielspalte für die Analyse
- `time_column`: Name der Zeitspalte
- `params`: Zusätzliche Parameter für die Analyse
  - `p`: AR-Parameter (Autoregression)
  - `d`: Differenzierungsgrad
  - `q`: MA-Parameter (Moving Average)
  - `forecast_steps`: Anzahl der Vorhersageschritte

#### Rückgabewerte

```python
{
    "status": "success",
    "result": {
        "model_summary": "HTML-Tabelle mit Modellzusammenfassung",
        "forecast": [100.2, 102.5, 98.7, ...],  # Vorhersagewerte
        "aic": 123.45,  # Akaike Information Criterion
        "bic": 145.67   # Bayesian Information Criterion
    },
    "model_path": "/path/to/saved/model.pkl"  # Pfad zum gespeicherten Modell
}
```

### Cluster-Analyse

```python
from backend.tasks.data_analysis_tasks import cluster_analysis

task = cluster_analysis.delay(
    data_source="path/to/data.csv",  # Pfad zur Datei oder Django-Modellname
    feature_columns=["age", "income", "spending_score"],  # Zu verwendende Features
    algorithm="kmeans",              # Clustering-Algorithmus
    params={
        "n_clusters": 5              # Anzahl der Cluster (für KMeans)
    }
)
```

#### Parameter

- `data_source`: Pfad zur Datendatei oder Name der Django-Modellklasse
- `feature_columns`: Liste der zu verwendenden Feature-Spalten
- `algorithm`: Clustering-Algorithmus ('kmeans' oder 'dbscan')
- `params`: Zusätzliche Parameter für den Clustering-Algorithmus
  - Für KMeans:
    - `n_clusters`: Anzahl der Cluster
  - Für DBSCAN:
    - `eps`: Maximale Distanz zwischen Punkten
    - `min_samples`: Minimale Anzahl von Punkten in einer Nachbarschaft

#### Rückgabewerte

```python
{
    "status": "success",
    "result": {
        "algorithm": "kmeans",
        "n_clusters": 5,
        "inertia": 1234.56,  # Summe der quadrierten Abstände (nur KMeans)
        "cluster_centers": [[...], [...], ...],  # Cluster-Zentren
        "cluster_stats": [
            {
                "cluster_id": 0,
                "size": 120,
                "percentage": 24.0,
                "features": {
                    "age": {"mean": 35.2, "std": 5.1, "min": 25, "max": 45},
                    # Weitere Feature-Statistiken
                }
            },
            # Weitere Cluster-Statistiken
        ],
        "labels": [0, 2, 1, ...]  # Cluster-Labels für jeden Datenpunkt
    },
    "model_path": "/path/to/saved/model.pkl"  # Pfad zum gespeicherten Modell
}
```

### Anomalieerkennung

```python
from backend.tasks.data_analysis_tasks import anomaly_detection

task = anomaly_detection.delay(
    data_source="path/to/data.csv",  # Pfad zur Datei oder Django-Modellname
    feature_columns=["amount", "frequency", "recency"],  # Zu verwendende Features
    method="isolation_forest",       # Methode für die Anomalieerkennung
    params={
        "contamination": 0.05        # Erwarteter Anteil an Anomalien
    }
)
```

#### Parameter

- `data_source`: Pfad zur Datendatei oder Name der Django-Modellklasse
- `feature_columns`: Liste der zu verwendenden Feature-Spalten
- `method`: Methode für die Anomalieerkennung ('isolation_forest' oder 'statistical')
- `params`: Zusätzliche Parameter für die Anomalieerkennung
  - Für Isolation Forest:
    - `contamination`: Erwarteter Anteil an Anomalien (0.0 bis 0.5)
  - Für statistische Methode:
    - `threshold`: Anzahl der Standardabweichungen für Anomalieerkennung

#### Rückgabewerte

```python
{
    "status": "success",
    "result": {
        "method": "isolation_forest",
        "total_records": 1000,
        "anomaly_count": 47,
        "anomaly_percentage": 4.7,
        "top_anomalies": {
            "indices": [42, 156, 789, ...],  # Indizes der Top-Anomalien
            "scores": [0.92, 0.87, 0.85, ...]  # Anomalie-Scores
        },
        "feature_importance": {
            "amount": 1.0,
            "frequency": 0.75,
            "recency": 0.32
        }
    },
    "model_path": "/path/to/saved/model.pkl"  # Pfad zum gespeicherten Modell
}
```

### Prädiktive Modellierung

```python
from backend.tasks.data_analysis_tasks import predictive_modeling

task = predictive_modeling.delay(
    data_source="path/to/data.csv",  # Pfad zur Datei oder Django-Modellname
    target_column="churn",           # Zielspalte für die Vorhersage
    feature_columns=["tenure", "monthly_charges", "total_charges"],  # Features
    model_type="random_forest",      # Art des zu erstellenden Modells
    params={
        "n_estimators": 100,         # Anzahl der Bäume im Random Forest
        "test_size": 0.2             # Anteil der Testdaten
    }
)
```

#### Parameter

- `data_source`: Pfad zur Datendatei oder Name der Django-Modellklasse
- `target_column`: Name der Zielspalte für die Vorhersage
- `feature_columns`: Liste der zu verwendenden Feature-Spalten
- `model_type`: Art des zu erstellenden Modells ('random_forest', etc.)
- `params`: Zusätzliche Parameter für das Modell
  - `test_size`: Anteil der Testdaten (0.0 bis 1.0)
  - `random_state`: Seed für die Zufallszahlengenerierung
  - `n_estimators`: Anzahl der Bäume im Random Forest

#### Rückgabewerte

```python
{
    "status": "success",
    "result": {
        "model_type": "random_forest",
        "train_score": 0.95,  # Genauigkeit auf Trainingsdaten
        "test_score": 0.87,   # Genauigkeit auf Testdaten
        "feature_importance": {
            "tenure": 0.45,
            "monthly_charges": 0.35,
            "total_charges": 0.20
        },
        "confusion_matrix": [[120, 15], [10, 55]],  # Konfusionsmatrix
        "classification_report": {
            "precision": 0.88,
            "recall": 0.85,
            "f1-score": 0.86,
            # Weitere Metriken
        }
    },
    "model_path": "/path/to/saved/model.pkl"  # Pfad zum gespeicherten Modell
}
```

## Hilfsfunktionen

### _load_data

Diese interne Funktion lädt Daten aus verschiedenen Quellen:

- CSV-Dateien
- Excel-Dateien
- JSON-Dateien
- Parquet-Dateien
- Django-Modelle

## Beispiele

### Zeitreihenanalyse von Verkaufsdaten

```python
from backend.tasks.data_analysis_tasks import analyze_time_series

# Verkaufsdaten analysieren
task = analyze_time_series.delay(
    data_source="data/sales_history.csv",
    target_column="revenue",
    time_column="date",
    params={
        "p": 2,
        "d": 1,
        "q": 2,
        "forecast_steps": 30  # 30 Tage Prognose
    }
)

# Task-ID für spätere Statusabfrage
task_id = task.id
```

### Kundensegmentierung mit Cluster-Analyse

```python
from backend.tasks.data_analysis_tasks import cluster_analysis

# Kunden segmentieren
task = cluster_analysis.delay(
    data_source="backend.Customer",  # Django-Modell verwenden
    feature_columns=["age", "income", "purchase_frequency", "loyalty_score"],
    algorithm="kmeans",
    params={
        "n_clusters": 5  # 5 Kundensegmente
    }
)
```

### Betrugserkennung mit Anomalieerkennung

```python
from backend.tasks.data_analysis_tasks import anomaly_detection

# Verdächtige Transaktionen identifizieren
task = anomaly_detection.delay(
    data_source="data/transactions.csv",
    feature_columns=["amount", "time_of_day", "location_score", "frequency"],
    method="isolation_forest",
    params={
        "contamination": 0.01  # 1% der Transaktionen sind verdächtig
    }
)
```

### Vorhersage von Kundenabwanderung

```python
from backend.tasks.data_analysis_tasks import predictive_modeling

# Churn-Vorhersagemodell erstellen
task = predictive_modeling.delay(
    data_source="data/customer_data.csv",
    target_column="churned",
    feature_columns=[
        "tenure", "monthly_charges", "total_charges", 
        "contract_type", "payment_method", "tech_support",
        "online_security", "internet_service"
    ],
    model_type="random_forest",
    params={
        "n_estimators": 200,
        "test_size": 0.25
    }
)
```

## Fortschrittsanzeige

Alle Tasks aktualisieren regelmäßig ihren Fortschritt, der über die `AsyncTask`-Tabelle in der Datenbank verfolgt werden kann:

```python
from backend.models.async_task import AsyncTask

# Task-Status abfragen
task = AsyncTask.objects.get(task_id=task_id)
progress = task.result.get('progress', 0)
message = task.result.get('message', '')

print(f"Fortschritt: {progress}% - {message}")
```

## Fehlerbehandlung

Alle Tasks verwenden exponentielles Backoff für Wiederholungsversuche bei Fehlern:

```python
try:
    # Task-Logik
except Exception as e:
    return retry_task_with_exponential_backoff(self, exc=e)
```

Die maximale Anzahl von Wiederholungsversuchen ist standardmäßig auf 3 festgelegt und kann bei der Task-Definition angepasst werden. 