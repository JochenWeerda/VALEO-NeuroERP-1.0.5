# Backup und Recovery Guide für VALEO-NeuroERP

## Übersicht

Das VALEO-NeuroERP-System implementiert eine robuste Backup- und Recovery-Strategie, die sowohl die Memory Bank als auch die MongoDB-Datenbank abdeckt. Backups werden automatisch täglich durchgeführt und für 30 Tage aufbewahrt.

## Backup-Komponenten

### Automatische Backups

- **Zeitplan**: Täglich um 2:00 Uhr
- **Aufbewahrung**: 30 Tage
- **Speicherort**: Persistent Volume (50GB)

### Gesicherte Daten

1. **Memory Bank**
   - Komplettes Verzeichnis wird komprimiert
   - Enthält Agenten-Konfigurationen und Zustandsdaten
   - Format: `memory-bank-YYYYMMDD_HHMMSS.tar.gz`

2. **MongoDB**
   - Vollständiger Datenbank-Dump
   - Enthält Transaktionsdaten und Systemzustand
   - Format: `mongodb-YYYYMMDD_HHMMSS.gz`

## Wiederherstellung

### Voraussetzungen

- Kubectl installiert und konfiguriert
- MongoDB Database Tools installiert
- Zugriff auf das Kubernetes-Cluster
- Backup-Dateien verfügbar

### Wiederherstellungsprozess

1. **System vorbereiten**
   ```powershell
   # Beispiel für vollständige Wiederherstellung
   .\scripts\restore-from-backup.ps1 -BackupDate "20240301_020000" -RestoreMemoryBank -RestoreMongoDB
   ```

2. **Selektive Wiederherstellung**
   ```powershell
   # Nur Memory Bank wiederherstellen
   .\scripts\restore-from-backup.ps1 -BackupDate "20240301_020000" -RestoreMemoryBank
   
   # Nur MongoDB wiederherstellen
   .\scripts\restore-from-backup.ps1 -BackupDate "20240301_020000" -RestoreMongoDB
   ```

3. **Automatisierte Wiederherstellung**
   ```powershell
   # Ohne Bestätigung wiederherstellen
   .\scripts\restore-from-backup.ps1 -BackupDate "20240301_020000" -RestoreMemoryBank -RestoreMongoDB -SkipConfirmation
   ```

### Wiederherstellungsprozess im Detail

1. **Systemcheck**
   - Überprüfung der Voraussetzungen
   - Validierung der Backup-Dateien

2. **System-Shutdown**
   - Graceful Shutdown aller APM-Agenten
   - Warten auf Beendigung aller Prozesse

3. **Datenwiederherstellung**
   - Entpacken der Memory Bank (wenn ausgewählt)
   - Wiederherstellung der MongoDB (wenn ausgewählt)

4. **System-Neustart**
   - Starten der APM-Agenten
   - Überprüfung der Systemgesundheit

## Fehlerbehebung

### Häufige Probleme

1. **Backup nicht gefunden**
   - Überprüfen Sie das Backup-Verzeichnis
   - Stellen Sie sicher, dass das Datum korrekt formatiert ist

2. **Wiederherstellung fehlgeschlagen**
   - Prüfen Sie die Logs auf spezifische Fehlermeldungen
   - Stellen Sie sicher, dass genügend Speicherplatz verfügbar ist

3. **System startet nicht nach Wiederherstellung**
   - Überprüfen Sie die Pod-Logs
   - Validieren Sie die MongoDB-Verbindung

### Support

Bei Problemen oder Fragen wenden Sie sich an:
- System-Administrator
- DevOps-Team
- MongoDB-Support (für datenbankspezifische Probleme)

## Best Practices

1. **Vor der Wiederherstellung**
   - Erstellen Sie ein zusätzliches Backup des aktuellen Zustands
   - Informieren Sie alle Benutzer über die Wartungsarbeiten
   - Überprüfen Sie die Systemressourcen

2. **Während der Wiederherstellung**
   - Monitoren Sie den Prozess aktiv
   - Dokumentieren Sie alle Schritte und Probleme
   - Halten Sie das Support-Team in Bereitschaft

3. **Nach der Wiederherstellung**
   - Führen Sie grundlegende Systemtests durch
   - Überprüfen Sie die Datenintegrität
   - Dokumentieren Sie den Wiederherstellungsprozess 