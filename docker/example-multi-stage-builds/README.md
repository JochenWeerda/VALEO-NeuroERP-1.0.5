# Multi-Stage-Build Beispiele für das ERP-System

Diese Beispiele zeigen, wie Multi-Stage-Builds für unsere Docker-Images implementiert werden können, um kleinere, sicherere und effizientere Container zu erstellen.

## Warum Multi-Stage-Builds?

Multi-Stage-Builds bieten mehrere wichtige Vorteile:

1. **Reduzierte Image-Größe**: Durch die Trennung von Build- und Runtime-Umgebungen werden nur die tatsächlich benötigten Artefakte in das endgültige Image übernommen.

2. **Verbesserte Sicherheit**: Weniger Pakete und Abhängigkeiten bedeuten eine geringere Angriffsfläche.

3. **Optimierte Build-Zeiten**: Durch das Caching von Zwischenschichten können wiederholte Builds beschleunigt werden.

4. **Klarere Struktur**: Der Build-Prozess wird in logische Schritte unterteilt, was die Lesbarkeit und Wartbarkeit verbessert.

## Enthaltene Beispiele

### 1. API-Server (api-server-multi-stage.Dockerfile)

Dieses Beispiel zeigt:
- Trennung von Build- und Runtime-Abhängigkeiten
- Nutzung von Wheel-Paketen zur Optimierung der Installation
- Implementierung eines Benutzers mit niedrigen Rechten
- Optimierte Health-Checks

### 2. Celery-Worker (celery-worker-multi-stage.Dockerfile)

Dieses Beispiel demonstriert:
- Wiederverwendung des Build-Patterns für unterschiedliche Anwendungstypen
- Spezifische Konfiguration für Celery-Worker
- Optimierte Laufzeitumgebung

## Vergleich: Vor und Nach der Optimierung

| Image                | Vorher   | Nachher  | Reduktion |
|----------------------|----------|----------|-----------|
| API-Server           | ~1.2 GB  | ~350 MB  | ~70%      |
| Celery-Worker        | ~1.1 GB  | ~320 MB  | ~71%      |

## Best Practices für Multi-Stage-Builds

1. **Minimale Base-Images verwenden**: 
   - Alpine oder Slim-Varianten für kleinere Grundimages
   - Nur notwendige Abhängigkeiten installieren

2. **Schichtenoptimierung**:
   - Zusammenfassen von RUN-Befehlen
   - Aufräumen in derselben Schicht wie die Installation

3. **Caching optimieren**:
   - Stabile Teile zuerst kopieren (z.B. requirements.txt)
   - Häufig ändernde Dateien später kopieren

4. **Sicherheitsaspekte**:
   - Nicht als Root ausführen
   - Unnötige Pakete entfernen
   - Sicherheitsscans in die CI/CD-Pipeline integrieren

## Implementierung in der CI/CD-Pipeline

Um diese Multi-Stage-Builds in der CI/CD-Pipeline zu nutzen:

1. Ersetzen Sie die aktuellen Dockerfiles durch die optimierten Versionen
2. Passen Sie die Build-Skripte an, um die Build-Args korrekt zu setzen
3. Fügen Sie einen Größenvergleich-Schritt in die Pipeline ein
4. Implementieren Sie Sicherheitsscans für die resultierenden Images

## Nächste Schritte

- Anpassen der Images für weitere Komponenten (Redis, Flower, etc.)
- Experimentieren mit nicht-root Base-Images
- Evaluierung von Distroless-Containern für maximale Sicherheit
- Implementierung von Build-Zeit-ARGs für flexible Konfiguration 